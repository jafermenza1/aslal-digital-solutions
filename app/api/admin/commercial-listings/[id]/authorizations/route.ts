import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=["OWNED","SUPPLIED","RESELLER_AUTHORIZED","IMPLEMENTATION_PARTNER","AFFILIATE_PROMOTION","SERVICE_PROVIDER","CUSTOM"] as const;
const STATUSES=["REQUESTED","APPROVED","ACTIVE","SUSPENDED","EXPIRED","REVOKED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

async function accessFor(request:Request,workspaceId:string){return authorizeWorkspacePermission("products.manage",workspaceId);}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")?.trim()||"";
 const access=await accessFor(request,workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const listing=await prisma.commercialListing.findFirst({where:{id,workspaceId:access.workspace.id},select:{id:true,title:true,workspaceId:true}});
 if(!listing)return NextResponse.json({error:"Listing not found."},{status:404});
 const authorizations=await prisma.commercialListingAuthorization.findMany({
  where:{listingId:id,workspaceId:access.workspace.id},
  orderBy:{createdAt:"desc"},
  include:{party:{select:{id:true,name:true,type:true,status:true}},program:{select:{id:true,name:true,status:true,admissionMode:true}},partner:{select:{id:true,name:true,partnerNumber:true,type:true,status:true,verificationStatus:true}},user:{select:{id:true,name:true,email:true,active:true}}}
 });
 return NextResponse.json({listing,authorizations});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const access=await accessFor(request,workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const listing=await prisma.commercialListing.findFirst({where:{id,workspaceId:access.workspace.id},select:{id:true}});
 if(!listing)return NextResponse.json({error:"Listing not found."},{status:404});
 const partyId=clean(body.partyId,36)||null, partnerId=clean(body.partnerId,36)||null, userId=clean(body.userId,36)||null, programId=clean(body.programId,36)||null;
 if([partyId,partnerId,userId].filter(Boolean).length!==1)
  return NextResponse.json({error:"Select exactly one authorized party, partner, or staff user."},{status:400});
 if(partyId && !(await prisma.commercialParty.findFirst({where:{id:partyId,workspaceId:access.workspace.id,status:{not:"ARCHIVED"}},select:{id:true}})))
  return NextResponse.json({error:"Commercial party does not belong to this workspace or is archived."},{status:400});
 if(programId && !(await prisma.partnerProgram.findFirst({where:{id:programId,workspaceId:access.workspace.id},select:{id:true}})))return NextResponse.json({error:"Partner program does not belong to this workspace."},{status:400});
 if(partnerId && !(await prisma.partner.findFirst({where:{id:partnerId,workspaceId:access.workspace.id},select:{id:true}})))
  return NextResponse.json({error:"Partner does not belong to this workspace."},{status:400});
 if(userId && !(await prisma.workspaceUser.findFirst({where:{workspaceId:access.workspace.id,userId,status:"ACTIVE"},select:{id:true}})))
  return NextResponse.json({error:"Staff user is not an active member of this workspace."},{status:400});
 const authorizationType=String(body.authorizationType||"CUSTOM"), status=String(body.status||"REQUESTED");
 if(!TYPES.includes(authorizationType as any)||!STATUSES.includes(status as any))
  return NextResponse.json({error:"Invalid authorization type or status."},{status:400});
 const authorization=await prisma.commercialListingAuthorization.create({data:{
  id:randomUUID(),workspaceId:access.workspace.id,listingId:id,partyId,partnerId,userId,programId,
  authorizationType:authorizationType as any,status:status as any,
  effectiveAt:body.effectiveAt?new Date(body.effectiveAt):new Date(),
  expiresAt:body.expiresAt?new Date(body.expiresAt):null,
  territory:clean(body.territory,190)||null,channel:clean(body.channel,100)||null,
  partnerTypes:clean(body.partnerTypes,250)||null,
  quantityLimit:body.quantityLimit===""||body.quantityLimit==null?null:Number(body.quantityLimit),
  commissionRule:clean(body.commissionRule,500)||null,protectionDays:body.protectionDays==null?null:Number(body.protectionDays),
  exclusions:clean(body.exclusions,20000)||null,
  approvedBy:["APPROVED","ACTIVE"].includes(status)?access.user.id:null,
  approvedAt:["APPROVED","ACTIVE"].includes(status)?new Date():null
 },include:{party:true,partner:true,user:true}});
 if(partnerId && ["APPROVED","ACTIVE"].includes(status)){
   const { evaluateCommercialPartnerEligibility } = await import("@/lib/commercial-eligibility");
   const eligibility=await evaluateCommercialPartnerEligibility({workspaceId:access.workspace.id,listingId:id,partnerId,authorizationId:authorization.id,channel:clean(body.channel,100)||null,territory:clean(body.territory,190)||null,actorId:access.user.id});
   if(eligibility.decision!=="ELIGIBLE"){
     const held=await prisma.commercialListingAuthorization.update({where:{id:authorization.id},data:{status:"SUSPENDED"}});
     return NextResponse.json({ok:false,error:"Authorization recorded but not activated because the partner is not currently eligible.",authorization:held,eligibility},{status:422});
   }
 }
 return NextResponse.json({ok:true,authorization},{status:201});
}
