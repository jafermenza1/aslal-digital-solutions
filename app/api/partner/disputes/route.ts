import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET(){
  const user=await authorizePermission("partner.portal.view"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]); const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
  const [rows]=await db.query<RowDataPacket[]>(`SELECT id,campaign_id,commission_id,subject,description,status,resolution,resolved_at,created_at FROM partner_disputes WHERE partner_id=? ORDER BY created_at DESC LIMIT 100`,[pid]); return NextResponse.json({disputes:rows});
}
export async function POST(request:Request){
  const user=await authorizePermission("partner.portal.view"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const b=await request.json();const subject=String(b.subject??"").trim(),description=String(b.description??"").trim(),campaignId=String(b.campaignId??"").trim()||null,commissionId=String(b.commissionId??"").trim()||null;
    if(subject.length<3||subject.length>190||description.length<10||description.length>10000)return NextResponse.json({error:"Provide a clear dispute subject and description."},{status:400});
    const [u]=await db.query<(RowDataPacket & {partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
    if(campaignId){const [x]=await db.query<RowDataPacket[]>(`SELECT id FROM campaign_partners WHERE campaign_id=? AND partner_id=? LIMIT 1`,[campaignId,pid]);if(!x[0])return NextResponse.json({error:"Campaign is not linked to this partner."},{status:400});}
    if(commissionId){const [x]=await db.query<RowDataPacket[]>(`SELECT id FROM commissions WHERE id=? AND partner_id=? LIMIT 1`,[commissionId,pid]);if(!x[0])return NextResponse.json({error:"Commission is not linked to this partner."},{status:400});}
    const id=crypto.randomUUID();await db.query(`INSERT INTO partner_disputes (id,partner_id,campaign_id,commission_id,subject,description) VALUES (?,?,?,?,?,?)`,[id,pid,campaignId,commissionId,subject,description]);return NextResponse.json({ok:true,id},{status:201});
  }catch(error){console.error("PARTNER_DISPUTE_CREATE_ERROR",error);return NextResponse.json({error:"Could not open dispute."},{status:500});}
}
