import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const n=(v:unknown)=>v==null||v===""?null:Number(v);
const arr=(v:unknown)=>Array.isArray(v)?v:[];

function versionData(body:any){
 return {
  scope:s(body.scope,20000)||null,
  methodology:s(body.methodology,20000)||null,
  deliverables:arr(body.deliverables),
  timeline:s(body.timeline,10000)||null,
  assumptions:s(body.assumptions,10000)||null,
  exclusions:s(body.exclusions,10000)||null,
  amount:n(body.amount),
  currency:s(body.currency,10)||"ETB",
  taxesAndFees:s(body.taxesAndFees,10000)||null,
  validityUntil:body.validityUntil?new Date(body.validityUntil):null,
  team:arr(body.team),
  qualifications:arr(body.qualifications),
  attachments:arr(body.attachments),
  terms:s(body.terms,20000)||null,
 };
}

async function access(workspaceId:string){
 return authorizeWorkspacePermission("products.manage",workspaceId);
}

export async function GET(request:Request){
 const u=new URL(request.url),workspaceId=s(u.searchParams.get("workspaceId"),36),requestId=s(u.searchParams.get("requestId"),36);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const proposals=await prisma.professionalProposal.findMany({
  where:{workspaceId:a.workspace.id,...(requestId?{requestId}:{})},
  orderBy:{createdAt:"desc"},
  include:{
   request:{select:{id:true,title:true,requestType:true,status:true,category:true,deadline:true,budgetMin:true,budgetMax:true,currency:true}},
   response:{select:{id:true,status:true,responderName:true,quotedAmount:true,currency:true,opportunityId:true,quoteId:true}},
   responderParty:{select:{id:true,name:true,type:true}},
   partner:{select:{id:true,name:true,partnerNumber:true}},
   versions:{orderBy:{versionNumber:"desc"}}
  }
 });
 const comparison=proposals.map(p=>{
  const v=p.versions[0];
  return {proposalId:p.id,title:p.title,status:p.status,provider:p.responderParty?.name||p.response.responderName,version:p.currentVersion,amount:v?.amount,currency:v?.currency,timeline:v?.timeline,validityUntil:v?.validityUntil,scope:v?.scope};
 });
 return NextResponse.json({proposals,comparison});
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({})),workspaceId=s(body.workspaceId,36);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const requestId=s(body.requestId,36),responseId=s(body.responseId,36);
 const r=await prisma.commercialRequest.findFirst({where:{id:requestId,workspaceId:a.workspace.id},include:{lead:true,opportunity:true}});
 if(!r)return NextResponse.json({error:"Commercial request not found."},{status:404});
 if(!["SERVICE_REQUEST","RFP"].includes(r.requestType))return NextResponse.json({error:"Professional proposals are only valid for service requests and RFPs."},{status:409});
 const response=await prisma.commercialRequestResponse.findFirst({where:{id:responseId,requestId,workspaceId:a.workspace.id},include:{responderParty:true,partner:true}});
 if(!response)return NextResponse.json({error:"Commercial response not found for this request."},{status:404});
 if(response.status==="REJECTED"||response.status==="WITHDRAWN")return NextResponse.json({error:"Rejected or withdrawn responses cannot become proposals."},{status:409});
 const existing=await prisma.professionalProposal.findFirst({where:{responseId,workspaceId:a.workspace.id}});
 if(existing)return NextResponse.json({error:"A proposal already exists for this response.",proposalId:existing.id},{status:409});
 const data=versionData(body);
 if(!data.scope&&!data.methodology&&!data.deliverables.length)return NextResponse.json({error:"A proposal needs scope, methodology, or deliverables."},{status:422});
 const proposal=await prisma.professionalProposal.create({data:{
  id:randomUUID(),workspaceId:a.workspace.id,requestId,responseId,responderPartyId:response.responderPartyId,partnerId:response.partnerId,
  status:"DRAFT",title:s(body.title,190)||response.responderName+" proposal",currentVersion:1,createdBy:a.user.id,
  versions:{create:{id:randomUUID(),versionNumber:1,...data,snapshot:{createdFromResponseId:responseId,createdAt:new Date().toISOString() },createdBy:a.user.id}}
 },include:{versions:true}});
 return NextResponse.json({ok:true,proposal},{status:201});
}

