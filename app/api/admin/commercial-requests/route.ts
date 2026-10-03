import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const n=(v:unknown)=>v==null||v===""?null:Number(v);
const access=async(id:string)=>authorizeWorkspacePermission("products.manage",id);
const requestInclude={lead:{select:{id:true,name:true,email:true,phone:true,status:true,score:true}},partner:{select:{id:true,name:true,partnerNumber:true,type:true}},opportunity:{select:{id:true,name:true,stage:true,expectedValue:true}},responses:{orderBy:{createdAt:"desc" as const},include:{responderParty:{select:{id:true,name:true,type:true}},partner:{select:{id:true,name:true,partnerNumber:true}},listing:{select:{id:true,title:true,status:true}},quote:{select:{id:true,quoteNumber:true,status:true,total:true}},order:{select:{id:true,orderNumber:true,status:true,total:true}}}}};

export async function GET(request:Request){
 const url=new URL(request.url), workspaceId=s(url.searchParams.get("workspaceId"),36);
 const a=await access(workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const requests=await prisma.commercialRequest.findMany({where:{workspaceId:a.workspace.id},orderBy:{createdAt:"desc"},take:200,include:requestInclude});
 return NextResponse.json({requests});
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({})), workspaceId=s(body.workspaceId,36), a=await access(workspaceId);
 if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const title=s(body.title,190), contactName=s(body.contactName,160), type=s(body.requestType,30);
 if(!title||!contactName||!["BUY_REQUEST","ASSET_REQUEST","SERVICE_REQUEST","RFP"].includes(type))return NextResponse.json({error:"requestType, title and contactName are required."},{status:400});
 const lead=await prisma.lead.create({data:{id:randomUUID(),workspaceId:a.workspace.id,name:contactName,email:s(body.contactEmail,190)||null,phone:s(body.contactPhone,40)||null,company:s(body.organizationName,190)||null,message:s(body.description,20000)||title,status:"NEW",score:20,source:"commercial-request",leadCategory:type,captureMode:"MANUAL"}});
 const r=await prisma.commercialRequest.create({data:{id:randomUUID(),workspaceId:a.workspace.id,requestType:type as any,status:"SUBMITTED",title,category:s(body.category,100)||null,requestedItem:s(body.requestedItem,250)||null,description:s(body.description,20000)||null,quantity:n(body.quantity),conditionPreference:s(body.conditionPreference,60)||null,budgetMin:n(body.budgetMin),budgetMax:n(body.budgetMax),currency:s(body.currency,10)||"ETB",location:s(body.location,190)||null,serviceArea:s(body.serviceArea,190)||null,deadline:body.deadline?new Date(body.deadline):null,organizationName:s(body.organizationName,190)||null,contactName,contactEmail:s(body.contactEmail,190)||null,contactPhone:s(body.contactPhone,40)||null,contactPreference:s(body.contactPreference,40)||null,privacyVisibility:"CONTROLLED",source:"staff",leadId:lead.id,createdBy:a.user.id}});
 return NextResponse.json({ok:true,request:r},{status:201});
}

