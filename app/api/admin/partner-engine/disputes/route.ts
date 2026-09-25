import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

export async function GET(){
 if(!(await authorizePermission("partners.manage")))return NextResponse.json({error:"Unauthorized"},{status:401});
 const [rows]=await db.query(
  `SELECT d.id,d.partner_id,p.name partner_name,d.competing_partner_id,cp.name competing_partner_name,
          d.awarded_partner_id,ap.name awarded_partner_name,d.lead_id,d.campaign_id,c.name campaign_name,
          d.commission_id,d.subject,d.description,d.evidence_ref,d.decision_notes,d.status,d.resolution,
          d.resolved_by,d.resolved_at,d.created_at
     FROM partner_disputes d
     JOIN partners p ON p.id=d.partner_id
     LEFT JOIN partners cp ON cp.id=d.competing_partner_id
     LEFT JOIN partners ap ON ap.id=d.awarded_partner_id
     LEFT JOIN partner_campaigns c ON c.id=d.campaign_id
    ORDER BY d.created_at DESC LIMIT 250`
 );
 return NextResponse.json({disputes:rows});
}
