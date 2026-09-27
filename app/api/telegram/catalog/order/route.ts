import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {randomUUID} from "node:crypto";
import {getTelegramChannelConfig} from "@/lib/telegram-channel-config";

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

async function notifyOrderParties(workspaceId:string,ownerEmail:string|null,customerChatId:string,customerText:string,staffText:string){
 const customerSent=await telegramSend(customerChatId,customerText);
 const cfg=await getTelegramChannelConfig(workspaceId).catch(()=>null);
 let salesSent=false;
 let adminSent=false;
 if(ownerEmail){
  const owners=await prisma.user.findMany({where:{email:ownerEmail,active:true,workspaceUsers:{some:{workspaceId}}},select:{telegramChatId:true},take:1});
  const chatId=owners[0]?.telegramChatId||null;
  if(chatId)salesSent=await telegramSend(chatId,staffText);
 }
 if(cfg?.handoffChatId)adminSent=await telegramSend(cfg.handoffChatId,staffText);
 if(!adminSent){
  const admins=await prisma.user.findMany({where:{active:true,workspaceUsers:{some:{workspaceId}},role:{in:["SALES_MANAGER","BUSINESS_OWNER","ADMIN","SUPER_ADMIN"]},telegramChatId:{not:null}},select:{telegramChatId:true},take:3});
  for(const admin of admins){
   if(admin.telegramChatId && await telegramSend(admin.telegramChatId,staffText))adminSent=true;
  }
 }
 return {customerSent,salesSent,adminSent};
}

