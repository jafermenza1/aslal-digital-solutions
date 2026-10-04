import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")||"";
 const access=await authorizeWorkspacePermission("telegram.view",workspaceId);
 if(!access)return NextResponse.json({error:"Telegram access denied."},{status:403});
 const [rows]=await db.query(
  "SELECT l.id,l.name,l.telegram_username AS username,l.telegram_chat_id AS telegramUserId,l.email,l.phone,l.status,l.owner_email AS ownerEmail,l.message,l.created_at AS createdAt,CASE WHEN EXISTS(SELECT 1 FROM telegram_public_sessions s WHERE s.workspace_id=l.workspace_id AND s.lead_id=l.id AND s.state='SUPPORT_REQUESTED') THEN 1 ELSE 0 END AS handedOff FROM leads l WHERE l.workspace_id=? AND l.source='telegram' ORDER BY l.created_at DESC LIMIT 100",
  [access.workspace.id],
 );
 return NextResponse.json({leads:rows});
}
