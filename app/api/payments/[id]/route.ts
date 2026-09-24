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
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const nextStatus = body.status ? String(body.status).toUpperCase() : null;
    const nextReconciliation = body.reconciliationStatus ? String(body.reconciliationStatus).toUpperCase() : null;

    if (nextReconciliation && !reconciliationStates.includes(nextReconciliation)) {
      return NextResponse.json({ error: "Invalid reconciliation status" }, { status: 400 });
    }
    if (nextStatus && (!Object.prototype.hasOwnProperty.call(allowed, payment.status) || !allowed[payment.status].includes(nextStatus))) {
      return NextResponse.json({ error: `Cannot move payment from ${payment.status} to ${nextStatus}` }, { status: 409 });
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
        if (nextReconciliation === "RECONCILED") data.reconciledAt = new Date();
      }
      const result = await tx.payment.update({ where: { id }, data });
      if (nextStatus === "CONFIRMED") await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "CONFIRMED" } });
      if (nextStatus === "FAILED") await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "FAILED" } });
      if (nextStatus === "REVERSED") await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REVERSED" } });
      if (nextStatus === "REFUNDED") await tx.order.update({ where: { id: payment.orderId }, data: { paymentState: "REFUNDED" } });
      return result;
    });

    return NextResponse.json({ payment: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
