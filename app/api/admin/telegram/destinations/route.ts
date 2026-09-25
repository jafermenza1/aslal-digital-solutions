import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  const [rows] = await db.query(
    "SELECT id,chat_id,type,label,active,opt_in,lead_id,product_id,campaign_id,partner_id,referral_code,source,medium,follow_up_enabled,follow_up_interval_minutes,follow_up_max_attempts,follow_up_attempts,next_follow_up_at,last_inbound_at,handed_off_at,created_at,updated_at FROM telegram_destinations WHERE workspace_id=? ORDER BY created_at DESC LIMIT 200",
    [access.workspace.id],
  );
  return NextResponse.json({ destinations: rows });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.edit", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });

  const type = String(body.type || "PRIVATE").toUpperCase();
  if (!["PRIVATE", "GROUP", "CHANNEL"].includes(type)) return NextResponse.json({ error: "type must be PRIVATE, GROUP, or CHANNEL." }, { status: 400 });

  const label = String(body.label || (type === "PRIVATE" ? "Telegram client" : "Telegram audience")).trim().slice(0, 190);
  const chatId = typeof body.chatId === "string" ? body.chatId.trim().slice(0, 190) : "";
  if (type !== "PRIVATE" && !chatId) return NextResponse.json({ error: "chatId is required for groups and channels." }, { status: 400 });

  const leadId = typeof body.leadId === "string" ? body.leadId : null;
  const productId = typeof body.productId === "string" ? body.productId : null;
  const campaignId = typeof body.campaignId === "string" ? body.campaignId : null;
  const partnerId = typeof body.partnerId === "string" ? body.partnerId : null;
  const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim().slice(0, 100) : null;
  const followUpEnabled = Boolean(body.followUpEnabled);
  const followUpMessage = typeof body.followUpMessage === "string" ? body.followUpMessage.trim().slice(0, 4000) : null;
  const interval = Math.max(5, Math.min(10080, Number(body.followUpIntervalMinutes || 1440)));
  const maxAttempts = Math.max(1, Math.min(20, Number(body.followUpMaxAttempts || 3)));

  if (leadId) {
    const [rows] = await db.query("SELECT id FROM leads WHERE id=? AND workspace_id=? LIMIT 1", [leadId, access.workspace.id]);
    if (!(rows as unknown[]).length) return NextResponse.json({ error: "Lead is outside the active workspace." }, { status: 403 });
  }
  if (productId) {
    const [rows] = await db.query("SELECT id FROM products WHERE id=? AND active=1 LIMIT 1", [productId]);
    if (!(rows as unknown[]).length) return NextResponse.json({ error: "Product not found or inactive." }, { status: 404 });
  }
  if (campaignId) {
    const [rows] = await db.query("SELECT id FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1", [campaignId, access.workspace.id]);
    if (!(rows as unknown[]).length) return NextResponse.json({ error: "Campaign is outside the active workspace." }, { status: 403 });
  }
  if (partnerId) {
    const [rows] = await db.query("SELECT id FROM partners WHERE id=? AND workspace_id=? LIMIT 1", [partnerId, access.workspace.id]);
    if (!(rows as unknown[]).length) return NextResponse.json({ error: "Partner is outside the active workspace." }, { status: 403 });
  }

  const id = crypto.randomUUID();
  const token = type === "PRIVATE" ? randomBytes(32).toString("base64url") : null;
  const effectiveChatId = chatId || "pending:" + id;
  await db.query(
    "INSERT INTO telegram_destinations (id,workspace_id,chat_id,type,label,active,opt_in,link_token,lead_id,product_id,campaign_id,partner_id,referral_code,source,medium,follow_up_enabled,follow_up_message,follow_up_interval_minutes,follow_up_max_attempts,next_follow_up_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [id,access.workspace.id,effectiveChatId,type,label,1,type !== "PRIVATE",token,leadId,productId,campaignId,partnerId,referralCode,"telegram", "telegram",followUpEnabled,followUpMessage,interval,maxAttempts,followUpEnabled ? new Date(Date.now()+interval*60000) : null,access.user.email],
  );

  const username = String(process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "").trim();
  return NextResponse.json({
    ok: true,
    id,
    deepLink: type === "PRIVATE" && username ? "https://t.me/" + username + "?start=client_" + token : null,
    requiresClientStart: type === "PRIVATE",
  }, { status: 201 });
}
