import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {randomUUID} from "node:crypto";
import {syncTelegramIdentity} from "@/lib/telegram-identity";

export const dynamic="force-dynamic";

function clean(v:unknown,max:number){return typeof v==="string"?v.trim().slice(0,max):"";}
function normalizePhone(value:string){const raw=value.trim().replace(/[\s().-]/g,"");if(/^0\d{8,14}$/.test(raw))return "+251"+raw.slice(1);if(/^251\d{8,14}$/.test(raw))return "+"+raw;if(/^\+\d{8,15}$/.test(raw))return raw;return null;}
function validName(value:string){return value.length>=2&&value.length<=160&&/\p{L}/u.test(value)&&!/[\d<>]/.test(value);}
function error(message:string,status=400){return NextResponse.json({ok:false,error:message},{status});}

async function telegramSend(chatId:string,text:string){
 const token=process.env.TELEGRAM_BOT_TOKEN;
 if(!token||!chatId)return false;
 try{
  const r=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});
  return r.ok;
 }catch{return false;}
}

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36),slug=clean(body.slug,160),name=clean(body.name,160),phoneInput=clean(body.phone,40),suppliedChatId=clean(body.chatId,80),telegramInitData=clean(body.telegramInitData,8000);
  const restockConsent=body.restockConsent===true;
  let chatId=suppliedChatId;
  let identity:any=null;
  if(!workspaceId||!slug)return error("This product link is incomplete. Please return to the catalog.");
  if(!validName(name))return error("Please enter your full name using letters only.");\n  if(!restockConsent)return error("Please consent to receive a Telegram alert when this product is back in stock.");
  const phone=normalizePhone(phoneInput);
  if(!phone)return error("Please enter a valid mobile number with country code.");

  const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true}});
  if(!workspace)return error("This product link is no longer available.",404);
  if(telegramInitData){identity=await syncTelegramIdentity({workspaceId,initData:telegramInitData,event:"RESTOCK_STARTED",productSlug:slug});chatId=String(identity.user.id);}

  const product=await prisma.product.findFirst({where:{workspaceId,slug,active:true},select:{id:true,name:true,stockQuantity:true,kind:true}});
  if(!product)return error("This product is no longer available.",404);
  if(product.kind==="SERVICE")return error("This item is a service. Please use the service request form.",409);
  if(product.stockQuantity&&product.stockQuantity>0)return error("This product is already back in stock. You can place an order now.",409);

  const lead=identity?.leadId?await prisma.lead.update({where:{id:identity.leadId},data:{name,phone,telegramChatId:chatId||null,message:"Telegram product restock notification request for "+product.name}}):await prisma.lead.create({data:{
   id:randomUUID(),workspaceId,name,phone,status:"NEW",source:"telegram",medium:"telegram",
   message:"Telegram product restock notification request for "+product.name,
   leadCategory:"TELEGRAM_PRODUCT_RESTOCK",captureMode:"MANUAL",telegramChatId:chatId||null
  }});
  await prisma.leadProductInterest.create({data:{id:randomUUID(),leadId:lead.id,productId:product.id,source:"telegram",interestScore:1}});

  const textMessage="🔔 Product restock request\n\nCustomer: "+name+"\nPhone: "+phone+"\nProduct: "+product.name+"\nLead: "+lead.id+"\n\nAction: notify the customer when this product is restocked.";
  const cfg=await prisma.telegramChannelConfig.findFirst({where:{workspaceId,enabled:true},select:{handoffChatId:true}});
  if(cfg?.handoffChatId)await telegramSend(cfg.handoffChatId,textMessage);
  return NextResponse.json({ok:true,leadId:lead.id,message:"You are on the restock notification list. Aslal will contact you when this product is back in stock."});
 }catch(e){
  console.error("Telegram restock request failed",e);
  return error("We could not save your restock request right now. Please try again.",500);
 }
}