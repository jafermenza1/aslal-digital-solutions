import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramChannelConfig, resolveTelegramDefaultWorkspaceId } from "@/lib/telegram-channel-config";
import { syncTelegramIdentity, type TelegramUser } from "@/lib/telegram-identity";
import { prisma } from "@/lib/prisma";
import type { RowDataPacket } from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  chat?: { id?: number | string; type?: string; title?: string; username?: string };
  from?: TelegramUser;
  text?: string;
  reply_to_message?: TelegramMessage;
  contact?: { phone_number?: string; first_name?: string; last_name?: string; user_id?: number };
};
type TelegramCallbackQuery = { id:string; data?:string; from?:TelegramUser; message?:TelegramMessage };
type TelegramInlineQuery = { id:string; query?:string; from?:{id?:number;first_name?:string;last_name?:string;username?:string} };
type TelegramUpdate = { message?:TelegramMessage; callback_query?:TelegramCallbackQuery; inline_query?:TelegramInlineQuery };
type QualificationOption = { label:string; value:string; next?:string };
type QualificationStep = { id:string; question?:string; inputType?:string; next?:string; options?:QualificationOption[] };
type KeywordRule = { pattern?:string; mode?:string; response?:string; priority?:number };

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
type PublicMenuItem={action:string;label:string};
type PublicResponseConfig={welcome?:string;prompt?:string;fallback?:string;ordersEmpty?:string;demandConfirmation?:string;humanHandoff?:string;partner?:string};
const DEFAULT_PUBLIC_MENU:PublicMenuItem[]=[
 {action:"CATALOG",label:"🛍 Browse products"},
 {action:"SERVICES",label:"💼 Explore services"},
 {action:"NEED",label:"🔎 Tell us what you need"},
 {action:"ORDERS",label:"📦 My orders"},
 {action:"HUMAN",label:"💬 Talk to a person"},
 {action:"PARTNER",label:"🤝 Partner with Aslal"},
];
const normalizeAction=(v:string)=>v.toUpperCase().replace(/[^A-Z]+/g,"_").replace(/^_|_$/g,"");
const legacyAction=(label:string)=>{
 const k=label.toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
 const map:Record<string,string>={
  catalog:"CATALOG","browse products":"CATALOG","products":"CATALOG","catalog products":"CATALOG",
  services:"SERVICES","explore services":"SERVICES",
  "qualify me":"NEED","tell us what you need":"NEED","need something else":"NEED",
  pricing:"PRICING","talk to agent":"HUMAN","talk to human":"HUMAN","talk to a person":"HUMAN",
  "share phone number":"PHONE","my orders":"ORDERS","partner":"PARTNER","partner with aslal":"PARTNER",
  "continue conversation":"CONTINUE","close menu":"CLOSE",
 };
 return map[k]||normalizeAction(k);
};
function parsePublicMenu(raw:any):{items:PublicMenuItem[];responses:PublicResponseConfig}{
 if(Array.isArray(raw))return {items:raw.map((v:any)=>typeof v==="string"?{action:legacyAction(v),label:v}:{action:normalizeAction(String(v?.action||"")),label:String(v?.label||v?.text||"")}).filter(x=>x.action&&x.label),responses:{}};
 if(raw&&typeof raw==="object")return {items:Array.isArray(raw.items)?raw.items.map((v:any)=>typeof v==="string"?{action:legacyAction(v),label:v}:{action:normalizeAction(String(v?.action||"")),label:String(v?.label||v?.text||"")}).filter((x:any)=>x.action&&x.label):DEFAULT_PUBLIC_MENU,responses:(raw.responses&&typeof raw.responses==="object"?raw.responses:{}) as PublicResponseConfig};
 return {items:DEFAULT_PUBLIC_MENU,responses:{}};
}
async function publicMenu(chatId:string,workspaceId:string,user?:any){
  const cfg=await getTelegramChannelConfig(workspaceId);
  if(!cfg?.publicEnabled||!cfg.allowAnonymousUsers)return reply(chatId,"Public Telegram access is currently unavailable.");
  const parsed=parsePublicMenu(cfg.publicMenu);
  const menuItems=parsed.items.length?parsed.items:DEFAULT_PUBLIC_MENU;
  const keyboard:any[][]=[];
  for(let i=0;i<menuItems.length;i+=2)keyboard.push(menuItems.slice(i,i+2).map(item=>{
    if(item.action==="PHONE")return {text:item.label,request_contact:true};
    return {text:item.label};
  }));
  const telegramUserId=String(user?.id||chatId);
  const identity=await prisma.telegramIdentity.findUnique({where:{workspaceId_telegramUserId:{workspaceId,telegramUserId}}}).catch(()=>null);
  const hasContext=Boolean(identity?.leadId||identity?.customerId);
  const recentViews=identity?.visitorId ? await prisma.event.findMany({where:{visitorId:identity.visitorId,eventName:"TELEGRAM_PRODUCT_VIEW"},orderBy:{createdAt:"desc"},take:3,select:{productSlug:true}}).catch(()=>[]) : [];
  const viewText=recentViews.length?"\n\nWe remember your recent catalog interest: "+recentViews.map(v=>v.productSlug).filter(Boolean).join(", ")+".":"";
  const fallbackWelcome=hasContext?"Welcome back to Aslal. We remember your existing context, so you can continue without starting over.":"👋 Welcome to Aslal.\n\nWhat would you like to do?";
  const welcome=String(parsed.responses.welcome||fallbackWelcome);
  const prompt=String(parsed.responses.prompt||"Choose an option below:");
  const replyKeyboard:any[][]=[...keyboard];
  if(hasContext)replyKeyboard.unshift([{text:"↩️ Continue conversation"}]);
  await tg("sendMessage",{chat_id:chatId,text:welcome+viewText+"\n\n"+prompt,reply_markup:{keyboard:replyKeyboard,resize_keyboard:true,is_persistent:true,input_field_placeholder:"Choose an Aslal option"}});
  return;
}
async function continuePublic(chatId:string,workspaceId:string,user:any){
  const identity=await prisma.telegramIdentity.findUnique({where:{workspaceId_telegramUserId:{workspaceId,telegramUserId:String(user?.id||chatId)}}});
  if(!identity?.leadId&&!identity?.customerId)return publicMenu(chatId,workspaceId,user);
  const lead=identity.leadId?await prisma.lead.findFirst({where:{id:identity.leadId,workspaceId},select:{name:true,status:true,ownerEmail:true}}):null;
  const customer=identity.customerId?await prisma.customer.findFirst({where:{id:identity.customerId,workspaceId},select:{id:true,name:true,status:true}}):null;
  const activeConversation=await prisma.conversation.findFirst({where:{workspaceId,channel:"TELEGRAM",externalThreadId:chatId,status:{not:"CLOSED"}},orderBy:{updatedAt:"desc"},select:{status:true,lastMessageAt:true}}).catch(()=>null);
  const orders=customer?await prisma.order.findMany({where:{workspaceId,customerId:customer.id},orderBy:{createdAt:"desc"},take:3,select:{orderNumber:true,status:true,total:true,currency:true}}):[];
  return reply(chatId,["↩️ Your Aslal context is ready.",lead?"Lead: "+lead.name+" — "+lead.status:"",customer?"Customer: "+customer.name+" — "+customer.status:"",activeConversation?"Conversation: "+activeConversation.status:"",orders.length?"Recent orders:\n"+orders.map(o=>o.orderNumber+" — "+o.status+" — "+Number(o.total).toLocaleString("en-ET")+" "+o.currency).join("\n"):"","Reply here to continue with the existing context, or choose Catalog for more products and services."].filter(Boolean).join("\n"));
}
async function savePublicState(workspaceId:string,userId:string,state:string,stateData:any){
  await db.query("UPDATE telegram_public_sessions SET state=?,state_data=?,last_inbound_at=NOW() WHERE workspace_id=? AND telegram_user_id=?",[state,JSON.stringify(stateData||{}),workspaceId,userId]);
}
async function needResponse(chatId:string,workspaceId:string,user:any){
 const cfg=await getTelegramChannelConfig(workspaceId);
 const parsed=parsePublicMenu(cfg?.publicMenu);
 const prompt=String(parsed.responses.prompt||"🔎 Tell us what you need.\n\nYou can describe the product, service, problem, quantity or outcome in your own words.");
 await savePublicState(workspaceId,String(user?.id||chatId),"NEED_CAPTURE",{});
 return reply(chatId,prompt);
}

