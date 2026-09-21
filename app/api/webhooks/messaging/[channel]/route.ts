import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { prisma, CommunicationChannel } from "@/lib/prisma";

type Params = { params: Promise<{ channel: string }> };

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.MESSAGING_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.replace(/^sha256=/, "");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export async function POST(request: NextRequest, { params }: Params) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const { channel: channelParam } = await params;
  const channel = channelParam.toUpperCase() as CommunicationChannel;
  if (!Object.values(CommunicationChannel).includes(channel)) {
    return NextResponse.json({ error: "Unsupported channel" }, { status: 400 });
  }

  const body = JSON.parse(raw);
  const externalThreadId = typeof body.externalThreadId === "string" ? body.externalThreadId.slice(0, 190) : "";
  const sender = typeof body.sender === "string" ? body.sender.slice(0, 190) : "";
  const recipient = typeof body.recipient === "string" ? body.recipient.slice(0, 190) : "";
  const messageBody = typeof body.body === "string" ? body.body.slice(0, 10000) : "";
  if (!externalThreadId || !sender || !messageBody) {
    return NextResponse.json({ error: "externalThreadId, sender and body are required" }, { status: 400 });
  }

  let conversation = await prisma.conversation.findFirst({
    where: { channel, externalThreadId, status: { not: "CLOSED" } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        channel,
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
      externalMessageId: typeof body.externalMessageId === "string" ? body.externalMessageId.slice(0, 190) : null,
      senderAddress: sender,
      recipientAddress: recipient || null,
      body: messageBody,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
      sentAt: new Date(),
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json({ ok: true, conversationId: conversation.id, messageId: message.id });
}
