import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {randomUUID} from "node:crypto";

export const dynamic="force-dynamic";

function clean(v:unknown,max:number){return typeof v==="string"?v.trim().slice(0,max):"";}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36),slug=clean(body.slug,160),name=clean(body.name,160),phone=clean(body.phone,40),chatId=clean(body.chatId,80),campaignId=clean(body.campaignId,36);
 if(!workspaceId||!slug||!name||!phone)return NextResponse.json({error:"Workspace, item, name and phone are required."},{status:400});
 const product=await prisma.product.findFirst({where:{workspaceId,slug,active:true}});
 const resource=product?null:await prisma.resource.findFirst({where:{workspaceId,slug,active:true}});
 if(!product&&!resource)return NextResponse.json({error:"Catalog item is unavailable."},{status:404});
 const itemName=product?.name||resource?.title||slug;
 const rawPrice=product?.startingPrice?.match(/[0-9][0-9,]*(?:\.[0-9]+)?/)?.[0]?.replace(/,/g,"")||"0";
 const total=Number(rawPrice)||0;
 if(total<=0)return NextResponse.json({error:"This item requires a quote before payment. Use the sales request instead."},{status:409});
 const orderId=randomUUID(),paymentId=randomUUID();
 const orderNumber="ASL-TG-"+Date.now().toString(36).toUpperCase();
 await prisma.$transaction(async tx=>{
   await tx.order.create({data:{id:orderId,workspaceId,orderNumber,status:"DRAFT",currency:"ETB",subtotal:total,total,paymentState:"PENDING",source:"telegram",campaign:campaignId||null,items:{create:{id:randomUUID(),description:itemName,quantity:1,unitPrice:total,lineTotal:total}}}});
   await tx.payment.create({data:{id:paymentId,workspaceId,orderId,provider:"TELEGRAM_PENDING",idempotencyKey:"telegram:"+chatId+":"+orderId,amount:total,currency:"ETB",method:"TELEGRAM",status:"PENDING",metadata:{telegramChatId:chatId,workspaceId,slug,campaignId:campaignId||null}}});
 });
 return NextResponse.json({ok:true,orderId,orderNumber,paymentId,paymentMessage:"Finance/payment verification remains the source of truth. No payment is marked confirmed by this Telegram flow."});
}
