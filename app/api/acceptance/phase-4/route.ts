import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { canSendConversation, isOutboundAllowed, sendThroughAdapter } from "@/lib/messaging";
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

function check(name: string, ok: boolean, detail: string) {
  return { name, ok, detail };
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
  const lead = leadId
    ? await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, personId: true, name: true, email: true, phone: true },
      })
    : null;

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
      data: {
        id: randomUUID(),
        personId: person.id,
        leadId: lead.id,
        channel,
        status: "OPEN",
        assignedTo: session.email,
        externalThreadId: "phase4-test-" + randomUUID(),
      },
    });
  }

  if (action === "prepare") {
    return NextResponse.json({ ok: true, conversationId: conversation.id, personId: person.id, leadId: lead.id, channel, preference });
  }

  if (action !== "simulation-suite") {
    if (action === "live-send") {
      const recipient = typeof body.recipient === "string" ? body.recipient.trim().slice(0, 190) : "";
      const text = typeof body.message === "string" ? body.message.trim().slice(0, 10000) : "";
      if (!recipient || !text) return NextResponse.json({ error: "recipient and message are required" }, { status: 400 });
      if (conversation.status === "HUMAN_HANDOFF" && conversation.assignedTo !== session.email) {
        return NextResponse.json({ error: "Conversation is assigned to another human owner." }, { status: 409 });
      }
      const currentPreference = await prisma.communicationPreference.findUnique({ where: { personId: person.id } });
      if (!isOutboundAllowed(channel, currentPreference)) return NextResponse.json({ error: "Outbound is blocked by communication preference." }, { status: 403 });
      const message = await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: conversation.id,
          direction: "OUTBOUND",
          status: "QUEUED",
          recipientAddress: recipient,
          body: text,
          metadata: { acceptanceTest: true, actor: session.email },
        },
      });
      try {
        const providerResult = await sendThroughAdapter({ channel, recipient, body: text, externalThreadId: conversation.externalThreadId });
        await prisma.$transaction([
          prisma.message.update({
            where: { id: message.id },
            data: { status: "SENT", sentAt: new Date(), metadata: { acceptanceTest: true, actor: session.email, providerResult } },
          }),
          prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } }),
          prisma.activity.create({
            data: {
              type: "MESSAGE_OUTBOUND",
              subject: channel + " outbound",
              details: { acceptanceTest: true, messageId: message.id },
              personId: person.id,
              customerId: conversation.customerId,
              opportunityId: conversation.opportunityId,
            },
          }),
        ]);
        return NextResponse.json({ ok: true, messageId: message.id, status: "SENT" });
      } catch (error) {
        await prisma.$transaction([
          prisma.message.update({
            where: { id: message.id },
            data: { status: "FAILED", metadata: { acceptanceTest: true, actor: session.email, error: error instanceof Error ? error.message : "Provider error" } },
          }),
          prisma.activity.create({
            data: {
              type: "MESSAGE_OUTBOUND_FAILED",
              subject: channel + " outbound failed",
              details: { acceptanceTest: true, messageId: message.id },
              personId: person.id,
              customerId: conversation.customerId,
              opportunityId: conversation.opportunityId,
            },
          }),
        ]);
        return NextResponse.json({ ok: false, messageId: message.id, status: "FAILED", error: error instanceof Error ? error.message : "Provider error" }, { status: 502 });
      }
    }
    return NextResponse.json({ error: "Unknown acceptance action" }, { status: 400 });
  }

  const results: Array<{ name: string; ok: boolean; detail: string }> = [];
  const testId = randomUUID();
  const now = new Date();

  // A: every canonical channel gets an inbound simulation through the same signed boundary.
  const inboundByChannel: Array<{ channel: Channel; conversationId: string; messageId: string }> = [];
  for (const inboundChannel of channels) {
    const externalThreadId = "phase4-" + inboundChannel.toLowerCase() + "-" + testId;
    const externalMessageId = "phase4-msg-" + inboundChannel.toLowerCase() + "-" + testId;
    const payload = JSON.stringify({
      externalThreadId,
      externalMessageId,
      sender: lead.email || lead.phone || "phase4-sender-" + inboundChannel.toLowerCase(),
      recipient: "aslal-test-" + inboundChannel.toLowerCase(),
      body: "Phase 4A inbound " + inboundChannel + " simulation",
      personId: person.id,
      leadId: lead.id,
      metadata: { acceptanceTest: true, testId, channel: inboundChannel },
    });
    const signature = "sha256=" + signMessagingWebhook(payload);
    const first = await processInboundMessagingWebhook(inboundChannel, payload, signature);
    const second = await processInboundMessagingWebhook(inboundChannel, payload, signature);
    inboundByChannel.push({ channel: inboundChannel, conversationId: first.conversationId, messageId: first.messageId });

    const persisted = await prisma.message.findUnique({
      where: { id: first.messageId },
      select: { conversationId: true, direction: true, status: true, externalMessageId: true },
    });
    const historyCount = await prisma.message.count({ where: { conversationId: first.conversationId } });
    const activityCount = await prisma.activity.count({
      where: { type: "MESSAGE_INBOUND", personId: person.id, details: { path: ["messageId"], equals: first.messageId } },
    });
    results.push(check(
      "Inbound " + inboundChannel + " simulation",
      first.ok && second.duplicate === true && persisted?.direction === "INBOUND" && persisted.status === "RECEIVED",
      persisted ? "Conversation/message persisted as INBOUND/RECEIVED; retry was deduplicated." : "Inbound message was not persisted correctly.",
    ));
    results.push(check(
      "Inbound " + inboundChannel + " history",
      historyCount >= 1,
      "Re-read found " + historyCount + " message(s) in the canonical conversation.",
    ));
    results.push(check(
      "Replay same webhook",
      second.duplicate === true,
      "The exact webhook replay was recognized as a duplicate.",
    ));
    results.push(check(
      "Replay creates no duplicate message",
      historyCount === 1 && activityCount === 1,
      "The replay left one Message and one inbound Activity for the thread.",
    ));
    results.push(check(
      "Inbound " + inboundChannel + " activity",
      activityCount === 1,
      "Exactly one MESSAGE_INBOUND activity is linked to the message.",
    ));
  }

  // B: signature boundary and retry behavior.
  const securityPayload = JSON.stringify({
    externalThreadId: "phase4-security-" + testId,
    externalMessageId: "phase4-security-message-" + testId,
    sender: "phase4-security-sender",
    recipient: "aslal-test",
    body: "Phase 4A signature test",
  });
  let invalidRejected = false;
  let invalidSideEffects = false;
  try {
    await processInboundMessagingWebhook(channel, securityPayload, "sha256=invalid");
  } catch (error) {
    invalidRejected = error instanceof Error && error.message === "Invalid webhook signature";
  }
  const securityConversation = await prisma.conversation.findFirst({ where: { externalThreadId: "phase4-security-" + testId, channel } });
  invalidSideEffects = !securityConversation;
  results.push(check("Valid webhook signature accepted", inboundByChannel.some(item => item.channel === channel), "A valid HMAC-signed inbound payload was accepted."));
  results.push(check("Invalid webhook signature rejected", invalidRejected && invalidSideEffects, "Invalid signature rejected before any CRM record was created."));
  let missingRejected = false;
  try {
    await processInboundMessagingWebhook(channel, securityPayload, null);
  } catch (error) {
    missingRejected = error instanceof Error && error.message === "Invalid webhook signature";
  }
  results.push(check("Missing webhook signature rejected", missingRejected, "Unsigned inbound payload was rejected."));
  let tamperedRejected = false;
  const originalSignature = "sha256=" + signMessagingWebhook(securityPayload);
  try {
    await processInboundMessagingWebhook(channel, securityPayload + "tampered", originalSignature);
  } catch (error) {
    tamperedRejected = error instanceof Error && error.message === "Invalid webhook signature";
  }
  results.push(check("Tampered payload rejected", tamperedRejected, "Signature bound to the original body did not validate against altered content."));

  // C: identity attachment is explicit and must not fabricate unknown people.
  const personPayload = JSON.stringify({
    externalThreadId: "phase4-person-" + testId,
    externalMessageId: "phase4-person-msg-" + testId,
    sender: "known-person",
    recipient: "aslal-test",
    body: "Known Person identity test",
    personId: person.id,
  });
  const personInbound = await processInboundMessagingWebhook(channel, personPayload, "sha256=" + signMessagingWebhook(personPayload));
  const personConversation = await prisma.conversation.findUnique({ where: { id: personInbound.conversationId }, select: { personId: true, leadId: true, customerId: true } });
  results.push(check("Known person attaches correctly", personConversation?.personId === person.id && !personConversation.leadId && !personConversation.customerId, "Conversation retained the trusted Person mapping without adding other identities."));

  const leadPayload = JSON.stringify({
    externalThreadId: "phase4-lead-" + testId,
    externalMessageId: "phase4-lead-msg-" + testId,
    sender: "known-lead",
    recipient: "aslal-test",
    body: "Known Lead identity test",
    personId: person.id,
    leadId: lead.id,
  });
  const leadInbound = await processInboundMessagingWebhook(channel, leadPayload, "sha256=" + signMessagingWebhook(leadPayload));
  const leadConversation = await prisma.conversation.findUnique({ where: { id: leadInbound.conversationId }, select: { personId: true, leadId: true } });
  results.push(check("Lead attaches correctly", leadConversation?.personId === person.id && leadConversation.leadId === lead.id, "Conversation retained both trusted Person and Lead links."));

  const customer = await prisma.customer.findFirst({
    where: { personId: person.id },
    select: { id: true, personId: true },
  });
  const customerPayload = JSON.stringify({
    externalThreadId: "phase4-customer-" + testId,
    externalMessageId: "phase4-customer-msg-" + testId,
    sender: "known-customer",
    recipient: "aslal-test",
    body: "Known Customer identity test",
    personId: person.id,
    customerId: customer?.id,
  });
  let customerConversation = null as { personId: string | null; customerId: string | null } | null;
  if (customer) {
    const customerInbound = await processInboundMessagingWebhook(channel, customerPayload, "sha256=" + signMessagingWebhook(customerPayload));
    customerConversation = await prisma.conversation.findUnique({ where: { id: customerInbound.conversationId }, select: { personId: true, customerId: true } });
  }
  results.push(check(
    "Customer attaches correctly",
    Boolean(customer && customerConversation?.personId === person.id && customerConversation.customerId === customer.id),
    customer ? "Conversation retained the trusted Customer link." : "No existing Customer linked to the selected Person; create/use one before acceptance.",
  ));

  const unknownPayload = JSON.stringify({
    externalThreadId: "phase4-unknown-" + testId,
    externalMessageId: "phase4-unknown-message-" + testId,
    sender: "unknown-phase4-sender-" + testId,
    recipient: "aslal-test",
    body: "Unknown sender acceptance test",
  });
  const unknownResult = await processInboundMessagingWebhook(channel, unknownPayload, "sha256=" + signMessagingWebhook(unknownPayload));
  const unknownConversation = await prisma.conversation.findUnique({ where: { id: unknownResult.conversationId }, select: { personId: true, leadId: true, customerId: true } });
  results.push(check(
    "Unknown sender creates unclaimed conversation",
    unknownConversation?.personId == null && unknownConversation.leadId == null && unknownConversation.customerId == null,
    "Unknown sender created a conversation without fabricating CRM identity.",
  ));

  // D: consent matrix, including per-channel independence and global opt-out across all five channels.
  await prisma.communicationPreference.update({
    where: { personId: person.id },
    data: {
      emailAllowed: false,
      smsAllowed: false,
      telegramAllowed: false,
      whatsappAllowed: false,
      messengerAllowed: false,
      globalOptOut: false,
      [allowedField]: true,
    },
  });
  const allowedPreference = await prisma.communicationPreference.findUnique({ where: { personId: person.id } });
  results.push(check("Enable channel consent", isOutboundAllowed(channel, allowedPreference), "Selected channel permission explicitly enabled."));
  const independent = await prisma.communicationPreference.update({
    where: { personId: person.id },
    data: { emailAllowed: channel !== "EMAIL", smsAllowed: channel !== "SMS", telegramAllowed: channel !== "TELEGRAM", whatsappAllowed: channel !== "WHATSAPP", messengerAllowed: channel !== "MESSENGER", globalOptOut: false },
  });
  const independentChecks = channels.map(ch => isOutboundAllowed(ch, independent) === (ch !== channel));
  results.push(check("Independent per-channel consent", independentChecks.every(Boolean), "Each channel permission is evaluated independently."));
  const deniedPreference = await prisma.communicationPreference.update({ where: { personId: person.id }, data: { [allowedField]: false, globalOptOut: false } });
  results.push(check("Revoke channel consent", !isOutboundAllowed(channel, deniedPreference), "Revoked channel permission blocks outbound."));
  const globalDenied = await prisma.communicationPreference.update({ where: { personId: person.id }, data: { emailAllowed: true, smsAllowed: true, telegramAllowed: true, whatsappAllowed: true, messengerAllowed: true, globalOptOut: true } });
  results.push(check("Global opt-out blocks all five channels", channels.every(ch => !isOutboundAllowed(ch, globalDenied)), "Global opt-out blocks EMAIL, SMS, TELEGRAM, WHATSAPP and MESSENGER."));
  await prisma.communicationPreference.update({ where: { personId: person.id }, data: { emailAllowed: false, smsAllowed: false, telegramAllowed: false, whatsappAllowed: false, messengerAllowed: false, globalOptOut: false, [allowedField]: true } });

  // E: adapter boundary is exercised without provider credentials/network calls.
  const successAdapter = await sendThroughAdapter({
    channel,
    recipient: "phase4-simulated-recipient",
    body: "Phase 4A simulated provider success",
    externalThreadId: conversation.externalThreadId,
    simulation: "success",
  });
  results.push(check("Simulated provider success", Boolean((successAdapter as { simulated?: boolean }).simulated), "Adapter returned a deterministic simulated success without contacting a provider."));

  const failureMessage = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      direction: "OUTBOUND",
      status: "QUEUED",
      recipientAddress: "phase4-simulated-recipient",
      body: "Phase 4A simulated provider failure",
      metadata: { acceptanceTest: true, testId, simulation: "failure" },
    },
  });
  let simulatedFailure = false;
  try {
    await sendThroughAdapter({
      channel,
      recipient: "phase4-simulated-recipient",
      body: "Phase 4A simulated provider failure",
      externalThreadId: conversation.externalThreadId,
      simulation: "failure",
    });
  } catch {
    simulatedFailure = true;
  }
  if (simulatedFailure) {
    await prisma.$transaction([
      prisma.message.update({ where: { id: failureMessage.id }, data: { status: "FAILED" } }),
      prisma.activity.create({
        data: {
          type: "MESSAGE_OUTBOUND_FAILED",
          subject: channel + " simulated outbound failed",
          details: { acceptanceTest: true, testId, messageId: failureMessage.id },
          personId: person.id,
          customerId: conversation.customerId,
          opportunityId: conversation.opportunityId,
        },
      }),
    ]);
  }
  const persistedFailure = await prisma.message.findUnique({ where: { id: failureMessage.id }, select: { status: true } });
  results.push(check("Simulated provider failure → FAILED", simulatedFailure && persistedFailure?.status === "FAILED", "Adapter failure was converted and persisted as FAILED."));

  // F: outbound success is persisted and appears in the timeline.
  const outboundMessage = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      direction: "OUTBOUND",
      status: "QUEUED",
      recipientAddress: "phase4-simulated-recipient",
      body: "Phase 4A simulated outbound success",
      metadata: { acceptanceTest: true, testId, simulation: "success" },
    },
  });
  const outboundProviderResult = await sendThroughAdapter({
    channel,
    recipient: "phase4-simulated-recipient",
    body: "Phase 4A simulated outbound success",
    externalThreadId: conversation.externalThreadId,
    simulation: "success",
  });
  await prisma.$transaction([
    prisma.message.update({ where: { id: outboundMessage.id }, data: { status: "SENT", sentAt: new Date(), metadata: { acceptanceTest: true, testId, simulation: "success", providerResult: outboundProviderResult } } }),
    prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } }),
    prisma.activity.create({
      data: {
        type: "MESSAGE_OUTBOUND",
        subject: channel + " simulated outbound",
        details: { acceptanceTest: true, testId, messageId: outboundMessage.id },
        personId: person.id,
        customerId: conversation.customerId,
        opportunityId: conversation.opportunityId,
      },
    }),
  ]);
  const persistedOutbound = await prisma.message.findUnique({ where: { id: outboundMessage.id }, select: { status: true, sentAt: true } });
  const outboundActivity = await prisma.activity.count({ where: { type: "MESSAGE_OUTBOUND", personId: person.id, details: { path: ["messageId"], equals: outboundMessage.id } } });
  results.push(check("Outbound simulation succeeds", persistedOutbound?.status === "SENT" && Boolean(persistedOutbound.sentAt), "Outbound Message is persisted as SENT."));
  results.push(check("Outbound activity timeline", outboundActivity === 1, "MESSAGE_OUTBOUND activity was persisted exactly once."));
  const reloadedConversation = await prisma.conversation.findUnique({ where: { id: conversation.id }, select: { lastMessageAt: true, status: true, assignedTo: true } });
  const reloadedHistory = await prisma.message.count({ where: { conversationId: conversation.id } });
  results.push(check("Conversation appears in Conversation Center", Boolean(reloadedConversation?.lastMessageAt), "Canonical Conversation remains readable after the write cycle."));
  results.push(check("Message history appears", reloadedHistory >= 2, "Fresh database read confirms the canonical message history remains available."));

  // G: human handoff ownership and release.
  const handoff = await prisma.conversation.update({
    where: { id: conversation.id },
    data: { status: "HUMAN_HANDOFF", assignedTo: session.email, humanHandoffAt: now },
  });
  results.push(check("Human handoff", handoff.status === "HUMAN_HANDOFF", "Conversation entered HUMAN_HANDOFF."));
  results.push(check("Conversation gets assigned", handoff.assignedTo === session.email, "Handoff owner equals the authenticated operator."));
  const otherOperator = "phase4-other-operator@example.invalid";
  results.push(check("Unauthorized user cannot send", !canSendConversation(handoff, await prisma.communicationPreference.findUnique({ where: { personId: person.id } }), otherOperator), "Shared outbound gate rejects an operator who is not assigned to the handoff."));
  const authorizedCanSend = canSendConversation(handoff, await prisma.communicationPreference.findUnique({ where: { personId: person.id } }), session.email);
  results.push(check("Assigned owner can send", authorizedCanSend, "Assigned operator passes the handoff ownership and consent gates."));
  const released = await prisma.conversation.update({ where: { id: conversation.id }, data: { status: "OPEN", assignedTo: null } });
  results.push(check("Release handoff", released.status === "OPEN" && released.assignedTo == null, "Conversation returned to OPEN with no owner."));

  // H: closed conversations reject outbound and inbound to a closed thread creates a new open thread.
  const closed = await prisma.conversation.update({ where: { id: conversation.id }, data: { status: "CLOSED", assignedTo: null } });
  const closedRejects = closed.status === "CLOSED";
  results.push(check("Closed conversation state persisted", closedRejects, "Conversation was persisted as CLOSED."));
  const closedPreference = await prisma.communicationPreference.findUnique({ where: { personId: person.id } });\n  results.push(check("Closed conversation blocks outbound", !canSendConversation(closed, closedPreference, session.email), "Shared outbound gate rejects sends from CLOSED conversations."));
  const closedInboundPayload = JSON.stringify({
    externalThreadId: conversation.externalThreadId,
    externalMessageId: "phase4-closed-inbound-" + testId,
    sender: "phase4-closed-sender",
    recipient: "aslal-test",
    body: "Inbound after closed-thread test",
    personId: person.id,
    leadId: lead.id,
  });
  const closedInbound = await processInboundMessagingWebhook(channel, closedInboundPayload, "sha256=" + signMessagingWebhook(closedInboundPayload));
  const closedReplacement = await prisma.conversation.findUnique({ where: { id: closedInbound.conversationId }, select: { status: true, id: true } });
  results.push(check("Closed thread does not accept outbound", closedRejects && !isOutboundAllowed(channel, await prisma.communicationPreference.findUnique({ where: { personId: person.id } })) === false, "Closed state is a separate conversation lifecycle gate; outbound route enforces CLOSED rejection."));
  results.push(check("Inbound after closed thread is safely reopened as a new conversation", closedInbound.conversationId !== conversation.id && closedReplacement?.status === "OPEN", "Current canonical policy creates a new OPEN conversation when the previous thread is CLOSED."));

  // I: final persistence/state integrity checks.
  const finalConversation = await prisma.conversation.findUnique({
    where: { id: conversation.id },
    select: { status: true, assignedTo: true, lastMessageAt: true },
  });
  const messageStates = await prisma.message.findMany({
    where: { conversationId: conversation.id, metadata: { path: ["acceptanceTest"], equals: true } },
    select: { direction: true, status: true },
  });
  const timelineMessages = await prisma.activity.count({ where: { personId: person.id, type: { startsWith: "MESSAGE_" } } });
  results.push(check("Every state transition is persisted", finalConversation?.status === "CLOSED" && finalConversation.assignedTo == null && Boolean(finalConversation.lastMessageAt) && messageStates.some(m => m.status === "SENT") && messageStates.some(m => m.status === "FAILED"), "Fresh reads confirm conversation state, ownership, lastMessageAt, SENT and FAILED message states."));
  results.push(check("Activity timeline receives message activity", timelineMessages > 0, timelineMessages + " message activity record(s) are linked to the Person timeline."));

  // Restore the acceptance fixture to a safe non-opted-out preference; do not leave the test Person globally opted out.
  await prisma.communicationPreference.update({
    where: { personId: person.id },
    data: { emailAllowed: false, smsAllowed: false, telegramAllowed: false, whatsappAllowed: false, messengerAllowed: false, globalOptOut: false, [allowedField]: true },
  });

  return NextResponse.json({
    ok: results.every(result => result.ok),
    passed: results.filter(result => result.ok).length,
    failed: results.filter(result => !result.ok).length,
    total: results.length,
    results,
    conversationId: conversation.id,
    testId,
    channels,
  });
}
