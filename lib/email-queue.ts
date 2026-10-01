import { prisma, EmailMessageType, EmailOutboxStatus, EmailAttemptStatus, EmailEventType } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { sendEmail } from "@/lib/email";

const RETRY_MINUTES = [5, 30, 120, 720, 1440];

function json(value: unknown) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function retryAt(attempt: number) {
  const minutes = RETRY_MINUTES[Math.min(Math.max(attempt - 1, 0), RETRY_MINUTES.length - 1)];
  return new Date(Date.now() + minutes * 60_000);
}

export type QueueEmailInput = {
  workspaceId: string;
  recipientAddress: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  messageType?: EmailMessageType;
  templateKey?: string | null;
  leadId?: string | null;
  personId?: string | null;
  customerId?: string | null;
  opportunityId?: string | null;
  messageId?: string | null;
  senderAddress?: string | null;
  replyToAddress?: string | null;
  createdBy?: string | null;
  nextAttemptAt?: Date | null;
};

export async function queueEmail(input: QueueEmailInput) {
  const id = randomUUID();
  const messageType = input.messageType ?? EmailMessageType.TRANSACTIONAL;
  if (!input.recipientAddress.trim()) throw new Error("Email recipient is required.");
  const row = await prisma.emailOutbox.create({
    data: {
      id,
      workspaceId: input.workspaceId,
      leadId: input.leadId ?? null,
      personId: input.personId ?? null,
      customerId: input.customerId ?? null,
      opportunityId: input.opportunityId ?? null,
      messageId: input.messageId ?? null,
      status: EmailOutboxStatus.QUEUED,
      messageType,
      templateKey: input.templateKey ?? null,
      recipientAddress: input.recipientAddress.trim().toLowerCase(),
      senderAddress: input.senderAddress ?? null,
      replyToAddress: input.replyToAddress ?? null,
      subject: input.subject.replace(/[\r\n]+/g, " ").trim().slice(0, 250),
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      originalSubject: input.subject.replace(/[\r\n]+/g, " ").trim().slice(0, 250),
      originalHtmlBody: input.htmlBody,
      originalTextBody: input.textBody,
      createdBy: input.createdBy ?? "system",
      nextAttemptAt: input.nextAttemptAt ?? new Date(),
    },
  });
  return row;
}

export async function recordEmailEvent(outboxId: string, eventType: EmailEventType, metadata?: unknown, providerEventId?: string | null) {
  return prisma.emailEvent.create({
    data: {
      id: randomUUID(),
      outboxId,
      eventType,
      providerEventId: providerEventId ?? null,
      metadata: json(metadata),
    },
  });
}

async function claim(id: string) {
  const result = await prisma.emailOutbox.updateMany({
    where: {
      id,
      status: { in: [EmailOutboxStatus.QUEUED, EmailOutboxStatus.FAILED] },
      attemptCount: { lt: 3 },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }],
    },
    data: { status: EmailOutboxStatus.SENDING, lastAttemptAt: new Date() },
  });
  return result.count === 1;
}

export async function dispatchEmail(id: string) {
  if (!(await claim(id))) return { status: "SKIPPED" as const };
  const row = await prisma.emailOutbox.findUnique({ where: { id } });
  if (!row) return { status: "MISSING" as const };

  const attemptNumber = row.attemptCount + 1;
  try {
    const result = await sendEmail({
      recipient: row.recipientAddress,
      body: row.textBody,
      html: row.htmlBody,
      subject: row.subject,
      inReplyTo: null,
      references: [],
    });
    if (!result.accepted?.length) throw new Error(result.rejected?.join(", ") || "SMTP did not accept the message.");
    const providerMessageId = typeof result.messageId === "string" ? result.messageId : null;
    await prisma.$transaction([
      prisma.emailDeliveryAttempt.create({
        data: {
          id: randomUUID(),
          outboxId: row.id,
          attemptNumber,
          status: EmailAttemptStatus.SENT,
          provider: result.provider,
          providerMessageId,
          response: json({ accepted: result.accepted, rejected: result.rejected, response: result.response }),
        },
      }),
      prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: EmailOutboxStatus.SENT,
          attemptCount: attemptNumber,
          provider: result.provider,
          providerMessageId,
          providerResponse: json({ accepted: result.accepted, rejected: result.rejected, response: result.response }),
          failureReason: null,
          nextAttemptAt: null,
          sentAt: new Date(),
        },
      }),
      prisma.emailEvent.create({
        data: { id: randomUUID(), outboxId: row.id, eventType: EmailEventType.SENT, providerEventId: providerMessageId, metadata: json({ provider: result.provider }) },
      }),
    ]);
    return { status: "SENT" as const, messageId: row.id, providerMessageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email provider error.";
    const exhausted = attemptNumber >= Math.max(1, row.maxAttempts);
    const next = exhausted ? null : retryAt(attemptNumber);
    await prisma.$transaction([
      prisma.emailDeliveryAttempt.create({
        data: { id: randomUUID(), outboxId: row.id, attemptNumber, status: EmailAttemptStatus.FAILED, provider: "smtp", error: message },
      }),
      prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: EmailOutboxStatus.FAILED,
          attemptCount: attemptNumber,
          failureReason: message,
          nextAttemptAt: next,
        },
      }),
      prisma.emailEvent.create({
        data: { id: randomUUID(), outboxId: row.id, eventType: EmailEventType.FAILED, metadata: json({ error: message, attemptNumber, exhausted }) },
      }),
    ]);
    return { status: "FAILED" as const, messageId: row.id, exhausted, nextAttemptAt: next };
  }
}

