import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { getOrCreateTelegramChannelConfig } from "@/lib/telegram-channel-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const booleanFields = [
  "enabled","miniAppEnabled","menuButtonEnabled","requireWorkspace","requireAuth",
  "showProducts","showResources","showCategories","showSearch","showFeatured",
  "showSpecifications","showGallery","showRelatedItems","showAvailability","showPrice",
  "showStock","allowInquiry","allowAddToOrder","allowDirectOrder","allowCheckout",
  "requireCustomerIdentity","requirePhone","requireDeliveryInformation","requireSalesApproval",
  "paymentEnabled","requirePaymentBeforeOrder","allowPayLater","receiptEnabled",
  "captureStartParameter","preserveCampaignAttribution","preservePartnerAttribution",
  "preserveReferralAttribution","createCustomerOnCommerceAction","createLeadOnInquiry",
  "showWorkspaceBranding",
] as const;

const stringFields = [
  "miniAppUrl","menuButtonText","defaultPage","localeMode","primaryCta","secondaryCta",
  "orderConfirmationMode","defaultPaymentMethod","currency","title","logoUrl","themeMode",
  "primaryColor","secondaryColor",
] as const;

const intFields = ["paymentExpiryMinutes","attributionExpiryHours"] as const;

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  return NextResponse.json({ config: await getOrCreateTelegramChannelConfig(access.workspace.id) });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.edit", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });

  const current = await getOrCreateTelegramChannelConfig(access.workspace.id);
  const data: Record<string, unknown> = {};

  for (const key of booleanFields) if (typeof body[key] === "boolean") data[key] = body[key];
  for (const key of stringFields) if (typeof body[key] === "string") data[key] = String(body[key]).trim().slice(0, key === "miniAppUrl" || key === "logoUrl" ? 1000 : 190);
  for (const key of intFields) {
    if (Number.isInteger(body[key])) data[key] = Math.max(0, Math.min(100000, Number(body[key])));
  }

  if (body.allowedPaymentMethods !== undefined) {
    if (!Array.isArray(body.allowedPaymentMethods) || body.allowedPaymentMethods.some((v: unknown) => typeof v !== "string")) {
      return NextResponse.json({ error: "allowedPaymentMethods must be an array of strings." }, { status: 400 });
    }
    data.allowedPaymentMethods = body.allowedPaymentMethods.slice(0, 20).map((v: string) => v.trim().toUpperCase()).filter(Boolean);
  }

  if (data.miniAppEnabled === true && !("miniAppUrl" in data) && !current.miniAppUrl) {
    return NextResponse.json({ error: "miniAppUrl is required when miniAppEnabled is enabled." }, { status: 400 });
  }
  if (data.paymentEnabled === true && !("allowedPaymentMethods" in data) && !current.allowedPaymentMethods) {
    return NextResponse.json({ error: "Configure at least one payment method before enabling payments." }, { status: 400 });
  }

  const config = await import("@/lib/prisma").then(({ prisma }) =>
    prisma.telegramChannelConfig.update({ where: { workspaceId: access.workspace.id }, data })
  );
  return NextResponse.json({ config });
}
