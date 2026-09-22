import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { isOutboundAllowed, sendThroughAdapter } from "@/lib/messaging";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 10000) : "";
  const recipient = typeof body.recipient === "string" ? body.recipient.trim().slice(0, 190) : "";
  if (!text || !recipient) return NextResponse.json({ error: "body and recipient are required" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { person: { include: { communicationPreference: true } } },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  if (conversation.status === "CLOSED") return NextResponse.json({ error: "Conversation is closed" }, { status: 409 });
  if (conversation.status === "HUMAN_HANDOFF" && conversation.assignedTo !== session.email) {
    return NextResponse.json({ error: "Conversation is assigned to another human owner" }, { status: 409 });
  }
  if (!isOutboundAllowed(conversation.channel, conversation.person?.communicationPreference)) {
    return NextResponse.json({ error: "Outbound messaging is not permitted for this channel." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      direction: "OUTBOUND",
      status: "QUEUED",
      recipientAddress: recipient,
      body: text,
      metadata: { actor: session.email },
    },
  });

  try {
    const providerResult = await sendThroughAdapter({
      channel: conversation.channel,
      recipient,
      body: text,
      externalThreadId: conversation.externalThreadId,
    });
    await prisma.$transaction([
      prisma.message.update({
        where: { id: message.id },
        data: { status: "SENT", sentAt: new Date(), metadata: { actor: session.email, providerResult } },
      }),
      prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } }),
      prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND", subject: conversation.channel + " outbound message", details: { messageId: message.id, providerResult }, personId: conversation.personId, customerId: conversation.customerId, opportunityId: conversation.opportunityId } }),
    ]);
    return NextResponse.json({ ok: true, messageId: message.id, status: "SENT" });
  } catch (error) {
    await prisma.$transaction([
      prisma.message.update({
        where: { id: message.id },
        data: { status: "FAILED", metadata: { actor: session.email, error: error instanceof Error ? error.message : "Provider error" } },
      }),
      prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND_FAILED", subject: conversation.channel + " outbound failed", details: { messageId: message.id }, personId: conversation.personId, customerId: conversation.customerId, opportunityId: conversation.opportunityId } }),
    ]);
    return NextResponse.json({ ok: false, messageId: message.id, status: "FAILED" }, { status: 502 });
  }
}

export async function GET(request: Request, { params }: Params) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id }, select: { id: true } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" }, take: 200 });
  return NextResponse.json({ messages, viewer: session.email });
}
