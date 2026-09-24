import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

const statuses = ["INITIATED", "PENDING", "CONFIRMED", "FAILED", "REVERSED", "REFUNDED"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authorizePermission("leads.edit");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const idempotencyKey = String(body.idempotencyKey || "").trim();
    const provider = String(body.provider || "").trim();
    const amount = Number(body.amount);
    const currency = String(body.currency || "").trim().toUpperCase();
    const status = String(body.status || "INITIATED").toUpperCase();

    if (!idempotencyKey) return NextResponse.json({ error: "idempotencyKey is required" }, { status: 400 });
    if (!provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
    if (!currency) return NextResponse.json({ error: "currency is required" }, { status: 400 });
    if (!statuses.includes(status as typeof statuses[number])) return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });

    const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.orderId !== orderId || Number(existing.amount) !== amount || existing.currency !== currency) {
        return NextResponse.json({ error: "Idempotency key was already used for a different payment." }, { status: 409 });
      }
      return NextResponse.json({ payment: existing, alreadyExists: true });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "CANCELLED") return NextResponse.json({ error: "Cancelled orders cannot receive payments." }, { status: 409 });
    if (amount > Number(order.total)) return NextResponse.json({ error: "Payment cannot exceed the order total." }, { status: 409 });

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          id: randomUUID(),
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
        await tx.order.update({ where: { id: orderId }, data: { paymentState: "CONFIRMED" } });
      } else if (status === "PENDING" || status === "INITIATED") {
        await tx.order.update({ where: { id: orderId }, data: { paymentState: status as never } });
      } else if (status === "FAILED") {
        await tx.order.update({ where: { id: orderId }, data: { paymentState: "FAILED" } });
      }

      return created;
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
