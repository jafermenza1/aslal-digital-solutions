import { prisma, TelegramDeliveryEventType, TelegramOutboxStatus, TelegramMessageType, TelegramSendMode } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

const RETRY_MINUTES=[1,5,15,60,360];
function json(value:unknown){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
function retryAt(attempt:number){return new Date(Date.now()+RETRY_MINUTES[Math.min(Math.max(attempt-1,0),RETRY_MINUTES.length-1)]*60_000);}

type TelegramSendResult={ok:boolean;result?:any;description?:string;error_code?:number};

async function tg(method:string,body:Record<string,unknown>):Promise<TelegramSendResult>{
 const token=process.env.TELEGRAM_BOT_TOKEN;
 if(!token)throw new Error("TELEGRAM_BOT_TOKEN is not configured");
 const response=await fetch("https://api.telegram.org/bot"+token+"/"+method,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
 const data=await response.json().catch(()=>({ok:false,description:"Invalid Telegram response"}));
 if(!response.ok||!data.ok)throw new Error(String(data.description||"Telegram API request failed"));
 return data;
}

function bodyFor(row:any){
 const body:any={chat_id:row.chatId};
 if(row.messageThreadId!=null)body.message_thread_id=row.messageThreadId;
 if(row.sendMode===TelegramSendMode.BUSINESS&&row.businessConnectionId)body.business_connection_id=row.businessConnectionId;
 return body;
}

async function sendOutbox(row:any){
 const base=bodyFor(row);
 const markup=row.replyMarkup?json(row.replyMarkup):undefined;
 if(row.mediaType==="PHOTO") return tg("sendPhoto",{...base,photo:row.mediaUrl,caption:row.content,parse_mode:"HTML",reply_markup:markup});
 if(row.mediaType==="VIDEO") return tg("sendVideo",{...base,video:row.mediaUrl,caption:row.content,parse_mode:"HTML",reply_markup:markup});
 if(row.mediaType==="DOCUMENT") return tg("sendDocument",{...base,document:row.mediaUrl,caption:row.content,parse_mode:"HTML",reply_markup:markup});
 if(row.mediaType==="AUDIO") return tg("sendAudio",{...base,audio:row.mediaUrl,caption:row.content,parse_mode:"HTML",reply_markup:markup});
 if(row.mediaType==="VOICE") return tg("sendVoice",{...base,voice:row.mediaUrl,caption:row.content,parse_mode:"HTML",reply_markup:markup});
 if(row.mediaType==="VIDEO_NOTE") return tg("sendVideoNote",{...base,video_note:row.mediaUrl,reply_markup:markup});
 if(row.mediaType==="STICKER") return tg("sendSticker",{...base,sticker:row.mediaUrl,reply_markup:markup});
 return tg("sendMessage",{...base,text:row.content,parse_mode:"HTML",disable_web_page_preview:true,reply_markup:markup});
}

export async function queueTelegram(input:{
 workspaceId:string; chatId:string; content:string; messageType?:TelegramMessageType; sendMode?:TelegramSendMode;
 businessConnectionId?:string|null; messageThreadId?:number|null; mediaType?:string|null; mediaUrl?:string|null;
 replyMarkup?:unknown; leadId?:string|null; personId?:string|null; customerId?:string|null; opportunityId?:string|null;
 conversationId?:string|null; messageId?:string|null; templateKey?:string|null; createdBy?:string|null; nextAttemptAt?:Date|null;
}){
 if(!input.chatId.trim())throw new Error("Telegram chat ID is required.");
 if(!input.content.trim()&&!input.mediaUrl)throw new Error("Telegram content or media is required.");
 return prisma.telegramOutbox.create({data:{
  id:randomUUID(),workspaceId:input.workspaceId,chatId:input.chatId.trim(),content:input.content||"",messageType:input.messageType??TelegramMessageType.TRANSACTIONAL,
  sendMode:input.sendMode??TelegramSendMode.BOT,businessConnectionId:input.businessConnectionId??null,messageThreadId:input.messageThreadId??null,
  mediaType:input.mediaType??null,mediaUrl:input.mediaUrl??null,replyMarkup:json(input.replyMarkup),originalContent:input.content||"",
  originalReplyMarkup:json(input.replyMarkup),leadId:input.leadId??null,personId:input.personId??null,customerId:input.customerId??null,
  opportunityId:input.opportunityId??null,conversationId:input.conversationId??null,messageId:input.messageId??null,templateKey:input.templateKey??null,
  createdBy:input.createdBy??"system",nextAttemptAt:input.nextAttemptAt??new Date()
 }});
}

async function claim(id:string){
 const result=await prisma.telegramOutbox.updateMany({where:{id,status:{in:[TelegramOutboxStatus.QUEUED,TelegramOutboxStatus.FAILED]},attemptCount:{lt:3},OR:[{nextAttemptAt:null},{nextAttemptAt:{lte:new Date()}}]},data:{status:TelegramOutboxStatus.SENDING,lastAttemptAt:new Date()}});
 return result.count===1;
}

export async function dispatchTelegram(id:string){
 if(!(await claim(id)))return {status:"SKIPPED" as const};
 const row=await prisma.telegramOutbox.findUnique({where:{id}});
 if(!row)return {status:"MISSING" as const};
 if(row.messageType===TelegramMessageType.MARKETING&&row.leadId){const handoff=await prisma.conversation.findFirst({where:{leadId:row.leadId,channel:"TELEGRAM",status:"HUMAN_HANDOFF"},select:{id:true}});if(handoff){await prisma.telegramOutbox.update({where:{id},data:{status:TelegramOutboxStatus.DISCARDED,discardedAt:new Date(),nextAttemptAt:null,failureReason:"Telegram customer reply/human handoff stopped this marketing follow-up."}});return {status:"DISCARDED" as const,reason:"human-handoff"};}}
 const attempt=row.attemptCount+1;
 try{
  const result=await sendOutbox(row); const telegramMessageId=String(result.result?.message_id??"");
  await prisma.$transaction([
   prisma.telegramDeliveryAttempt.create({data:{id:randomUUID(),outboxId:id,attemptNumber:attempt,status:TelegramOutboxStatus.SENT,response:json(result)}}),
   prisma.telegramOutbox.update({where:{id},data:{status:TelegramOutboxStatus.SENT,attemptCount:attempt,telegramMessageId:telegramMessageId||null,telegramResponse:json(result),failureReason:null,nextAttemptAt:null,sentAt:new Date()}}),
   prisma.telegramDeliveryEvent.create({data:{id:randomUUID(),outboxId:id,eventType:TelegramDeliveryEventType.SENT,metadata:json({telegramMessageId})}})
  ]);
  return {status:"SENT" as const,telegramMessageId};
 }catch(error){
  const message=error instanceof Error?error.message:"Telegram provider error."; const exhausted=attempt>=row.maxAttempts; const next=exhausted?null:retryAt(attempt);
  await prisma.$transaction([
   prisma.telegramDeliveryAttempt.create({data:{id:randomUUID(),outboxId:id,attemptNumber:attempt,status:TelegramOutboxStatus.FAILED,error:message}}),
   prisma.telegramOutbox.update({where:{id},data:{status:TelegramOutboxStatus.FAILED,attemptCount:attempt,failureReason:message,nextAttemptAt:next}}),
   prisma.telegramDeliveryEvent.create({data:{id:randomUUID(),outboxId:id,eventType:TelegramDeliveryEventType.FAILED,metadata:json({error:message,attempt,exhausted})}})
  ]);
  return {status:"FAILED" as const,exhausted,nextAttemptAt:next,error:message};
 }
}

export async function processTelegramQueue(limit=25){
 const rows=await prisma.telegramOutbox.findMany({where:{status:{in:[TelegramOutboxStatus.QUEUED,TelegramOutboxStatus.FAILED]},attemptCount:{lt:3},OR:[{nextAttemptAt:null},{nextAttemptAt:{lte:new Date()}}]},orderBy:[{nextAttemptAt:"asc"},{createdAt:"asc"}],take:Math.max(1,Math.min(100,limit)),select:{id:true}});
 const results=[]; for(const row of rows)results.push(await dispatchTelegram(row.id)); return results;
}

export async function retryTelegram(id:string){
 const row=await prisma.telegramOutbox.findUnique({where:{id},select:{status:true}});
 if(!row)throw new Error("Telegram message not found.");
 if(![TelegramOutboxStatus.FAILED,TelegramOutboxStatus.DRAFT].includes(row.status))throw new Error("Only failed or draft Telegram messages can be sent.");
 await prisma.telegramOutbox.update({where:{id},data:{status:TelegramOutboxStatus.QUEUED,attemptCount:0,nextAttemptAt:new Date(),failureReason:null}});
 return dispatchTelegram(id);
}

export async function discardTelegram(id:string){
 return prisma.telegramOutbox.updateMany({where:{id,status:{in:[TelegramOutboxStatus.DRAFT,TelegramOutboxStatus.QUEUED,TelegramOutboxStatus.FAILED]}},data:{status:TelegramOutboxStatus.DISCARDED,discardedAt:new Date(),nextAttemptAt:null}});
}

export async function recordTelegramEvent(outboxId:string,eventType:TelegramDeliveryEventType,metadata?:unknown){
 return prisma.telegramDeliveryEvent.create({data:{id:randomUUID(),outboxId,eventType,metadata:json(metadata)}});
}

export async function queueTelegramTemplate(input:{
 workspaceId:string; chatId:string; templateKey:string; variables?:Record<string,unknown>; leadId?:string|null; personId?:string|null;
 customerId?:string|null; opportunityId?:string|null; conversationId?:string|null; sendMode?:TelegramSendMode; businessConnectionId?:string|null;
 createdBy?:string; delayMinutes?:number;
}){
 const template=await prisma.telegramTemplate.findFirst({where:{workspaceId:input.workspaceId,templateKey:input.templateKey,active:true}});
 if(!template)return {queued:false as const,skipped:"template-disabled" as const};
 const lead=input.leadId?await prisma.lead.findUnique({where:{id:input.leadId},include:{person:{include:{communicationPreference:true}}} }):null;
 const pref=lead?.person?.communicationPreference;
 if(pref?.globalOptOut)return {queued:false as const,skipped:"global-opt-out" as const};
 if(template.messageType===TelegramMessageType.MARKETING&&!pref?.telegramAllowed)return {queued:false as const,skipped:"telegram-consent-required" as const};
 const values={name:lead?.name||"there",companyOrType:lead?.company||lead?.businessType||"your business",message:lead?.message||"",leadId:input.leadId||"",chatId:input.chatId,...input.variables};
 let content=template.contentTemplate.replace(/{{\s*([\w.]+)\s*}}/g,(_,key)=>String((values as any)[key]??""));
 let mediaUrl=template.mediaUrlTemplate?.replace(/{{\s*([\w.]+)\s*}}/g,(_,key)=>String((values as any)[key]??""))||null;
 const outbox=await queueTelegram({workspaceId:input.workspaceId,chatId:input.chatId,content,messageType:template.messageType,sendMode:input.sendMode,businessConnectionId:input.businessConnectionId,mediaType:template.mediaType,mediaUrl,replyMarkup:template.replyMarkup,leadId:input.leadId,personId:input.personId,customerId:input.customerId,opportunityId:input.opportunityId,conversationId:input.conversationId,templateKey:template.templateKey,createdBy:input.createdBy,nextAttemptAt:input.delayMinutes&&input.delayMinutes>0?new Date(Date.now()+Math.min(10080,input.delayMinutes)*60_000):new Date()});
 return {queued:true as const,outboxId:outbox.id};
}


export async function queueLeadTelegramTemplate(input:{
 leadId:string; templateKey:string; message?:string; createdBy?:string; delayMinutes?:number;
}){
 const lead=await prisma.lead.findUnique({where:{id:input.leadId},include:{person:{include:{communicationPreference:true}}}});
 if(!lead?.telegramChatId)return {queued:false as const,skipped:"no-telegram" as const};
 if(!lead.workspaceId)return {queued:false as const,skipped:"no-workspace" as const};
 const templates=await import("@/lib/telegram-templates");
 await templates.ensureCoreTelegramTemplates(lead.workspaceId);
 return queueTelegramTemplate({
  workspaceId:lead.workspaceId,chatId:lead.telegramChatId,templateKey:input.templateKey,leadId:lead.id,personId:lead.personId,
  variables:{message:input.message||lead.message||""},createdBy:input.createdBy||"automation",delayMinutes:input.delayMinutes
 });
}
