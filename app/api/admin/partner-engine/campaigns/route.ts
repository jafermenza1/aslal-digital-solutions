import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUSES = new Set(["DRAFT","OPEN","ACTIVE","PAUSED","COMPLETED","CANCELLED"]);
const REWARDS = new Set(["FIXED","PER_LEAD","PERCENT_SALE","HYBRID","MARGIN"]);
const TYPES = new Set(["AGENT","INFLUENCER","AFFILIATE","RESELLER"]);
const DELIVERY_MODES = new Set(["ONLINE","OFFLINE","HYBRID"]);

type CampaignRow = RowDataPacket & {
  id:string; name:string; program_id:string|null; program_name:string|null; description:string|null;
  status:string; target_description:string|null; delivery_mode:string; location:string|null;
  budget:number|string; partner_budget:number|string; currency:string; reward_type:string;
  reward_amount:number|string|null; reward_rate:number|string|null; required_partner_types:string|null;
  product_id:string|null; product_name:string|null; resource_id:string|null; resource_title:string|null;
  starts_at:Date|null; ends_at:Date|null; created_by:string|null; created_at:Date;
  partner_count:number; active_partner_count:number; service_area_names:string|null;
};

function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(v => String(v).trim()).filter(Boolean))];
}

function rewardError(rewardType:string, rewardAmount:number|null, rewardRate:number|null) {
  if (["FIXED","PER_LEAD"].includes(rewardType) && (rewardAmount === null || rewardAmount <= 0)) return "This reward model requires a positive reward amount.";
  if (["PERCENT_SALE","MARGIN"].includes(rewardType) && (rewardRate === null || rewardRate <= 0)) return "This reward model requires a positive percentage/rate.";
  if (rewardType === "HYBRID" && (rewardAmount === null || rewardAmount <= 0 || rewardRate === null || rewardRate <= 0)) return "Hybrid rewards require both a positive amount and a positive rate.";
  return null;
}

export async function GET(request:Request) {
  const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
  const workspaceId=access.workspace.id;
  const [campaignResult, productResult, resourceResult, areaResult] = await Promise.all([
    db.query<CampaignRow[]>(`SELECT c.*, pp.name program_name, p.name product_name, r.title resource_title,
      (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.campaign_id=c.id) partner_count,
      (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.campaign_id=c.id AND cp.status IN ('APPROVED','ACTIVE','COMPLETED')) active_partner_count,
      (SELECT GROUP_CONCAT(CONCAT(o.area_type, ': ', o.name) ORDER BY o.area_type,o.name SEPARATOR ', ') FROM partner_campaign_service_areas ca JOIN campaign_service_area_options o ON o.id=ca.service_area_id WHERE ca.campaign_id=c.id AND o.active=1) service_area_names
      FROM partner_campaigns c
      LEFT JOIN partner_programs pp ON pp.id=c.program_id AND pp.workspace_id=c.workspace_id
      LEFT JOIN products p ON p.id=c.product_id AND (p.workspace_id=c.workspace_id OR p.workspace_id IS NULL)
      LEFT JOIN resources r ON r.id=c.resource_id AND (r.workspace_id=c.workspace_id OR r.workspace_id IS NULL)
      WHERE c.workspace_id=? ORDER BY c.created_at DESC LIMIT 250`,[workspaceId]),
    db.query<RowDataPacket[]>(`SELECT id,name,kind FROM products WHERE active=1 AND (workspace_id=? OR workspace_id IS NULL) ORDER BY name ASC LIMIT 250`,[workspaceId]),
    db.query<RowDataPacket[]>(`SELECT id,title,category FROM resources WHERE active=1 AND (workspace_id=? OR workspace_id IS NULL) ORDER BY title ASC LIMIT 250`,[workspaceId]),
    db.query<RowDataPacket[]>(`SELECT id,area_type,name,active FROM campaign_service_area_options WHERE workspace_id=? AND active=1 ORDER BY area_type,name ASC LIMIT 500`,[workspaceId]),
  ]);
  const [campaigns]=campaignResult;
  const [products]=productResult;
  const [resources]=resourceResult;
  const [areas]=areaResult;
  return NextResponse.json({campaigns,products,resources,serviceAreas:areas});
}

