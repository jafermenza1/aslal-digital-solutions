import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=new Set(["CREATIVE","COPY","PRICE_SHEET","QR","POSTER","LINK"]);
const STATUSES=new Set(["DRAFT","PUBLISHED","ARCHIVED"]);

export async function GET(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
 const actor=access?.user;
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const campaignId=new URL(request.url).searchParams.get("campaignId")?.trim()||"";
 const [rows]=await db.query(
  `SELECT a.id,a.campaign_id,a.name,a.type,a.status,a.description,a.content,a.asset_url,a.placement,a.tracking_code,a.created_by,a.created_at,a.updated_at
     FROM campaign_assets a
    ${campaignId?"WHERE a.campaign_id=? ":""}
    AND a.workspace_id=? ORDER BY a.created_at DESC`,campaignId?[campaignId,access?.workspace.id]:[access?.workspace.id]
 );
 return NextResponse.json({assets:rows});
}

export async function POST(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage",typeof new URL(request.url).searchParams.get("workspaceId")==="string"?new URL(request.url).searchParams.get("workspaceId"):undefined); const actor=access?.user;
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await request.json();
  const campaignId=String(b.campaignId??"").trim();
  const name=String(b.name??"").trim();
  const type=String(b.type??"").toUpperCase();
  const status=String(b.status??"DRAFT").toUpperCase();
  const description=String(b.description??"").trim()||null;
  const content=String(b.content??"").trim()||null;
  const assetUrl=String(b.assetUrl??"").trim()||null;
  const placement=String(b.placement??"").trim()||null;
  const trackingCode=String(b.trackingCode??"").trim()||null;
  if(!campaignId||!name||!TYPES.has(type)||!STATUSES.has(status))return NextResponse.json({error:"Campaign, name, valid asset type and status are required."},{status:400});
  const [campaign]=await db.query<any[]>(`SELECT id FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1`,[campaignId,access?.workspace.id]);
  if(!campaign[0])return NextResponse.json({error:"Campaign not found."},{status:404});
  const id=randomUUID();
  await db.query(
   `INSERT INTO campaign_assets
    (id,workspace_id,campaign_id,name,type,status,description,content,asset_url,placement,tracking_code,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
   [id,access?.workspace.id,campaignId,name,type,status,description,content,assetUrl,placement,trackingCode,actor.email]
  );
  return NextResponse.json({ok:true,id},{status:201});
 }catch(error){
  console.error("CAMPAIGN_ASSET_CREATE_ERROR",error);
  return NextResponse.json({error:"Could not create campaign asset."},{status:500});
 }
}
