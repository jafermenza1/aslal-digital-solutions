import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [rows] = await db.query<(RowDataPacket & { partner_id: string | null })[]>("SELECT partner_id FROM users WHERE id=? LIMIT 1",[user.id]);
  const partnerId = rows[0]?.partner_id;
  if (!partnerId) return NextResponse.json({ error: "Partner account is not linked." }, { status: 409 });
  const [partners] = await db.query<(RowDataPacket & { id:string; status:string; verification_status:string })[]>("SELECT id,status,verification_status FROM partners WHERE id=? LIMIT 1",[partnerId]);
  const partner=partners[0];
  if(!partner) return NextResponse.json({error:"Partner profile not found."},{status:404});
  if(partner.status!=="ACTIVE"||partner.verification_status!=="VERIFIED") return NextResponse.json({error:"Partner verification must be ACTIVE and VERIFIED before connecting Telegram."},{status:403});
  const username=(process.env.TELEGRAM_BOT_USERNAME||"").replace(/^@/,"");
  if(!username) return NextResponse.json({error:"TELEGRAM_BOT_USERNAME is not configured."},{status:503});
  const token=randomBytes(32).toString("base64url");
  await db.query("UPDATE partners SET telegram_link_token=?,telegram_chat_id=NULL,telegram_linked_at=NULL WHERE id=?",[token,partnerId]);
  return NextResponse.json({botUsername:username,deepLink:"https://t.me/"+username+"?start="+token,expiresIn:"one-time until Telegram is linked or a new token is generated"});
}