export async function POST(request:Request) {
  const actor=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId") || undefined);
  if(!actor) return NextResponse.json({error:"Unauthorized"},{status:401});
  try {
    const b=await request.json();
    const name=String(b.name??"").trim();
    const status=String(b.status??"DRAFT").toUpperCase();
    const rewardType=String(b.rewardType??"FIXED").toUpperCase();
    const deliveryMode=String(b.deliveryMode??"ONLINE").toUpperCase();
    const budget=Number(b.budget??0);
    const partnerBudget=Number(b.partnerBudget??0);
    const rewardAmount=b.rewardAmount==null||b.rewardAmount===""?null:Number(b.rewardAmount);
    const rewardRate=b.rewardRate==null||b.rewardRate===""?null:Number(b.rewardRate);
    const currency=String(b.currency??"ETB").trim().toUpperCase();
    const types=Array.isArray(b.requiredPartnerTypes)
      ? [...new Set(b.requiredPartnerTypes.map((v:unknown)=>String(v).toUpperCase()).filter((v:string)=>TYPES.has(v)))]
      : String(b.requiredPartnerTypes??"").split(",").map((v:string)=>v.trim().toUpperCase()).filter((v:string)=>TYPES.has(v));
    const serviceAreaIds=parseIds(b.serviceAreaIds);

    if(name.length<3||name.length>190) return NextResponse.json({error:"Campaign name must be 3–190 characters."},{status:400});
    if(!STATUSES.has(status)||!REWARDS.has(rewardType)||!DELIVERY_MODES.has(deliveryMode)) return NextResponse.json({error:"Invalid campaign status, reward model, or delivery mode."},{status:400});
    if(!Number.isFinite(budget)||budget<=0||!Number.isFinite(partnerBudget)||partnerBudget<0||partnerBudget>budget) return NextResponse.json({error:"Total budget must be positive and partner budget cannot exceed total budget."},{status:400});
    if(rewardAmount!==null && (!Number.isFinite(rewardAmount)||rewardAmount<0)) return NextResponse.json({error:"Reward amount must be non-negative."},{status:400});
    if(rewardRate!==null && (!Number.isFinite(rewardRate)||rewardRate<0||rewardRate>100)) return NextResponse.json({error:"Reward rate must be between 0 and 100."},{status:400});
    const rewardValidation=rewardError(rewardType,rewardAmount,rewardRate);
    if(rewardValidation) return NextResponse.json({error:rewardValidation},{status:400});
    if(!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({error:"Currency must be a 3-letter code."},{status:400});
    if(deliveryMode!=="ONLINE" && !serviceAreaIds.length) return NextResponse.json({error:"Offline or hybrid campaigns must select at least one supported city or event."},{status:400});

    const starts=b.startsAt?new Date(String(b.startsAt)):null;
    const ends=b.endsAt?new Date(String(b.endsAt)):null;
    if(starts && Number.isNaN(starts.getTime()) || ends && Number.isNaN(ends.getTime())) return NextResponse.json({error:"Invalid campaign dates."},{status:400});
    if(starts && ends && ends<starts) return NextResponse.json({error:"Campaign end must be after campaign start."},{status:400});

    const programId=String(b.programId??"").trim()||null;
    const productId=String(b.productId??"").trim()||null;
    const resourceId=String(b.resourceId??"").trim()||null;
    if(programId){
      const [pr]=await db.query<RowDataPacket[]>(`SELECT id,status FROM partner_programs WHERE id=? AND workspace_id=? LIMIT 1`,[programId,actor.workspace.id]);
      if(!pr[0])return NextResponse.json({error:"Selected partner program was not found in this workspace."},{status:400});
      if(["ARCHIVED"].includes(String(pr[0].status)))return NextResponse.json({error:"Archived partner programs cannot receive new campaigns."},{status:400});
    }
    if(productId&&resourceId)return NextResponse.json({error:"A campaign can associate with a product/service or a resource, not both."},{status:400});
    if(resourceId){
      const [rr]=await db.query<RowDataPacket[]>(`SELECT id FROM resources WHERE id=? AND active=1 AND (workspace_id=? OR workspace_id IS NULL) LIMIT 1`,[resourceId,actor.workspace.id]);
      if(!rr[0])return NextResponse.json({error:"Selected resource was not found or is inactive."},{status:400});
    }
    if(productId){
      const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM products WHERE id=? AND active=1 AND (workspace_id=? OR workspace_id IS NULL) LIMIT 1`,[productId,actor.workspace.id]);
      if(!p[0])return NextResponse.json({error:"Selected product/service was not found or is inactive."},{status:400});
    }
    if(serviceAreaIds.length){
      const placeholders=serviceAreaIds.map(()=>"?").join(",");
      const [areas]=await db.query<RowDataPacket[]>(`SELECT id FROM campaign_service_area_options WHERE workspace_id=? AND active=1 AND id IN (${placeholders})`,[actor.workspace.id,...serviceAreaIds]);
      if(areas.length!==serviceAreaIds.length)return NextResponse.json({error:"One or more selected service areas are not available in this workspace."},{status:400});
    }

    const id=crypto.randomUUID();
    const conn=await db.getConnection();
    try{
      await conn.beginTransaction();
      await conn.query(`INSERT INTO partner_campaigns
        (id,workspace_id,name,description,status,target_description,delivery_mode,location,budget,partner_budget,currency,reward_type,reward_amount,reward_rate,required_partner_types,program_id,product_id,resource_id,starts_at,ends_at,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id,actor.workspace.id,name,String(b.description??"").trim()||null,status,String(b.targetDescription??"").trim()||null,deliveryMode,null,budget.toFixed(2),partnerBudget.toFixed(2),currency,rewardType,rewardAmount===null?null:rewardAmount.toFixed(2),rewardRate===null?null:rewardRate.toFixed(4),types.join(","),programId,productId,resourceId,starts,ends,actor.user.email]);
      for(const areaId of serviceAreaIds) await conn.query(`INSERT INTO partner_campaign_service_areas (campaign_id,service_area_id) VALUES (?,?)`,[id,areaId]);
      await conn.commit();
    }catch(error){
      await conn.rollback();
      throw error;
    }finally{conn.release();}
    return NextResponse.json({ok:true,id},{status:201});
  } catch(error){console.error("PARTNER_CAMPAIGN_CREATE_ERROR",error);return NextResponse.json({error:error instanceof Error?error.message:"Could not create partner campaign."},{status:500});}
}