async function servicesResponse(chatId:string,workspaceId:string){
 const cfg=await getTelegramChannelConfig(workspaceId);
 if(!cfg?.enabled||!cfg.miniAppEnabled)return reply(chatId,"Our services are available through Aslal. Tell us what you need and a specialist can help you choose.");
 const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
 const base=(cfg.miniAppUrl||site+"/telegram/catalog").replace(/\/$/,"");
 const url=base+(base.includes("?")?"&":"?")+"kind=SERVICE";
 return tg("sendMessage",{chat_id:chatId,text:"💼 Explore Aslal services.\n\nChoose a service to see what is included, then request it when you are ready.",reply_markup:{inline_keyboard:[[{text:"Explore services",web_app:{url}}],[{text:"🔎 Tell us what you need",callback_data:"public:need:"+workspaceId}]]}});
}
async function ordersResponse(chatId:string,workspaceId:string,user:any){
 const identity=await prisma.telegramIdentity.findUnique({where:{workspaceId_telegramUserId:{workspaceId,telegramUserId:String(user?.id||chatId)}}}).catch(()=>null);
 if(!identity?.customerId)return reply(chatId,"📦 I do not see a customer order history for this Telegram identity yet. If you already ordered with Aslal, tap Talk to a person and we will continue from your existing conversation.");
 const orders=await prisma.order.findMany({where:{workspaceId,customerId:identity.customerId},orderBy:{createdAt:"desc"},take:8,select:{orderNumber:true,status:true,total:true,currency:true,createdAt:true}});
 if(!orders.length)return reply(chatId,"📦 You do not have any orders recorded yet. Browse products or tell us what you need.");
 return reply(chatId,["📦 Your recent Aslal orders","",...orders.map(o=>o.orderNumber+" — "+o.status+" — "+money(o.total)+" "+o.currency)].join("\n"));
}
async function createTelegramDemand(chatId:string,workspaceId:string,user:any,message:string){
 const text=clean(message).slice(0,10000);
 if(!text)return publicMenu(chatId,workspaceId,user);
 const session=await publicSession(workspaceId,user,chatId);
 const prior=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
 const leadId=await ensurePublicLead(workspaceId,user,chatId,{...prior,message:text});
 const request=await prisma.commercialRequest.create({data:{
   id:crypto.randomUUID(),workspaceId,requestType:"RFP",status:"SUBMITTED",
   title:"Telegram demand — "+text.slice(0,150),description:text,requestedItem:text.slice(0,250),
   contactName:[user?.first_name,user?.last_name].filter(Boolean).join(" ")||user?.username||"Telegram visitor",
   contactPhone:prior.phone||null,contactPreference:"TELEGRAM",privacyVisibility:"CONTROLLED",
   source:"telegram",leadId,createdBy:null
 }});
 await savePublicState(workspaceId,String(user?.id||chatId),"DEMAND_CAPTURED",{...prior,message:text,commercialRequestId:request.id});
 const cfg=await getTelegramChannelConfig(workspaceId);
 const parsed=parsePublicMenu(cfg?.publicMenu);
 const confirmation=String(parsed.responses.demandConfirmation||"Thanks — I have captured what you need. An Aslal team member can continue with you here.");
 return tg("sendMessage",{chat_id:chatId,text:confirmation,reply_markup:{inline_keyboard:[[{text:"💬 Talk to a person",callback_data:"public:agent:"+workspaceId},{text:"🛍 Browse products",callback_data:"public:catalog:"+workspaceId}]]}});
}
async function partnerResponse(chatId:string,workspaceId:string,user:any){
 const partner=await partnerForChat(chatId);
 if(partner)return reply(chatId,["🤝 Partner with Aslal","", "You are already connected as "+partner.name+" ("+partner.partner_number+").","Use /campaigns, /links or /earnings for your partner workbench."].join("\n"));
 const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
 const cfg=await getTelegramChannelConfig(workspaceId);
 const parsed=parsePublicMenu(cfg?.publicMenu);
 const text=String(parsed.responses.partner||"🤝 Partner with Aslal\n\nJoin our partner network for campaigns, referrals, sales assets and partner opportunities.");
 return tg("sendMessage",{chat_id:chatId,text,reply_markup:{inline_keyboard:[[{text:"Partner registration",url:site+"/partner/register"}],[{text:"💬 Talk to a person",callback_data:"public:agent:"+workspaceId}]]}});
}

