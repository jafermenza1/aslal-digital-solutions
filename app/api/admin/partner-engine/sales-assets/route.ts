import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const TYPES=new Set(["TICKET","COUPON","VOUCHER","PASS"]);
const STATUSES=new Set(["DRAFT","ACTIVE","PAUSED","ARCHIVED"]);

export async function GET(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const [rows]=await db.query<RowDataPacket[]>(`
  SELECT a.*,p.name product_name,c.name campaign_name,
    COALESCE((SELECT SUM(x.quantity_allocated) FROM partner_sales_asset_allocations x WHERE x.asset_id=a.id AND x.status IN ('ACTIVE','PAUSED')),0) allocated_quantity,
    COALESCE((SELECT SUM(x.quantity_issued) FROM partner_sales_asset_allocations x WHERE x.asset_id=a.id),0) issued_quantity
  FROM commercial_distribution_items a
  LEFT JOIN products p ON p.id=a.product_id AND p.active=1
  LEFT JOIN partner_campaigns c ON c.id=a.campaign_id AND c.workspace_id=a.workspace_id
  WHERE a.workspace_id=? ORDER BY a.created_at DESC LIMIT 250`,[access.workspace.id]);
 return NextResponse.json({assets:rows});
}

export async function POST(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 try{
  const b=await request.json();
  const name=String(b.name??"").trim();
  const assetType=String(b.assetType??"").toUpperCase();
  const status=String(b.status??"DRAFT").toUpperCase();
  const productId=String(b.productId??"").trim()||null;
  const campaignId=String(b.campaignId??"").trim()||null;
  const price=b.price==null||b.price===""?null:Number(b.price);
  const value=b.value==null||b.value===""?null:Number(b.value);
  const inventoryLimit=b.inventoryLimit==null||b.inventoryLimit===""?null:Number(b.inventoryLimit);
  const rsvpRequired=Boolean(b.rsvpRequired);
  const rsvpOpensAt=b.rsvpOpensAt?new Date(b.rsvpOpensAt):null;
  const rsvpClosesAt=b.rsvpClosesAt?new Date(b.rsvpClosesAt):null;
  if(!name||!TYPES.has(assetType)||!STATUSES.has(status))return NextResponse.json({error:"Name, asset type and valid status are required."},{status:400});
  if(price!==null&&(!Number.isFinite(price)||price<0))return NextResponse.json({error:"Price must be a non-negative number."},{status:400});
  if(value!==null&&(!Number.isFinite(value)||value<0))return NextResponse.json({error:"Value must be a non-negative number."},{status:400});
  if(inventoryLimit!==null&&(!Number.isInteger(inventoryLimit)||inventoryLimit<1))return NextResponse.json({error:"Inventory limit must be a positive whole number."},{status:400});
  if(productId){const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM products WHERE id=? AND active=1 LIMIT 1`,[productId]);if(!p[0])return NextResponse.json({error:"Product/Service not found."},{status:404});}
  if(campaignId){const [c]=await db.query<RowDataPacket[]>(`SELECT id FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1`,[campaignId,access.workspace.id]);if(!c[0])return NextResponse.json({error:"Campaign not found in this workspace."},{status:404});}
  if(!productId&&!campaignId)return NextResponse.json({error:"Associate the asset with an existing Product/Service or Campaign."},{status:400});
  if(b.startsAt&&b.endsAt&&new Date(b.endsAt)<new Date(b.startsAt))return NextResponse.json({error:"End date cannot be before start date."},{status:400});
  if(rsvpRequired&&!rsvpOpensAt)return NextResponse.json({error:"RSVP opening time is required when RSVP is enabled."},{status:400});
  if(rsvpOpensAt&&rsvpClosesAt&&rsvpClosesAt<rsvpOpensAt)return NextResponse.json({error:"RSVP closing time cannot be before opening time."},{status:400});
  if(rsvpClosesAt&&b.startsAt&&rsvpClosesAt>new Date(b.startsAt))return NextResponse.json({error:"RSVP must close no later than the event/ticket start time."},{status:400});
  const id=randomUUID();
  await db.query(`INSERT INTO commercial_distribution_items
   (id,workspace_id,name,asset_type,description,product_id,campaign_id,price,value,currency,inventory_limit,starts_at,ends_at,rsvp_required,rsvp_opens_at,rsvp_closes_at,redemption_instructions,status,created_by,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,[
    id,access.workspace.id,name,assetType,String(b.description??"").trim()||null,productId,campaignId,
    price,value,String(b.currency??"ETB").trim().toUpperCase()||"ETB",inventoryLimit,
    b.startsAt?new Date(b.startsAt):null,b.endsAt?new Date(b.endsAt):null,rsvpRequired,rsvpOpensAt,rsvpClosesAt,
    String(b.redemptionInstructions??"").trim()||null,status,access.user.email
  ]);
  return NextResponse.json({ok:true,id},{status:201});
 }catch(error){console.error("SALES_ASSET_CREATE_ERROR",error);return NextResponse.json({error:"Could not create sales asset."},{status:500});}
}
