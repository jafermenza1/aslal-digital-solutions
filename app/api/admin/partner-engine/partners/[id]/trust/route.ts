import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const access=await authorizeWorkspacePermission("partners.manage");if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const [p]=await db.query<RowDataPacket[]>("SELECT id,partner_number,name,type,account_status,verification_level,tier,verified_at,created_at FROM partners WHERE id=? AND workspace_id=? LIMIT 1",[id,access.workspace.id]);
 if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
 const [risk]=await db.query<RowDataPacket[]>("SELECT signal_code,severity,status,summary,explanation,reviewed_at,review_note,created_at FROM partner_risk_signals WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC",[access.workspace.id,id]);
 const [restrictions]=await db.query<RowDataPacket[]>("SELECT level,status,reason,imposed_by,imposed_at,lifted_by,lifted_at FROM partner_restrictions WHERE workspace_id=? AND partner_id=? ORDER BY imposed_at DESC",[access.workspace.id,id]);
 const [disputes]=await db.query<RowDataPacket[]>("SELECT id,subject,status,resolution,resolved_at,created_at FROM partner_disputes WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 100",[access.workspace.id,id]);
 const [commissions]=await db.query<RowDataPacket[]>("SELECT id,status,amount,current_balance,currency,created_at FROM commissions WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 100",[access.workspace.id,id]);
 return NextResponse.json({partner:p[0],riskSignals:risk,restrictions,disputes,commissions});
}