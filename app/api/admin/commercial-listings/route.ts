import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { authorizePermission } from "@/lib/auth";

const TYPES=["PRODUCT","SERVICE","ASSET","PROPERTY"] as const;
const STATUSES=["DRAFT","PENDING_REVIEW","APPROVED","PUBLISHED","PAUSED","SOLD_OUT","EXPIRED","ARCHIVED","REJECTED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const validVideo=(value:unknown)=>{if(!value)return null;try{const u=new URL(String(value));if(!["http:","https:"].includes(u.protocol))return null;return u.toString().slice(0,1000);}catch{return null;}};
const adminRoles=new Set(["ADMIN","SUPER_ADMIN"]);
const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,160);

function parse(body:any){
 const title=clean(body.title,190);
 const listingType=String(body.listingType||"PRODUCT") as (typeof TYPES)[number];
 const status=String(body.status||"DRAFT") as (typeof STATUSES)[number];
 const workspaceId=clean(body.workspaceId,36);
 const productId=clean(body.productId,36)||null;
 const ownerPartyId=clean(body.ownerPartyId,36)||null;
 const supplierPartyId=clean(body.supplierPartyId,36)||null;
 const professionalProfileId=clean(body.professionalProfileId,36)||null;
 const slug=slugify(clean(body.slug,160)||title);
 const askingPrice=body.askingPrice===""||body.askingPrice==null?null:Number(body.askingPrice);
 return {
  workspaceId,productId,ownerPartyId,supplierPartyId,professionalProfileId,title,slug,listingType,status,
  description:clean(body.description,20000)||null,
  category:clean(body.category,100)||"General",
  condition:clean(body.condition,60)||null,
  location:clean(body.location,190)||null,
  askingPrice:Number.isFinite(askingPrice)?askingPrice:null,
  currency:clean(body.currency,10)||"ETB",
  priceLabel:clean(body.priceLabel,100)||null,
  inspectionRequired:Boolean(body.inspectionRequired),
  requestQuote:body.requestQuote!==false,
  publicVisible:Boolean(body.publicVisible),
  featured:Boolean(body.featured),
  metadata:{...(body.metadata&&typeof body.metadata==="object"?body.metadata:{}),...(validVideo(body.videoUrl)?{videoUrl:validVideo(body.videoUrl)}:{})},
  expiresAt:body.expiresAt?new Date(body.expiresAt):null
 };
}
function valid(p:any){
 return p.workspaceId&&p.title&&p.slug&&TYPES.includes(p.listingType)&&STATUSES.includes(p.status)&&
   (p.askingPrice===null||Number.isFinite(p.askingPrice));
}
export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")?.trim()||"";
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const listings=await prisma.commercialListing.findMany({
  where:{workspaceId:access.workspace.id},
  orderBy:[{updatedAt:"desc"}],
  include:{product:{select:{id:true,name:true,slug:true,kind:true}},professionalProfile:{select:{id:true,displayName:true,profession:true,verificationLevel:true,status:true}},ownerParty:{select:{id:true,name:true,type:true,status:true}},supplierParty:{select:{id:true,name:true,type:true,status:true}},workspace:{select:{id:true,name:true,slug:true}}}
 });
 const products=await prisma.product.findMany({where:{workspaceId:access.workspace.id},select:{id:true,name:true,slug:true,kind:true,active:true},orderBy:{name:"asc"}});
 return NextResponse.json({listings,products,workspace:access.workspace});
}
export async function POST(request:Request){
 const actor=await authorizeWorkspacePermission("listings.manage",(await request.clone().json().catch(()=>({}))).workspaceId);
 if(!actor)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const body=await request.json().catch(()=>({})); const p=parse(body);
 if(p.workspaceId!==actor.workspace.id)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(!valid(p))return NextResponse.json({error:"Workspace, title, slug, listing type and valid status are required."},{status:400});
 if(p.ownerPartyId && !(await prisma.commercialParty.findFirst({where:{id:p.ownerPartyId,workspaceId:p.workspaceId,status:{not:"ARCHIVED"}},select:{id:true}})))return NextResponse.json({error:"The selected owner does not belong to this workspace or is archived."},{status:400});
 if(p.professionalProfileId && !(await prisma.professionalProfile.findFirst({where:{id:p.professionalProfileId,workspaceId:p.workspaceId,status:{in:["PUBLISHED","PENDING_REVIEW"]}},select:{id:true}})))return NextResponse.json({error:"The selected professional profile is not available in this workspace."},{status:400});
 if(p.supplierPartyId && !(await prisma.commercialParty.findFirst({where:{id:p.supplierPartyId,workspaceId:p.workspaceId,status:{not:"ARCHIVED"}},select:{id:true}})))return NextResponse.json({error:"The selected supplier does not belong to this workspace or is archived."},{status:400});
 if(p.status==="PUBLISHED"&&!p.ownerPartyId)return NextResponse.json({error:"A listing cannot be published without an identified commercial owner."},{status:400});
 const canPublish=adminRoles.has(actor.user.role);
 if(!canPublish){p.status="PENDING_REVIEW";p.publicVisible=false;p.featured=false;}
 if(p.productId){
  const product=await prisma.product.findFirst({where:{id:p.productId,workspaceId:p.workspaceId},select:{id:true}});
  if(!product)return NextResponse.json({error:"The selected catalog item does not belong to this workspace."},{status:400});
 }
 let slug=p.slug,suffix=2;
 while(await prisma.commercialListing.findUnique({where:{workspaceId_slug:{workspaceId:p.workspaceId,slug}},select:{id:true}}))slug=slugify(p.slug+"-"+suffix++);
 const publish=p.status==="PUBLISHED"&&p.publicVisible;
 const listing=await prisma.commercialListing.create({data:{id:randomUUID(),...p,slug,createdBy:actor.user.id,publishedAt:publish?new Date():null},include:{product:{select:{id:true,name:true,slug:true,kind:true}},workspace:{select:{id:true,name:true,slug:true}}}});
 return NextResponse.json({ok:true,listing});
}
