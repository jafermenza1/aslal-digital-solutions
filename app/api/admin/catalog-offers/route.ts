import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const statuses=["DRAFT","PUBLISHED","PAUSED","ARCHIVED"] as const;
const priceTypes=["FIXED","STARTING_FROM","QUOTE","CONTACT"] as const;
const channels=["WEBSITE","PARTNER_MARKETPLACE","TELEGRAM"] as const;

function str(v:unknown,max=1000){return typeof v==="string"?v.trim().slice(0,max):""}
function sourceCount(productId:string,resourceId:string){return Number(Boolean(productId))+Number(Boolean(resourceId));}

async function validateSource(workspaceId:string,productId:string|null,resourceId:string|null){
 if(sourceCount(productId||"",resourceId||"")!==1) return {error:"An offer must reference exactly one product or resource."};
 if(productId){
  const p=await prisma.product.findFirst({where:{id:productId,workspaceId},select:{id:true,active:true,name:true,slug:true,shortDescription:true,description:true,startingPrice:true,ctaLabel:true}});
  if(!p)return {error:"Product not found in this workspace."};
  if(!p.active)return {error:"The source product is not active."};
  return {product:p};
 }
 const r=await prisma.resource.findFirst({where:{id:resourceId!,workspaceId},select:{id:true,active:true,title:true,slug:true,description:true,cta:true}});
 if(!r)return {error:"Resource not found in this workspace."};
 if(!r.active)return {error:"The source resource is not active."};
 return {resource:r};
}

export async function GET(request:Request){
 const url=new URL(request.url),workspaceId=url.searchParams.get("workspaceId"),channel=url.searchParams.get("channel");
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
 const offers=await prisma.catalogOffer.findMany({where:{workspaceId:access.workspace.id,...(channel&&channels.includes(channel as any)?{channels:{some:{channel:channel as any}}}:{})},include:{product:{select:{id:nameSlugSelect.id,slug:nameSlugSelect.slug,name:nameSlugSelect.name}},resource:{select:{id:titleSlugSelect.id,slug:titleSlugSelect.slug,title:titleSlugSelect.title}},channels:{orderBy:{sortOrder:"asc"}}},orderBy:[{displayOrder:"asc"},{createdAt:"desc"}]});
 const [products,resources]=await Promise.all([prisma.product.findMany({where:{workspaceId:access.workspace.id,active:true},select:{id:true,name:true,slug:true}}),prisma.resource.findMany({where:{workspaceId:access.workspace.id,active:true},select:{id:true,title:true,slug:true}})]);\n return NextResponse.json({workspace:access.workspace,offers,products,resources});
}
const nameSlugSelect={id:true,slug:true,name:true} as const;
const titleSlugSelect={id:true,slug:true,title:true} as const;

export async function POST(request:Request){
 const body=await request.json().catch(()=>({})),workspaceId=str(body.workspaceId,36);
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
 const productId=str(body.productId,36)||null,resourceId=str(body.resourceId,36)||null;
 const source=await validateSource(access.workspace.id,productId,resourceId); if("error"in source)return NextResponse.json(source,{status:400});
 const title=str(body.title,250); if(!title)return NextResponse.json({error:"Offer title is required."},{status:400});
 const slug=str(body.slug,180).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); if(!slug)return NextResponse.json({error:"A valid offer slug is required."},{status:400});
 const status=statuses.includes(body.status)?body.status:"DRAFT",priceType=priceTypes.includes(body.priceType)?body.priceType:"QUOTE";
 if(priceType==="FIXED"&&body.price===undefined)return NextResponse.json({error:"Fixed offers require a price."},{status:400});
 const price=body.price===null||body.price===undefined||body.price===""?null:Number(body.price);
 if(price!==null&&(!Number.isFinite(price)||price<0))return NextResponse.json({error:"Price must be a non-negative number."},{status:400});
 const selectedChannels=Array.isArray(body.channels)?body.channels.filter((x:string)=>channels.includes(x as any)):[];
 const offer=await prisma.$transaction(async tx=>{
  const created=await tx.catalogOffer.create({data:{id:randomUUID(),workspaceId:access.workspace.id,productId,resourceId,slug,title,shortDescription:str(body.shortDescription,500)||null,description:str(body.description)||null,status,priceType,price,currency:str(body.currency,10)||"ETB",ctaLabel:str(body.ctaLabel,80)||"Request this",ctaMode:str(body.ctaMode,40)||"REQUEST",terms:str(body.terms)||null,eligibility:str(body.eligibility)||null,displayOrder:Number(body.displayOrder)||0,featured:Boolean(body.featured),publishedAt:status==="PUBLISHED"?new Date():null,createdBy:access.user?.email||access.user?.id||null}});
  for(let i=0;i<selectedChannels.length;i++) await tx.catalogOfferChannel.create({data:{id:randomUUID(),offerId:created.id,channel:selectedChannels[i],enabled:true,headline:str(body.channelOverrides?.[selectedChannels[i]]?.headline,250)||null,description:str(body.channelOverrides?.[selectedChannels[i]]?.description)||null,ctaLabel:str(body.channelOverrides?.[selectedChannels[i]]?.ctaLabel,80)||null,sortOrder:i}});
  return tx.catalogOffer.findUnique({where:{id:created.id},include:{channels:true,product:true,resource:true}});
 });
 return NextResponse.json({offer},{status:201});
}

