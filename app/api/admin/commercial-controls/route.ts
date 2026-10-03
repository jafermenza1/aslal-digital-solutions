import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const access=async(w:string)=>authorizeWorkspacePermission("commerce.manage",w);

export async function GET(req:Request){
 const u=new URL(req.url),workspaceId=s(u.searchParams.get("workspaceId"),36),kind=s(u.searchParams.get("kind"),20),status=s(u.searchParams.get("status"),30);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(kind==="disputes"){
  const disputes=await prisma.commercialDispute.findMany({where:{workspaceId:a.workspace.id,...(status?{status:status as any}:{})},orderBy:{createdAt:"desc"},take:300,include:{partner:{select:{id:true,name:true}},competingPartner:{select:{id:true,name:true}},listing:{select:{id:true,title:true}},lead:{select:{id:true,name:true}},dealRegistration:{select:{id:true,status:true,buyerName:true,protectedUntil:true}},commission:{select:{id:true,amount:true,currency:true,status:true}},leakageSignal:{select:{id:true,type:true,status:true}}}});
  return NextResponse.json({disputes});
 }
 const signals=await prisma.commercialLeakageSignal.findMany({where:{workspaceId:a.workspace.id,...(status?{status:status as any}:{})},orderBy:[{severity:"desc"},{createdAt:"desc"}],take:300,include:{partner:{select:{id:true,name:true}},listing:{select:{id:true,title:true}},lead:{select:{id:true,name:true}},dealRegistration:{select:{id:true,status:true,buyerName:true,protectedUntil:true}},appointment:{select:{id:true,status:true,outcome:true}},order:{select:{id:true,orderNumber:true,status:true}}}});
 return NextResponse.json({signals});
}

export async function POST(req:Request){
 const body=await req.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),kind=s(body.kind,20);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(kind==="DISPUTE"){
  const type=s(body.type,50);if(!type||!s(body.subject)||!s(body.description))return NextResponse.json({error:"type, subject and description are required."},{status:422});
  const ids={partnerId:s(body.partnerId,36)||null,competingPartnerId:s(body.competingPartnerId,36)||null,listingId:s(body.listingId,36)||null,leadId:s(body.leadId,36)||null,dealRegistrationId:s(body.dealRegistrationId,36)||null,commercialAgreementId:s(body.commercialAgreementId,36)||null,proposalId:s(body.proposalId,36)||null,orderId:s(body.orderId,36)||null,paymentEvidenceId:s(body.paymentEvidenceId,36)||null,commissionId:s(body.commissionId,36)||null,leakageSignalId:s(body.leakageSignalId,36)||null};
  const refs=await Promise.all([
   ids.partnerId?prisma.partner.findFirst({where:{id:ids.partnerId,workspaceId}}):Promise.resolve(null),
   ids.competingPartnerId?prisma.partner.findFirst({where:{id:ids.competingPartnerId,workspaceId}}):Promise.resolve(null),
   ids.listingId?prisma.commercialListing.findFirst({where:{id:ids.listingId,workspaceId}}):Promise.resolve(null),
   ids.leadId?prisma.lead.findFirst({where:{id:ids.leadId,workspaceId}}):Promise.resolve(null),
   ids.dealRegistrationId?prisma.commercialDealRegistration.findFirst({where:{id:ids.dealRegistrationId,workspaceId}}):Promise.resolve(null),
   ids.commercialAgreementId?prisma.commercialAgreement.findFirst({where:{id:ids.commercialAgreementId,workspaceId}}):Promise.resolve(null),
   ids.proposalId?prisma.professionalProposal.findFirst({where:{id:ids.proposalId,workspaceId}}):Promise.resolve(null),
   ids.orderId?prisma.order.findFirst({where:{id:ids.orderId,workspaceId}}):Promise.resolve(null),
   ids.paymentEvidenceId?prisma.externalPaymentEvidence.findFirst({where:{id:ids.paymentEvidenceId,workspaceId}}):Promise.resolve(null),
   ids.commissionId?prisma.commission.findFirst({where:{id:ids.commissionId,workspaceId}}):Promise.resolve(null),
   ids.leakageSignalId?prisma.commercialLeakageSignal.findFirst({where:{id:ids.leakageSignalId,workspaceId}}):Promise.resolve(null)
  ]);
  if(refs.some((x,i)=>Object.values(ids)[i]&&!x))return NextResponse.json({error:"One or more linked records are outside this workspace or do not exist."},{status:422});
  const d=await prisma.commercialDispute.create({data:{id:randomUUID(),workspaceId,type:type as any,status:"OPEN",subject:s(body.subject),description:s(body.description,20000),disputedAmount:body.disputedAmount?Number(body.disputedAmount):null,currency:s(body.currency,10)||"ETB",...ids,evidence:body.evidence??null,createdBy:a.user.id}});
  return NextResponse.json({ok:true,dispute:d},{status:201});
 }
 const type=s(body.type,80),summary=s(body.summary,500);if(!type||!summary)return NextResponse.json({error:"type and summary are required."},{status:422});
 const signal=await prisma.commercialLeakageSignal.create({data:{id:randomUUID(),workspaceId,type:type as any,status:"OPEN",severity:Math.min(5,Math.max(1,Number(body.severity)||1)),summary,details:body.details??null,listingId:s(body.listingId,36)||null,partnerId:s(body.partnerId,36)||null,leadId:s(body.leadId,36)||null,dealRegistrationId:s(body.dealRegistrationId,36)||null,appointmentId:s(body.appointmentId,36)||null,orderId:s(body.orderId,36)||null,evidenceRef:s(body.evidenceRef,1000)||null}});
 return NextResponse.json({ok:true,signal},{status:201});
}

