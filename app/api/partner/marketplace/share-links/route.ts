import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
function enc(v: string) { return encodeURIComponent(v); }
export async function POST(request: Request) {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await request.json();
    const productId = String(b.productId || "").trim() || null;
    const resourceId = String(b.resourceId || "").trim() || null;
    const campaignId = String(b.campaignId || "").trim() || null;
    const requestedWorkspaceId = String(b.workspaceId || "").trim() || null;
    if (!productId && !resourceId) return NextResponse.json({ error: "productId or resourceId is required." }, { status: 400 });
    const [partners] = await db.query<any[]>("SELECT p.id,p.workspace_id,p.partner_number,p.name,p.type,p.account_status FROM partners p JOIN users u ON u.partner_id=p.id WHERE u.id=? LIMIT 1",[user.id]);
    const partner = partners[0];
    if (!partner) return NextResponse.json({ error: "Partner account is not linked." }, { status: 404 });
    if (partner.account_status !== "ACTIVE") return NextResponse.json({ error: "Only ACTIVE partners can generate marketplace attribution links." }, { status: 403 });
    let destination="/",title="",description="";
    let targetWorkspaceId=partner.workspace_id;
    if(requestedWorkspaceId){
      const [accessRows]=await db.query<any[]>(`SELECT p.id FROM partners p WHERE p.id=? AND p.account_status="ACTIVE" AND EXISTS (SELECT 1 FROM commission_contracts cc WHERE cc.partner_id=p.id AND cc.workspace_id=? AND cc.status="ACTIVE") LIMIT 1`,[partner.id,requestedWorkspaceId]);
      if(!accessRows[0])return NextResponse.json({error:"Partner is not an active participant in the requested business workspace."},{status:403});
      targetWorkspaceId=requestedWorkspaceId;
    }
    if (productId) {
      const [rows] = await db.query<any[]>("SELECT id,slug,name,short_description,active,workspace_id FROM products WHERE id=? AND (workspace_id=? OR workspace_id IS NULL) LIMIT 1",[productId,targetWorkspaceId]);
      const product=rows[0];
      if(!product||!product.active)return NextResponse.json({error:"Product not found or inactive."},{status:404});
      destination="/products/"+enc(product.slug); title=product.name; description=product.short_description||"";
    } else {
      const [rows] = await db.query<any[]>("SELECT id,slug,title,description,active,workspace_id FROM resources WHERE id=? AND (workspace_id=? OR workspace_id IS NULL) LIMIT 1",[resourceId,targetWorkspaceId]);
      const resource=rows[0];
      if(!resource||!resource.active)return NextResponse.json({error:"Resource not found or inactive."},{status:404});
      destination="/resources/"+enc(resource.slug); title=resource.title; description=resource.description||"";
    }
    const code = "p"+randomUUID().replace(/-/g,"").slice(0,14).toLowerCase();
    const referralLinkId = randomUUID();
    const publicBase=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
    const referralUrl=publicBase+"/go/"+code;
    await db.query("INSERT INTO referral_links (id,workspace_id,partner_id,code,campaign,product_slug,destination_path) VALUES (?,?,?,?,?,?,?)",[referralLinkId,targetWorkspaceId,partner.id,code,campaignId,destination.startsWith("/products/")?destination.slice(10):null,destination]);
    const shareId=randomUUID();
    await db.query("INSERT INTO partner_share_links (id,workspace_id,partner_id,referral_link_id,product_id,resource_id,campaign_id,destination_path,share_title,share_text) VALUES (?,?,?,?,?,?,?,?,?,?)",[shareId,targetWorkspaceId,partner.id,referralLinkId,productId,resourceId,campaignId,destination,title,description]);
    const shareText=(title+" — "+description).slice(0,1000);
    const [connectionRows]=await db.query<any[]>(`SELECT bot_username FROM telegram_business_connections WHERE workspace_id=? AND status="ACTIVE" AND bot_username IS NOT NULL ORDER BY connection_type="BUSINESS" DESC, created_at ASC LIMIT 1`,[targetWorkspaceId]);
    const botUsername=connectionRows[0]?.bot_username?String(connectionRows[0].bot_username).replace(/^@/,""):null;
    const telegramDeepLink=botUsername?`https://t.me/${encodeURIComponent(botUsername)}?start=${encodeURIComponent(code)}`:null;
    return NextResponse.json({ok:true,shareId,partnerNumber:partner.partner_number,referralCode:code,referralUrl,destinationPath:destination,share:{title,text:shareText,url:referralUrl},telegramDeepLink,connection:{botUsername},social:{whatsapp:"https://wa.me/?text="+enc(shareText+" "+referralUrl),telegram:"https://t.me/share/url?url="+enc(referralUrl)+"&text="+enc(shareText),facebook:"https://www.facebook.com/sharer/sharer.php?u="+enc(referralUrl),x:"https://twitter.com/intent/tweet?url="+enc(referralUrl)+"&text="+enc(shareText),linkedin:"https://www.linkedin.com/sharing/share-offsite/?url="+enc(referralUrl),email:"mailto:?subject="+enc(title)+"&body="+enc(shareText+"\n\n"+referralUrl)},webShareSupported:true},{status:201});
  } catch(e) { console.error("PARTNER_SHARE_LINK_ERROR",e); return NextResponse.json({error:"Could not generate partner attribution link."},{status:500}); }
}