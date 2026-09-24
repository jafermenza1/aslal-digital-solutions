import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(){
  const user=await authorizePermission("partner.portal.view");
  if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const [ur]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
    const partnerId=ur[0]?.partner_id;
    if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
    type R=RowDataPacket&{id:string;name:string;description:string|null;status:string;target_description:string|null;location:string|null;budget:number|string;partner_budget:number|string;currency:string;reward_type:string;reward_amount:number|string|null;reward_rate:number|string|null;required_partner_types:string|null;product_id:string|null;product_name:string|null;starts_at:Date|null;ends_at:Date|null;application_status:string|null;campaign_partner_id:string|null};
    const [rows]=await db.query<R[]>(`SELECT c.id,c.name,c.description,c.status,c.target_description,c.location,c.budget,c.partner_budget,c.currency,c.reward_type,c.reward_amount,c.reward_rate,c.required_partner_types,c.product_id,p.name product_name,c.starts_at,c.ends_at,
      cp.status application_status,cp.id campaign_partner_id
      FROM partner_campaigns c LEFT JOIN products p ON p.id=c.product_id
      LEFT JOIN campaign_partners cp ON cp.campaign_id=c.id AND cp.partner_id=?
      WHERE c.status IN ('OPEN','ACTIVE') ORDER BY c.starts_at IS NULL,c.starts_at ASC,c.created_at DESC LIMIT 100`,[partnerId]);
    const filtered=rows.filter(c=>!c.required_partner_types||c.required_partner_types.split(",").map(v=>v.trim()).includes(user.role==="PARTNER"?"AGENT":"AGENT"));
    return NextResponse.json({campaigns:filtered});
  }catch(error){console.error("PARTNER_OPPORTUNITIES_ERROR",error);return NextResponse.json({error:"Could not load partner opportunities."},{status:500});}
}
