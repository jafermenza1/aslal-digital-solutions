import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const num=(v:unknown)=>v===null||v===undefined||v===""?null:Number(v);
const date=(v:unknown)=>{const d=new Date(String(v));return Number.isNaN(d.getTime())?null:d;};
const access=async(workspaceId:string)=>authorizeWorkspacePermission("commerce.manage",workspaceId);
const ref=()=>`EPE-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${randomUUID().slice(0,8).toUpperCase()}`;

async function sameWorkspace(id:string|undefined|null, workspaceId:string, kind:"order"|"payment"|"revenue"|"agreement"|"deal"){
 if(!id)return null;
 if(kind==="order")return prisma.order.findFirst({where:{id,workspaceId}});
 if(kind==="payment")return prisma.payment.findFirst({where:{id,workspaceId}});
 if(kind==="revenue")return prisma.revenue.findFirst({where:{id,workspaceId}});
 if(kind==="agreement")return prisma.commercialAgreement.findFirst({where:{id,workspaceId}});
 return prisma.commercialDealRegistration.findFirst({where:{id,workspaceId}});
}

export async function GET(req:Request){
 const u=new URL(req.url),workspaceId=s(u.searchParams.get("workspaceId"),36),status=s(u.searchParams.get("status"),30);
 const a=await access(workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const evidence=await prisma.externalPaymentEvidence.findMany({
  where:{workspaceId:a.workspace.id,...(status?{status:status as any}:{})},
  orderBy:{createdAt:"desc"},take:300,
  include:{
   order:{select:{id:true,orderNumber:true,status:true,total:true,currency:true,paymentState:true}},
   payment:{select:{id:true,provider:true,amount:true,currency:true,status:true,reconciliationStatus:true,confirmedAt:true}},
   revenue:{select:{id:true,collectedAmount:true,recognizedAmount:true,status:true,currency:true}},
   commercialAgreement:{select:{id:true,referenceNumber:true,title:true,status:true}},
   dealRegistration:{select:{id:true,status:true,buyerName:true,protectedUntil:true}}
  }
 });
 return NextResponse.json({evidence});
}

export async function POST(req:Request){
 const body=await req.json().catch(()=>({})),workspaceId=s(body.workspaceId,36);
 const a=await access(workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const amount=num(body.amount),paymentDate=date(body.paymentDate),source=s(body.source,40),paymentMethod=s(body.paymentMethod,40);
 if(!amount||amount<=0||!paymentDate||!source||!paymentMethod)return NextResponse.json({error:"source, paymentMethod, positive amount and paymentDate are required."},{status:422});
 const orderId=s(body.orderId,36)||null,paymentId=s(body.paymentId,36)||null,revenueId=s(body.revenueId,36)||null,commercialAgreementId=s(body.commercialAgreementId,36)||null,dealRegistrationId=s(body.dealRegistrationId,36)||null;
 const [order,payment,revenue,agreement,deal]=await Promise.all([
  sameWorkspace(orderId,workspaceId,"order"),sameWorkspace(paymentId,workspaceId,"payment"),sameWorkspace(revenueId,workspaceId,"revenue"),sameWorkspace(commercialAgreementId,workspaceId,"agreement"),sameWorkspace(dealRegistrationId,workspaceId,"deal")
 ]);
 if(orderId&&!order)return NextResponse.json({error:"Order is outside this workspace or does not exist."},{status:422});
 if(paymentId&&!payment)return NextResponse.json({error:"Payment is outside this workspace or does not exist."},{status:422});
 if(revenueId&&!revenue)return NextResponse.json({error:"Revenue record is outside this workspace or does not exist."},{status:422});
 if(commercialAgreementId&&!agreement)return NextResponse.json({error:"Commercial agreement is outside this workspace or does not exist."},{status:422});
 if(dealRegistrationId&&!deal)return NextResponse.json({error:"Deal registration is outside this workspace or does not exist."},{status:422});
 if(payment && orderId && payment.orderId!==orderId)return NextResponse.json({error:"Payment does not belong to the selected order."},{status:422});
 if(revenue && orderId && revenue.orderId!==orderId)return NextResponse.json({error:"Revenue does not belong to the selected order."},{status:422});
 const evidence=await prisma.externalPaymentEvidence.create({
  data:{id:randomUUID(),workspaceId:a.workspace.id,evidenceNumber:ref(),status:"DRAFT",source:source as any,paymentMethod:paymentMethod as any,orderId,paymentId,revenueId,commercialAgreementId,dealRegistrationId,amount,currency:s(body.currency,10)||"ETB",paymentDate,payerName:s(body.payerName),payerReference:s(body.payerReference),payeeName:s(body.payeeName),payeeReference:s(body.payeeReference),externalReference:s(body.externalReference),evidenceAttachments:body.evidenceAttachments??null,notes:s(body.notes,20000),recordedBy:a.user.id},
  include:{order:{select:{id:true,orderNumber:true,total:true}},payment:{select:{id:true,status:true,reconciliationStatus:true}},revenue:{select:{id:true,status:true}}}
 });
 return NextResponse.json({ok:true,evidence},{status:201});
}

export async function PATCH(req:Request){
 const body=await req.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),id=s(body.id,36),action=s(body.action,40);
 const a=await access(workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const evidence=await prisma.externalPaymentEvidence.findFirst({where:{id,workspaceId:a.workspace.id}});
 if(!evidence)return NextResponse.json({error:"Payment evidence not found."},{status:404});
 if(action==="SUBMIT"){
  if(!["DRAFT","REJECTED"].includes(evidence.status))return NextResponse.json({error:"Only draft or rejected evidence can be resubmitted."},{status:409});
  const updated=await prisma.externalPaymentEvidence.update({where:{id},data:{status:"SUBMITTED",rejectedAt:null,rejectionReason:null}});
  return NextResponse.json({ok:true,evidence:updated});
 }
 if(action==="START_REVIEW"){
  if(evidence.status!=="SUBMITTED")return NextResponse.json({error:"Evidence must be submitted before review."},{status:409});
  const updated=await prisma.externalPaymentEvidence.update({where:{id},data:{status:"UNDER_REVIEW"}});
  return NextResponse.json({ok:true,evidence:updated});
 }
 if(action==="REJECT"){
  if(!["SUBMITTED","UNDER_REVIEW"].includes(evidence.status))return NextResponse.json({error:"Only submitted evidence can be rejected."},{status:409});
  const updated=await prisma.externalPaymentEvidence.update({where:{id},data:{status:"REJECTED",rejectedAt:new Date(),rejectionReason:s(body.reason,20000)||"Payment evidence was not verified."}});
  return NextResponse.json({ok:true,evidence:updated});
 }
 if(action==="VOID"){
  if(evidence.status==="VOIDED")return NextResponse.json({ok:true,evidence});
  if(evidence.status!=="VERIFIED")return NextResponse.json({error:"Only verified evidence can be voided."},{status:409});
  const updated=await prisma.externalPaymentEvidence.update({where:{id},data:{status:"VOIDED",voidedAt:new Date()}});
  return NextResponse.json({ok:true,evidence:updated});
 }
 if(action==="VERIFY"){
  if(!["SUBMITTED","UNDER_REVIEW"].includes(evidence.status))return NextResponse.json({error:"Evidence must be submitted or under review before verification."},{status:409});
  const now=new Date();
  const result=await prisma.$transaction(async tx=>{
   let paymentId=evidence.paymentId;
   if(paymentId){
    const payment=await tx.payment.findFirst({where:{id:paymentId,workspaceId:a.workspace.id}});
    if(!payment)throw new Error("Linked payment is unavailable in this workspace.");
    await tx.payment.update({where:{id:paymentId},data:{reconciliationStatus:"RECONCILED",reconciliationEvidenceRef:evidence.id,reconciliationNotes:"Reconciled from verified external payment evidence.",reconciledBy:a.user.id,reconciledAt:now,confirmedAt:payment.confirmedAt||now,status:payment.status==="FAILED"?"CONFIRMED":payment.status}});
   } else if(evidence.orderId){
    const order=await tx.order.findFirst({where:{id:evidence.orderId,workspaceId:a.workspace.id}});
    if(!order)throw new Error("Linked order is unavailable in this workspace.");
    paymentId=randomUUID();
    await tx.payment.create({data:{id:paymentId,workspaceId:a.workspace.id,orderId:order.id,customerId:order.customerId,provider:"EXTERNAL_EVIDENCE",providerTransactionRef:evidence.externalReference||evidence.evidenceNumber,idempotencyKey:`external-evidence:${evidence.id}`,amount:evidence.amount,currency:evidence.currency,method:evidence.paymentMethod,status:"CONFIRMED",reconciliationStatus:"RECONCILED",reconciliationEvidenceRef:evidence.id,reconciliationNotes:"External payment evidence verified by an authorized operator.",reconciledBy:a.user.id,reconciledAt:now,confirmedAt:now,metadata:{externalEvidenceId:evidence.id,source:evidence.source}}});
    if(Number(evidence.amount)>=Number(order.total))await tx.order.update({where:{id:order.id},data:{paymentState:"CONFIRMED"}});
   }
   return tx.externalPaymentEvidence.update({where:{id:evidence.id},data:{status:"VERIFIED",verifiedBy:a.user.id,verifiedAt:now,paymentId:paymentId||undefined}});
  });
  return NextResponse.json({ok:true,evidence:result,reconciledPaymentId:result.paymentId||null,revenueCreated:false});
 }
 return NextResponse.json({error:"Unsupported action."},{status:400});
}