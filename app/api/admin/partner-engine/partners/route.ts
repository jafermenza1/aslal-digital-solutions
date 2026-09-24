import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  if(!(await authorizePermission("partners.manage"))) return NextResponse.json({error:"Unauthorized"},{status:401});
  type R=RowDataPacket&{id:string;name:string;email:string|null;type:string;status:string;verification_status:string;tier:string;bio:string|null;specialties:string|null;service_areas:string|null;audience_size:number|null;verified_at:Date|null;verified_by:string|null;campaigns:number;active_campaigns:number;clicks:number;leads:number;won:number;revenue:number|string|null;open_disputes:number;payouts_paid:number|string|null};
  const [rows]=await db.query<R[]>(`SELECT p.id,p.name,p.email,p.type,p.status,p.verification_status,p.tier,p.bio,p.specialties,p.service_areas,p.audience_size,p.verified_at,p.verified_by,
    (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.partner_id=p.id) campaigns,
    (SELECT COUNT(*) FROM campaign_partners cp WHERE cp.partner_id=p.id AND cp.status IN ('APPROVED','ACTIVE')) active_campaigns,
    (SELECT COUNT(*) FROM referral_clicks rc JOIN referral_links rl ON rl.id=rc.referral_link_id WHERE rl.partner_id=p.id) clicks,
    (SELECT COUNT(*) FROM leads l JOIN referral_links rl ON rl.code=l.referral_code WHERE rl.partner_id=p.id) leads,
    (SELECT COUNT(*) FROM leads l JOIN referral_links rl ON rl.code=l.referral_code WHERE rl.partner_id=p.id AND l.status='WON') won,
    (SELECT COALESCE(SUM(l.deal_value),0) FROM leads l JOIN referral_links rl ON rl.code=l.referral_code WHERE rl.partner_id=p.id AND l.status='WON') revenue,
    (SELECT COUNT(*) FROM partner_disputes d WHERE d.partner_id=p.id AND d.status IN ('OPEN','UNDER_REVIEW')) open_disputes,
    (SELECT COALESCE(SUM(pp.amount),0) FROM partner_payouts pp WHERE pp.partner_id=p.id AND pp.status='PAID') payouts_paid
    FROM partners p ORDER BY FIELD(p.tier,'ELITE','PRO','VERIFIED','STARTER'),p.name ASC LIMIT 500`);
  return NextResponse.json({partners:rows});
}
