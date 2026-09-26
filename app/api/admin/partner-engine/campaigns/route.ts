import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUSES = new Set(["DRAFT","OPEN","ACTIVE","PAUSED","COMPLETED","CANCELLED"]);
const REWARDS = new Set(["FIXED","PER_LEAD","PERCENT_SALE","HYBRID","MARGIN"]);
const TYPES = new Set(["AGENT","INFLUENCER","AFFILIATE","RESELLER"]);

type CampaignRow = RowDataPacket & { id:string; name:string; description:string|null; status:string; target_description:string|null; location:string|null; budget:number|string; partner_budget:number|string; currency:string; reward_type:string; reward_amount:number|string|null; reward_rate:number|string|null; required_partner_types:string|null; product_id:string|null; product_name:string|null; starts_at:Date|null; ends_at:Date|null; created_by:string|null; created_at:Date; partner_count:number; active_partner_count:number };

export async function GET(request:Request) {
  const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
  const [rows, products] = await Promise.all([
    db.query<CampaignRow[]>(`SELECT c.*, p.name product_name, r.title resource_title,
      (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.campaign_id=c.id) partner_count,
      (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.campaign_id=c.id AND cp.status IN ('APPROVED','ACTIVE','COMPLETED')) active_partner_count
      FROM partner_campaigns c LEFT JOIN products p ON p.id=c.product_id LEFT JOIN resources r ON r.id=c.resource_id WHERE c.workspace_id=? ORDER BY c.created_at DESC LIMIT 250`,[access.workspace.id]),
    db.query<RowDataPacket[]>(`SELECT id,name,kind FROM products WHERE active=1 ORDER BY name ASC LIMIT 250`),
    db.query<RowDataPacket[]>(`SELECT id,title,category FROM resources WHERE active=1 ORDER BY title ASC LIMIT 250`),
  ]);
  return NextResponse.json({campaigns:rows[0],products:products[0],resources:resources[0]});
}

export async function POST(request:Request) {
  const actor=await authorizeWorkspacePermission("partners.manage",typeof new URL(request.url).searchParams.get("workspaceId")==="string"?new URL(request.url).searchParams.get("workspaceId"):undefined);
  if(!actor) return NextResponse.json({error:"Unauthorized"},{status:401});
  try {
    const b=await request.json();
    const name=String(b.name??"").trim();
    const status=String(b.status??"DRAFT").toUpperCase();
    const rewardType=String(b.rewardType??"FIXED").toUpperCase();
    const budget=Number(b.budget??0);
    const partnerBudget=Number(b.partnerBudget??0);
    const rewardAmount=b.rewardAmount==null||b.rewardAmount===""?null:Number(b.rewardAmount);
    const rewardRate=b.rewardRate==null||b.rewardRate===""?null:Number(b.rewardRate);
    const currency=String(b.currency??"ETB").trim().toUpperCase();
    const types=Array.isArray(b.requiredPartnerTypes)?b.requiredPartnerTypes.map((v:unknown)=>String(v).toUpperCase()).filter((v:string)=>TYPES.has(v)):String(b.requiredPartnerTypes??"").split(",").map((v:string)=>v.trim().toUpperCase()).filter((v:string)=>TYPES.has(v));
    if(name.length<3||name.length>190) return NextResponse.json({error:"Campaign name must be 3–190 characters."},{status:400});
    if(!STATUSES.has(status)||!REWARDS.has(rewardType)) return NextResponse.json({error:"Invalid campaign status or reward type."},{status:400});
    if(!Number.isFinite(budget)||budget<0||!Number.isFinite(partnerBudget)||partnerBudget<0||partnerBudget>budget) return NextResponse.json({error:"Campaign budgets must be valid and partner budget cannot exceed total budget."},{status:400});
    if(rewardAmount!==null && (!Number.isFinite(rewardAmount)||rewardAmount<0)) return NextResponse.json({error:"Reward amount must be non-negative."},{status:400});
    if(rewardRate!==null && (!Number.isFinite(rewardRate)||rewardRate<0||rewardRate>100)) return NextResponse.json({error:"Reward rate must be between 0 and 100."},{status:400});
    if(!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({error:"Currency must be a 3-letter code."},{status:400});
    const id=crypto.randomUUID();
    
    const starts=b.startsAt?new Date(String(b.startsAt)):null;
    const ends=b.endsAt?new Date(String(b.endsAt)):null;
    if(starts && Number.isNaN(starts.getTime()) || ends && Number.isNaN(ends.getTime())) return NextResponse.json({error:"Invalid campaign dates."},{status:400});
    if(starts && ends && ends<starts) return NextResponse.json({error:"Campaign end must be after campaign start."},{status:400});
    const productId=String(b.productId??"").trim()||null;
    const resourceId=String(b.resourceId??"").trim()||null;
    if(productId&&resourceId)return NextResponse.json({error:"A campaign can associate with a product/service or a resource, not both."},{status:400});
    if(resourceId){const [rr]=await db.query<RowDataPacket[]>(`SELECT id FROM resources WHERE id=? AND active=1 LIMIT 1`,[resourceId]);if(!rr[0])return NextResponse.json({error:"Selected resource was not found or is inactive."},{status:400});}
    if(productId){const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM products WHERE id=? AND active=1 LIMIT 1`,[productId]); if(!p[0]) return NextResponse.json({error:"Selected product/service was not found or is inactive."},{status:400});}
    await db.query(`INSERT INTO partner_campaigns
      (id,workspace_id,name,description,status,target_description,location,budget,partner_budget,currency,reward_type,reward_amount,reward_rate,required_partner_types,product_id,starts_at,ends_at,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,actor.workspace.id,name,String(b.description??"").trim()||null,status,String(b.targetDescription??"").trim()||null,String(b.location??"").trim()||null,budget.toFixed(2),partnerBudget.toFixed(2),currency,rewardType,rewardAmount===null?null:rewardAmount.toFixed(2),rewardRate===null?null:rewardRate.toFixed(4),types.join(","),productId,resourceId,starts,ends,actor.user.email]);
    return NextResponse.json({ok:true,id},{status:201});
  } catch(error){console.error("PARTNER_CAMPAIGN_CREATE_ERROR",error);return NextResponse.json({error:"Could not create partner campaign."},{status:500});}
}
