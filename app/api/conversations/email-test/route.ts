import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { sendThroughAdapter } from "@/lib/messaging";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const recipient = typeof body.recipient === "string" ? body.recipient.trim().slice(0, 190) : "";
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 190) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 10000) : "";
  const confirmed = body.confirmed === true;
  const simulation = body.simulation === "failure" ? "failure" : body.simulation === "success" ? "success" : undefined;

  if (!recipient || !text) return NextResponse.json({ error: "Recipient and message are required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(recipient)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!confirmed) return NextResponse.json({ error: "Confirm that this is an authorized test recipient." }, { status: 400 });

  const conversationId = randomUUID();
  const messageId = randomUUID();

  await prisma.conversation.create({ data: { id: conversationId, channel: "EMAIL", status: "OPEN" } });
  await prisma.message.create({
    data: { id: messageId, conversationId, direction: "OUTBOUND", status: "QUEUED", recipientAddress: recipient, body: text, metadata: { actor: session.email, source: "conversation-email-test", subject: subject || null } },
  });

  try {
    const providerResult = await sendThroughAdapter({ channel: "EMAIL", recipient, body: text, subject: subject || undefined, simulation });
    const providerMessageId = providerResult && typeof providerResult === "object" && "messageId" in providerResult && typeof providerResult.messageId === "string" ? providerResult.messageId : null;

    await prisma.$transaction([
      prisma.message.update({ where: { id: messageId }, data: { status: "SENT", sentAt: new Date(), externalMessageId: providerMessageId, metadata: { actor: session.email, source: "conversation-email-test", subject: subject || null, providerResult } } }),
      prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
      prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND", subject: "EMAIL provider test sent", details: { messageId, conversationId, providerResult, source: "conversation-email-test" } } }),
    ]);
    return NextResponse.json({ ok: true, status: "SENT", messageId, conversationId, providerMessageId, providerResult });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Email provider error";
    await prisma.$transaction([
      prisma.message.update({ where: { id: messageId }, data: { status: "FAILED", metadata: { actor: session.email, source: "conversation-email-test", subject: subject || null, error: errorMessage } } }),
      prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND_FAILED", subject: "EMAIL provider test failed", details: { messageId, conversationId, source: "conversation-email-test", error: errorMessage } } }),
    ]);
    return NextResponse.json({ ok: false, status: "FAILED", messageId, conversationId, error: errorMessage }, { status: 502 });
  }
}
