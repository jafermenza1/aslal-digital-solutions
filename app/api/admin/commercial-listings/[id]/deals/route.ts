import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { evaluateCommercialPartnerEligibility } from "@/lib/commercial-eligibility";

const STATUSES = ["REQUESTED","APPROVED","REJECTED","PROTECTED","EXPIRED","CONVERTED","DISPUTED"] as const;
const ACTIVE = ["REQUESTED","APPROVED","PROTECTED","DISPUTED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

async function access(workspaceId:string){
  return authorizeWorkspacePermission("products.manage",workspaceId);
}

async function conflictFor(workspaceId:string, listingId:string, leadId:string, email:string, phone:string, excludeId?:string){
  return prisma.commercialDealRegistration.findFirst({
    where:{
      workspaceId, listingId,
      status:{in:[...ACTIVE]},
      ...(excludeId?{id:{not:excludeId}}:{}),
      OR:[
        {leadId},
        ...(email?[{buyerEmail:email}]:[]),
        ...(phone?[{buyerPhone:phone}]:[])
      ]
    },
    include:{partner:{select:{id:true,name:true,partnerNumber:true}},listing:{select:{id:true,title:true}},lead:{select:{id:true,name:true,email:true,phone:true}}}
  });
}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id:listingId}=await params;
  const url=new URL(request.url);
  const workspaceId=clean(url.searchParams.get("workspaceId"),36);
  const partnerId=clean(url.searchParams.get("partnerId"),36);
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  const listing=await prisma.commercialListing.findFirst({where:{id:listingId,workspaceId:accessResult.workspace.id},select:{id:true,title:true,status:true,publicVisible:true}});
  if(!listing)return NextResponse.json({error:"Listing not found."},{status:404});
  const registrations=await prisma.commercialDealRegistration.findMany({
    where:{workspaceId:accessResult.workspace.id,listingId,...(partnerId?{partnerId}:{})},
    orderBy:{createdAt:"desc"},
    take:100,
    include:{
      partner:{select:{id:true,name:true,partnerNumber:true,type:true,status:true}},
      lead:{select:{id:true,name:true,email:true,phone:true,status:true}},
      opportunity:{select:{id:true,name:true,stage:true,expectedValue:true}},
      authorization:{select:{id:true,status:true,authorizationType:true,protectionDays:true}},
    }
  });
  return NextResponse.json({listing,registrations});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id:listingId}=await params;
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36), partnerId=clean(body.partnerId,36), leadId=clean(body.leadId,36), authorizationId=clean(body.authorizationId,36)||null;
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  if(!partnerId||!leadId)return NextResponse.json({error:"partnerId and leadId are required."},{status:400});

  const [listing,partner,lead,authorization]=await Promise.all([
    prisma.commercialListing.findFirst({where:{id:listingId,workspaceId:accessResult.workspace.id}}),
    prisma.partner.findFirst({where:{id:partnerId,workspaceId:accessResult.workspace.id}}),
    prisma.lead.findFirst({where:{id:leadId,workspaceId:accessResult.workspace.id}}),
    authorizationId?prisma.commercialListingAuthorization.findFirst({where:{id:authorizationId,workspaceId:accessResult.workspace.id,listingId,partnerId}}):prisma.commercialListingAuthorization.findFirst({where:{workspaceId:accessResult.workspace.id,listingId,partnerId,status:"ACTIVE"},orderBy:{createdAt:"desc"}})
  ]);
  if(!listing||!partner||!lead)return NextResponse.json({error:"Listing, partner, or lead is not in this workspace."},{status:404});
  if(listing.status!=="PUBLISHED"||!listing.publicVisible)return NextResponse.json({error:"Only published, publicly visible listings can be registered."},{status:422});
  if(!authorization||authorization.status!=="ACTIVE")return NextResponse.json({error:"An active partner authorization is required before registering a deal."},{status:422});
  if(authorization.expiresAt&&authorization.expiresAt<=new Date())return NextResponse.json({error:"Partner authorization has expired."},{status:422});

  const eligibility=await evaluateCommercialPartnerEligibility({
    workspaceId:accessResult.workspace.id,listingId,partnerId,authorizationId:authorization.id,
    channel:authorization.channel,territory:authorization.territory,actorId:accessResult.user.id
  });
  if(eligibility.decision!=="ELIGIBLE")return NextResponse.json({error:"Partner is not currently eligible for this listing.",eligibility},{status:422});

  const buyerEmail=clean(body.buyerEmail,190)||lead.email||"";
  const buyerPhone=clean(body.buyerPhone,40)||lead.phone||"";
  const conflict=await conflictFor(accessResult.workspace.id,listingId,leadId,buyerEmail,buyerPhone);
  if(conflict){
    if(conflict.partnerId===partnerId)return NextResponse.json({error:"This opportunity is already registered by this partner.",existing:conflict},{status:409});
    return NextResponse.json({error:"An active/protected registration already exists for this buyer and listing.",conflict},{status:409});
  }

  const registration=await prisma.commercialDealRegistration.create({
    data:{
      id:randomUUID(),workspaceId:accessResult.workspace.id,listingId,partnerId,authorizationId,leadId,
      opportunityId:clean(body.opportunityId,36)||null,status:"REQUESTED",
      source:clean(body.source,100)||lead.source||"deal-registration",
      buyerName:clean(body.buyerName,190)||lead.name,buyerEmail:buyerEmail||null,buyerPhone:buyerPhone||null,
      estimatedValue:body.estimatedValue==null||body.estimatedValue===""?null:Number(body.estimatedValue),
      currency:clean(body.currency,10)||"ETB",notes:clean(body.notes,20000)||null,
      evidence:{requestedBy:accessResult.user.id,requestedAt:new Date().toISOString(),eligibilityDecision:eligibility.decision},
      createdBy:accessResult.user.id
    },
    include:{partner:true,listing:true,lead:true,authorization:true}
  });
  return NextResponse.json({ok:true,registration,eligibility},{status:201});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id:registrationId}=await params;
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36);
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  const current=await prisma.commercialDealRegistration.findFirst({
    where:{id:registrationId,workspaceId:accessResult.workspace.id},
    include:{authorization:true,lead:true,listing:true,partner:true}
  });
  if(!current)return NextResponse.json({error:"Deal registration not found."},{status:404});
  const requested=String(body.status||"");
  if(!STATUSES.includes(requested as any))return NextResponse.json({error:"Invalid deal registration status."},{status:400});

  if(requested==="REJECTED"){
    if(!["REQUESTED","DISPUTED"].includes(current.status))return NextResponse.json({error:"Only requested/disputed registrations can be rejected."},{status:409});
    const updated=await prisma.commercialDealRegistration.update({where:{id:registrationId},data:{
      status:"REJECTED",reviewedAt:new Date(),rejectedAt:new Date(),reviewedBy:accessResult.user.id,
      rejectionReason:clean(body.rejectionReason,20000)||"Registration rejected by workspace operator.",
      evidence:{...(current.evidence as object||{}),rejection:{actor:accessResult.user.id,at:new Date().toISOString(),reason:clean(body.rejectionReason,20000)}}
    }});
    return NextResponse.json({ok:true,registration:updated});
  }

  if(requested==="APPROVED"||requested==="PROTECTED"){
    if(!["REQUESTED","DISPUTED"].includes(current.status))return NextResponse.json({error:"Only requested/disputed registrations can be approved."},{status:409});
    const eligibility=await evaluateCommercialPartnerEligibility({
      workspaceId:accessResult.workspace.id,listingId:current.listingId,partnerId:current.partnerId,
      authorizationId:current.authorizationId,channel:current.authorization?.channel||null,
      territory:current.authorization?.territory||null,actorId:accessResult.user.id
    });
    if(eligibility.decision!=="ELIGIBLE")return NextResponse.json({error:"Partner is no longer eligible; registration remains unchanged.",eligibility},{status:422});
    const conflict=await conflictFor(accessResult.workspace.id,current.listingId,current.leadId,current.buyerEmail||"",current.buyerPhone||"",registrationId);
    if(conflict)return NextResponse.json({error:"Another active/protected registration conflicts with this buyer/listing.",conflict},{status:409});
    const now=new Date();
    const protectionDays=current.authorization?.protectionDays&&current.authorization.protectionDays>0?current.authorization.protectionDays:90;
    const until=new Date(now.getTime()+protectionDays*86400000);
    const updated=await prisma.$transaction(async tx=>{
      const registration=await tx.commercialDealRegistration.update({where:{id:registrationId},data:{
        status:"PROTECTED",reviewedAt:now,reviewedBy:accessResult.user.id,protectedFrom:now,protectedUntil:until,
        evidence:{...(current.evidence as object||{}),approval:{actor:accessResult.user.id,at:now.toISOString(),protectionDays,protectedUntil:until.toISOString()}}
      }});
      await tx.lead.update({where:{id:current.leadId},data:{
        attributionLockedAt:now,attributionLockedBy:current.partnerId,attributionExpiresAt:until,
        attributionOverrideReason:null
      }});
      return registration;
    });
    return NextResponse.json({ok:true,registration:updated,protectionDays,eligibility});
  }

  if(requested==="CONVERTED"){
    if(!["PROTECTED","APPROVED"].includes(current.status))return NextResponse.json({error:"Only protected registrations can be marked converted."},{status:409});
    const updated=await prisma.commercialDealRegistration.update({where:{id:registrationId},data:{status:"CONVERTED",convertedAt:new Date()}});
    return NextResponse.json({ok:true,registration:updated});
  }

  if(requested==="DISPUTED"){
    if(!["PROTECTED","CONVERTED"].includes(current.status))return NextResponse.json({error:"Only protected/converted registrations can be disputed."},{status:409});
    const updated=await prisma.commercialDealRegistration.update({where:{id:registrationId},data:{status:"DISPUTED",disputedAt:new Date(),notes:clean(body.notes,20000)||current.notes}});
    return NextResponse.json({ok:true,registration:updated});
  }

  if(requested==="EXPIRED"){
    if(current.protectedUntil&&current.protectedUntil>new Date())return NextResponse.json({error:"Protection period has not expired."},{status:409});
    const updated=await prisma.commercialDealRegistration.update({where:{id:registrationId},data:{status:"EXPIRED"}});
    return NextResponse.json({ok:true,registration:updated});
  }

  return NextResponse.json({error:"Unsupported status transition."},{status:400});
}
