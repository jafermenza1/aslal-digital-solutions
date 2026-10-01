import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { authorizePermission } from "@/lib/authorization";

export async function GET(){
 const user=await authorizePermission("partner.portal.view"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [p]=await db.query<(RowDataPacket & {id:string;workspace_id:string;partner_number:string;name:string;account_status:string;verification_level:string;tier:string;created_at:string})[]>(
  "SELECT p.id,p.workspace_id,p.partner_number,p.name,p.account_status,p.verification_level,p.tier,p.created_at FROM partners p JOIN users u ON u.id=p.user_id WHERE u.id=? LIMIT 1",[user.id]);
 if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
 const id=p[0].id,w=p[0].workspace_id;
 const [risk]=await db.query<(RowDataPacket & Record<string,unknown>)[]>("SELECT id,signal_code,severity,status,score,summary,explanation,reviewed_at,review_note,created_at FROM partner_risk_signals WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 100",[w,id]);
 const [restrictions]=await db.query<(RowDataPacket & Record<string,unknown>)[]>("SELECT level,status,reason,imposed_by,imposed_at,lifted_by,lifted_at FROM partner_restrictions WHERE workspace_id=? AND partner_id=? ORDER BY imposed_at DESC",[w,id]);
 const [disputes]=await db.query<(RowDataPacket & Record<string,unknown>)[]>("SELECT id,subject,status,resolution,resolved_at,created_at FROM partner_disputes WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 100",[w,id]);
 const [commissions]=await db.query<(RowDataPacket & Record<string,unknown>)[]>("SELECT id,amount,current_balance,status,currency,created_at FROM commissions WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 100",[w,id]);
 return NextResponse.json({partner:p[0],riskSignals:risk,restrictions,disputes,commissions});
}