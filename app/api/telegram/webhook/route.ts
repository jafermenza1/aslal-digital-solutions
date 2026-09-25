import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  chat?: { id?: number | string; type?: string; title?: string; username?: string };
  from?: { id?: number; first_name?: string; last_name?: string; username?: string };
  text?: string;
};
type TelegramUpdate = { message?: TelegramMessage };

type Partner = RowDataPacket & { id:string; name:string; partner_number:string; workspace_id:string; status:string; verification_status:string; type:string };
type Campaign = RowDataPacket & { id:string; name:string; description:string|null; status:string; target_description:string|null; location:string|null; product_name:string|null; partner_budget:number|string; currency:string; reward_type:string; reward_amount:number|string|null; reward_rate:number|string|null; application_status:string|null; referral_code:string|null; required_partner_types:string|null };

const clean=(v:unknown)=>String(v??"").trim();
const money=(v:unknown)=>Number(v??0).toLocaleString("en-ET",{maximumFractionDigits:2});

async function tg(method:string,body:Record<string,unknown>){
  const token=process.env.TELEGRAM_BOT_TOKEN;
  if(!token)throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const r=await fetch("https://api.telegram.org/bot"+token+"/"+method,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok)throw new Error("Telegram API request failed");
  return r.json();
}
const reply=(chatId:string,text:string)=>tg("sendMessage",{chat_id:chatId,text,disable_web_page_preview:true});

async function partnerForChat(chatId:string){
  const [rows]=await db.query<Partner[]>("SELECT id,name,partner_number,workspace_id,status,verification_status,type FROM partners WHERE telegram_chat_id=? LIMIT 1",[chatId]);
  return rows[0]||null;
}

async function help(chatId:string){
  return reply(chatId,["Aslal Telegram Workbench","","Partners:","/campaigns — active campaigns","/campaign <id> — campaign details and published materials","/apply <id> — apply to a campaign","/links — your referral links","/earnings — commission and payout status","/me — identity","/help — this menu","","Internal sales users are linked from the Aslal dashboard. Client replies are automatically recorded, follow-up is stopped, and the assigned salesperson/admin is alerted."].join("\n"));
}

async function campaigns(chatId:string,p:Partner){
  const [rows]=await db.query<Campaign[]>(`SELECT c.id,c.name,c.description,c.status,c.target_description,c.location,p.name product_name,c.partner_budget,c.currency,c.reward_type,c.reward_amount,c.reward_rate,cp.status application_status,rl.code referral_code,c.required_partner_types FROM partner_campaigns c LEFT JOIN products p ON p.id=c.product_id LEFT JOIN campaign_partners cp ON cp.campaign_id=c.id AND cp.partner_id=? LEFT JOIN referral_links rl ON rl.campaign_id=c.id AND rl.partner_id=? AND rl.workspace_id=c.workspace_id WHERE c.workspace_id=? AND c.status IN ('OPEN','ACTIVE') ORDER BY c.starts_at IS NULL,c.starts_at ASC,c.created_at DESC LIMIT 20`,[p.id,p.id,p.workspace_id]);
  const eligible=rows.filter(c=>{const required=clean(c.required_partner_types);return !required||required.split(",").map(v=>v.trim()).includes(p.type);});
  if(!eligible.length)return reply(chatId,"No active campaigns are currently available for your workspace.");
  return reply(chatId,eligible.map(c=>[c.name,"ID: "+c.id,c.product_name?"Product: "+c.product_name:"","Reward: "+c.reward_type+(c.reward_amount!=null?" "+money(c.reward_amount)+" "+c.currency:c.reward_rate!=null?" "+c.reward_rate+"%":""),c.application_status?"Application: "+c.application_status:"Not applied","/campaign "+c.id].filter(Boolean).join("\n")).join("\n\n"));
}

