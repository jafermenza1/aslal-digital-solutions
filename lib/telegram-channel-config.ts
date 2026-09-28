import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";

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
  publicMenu: ["Catalog","Qualify me","Pricing","Talk to Agent"],
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
    const [rows] = await db.query<Array<{id:string}>>(
      "SELECT id FROM workspaces WHERE id=? AND active=1 LIMIT 1",
      [configured],
    );
    if (rows[0]?.id) return rows[0].id;
  }

  const [rows] = await db.query<Array<{id:string}>>(
    "SELECT w.id FROM workspaces w INNER JOIN telegram_channel_configs c ON c.workspace_id=w.id WHERE w.active=1 AND c.enabled=1 AND c.public_enabled=1 AND c.allow_anonymous_users=1 ORDER BY CASE WHEN LOWER(w.slug)='aslal' OR LOWER(w.name)='aslal' THEN 0 ELSE 1 END, w.created_at ASC LIMIT 1",
  );
  return rows[0]?.id || "";
}
