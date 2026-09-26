import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramChannelConfig } from "@/lib/telegram-channel-config";
import type { RowDataPacket } from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  chat?: { id?: number | string; type?: string; title?: string; username?: string };
  from?: { id?: number; first_name?: string; last_name?: string; username?: string };
  text?: string;
  reply_to_message?: TelegramMessage;
};
type TelegramCallbackQuery = { id:string; data?:string; from?:{id?:number;first_name?:string;last_name?:string;username?:string}; message?:TelegramMessage };
type TelegramInlineQuery = { id:string; query?:string; from?:{id?:number;first_name?:string;last_name?:string;username?:string} };
type TelegramUpdate = { message?:TelegramMessage; callback_query?:TelegramCallbackQuery; inline_query?:TelegramInlineQuery };

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
const catalog=async(chatId:string,workspaceId:string,campaignId?:string|null)=>{const config=await getTelegramChannelConfig(workspaceId);if(!config?.enabled||!config.miniAppEnabled)return reply(chatId,"The Telegram catalog is not enabled for this workspace yet.");const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");const base=(config.miniAppUrl||site+"/telegram/catalog").replace(/\/$/,"");const qs=new URLSearchParams();if(config.requireWorkspace)qs.set("workspaceId",workspaceId);if(config.captureStartParameter&&campaignId)qs.set("campaignId",campaignId);const url=base+(qs.toString()?(base.includes("?")?"&":"?")+qs.toString():"");return tg("sendMessage",{chat_id:chatId,text:"Open the Aslal catalog to browse products, services and resources.",reply_markup:{inline_keyboard:[[{text:config.menuButtonText||"Open Catalog",web_app:{url}}]]}});};

async function publicSession(workspaceId:string,user:any,chatId:string){
  const uid=String(user?.id||chatId);
  const [rows]=await db.query<(RowDataPacket&{id:string;state:string;state_data:any;lead_id:string|null;person_id:string|null})[]>(`SELECT id,state,state_data,lead_id,person_id FROM telegram_public_sessions WHERE workspace_id=? AND telegram_user_id=? LIMIT 1`,[workspaceId,uid]);
  if(rows[0])return rows[0];
  const id=crypto.randomUUID();
  await db.query(`INSERT INTO telegram_public_sessions (id,workspace_id,telegram_user_id,chat_id,username,first_name,last_name,state,last_inbound_at) VALUES (?,?,?,?,?,?,?,'WELCOME',NOW())`,[id,workspaceId,uid,chatId,user?.username||null,user?.first_name||null,user?.last_name||null]);
  return {id,state:"WELCOME",state_data:null,lead_id:null,person_id:null};
}
async function publicMenu(chatId:string,workspaceId:string){
  const cfg=await getTelegramChannelConfig(workspaceId);
  if(!cfg?.publicEnabled||!cfg.allowAnonymousUsers)return reply(chatId,"Public Telegram access is currently unavailable.");
  return tg("sendMessage",{chat_id:chatId,text:"Welcome to Aslal. No account or registration is required. Choose what you need:",reply_markup:{inline_keyboard:[[{text:"🛍 Catalog",callback_data:"public:catalog:"+workspaceId},{text:"🎯 Qualify me",callback_data:"public:qualify:"+workspaceId}],[{text:"💰 Pricing",callback_data:"public:pricing:"+workspaceId},{text:"👤 Talk to Agent",callback_data:"public:agent:"+workspaceId}]]}});
}
async function savePublicState(workspaceId:string,userId:string,state:string,stateData:any){
  await db.query("UPDATE telegram_public_sessions SET state=?,state_data=?,last_inbound_at=NOW() WHERE workspace_id=? AND telegram_user_id=?",[state,JSON.stringify(stateData||{}),workspaceId,userId]);
}
async function qualification(chatId:string,workspaceId:string,user:any,stepId?:string){
  const cfg=await getTelegramChannelConfig(workspaceId); const flow=Array.isArray(cfg?.qualificationFlow)?cfg.qualificationFlow:[];
  if(!cfg?.qualificationEnabled||!flow.length)return reply(chatId,"Qualification is not configured yet. Use Catalog or Talk to Agent.");
  const session=await publicSession(workspaceId,user,chatId); const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{}); const current=stepId||String(stateData.currentStep||flow[0]?.id||"");
  const step=flow.find((x:any)=>x?.id===current); if(!step)return reply(chatId,"Qualification is complete. A sales agent can continue with you.");
  const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
  await savePublicState(workspaceId,String(user?.id||chatId),"QUALIFYING",{...stateData,currentStep:step.id});
  if(step.inputType==="PHONE"||step.inputType==="TEXT") return reply(chatId,String(step.question||"Please enter your answer:"));
  return tg("sendMessage",{chat_id:chatId,text:String(step.question||"Please choose:"),reply_markup:{inline_keyboard:(Array.isArray(step.options)?step.options:[]).map((o:any)=>[{text:String(o.label),callback_data:"public:answer:"+workspaceId+":"+step.id+":"+String(o.value)}])}});
}
async function ensurePublicLead(workspaceId:string,user:any,chatId:string,stateData:any){
  const session=await publicSession(workspaceId,user,chatId); if(session.lead_id)return session.lead_id;
  const personId=crypto.randomUUID(),leadId=crypto.randomUUID(),name=[user?.first_name,user?.last_name].filter(Boolean).join(" ")||user?.username||"Telegram visitor";
  const [destinationRows]=await db.query<(RowDataPacket & {sales_owner_email:string|null})[]>("SELECT sales_owner_email FROM telegram_destinations WHERE workspace_id=? AND chat_id=? AND active=1 LIMIT 1",[workspaceId,chatId]);
  const assignedOwner=destinationRows[0]?.sales_owner_email||null;
  const [owners]=await db.query<(RowDataPacket&{email:string})[]>(`SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') ORDER BY FIELD(u.role,'SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') LIMIT 1`,[workspaceId]);
  await db.query("INSERT INTO persons (id,name) VALUES (?,?)",[personId,name.slice(0,160)]);
  await db.query("INSERT INTO communication_preferences (id,person_id,telegram_allowed) VALUES (?,?,1)",[crypto.randomUUID(),personId]);
  await db.query("INSERT INTO leads (workspace_id,id,person_id,name,phone,status,source,medium,lead_category,capture_mode,message,owner_email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[workspaceId,leadId,personId,name.slice(0,160),stateData.phone||null,"NEW","telegram","telegram","PUBLIC_TELEGRAM","MANUAL",JSON.stringify(stateData),assignedOwner||owners[0]?.email||null]);
  await db.query("UPDATE telegram_public_sessions SET lead_id=?,person_id=? WHERE workspace_id=? AND telegram_user_id=?",[leadId,personId,workspaceId,String(user?.id||chatId)]);
  return leadId;
}
async function routePublicMessageToHandoff(chatId:string,workspaceId:string,user:any,m:TelegramMessage){
  const cfg=await getTelegramChannelConfig(workspaceId); if(!cfg?.humanHandoffEnabled||!cfg.handoffChatId)return false;
  const session=await publicSession(workspaceId,user,chatId); const data=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
  const leadId=await ensurePublicLead(workspaceId,user,chatId,data);
  const forwarded=await tg("copyMessage",{chat_id:String(cfg.handoffChatId),from_chat_id:chatId,message_id:m.message_id});
  const adminMessageId=forwarded?.result?.message_id;
  await savePublicState(workspaceId,String(user?.id||chatId),"SUPPORT_REQUESTED",{...data,handoffAdminMessageId:adminMessageId,publicChatId:chatId,leadId});
  return true;
}
async function routeAdminReplyToPublic(m:TelegramMessage){
  const [rows]=await db.query<(RowDataPacket&{workspace_id:string;state_data:any})[]>(`SELECT workspace_id,state_data FROM telegram_public_sessions WHERE state='SUPPORT_REQUESTED' ORDER BY updated_at DESC LIMIT 100`);
  const replyId=String(m.reply_to_message?.message_id||"");
  const row=rows.find(r=>{const d=typeof r.state_data==="string"?JSON.parse(r.state_data||"{}"):(r.state_data||{});return String(d.handoffAdminMessageId||"")===replyId;});
  if(!row)return false;
  const d=typeof row.state_data==="string"?JSON.parse(row.state_data||"{}"):(row.state_data||{}); if(!d.publicChatId)return false;
  await reply(String(d.publicChatId),clean(m.text)); return true;
}

async function handoffPublic(chatId:string,workspaceId:string,user:any){
  const cfg=await getTelegramChannelConfig(workspaceId); if(!cfg?.humanHandoffEnabled)return reply(chatId,"Human support is currently unavailable.");
  const session=await publicSession(workspaceId,user,chatId); const data=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
  const leadId=await ensurePublicLead(workspaceId,user,chatId,data);
  await db.query("UPDATE telegram_public_sessions SET state='SUPPORT_REQUESTED',support_requested_at=NOW() WHERE workspace_id=? AND telegram_user_id=?",[workspaceId,String(user?.id||chatId)]);
  if(cfg.handoffChatId){const sent=await tg("sendMessage",{chat_id:String(cfg.handoffChatId),text:"🔔 New public Telegram support request\nLead: "+leadId+"\nUser: "+([user?.first_name,user?.last_name].filter(Boolean).join(" ")||user?.username||"Telegram user")+"\nPhone: "+(data.phone||"not provided")+"\nAnswers: "+JSON.stringify(data)});const sentId=sent?.result?.message_id;await savePublicState(workspaceId,String(user?.id||chatId),"SUPPORT_REQUESTED",{...data,handoffAdminMessageId:sentId,publicChatId:chatId,leadId});}
  return reply(chatId,"A support request has been created. A member of our team will continue with you here.");
}
async function pricingResponse(chatId:string,workspaceId:string){
  if(await keywordResponse(chatId,workspaceId,"price"))return;
  const [rows]=await db.query<(RowDataPacket&{name:string;starting_price:string|null;cta_label:string|null})[]>(`SELECT name,starting_price,cta_label FROM products WHERE workspace_id=? AND active=1 ORDER BY featured DESC,sort_order ASC,name ASC LIMIT 12`,[workspaceId]);
  if(!rows.length)return reply(chatId,"Pricing is available through our catalog. Choose Catalog to see current offers.");
  return reply(chatId,rows.map(r=>r.name+" — "+(r.starting_price?money(r.starting_price)+" ETB":"Request pricing")).join("\n")+"\n\nUse Catalog for full specifications and ordering.");
}

async function keywordResponse(chatId:string,workspaceId:string,textValue:string){
  const cfg=await getTelegramChannelConfig(workspaceId); if(!cfg?.knowledgeBaseEnabled||!Array.isArray(cfg.keywordRules))return false;
  for(const rule of cfg.keywordRules){try{const matched=String(rule.mode||"EXACT").toUpperCase()==="REGEX"?new RegExp(String(rule.pattern||""),"i").test(textValue):textValue.toLowerCase()===String(rule.pattern||"").toLowerCase();if(matched){await reply(chatId,String(rule.response||""));return true;}}catch{}}
  return false;
}
async function inlineCatalog(update:TelegramInlineQuery){
  const q=clean(update.query),workspaceId=String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||"");
  if(!workspaceId)return tg("answerInlineQuery",{inline_query_id:update.id,results:[],cache_time:5,is_personal:true});
  const cfg=await getTelegramChannelConfig(workspaceId); if(!cfg?.inlineModeEnabled||!cfg.inlineCatalogEnabled)return tg("answerInlineQuery",{inline_query_id:update.id,results:[],cache_time:5,is_personal:true});
  const [rows]=await db.query<(RowDataPacket&{id:string;name:string;slug:string;tagline:string|null;short_description:string|null;starting_price:string|null;image_url:string|null})[]>(`SELECT id,name,slug,tagline,short_description,starting_price,image_url FROM products WHERE workspace_id=? AND active=1 AND (name LIKE ? OR slug LIKE ? OR tagline LIKE ?) ORDER BY featured DESC,sort_order ASC,name ASC LIMIT 20`,[workspaceId,"%"+q+"%","%"+q+"%","%"+q+"%"]);
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
  return tg("answerInlineQuery",{inline_query_id:update.id,results:rows.map(r=>({type:"article",id:r.id,title:r.name,description:r.short_description||r.tagline||"Aslal product or service",thumb_url:r.image_url||undefined,input_message_content:{message_text:r.name+" — "+(r.starting_price?money(r.starting_price)+" ETB":"Request details")},reply_markup:{inline_keyboard:[[{text:"Open catalog",web_app:{url:site+"/telegram/catalog?workspaceId="+encodeURIComponent(workspaceId)}}]]}})),cache_time:30,is_personal:true});
}

