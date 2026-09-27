import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { ProductKind, ProductRelationship } from "@prisma/client";

async function telegramSend(chatId:string,text:string){const token=process.env.TELEGRAM_BOT_TOKEN;if(!token||!chatId)return false;try{const r=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});return r.ok;}catch{return false;}}

const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
function validBody(body:any,current:any){
 const p={
  workspaceId:clean(body.workspaceId??current.workspaceId??"",36),
  category:clean(body.category??current.category??"General",100)||"General",
  stockQuantity:body.stockQuantity===null||body.stockQuantity===""?null:Math.max(0,Math.floor(Number(body.stockQuantity??current.stockQuantity)||0)),
  name:clean(body.name??current.name,190),
  providerName:clean(body.providerName??current.providerName??"",190)||null,
  kind:String(body.kind??current.kind) as ProductKind,
  relationshipType:String(body.relationshipType??current.relationshipType) as ProductRelationship,
  shortDescription:clean(body.shortDescription??current.shortDescription,500),
  description:clean(body.description??current.description??"",20000)||null,
  tagline:clean(body.tagline??current.tagline??"",250)||null,
  features:clean(body.features??current.features??"",12000)||null,
  benefits:clean(body.benefits??current.benefits??"",12000)||null,
  idealFor:clean(body.idealFor??current.idealFor??"",12000)||null,
  deliverables:clean(body.deliverables??current.deliverables??"",12000)||null,
  imageUrl:clean(body.imageUrl??current.imageUrl??"",1000)||null,
  galleryUrls:clean(body.galleryUrls??current.galleryUrls??"",12000)||null,
  startingPrice:clean(body.startingPrice??current.startingPrice??"",100)||null,
  ctaLabel:clean(body.ctaLabel??current.ctaLabel??"",80)||null,
  ctaNote:clean(body.ctaNote??current.ctaNote??"",250)||null,
  sortOrder:Math.max(0,Math.min(9999,Number(body.sortOrder??current.sortOrder)||0)),
  featured:body.featured===undefined?current.featured:Boolean(body.featured),
  active:body.active===undefined?current.active:Boolean(body.active),
 };
 if(!p.name||!p.shortDescription||!p.workspaceId||!Object.values(ProductKind).includes(p.kind)||!Object.values(ProductRelationship).includes(p.relationshipType))return null;
 if(p.kind===ProductKind.PRODUCT&&(p.stockQuantity===null||!Number.isInteger(p.stockQuantity)))return null;
 return p;
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("products.manage");
 if(!actor)return NextResponse.json({error:"Catalog administration is not permitted."},{status:403});
 const {id}=await params; const current=await prisma.product.findUnique({where:{id}});
 if(!current)return NextResponse.json({error:"Product/service not found."},{status:404});
 const body=await request.json().catch(()=>({})); const data=validBody(body,current);
 if(!data)return NextResponse.json({error:body.kind===ProductKind.PRODUCT&&(body.stockQuantity===null||body.stockQuantity==="")?"A product requires a stock number. Use 0 when it is currently out of stock.":"Name, short description, workspace, type and relationship are required."},{status:400});
 const access=await authorizeWorkspacePermission("products.manage",data.workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const product=await prisma.product.update({where:{id},data,include:{workspace:{select:{id:true,name:true,slug:true}}}});
 if((current.stockQuantity||0)<=0&&(product.stockQuantity||0)>0){
  const waiting=await prisma.lead.findMany({where:{workspaceId:product.workspaceId,leadCategory:"TELEGRAM_PRODUCT_RESTOCK",telegramChatId:{not:null},productInterests:{some:{productId:product.id}}},select:{id: true,telegramChatId:true}});
  for(const lead of waiting){if(lead.telegramChatId&&await telegramSend(lead.telegramChatId,"🔔 "+product.name+" is back in stock. You can return to the Aslal Telegram catalog to request it now.")){await prisma.lead.update({where:{id:lead.id},data:{leadCategory:"TELEGRAM_PRODUCT_RESTOCK_NOTIFIED",message:"Customer notified by Telegram that "+product.name+" is back in stock."}});}}
 }
 revalidatePath("/products"); revalidatePath("/contact"); revalidatePath("/products/"+product.slug);
 return NextResponse.json({ok:true,product});
}
