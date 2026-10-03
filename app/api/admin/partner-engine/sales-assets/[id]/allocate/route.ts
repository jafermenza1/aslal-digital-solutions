import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const {id}=await params;
 try{
  const b=await request.json();
  const partnerId=String(b.partnerId??"").trim();
  const quantity=Number(b.quantityAllocated);
  if(!partnerId||!Number.isInteger(quantity)||quantity<1)return NextResponse.json({error:"Partner and a positive allocation quantity are required."},{status:400});
  const [asset]=await db.query<RowDataPacket[]>(`SELECT * FROM commercial_distribution_items WHERE id=? AND workspace_id=? LIMIT 1`,[id,access.workspace.id]);
  if(!asset[0])return NextResponse.json({error:"Sales asset not found."},{status:404});
  if(asset[0].status!=="ACTIVE")return NextResponse.json({error:"Only ACTIVE sales assets can be allocated."},{status:409});
  const [partner]=await db.query<RowDataPacket[]>(`SELECT id,status,account_status,verification_status FROM partners WHERE id=? AND workspace_id=? LIMIT 1`,[partnerId,access.workspace.id]);
  if(!partner[0])return NextResponse.json({error:"Partner not found in this workspace."},{status:404});
  if(partner[0].status!=="ACTIVE"||partner[0].account_status!=="ACTIVE"||partner[0].verification_status!=="VERIFIED")return NextResponse.json({error:"Partner must be ACTIVE, account ACTIVE and VERIFIED before receiving sales assets."},{status:409});
  if(asset[0].campaign_id){const [cp]=await db.query<RowDataPacket[]>(`SELECT id FROM campaign_partners WHERE campaign_id=? AND partner_id=? AND status IN ("APPROVED","ACTIVE","COMPLETED") LIMIT 1`,[asset[0].campaign_id,partnerId]);if(!cp[0])return NextResponse.json({error:"Partner is not an approved/active participant in the asset campaign."},{status:409});}
  const [existing]=await db.query<RowDataPacket[]>(`SELECT id,quantity_allocated,quantity_issued,status FROM partner_sales_asset_allocations WHERE asset_id=? AND partner_id=? LIMIT 1`,[id,partnerId]);
  if(existing[0]){
   if(existing[0].status==="CLOSED")return NextResponse.json({error:"This partner allocation is closed."},{status:409});
   await db.query(`UPDATE partner_sales_asset_allocations SET quantity_allocated=?,status='ACTIVE',updated_at=NOW() WHERE id=? AND quantity_issued<=?`,[quantity,existing[0].id,quantity]);
   return NextResponse.json({ok:true,id:existing[0].id,updated:true});
  }
  const allocationId=randomUUID();
  await db.query(`INSERT INTO partner_sales_asset_allocations
   (id,workspace_id,asset_id,partner_id,campaign_id,quantity_allocated,quantity_issued,status,starts_at,ends_at,created_by,created_at,updated_at)
   VALUES (?,?,?,?,?,?,0,'ACTIVE',?,?,?,NOW(),NOW())`,[
    allocationId,access.workspace.id,id,partnerId,asset[0].campaign_id||null,quantity,
    asset[0].starts_at||null,asset[0].ends_at||null,access.user.email
  ]);
  return NextResponse.json({ok:true,id:allocationId},{status:201});
 }catch(error){console.error("SALES_ASSET_ALLOCATE_ERROR",error);return NextResponse.json({error:"Could not allocate sales asset."},{status:500});}
}
