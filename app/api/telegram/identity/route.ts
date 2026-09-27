import { NextResponse } from "next/server";
import { syncTelegramIdentity } from "@/lib/telegram-identity";
import { getTelegramChannelConfig } from "@/lib/telegram-channel-config";

export const dynamic = "force-dynamic";

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const workspaceId = clean(body.workspaceId, 36);
    const initData = clean(body.initData, 8000);
    const event = clean(body.event, 80);
    const productSlug = clean(body.productSlug, 160) || null;

    if (!workspaceId || !initData) {
      return NextResponse.json({ ok: false, error: "Telegram identity data is required." }, { status: 400 });
    }

    const config = await getTelegramChannelConfig(workspaceId);
    if (!config?.enabled || !config.publicEnabled || !config.allowAnonymousUsers) {
      return NextResponse.json({ ok: false, error: "Telegram access is unavailable for this workspace." }, { status: 403 });
    }

    const result = await syncTelegramIdentity({
      workspaceId,
      initData,
      event: event || "IDENTIFIED",
      productSlug,
      metadata: body.metadata,
      auth: true,
    });

    return NextResponse.json({
      ok: true,
      identity: {
        id: result.identity.id,
        telegramUserId: result.identity.telegramUserId,
        telegramUsername: result.identity.telegramUsername,
        firstName: result.identity.firstName,
        lastName: result.identity.lastName,
        isRegistered: Boolean(result.userId || result.partnerId || result.customerId || result.leadId),
        isStaff: Boolean(result.userId),
        isPartner: Boolean(result.partnerId),
        isCustomer: Boolean(result.customerId),
        leadId: result.leadId,
        customerId: result.customerId,
        partnerId: result.partnerId,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Telegram identity could not be verified." }, { status: 401 });
  }
}