async function qualification(chatId:string,workspaceId:string,user:any,stepId?:string){
  const cfg=await getTelegramChannelConfig(workspaceId); const flow=Array.isArray(cfg?.qualificationFlow)?cfg.qualificationFlow as unknown as QualificationStep[]:[];
  if(!cfg?.qualificationEnabled||!flow.length)return reply(chatId,"Qualification is not configured yet. Use Catalog or Talk to Agent.");
  const session=await publicSession(workspaceId,user,chatId); const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{}); const current=stepId||String(stateData.currentStep||flow[0]?.id||"");
  const step=flow.find((x)=>x?.id===current); if(!step)return reply(chatId,"Qualification is complete. A sales agent can continue with you.");
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
  await db.query("INSERT INTO leads (workspace_id,id,person_id,name,phone,telegram_username,telegram_chat_id,status,source,medium,lead_category,capture_mode,message,owner_email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[workspaceId,leadId,personId,name.slice(0,160),stateData.phone||null,user?.username||null,String(user?.id||chatId),"NEW","telegram","telegram","PUBLIC_TELEGRAM","MANUAL",JSON.stringify(stateData),assignedOwner||owners[0]?.email||null]);
  await db.query("UPDATE telegram_public_sessions SET lead_id=?,person_id=? WHERE workspace_id=? AND telegram_user_id=?",[leadId,personId,workspaceId,String(user?.id||chatId)]);
  await db.query("UPDATE leads SET next_action=?,next_action_due_at=DATE_ADD(NOW(),INTERVAL 30 MINUTE) WHERE id=? AND workspace_id=? AND phone IS NULL",[stateData.phone?"Verify Telegram identity and reachable contact address before human handoff.":"Obtain a reachable phone/contact address and verify Telegram identity before human handoff.",leadId,workspaceId]);
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
  const name=[user?.first_name,user?.last_name].filter(Boolean).join(" ")||user?.username||"Telegram user";
  const username=user?.username?("@"+user.username):"not provided";
  const userId=String(user?.id||chatId);
  const contactParts=[
    process.env.ASLAL_CONTACT_ADDRESS ? "Address: "+process.env.ASLAL_CONTACT_ADDRESS : "",
    process.env.SUPPORT_EMAIL ? "Email: "+process.env.SUPPORT_EMAIL : "",
    process.env.SUPPORT_PHONE ? "Phone: "+process.env.SUPPORT_PHONE : "",
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ? "Telegram: @"+String(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME).replace(/^@/,"") : ""
  ].filter(Boolean);
  const aslalContact=contactParts.length?contactParts.join("\n"):"Website: "+(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com");
  const customerContact=[
    "Your Telegram: "+username,
    "Telegram user ID: "+userId,
    data.phone ? "Your phone: "+data.phone : ""
  ].filter(Boolean).join("\n");
  await db.query("UPDATE telegram_public_sessions SET state='SUPPORT_REQUESTED',support_requested_at=NOW() WHERE workspace_id=? AND telegram_user_id=?",[workspaceId,userId]);
  if(cfg.handoffChatId){
    const sent=await tg("sendMessage",{chat_id:String(cfg.handoffChatId),text:"🔔 New public Telegram support request\nLead: "+leadId+"\nCustomer: "+name+"\n"+customerContact+"\n\nAslal sales contact:\n"+aslalContact+"\n\nAnswers: "+JSON.stringify(data)});
    const sentId=sent?.result?.message_id;
    await savePublicState(workspaceId,userId,"SUPPORT_REQUESTED",{...data,handoffAdminMessageId:sentId,publicChatId:chatId,leadId});
  }
  return tg("sendMessage",{chat_id:chatId,text:"A support request has been created. A member of Aslal sales will continue with you here.\n\nAslal sales contact:\n"+aslalContact+"\n\nYour reachable contact:\n"+customerContact,reply_markup:{keyboard:[[{text:"❌ Close menu"}]],resize_keyboard:true,is_persistent:true}});
}
async function pricingResponse(chatId:string,workspaceId:string){
  if(await keywordResponse(chatId,workspaceId,"price"))return;
  const [rows]=await db.query<(RowDataPacket&{name:string;starting_price:string|null;cta_label:string|null})[]>(`SELECT name,starting_price,cta_label FROM products WHERE workspace_id=? AND active=1 ORDER BY featured DESC,sort_order ASC,name ASC LIMIT 12`,[workspaceId]);
  if(!rows.length)return reply(chatId,"Pricing is available through our catalog. Choose Catalog to see current offers.");
  return reply(chatId,rows.map(r=>r.name+" — "+(r.starting_price?money(r.starting_price)+" ETB":"Request pricing")).join("\n")+"\n\nUse Catalog for full specifications and ordering.");
}

async function keywordResponse(chatId:string,workspaceId:string,textValue:string){
  const cfg=await getTelegramChannelConfig(workspaceId); if(!cfg?.knowledgeBaseEnabled||!Array.isArray(cfg.keywordRules))return false;
  for(const rule of cfg.keywordRules as unknown as KeywordRule[]){try{const matched=String(rule.mode||"EXACT").toUpperCase()==="REGEX"?new RegExp(String(rule.pattern||""),"i").test(textValue):textValue.toLowerCase()===String(rule.pattern||"").toLowerCase();if(matched){await reply(chatId,String(rule.response||""));return true;}}catch{}}
  return false;
}
async function inlineCatalog(update:TelegramInlineQuery){
  const q=clean(update.query),workspaceId=await resolveTelegramDefaultWorkspaceId();
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
  const from: TelegramUser = m.from ?? {id: m.chat?.id ?? ""};
  const name=[from.first_name,from.last_name].filter(Boolean).join(" ")||from.username||"Telegram contact";
  const phone=clean(m.contact?.phone_number);
  const personId=crypto.randomUUID();
  const leadId=crypto.randomUUID();
  const [ownerRows]=await db.query<(RowDataPacket&{email:string})[]>("SELECT u.email FROM users u JOIN workspace_users wu ON wu.user_id=u.id WHERE wu.workspace_id=? AND u.active=1 AND u.role IN ('SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN') ORDER BY FIELD(u.role,'SALES_OPERATOR','SALES_MANAGER','BUSINESS_OWNER','ADMIN','SUPER_ADMIN'),u.last_login_at DESC LIMIT 1",[workspaceId]);
  const owner=ownerRows[0]?.email||null;
  await db.query("INSERT INTO persons (id,name) VALUES (?,?)",[personId,name.slice(0,160)]);
  await db.query("INSERT INTO communication_preferences (id,person_id,telegram_allowed) VALUES (?,?,1)",[crypto.randomUUID(),personId]);
  await db.query("INSERT INTO leads (workspace_id,id,person_id,name,phone,telegram_username,telegram_chat_id,status,source,medium,campaign,referral_code,owner_email,lead_category,capture_mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[workspaceId,leadId,personId,name.slice(0,160),phone||null,from.username||null,String(from.id||m.chat?.id||""),"NEW",d.source||"telegram",d.medium||"telegram",d.campaign_id?d.campaign_id:null,d.referral_code||null,owner,"TELEGRAM_INBOUND","MANUAL"]);
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
    const parts=data.split(":"); const workspaceId=parts[2]||String(process.env.TELEGRAM_DEFAULT_WORKSPACE_ID||""); const user: TelegramUser=q.from ?? {id: chatId};
    if(workspaceId&&user?.id){ await syncTelegramIdentity({workspaceId,user,chatId,event:"BUTTON_CLICK",metadata:{callbackData:data}}).catch(()=>null); }
    if(parts[0]==="public"&&parts[1]==="catalog")return catalog(chatId,workspaceId);
    if(parts[0]==="public"&&parts[1]==="services")return servicesResponse(chatId,workspaceId);
    if(parts[0]==="public"&&parts[1]==="need")return needResponse(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="orders")return ordersResponse(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="partner")return partnerResponse(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="pricing")return pricingResponse(chatId,workspaceId);
    if(parts[0]==="public"&&parts[1]==="agent")return handoffPublic(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="continue")return continuePublic(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="qualify")return qualification(chatId,workspaceId,user);
    if(parts[0]==="public"&&parts[1]==="answer"){
      const stepId=parts[3],value=parts.slice(4).join(":"); const session=await publicSession(workspaceId,user,chatId); const prior=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{}); const stateData={...prior,[stepId]:value};
      const cfg=await getTelegramChannelConfig(workspaceId); const flow=Array.isArray(cfg?.qualificationFlow)?cfg.qualificationFlow as unknown as QualificationStep[]:[]; const step=flow.find((x)=>x?.id===stepId); const option=step?.options?.find((x:any)=>String(x.value)===value); const next=option?.next;
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
      await db.query("UPDATE users SET telegram_chat_id=?,telegram_username=?,telegram_link_token=NULL,telegram_linked_at=NOW() WHERE id=?",[chatId,clean(m.from?.username).replace(/^@/,"").slice(0,190)||null,rows[0].id]);
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
    const defaultWorkspaceId=await resolveTelegramDefaultWorkspaceId();
    if(defaultWorkspaceId){const cfg=await getTelegramChannelConfig(defaultWorkspaceId);if(cfg?.publicEnabled&&cfg.allowAnonymousUsers)return publicMenu(chatId,defaultWorkspaceId,m.from||{id:chatId});return catalog(chatId,defaultWorkspaceId);}
    return reply(chatId,"Welcome to Aslal. Telegram is not connected to an active workspace yet. Please contact Aslal support.");
  }

  const publicWorkspaceId=await resolveTelegramDefaultWorkspaceId();
  if(chatType==="private" && publicWorkspaceId && m.contact?.phone_number && (!m.contact.user_id || String(m.contact.user_id)===String(m.from?.id||""))){
    const contactUserId=String(m.contact.user_id||m.from?.id||chatId);
    const contactPhone=clean(m.contact.phone_number);
    const cfg=await getTelegramChannelConfig(publicWorkspaceId);
    if(cfg?.enabled&&cfg.publicEnabled&&cfg.allowAnonymousUsers&&contactPhone){
      const telegramUser: TelegramUser=m.from||{id:contactUserId};
      await syncTelegramIdentity({workspaceId:publicWorkspaceId,user:telegramUser,chatId,event:"CONTACT_SHARED"}).catch(()=>null);
      const session=await publicSession(publicWorkspaceId,telegramUser,chatId);
      const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
      const leadId=await ensurePublicLead(publicWorkspaceId,telegramUser,chatId,{...stateData,phone:contactPhone});
      await db.query("UPDATE leads SET phone=?,telegram_username=?,telegram_chat_id=?,next_action=?,next_action_due_at=DATE_ADD(NOW(),INTERVAL 30 MINUTE),message=CONCAT(COALESCE(message,''),'\\n[Telegram contact shared] ',?) WHERE id=? AND workspace_id=?",[contactPhone,telegramUser.username||null,contactUserId,"Verify Telegram identity and reachable contact address before human handoff.",contactPhone,leadId,publicWorkspaceId]);
      await savePublicState(publicWorkspaceId,contactUserId,"CONTACT_RECEIVED",{...stateData,phone:contactPhone,contactVerified:false});
      return reply(chatId,"Thanks — your phone number is now attached to your Aslal lead. A sales team member can verify the contact and continue with you.");
    }
  }

  if(chatType==="private" && publicWorkspaceId){
    const cfg=await getTelegramChannelConfig(publicWorkspaceId);
    if(cfg?.enabled&&cfg.publicEnabled&&cfg.allowAnonymousUsers){ await syncTelegramIdentity({workspaceId:publicWorkspaceId,user:m.from||{id:chatId},chatId,event:input.startsWith("/start")?"START":"MESSAGE",startParam:input.startsWith("/start")?input.split(/\s+/,2)[1]||null:null}).catch(()=>null); }
    if(cfg?.publicEnabled&&cfg.allowAnonymousUsers){
      const session=await publicSession(publicWorkspaceId,m.from||{id:chatId},chatId);
      const stateData=typeof session.state_data==="string"?JSON.parse(session.state_data||"{}"):(session.state_data||{});
      if(session.state==="QUALIFYING" && input && !input.startsWith("/")){
        const flow=Array.isArray(cfg.qualificationFlow)?cfg.qualificationFlow as unknown as QualificationStep[]:[]; const step=flow.find((x)=>x?.id===stateData.currentStep);
        if(step?.inputType==="PHONE" && !/^\\+?[0-9 ()-]{7,20}$/.test(input))return reply(chatId,"Please enter a valid phone number.");
        const nextData={...stateData,[String(step?.id||"answer")]:input};
        const next=step?.next;
        await savePublicState(publicWorkspaceId,String(m.from?.id||chatId),next?"QUALIFYING":"QUALIFIED",{...nextData,currentStep:next||null});
        if(next)return qualification(chatId,publicWorkspaceId,m.from||{id:chatId},String(next));
        await ensurePublicLead(publicWorkspaceId,m.from||{id:chatId},chatId,nextData);
        return tg("sendMessage",{chat_id:chatId,text:"Thanks. Your answers have been saved.",reply_markup:{inline_keyboard:[[{text:"🛍 Catalog",callback_data:"public:catalog:"+publicWorkspaceId},{text:"👤 Talk to Agent",callback_data:"public:agent:"+publicWorkspaceId}]]}});
      }
      if(input==="/help"||input==="❌ Close menu")return input==="❌ Close menu"?tg("sendMessage",{chat_id:chatId,text:"Aslal menu closed. Send /start or /help any time to reopen it.",reply_markup:{remove_keyboard:true}}):publicMenu(chatId,publicWorkspaceId,m.from||{id:chatId});
      const publicUser=m.from||{id:chatId};
      const parsedMenu=parsePublicMenu(cfg.publicMenu);
      const selected=parsedMenu.items.find(item=>item.label===input);
      const action=selected?.action||legacyAction(input);
      if(action==="PRICING"||input==="/pricing")return pricingResponse(chatId,publicWorkspaceId);
      if(action==="CATALOG"||input==="/catalog")return catalog(chatId,publicWorkspaceId);
      if(action==="SERVICES")return servicesResponse(chatId,publicWorkspaceId);
      if(action==="NEED"||input==="/need")return needResponse(chatId,publicWorkspaceId,publicUser);
      if(action==="ORDERS"||input==="/orders")return ordersResponse(chatId,publicWorkspaceId,publicUser);
      if(action==="HUMAN"||input==="/support")return handoffPublic(chatId,publicWorkspaceId,publicUser);
      if(action==="PARTNER")return partnerResponse(chatId,publicWorkspaceId,publicUser);
      if(action==="CONTINUE")return continuePublic(chatId,publicWorkspaceId,publicUser);
      if(action==="PHONE"&&m.contact?.phone_number)return;
      if(await keywordResponse(chatId,publicWorkspaceId,input))return;
      if(session.state==="SUPPORT_REQUESTED"){if(await routePublicMessageToHandoff(chatId,publicWorkspaceId,publicUser,m))return reply(chatId,"Your message has been sent to the support team.");return handoffPublic(chatId,publicWorkspaceId,publicUser);}
      if(session.state==="QUALIFYING")return qualification(chatId,publicWorkspaceId,publicUser,String(stateData.currentStep||""));
      if(session.state==="DEMAND_CAPTURED"||session.state==="NEED_CAPTURE")return createTelegramDemand(chatId,publicWorkspaceId,publicUser,input);
      return createTelegramDemand(chatId,publicWorkspaceId,publicUser,input);
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
    await syncTelegramIdentity({workspaceId:d.workspace_id,user:m.from||{id:chatId},chatId,event:"MESSAGE"}).catch(()=>null);
    return handleClientInbound(d.workspace_id,d,m,chatId);
  }

  const resolvedWorkspaceId=await resolveTelegramDefaultWorkspaceId(); const publicHandoffChatId=String((await getTelegramChannelConfig(resolvedWorkspaceId))?.handoffChatId||"");
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