export async function PATCH(request:Request){
 const body=await request.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),id=s(body.id,36),action=s(body.action,40);
 const a=await access(workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.professionalProposal.findFirst({where:{id,workspaceId:a.workspace.id},include:{request:true,response:true,versions:{orderBy:{versionNumber:"desc"}}}});
 if(!current)return NextResponse.json({error:"Proposal not found."},{status:404});
 const now=new Date();
 if(action==="SUBMIT"){
  const v=current.versions[0];if(!v?.scope&&!v?.methodology&&!v?.deliverables)return NextResponse.json({error:"Proposal content is incomplete."},{status:422});
  const p=await prisma.professionalProposal.update({where:{id},data:{status:"SUBMITTED"}});await prisma.commercialRequest.update({where:{id:current.requestId},data:{status:"RESPONSES_OPEN"}});return NextResponse.json({ok:true,proposal:p});
 }
 if(action==="SHORTLIST"){const p=await prisma.professionalProposal.update({where:{id},data:{status:"SHORTLISTED",selectedAt:now}});return NextResponse.json({ok:true,proposal:p});}
 if(action==="REJECT"){const p=await prisma.professionalProposal.update({where:{id},data:{status:"REJECTED",rejectedAt:now}});return NextResponse.json({ok:true,proposal:p});}
 if(action==="WITHDRAW"){if(current.status==="ACCEPTED")return NextResponse.json({error:"Accepted proposals cannot be withdrawn."},{status:409});const p=await prisma.professionalProposal.update({where:{id},data:{status:"WITHDRAWN",withdrawnAt:now}});return NextResponse.json({ok:true,proposal:p});}
 if(action==="NEW_VERSION"){
  if(["ACCEPTED","WITHDRAWN","REJECTED"].includes(current.status))return NextResponse.json({error:"A final proposal cannot be silently amended."},{status:409});
  const data=versionData(body),next=current.currentVersion+1;
  const result=await prisma.$transaction(async tx=>{
   await tx.professionalProposalVersion.updateMany({where:{proposalId:id,versionNumber:current.currentVersion},data:{supersededAt:now}});
   const v=await tx.professionalProposalVersion.create({data:{id:randomUUID(),proposalId:id,versionNumber:next,...data,snapshot:{supersedesVersion:current.currentVersion,createdAt:now.toISOString()},createdBy:a.user.id}});
   const p=await tx.professionalProposal.update({where:{id},data:{currentVersion:next,status:"SUBMITTED"}});
   return {proposal:p,version:v};
  });
  return NextResponse.json({ok:true,...result});
 }
 if(action==="ACCEPT"){
  if(current.status==="REJECTED"||current.status==="WITHDRAWN")return NextResponse.json({error:"This proposal cannot be accepted."},{status:409});
  const accepted=await prisma.$transaction(async tx=>{
   await tx.professionalProposal.updateMany({where:{requestId:current.requestId,id:{not:id},status:{in:["ACCEPTED","SHORTLISTED","NEGOTIATING"]}},data:{status:"SUPERSEDED"}});
   await tx.professionalProposal.update({where:{id},data:{status:"ACCEPTED",acceptedAt:now,selectedAt:current.selectedAt||now}});
   await tx.commercialRequestResponse.update({where:{id:current.responseId},data:{status:"ACCEPTED",acceptedAt:now}});
   await tx.commercialRequest.update({where:{id:current.requestId},data:{status:"NEGOTIATING"}});
   return tx.professionalProposal.findUnique({where:{id}});
  });
  return NextResponse.json({ok:true,proposal:accepted});
 }
 if(action==="NEGOTIATE"){const p=await prisma.professionalProposal.update({where:{id},data:{status:"NEGOTIATING"}});return NextResponse.json({ok:true,proposal:p});}
 if(action==="CREATE_QUOTE"){
  if(current.status!=="ACCEPTED")return NextResponse.json({error:"Accept the proposal before creating the canonical quote."},{status:409});
  const v=current.versions.find(x=>x.versionNumber===current.currentVersion);if(!v?.amount)return NextResponse.json({error:"Accepted proposal needs an amount before quote creation."},{status:422});
  let opportunityId=current.request.opportunityId;
  if(!opportunityId&&current.request.leadId){
   const opp=await prisma.opportunity.create({data:{id:randomUUID(),workspaceId:a.workspace.id,leadId:current.request.leadId,name:current.request.title,expectedValue:v.amount,currency:v.currency,probability:60,stage:"PROPOSAL",source:"professional-proposal"}});
   opportunityId=opp.id;await prisma.commercialRequest.update({where:{id:current.requestId},data:{opportunityId}});
  }
  if(!opportunityId)return NextResponse.json({error:"A CRM opportunity is required before quote creation."},{status:422});
  if(current.response.quoteId){return NextResponse.json({error:"This response already has a quote.",quoteId:current.response.quoteId},{status:409});}
  const quote=await prisma.quote.create({data:{id:randomUUID(),workspaceId:a.workspace.id,quoteNumber:"PRP-"+Date.now()+"-"+Math.floor(Math.random()*1000),opportunityId,status:"DRAFT",currency:v.currency,subtotal:v.amount,discount:0,total:v.amount,terms:v.terms||v.scope||current.request.description,createdBy:a.user.email,items:{create:[{id:randomUUID(),description:current.request.requestedItem||current.request.title,quantity:current.request.quantity||1,unitPrice:v.amount,lineTotal:v.amount,sortOrder:0}]}},include:{items:true}});
  await prisma.commercialRequestResponse.update({where:{id:current.responseId},data:{quoteId:quote.id,opportunityId}});
  await prisma.negotiationEvent.create({data:{id:randomUUID(),quoteId:quote.id,type:"CREATED",actor:a.user.email,note:"Quote created from accepted professional proposal.",snapshot:{proposalId:id,proposalVersion:current.currentVersion}}});
  return NextResponse.json({ok:true,quote});
 }
 return NextResponse.json({error:"Unsupported proposal action."},{status:400});
}
