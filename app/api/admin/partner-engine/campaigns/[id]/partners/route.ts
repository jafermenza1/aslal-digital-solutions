import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUSES=new Set(["INVITED","APPLIED","APPROVED","ACTIVE","DECLINED","COMPLETED","REMOVED"]);
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const access=await authorizeWorkspacePermission("partners.manage",new URL(_request.url).searchParams.get("workspaceId")); if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const {id}=await params;
 const [rows]=await db.query(`SELECT cp.id,cp.partner_id,cp.status,cp.role,cp.applied_at,cp.approved_at,cp.completed_at,cp.notes,p.name,p.email,p.type,p.verification_status,p.tier
 FROM campaign_partners cp JOIN partners p ON p.id=cp.partner_id WHERE cp.campaign_id=? AND p.workspace_id=? AND EXISTS(SELECT 1 FROM partner_campaigns c WHERE c.id=cp.campaign_id AND c.workspace_id=?) ORDER BY cp.created_at DESC`,[id,access.workspace.id,access.workspace.id]);
 return NextResponse.json({partners:rows});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const body=await request.json().catch(()=>({})); const actor=await authorizeWorkspacePermission("partners.manage",typeof body.workspaceId==="string"?body.workspaceId:undefined);if(!actor)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const {id}=await params;
 try{
  const b=body;const partnerId=String(b.partnerId??"").trim(),status=String(b.status??"").toUpperCase(),notes=String(b.notes??"").trim()||null;
  if(!partnerId||!STATUSES.has(status))return NextResponse.json({error:"Partner and valid status are required."},{status:400});
  const [campaignRows]=await db.query<(RowDataPacket & {id:string;status:string;name:string;product_id:string|null})[]>(`SELECT id,status,name,product_id FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1`,[id,actor.workspace.id]);
  if(!campaignRows[0])return NextResponse.json({error:"Campaign not found."},{status:404});
  const [partnerRows]=await db.query<(RowDataPacket & {id:string;type:string;status:string;verification_status:string})[]>(`SELECT id,type,status,verification_status FROM partners WHERE id=? AND workspace_id=? LIMIT 1`,[partnerId,actor.workspace.id]);
  if(!partnerRows[0])return NextResponse.json({error:"Partner not found."},{status:404});
  if(status==="INVITED"&&!(partnerRows[0].status==="ACTIVE"&&partnerRows[0].verification_status==="VERIFIED"))return NextResponse.json({error:"Only active, verified partners can be invited."},{status:403});
  const [row]=await db.query<(RowDataPacket & {id:string;status:string})[]>(`SELECT id,status FROM campaign_partners WHERE campaign_id=? AND partner_id=? LIMIT 1`,[id,partnerId]);
  const approvedAt=["APPROVED","ACTIVE","COMPLETED"].includes(status)?new Date():null;
  const completedAt=status==="COMPLETED"?new Date():null;
  if(!row[0]) await db.query(`INSERT INTO campaign_partners (id,campaign_id,partner_id,status,role,approved_at,completed_at,notes) VALUES (?,?,?,?,?,?,?,?)`,[crypto.randomUUID(),id,partnerId,status,partnerRows[0].type,approvedAt,completedAt,notes]);
  else await db.query(`UPDATE campaign_partners SET status=?,notes=?,approved_at=COALESCE(?,approved_at),completed_at=? WHERE campaign_id=? AND partner_id=?`,[status,notes,approvedAt,completedAt,id,partnerId]);
  if(["APPROVED","ACTIVE"].includes(status)){
   const [existingLink]=await db.query<RowDataPacket[]>(`SELECT id FROM referral_links WHERE partner_id=? AND campaign_id=? AND workspace_id=? LIMIT 1`,[partnerId,id,actor.workspace.id]);
   if(!existingLink[0]){
    const base=(campaignRows[0].name||"campaign").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45)||"campaign";
    const code=`${base}-${id.slice(0,8)}-${partnerId.slice(0,8)}`;
    let destination="/";
    if(campaignRows[0].product_id){const [product]=await db.query<(RowDataPacket&{slug:string})[]>(`SELECT slug FROM products WHERE id=? LIMIT 1`,[campaignRows[0].product_id]);if(product[0]?.slug)destination=`/products/${product[0].slug}`;}
    await db.query(`INSERT INTO referral_links (id,workspace_id,partner_id,code,campaign,product_slug,destination_path,campaign_id) VALUES (?,?,?,?,?,?,?,?)`,[crypto.randomUUID(),actor.workspace.id,partnerId,code,campaignRows[0].name,null,destination,id]);
   }
  }
  return NextResponse.json({ok:true,status,actor:actor.user.email});
 }catch(error){console.error("CAMPAIGN_PARTNER_UPDATE_ERROR",error);return NextResponse.json({error:"Could not update campaign partner."},{status:500});}
}
