import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

const allowed: Record<string, string[]> = {
  INITIATED: ["PENDING", "CONFIRMED", "FAILED"],
  PENDING: ["CONFIRMED", "FAILED", "REVERSED"],
  CONFIRMED: ["REVERSED", "REFUNDED"],
  FAILED: [],
  REVERSED: [],
  REFUNDED: [],
};

const reconciliationStates = ["UNMATCHED", "MATCHED", "RECONCILED", "EXCEPTION"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authorizePermission("leads.edit");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const nextStatus = body.status ? String(body.status).toUpperCase() : null;
    const nextReconciliation = body.reconciliationStatus ? String(body.reconciliationStatus).toUpperCase() : null;

    if (nextReconciliation && !reconciliationStates.includes(nextReconciliation)) {
      return NextResponse.json({ error: "Invalid reconciliation status" }, { status: 400 });
    }
    if (nextStatus && (!Object.prototype.hasOwnProperty.call(allowed, payment.status) || !allowed[payment.status].includes(nextStatus))) {
      return NextResponse.json({ error: `Cannot move payment from ${payment.status} to ${nextStatus}` }, { status: 409 });
    }
    if (nextReconciliation === "RECONCILED" && (nextStatus && nextStatus !== "CONFIRMED" ? nextStatus : payment.status) !== "CONFIRMED") {
      return NextResponse.json({ error: "Only a confirmed payment can be reconciled into revenue." }, { status: 409 });
    }
    if (nextReconciliation === "RECONCILED" && !String(body.reconciliationEvidenceRef ?? "").trim()) {
      return NextResponse.json({ error: "Reconciliation evidence reference is required before marking a payment reconciled." }, { status: 400 });
    }
    if (nextReconciliation === "EXCEPTION" && !String(body.reconciliationNotes ?? "").trim()) {
      return NextResponse.json({ error: "An exception reason is required." }, { status: 400 });
    }
    if (nextReconciliation === "RECONCILED" && payment.reconciliationStatus === "RECONCILED") {
      return NextResponse.json({ error: "Payment is already reconciled." }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};
      if (nextStatus) {
        data.status = nextStatus;
        if (nextStatus === "CONFIRMED") data.confirmedAt = new Date();
        if (nextStatus === "FAILED" && body.failureReason) data.failureReason = String(body.failureReason);
        if (nextStatus === "REVERSED" && body.reversalReason) data.reversalReason = String(body.reversalReason);
        if (nextStatus === "REFUNDED" && body.refundReason) data.refundReason = String(body.refundReason);
      }
      if (nextReconciliation) {
        data.reconciliationStatus = nextReconciliation;
        const evidence = String(body.reconciliationEvidenceRef ?? "").trim();
        const notes = String(body.reconciliationNotes ?? "").trim();
        if (evidence) data.reconciliationEvidenceRef = evidence.slice(0, 1000);
        if (notes) data.reconciliationNotes = notes.slice(0, 5000);
        if (nextReconciliation === "RECONCILED") {
          data.reconciledAt = new Date();
          data.reconciledBy = user.email;
        }
      }

      const result = await tx.payment.update({ where: { id }, data });

      if (nextStatus === "CONFIRMED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "CONFIRMED" } });
      } else if (nextStatus === "FAILED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "FAILED" } });
      } else if (nextStatus === "REVERSED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REVERSED" } });
      } else if (nextStatus === "REFUNDED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REFUNDED" } });
      }

      if (nextReconciliation === "RECONCILED") {
        const revenue = await tx.revenue.upsert({
          where: { paymentId: payment.id },
          create: {
            id: randomUUID(),
            orderId: payment.orderId,
            paymentId: payment.id,
            customerId: payment.customerId || payment.order.customerId || undefined,
            partnerId: payment.order.partnerId || undefined,
            referralLinkId: payment.order.referralLinkId || undefined,
            collectedAmount: payment.amount,
            recognizedAmount: payment.amount,
            commissionableAmount: payment.amount,
            currency: payment.currency,
            status: "RECOGNIZED",
            recognizedAt: new Date(),
          },
          update: {
            collectedAmount: payment.amount,
            recognizedAmount: payment.amount,
            commissionableAmount: payment.amount,
            status: "RECOGNIZED",
            recognizedAt: new Date(),
          },
        });

        if (payment.order.partnerId) {
          const referralLink = payment.order.referralLinkId
            ? await tx.referralLink.findUnique({ where: { id: payment.order.referralLinkId }, select: { campaignId: true } })
            : null;
          const campaign = referralLink?.campaignId
            ? await tx.partnerCampaign.findUnique({
                where: { id: referralLink.campaignId },
                select: { rewardType: true, rewardAmount: true, rewardRate: true },
              })
            : null;

          if (campaign && ["FIXED", "PERCENT_SALE", "HYBRID"].includes(campaign.rewardType)) {
            const collected = Number(payment.amount);
            const fixed = Number(campaign.rewardAmount || 0);
            const rate = Number(campaign.rewardRate || 0);
            const commissionAmount =
              campaign.rewardType === "FIXED" ? fixed :
              campaign.rewardType === "PERCENT_SALE" ? collected * rate / 100 :
              fixed + collected * rate / 100;

            if (commissionAmount > 0) {
              await tx.commission.upsert({
                where: { revenueId: revenue.id },
                create: {
                  id: randomUUID(),
                  partnerId: payment.order.partnerId,
                  referralLinkId: payment.order.referralLinkId || undefined,
                  orderId: payment.orderId,
                  paymentId: payment.id,
                  revenueId: revenue.id,
                  amount: commissionAmount,
                  currency: payment.currency,
                  status: "QUALIFIED",
                },
                update: {
                  amount: commissionAmount,
                  status: "QUALIFIED",
                  paymentId: payment.id,
                  orderId: payment.orderId,
                  partnerId: payment.order.partnerId,
                },
              });
            }
          }
        }
      }

      if (nextStatus === "REVERSED" || nextStatus === "REFUNDED") {
        const revenue = await tx.revenue.findUnique({ where: { paymentId: payment.id } });
        if (revenue) {
          await tx.revenue.update({ where: { id: revenue.id }, data: { status: "REVERSED", recognizedAmount: 0, commissionableAmount: 0 } });
          await tx.commission.updateMany({ where: { revenueId: revenue.id }, data: { status: "VOID", amount: 0 } });
        }
      }

      if (nextReconciliation) {
        await tx.activity.create({
          data: {
            type: "PAYMENT_RECONCILIATION",
            subject: `Payment ${payment.id} marked ${nextReconciliation}`,
            details: {
              paymentId: payment.id,
              orderId: payment.orderId,
              reconciliationStatus: nextReconciliation,
              evidenceReference: String(body.reconciliationEvidenceRef ?? "").trim() || null,
              notes: String(body.reconciliationNotes ?? "").trim() || null,
              actor: user.email,
            },
            customerId: payment.order.customerId || undefined,
            opportunityId: payment.order.opportunityId || undefined,
          },
        });
      }

      return result;
    });

    return NextResponse.json({ payment: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
