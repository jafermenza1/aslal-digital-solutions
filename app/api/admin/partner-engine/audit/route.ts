import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage"); if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const u=new URL(request.url),entityType=u.searchParams.get("entityType"),entityId=u.searchParams.get("entityId");
 const [rows]=await db.query<(RowDataPacket & Record<string,unknown>)[]>(
  "SELECT * FROM trust_audit_events WHERE workspace_id=? AND (?='' OR entity_type=?) AND (?='' OR entity_id=?) ORDER BY created_at DESC LIMIT 300",
  [access.workspace.id,entityType||"",entityType||"",entityId||"",entityId||""]);
 return NextResponse.json({events:rows});
}