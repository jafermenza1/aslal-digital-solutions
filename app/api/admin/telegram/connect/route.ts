import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  if (access.user.role === "PARTNER") return NextResponse.json({ error: "Internal sales Telegram linking only." }, { status: 403 });

  const username = String(process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "").trim();
  if (!username) return NextResponse.json({ error: "TELEGRAM_BOT_USERNAME is not configured." }, { status: 503 });

  const token = randomBytes(32).toString("base64url");
  await db.query("UPDATE users SET telegram_link_token=?,telegram_chat_id=NULL,telegram_username=NULL,telegram_linked_at=NULL WHERE id=?", [token, access.user.id]);

  return NextResponse.json({
    botUsername: username,
    deepLink: "https://t.me/" + username + "?start=staff_" + token,
    workspaceId: access.workspace.id,
    expiresIn: "one-time until Telegram is linked or a new token is generated",
  });
}