export async function processEmailQueue(limit = 25) {
  const now = new Date();
  const rows = await prisma.emailOutbox.findMany({
    where: {
      status: { in: [EmailOutboxStatus.QUEUED, EmailOutboxStatus.FAILED] },
      attemptCount: { lt: 3 },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: Math.max(1, Math.min(100, limit)),
    select: { id: true },
  });
  const results = [];
  for (const row of rows) results.push(await dispatchEmail(row.id));
  return results;
}

export async function retryEmail(id: string) {
  const row = await prisma.emailOutbox.findUnique({ where: { id }, select: { status: true } });
  if (!row) throw new Error("Email message not found.");
  if (row.status !== EmailOutboxStatus.FAILED && row.status !== EmailOutboxStatus.DRAFT) throw new Error("Only failed or draft messages can be sent.");
  await prisma.emailOutbox.update({ where: { id }, data: { status: EmailOutboxStatus.QUEUED, attemptCount: 0, nextAttemptAt: new Date(), failureReason: null } });
  return dispatchEmail(id);
}

export async function discardEmail(id: string) {
  return prisma.emailOutbox.updateMany({
    where: { id, status: { in: [EmailOutboxStatus.DRAFT, EmailOutboxStatus.QUEUED, EmailOutboxStatus.FAILED] } },
    data: { status: EmailOutboxStatus.DISCARDED, discardedAt: new Date(), nextAttemptAt: null },
  });
}

export async function queueLeadTemplateEmail(input: {
  leadId: string;
  templateKey: string;
  message?: string;
  contactUrl?: string;
  createdBy?: string;
  messageType?: EmailMessageType;
  delayMinutes?: number;
}) {
  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    include: { person: { include: { communicationPreference: true } }, productInterests: { include: { product: true }, orderBy: { interestScore: "desc" }, take: 1 } },
  });
  if (!lead?.email) return { queued: false as const, skipped: "no-email" as const };
  if (!lead.workspaceId) return { queued: false as const, skipped: "no-workspace" as const };
  const template = await prisma.emailTemplate.findUnique({ where: { templateKey: input.templateKey } });
  if (!template?.active) return { queued: false as const, skipped: "template-disabled" as const };
  const messageType = input.messageType ?? (template.transactional ? EmailMessageType.TRANSACTIONAL : EmailMessageType.MARKETING);
  const preference = lead.person?.communicationPreference;
  if (preference?.globalOptOut) return { queued: false as const, skipped: "global-opt-out" as const };
  if (messageType === EmailMessageType.MARKETING && !preference?.emailAllowed) return { queued: false as const, skipped: "marketing-consent-required" as const };
  const serviceOrProduct = lead.productInterests[0]?.product.name || lead.leadCategory || "your growth request";
  const values = {
    name: lead.name,
    email: lead.email,
    companyOrType: lead.company || lead.businessType || "Business request",
    serviceOrProduct,
    message: input.message || lead.message || "",
    leadId: lead.id,
    contactUrl: input.contactUrl || "",
    logoUrl: "",
    location: "",
    phone: "",
    unsubscribeUrl: input.contactUrl || "",
  };
  const { renderTemplate } = await import("@/lib/email-templates");
  const subject = renderTemplate(template.subjectTemplate, values).replace(/[\r\n]+/g, " ").trim().slice(0, 250);
  const htmlBody = renderTemplate(template.htmlTemplate, values, true);
  const textBody = renderTemplate(template.textTemplate, values);
  const outbox = await queueEmail({
    workspaceId: lead.workspaceId,
    leadId: lead.id,
    personId: lead.personId,
    recipientAddress: lead.email,
    subject,
    htmlBody,
    textBody,
    templateKey: template.templateKey,
    messageType,
    createdBy: input.createdBy || "automation",
    nextAttemptAt: input.delayMinutes && input.delayMinutes > 0 ? new Date(Date.now() + Math.min(7 * 24 * 60, input.delayMinutes) * 60_000) : new Date(),
  });
  return { queued: true as const, outboxId: outbox.id };
}

export async function queuePartnerVerificationEmail(input:{workspaceId:string;recipientAddress:string;name:string;verificationUrl:string;createdBy?:string}) {
  const template=await prisma.emailTemplate.findUnique({where:{templateKey:"partner.account.verify"}});
  if(!template?.active) throw new Error("Partner verification email template is not active.");
  const {renderTemplate}=await import("@/lib/email-templates");
  const values={name:input.name,verificationUrl:input.verificationUrl};
  return queueEmail({
    workspaceId:input.workspaceId,
    recipientAddress:input.recipientAddress,
    subject:renderTemplate(template.subjectTemplate,values).replace(/[\r\n]+/g," ").trim().slice(0,250),
    htmlBody:renderTemplate(template.htmlTemplate,values,true),
    textBody:renderTemplate(template.textTemplate,values),
    templateKey:template.templateKey,
    messageType:EmailMessageType.TRANSACTIONAL,
    createdBy:input.createdBy||"partner-registration",
  });
}