export async function PATCH(request:Request){
 const body=await request.json().catch(()=>({})), workspaceId=s(body.workspaceId,36), id=s(body.id,36), action=s(body.action,40);
 const a=await access(workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.commercialRequest.findFirst({where:{id,workspaceId:a.workspace.id},include:{lead:true,responses:true}});
 if(!current)return NextResponse.json({error:"Commercial request not found."},{status:404});

 if(action==="QUALIFY"){
  const updated=await prisma.$transaction(async tx=>{
   await tx.lead.update({where:{id:current.leadId||""},data:{status:"QUALIFIED",score:Math.max(current.lead?.score||0,60),nextAction:"Review supplier responses"}});
   return tx.commercialRequest.update({where:{id},data:{status:"QUALIFYING",qualifiedAt:new Date(),qualificationNotes:s(body.notes,20000)||null}});
  }); return NextResponse.json({ok:true,request:updated});
 }
 if(action==="PUBLISH"||action==="OPEN_RESPONSES"){
  const updated=await prisma.commercialRequest.update({where:{id},data:{status:"RESPONSES_OPEN",publishedAt:current.publishedAt||new Date()}});
  return NextResponse.json({ok:true,request:updated});
 }
 if(action==="MATCHING"){
  const updated=await prisma.commercialRequest.update({where:{id},data:{status:"MATCHING"}});
  return NextResponse.json({ok:true,request:updated});
 }
 if(action==="NEGOTIATING"){
  const updated=await prisma.commercialRequest.update({where:{id},data:{status:"NEGOTIATING"}});
  return NextResponse.json({ok:true,request:updated});
 }
 if(action==="CANCEL"||action==="EXPIRE"||action==="CLOSE"){
  const status=action==="CANCEL"?"CANCELLED":action==="EXPIRE"?"EXPIRED":"CLOSED";
  const updated=await prisma.commercialRequest.update({where:{id},data:{status,closedAt:new Date()}});
  return NextResponse.json({ok:true,request:updated});
 }
 if(action==="CREATE_OPPORTUNITY"){
  if(!current.leadId)return NextResponse.json({error:"A lead is required."},{status:422});
  const existing=current.opportunityId?await prisma.opportunity.findFirst({where:{id:current.opportunityId,workspaceId:a.workspace.id}}):null;
  if(existing)return NextResponse.json({ok:true,opportunity:existing});
  const opp=await prisma.opportunity.create({data:{id:randomUUID(),workspaceId:a.workspace.id,leadId:current.leadId,name:current.title,expectedValue:current.budgetMax||current.budgetMin||undefined,currency:current.currency,probability:30,stage:"QUALIFIED",source:"commercial-request"}});
  const updated=await prisma.commercialRequest.update({where:{id},data:{opportunityId:opp.id,status:"NEGOTIATING"}});
  return NextResponse.json({ok:true,opportunity:opp,request:updated});
 }
 if(action==="CREATE_QUOTE"){
  if(!current.opportunityId)return NextResponse.json({error:"Create an opportunity first."},{status:422});
  const responseId=s(body.responseId,36);
  const response=current.responses.find(x=>x.id===responseId);
  if(!response||response.status!=="ACCEPTED"||response.quotedAmount==null)return NextResponse.json({error:"An accepted response with a quoted amount is required."},{status:422});
  const quote=await prisma.quote.create({data:{id:randomUUID(),workspaceId:a.workspace.id,quoteNumber:"CRQ-"+Date.now()+"-"+Math.floor(Math.random()*1000),opportunityId:current.opportunityId,status:"DRAFT",currency:response.currency,subtotal:response.quotedAmount,discount:0,total:response.quotedAmount,terms:response.terms||current.description,createdBy:a.user.email,items:{create:[{id:randomUUID(),description:current.requestedItem||current.title,quantity:current.quantity||1,unitPrice:response.quotedAmount,lineTotal:response.quotedAmount,sortOrder:0}]}},include:{items:true}});
  await prisma.commercialRequestResponse.update({where:{id:response.id},data:{quoteId:quote.id}});
  return NextResponse.json({ok:true,quote});
 }
 if(action==="ACCEPT_QUOTE"){
  const responseId=s(body.responseId,36), response=current.responses.find(x=>x.id===responseId);
  if(!response?.quoteId)return NextResponse.json({error:"Response has no quote."},{status:422});
  const quote=await prisma.quote.update({where:{id:response.quoteId},data:{status:"ACCEPTED",acceptedAt:new Date()}});
  return NextResponse.json({ok:true,quote});
 }
 if(action==="CREATE_ORDER"){
  const responseId=s(body.responseId,36), response=current.responses.find(x=>x.id===responseId);
  if(!response?.quoteId)return NextResponse.json({error:"Response has no quote."},{status:422});
  const quote=await prisma.quote.findFirst({where:{id:response.quoteId,workspaceId:a.workspace.id},include:{items:true,opportunity:{include:{lead:true}}}});
  if(!quote||quote.status!=="ACCEPTED")return NextResponse.json({error:"Quote must be accepted first."},{status:422});
  let customer=await prisma.customer.findFirst({where:{workspaceId:a.workspace.id,opportunityId:quote.opportunityId||undefined}});
  if(!customer&&quote.opportunity?.lead){const lead=quote.opportunity.lead;customer=await prisma.customer.create({data:{id:randomUUID(),workspaceId:a.workspace.id,opportunityId:quote.opportunityId,name:lead.name,email:lead.email,phone:lead.phone,status:"ACTIVE"}});}
  const order=await prisma.order.create({data:{id:randomUUID(),workspaceId:a.workspace.id,orderNumber:"ORD-CR-"+Date.now()+"-"+Math.floor(Math.random()*1000),quoteId:quote.id,customerId:customer?.id||null,opportunityId:quote.opportunityId,status:"CONFIRMED",currency:quote.currency,subtotal:quote.subtotal,discount:quote.discount,total:quote.total,paymentState:"INITIATED",source:"commercial-request",items:{create:quote.items.map(i=>({id:randomUUID(),description:i.description,quantity:i.quantity,unitPrice:i.unitPrice,discount:i.discount,lineTotal:i.lineTotal,sortOrder:i.sortOrder}))}}});
  await prisma.commercialRequestResponse.update({where:{id:response.id},data:{orderId:order.id}});
  await prisma.commercialRequest.update({where:{id},data:{status:"NEGOTIATING"}});
  return NextResponse.json({ok:true,order});
 }
 if(action==="FULFILL"){
  const updated=await prisma.commercialRequest.update({where:{id},data:{status:"FULFILLED",closedAt:new Date()}});
  return NextResponse.json({ok:true,request:updated});
 }
 return NextResponse.json({error:"Unsupported action."},{status:400});
}