export async function PATCH(request:Request){
 const body=await request.json().catch(()=>({})),id=str(body.id,36); if(!id)return NextResponse.json({error:"Offer id is required."},{status:400});
 const existing=await prisma.catalogOffer.findUnique({where:{id}}); if(!existing)return NextResponse.json({error:"Offer not found."},{status:404});
 const access=await authorizeWorkspacePermission("products.manage",existing.workspaceId); if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
 const productId=body.productId===undefined?existing.productId:(str(body.productId,36)||null),resourceId=body.resourceId===undefined?existing.resourceId:(str(body.resourceId,36)||null);
 const source=await validateSource(existing.workspaceId,productId,resourceId); if("error"in source)return NextResponse.json(source,{status:400});
 const status=statuses.includes(body.status)?body.status:existing.status,priceType=priceTypes.includes(body.priceType)?body.priceType:existing.priceType;
 const price=body.price===undefined?existing.price:(body.price===null||body.price===""?null:Number(body.price));
 if(priceType==="FIXED"&&(price===null||price===undefined||!Number.isFinite(Number(price))))return NextResponse.json({error:"Fixed offers require a valid price."},{status:400});
 const data:any={productId,resourceId,status,priceType,price,title:body.title===undefined?existing.title:str(body.title,250),shortDescription:body.shortDescription===undefined?existing.shortDescription:str(body.shortDescription,500)||null,description:body.description===undefined?existing.description:str(body.description)||null,currency:body.currency===undefined?existing.currency:str(body.currency,10)||"ETB",ctaLabel:body.ctaLabel===undefined?existing.ctaLabel:str(body.ctaLabel,80)||"Request this",ctaMode:body.ctaMode===undefined?existing.ctaMode:str(body.ctaMode,40)||"REQUEST",terms:body.terms===undefined?existing.terms:str(body.terms)||null,eligibility:body.eligibility===undefined?existing.eligibility:str(body.eligibility)||null,displayOrder:body.displayOrder===undefined?existing.displayOrder:Number(body.displayOrder)||0,featured:body.featured===undefined?existing.featured:Boolean(body.featured)};
 if(body.status==="PUBLISHED"&&existing.status!=="PUBLISHED")data.publishedAt=new Date();
 const offer=await prisma.catalogOffer.update({where:{id},data,include:{channels:true,product:true,resource:true}});
 if(Array.isArray(body.channels)){
  const selected=body.channels.filter((x:string)=>channels.includes(x as any));
  await prisma.$transaction(async tx=>{
   await tx.catalogOfferChannel.deleteMany({where:{offerId:id}});
   for(let i=0;i<selected.length;i++) await tx.catalogOfferChannel.create({data:{id:randomUUID(),offerId:id,channel:selected[i],enabled:true,sortOrder:i}});
  });
 }
 return NextResponse.json({offer:await prisma.catalogOffer.findUnique({where:{id},include:{channels:true,product:true,resource:true}})});
}
