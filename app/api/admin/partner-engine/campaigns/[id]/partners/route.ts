import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

const STATUSES=new Set(["INVITED","APPLIED","APPROVED","ACTIVE","DECLINED","COMPLETED","REMOVED"]);
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await authorizePermission("partners.manage")))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const [rows]=await db.query(`SELECT cp.id,cp.partner_id,cp.status,cp.role,cp.applied_at,cp.approved_at,cp.completed_at,cp.notes,p.name,p.email,p.type,p.verification_status,p.tier
 FROM campaign_partners cp JOIN partners p ON p.id=cp.partner_id WHERE cp.campaign_id=? ORDER BY cp.created_at DESC`,[id]);
 return NextResponse.json({partners:rows});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("partners.manage");if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 try{
  const b=await request.json();const partnerId=String(b.partnerId??"").trim(),status=String(b.status??"").toUpperCase(),notes=String(b.notes??"").trim()||null;
  if(!partnerId||!STATUSES.has(status))return NextResponse.json({error:"Partner and valid status are required."},{status:400});
  const [row]=await db.query<{id:string;status:string}[]>(`SELECT id,status FROM campaign_partners WHERE campaign_id=? AND partner_id=? LIMIT 1`,[id,partnerId]);
  if(!row[0])return NextResponse.json({error:"Campaign partner assignment not found."},{status:404});
  const approvedAt=["APPROVED","ACTIVE","COMPLETED"].includes(status)?new Date():null;
  const completedAt=status==="COMPLETED"?new Date():null;
  await db.query(`UPDATE campaign_partners SET status=?,notes=?,approved_at=COALESCE(?,approved_at),completed_at=? WHERE campaign_id=? AND partner_id=?`,[status,notes,approvedAt,completedAt,id,partnerId]);
  return NextResponse.json({ok:true,status,actor:actor.email});
 }catch(error){console.error("CAMPAIGN_PARTNER_UPDATE_ERROR",error);return NextResponse.json({error:"Could not update campaign partner."},{status:500});}
}
