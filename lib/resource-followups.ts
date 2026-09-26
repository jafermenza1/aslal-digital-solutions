import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

type RequestRow=RowDataPacket&{id:string;channel:string;contact_value:string|null;title:string;slug:string;download_url:string;follow_up_due_at:Date};

async function sendTelegram(chatId:string,text:string){const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)throw new Error("TELEGRAM_BOT_TOKEN is not configured");const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});if(!r.ok)throw new Error("Telegram follow-up failed");}
async function sendWhatsApp(phone:string,text:string){const token=process.env.WHATSAPP_ACCESS_TOKEN,phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;if(!token||!phoneId)throw new Error("WhatsApp Cloud API is not configured");const r=await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:phone.replace(/^\+/,""),type:"text",text:{body:text}})});if(!r.ok)throw new Error("WhatsApp follow-up failed");}
export async function runResourceFollowUps(){
 const [rows]=await db.query<RequestRow[]>(`SELECT rr.id,rr.channel,rr.contact_value,r.title,r.slug,r.download_url,rr.follow_up_due_at FROM resource_requests rr INNER JOIN resources r ON r.id=rr.resource_id WHERE rr.follow_up_due_at<=NOW() AND rr.follow_up_sent_at IS NULL AND rr.status IN ('REQUESTED','DELIVERED') ORDER BY rr.follow_up_due_at ASC LIMIT 50`);
 let sent=0,failed=0;
 for(const row of rows){
  const text=`Did you get the Aslal resource “${row.title}”? Would you like help implementing the next step for your business? ${(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com")}/resources/${encodeURIComponent(row.slug)}`;
  try{
   if(row.channel==="TELEGRAM" && row.contact_value) await sendTelegram(row.contact_value,text);
   else if(row.channel==="WHATSAPP" && row.contact_value) await sendWhatsApp(row.contact_value,text);
   else {await db.query("UPDATE resource_requests SET follow_up_sent_at=NOW(),status='FOLLOW_UP_SKIPPED' WHERE id=?",[row.id]);continue;}
   await db.query("UPDATE resource_requests SET follow_up_sent_at=NOW(),status='FOLLOW_UP_SENT' WHERE id=?",[row.id]);sent++;
  }catch(error){failed++;console.error("RESOURCE_FOLLOWUP_ERROR",row.id,error);}
 }
 return {processed:rows.length,sent,failed};
}