async function campaign(chatId:string,p:Partner,id:string){
  const [rows]=await db.query<Campaign[]>(`SELECT c.id,c.name,c.description,c.status,c.target_description,c.location,p.name product_name,c.partner_budget,c.currency,c.reward_type,c.reward_amount,c.reward_rate,cp.status application_status,rl.code referral_code,c.required_partner_types FROM partner_campaigns c LEFT JOIN products p ON p.id=c.product_id LEFT JOIN campaign_partners cp ON cp.campaign_id=c.id AND cp.partner_id=? LEFT JOIN referral_links rl ON rl.campaign_id=c.id AND rl.partner_id=? AND rl.workspace_id=c.workspace_id WHERE c.id=? AND c.workspace_id=? AND c.status IN ('OPEN','ACTIVE') LIMIT 1`,[p.id,p.id,id,p.workspace_id]);
  const c=rows[0];if(!c)return reply(chatId,"Campaign not found or unavailable in your workspace.");
  const [assets]=await db.query<(RowDataPacket&{name:string;type:string;description:string|null;content:string|null;asset_url:string|null;placement:string|null})[]>(`SELECT name,type,description,content,asset_url,placement FROM campaign_assets WHERE campaign_id=? AND workspace_id=? AND status='PUBLISHED' ORDER BY created_at ASC LIMIT 30`,[id,p.workspace_id]);
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
  return reply(chatId,[c.name,"ID: "+c.id,c.product_name?"Product: "+c.product_name:"",c.location?"Location: "+c.location:"",c.description||c.target_description||"","Reward: "+c.reward_type+(c.reward_amount!=null?" "+money(c.reward_amount)+" "+c.currency:c.reward_rate!=null?" "+c.reward_rate+"%":""),c.application_status?"Application: "+c.application_status:"Not applied",c.referral_code?"Referral: "+site+"/go/"+c.referral_code:"","", "Published materials:",assets.length?assets.map(a=>[a.name,a.type,a.asset_url||a.content||"",a.placement?"Placement: "+a.placement:""].filter(Boolean).join("\n")).join("\n\n"):"No published materials yet."].filter(Boolean).join("\n"));
}

async function apply(chatId:string,p:Partner,id:string){
  const [pr]=await db.query<(RowDataPacket&{type:string})[]>("SELECT type FROM partners WHERE id=? AND workspace_id=? AND status='ACTIVE' AND verification_status='VERIFIED' LIMIT 1",[p.id,p.workspace_id]);
  if(!pr[0])return reply(chatId,"Your partner account must be ACTIVE and VERIFIED to apply.");
  const [c]=await db.query<(RowDataPacket&{id:string;status:string;required_partner_types:string|null})[]>("SELECT id,status,required_partner_types FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1",[id,p.workspace_id]);
  if(!c[0])return reply(chatId,"Campaign not found in your workspace.");
  if(!["OPEN","ACTIVE"].includes(c[0].status))return reply(chatId,"This campaign is not accepting applications.");
  const required=clean(c[0].required_partner_types);
  if(required&&!required.split(",").map(v=>v.trim()).includes(pr[0].type))return reply(chatId,"This campaign is not recruiting your partner type.");
  const [existing]=await db.query<(RowDataPacket&{status:string})[]>("SELECT status FROM campaign_partners WHERE campaign_id=? AND partner_id=? LIMIT 1",[id,p.id]);
  if(existing[0])return reply(chatId,"Application already exists. Status: "+existing[0].status);
  await db.query("INSERT INTO campaign_partners (id,campaign_id,partner_id,status,role) VALUES (?,?,?,?,?)",[crypto.randomUUID(),id,p.id,"APPLIED",pr[0].type]);
  return reply(chatId,"Application submitted. Status: APPLIED. Aslal will review it.");
}

async function links(chatId:string,p:Partner){
  const [rows]=await db.query<(RowDataPacket&{code:string;campaign:string|null;product_slug:string|null})[]>("SELECT code,campaign,product_slug FROM referral_links WHERE partner_id=? AND workspace_id=? ORDER BY created_at DESC LIMIT 20",[p.id,p.workspace_id]);
  if(!rows.length)return reply(chatId,"No referral links are currently available.");
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
  return reply(chatId,rows.map(r=>[r.campaign||r.product_slug||"Referral link",site+"/go/"+r.code].join("\n")).join("\n\n"));
}

async function earnings(chatId:string,p:Partner){
  const [c]=await db.query<(RowDataPacket&{status:string;amount:number|string;currency:string})[]>("SELECT status,COALESCE(SUM(amount),0) amount,currency FROM commissions WHERE partner_id=? AND workspace_id=? GROUP BY status,currency ORDER BY status",[p.id,p.workspace_id]);
  const [pay]=await db.query<(RowDataPacket&{status:string;amount:number|string;currency:string})[]>("SELECT status,COALESCE(SUM(amount),0) amount,currency FROM partner_payouts WHERE partner_id=? AND workspace_id=? GROUP BY status,currency ORDER BY status",[p.id,p.workspace_id]);
  return reply(chatId,["Earnings",c.length?c.map(r=>"Commission "+r.status+": "+money(r.amount)+" "+r.currency).join("\n"):"No commission records yet.","","Payouts",pay.length?pay.map(r=>"Payout "+r.status+": "+money(r.amount)+" "+r.currency).join("\n"):"No payout records yet."].join("\n"));
}

