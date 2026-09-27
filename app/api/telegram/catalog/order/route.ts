import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {randomUUID} from "node:crypto";
import {normalizeEthiopianPhone} from "@/lib/ethiopian-phone";
export const dynamic="force-dynamic";
function clean(v:unknown,max:number){return typeof v==="string"?v.trim().slice(0,max):"";}
function validName(value:string){return value.length>=2&&value.length<=160&&/\p{L}/u.test(value)&&!/[\d<>]/.test(value);}
function error(message:string,status=400){return NextResponse.json({ok:false,error:message},{status});}
export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));const workspaceId=clean(body.workspaceId,36),slug=clean(body.slug,160),name=clean(body.name,160),phoneInput=clean(body.phone,40),chatId=clean(body.chatId,80),campaignId=clean(body.campaignId,36);
 if(!workspaceId||!slug)return error("This checkout link is incomplete. Please return to the catalog and try again.");
 if(!validName(name))return error("Please enter your full name using letters only (2–160 characters).");
 const phone=normalizeEthiopianPhone(phoneInput);if(!phone)return error("Please enter a valid Ethiopian mobile number, for example +251 911 276682.");
 const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true,name:true}});if(!workspace)return error("This checkout is no longer available. Please return to the catalog.",404);
 const destination=chatId?await prisma.telegramDestination.findFirst({where:{workspaceId,chatId,active:true,optIn:true},select:{partnerId:true,referralCode:true,campaignId:true}}):null;
 const requestedCampaign=campaignId||destination?.campaignId||null;const campaign=requestedCampaign?await prisma.partnerCampaign.findFirst({where:{id:requestedCampaign,workspaceId,status:{in:["OPEN","ACTIVE"]}},select:{id:true}}):null;
 const referral=destination?.referralCode?await prisma.referralLink.findFirst({where:{workspaceId,code:destination.referralCode},select:{id:true,partnerId:true,code:true,campaignId:true}}):null;const effectiveCampaignId=campaign?.id||referral?.campaignId||null;
 const product=await prisma.product.findFirst({where:{workspaceId,slug,active:true}});const resource=product?null:await prisma.resource.findFirst({where:{workspaceId,slug,active:true}});if(!product&&!resource)return error("This item is no longer available.",404);
 const itemName=product?.name||resource?.title||slug;const rawPrice=product?.startingPrice?.match(/[0-9][0-9,]*(?:\.[0-9]+)?/)?.[0]?.replace(/,/g,"")||"0";const total=Number(rawPrice)||0;if(total<=0)return error("This item requires a quote. Please use the sales request option so our team can confirm the scope and price.",409);
 const existingCustomer=await prisma.customer.findFirst({where:{workspaceId,phone}});const customer=existingCustomer||await prisma.customer.create({data:{id:randomUUID(),workspaceId,name,phone,status:"ACTIVE"}});
 const orderId=randomUUID(),paymentId=randomUUID();const orderNumber="ASL-TG-"+Date.now().toString(36).toUpperCase();
 await prisma.$transaction(async tx=>{await tx.order.create({data:{id:orderId,workspaceId,orderNumber,status:"DRAFT",currency:"ETB",subtotal:total,total,paymentState:"PENDING",source:"telegram",campaign:effectiveCampaignId,referralCode:referral?.code||null,partnerId:referral?.partnerId||destination?.partnerId||null,referralLinkId:referral?.id||null,customerId:customer.id,items:{create:{id:randomUUID(),description:itemName,quantity:1,unitPrice:total,lineTotal:total}}}});await tx.payment.create({data:{id:paymentId,workspaceId,orderId,customerId:customer.id,provider:"TELEGRAM_PENDING",idempotencyKey:"telegram:"+chatId+":"+orderId,amount:total,currency:"ETB",method:"TELEGRAM",status:"PENDING",metadata:{telegramChatId:chatId,workspaceId,slug,campaignId:effectiveCampaignId,partnerId:referral?.partnerId||destination?.partnerId||null,referralCode:referral?.code||null,customerName:name,customerPhone:phone}}});});
 return NextResponse.json({ok:true,orderId,orderNumber,paymentId,nextStep:"Our team will confirm the order details and send the available payment instructions. Payment remains pending until verified.",message:"Order received. Please keep your order number for reference."});
}
