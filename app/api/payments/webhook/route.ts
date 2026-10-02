import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(signature.trim(), "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const statusMap: Record<string, "PENDING"|"CONFIRMED"|"FAILED"|"REVERSED"|"REFUNDED"> = {
  payment_pending: "PENDING",
  payment_confirmed: "CONFIRMED",
  payment_succeeded: "CONFIRMED",
  payment_failed: "FAILED",
  payment_reversed: "REVERSED",
  payment_refunded: "REFUNDED",
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-aslal-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const provider = String(body.provider || "").trim().slice(0, 80);
  const eventId = String(body.eventId || body.id || "").trim().slice(0, 255);
  const eventType = String(body.eventType || body.type || "").trim().toLowerCase().slice(0, 120);
  const paymentId = String(body.paymentId || "").trim() || null;
  const providerTransactionRef = String(body.providerTransactionRef || "").trim() || null;
  const nextStatus = statusMap[eventType];

  if (!provider || !eventId || !eventType || !nextStatus) {
    return NextResponse.json({ error: "provider, eventId, eventType and a supported payment event are required" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let payment = paymentId
        ? await tx.payment.findUnique({ where: { id: paymentId } })
        : providerTransactionRef
          ? await tx.payment.findFirst({ where: { provider, providerTransactionRef } })
          : null;

      if (!payment) throw new Error("Payment not found");

      const duplicate = await tx.paymentWebhookEvent.findUnique({
        where: { provider_eventId: { provider, eventId } },
      });
      if (duplicate) return { duplicate: true, payment };

      await tx.paymentWebhookEvent.create({
        data: {
          id: randomUUID(),
          provider,
          eventId,
          eventType,
          paymentId: payment.id,
          workspaceId: payment.workspaceId,
          payload: body,
          processedAt: new Date(),
        },
      });

      const allowed: Record<string, string[]> = {
        INITIATED: ["PENDING", "CONFIRMED", "FAILED"],
        PENDING: ["CONFIRMED", "FAILED", "REVERSED"],
        CONFIRMED: ["REVERSED", "REFUNDED"],
        FAILED: [],
        REVERSED: [],
        REFUNDED: [],
        PARTIALLY_REFUNDED: ["REFUNDED"],
      };
      if (!allowed[payment.status]?.includes(nextStatus) && payment.status !== nextStatus) {
        throw new Error(`Cannot move payment from ${payment.status} to ${nextStatus}`);
      }

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          confirmedAt: nextStatus === "CONFIRMED" ? new Date() : payment.confirmedAt,
          failureReason: nextStatus === "FAILED" ? String(body.failureReason || "Provider reported payment failure") : payment.failureReason,
          reversalReason: nextStatus === "REVERSED" ? String(body.reversalReason || "Provider reported payment reversal") : payment.reversalReason,
          refundReason: nextStatus === "REFUNDED" ? String(body.refundReason || "Provider reported refund") : payment.refundReason,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentState: nextStatus },
      });

      return { duplicate: false, payment: updated };
    });

    return NextResponse.json({ ok: true, alreadyProcessed: result.duplicate, payment: result.payment });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }
    const message = error instanceof Error ? error.message : "Unable to process payment webhook";
    return NextResponse.json({ error: message }, { status: message === "Payment not found" ? 404 : 409 });
  }
}
