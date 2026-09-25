import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await authorizePermission("partner.portal.view");
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id:campaignId}=await params;
  try{
    const [u]=await db.query<(RowDataPacket & {partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
    const partnerId=u[0]?.partner_id;if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
    const [p]=await db.query<(RowDataPacket & {type:string;status:string;verification_status:string})[]>(`SELECT type,status,verification_status,workspace_id FROM partners WHERE id=? LIMIT 1`,[partnerId]);
    if(!p[0])return NextResponse.json({error:"Partner profile not found."},{status:404});
    if(p[0].status!=="ACTIVE"||p[0].verification_status!=="VERIFIED")return NextResponse.json({error:"Partner verification must be ACTIVE and VERIFIED before applying to campaigns."},{status:403});
    const [c]=await db.query<(RowDataPacket & {id:string;status:string;required_partner_types:string|null})[]>(`SELECT id,status,required_partner_types,workspace_id FROM partner_campaigns WHERE id=? LIMIT 1`,[campaignId]);
    if(!c[0])return NextResponse.json({error:"Campaign not found."},{status:404});\n    if(!p[0].workspace_id||p[0].workspace_id!==c[0].workspace_id)return NextResponse.json({error:"Campaign is outside your workspace."},{status:403});
    if(!["OPEN","ACTIVE"].includes(c[0].status))return NextResponse.json({error:"This campaign is not accepting partner applications."},{status:409});
    const required=(c[0].required_partner_types||"").split(",").map(v=>v.trim()).filter(Boolean);
    if(required.length&&!required.includes(p[0].type))return NextResponse.json({error:"This campaign is not recruiting your partner type."},{status:403});
    const [existing]=await db.query<(RowDataPacket & {status:string})[]>(`SELECT status FROM campaign_partners WHERE campaign_id=? AND partner_id=? LIMIT 1`,[campaignId,partnerId]);
    if(existing[0])return NextResponse.json({ok:true,status:existing[0].status,alreadyApplied:true});
    await db.query(`INSERT INTO campaign_partners (id,campaign_id,partner_id,status,role) VALUES (?,?,?,?,?)`,[crypto.randomUUID(),campaignId,partnerId,"APPLIED",p[0].type]);
    return NextResponse.json({ok:true,status:"APPLIED"},{status:201});
  }catch(error){console.error("PARTNER_CAMPAIGN_APPLY_ERROR",error);return NextResponse.json({error:"Could not apply to campaign."},{status:500});}
}