async function staffForChat(chatId:string){
  const [rows]=await db.query<(RowDataPacket&{id:string;email:string;name:string;role:string})[]>("SELECT id,email,name,role FROM users WHERE telegram_chat_id=? AND active=1 LIMIT 1",[chatId]);
  return rows[0]||null;
}

async function notifyAssignedStaff(workspaceId:string,ownerEmail:string|null,body:string){
  let chatId:string|null=null;
  if(ownerEmail){
    const [ownerRows]=await db.query<(RowDataPacket&{telegram_chat_id:string|null})[]>("SELECT telegram_chat_id FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE u.email=? AND u.active=1 AND wu.workspace_id=? LIMIT 1",[ownerEmail,workspaceId]);
    chatId=ownerRows[0]?.telegram_chat_id||null;
  }
  if(!chatId){
    const [admins]=await db.query<(RowDataPacket&{telegram_chat_id:string|null})[]>("SELECT u.telegram_chat_id FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_MANAGER','ADMIN','SUPER_ADMIN','BUSINESS_OWNER') AND u.telegram_chat_id IS NOT NULL ORDER BY FIELD(u.role,'SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') LIMIT 1",[workspaceId]);
    chatId=admins[0]?.telegram_chat_id||null;
  }
  if(chatId) await reply(chatId,body);
}

