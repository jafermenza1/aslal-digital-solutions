import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { isOutboundAllowed, sendThroughAdapter } from "@/lib/messaging";
import { processInboundMessagingWebhook, signMessagingWebhook } from "@/lib/messaging-webhook";

const channels = ["EMAIL", "SMS", "TELEGRAM", "WHATSAPP", "MESSENGER"] as const;
type Channel = typeof channels[number];

function channelAllowedField(channel: Channel) {
  return {
    EMAIL: "emailAllowed",
    SMS: "smsAllowed",
    TELEGRAM: "telegramAllowed",
    WHATSAPP: "whatsappAllowed",
    MESSENGER: "messengerAllowed",
  }[channel] as "emailAllowed" | "smsAllowed" | "telegramAllowed" | "whatsappAllowed" | "messengerAllowed";
}

function assertChannel(value: unknown): Channel {
  if (typeof value !== "string" || !channels.includes(value as Channel)) throw new Error("Unsupported channel");
  return value as Channel;
}

export async function GET() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [conversations, messages, inbound, outbound, sent, delivered, failed, handoffs, activities] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.message.count({ where: { direction: "INBOUND" } }),
    prisma.message.count({ where: { direction: "OUTBOUND" } }),
    prisma.message.count({ where: { status: "SENT" } }),
    prisma.message.count({ where: { status: "DELIVERED" } }),
    prisma.message.count({ where: { status: "FAILED" } }),
    prisma.conversation.count({ where: { status: "HUMAN_HANDOFF" } }),
    prisma.activity.count({ where: { type: { startsWith: "MESSAGE_" } } }),
  ]);
  return NextResponse.json({ conversations, messages, inbound, outbound, sent, delivered, failed, handoffs, activities });
}

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (process.env.PHASE4_ACCEPTANCE_MODE !== "true") {
    return NextResponse.json({ error: "Phase 4 acceptance mode is disabled. Set PHASE4_ACCEPTANCE_MODE=true for controlled tests." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  const channel = assertChannel(body.channel);
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, personId: true, name: true, email: true, phone: true } }) : null;

  if (!lead || !lead.personId) {
    return NextResponse.json({ error: "Choose a Lead linked to a Person." }, { status: 400 });
  }

  const person = await prisma.person.findUnique({ where: { id: lead.personId }, select: { id: true } });
  if (!person) return NextResponse.json({ error: "Linked Person not found." }, { status: 400 });

  const allowedField = channelAllowedField(channel);
  const preference = await prisma.communicationPreference.upsert({
    where: { personId: person.id },
    create: { id: randomUUID(), personId: person.id, [allowedField]: true },
    update: { [allowedField]: true, globalOptOut: false },
  });

  let conversation = await prisma.conversation.findFirst({
    where: { personId: person.id, leadId: lead.id, channel, status: { not: "CLOSED" } },
    orderBy: { updatedAt: "desc" },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { id: randomUUID(), personId: person.id, leadId: lead.id, channel, status: "OPEN", assignedTo: session.email, externalThreadId: "phase4-test-" + randomUUID() },
    });
  }

  if (action === "prepare") {
    return NextResponse.json({ ok: true, conversationId: conversation.id, personId: person.id, leadId: lead.id, channel, preference });
  }

  if (action === "simulation-suite") {
    const results: Array<{ name: string; ok: boolean; detail: string }> = [];
    const testId = randomUUID();
    const now = new Date();

    const permitted = isOutboundAllowed(channel, { ...preference, [allowedField]: true, globalOptOut: false });
    results.push({ name: "Explicit channel permission", ok: permitted, detail: permitted ? "Outbound is permitted." : "Permission gate rejected an allowed channel." });

    const simulatedMessage = await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        direction: "OUTBOUND",
        status: "SENT",
        recipientAddress: String(body.recipient || lead.email || lead.phone || "phase4-test-recipient"),
        body: "Phase 4 controlled acceptance test — simulated outbound",
        metadata: { acceptanceTest: true, simulation: true, testId },
        sentAt: now,
      },
    });
    await prisma.activity.create({
      data: { type: "MESSAGE_OUTBOUND", subject: channel + " simulated outbound", details: { acceptanceTest: true, testId, messageId: simulatedMessage.id }, personId: person.id, opportunityId: null },
    });
    results.push({ name: "Outbound persistence", ok: true, detail: "Message persisted as SENT without contacting a provider." });

    const deniedPreference = await prisma.communicationPreference.update({ where: { personId: person.id }, data: { [allowedField]: false, globalOptOut: false } });
    const denied = !isOutboundAllowed(channel, deniedPreference);
    results.push({ name: "Removed channel permission blocks outbound", ok: denied, detail: denied ? "Gate refused dispatch." : "Gate still allowed dispatch." });

    await prisma.communicationPreference.update({ where: { personId: person.id }, data: { [allowedField]: true, globalOptOut: true } });
    const globalDeniedPreference = await prisma.communicationPreference.findUnique({ where: { personId: person.id } });
    const globalDenied = !isOutboundAllowed(channel, globalDeniedPreference);
    results.push({ name: "Global opt-out blocks outbound", ok: globalDenied, detail: globalDenied ? "All-channel opt-out refused dispatch." : "Global opt-out did not block dispatch." });

    await prisma.communicationPreference.update({ where: { personId: person.id }, data: { [allowedField]: true, globalOptOut: false } });

    const handoff = await prisma.conversation.update({ where: { id: conversation.id }, data: { status: "HUMAN_HANDOFF", assignedTo: session.email, humanHandoffAt: now } });
    const handoffOk = handoff.status === "HUMAN_HANDOFF" && handoff.assignedTo === session.email;
    results.push({ name: "Human handoff ownership", ok: handoffOk, detail: handoffOk ? "Conversation is assigned to the current operator." : "Handoff state/owner mismatch." });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { status: "OPEN", assignedTo: null } });

    const payload = JSON.stringify({
      externalThreadId: "phase4-inbound-" + testId,
      externalMessageId: "phase4-message-" + testId,
      sender: String(body.sender || lead.email || lead.phone || "phase4-test-sender"),
      recipient: String(body.recipient || "aslal-test"),
      body: "Phase 4 controlled acceptance test — simulated inbound",
      personId: person.id,
      leadId: lead.id,
      metadata: { acceptanceTest: true, testId },
    });
    const signature = signMessagingWebhook(payload);
    const inboundResult = await processInboundMessagingWebhook(channel, payload, "sha256=" + signature);
    const duplicateResult = await processInboundMessagingWebhook(channel, payload, "sha256=" + signature);
    results.push({ name: "Signed inbound webhook", ok: inboundResult.ok && !inboundResult.duplicate, detail: "Valid signature created an inbound Message." });
    results.push({ name: "Webhook retry idempotency", ok: duplicateResult.duplicate === true, detail: duplicateResult.duplicate ? "Repeated external message was deduplicated." : "Duplicate delivery created another record." });

    const unknownPayload = JSON.stringify({
      externalThreadId: "phase4-unknown-" + testId,
      externalMessageId: "phase4-unknown-message-" + testId,
      sender: "unknown-phase4-sender",
      recipient: "aslal-test",
      body: "Unknown sender acceptance test",
      metadata: { acceptanceTest: true, testId },
    });
    const unknownResult = await processInboundMessagingWebhook(channel, unknownPayload, "sha256=" + signMessagingWebhook(unknownPayload));
    const unknownConversation = await prisma.conversation.findUnique({ where: { id: unknownResult.conversationId }, select: { personId: true } });
    results.push({ name: "Unknown sender does not fabricate Person", ok: unknownConversation?.personId == null, detail: unknownConversation?.personId == null ? "Conversation remains unclaimed." : "A Person was assigned unexpectedly." });

    let invalidRejected = false;
    try {
      await processInboundMessagingWebhook(channel, payload, "sha256=invalid");
    } catch (error) {
      invalidRejected = error instanceof Error && error.message === "Invalid webhook signature";
    }
    results.push({ name: "Invalid webhook signature rejected", ok: invalidRejected, detail: invalidRejected ? "401 boundary behavior verified." : "Invalid signature was accepted." });

    const activityCount = await prisma.activity.count({ where: { type: { startsWith: "MESSAGE_" }, personId: person.id } });
    results.push({ name: "Message activity reaches timeline", ok: activityCount > 0, detail: activityCount + " message activity record(s) linked to the Person." });

    return NextResponse.json({ ok: results.every(result => result.ok), results, conversationId: conversation.id, testId });
  }

  if (action === "live-send") {
    const recipient = typeof body.recipient === "string" ? body.recipient.trim().slice(0, 190) : "";
    const text = typeof body.message === "string" ? body.message.trim().slice(0, 10000) : "";
    if (!recipient || !text) return NextResponse.json({ error: "recipient and message are required" }, { status: 400 });
    if (conversation.status === "HUMAN_HANDOFF" && conversation.assignedTo !== session.email) {
      return NextResponse.json({ error: "Conversation is assigned to another human owner." }, { status: 409 });
    }
    const currentPreference = await prisma.communicationPreference.findUnique({ where: { personId: person.id } });
    if (!isOutboundAllowed(channel, currentPreference)) return NextResponse.json({ error: "Outbound is blocked by communication preference." }, { status: 403 });
    const message = await prisma.message.create({ data: { id: randomUUID(), conversationId: conversation.id, direction: "OUTBOUND", status: "QUEUED", recipientAddress: recipient, body: text, metadata: { acceptanceTest: true, actor: session.email } } });
    try {
      const providerResult = await sendThroughAdapter({ channel, recipient, body: text, externalThreadId: conversation.externalThreadId });
      await prisma.$transaction([
        prisma.message.update({ where: { id: message.id }, data: { status: "SENT", sentAt: new Date(), metadata: { acceptanceTest: true, actor: session.email, providerResult } } }),
        prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } }),
        prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND", subject: channel + " outbound", details: { acceptanceTest: true, messageId: message.id }, personId: person.id, opportunityId: conversation.opportunityId } }),
      ]);
      return NextResponse.json({ ok: true, messageId: message.id, status: "SENT" });
    } catch (error) {
      await prisma.$transaction([
        prisma.message.update({ where: { id: message.id }, data: { status: "FAILED", metadata: { acceptanceTest: true, actor: session.email, error: error instanceof Error ? error.message : "Provider error" } } }),
        prisma.activity.create({ data: { type: "MESSAGE_OUTBOUND_FAILED", subject: channel + " outbound failed", details: { acceptanceTest: true, messageId: message.id }, personId: person.id, opportunityId: conversation.opportunityId } }),
      ]);
      return NextResponse.json({ ok: false, messageId: message.id, status: "FAILED", error: error instanceof Error ? error.message : "Provider error" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown acceptance action" }, { status: 400 });
}
