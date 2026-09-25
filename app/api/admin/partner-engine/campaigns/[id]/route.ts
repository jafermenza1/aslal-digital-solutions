import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const STATUSES=new Set(["DRAFT","OPEN","ACTIVE","PAUSED","COMPLETED","CANCELLED"]);
const REWARDS=new Set(["FIXED","PER_LEAD","PERCENT_SALE","HYBRID","MARGIN"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const body=await request.json().catch(()=>({})); const actor=await authorizeWorkspacePermission("partners.manage",typeof body.workspaceId==="string"?body.workspaceId:undefined); if(!actor)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 const {id}=await params;
 try{
  const b=body;const fields:string[]=[];const values:unknown[]=[];
  if(b.status!==undefined){const v=String(b.status).toUpperCase();if(!STATUSES.has(v))return NextResponse.json({error:"Invalid campaign status."},{status:400});fields.push("status=?");values.push(v);}
  if(b.name!==undefined){const v=String(b.name).trim();if(v.length<3||v.length>190)return NextResponse.json({error:"Campaign name must be 3–190 characters."},{status:400});fields.push("name=?");values.push(v);}
  if(b.description!==undefined){fields.push("description=?");values.push(String(b.description||"").trim()||null);}
  if(b.targetDescription!==undefined){fields.push("target_description=?");values.push(String(b.targetDescription||"").trim()||null);}
  if(b.location!==undefined){fields.push("location=?");values.push(String(b.location||"").trim()||null);}
  if(b.productId!==undefined){const productId=String(b.productId||"").trim()||null;if(productId){const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM products WHERE id=? AND active=1 LIMIT 1`,[productId]);if(!p[0])return NextResponse.json({error:"Selected product/service was not found or is inactive."},{status:400});}fields.push("product_id=?");values.push(productId);}
  if(b.rewardType!==undefined){const v=String(b.rewardType).toUpperCase();if(!REWARDS.has(v))return NextResponse.json({error:"Invalid reward type."},{status:400});fields.push("reward_type=?");values.push(v);}
  if(b.requiredPartnerTypes!==undefined){const allowed=new Set(["AGENT","INFLUENCER","AFFILIATE","RESELLER"]);const v=(Array.isArray(b.requiredPartnerTypes)?b.requiredPartnerTypes:String(b.requiredPartnerTypes).split(",")).map((x:string)=>x.trim().toUpperCase()).filter((x:string)=>allowed.has(x));fields.push("required_partner_types=?");values.push(v.join(","));}
  if(b.budget!==undefined||b.partnerBudget!==undefined){const [current]=await db.query<(RowDataPacket & {budget:number|string;partner_budget:number|string})[]>(`SELECT budget,partner_budget FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1`,[id,actor.workspace.id]);if(!current[0])return NextResponse.json({error:"Campaign not found."},{status:404});const budget=b.budget===undefined?Number(current[0].budget):Number(b.budget),partnerBudget=b.partnerBudget===undefined?Number(current[0].partner_budget):Number(b.partnerBudget);if(!Number.isFinite(budget)||budget<0||!Number.isFinite(partnerBudget)||partnerBudget<0||partnerBudget>budget)return NextResponse.json({error:"Invalid campaign budgets."},{status:400});fields.push("budget=?","partner_budget=?");values.push(budget.toFixed(2),partnerBudget.toFixed(2));}
  if(!fields.length)return NextResponse.json({error:"No campaign changes supplied."},{status:400});
  values.push(id);values.push(id,actor.workspace.id); const [result]=await db.query<ResultSetHeader>(`UPDATE partner_campaigns SET ${fields.join(", ")} WHERE id=? AND workspace_id=?`,values);
  if(!result.affectedRows)return NextResponse.json({error:"Campaign not found."},{status:404});
  return NextResponse.json({ok:true,updatedBy:actor.email});
 }catch(error){console.error("PARTNER_CAMPAIGN_UPDATE_ERROR",error);return NextResponse.json({error:"Could not update campaign."},{status:500});}
}