export async function POST(request:Request){
 try{
 const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const slug=clean(body.slug,160);
 const name=clean(body.name,160);
 const phoneInput=clean(body.phone,40);
 const chatId=clean(body.chatId,80);
 const telegramUsername=clean(body.telegramUsername,190).replace(/^@/,"");
 const campaignId=clean(body.campaignId,36);
 if(!workspaceId||!slug)return error("This order link is incomplete. Please return to the catalog and try again.");
 if(!validName(name))return error("Please enter your full name using letters only (2–160 characters).");
 const phone=normalizePhone(phoneInput);
 if(!phone)return error("Please enter a valid mobile number with country code, for example +251 911 276682 or +254 7xx xxx xxx.");

 const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true,name:true}});
 if(!workspace)return error("This order catalog is no longer available. Please return to the catalog.",404);

 const destination=chatId?await prisma.telegramDestination.findFirst({where:{workspaceId,chatId,active:true},select:{id:true,partnerId:true,referralCode:true,campaignId:true,salesOwnerEmail:true}}):null;
 const requestedCampaign=campaignId||destination?.campaignId||null;
 const campaign=requestedCampaign?await prisma.partnerCampaign.findFirst({where:{id:requestedCampaign,workspaceId,status:{in:["OPEN","ACTIVE"]}},select:{id:true}}):null;
 const referral=destination?.referralCode?await prisma.referralLink.findFirst({where:{workspaceId,code:destination.referralCode},select:{id:true,partnerId:true,code:true,campaignId:true}}):null;
 const effectiveCampaignId=campaign?.id||referral?.campaignId||null;

 const product=await prisma.product.findFirst({where:{workspaceId,slug,active:true}});
 const resource=product?null:await prisma.resource.findFirst({where:{workspaceId,slug,active:true}});
 if(!product&&!resource)return error("This item is no longer available.",404);
 const itemName=product?.name||resource?.title||slug;
 const rawPrice=product?.startingPrice?.match(/[0-9][0-9,]*(?:\.[0-9]+)?/)?.[0]?.replace(/,/g,"")||"0";
 const total=Number(rawPrice)||0;
 if(total<=0)return error("This item is available by order request. Our team will confirm the scope and price before payment.",409);

 let orderNumber="";
 let orderId="";
 let paymentId:string|null=null;
 let ownerEmail=destination?.salesOwnerEmail||null;
 let leadId:string|null=null;
 let customerId="";

 await prisma.$transaction(async tx=>{
  let customer=await tx.customer.findFirst({where:{workspaceId,phone}});
  if(!customer){
   customer=await tx.customer.create({data:{id:randomUUID(),workspaceId,name,phone,status:"ACTIVE"}});
  }else if(customer.name!==name){
   customer=await tx.customer.update({where:{id:customer.id},data:{name}});
  }
  customerId=customer.id;

  let personId=customer.personId||null;
  if(!personId){
   personId=randomUUID();
   await tx.person.create({data:{id:personId,name,phone}});
   await tx.customer.update({where:{id:customer.id},data:{personId}});
  }

  let lead=await tx.lead.findFirst({where:{workspaceId,phone}});
  if(!lead){
   leadId=randomUUID();
   lead=await tx.lead.create({data:{id:leadId,workspaceId,personId,name,phone,status:"NEW",source:"telegram",medium:"telegram",campaign:effectiveCampaignId,ownerEmail,telegramUsername:telegramUsername||null,telegramChatId:chatId||null,message:"Telegram catalog order. Telegram username: "+(telegramUsername?"@"+telegramUsername:"not provided")+"; Telegram chat ID: "+(chatId||"not provided"),leadCategory:"TELEGRAM_CATALOG_ORDER",captureMode:"MANUAL"}});
  }else{
   leadId=lead.id;
   if(ownerEmail&&lead.ownerEmail!==ownerEmail)lead=await tx.lead.update({where:{id:lead.id},data:{ownerEmail}});
   await tx.lead.update({where:{id:lead.id},data:{telegramUsername:telegramUsername||lead.telegramUsername,telegramChatId:chatId||lead.telegramChatId,message:"Telegram catalog order. Telegram username: "+(telegramUsername?"@"+telegramUsername:"not provided")+"; Telegram chat ID: "+(chatId||"not provided")}});
  }
  if(product)await tx.leadProductInterest.upsert({where:{leadId_productId:{leadId:lead.id,productId:product.id}},create:{id:randomUUID(),leadId:lead.id,productId:product.id,source:"telegram",interestScore:1},update:{interestScore:{increment:1}}});

  orderId=randomUUID();
  orderNumber="ASL-TG-"+Date.now().toString(36).toUpperCase();
  await tx.order.create({data:{id:orderId,workspaceId,orderNumber,status:"DRAFT",currency:"ETB",subtotal:total,total,paymentState:"PENDING",source:"telegram",campaign:effectiveCampaignId,referralCode:referral?.code||null,partnerId:referral?.partnerId||destination?.partnerId||null,referralLinkId:referral?.id||null,salesOwnerEmail:ownerEmail,customerId:customer.id,items:{create:{id:randomUUID(),description:itemName,quantity:1,unitPrice:total,lineTotal:total}}}});
  if(chatId){
   if(destination){
    await tx.telegramDestination.update({where:{id:destination.id},data:{leadId:leadId,personId:personId,productId:product?.id||null,campaignId:effectiveCampaignId,source:"telegram",medium:"telegram",label:name}});
   }else{
    await tx.telegramDestination.create({data:{id:randomUUID(),workspaceId,chatId,type:"PRIVATE",label:name,active:true,optIn:true,leadId:leadId,personId:personId,productId:product?.id||null,campaignId:effectiveCampaignId,source:"telegram",medium:"telegram"}});
   }
  }
 });

 const customerText=`✅ Aslal order request received

Order: ${orderNumber}
Item: ${itemName}
Amount: ${total>0?total.toLocaleString("en-ET")+" ETB":"To be confirmed"}

Your order request is saved. No payment is required at this stage. Our team will contact you here to confirm the details and next step.`;
 const staffText=`🛒 New Telegram catalog order

Order: ${orderNumber}
Customer: ${name}
Phone: ${phone}
Item: ${itemName}
Amount: ${total>0?total.toLocaleString("en-ET")+" ETB":"To be confirmed"}
Lead: ${leadId||"linked"}
Sales owner: ${ownerEmail||"Unassigned"}
Telegram: ${telegramUsername?"@"+telegramUsername:chatId||"not available"}

Action: open the Aslal dashboard and continue the sales/payment workflow. Payment is NOT confirmed.`;

 const notifications=await notifyOrderParties(workspaceId,ownerEmail,chatId,customerText,staffText);
 return NextResponse.json({ok:true,orderId,orderNumber,leadId,notifications,nextStep:"Your order request is saved. Sales will confirm the details and price, then guide you to the appropriate next step.",message:"Order request received and saved. Please keep your order number for reference."});
 }catch(e){
  console.error("Telegram catalog order failed",e);
  return error("We could not save your order request right now. Please try again.",500);
 }
}
