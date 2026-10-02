import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=["PRODUCT","SERVICE","ASSET","PROPERTY"] as const;
const STATUSES=["DRAFT","PENDING_REVIEW","APPROVED","PUBLISHED","PAUSED","SOLD_OUT","EXPIRED","ARCHIVED","REJECTED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
function parse(body:any,current:any){
 const listingType=String(body.listingType??current.listingType);
 const status=String(body.status??current.status);
 const askingRaw=body.askingPrice===undefined?current.askingPrice:body.askingPrice;
 const askingPrice=askingRaw===""||askingRaw==null?null:Number(askingRaw);
 return {
  workspaceId:clean(body.workspaceId??current.workspaceId,36),
  productId:clean(body.productId??current.productId??"",36)||null,
  title:clean(body.title??current.title,190),
  slug:clean(body.slug??current.slug,160),
  listingType,status,
  description:clean(body.description??current.description??"",20000)||null,
  category:clean(body.category??current.category??"General",100)||"General",
  condition:clean(body.condition??current.condition??"",60)||null,
  location:clean(body.location??current.location??"",190)||null,
  askingPrice:Number.isFinite(Number(askingPrice))?Number(askingPrice):null,
  currency:clean(body.currency??current.currency??"ETB",10)||"ETB",
  priceLabel:clean(body.priceLabel??current.priceLabel??"",100)||null,
  inspectionRequired:body.inspectionRequired===undefined?current.inspectionRequired:Boolean(body.inspectionRequired),
  requestQuote:body.requestQuote===undefined?current.requestQuote:Boolean(body.requestQuote),
  publicVisible:body.publicVisible===undefined?current.publicVisible:Boolean(body.publicVisible),
  featured:body.featured===undefined?current.featured:Boolean(body.featured),
  metadata:body.metadata===undefined?current.metadata:(body.metadata&&typeof body.metadata==="object"?body.metadata:null),
  expiresAt:body.expiresAt===undefined?current.expiresAt:(body.expiresAt?new Date(body.expiresAt):null)
 };
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const body=await request.json().catch(()=>({}));
 const {id}=await params;
 const current=await prisma.commercialListing.findUnique({where:{id}});
 if(!current)return NextResponse.json({error:"Commercial listing not found."},{status:404});
 const access=await authorizeWorkspacePermission("products.manage",current.workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const data=parse(body,current);
 if(data.workspaceId!==current.workspaceId)return NextResponse.json({error:"A listing cannot be moved between workspaces from this operation."},{status:400});
 if(!data.title||!data.slug||!TYPES.includes(data.listingType)||!STATUSES.includes(data.status)||data.askingPrice!==null&&!Number.isFinite(data.askingPrice))return NextResponse.json({error:"Invalid listing data."},{status:400});
 if(data.productId){
  const product=await prisma.product.findFirst({where:{id:data.productId,workspaceId:current.workspaceId},select:{id:true}});
  if(!product)return NextResponse.json({error:"The selected catalog item does not belong to this workspace."},{status:400});
 }
 if(data.slug!==current.slug){
  const duplicate=await prisma.commercialListing.findFirst({where:{workspaceId:current.workspaceId,slug:data.slug,id:{not:id}},select:{id:true}});
  if(duplicate)return NextResponse.json({error:"That listing slug is already in use in this workspace."},{status:409});
 }
 const published=data.status==="PUBLISHED"&&data.publicVisible;
 const listing=await prisma.commercialListing.update({where:{id},data:{...data,publishedAt:published?(current.publishedAt||new Date()):null},include:{product:{select:{id:true,name:true,slug:true,kind:true}},workspace:{select:{id:true,name:true,slug:true}}}});
 return NextResponse.json({ok:true,listing});
}
