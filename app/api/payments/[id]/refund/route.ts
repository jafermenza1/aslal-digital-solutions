import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { requireSameWorkspace } from "@/lib/workspace-boundary";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeWorkspacePermission("commerce.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const amount = Number(body.amount);
  const idempotencyKey = String(body.idempotencyKey || "").trim();
  if (!idempotencyKey) return NextResponse.json({ error: "idempotencyKey is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Refund amount must be greater than zero" }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id, workspaceId: access.workspace.id },
        include: { order: true, revenue: true, refunds: true, commission: true },
      });
      if (!payment) throw new Error("Payment not found");
      requireSameWorkspace(access.workspace.id, payment.workspaceId, payment.order.workspaceId);
      if (!["CONFIRMED", "PARTIALLY_REFUNDED"].includes(payment.status)) {
        throw new Error("Only confirmed payments can be refunded.");
      }

      const duplicate = await tx.paymentRefund.findUnique({ where: { idempotencyKey } });
      if (duplicate) return { duplicate: true, refund: duplicate, payment };

      const refundedBefore = payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
      const remaining = Number(payment.amount) - refundedBefore;
      if (amount > remaining + 0.000001) throw new Error(`Refund exceeds the remaining refundable amount of ${remaining.toFixed(2)} ${payment.currency}.`);

      if (payment.commission?.status === "PAID") {
        throw new Error("This commission has already been paid. Finance must process a payout clawback before refunding the payment.");
      }

      const refund = await tx.paymentRefund.create({
        data: {
          id: randomUUID(),
          workspaceId: access.workspace.id,
          paymentId: payment.id,
          idempotencyKey,
          amount,
          currency: payment.currency,
          reason: String(body.reason || "").trim().slice(0, 5000) || null,
          providerRefundRef: String(body.providerRefundRef || "").trim().slice(0, 190) || null,
          createdBy: access.user.email,
        },
      });

      const totalRefunded = refundedBefore + amount;
      const fullyRefunded = totalRefunded >= Number(payment.amount) - 0.000001;
      const nextStatus = fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED";

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          refundReason: String(body.reason || "").trim().slice(0, 5000) || payment.refundReason,
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentState: nextStatus },
      });

      if (payment.revenue) {
        const remainingCollected = Math.max(0, Number(payment.amount) - totalRefunded);
        await tx.revenue.update({
          where: { id: payment.revenue.id },
          data: {
            collectedAmount: remainingCollected,
            recognizedAmount: remainingCollected,
            commissionableAmount: remainingCollected,
            status: remainingCollected > 0 ? "RECOGNIZED" : "REVERSED",
          },
        });

        if (payment.commission) {
          const priorCommission = Number(payment.commission.amount);
          const ratio = Number(payment.amount) > 0 ? remainingCollected / Number(payment.amount) : 0;
          await tx.commission.update({
            where: { id: payment.commission.id },
            data: {
              amount: new Prisma.Decimal((priorCommission * ratio).toFixed(2)),
              status: remainingCollected > 0 ? payment.commission.status : "VOID",
            },
          });
        }
      }

      await tx.activity.create({
        data: {
          type: "PAYMENT_REFUND",
          subject: `Payment ${payment.id} ${fullyRefunded ? "fully refunded" : "partially refunded"}`,
          details: {
            paymentId: payment.id,
            orderId: payment.orderId,
            refundId: refund.id,
            amount,
            totalRefunded,
            remainingRefundable: Math.max(0, Number(payment.amount) - totalRefunded),
            actor: access.user.email,
          },
          customerId: payment.order.customerId || undefined,
          opportunityId: payment.order.opportunityId || undefined,
        },
      });

      return { duplicate: false, refund, payment: { ...payment, status: nextStatus } };
    });

    return NextResponse.json({ ok: true, alreadyExists: result.duplicate, refund: result.refund, payment: result.payment });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }
    const message = error instanceof Error ? error.message : "Unable to process refund";
    return NextResponse.json({ error: message }, { status: message.includes("not found") ? 404 : 409 });
  }
}
