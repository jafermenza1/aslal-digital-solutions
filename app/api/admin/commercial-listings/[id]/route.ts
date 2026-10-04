import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=["PRODUCT","SERVICE","ASSET","PROPERTY"] as const;
const STATUSES=["DRAFT","PENDING_REVIEW","APPROVED","PUBLISHED","PAUSED","SOLD_OUT","EXPIRED","ARCHIVED","REJECTED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
function parse(body:any,current:any){
 const listingType=String(body.listingType??current.listingType) as (typeof TYPES)[number];
 const status=String(body.status??current.status) as (typeof STATUSES)[number];
 const askingRaw=body.askingPrice===undefined?current.askingPrice:body.askingPrice;
 const askingPrice=askingRaw===""||askingRaw==null?null:Number(askingRaw);
 return {
  workspaceId:clean(body.workspaceId??current.workspaceId,36),
  productId:clean(body.productId??current.productId??"",36)||null,
  ownerPartyId:clean(body.ownerPartyId??current.ownerPartyId??"",36)||null,
  supplierPartyId:clean(body.supplierPartyId??current.supplierPartyId??"",36)||null,
  professionalProfileId:clean(body.professionalProfileId??current.professionalProfileId??"",36)||null,
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
 if(data.ownerPartyId && !(await prisma.commercialParty.findFirst({where:{id:data.ownerPartyId,workspaceId:current.workspaceId,status:{not:"ARCHIVED"}},select:{id:true}})))return NextResponse.json({error:"The selected owner does not belong to this workspace or is archived."},{status:400});
 if(data.supplierPartyId && !(await prisma.commercialParty.findFirst({where:{id:data.supplierPartyId,workspaceId:current.workspaceId,status:{not:"ARCHIVED"}},select:{id:true}})))return NextResponse.json({error:"The selected supplier does not belong to this workspace or is archived."},{status:400});\n if(data.professionalProfileId && !(await prisma.professionalProfile.findFirst({where:{id:data.professionalProfileId,workspaceId:current.workspaceId,status:{in:["PUBLISHED","PENDING_REVIEW"]}},select:{id:true}})))return NextResponse.json({error:"The selected professional profile is not available in this workspace."},{status:400});
 if(data.status==="PUBLISHED"&&!data.ownerPartyId)return NextResponse.json({error:"A listing cannot be published without an identified commercial owner."},{status:400});
 if(data.productId){
  const product=await prisma.product.findFirst({where:{id:data.productId,workspaceId:current.workspaceId},select:{id:true}});
  if(!product)return NextResponse.json({error:"The selected catalog item does not belong to this workspace."},{status:400});
 }
 if(data.slug!==current.slug){
  const duplicate=await prisma.commercialListing.findFirst({where:{workspaceId:current.workspaceId,slug:data.slug,id:{not:id}},select:{id:true}});
  if(duplicate)return NextResponse.json({error:"That listing slug is already in use in this workspace."},{status:409});
 }
 const published=data.status==="PUBLISHED"&&data.publicVisible;
 const listing=await prisma.commercialListing.update({where:{id},data:{...data,publishedAt:published?(current.publishedAt||new Date()):null},include:{product:{select:{id:true,name:true,slug:true,kind:true}},ownerParty:{select:{id:true,name:true,type:true,status:true}},supplierParty:{select:{id:true,name:true,type:true,status:true}},workspace:{select:{id:true,name:true,slug:true}}}});
 return NextResponse.json({ok:true,listing});
}


export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const current=await prisma.commercialListing.findUnique({where:{id},select:{id:true,workspaceId:true,title:true,status:true}});
 if(!current)return NextResponse.json({error:"Commercial listing not found."},{status:404});
 const access=await authorizeWorkspacePermission("products.manage",current.workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const [authorizations,matches,responses,registrations,appointments,disputes,agreements,leakage] = await Promise.all([
  prisma.commercialListingAuthorization.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialMatch.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialRequestResponse.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialDealRegistration.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialAppointment.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialDispute.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialAgreement.count({where:{listingId:id,workspaceId:current.workspaceId}}),
  prisma.commercialLeakageSignal.count({where:{listingId:id,workspaceId:current.workspaceId}}),
 ]);
 const dependentCount=authorizations+matches+responses+registrations+appointments+disputes+agreements+leakage;
 if(dependentCount>0){
  const archived=await prisma.commercialListing.update({where:{id},data:{status:"ARCHIVED",publicVisible:false,featured:false}});
  return NextResponse.json({ok:true,action:"ARCHIVED",listing:archived,message:"This listing has commercial history, so it was archived instead of physically deleted. History and attribution were preserved."});
 }
 await prisma.commercialListing.delete({where:{id}});
 return NextResponse.json({ok:true,action:"DELETED",id});
}