async function createPrivateLead(workspaceId:string,d: {id:string;lead_id:string|null;person_id:string|null;product_id:string|null;campaign_id:string|null;partner_id:string|null;referral_code:string|null;source:string|null;medium:string|null},m:TelegramMessage){
  if(d.lead_id)return d.lead_id;
  const from=m.from||{};
  const name=[from.first_name,from.last_name].filter(Boolean).join(" ")||from.username||"Telegram contact";
  const personId=crypto.randomUUID();
  const leadId=crypto.randomUUID();
  const ownerRows=await db.query<(RowDataPacket&{email:string})[]>("SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') ORDER BY FIELD(u.role,'SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN'),u.last_login_at DESC LIMIT 1",[workspaceId]);
  const owner=ownerRows[0][0]?.email||null;
  await db.query("INSERT INTO persons (id,name) VALUES (?,?)",[personId,name.slice(0,160)]);
  await db.query("INSERT INTO communication_preferences (id,person_id,telegram_allowed) VALUES (?,?,1)",[crypto.randomUUID(),personId]);
  await db.query("INSERT INTO leads (workspace_id,id,person_id,name,status,source,medium,campaign,referral_code,owner_email,lead_category,capture_mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[workspaceId,leadId,personId,name.slice(0,160),"NEW",d.source||"telegram",d.medium||"telegram",d.campaign_id?d.campaign_id:null,d.referral_code||null,owner,"TELEGRAM_INBOUND","MANUAL"]);
  if(d.product_id) await db.query("INSERT INTO lead_product_interest (id,lead_id,product_id,source,interest_score) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE interest_score=interest_score+1,last_seen_at=NOW()",[crypto.randomUUID(),leadId,d.product_id,"telegram"]);
  await db.query("UPDATE telegram_destinations SET lead_id=?,person_id=?,last_inbound_at=NOW(),follow_up_enabled=0,next_follow_up_at=NULL WHERE id=? AND workspace_id=?",[leadId,personId,d.id,workspaceId]);
  return leadId;
}

async function handleClientInbound(workspaceId:string,d:any,m:TelegramMessage,chatId:string){
  const leadId=await createPrivateLead(workspaceId,d,m);
  const [convRows]=await db.query<(RowDataPacket&{id:string;assigned_to:string|null})[]>("SELECT id,assigned_to FROM conversations WHERE workspace_id=? AND channel='TELEGRAM' AND external_thread_id=? AND status<>'CLOSED' ORDER BY updated_at DESC LIMIT 1",[workspaceId,chatId]);
  let conversationId=convRows[0]?.id||null;
  let assignedTo=convRows[0]?.assigned_to||null;
  if(!conversationId){
    const [leadRows]=await db.query<(RowDataPacket&{owner_email:string|null})[]>("SELECT owner_email FROM leads WHERE id=? AND workspace_id=? LIMIT 1",[leadId,workspaceId]);
    assignedTo=leadRows[0]?.owner_email||null;
    conversationId=crypto.randomUUID();
    await db.query("INSERT INTO conversations (id,workspace_id,lead_id,channel,external_thread_id,status,assigned_to,last_message_at) VALUES (?,?,?,?,?,'OPEN',?,NOW())",[conversationId,workspaceId,leadId,"TELEGRAM",chatId,assignedTo]);
  }
  await db.query("INSERT INTO conversation_messages (id,conversation_id,direction,status,sender_address,body,metadata) VALUES (?,?,?,?,?,?,?)",[crypto.randomUUID(),conversationId,"INBOUND","RECEIVED",String(m.from?.id||chatId),clean(m.text).slice(0,10000),JSON.stringify({telegramChatId:chatId,messageId:m.message_id||null,username:m.from?.username||null})]);
  await db.query("UPDATE conversations SET status='HUMAN_HANDOFF',human_handoff_at=NOW(),last_message_at=NOW() WHERE id=? AND workspace_id=?",[conversationId,workspaceId]);
  await db.query("UPDATE telegram_destinations SET follow_up_enabled=0,next_follow_up_at=NULL,last_inbound_at=NOW(),handed_off_at=NOW() WHERE id=? AND workspace_id=?",[d.id,workspaceId]);
  const [leadRows]=await db.query<(RowDataPacket&{name:string;owner_email:string|null})[]>("SELECT name,owner_email FROM leads WHERE id=? AND workspace_id=? LIMIT 1",[leadId,workspaceId]);
  const lead=leadRows[0];
  await notifyAssignedStaff(workspaceId,lead?.owner_email||assignedTo,["🔔 Telegram lead replied","Lead: "+(lead?.name||leadId),"Message: "+clean(m.text).slice(0,500),"Action: human handoff is active. Follow up in the Aslal dashboard."].join("\n"));
  return reply(chatId,"Thanks. Your message has been received. A member of our sales team will continue with you.");
}

async function handle(update:TelegramUpdate){
  const m=update.message;
  const chatId=m?.chat?.id==null?"":String(m.chat.id);
  const chatType=m?.chat?.type||"";
  if(!chatId)return;
  const input=clean(m?.text);
  if(input.startsWith("/start")){
    const token=input.split(/\s+/,2)[1]||"";
    if(token.startsWith("staff_")){
      const raw=token.slice(6);
      const [rows]=await db.query<(RowDataPacket&{id:string;name:string})[]>("SELECT id,name FROM users WHERE telegram_link_token=? AND active=1 LIMIT 1",[raw]);
      if(!rows[0])return reply(chatId,"This staff Telegram connection link is invalid or already used.");
      await db.query("UPDATE users SET telegram_chat_id=?,telegram_link_token=NULL,telegram_linked_at=NOW() WHERE id=?",[chatId,rows[0].id]);
      return reply(chatId,"Internal sales Telegram is connected for "+rows[0].name+". You will receive assigned-lead alerts and escalation reminders here.");
    }
    if(token.startsWith("client_")){
      const raw=token.slice(7);
      const [rows]=await db.query<(RowDataPacket&{id:string;workspace_id:string;type:string;label:string;lead_id:string|null})[]>("SELECT id,workspace_id,type,label,lead_id FROM telegram_destinations WHERE link_token=? AND active=1 LIMIT 1",[raw]);
      if(!rows[0])return reply(chatId,"This client connection link is invalid or already used.");
      if(rows[0].type!=="PRIVATE"||chatType!=="private")return reply(chatId,"This client link must be opened in a private chat with the Aslal bot.");
      await db.query("UPDATE telegram_destinations SET chat_id=?,link_token=NULL,opt_in=1 WHERE id=?",[chatId,rows[0].id]);
      const [dRows]=await db.query("SELECT id,lead_id,person_id,product_id,campaign_id,partner_id,referral_code,source,medium FROM telegram_destinations WHERE id=? AND workspace_id=? LIMIT 1",[rows[0].id,rows[0].workspace_id]);
      await createPrivateLead(rows[0].workspace_id,dRows[0] as any,m);
      return reply(chatId,"You are connected. Reply with your question or interest and our sales team will respond.");
    }
    const p=await partnerForChat(chatId);
    if(p)return help(chatId);
    return reply(chatId,"Welcome to Aslal. Use the link provided by Aslal to connect your client or staff Telegram session.");
  }

  const staff=await staffForChat(chatId);
  if(staff){
    if(input==="/help")return help(chatId);
    if(input==="/me")return reply(chatId,"Internal user: "+staff.name+"\nRole: "+staff.role+"\nTelegram alerts: ON");
  }

  const p=await partnerForChat(chatId);
  if(p){
    const command=input.split(/\s+/,1)[0].toLowerCase().split("@")[0];
    const arg=input.includes(" ")?input.slice(input.indexOf(" ")+1).trim():"";
    if(command==="/help")return help(chatId);
    if(command==="/me")return reply(chatId,"Partner: "+p.name+"\nID: "+p.partner_number+"\nStatus: "+p.status+"\nVerification: "+p.verification_status);
    if(command==="/campaigns")return campaigns(chatId,p);
    if(command==="/campaign"&&arg)return campaign(chatId,p,arg);
    if(command==="/apply"&&arg)return apply(chatId,p,arg);
    if(command==="/links")return links(chatId,p);
    if(command==="/earnings")return earnings(chatId,p);
    return reply(chatId,"Unknown command. Use /help.");
  }

  if(chatType==="private"){
    const [destinations]=await db.query<(RowDataPacket&{id:string;workspace_id:string;lead_id:string|null;person_id:string|null;product_id:string|null;campaign_id:string|null;partner_id:string|null;referral_code:string|null;source:string|null;medium:string|null;active:number;opt_in:number})[]>("SELECT id,workspace_id,lead_id,person_id,product_id,campaign_id,partner_id,referral_code,source,medium,active,opt_in FROM telegram_destinations WHERE chat_id=? AND type='PRIVATE' LIMIT 1",[chatId]);
    const d=destinations[0];
    if(!d||!d.active||!d.opt_in)return reply(chatId,"This Telegram chat is not connected to an Aslal client conversation yet. Use the client link provided by Aslal.");
    return handleClientInbound(d.workspace_id,d,m,chatId);
  }

  if(chatType==="group"||chatType==="supergroup"||chatType==="channel"){
    const [destinations]=await db.query<(RowDataPacket&{id:string;workspace_id:string;lead_id:string|null;active:number;opt_in:number})[]>("SELECT id,workspace_id,lead_id,active,opt_in FROM telegram_destinations WHERE chat_id=? AND type=? LIMIT 1",[chatId,chatType==="channel"?"CHANNEL":"GROUP"]);
    const d=destinations[0];
    if(d?.active&&d.opt_in){
      await db.query("INSERT INTO conversation_messages (id,conversation_id,direction,status,sender_address,body,metadata) SELECT ?,c.id,'INBOUND','RECEIVED',?,?,? FROM conversations c WHERE c.workspace_id=? AND c.channel='TELEGRAM' AND c.external_thread_id=? AND c.status<>'CLOSED' ORDER BY c.updated_at DESC LIMIT 1",[crypto.randomUUID(),String(m.from?.id||chatId),clean(m.text).slice(0,10000),JSON.stringify({telegramChatId:chatId,messageId:m.message_id||null,chatType}),d.workspace_id,chatId]);
      await db.query("UPDATE telegram_destinations SET last_inbound_at=NOW() WHERE id=? AND workspace_id=?",[d.id,d.workspace_id]);
    }
  }
}

export async function POST(request:Request){
  const secret=process.env.TELEGRAM_WEBHOOK_SECRET;
  if(!secret||request.headers.get("x-telegram-bot-api-secret-token")!==secret)return NextResponse.json({error:"Forbidden"},{status:403});
  if(!process.env.TELEGRAM_BOT_TOKEN)return NextResponse.json({error:"Telegram bot token is not configured."},{status:503});
  try{await handle((await request.json()) as TelegramUpdate);return NextResponse.json({ok:true});}
  catch(error){console.error("TELEGRAM_WORKBENCH_WEBHOOK_ERROR",error);return NextResponse.json({error:"Telegram workbench failed."},{status:500});}
}