export async function PATCH(req:Request){
 const body=await req.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),kind=s(body.kind,20),id=s(body.id,36),action=s(body.action,40);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(kind==="DISPUTE"){
  const d=await prisma.commercialDispute.findFirst({where:{id,workspaceId:a.workspace.id}});if(!d)return NextResponse.json({error:"Dispute not found."},{status:404});
  if(action==="STATUS"){const next=s(body.status,30);if(!["UNDER_REVIEW","EVIDENCE_REQUESTED","REJECTED","WITHDRAWN","RESOLVED"].includes(next))return NextResponse.json({error:"Invalid dispute status."},{status:422});const updated=await prisma.commercialDispute.update({where:{id},data:{status:next as any}});return NextResponse.json({ok:true,dispute:updated});}
  if(action==="RESOLVE"){if(!["OPEN","UNDER_REVIEW","EVIDENCE_REQUESTED"].includes(d.status))return NextResponse.json({error:"Dispute is not open for resolution."},{status:409});const resolution=s(body.resolution,50);if(!resolution)return NextResponse.json({error:"Resolution is required."},{status:422});
   const now=new Date();const result=await prisma.$transaction(async tx=>{
    const updated=await tx.commercialDispute.update({where:{id},data:{status:"RESOLVED",resolution:resolution as any,resolutionNotes:s(body.resolutionNotes,20000)||null,resolvedBy:a.user.id,resolvedAt:now}});
    if(d.leakageSignalId)await tx.commercialLeakageSignal.update({where:{id:d.leakageSignalId},data:{status:"RESOLVED",reviewedBy:a.user.id,reviewedAt:now,resolutionNote:s(body.resolutionNotes,20000)||null}});
    // Preserve earnings by default. Only explicit commission actions change the canonical commission.
    if(d.commissionId&&resolution==="VOID_COMMISSION")await tx.commission.update({where:{id:d.commissionId},data:{status:"VOID"}});
    return updated;
   });return NextResponse.json({ok:true,dispute:result});
  }
  if(action==="ADD_EVIDENCE"){const updated=await prisma.commercialDispute.update({where:{id},data:{evidence:body.evidence??null,status:"EVIDENCE_REQUESTED"}});return NextResponse.json({ok:true,dispute:updated});}
  return NextResponse.json({error:"Unsupported dispute action."},{status:400});
 }
 const signal=await prisma.commercialLeakageSignal.findFirst({where:{id,workspaceId:a.workspace.id}});if(!signal)return NextResponse.json({error:"Leakage signal not found."},{status:404});
 const next=s(body.status,30);if(!["ACKNOWLEDGED","INVESTIGATING","SUBSTANTIATED","DISMISSED","RESOLVED"].includes(next))return NextResponse.json({error:"Invalid signal status."},{status:422});
 const updated=await prisma.commercialLeakageSignal.update({where:{id},data:{status:next as any,reviewedBy:a.user.id,reviewedAt:new Date(),resolutionNote:s(body.resolutionNote,20000)||null}});
 return NextResponse.json({ok:true,signal:updated});
}