async function partnerForChat(chatId:string){
  const [rows]=await db.query<Partner[]>("SELECT id,name,partner_number,workspace_id,status,verification_status,type FROM partners WHERE telegram_chat_id=? LIMIT 1",[chatId]);
  return rows[0]||null;
}

async function help(chatId:string){
  return reply(chatId,["Aslal Telegram Workbench","","Partners:","/campaigns — active campaigns","/campaign <id> — campaign details and published materials","/apply <id> — apply to a campaign","/links — your referral links","/earnings — commission and payout status","/catalog — open the catalog","/me — identity","/help — this menu","","Internal sales users are linked from the Aslal dashboard. Client replies are automatically recorded, follow-up is stopped, and the assigned salesperson/admin is alerted."].join("\n"));
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
  const [ownerRows]=await db.query<(RowDataPacket&{email:string})[]>("SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') ORDER BY FIELD(u.role,'SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN'),u.last_login_at DESC LIMIT 1",[workspaceId]);
  const owner=ownerRows[0]?.email||null;
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
  if(update.inline_query)return inlineCatalog(update.inline_query);
  if(update.callback_query){
    const q=update.callback_query; const data=clean(q.data); const chatId=String(q.message?.chat?.id||""); if(!chatId)return;
    await tg("answerCallbackQuery",{callback_query_id:q.id});
    const parts=data.split(":"); const workspaceId=parts[2]||String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||""); const user=q.from||{};
    if(parts[0]==="public"&&parts[1]==="catalog")return catalog(chatId,workspaceId);
    if(parts[0]==="public"&&parts[1]==="pricing")return pricingResponse(chatId,workspaceId);
    if(parts[0]==="public"&&parts[1]==="agent")return handoffPublic(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="qualify")return qualification(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="answer"){
      const stepId=parts[3],value=parts.slice(4).join(":"); const session=await publicSession(workspaceId,user,chatId); const prior=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{}); const stateData={...prior,[stepId]:value};
      const cfg=await getTelegramChannelConfig(workspaceId); const flow=Array.isArray(cfg?.qualificationFlow)?cfg.qualificationFlow:[]; const step=flow.find((x:any)=>x?.id===stepId); const option=step?.options?.find((x:any)=>String(x.value)===value); const next=option?.next;
      await savePublicState(workspaceId,String(user?.id||chatId),next?"QUALIFYING":"QUALIFIED",{...stateData,currentStep:next||null});
      if(next)return qualification(chatId,workspaceId,user,String(next));
      await ensurePublicLead(workspaceId,user,chatId,stateData);
      return tg("sendMessage",{chat_id:chatId,text:"Thanks. Your answers have been saved.",reply_markup:{inline_keyboard:[[{text:"🛍 Catalog",callback_data:"public:catalog:"+workspaceId},{text:"👤 Talk to Agent",callback_data:"public:agent:"+workspaceId}]]}});
    }
    return;
  }
  const m=update.message;
  if(!m?.chat?.id)return;
  const chatId=String(m.chat.id);  const chatType=m.chat.type||"";
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
      const [dRows]=await db.query<(RowDataPacket&{id:string;lead_id:string|null;person_id:string|null;product_id:string|null;campaign_id:string|null;partner_id:string|null;referral_code:string|null;source:string|null;medium:string|null})[]>("SELECT id,lead_id,person_id,product_id,campaign_id,partner_id,referral_code,source,medium FROM telegram_destinations WHERE id=? AND workspace_id=? LIMIT 1",[rows[0].id,rows[0].workspace_id]);
      const destination=dRows[0];
      if(!destination)return reply(chatId,"Telegram client connection could not be initialized.");
      await createPrivateLead(rows[0].workspace_id,destination,m);
      return reply(chatId,"You are connected. Reply with your question or interest and our sales team will respond.");
    }
    const p=await partnerForChat(chatId);
    if(p)return catalog(chatId,p.workspace_id);
    const defaultWorkspaceId=String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||"").trim();
    if(defaultWorkspaceId){const cfg=await getTelegramChannelConfig(defaultWorkspaceId);if(cfg?.publicEnabled&&cfg.allowAnonymousUsers)return publicMenu(chatId,defaultWorkspaceId);return catalog(chatId,defaultWorkspaceId);}
    return reply(chatId,"Welcome to Aslal. Use the workspace connection link provided by Aslal to open the correct catalog.");
  }

  const publicWorkspaceId=String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||"");
  if(chatType==="private" && publicWorkspaceId){
    const cfg=await getTelegramChannelConfig(publicWorkspaceId);
    if(cfg?.publicEnabled&&cfg.allowAnonymousUsers){
      const session=await publicSession(publicWorkspaceId,m.from||{},chatId);
      const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
      if(session.state==="QUALIFYING" && input && !input.startsWith("/")){
        const flow=Array.isArray(cfg.qualificationFlow)?cfg.qualificationFlow:[]; const step=flow.find((x:any)=>x?.id===stateData.currentStep);
        if(step?.inputType==="PHONE" && !/^\\+?[0-9 ()-]{7,20}$/.test(input))return reply(chatId,"Please enter a valid phone number.");
        const nextData={...stateData,[String(step?.id||"answer")]:input};
        const next=step?.next;
        await savePublicState(publicWorkspaceId,String(m.from?.id||chatId),next?"QUALIFYING":"QUALIFIED",{...nextData,currentStep:next||null});
        if(next)return qualification(chatId,publicWorkspaceId,m.from||{},String(next));
        await ensurePublicLead(publicWorkspaceId,m.from||{},chatId,nextData);
        return tg("sendMessage",{chat_id:chatId,text:"Thanks. Your answers have been saved.",reply_markup:{inline_keyboard:[[{text:"🛍 Catalog",callback_data:"public:catalog:"+publicWorkspaceId},{text:"👤 Talk to Agent",callback_data:"public:agent:"+publicWorkspaceId}]]}});
      }
      if(input==="/help")return publicMenu(chatId,publicWorkspaceId);
      if(input==="/pricing")return pricingResponse(chatId,publicWorkspaceId);
      if(input==="/catalog")return catalog(chatId,publicWorkspaceId);
      if(input==="/support")return handoffPublic(chatId,publicWorkspaceId,m.from||{});
      if(await keywordResponse(chatId,publicWorkspaceId,input))return;
      if(session.state==="SUPPORT_REQUESTED"){if(await routePublicMessageToHandoff(chatId,publicWorkspaceId,m.from||{},m))return reply(chatId,"Your message has been sent to the support team.");return handoffPublic(chatId,publicWorkspaceId,m.from||{});}
      if(session.state==="QUALIFYING")return qualification(chatId,publicWorkspaceId,m.from||{},String(stateData.currentStep||""));
      return publicMenu(chatId,publicWorkspaceId);
    }
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
    if(command==="/catalog")return catalog(chatId,p.workspace_id);
    return reply(chatId,"Unknown command. Use /help.");
  }

  if(chatType==="private"){
    const [destinations]=await db.query<(RowDataPacket&{id:string;workspace_id:string;lead_id:string|null;person_id:string|null;product_id:string|null;campaign_id:string|null;partner_id:string|null;referral_code:string|null;source:string|null;medium:string|null;active:number;opt_in:number})[]>("SELECT id,workspace_id,lead_id,person_id,product_id,campaign_id,partner_id,referral_code,source,medium,active,opt_in FROM telegram_destinations WHERE chat_id=? AND type='PRIVATE' LIMIT 1",[chatId]);
    const d=destinations[0];
    if(!d||!d.active||!d.opt_in)return reply(chatId,"This Telegram chat is not connected to an Aslal client conversation yet. Use the client link provided by Aslal.");
    return handleClientInbound(d.workspace_id,d,m,chatId);
  }

  const publicHandoffChatId=String((await getTelegramChannelConfig(String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||"")))?.handoffChatId||"");
  if((chatType==="group"||chatType==="supergroup") && publicHandoffChatId===chatId && m.reply_to_message?.message_id){
    if(await routeAdminReplyToPublic(m))return;
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
