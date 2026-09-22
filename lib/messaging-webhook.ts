import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { prisma, CommunicationChannel } from "@/lib/prisma";

export function signMessagingWebhook(rawBody: string, secret = process.env.MESSAGING_WEBHOOK_SECRET) {
  if (!secret) throw new Error("MESSAGING_WEBHOOK_SECRET is not configured");
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.MESSAGING_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = signMessagingWebhook(rawBody, secret);
  const provided = signature.replace(/^sha256=/, "");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export async function processInboundMessagingWebhook(
  channel: string,
  rawBody: string,
  signature: string | null,
) {
  if (!validSignature(rawBody, signature)) {
    throw Object.assign(new Error("Invalid webhook signature"), { status: 401 });
  }

  const normalized = channel.toUpperCase() as CommunicationChannel;
  if (!Object.values(CommunicationChannel).includes(normalized)) {
    throw Object.assign(new Error("Unsupported channel"), { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }

  const externalThreadId = typeof body.externalThreadId === "string" ? body.externalThreadId.slice(0, 190) : "";
  const sender = typeof body.sender === "string" ? body.sender.slice(0, 190) : "";
  const recipient = typeof body.recipient === "string" ? body.recipient.slice(0, 190) : "";
  const messageBody = typeof body.body === "string" ? body.body.slice(0, 10000) : "";
  const externalMessageId = typeof body.externalMessageId === "string" ? body.externalMessageId.slice(0, 190) : null;

  if (!externalThreadId || !sender || !messageBody) {
    throw Object.assign(new Error("externalThreadId, sender and body are required"), { status: 400 });
  }

  if (externalMessageId) {
    const duplicate = await prisma.message.findFirst({
      where: { externalMessageId, conversation: { channel: normalized } },
      select: { id: true, conversationId: true },
    });
    if (duplicate) return { ok: true, duplicate: true, conversationId: duplicate.conversationId, messageId: duplicate.id };
  }

  let conversation = await prisma.conversation.findFirst({
    where: { channel: normalized, externalThreadId, status: { not: "CLOSED" } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        channel: normalized,
        externalThreadId,
        personId: typeof body.personId === "string" ? body.personId : null,
        leadId: typeof body.leadId === "string" ? body.leadId : null,
        customerId: typeof body.customerId === "string" ? body.customerId : null,
        opportunityId: typeof body.opportunityId === "string" ? body.opportunityId : null,
        status: "OPEN",
        lastMessageAt: new Date(),
      },
    });
  }

  const message = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      direction: "INBOUND",
      status: "RECEIVED",
      externalMessageId,
      senderAddress: sender,
      recipientAddress: recipient || null,
      body: messageBody,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
      sentAt: new Date(),
    },
  });

  await prisma.$transaction([
    prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } }),
    prisma.activity.create({
      data: {
        type: "MESSAGE_INBOUND",
        subject: normalized + " inbound message",
        details: { conversationId: conversation.id, messageId: message.id },
        personId: conversation.personId,
        customerId: conversation.customerId,
        opportunityId: conversation.opportunityId,
      },
    }),
  ]);

  return { ok: true, duplicate: false, conversationId: conversation.id, messageId: message.id };
}
