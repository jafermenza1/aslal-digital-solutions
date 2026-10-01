import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { requireSameWorkspace } from "@/lib/workspace-boundary";

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
  const access = await authorizeWorkspacePermission("commerce.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, workspace } = access;

  try {
    const { id } = await params;
    const body = await request.json();
    const payment = await prisma.payment.findUnique({
      where: { id, workspaceId: workspace.id },
      include: { order: true },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    requireSameWorkspace(workspace.id, payment.workspaceId, payment.order.workspaceId);

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

      const result = await tx.payment.update({ where: { id, workspaceId: workspace.id }, data });

      if (nextStatus === "CONFIRMED") {
        await tx.order.update({ where: { id: payment.orderId, workspaceId: workspace.id }, data: { paymentState: "CONFIRMED" } });
      } else if (nextStatus === "FAILED") {
        await tx.order.update({ where: { id: payment.orderId, workspaceId: workspace.id }, data: { paymentState: "FAILED" } });
      } else if (nextStatus === "REVERSED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REVERSED" } });
      } else if (nextStatus === "REFUNDED") {
        await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REFUNDED" } });
      }

      if (nextReconciliation === "RECONCILED") {
        const existingRevenue = await tx.revenue.findFirst({
          where: { paymentId: payment.id, workspaceId: workspace.id },
        });
        const revenue = existingRevenue
          ? await tx.revenue.update({
              where: { id: existingRevenue.id },
              data: {
                workspaceId: workspace.id,
                orderId: payment.orderId,
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
            })
          : await tx.revenue.create({
              data: {
                id: randomUUID(),
                workspaceId: workspace.id,
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
            });

        if (payment.order.partnerId) {
          const agentDeal = payment.order.agentDealRegistrationId
            ? await tx.agentDealRegistration.findFirst({
                where: {
                  id: payment.order.agentDealRegistrationId,
                  workspaceId: workspace.id,
                  partnerId: payment.order.partnerId,
                  status: "ACCEPTED",
                },
                include: { workEvidence: { where: { verificationStatus: "VERIFIED" }, select: { id: true } } },
              })
            : null;
          if (payment.order.agentDealRegistrationId && (!agentDeal || agentDeal.workEvidence.length === 0)) {
            throw new Error("Agent commission is blocked: the registered deal is not accepted with verified work evidence.");
          }
          const referralLink = payment.order.referralLinkId
            ? await tx.referralLink.findFirst({
                where: { id: payment.order.referralLinkId, workspaceId: workspace.id, partnerId: payment.order.partnerId },
                select: { id: true, campaignId: true, workspaceId: true, partner: { select: { workspaceId: true } } },
              })
            : null;
          if (payment.order.referralLinkId && !referralLink) {
            throw new Error("Payment order referral link is outside the active workspace or partner attribution.");
          }
          if (referralLink) requireSameWorkspace(workspace.id, referralLink.workspaceId, referralLink.partner.workspaceId);
          const campaignId = referralLink?.campaignId || agentDeal?.campaignId || null;
          const campaign = campaignId
            ? await tx.partnerCampaign.findFirst({
                where: { id: campaignId, workspaceId: workspace.id },
                select: { rewardType: true, rewardAmount: true, rewardRate: true, workspaceId: true, programId: true },
              })
            : null;
          if (campaignId && !campaign) {
            throw new Error("Payment referral campaign is outside the active workspace.");
          }
          if (campaign) requireSameWorkspace(workspace.id, campaign.workspaceId);

          const terms = campaign?.programId
            ? await tx.programTerms.findFirst({
                where: { programId: campaign.programId, active: true },
                orderBy: { version: "desc" },
                select: {
                  id: true, version: true, attributionPolicy: true, attributionWindowDays: true,
                  refundHoldDays: true, qualifyingEvent: true, payoutSchedule: true, minimumPayout: true,
                },
              })
            : null;
          const contract = campaign?.programId
            ? await tx.commissionContract.findFirst({
                where: { programId: campaign.programId, partnerId: payment.order.partnerId, status: "ACTIVE", workspaceId: workspace.id },
                select: { id: true, termsSnapshot: true },
              })
            : null;

          if (campaign?.programId && (!terms || !contract)) {
            throw new Error("Partner program terms/contract are not active for this sale.");
          }

          if (campaign && ["FIXED", "PER_LEAD", "PERCENT_SALE", "HYBRID"].includes(campaign.rewardType)) {
            const collected = Number(payment.amount);
            const fixed = Number(campaign.rewardAmount || 0);
            const rate = Number(campaign.rewardRate || 0);
            const commissionAmount =
              campaign.rewardType === "FIXED" || campaign.rewardType === "PER_LEAD" ? fixed :
              campaign.rewardType === "PERCENT_SALE" ? collected * rate / 100 :
              fixed + collected * rate / 100;

            if (commissionAmount > 0) {
              await tx.commission.upsert({
                where: { revenueId: revenue.id },
                create: {
                  id: randomUUID(),
                  workspaceId: workspace.id,
                  partnerId: payment.order.partnerId,
                  referralLinkId: payment.order.referralLinkId || undefined,
                  orderId: payment.orderId,
                  paymentId: payment.id,
                  revenueId: revenue.id,
                  amount: commissionAmount,
                  currentBalance: commissionAmount,
                  currency: payment.currency,
                  status: "QUALIFIED",
                  contractId: contract?.id || undefined,
                  termsId: terms?.id || undefined,
                  contractSnapshot: contract?.termsSnapshot || undefined,
                  qualifyingEvent: terms?.qualifyingEvent || "Reconciled payment",
                  attributionPolicy: terms?.attributionPolicy || undefined,
                  attributionWindowDays: terms?.attributionWindowDays ?? undefined,
                  refundHoldDays: terms?.refundHoldDays ?? undefined,
                  rewardType: campaign.rewardType,
                  rewardAmount: campaign.rewardAmount || undefined,
                  rewardRate: campaign.rewardRate || undefined,
                  commissionableBasis: payment.amount,
                  leadId: payment.order.opportunityId
                    ? (await tx.opportunity.findUnique({ where: { id: payment.order.opportunityId }, select: { leadId: true } }))?.leadId
                    : undefined,
                  eligibleAt: new Date((payment.confirmedAt || new Date()).getTime() + Number(terms?.refundHoldDays || 0) * 86400000),
                },
                update: {
                  amount: commissionAmount,
                  status: "QUALIFIED",
                  paymentId: payment.id,
                  orderId: payment.orderId,
                  partnerId: payment.order.partnerId,
                  eligibleAt: new Date((payment.confirmedAt || new Date()).getTime() + Number(terms?.refundHoldDays || 0) * 86400000),
                  contractId: contract?.id || undefined,
                  termsId: terms?.id || undefined,
                  contractSnapshot: contract?.termsSnapshot || undefined,
                  qualifyingEvent: terms?.qualifyingEvent || "Reconciled payment",
                  attributionPolicy: terms?.attributionPolicy || undefined,
                  attributionWindowDays: terms?.attributionWindowDays ?? undefined,
                  refundHoldDays: terms?.refundHoldDays ?? undefined,
                  rewardType: campaign.rewardType,
                  rewardAmount: campaign.rewardAmount || undefined,
                  rewardRate: campaign.rewardRate || undefined,
                  commissionableBasis: payment.amount,
                },
              });
            }
          }
        }
      }

      const earnedCommission = await tx.commission.findFirst({ where: { paymentId: payment.id, workspaceId: workspace.id } });
      if (earnedCommission && nextReconciliation === "RECONCILED" && earnedCommission.amount > 0) {
        const conn = (tx as any);
        // Prisma transaction clients do not expose the mysql2 connection used by the ledger service;
        // ledger seeding is therefore performed by the dedicated reconciliation endpoint for new rows.
      }

      if (nextStatus === "REVERSED" || nextStatus === "REFUNDED") {
        const revenue = await tx.revenue.findFirst({ where: { paymentId: payment.id, workspaceId: workspace.id } });
        if (revenue) {
          await tx.revenue.update({ where: { id: revenue.id }, data: { status: "REVERSED", recognizedAmount: 0, commissionableAmount: 0 } });
          await tx.commission.updateMany({ where: { revenueId: revenue.id, workspaceId: workspace.id }, data: { status: "VOID", amount: 0 } });
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
