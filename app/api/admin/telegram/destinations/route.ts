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
    "SELECT id,chat_id,type,label,active,opt_in,lead_id,product_id,campaign_id,partner_id,referral_code,source,medium,follow_up_enabled,follow_up_interval_minutes,follow_up_max_attempts,follow_up_attempts,next_follow_up_at,last_inbound_at,handed_off_at,sales_owner_email,created_at,updated_at FROM telegram_destinations WHERE workspace_id=? ORDER BY created_at DESC LIMIT 200",
    [access.workspace.id],
  );
  const [products] = await db.query(
    "SELECT id,name,kind,short_description,starting_price,cta_label FROM products WHERE active=1 ORDER BY name ASC LIMIT 200",
  );
  const [staff] = await db.query(
    "SELECT DISTINCT u.email, COALESCE(NULLIF(u.name,''), u.email) AS name, u.role, u.telegram_chat_id, u.telegram_username FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') ORDER BY FIELD(u.role,'SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN'), name ASC LIMIT 200",
    [access.workspace.id],
  );
  const [campaigns] = await db.query(
    "SELECT id,name,status FROM partner_campaigns WHERE workspace_id=? AND status IN ('OPEN','ACTIVE','PUBLISHED') ORDER BY created_at DESC LIMIT 200",
    [access.workspace.id],
  );
  return NextResponse.json({ destinations: rows, products, campaigns, staff });
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


export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.edit", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  const destinationId = typeof body.destinationId === "string" ? body.destinationId : "";
  if (!destinationId) return NextResponse.json({ error: "destinationId is required." }, { status: 400 });
  const email = typeof body.salesOwnerEmail === "string" && body.salesOwnerEmail.trim() ? body.salesOwnerEmail.trim().toLowerCase().slice(0,190) : null;
  const salesTelegram = typeof body.salesTelegram === "string" ? body.salesTelegram.trim().replace(/^@/,"").slice(0,190) : "";
  let resolvedEmail = email;
  if (salesTelegram) {
    const [telegramStaff] = await db.query("SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND (u.telegram_chat_id=? OR LOWER(u.telegram_username)=LOWER(?)) AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') LIMIT 1", [access.workspace.id, salesTelegram, salesTelegram]);
    const match = (telegramStaff as Array<{email:string}>)[0];
    if (!match) return NextResponse.json({ error: "Telegram staff not found in this workspace. Have the sales person connect Telegram first, then assign by @username or Telegram chat number." }, { status: 400 });
    resolvedEmail = match.email;
  }
  if (resolvedEmail) {
    const [staff] = await db.query("SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.email=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') LIMIT 1", [access.workspace.id,resolvedEmail]);
    if (!(staff as unknown[]).length) return NextResponse.json({ error: "Selected sales/contact person is not active in this workspace." }, { status: 400 });
  }
  const [destinations] = await db.query("SELECT id,lead_id FROM telegram_destinations WHERE id=? AND workspace_id=? LIMIT 1", [destinationId,access.workspace.id]);
  const destination = (destinations as Array<{id:string;lead_id:string|null}>)[0];
  if (!destination) return NextResponse.json({ error: "Telegram destination not found in this workspace." }, { status: 404 });
  await db.query("UPDATE telegram_destinations SET sales_owner_email=? WHERE id=? AND workspace_id=?", [resolvedEmail,destinationId,access.workspace.id]);
  if (destination.lead_id) await db.query("UPDATE leads SET owner_email=? WHERE id=? AND workspace_id=?", [resolvedEmail,destination.lead_id,access.workspace.id]);
  return NextResponse.json({ ok:true, salesOwnerEmail:resolvedEmail });
}
