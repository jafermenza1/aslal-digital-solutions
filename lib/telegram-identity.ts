import { createHmac, createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type TelegramUser = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type ValidatedTelegramInitData = {
  user: TelegramUser;
  authDate: number;
  startParam?: string;
  queryId?: string;
  raw: string;
};

function botToken() {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "");
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

function safeHexEqual(a: string, b: string) {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function validateTelegramInitData(raw: string, maxAgeSeconds = 86400): ValidatedTelegramInitData {
  const params = new URLSearchParams(raw);
  const hash = params.get("hash") || "";
  if (!hash) throw new Error("Telegram authentication hash is missing");

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => key + "=" + value)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken()).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (!safeHexEqual(hash, expected)) throw new Error("Invalid Telegram authentication data");

  const authDate = Number(params.get("auth_date") || 0);
  if (!Number.isFinite(authDate) || authDate <= 0 || Math.abs(Date.now() / 1000 - authDate) > maxAgeSeconds) {
    throw new Error("Telegram authentication data has expired");
  }

  let user: TelegramUser;
  try { user = JSON.parse(params.get("user") || "") as TelegramUser; } catch { throw new Error("Telegram user data is invalid"); }
  if (!user?.id) throw new Error("Telegram user identity is missing");

  return {
    user,
    authDate,
    startParam: params.get("start_param") || undefined,
    queryId: params.get("query_id") || undefined,
    raw,
  };
}

type SyncInput = {
  workspaceId: string;
  initData?: string;
  user?: TelegramUser;
  chatId?: string;
  startParam?: string | null;
  event?: string;
  productSlug?: string | null;
  metadata?: unknown;
  auth?: boolean;
};

export function validateTelegramLoginData(params: URLSearchParams, maxAgeSeconds = 86400) {
  const hash = params.get("hash") || "";
  if (!hash) throw new Error("Telegram login hash is missing");
  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => key + "=" + value)
    .join("\n");
  const secretKey = createHash("sha256").update(botToken()).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (!safeHexEqual(hash, expected)) throw new Error("Invalid Telegram login data");
  const authDate = Number(params.get("auth_date") || 0);
  if (!Number.isFinite(authDate) || authDate <= 0 || Math.abs(Date.now() / 1000 - authDate) > maxAgeSeconds) throw new Error("Telegram login data has expired");
  const id = params.get("id") || "";
  if (!id) throw new Error("Telegram user ID is missing");
  return {
    user: {
      id,
      first_name: params.get("first_name") || undefined,
      last_name: params.get("last_name") || undefined,
      username: params.get("username") || undefined,
      photo_url: params.get("photo_url") || undefined,
    } satisfies TelegramUser,
    authDate,
  };
}

export async function syncTelegramIdentity(input: SyncInput) {
  const validated = input.initData ? validateTelegramInitData(input.initData) : null;
  const user = validated?.user || input.user;
  if (!user?.id) throw new Error("Telegram user identity is required");

  const telegramUserId = String(user.id);
  const chatId = input.chatId || telegramUserId;
  const startParam = input.startParam ?? validated?.startParam ?? null;

  const existing = await prisma.telegramIdentity.findUnique({
    where: { workspaceId_telegramUserId: { workspaceId: input.workspaceId, telegramUserId } },
  });

  let visitorId = existing?.visitorId || null;
  if (!visitorId) {
    const visitor = await prisma.visitor.create({
      data: {
        id: randomUUID(),
        anonymousId: randomUUID(),
        firstSource: "telegram",
        firstMedium: "telegram",
        firstCampaign: startParam || null,
      },
      select: { id: true },
    });
    visitorId = visitor.id;
  }

  const [staff, partner, leadByChat, leadByUsername] = await Promise.all([
    prisma.user.findFirst({ where: { telegramChatId: chatId, active: true, workspaceUsers: { some: { workspaceId: input.workspaceId } } }, select: { id: true } }),
    prisma.partner.findFirst({ where: { workspaceId: input.workspaceId, telegramChatId: chatId }, select: { id: true } }),
    prisma.lead.findFirst({ where: { workspaceId: input.workspaceId, telegramChatId: chatId }, orderBy: { updatedAt: "desc" }, select: { id: true, personId: true } }),
    user.username ? prisma.lead.findFirst({ where: { workspaceId: input.workspaceId, telegramUsername: user.username }, orderBy: { updatedAt: "desc" }, select: { id: true, personId: true } }) : null,
  ]);

  const lead = leadByChat || leadByUsername;
  let personId = lead?.personId || existing?.personId || null;
  let customerId = existing?.customerId || null;

  if (personId && !customerId) {
    const customer = await prisma.customer.findFirst({ where: { workspaceId: input.workspaceId, personId }, select: { id: true } });
    customerId = customer?.id || null;
  }

  if (lead?.id) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        telegramChatId: chatId,
        telegramUsername: user.username || null,
        ...(user.first_name || user.last_name ? { name: ([user.first_name, user.last_name].filter(Boolean).join(" ") || undefined) } : {}),
      },
    }).catch(() => null);
  }

  const identity = await prisma.telegramIdentity.upsert({
    where: { workspaceId_telegramUserId: { workspaceId: input.workspaceId, telegramUserId } },
    update: {
      telegramChatId: chatId,
      telegramUsername: user.username || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      languageCode: user.language_code || null,
      photoUrl: user.photo_url || null,
      visitorId,
      personId,
      leadId: lead?.id || existing?.leadId || null,
      customerId,
      userId: staff?.id || existing?.userId || null,
      partnerId: partner?.id || existing?.partnerId || null,
      lastStartParam: startParam,
      lastEvent: input.event || existing?.lastEvent || null,
      lastSeenAt: new Date(),
      ...(validated || input.auth ? { lastAuthAt: new Date() } : {}),
    },
    create: {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      telegramUserId,
      telegramChatId: chatId,
      telegramUsername: user.username || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      languageCode: user.language_code || null,
      photoUrl: user.photo_url || null,
      visitorId,
      personId,
      leadId: lead?.id || null,
      customerId,
      userId: staff?.id || null,
      partnerId: partner?.id || null,
      lastStartParam: startParam,
      lastEvent: input.event || "IDENTIFIED",
      lastAuthAt: validated || input.auth ? new Date() : null,
    },
  });

  if (input.event) {
    await prisma.visitor.update({ where: { id: visitorId }, data: { lastSeenAt: new Date() } }).catch(() => null);
    await prisma.event.create({
      data: {
        visitorId,
        eventName: "TELEGRAM_" + input.event.toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 92),
        productSlug: input.productSlug || null,
        metadata: {
          telegramUserId,
          telegramChatId: chatId,
          username: user.username || null,
          startParam,
          ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
        },
      },
    });
  }

  return { identity, user, validated, visitorId, leadId: lead?.id || identity.leadId || null, customerId, userId: staff?.id || identity.userId || null, partnerId: partner?.id || identity.partnerId || null };
}

export async function telegramIdentityContext(workspaceId: string, telegramUserId: string) {
  return prisma.telegramIdentity.findUnique({ where: { workspaceId_telegramUserId: { workspaceId, telegramUserId } } });
}
