import { loadEnvConfig } from "@next/env";
import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { handleConversationInbound } from "@/lib/automation";

type RuntimeEnvState = {
  loadedFiles: string[];
};

let runtimeEnvState: RuntimeEnvState = { loadedFiles: [] };

function loadRuntimeEnv() {
  const executableDir = process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : null;
  const candidates = [
    process.cwd(),
    executableDir,
    executableDir ? path.dirname(executableDir) : null,
    executableDir ? path.dirname(path.dirname(executableDir)) : null,
  ].filter((value): value is string => Boolean(value));

  const uniqueCandidates = [...new Set(candidates)];
  const loadedFiles = new Set<string>();

  for (const directory of uniqueCandidates) {
    const result = loadEnvConfig(directory, process.env.NODE_ENV !== "production");
    for (const file of result.loadedEnvFiles ?? []) loadedFiles.add(file.path);
  }

  runtimeEnvState = { loadedFiles: [...loadedFiles] };
}

loadRuntimeEnv();

function envValue(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

function requiredEnv(name: string) {
  const value = envValue(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function smtpHost() {
  return envValue("SMTP_HOST").trim() || envValue("MAIL_SERVER_HOST").trim() || requiredEnv("SMTP_HOST");
}

function imapHost() {
  return envValue("IMAP_HOST").trim() || envValue("MAIL_SERVER_HOST").trim() || requiredEnv("IMAP_HOST");
}

function smtpPort() {
  return Number(envValue("SMTP_PORT") || "587");
}

function imapPort() {
  return Number(envValue("IMAP_PORT") || "993");
}

function smtpTransport() {
  return nodemailer.createTransport({
    host: smtpHost(),
    port: smtpPort(),
    secure: envValue("SMTP_SECURE") === "true",
    requireTLS: envValue("SMTP_REQUIRE_TLS") !== "false",
    // Emerald/Exim advertises both PLAIN and LOGIN. Force LOGIN because the
    // mailbox has been independently verified with AUTH LOGIN on both 465 and 587.
    authMethod: "LOGIN",
    auth: {
      user: envValue("SMTP_USER").trim() || requiredEnv("SMTP_USER"),
      // Do not trim passwords: spaces can legitimately be part of a mailbox password.
      pass: requiredEnv("SMTP_PASSWORD"),
    },
  });
}

export type EmailProviderConfig = {
  smtp: {
    configured: boolean;
    host: string;
    port: number;
    user: string;
    passwordConfigured: boolean;
    secure: boolean;
    requireTLS: boolean;
  };
  imap: {
    configured: boolean;
    host: string;
    port: number;
    user: string;
    passwordConfigured: boolean;
    secure: boolean;
    mailbox: string;
  };
  envSources: {
    cwd: string;
    executableDir: string | null;
    loadedFiles: string[];
  };
  runtimeFingerprints: {
    smtpPassword: { configured: boolean; length: number; fingerprint: string | null };
    imapPassword: { configured: boolean; length: number; fingerprint: string | null };
  };
};

export function getEmailProviderConfig(): EmailProviderConfig {
  const smtpUser = envValue("SMTP_USER").trim();
  const smtpPassword = envValue("SMTP_PASSWORD");
  const imapUser = envValue("IMAP_USER").trim();
  const imapPassword = envValue("IMAP_PASSWORD");
  const sharedHost = envValue("MAIL_SERVER_HOST").trim();

  const smtp = {
    configured: Boolean((envValue("SMTP_HOST").trim() || sharedHost) && smtpUser && smtpPassword),
    host: envValue("SMTP_HOST").trim() || sharedHost,
    port: smtpPort(),
    user: smtpUser,
    passwordConfigured: Boolean(smtpPassword),
    secure: envValue("SMTP_SECURE") === "true",
    requireTLS: envValue("SMTP_REQUIRE_TLS") !== "false",
  };

  const imap = {
    configured: Boolean((envValue("IMAP_HOST").trim() || sharedHost) && imapUser && imapPassword),
    host: envValue("IMAP_HOST").trim() || sharedHost,
    port: imapPort(),
    user: imapUser,
    passwordConfigured: Boolean(imapPassword),
    secure: envValue("IMAP_SECURE") !== "false",
    mailbox: envValue("IMAP_MAILBOX") || "INBOX",
  };

  return {
    smtp,
    imap,
    envSources: {
      cwd: process.cwd(),
      executableDir: process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : null,
      loadedFiles: runtimeEnvState.loadedFiles,
    },
    runtimeFingerprints: {
      smtpPassword: {
        configured: Boolean(smtpPassword),
        length: smtpPassword.length,
        fingerprint: secretFingerprint(smtpPassword),
      },
      imapPassword: {
        configured: Boolean(imapPassword),
        length: imapPassword.length,
        fingerprint: secretFingerprint(imapPassword),
      },
    },
  };
}

function secretFingerprint(value: string) {
  if (!value) return null;
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

function formatProviderError(error: unknown) {
  if (error && typeof error === "object") {
    const details = error as { message?: unknown; code?: unknown; command?: unknown; responseCode?: unknown; response?: unknown };
    const message = typeof details.message === "string" ? details.message : "Provider connection failed";
    const parts = [message];
    if (typeof details.code === "string") parts.push(`code=${details.code}`);
    if (typeof details.command === "string") parts.push(`command=${details.command}`);
    if (typeof details.responseCode === "number") parts.push(`responseCode=${details.responseCode}`);
    if (typeof details.response === "string" && details.response && !parts.some((part) => part.includes(details.response as string))) {
      parts.push(`response=${details.response}`);
    }
    return parts.join(" · ");
  }
  return "Provider connection failed";
}

export async function verifyEmailProviders() {
  const config = getEmailProviderConfig();

  const smtp = {
    ...config.smtp,
    ok: false,
    error: undefined as string | undefined,
  };

  if (!config.smtp.configured) {
    smtp.error = "SMTP configuration is incomplete.";
  } else {
    const transporter = smtpTransport();
    try {
      await transporter.verify();
      smtp.ok = true;
    } catch (error) {
      smtp.error = formatProviderError(error);
    } finally {
      transporter.close();
    }
  }

  const imap = {
    ...config.imap,
    ok: false,
    error: undefined as string | undefined,
  };

  if (!config.imap.configured) {
    imap.error = "IMAP configuration is incomplete.";
  } else {
    const client = new ImapFlow({
      host: imap.host,
      port: imap.port,
      secure: imap.secure,
      auth: {
        user: imap.user,
        pass: requiredEnv("IMAP_PASSWORD"),
      },
      logger: false,
    });

    try {
      await client.connect();
      imap.ok = true;
    } catch (error) {
      imap.error = formatProviderError(error);
    } finally {
      await client.logout().catch(() => client.close());
    }
  }

  return {
    smtp,
    imap,
    envSources: config.envSources,
    runtimeFingerprints: config.runtimeFingerprints,
  };
}

export async function sendEmail(params: {
  recipient: string;
  body: string;
  html?: string;
  subject?: string;
  inReplyTo?: string | null;
  references?: string[];
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}) {
  const from = envValue("SMTP_FROM").trim() || requiredEnv("SMTP_USER");
  const transporter = smtpTransport();

  try {
    const info = await transporter.sendMail({
      from,
      to: params.recipient,
      subject: params.subject || "Aslal Digital Solutions",
      text: params.body,
      ...(params.html ? { html: params.html } : {}),
      ...(params.inReplyTo ? { inReplyTo: params.inReplyTo } : {}),
      ...(params.references?.length ? { references: params.references } : {}),
      ...(params.attachments?.length ? { attachments: params.attachments } : {}),
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
      recipientAddress: recipient || (envValue("SMTP_FROM") || envValue("SMTP_USER") || null),
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

  await handleConversationInbound(conversation.leadId).catch((error) => {
    console.error("INBOUND_AUTOMATION_CANCEL_ERROR", error);
  });

  return {
    skipped: false,
    conversationId: conversation.id,
    messageId: message.id,
  };
}

export async function pollEmailInbox() {
  const client = new ImapFlow({
    host: imapHost(),
    port: imapPort(),
    secure: envValue("IMAP_SECURE") !== "false",
    auth: {
      user: envValue("IMAP_USER").trim() || requiredEnv("IMAP_USER"),
      pass: requiredEnv("IMAP_PASSWORD"),
    },
    logger: false,
  });

  const results: Array<Record<string, unknown>> = [];
  await client.connect();

  try {
    const lock = await client.getMailboxLock(envValue("IMAP_MAILBOX") || "INBOX");
    try {
      const searchResult = await client.search({ seen: false });
      const unseen = searchResult === false ? [] : searchResult;

      for (const uid of unseen) {
        try {
          const message = await client.fetchOne(uid, { source: true });
          if (message === false || !message.source) {
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
