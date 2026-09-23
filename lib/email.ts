import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

const smtpPort = Number(process.env.SMTP_PORT || "587");
const imapPort = Number(process.env.IMAP_PORT || "993");

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function smtpTransport() {
  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: process.env.SMTP_REQUIRE_TLS !== "false",
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASSWORD"),
    },
  });
}

export async function sendEmail(params: {
  recipient: string;
  body: string;
  subject?: string;
  inReplyTo?: string | null;
  references?: string[];
}) {
  const from = process.env.SMTP_FROM || requiredEnv("SMTP_USER");
  const transporter = smtpTransport();

  try {
    const info = await transporter.sendMail({
      from,
      to: params.recipient,
      subject: params.subject || "Aslal Digital Solutions",
      text: params.body,
      ...(params.inReplyTo ? { inReplyTo: params.inReplyTo } : {}),
      ...(params.references?.length ? { references: params.references } : {}),
    });

    return {
      provider: "smtp",
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } finally {
    transporter.close();
  }
}

function emailAddress(value: ParsedMail["from"] | ParsedMail["to"]) {
  return value?.value?.[0]?.address?.trim().toLowerCase() || "";
}

function extractReferences(mail: ParsedMail) {
  const values: string[] = [];
  if (mail.inReplyTo) values.push(mail.inReplyTo);
  if (mail.references) {
    const references = Array.isArray(mail.references) ? mail.references : [mail.references];
    values.push(...references);
  }
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

async function findConversation(mail: ParsedMail, sender: string) {
  const references = extractReferences(mail);

  if (references.length) {
    const referencedMessage = await prisma.message.findFirst({
      where: { externalMessageId: { in: references } },
      select: { conversationId: true },
    });

    if (referencedMessage) {
      const referencedConversation = await prisma.conversation.findUnique({
        where: { id: referencedMessage.conversationId },
      });
      if (referencedConversation?.status !== "CLOSED") return referencedConversation;
    }
  }

  const person = await prisma.person.findFirst({
    where: { email: { equals: sender } },
  });

  if (!person) return null;

  return prisma.conversation.findFirst({
    where: {
      channel: "EMAIL",
      personId: person.id,
      status: { in: ["OPEN", "HUMAN_HANDOFF"] },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });
}

async function attachIdentity(sender: string) {
  const person = await prisma.person.findFirst({
    where: { email: { equals: sender } },
    select: { id: true },
  });
  if (!person) return { personId: null, leadId: null, customerId: null };

  const [lead, customer] = await Promise.all([
    prisma.lead.findFirst({
      where: { personId: person.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
    prisma.customer.findFirst({
      where: { personId: person.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
  ]);

  return {
    personId: person.id,
    leadId: lead?.id ?? null,
    customerId: customer?.id ?? null,
  };
}

async function persistInbound(mail: ParsedMail) {
  const sender = emailAddress(mail.from);
  const recipient = emailAddress(mail.to);
  const externalMessageId = mail.messageId?.trim() || null;

  if (!sender || !externalMessageId) {
    return { skipped: true, reason: "missing sender or Message-ID" };
  }

  const existing = await prisma.message.findFirst({
    where: { externalMessageId },
    select: { id: true },
  });
  if (existing) return { skipped: true, reason: "duplicate", messageId: existing.id };

  let conversation = await findConversation(mail, sender);
  if (!conversation) {
    const identity = await attachIdentity(sender);
    conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        channel: "EMAIL",
        status: "OPEN",
        externalThreadId: externalMessageId,
        personId: identity.personId,
        leadId: identity.leadId,
        customerId: identity.customerId,
      },
    });
  }

  const body = (mail.text || mail.html?.replace(/<[^>]*>/g, " ") || "").trim().slice(0, 100000);
  const subject = (mail.subject || "Email message").trim().slice(0, 190);

  const message = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      direction: "INBOUND",
      status: "RECEIVED",
      externalMessageId,
      senderAddress: sender,
      recipientAddress: recipient || (process.env.SMTP_FROM || process.env.SMTP_USER || null),
      body,
      metadata: {
        subject,
        inReplyTo: mail.inReplyTo || null,
        references: extractReferences(mail),
        source: "imap",
      },
    },
  });

  await prisma.$transaction([
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    }),
    prisma.activity.create({
      data: {
        type: "MESSAGE_INBOUND",
        subject: "EMAIL inbound message",
        details: { messageId: message.id, externalMessageId, subject },
        personId: conversation.personId,
        customerId: conversation.customerId,
        opportunityId: conversation.opportunityId,
      },
    }),
  ]);

  return {
    skipped: false,
    conversationId: conversation.id,
    messageId: message.id,
  };
}

export async function pollEmailInbox() {
  const client = new ImapFlow({
    host: requiredEnv("IMAP_HOST"),
    port: imapPort,
    secure: process.env.IMAP_SECURE !== "false",
    auth: {
      user: requiredEnv("IMAP_USER"),
      pass: requiredEnv("IMAP_PASSWORD"),
    },
    logger: false,
  });

  const results: Array<Record<string, unknown>> = [];
  await client.connect();

  try {
    const lock = await client.getMailboxLock(process.env.IMAP_MAILBOX || "INBOX");
    try {
      const unseen = await client.search({ seen: false });

      for (const uid of unseen) {
        try {
          const message = await client.fetchOne(uid, { source: true });
          if (!message?.source) {
            results.push({ uid, skipped: true, reason: "empty message" });
            continue;
          }

          const parsed = await simpleParser(message.source);
          const result = await persistInbound(parsed);

          if (!result.skipped || result.reason === "duplicate") {
            await client.messageFlagsAdd(uid, ["\\Seen"]);
          }

          results.push({ uid, ...result });
        } catch (error) {
          results.push({
            uid,
            skipped: true,
            reason: error instanceof Error ? error.message : "email processing failed",
          });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => client.close());
  }

  return { processed: results.length, results };
}
