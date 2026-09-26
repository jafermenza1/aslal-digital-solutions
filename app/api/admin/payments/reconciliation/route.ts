import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeWorkspacePermission("commerce.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: {
      workspaceId: access.workspace.id,
      OR: [
        { status: "PENDING" },
        { status: "INITIATED" },
        { status: "CONFIRMED", reconciliationStatus: { in: ["UNMATCHED", "MATCHED", "EXCEPTION"] } },
      ],
    },
    include: {
      order: {
        select: {
          id: true, orderNumber: true, total: true, currency: true, paymentState: true,
          customer: { select: { name: true, email: true, phone: true } },
        },
      },
      customer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({
    payments: payments.map((payment) => ({
      id: payment.id, orderId: payment.orderId, provider: payment.provider,
      providerTransactionRef: payment.providerTransactionRef, amount: Number(payment.amount),
      currency: payment.currency, method: payment.method, status: payment.status,
      reconciliationStatus: payment.reconciliationStatus,
      reconciliationEvidenceRef: payment.reconciliationEvidenceRef,
      reconciliationNotes: payment.reconciliationNotes, reconciledBy: payment.reconciledBy,
      confirmedAt: payment.confirmedAt, reconciledAt: payment.reconciledAt, createdAt: payment.createdAt,
      order: { ...payment.order, total: Number(payment.order.total) },
      customer: payment.customer,
    })),
  });
}