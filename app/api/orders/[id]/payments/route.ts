import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const statuses = ["INITIATED", "PENDING", "CONFIRMED", "FAILED", "REVERSED", "REFUNDED"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const body = await request.json();
  const idempotencyKey = String(body.idempotencyKey || "").trim();
  const access = await authorizeWorkspacePermission(
    "leads.edit",
    typeof body.workspaceId === "string" ? body.workspaceId : undefined,
  );
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const provider = String(body.provider || "").trim();
  const amount = Number(body.amount);
  const currency = String(body.currency || "").trim().toUpperCase();
  const status = String(body.status || "PENDING").toUpperCase();

  if (!idempotencyKey) return NextResponse.json({ error: "idempotencyKey is required" }, { status: 400 });
  if (!provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
  if (!currency) return NextResponse.json({ error: "currency is required" }, { status: 400 });
  if (!statuses.includes(status as typeof statuses[number])) return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  if (["CONFIRMED", "REVERSED", "REFUNDED"].includes(status)) {
    return NextResponse.json({ error: "Payment submission must remain pending until an authorized finance reconciliation confirms it." }, { status: 409 });
  }

  const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
  if (existing) {
    if (
      existing.workspaceId !== access.workspace.id ||
      existing.orderId !== orderId ||
      Number(existing.amount) !== amount ||
      existing.currency !== currency
    ) {
      return NextResponse.json({ error: "Idempotency key was already used for a different payment." }, { status: 409 });
    }
    return NextResponse.json({ payment: existing, alreadyExists: true });
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const lockedOrders = await tx.$queryRaw<Array<{
        id: string;
        total: Prisma.Decimal;
        currency: string;
        status: string;
        customerId: string | null;
      }>>`
        SELECT id, total, currency, status, customer_id AS customerId
        FROM orders
        WHERE id = ${orderId} AND workspace_id = ${access.workspace.id}
        FOR UPDATE
      `;

      const order = lockedOrders[0];
      if (!order) throw new Error("Order not found");
      if (order.status === "CANCELLED") throw new Error("Cancelled orders cannot receive payments.");
      if (order.currency !== currency) throw new Error(`Payment currency must match the order currency (${order.currency}).`);

      const outstandingPayments = await tx.payment.aggregate({
        where: {
          orderId,
          workspaceId: access.workspace.id,
          status: { in: ["CONFIRMED", "PENDING", "INITIATED"] },
        },
        _sum: { amount: true },
      });

      const outstanding = Math.max(0, Number(order.total) - Number(outstandingPayments._sum.amount || 0));
      if (amount > outstanding) {
        throw new Error(`Payment exceeds the remaining order balance of ${outstanding.toFixed(2)} ${order.currency}.`);
      }

      const created = await tx.payment.create({
        data: {
          id: randomUUID(),
          workspaceId: access.workspace.id,
          orderId,
          customerId: order.customerId || undefined,
          provider,
          providerTransactionRef: body.providerTransactionRef ? String(body.providerTransactionRef) : undefined,
          idempotencyKey,
          amount,
          currency,
          method: body.method ? String(body.method) : undefined,
          status: status as never,
          metadata: body.metadata ?? undefined,
          failureReason: body.failureReason ? String(body.failureReason) : undefined,
          confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
        },
      });

      if (status === "CONFIRMED") {
        await tx.order.update({
          where: { id: orderId, workspaceId: access.workspace.id },
          data: { paymentState: "CONFIRMED" },
        });
      } else if (status === "PENDING" || status === "INITIATED") {
        await tx.order.update({ where: { id: orderId }, data: { paymentState: status as never } });
      } else if (status === "FAILED") {
        await tx.order.update({ where: { id: orderId }, data: { paymentState: "FAILED" } });
      }

      return created;
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.payment.findUnique({ where: { idempotencyKey } }).catch(() => null);
      if (
        raced &&
        raced.workspaceId === access.workspace.id &&
        raced.orderId === orderId &&
        Number(raced.amount) === amount &&
        raced.currency === currency
      ) {
        return NextResponse.json({ payment: raced, alreadyExists: true });
      }
    }

    const message = error instanceof Error ? error.message : "Unable to record payment";
    const statusCode =
      message === "Order not found"
        ? 404
        : message === "Cancelled orders cannot receive payments." ||
            message.startsWith("Payment exceeds") ||
            message.startsWith("Payment currency must match")
          ? 409
          : 400;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
