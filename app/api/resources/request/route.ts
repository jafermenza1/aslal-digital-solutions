import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getOrCreateVisitor } from "@/lib/tracking";
import { normalizeEthiopianPhone } from "@/lib/ethiopian-phone";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { runLeadCreatedAutomation } from "@/lib/automation";
import type { RowDataPacket } from "mysql2/promise";

type ResourceRow=RowDataPacket&{id:string;slug:string;title:string;download_url:string|null;category:string;intent:string};

function clean(v:unknown,n=500){return typeof v==="string"?v.trim().slice(0,n):"";}
export async function POST(request:Request){
 try{
  const body=await request.json(); const resourceId=clean(body.resourceId,36), slug=clean(body.resourceSlug,160), name=clean(body.name,160), contact=clean(body.contact,190), channel=clean(body.channel,20)||"WEB";
  if(!resourceId||!slug||!name||!contact)return NextResponse.json({error:"Name, contact and resource are required."},{status:400});
  if(!["WEB","WHATSAPP","TELEGRAM"].includes(channel))return NextResponse.json({error:"Unsupported delivery channel."},{status:400});
  const [resources]=await db.query<ResourceRow[]>("SELECT id,slug,title,download_url,category,intent FROM resources WHERE id=? AND slug=? AND active=1 LIMIT 1",[resourceId,slug]);
  const resource=resources[0]; if(!resource)return NextResponse.json({error:"Resource is unavailable."},{status:404});
  if(!resource.download_url)return NextResponse.json({error:"This resource is currently being prepared. Please use the preview or request implementation help."},{status:409});
  const visitorId=await getOrCreateVisitor();
  const phone=normalizeEthiopianPhone(contact);
  const email=contact.includes("@")?contact.toLowerCase():null;
  const origin=new URL(request.url).origin;
  const cookie=request.headers.get("cookie")||"";
  const leadResponse=await fetch(new URL("/api/leads",origin),{method:"POST",headers:{"Content-Type":"application/json",cookie},body:JSON.stringify({name,email,phone:email?"":contact,message:`Resource request: ${resource.title}`,growthGoal:resource.intent})});
  const leadData=await leadResponse.json().catch(()=>({}));
  if(!leadResponse.ok)return NextResponse.json({error:leadData.error||"We could not create the lead record."},{status:leadResponse.status});
  const leadId=leadData.leadId||null;
  const scorePoints=resource.category==="tool"?20:10;
  const requestId=randomUUID();
  await db.query("INSERT INTO resource_requests (id,resource_id,lead_id,visitor_id,channel,contact_value,status,score_points,follow_up_due_at) VALUES (?,?,?,?,?,?,?,?,DATE_ADD(NOW(),INTERVAL 5 MINUTE))",[requestId,resourceId,leadId,visitorId,channel,contact,"REQUESTED",scorePoints]);
  await db.execute("INSERT INTO events (visitor_id,event_name,page_path,product_slug,metadata) VALUES (?,?,?,?,?)",[visitorId,"RESOURCE_DOWNLOAD",`/resources/${resource.slug}`,resource.slug,JSON.stringify({resourceId,category:resource.category,channel,requestId})]);
  let leadScore:number|null=null;
  if(leadId){try{const score=await recalculateLeadScore(leadId);leadScore=score.score;await runLeadCreatedAutomation(leadId);}catch(error){console.error("RESOURCE_LEAD_SCORING_ERROR",error);}}
  let deliveryMessage="Your resource is ready.";
  const downloadUrl=new URL(resource.download_url,origin).toString();
  if(channel==="WHATSAPP"){
    const token=process.env.WHATSAPP_ACCESS_TOKEN, phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
    if(token&&phoneId&&phone){
      const r=await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:phone.replace(/^\+/,""),type:"text",text:{body:`Aslal resource: ${resource.title}
${downloadUrl}`}})});
      if(r.ok){await db.query("UPDATE resource_requests SET status='DELIVERED' WHERE id=?",[requestId]);deliveryMessage="The resource link was sent to WhatsApp.";}else deliveryMessage="The request was recorded. WhatsApp delivery is not currently available, so download it below.";
    } else deliveryMessage="The request was recorded. WhatsApp delivery is not configured, so download it below.";
  } else if(channel==="TELEGRAM"){
    const token=process.env.TELEGRAM_BOT_TOKEN;
    const chatId=/^-?\d+$/.test(contact)?contact:"";
    if(token&&chatId){
      const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text:`Aslal resource: ${resource.title}
${downloadUrl}`,disable_web_page_preview:true})});
      if(r.ok){await db.query("UPDATE resource_requests SET status='DELIVERED' WHERE id=?",[requestId]);deliveryMessage="The resource link was sent to Telegram.";}else deliveryMessage="The request was recorded. Telegram delivery is not available for this contact, so download it below.";
    } else deliveryMessage="The request was recorded. Connect your Telegram chat to receive automated delivery.";
  }
  return NextResponse.json({ok:true,requestId,leadId,leadScore,downloadUrl,deliveryMessage});
 }catch(error){console.error("RESOURCE_REQUEST_ERROR",error);return NextResponse.json({error:"Unable to process the resource request right now."},{status:500});}
}