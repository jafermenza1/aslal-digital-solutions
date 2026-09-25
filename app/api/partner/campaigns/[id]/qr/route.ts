import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await authorizePermission("partner.portal.view");
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id:campaignId}=await params;
  try{
    const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
    const partnerId=u[0]?.partner_id;
    if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
    const [rows]=await db.query<(RowDataPacket&{code:string})[]>(`SELECT rl.code FROM referral_links rl JOIN partners p ON p.id=rl.partner_id INNER JOIN campaign_partners cp ON cp.campaign_id=rl.campaign_id AND cp.partner_id=rl.partner_id WHERE rl.campaign_id=? AND rl.partner_id=? AND p.workspace_id=rl.workspace_id AND EXISTS (SELECT 1 FROM partner_campaigns c WHERE c.id=rl.campaign_id AND c.workspace_id=rl.workspace_id) AND cp.status IN ('APPROVED','ACTIVE') LIMIT 1`,[campaignId,partnerId]);
    if(!rows[0])return NextResponse.json({error:"Campaign referral link is not available yet."},{status:404});
    const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
    const png=await QRCode.toBuffer(site+"/go/"+rows[0].code,{type:"png",width:360,margin:1});
    return new NextResponse(new Uint8Array(png),{status:200,headers:{"content-type":"image/png","cache-control":"private, max-age=300"}});
  }catch(error){console.error("PARTNER_CAMPAIGN_QR_ERROR",error);return NextResponse.json({error:"Could not generate campaign QR."},{status:500});}
}
