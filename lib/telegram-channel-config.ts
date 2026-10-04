import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

type IdRow = RowDataPacket & { id: string };

export const DEFAULT_TELEGRAM_CHANNEL_CONFIG = {
  enabled: true,
  miniAppEnabled: false,
  miniAppUrl: null,
  menuButtonEnabled: true,
  menuButtonText: "Open Catalog",
  defaultPage: "catalog",
  localeMode: "telegram",
  requireWorkspace: true,
  requireAuth: false,
  showProducts: true,
  showResources: true,
  showCategories: true,
  showSearch: true,
  showFeatured: true,
  showSpecifications: true,
  showGallery: true,
  showRelatedItems: true,
  showAvailability: false,
  showPrice: true,
  showStock: false,
  primaryCta: "VIEW_DETAILS",
  secondaryCta: null,
  allowInquiry: true,
  allowAddToOrder: true,
  allowDirectOrder: false,
  allowCheckout: false,
  requireCustomerIdentity: true,
  requirePhone: false,
  requireDeliveryInformation: false,
  requireSalesApproval: true,
  orderConfirmationMode: "PENDING",
  paymentEnabled: false,
  allowedPaymentMethods: ["MANUAL"],
  defaultPaymentMethod: null,
  currency: "ETB",
  requirePaymentBeforeOrder: false,
  allowPayLater: true,
  paymentExpiryMinutes: 30,
  receiptEnabled: true,
  captureStartParameter: true,
  preserveCampaignAttribution: true,
  preservePartnerAttribution: true,
  preserveReferralAttribution: true,
  attributionExpiryHours: 720,
  createCustomerOnCommerceAction: true,
  createLeadOnInquiry: true,
  title: null,
  logoUrl: null,
  themeMode: "system",
  primaryColor: null,
  secondaryColor: null,
  showWorkspaceBranding: true,
  publicEnabled: true,
  allowAnonymousUsers: true,
  inlineModeEnabled: false,
  inlineCatalogEnabled: false,
  qualificationEnabled: false,
  qualificationFlow: [],
  knowledgeBaseEnabled: false,
  keywordRules: [],
  humanHandoffEnabled: true,
  handoffChatId: null,
  handoffMode: "ADMIN_GROUP",
  publicMenu: {
    items: [
      {action:"CATALOG",label:"🛍 Browse products"},
      {action:"SERVICES",label:"💼 Explore services"},
      {action:"NEED",label:"🔎 Tell us what you need"},
      {action:"ORDERS",label:"📦 My orders"},
      {action:"HUMAN",label:"💬 Talk to a person"},
      {action:"PARTNER",label:"🤝 Partner with Aslal"},
    ],
    responses: {
      welcome:"👋 Welcome to Aslal",
      prompt:"What would you like to do?",
      fallback:"Tell us what you need in your own words and we will help you find the right next step.",
      ordersEmpty:"You do not have any orders recorded yet.",
      demandConfirmation:"Thanks — I have captured what you need. An Aslal team member can continue with you here.",
      humanHandoff:"A member of the Aslal team has taken over this conversation. Please continue here.",
      partner:"🤝 Partner with Aslal\n\nJoin our partner network for campaigns, referrals, sales assets and partner opportunities.",
    },
  },
  paymentProviders: ["CHAPA","TELEBIRR","CBE_BIRR"],
  telegramPaymentsEnabled: false,
  localPaymentsEnabled: false,
} as const;

export async function getTelegramChannelConfig(workspaceId: string) {
  return prisma.telegramChannelConfig.findUnique({ where: { workspaceId } });
}

export async function getOrCreateTelegramChannelConfig(workspaceId: string) {
  return prisma.telegramChannelConfig.upsert({
    where: { workspaceId },
    create: {
      id: crypto.randomUUID(),
      workspaceId,
      allowedPaymentMethods: DEFAULT_TELEGRAM_CHANNEL_CONFIG.allowedPaymentMethods,
    },
    update: {},
  });
}


export async function resolveTelegramDefaultWorkspaceId() {
  const configured = String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID || "").trim();
  if (configured) {
    const [rows] = await db.query<IdRow[]>(
      "SELECT id FROM workspaces WHERE id=? AND active=1 LIMIT 1",
      [configured],
    );
    if (rows[0]?.id) return rows[0].id;
  }

  const [rows] = await db.query<IdRow[]>(
    "SELECT w.id FROM workspaces w INNER JOIN telegram_channel_configs c ON c.workspace_id=w.id WHERE w.active=1 AND c.enabled=1 AND c.public_enabled=1 AND c.allow_anonymous_users=1 ORDER BY CASE WHEN LOWER(w.slug)='aslal' OR LOWER(w.name)='aslal' THEN 0 ELSE 1 END, w.created_at ASC LIMIT 1",
  );
  return rows[0]?.id || "";
}
