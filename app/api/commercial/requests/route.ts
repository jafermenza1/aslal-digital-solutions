import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluateCommercialMatches } from "@/lib/commercial-matching";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const n=(v:unknown)=>v==null||v===""?null:Number(v);
const allowed=["BUY_REQUEST","ASSET_REQUEST","SERVICE_REQUEST","RFP"] as const;

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=="object")return NextResponse.json({error:"Invalid request body."},{status:400});
  const workspaceId=s((body as Record<string,unknown>).workspaceId,36), type=s((body as Record<string,unknown>).requestType,30) as typeof allowed[number];
  const source=s((body as Record<string,unknown>).source,100)||"public";
  if(!workspaceId||!allowed.includes(type))return NextResponse.json({error:"workspaceId and a valid requestType are required."},{status:400});
  const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true}});
  if(!workspace)return NextResponse.json({error:"Workspace not found."},{status:404});
  const contactName=s((body as Record<string,unknown>).contactName,160),title=s((body as Record<string,unknown>).title,190);
  const contactEmail=s((body as Record<string,unknown>).contactEmail,190),contactPhone=s((body as Record<string,unknown>).contactPhone,40);
  if(!contactName||!title)return NextResponse.json({error:"title and contactName are required."},{status:400});
  if(source==="public-wanted"&&!contactEmail&&!contactPhone)return NextResponse.json({error:"Please provide a phone number or email so we can contact you about your request."},{status:400});
  const partnerId=s((body as Record<string,unknown>).partnerId,36)||null;
  const specifications=(body as Record<string,unknown>).specifications;
  const attachments=(body as Record<string,unknown>).attachments;
  if(partnerId){
   const partner=await prisma.partner.findFirst({where:{id:partnerId,workspaceId,status:"ACTIVE",accountStatus:"ACTIVE"}});
   if(!partner)return NextResponse.json({error:"Partner attribution is not valid for this workspace."},{status:422});
  }
  const result=await prisma.$transaction(async tx=>{
   const lead=await tx.lead.create({data:{id:randomUUID(),workspaceId:workspace.id,name:contactName,email:contactEmail||null,phone:contactPhone||null,company:s((body as Record<string,unknown>).organizationName,190)||null,message:[title,s((body as Record<string,unknown>).description,20000)].filter(Boolean).join("\n\n"),status:"NEW",score:10,source,medium:s((body as Record<string,unknown>).medium,100)||null,campaign:s((body as Record<string,unknown>).campaign,150)||null,referralCode:s((body as Record<string,unknown>).referralCode,100)||null,captureMode:"WEB",leadCategory:type}});
   if(partnerId)await tx.leadAttribution.create({data:{id:randomUUID(),workspaceId:workspace.id,leadId:lead.id,attributionType:"COMMERCIAL_REQUEST",source,medium:s((body as Record<string,unknown>).medium,100)||null,campaign:s((body as Record<string,unknown>).campaign,150)||null,partnerId}});
   const commercialRequest=await tx.commercialRequest.create({data:{id:randomUUID(),workspaceId:workspace.id,requestType:type,status:"SUBMITTED",title,category:s((body as Record<string,unknown>).category,100)||null,requestedItem:s((body as Record<string,unknown>).requestedItem,250)||null,description:s((body as Record<string,unknown>).description,20000)||null,quantity:n((body as Record<string,unknown>).quantity),conditionPreference:s((body as Record<string,unknown>).conditionPreference,60)||null,budgetMin:n((body as Record<string,unknown>).budgetMin),budgetMax:n((body as Record<string,unknown>).budgetMax),currency:s((body as Record<string,unknown>).currency,10)||"ETB",location:s((body as Record<string,unknown>).location,190)||null,serviceArea:s((body as Record<string,unknown>).serviceArea,190)||null,deadline:(body as Record<string,unknown>).deadline?new Date(String((body as Record<string,unknown>).deadline)):null,organizationName:s((body as Record<string,unknown>).organizationName,190)||null,contactName,contactEmail:contactEmail||null,contactPhone:contactPhone||null,contactPreference:s((body as Record<string,unknown>).contactPreference,40)||null,privacyVisibility:s((body as Record<string,unknown>).privacyVisibility,30)||"CONTROLLED",source,campaign:s((body as Record<string,unknown>).campaign,150)||null,partnerId,leadId:lead.id,specifications:specifications==null?undefined:specifications as Prisma.InputJsonValue,attachments:attachments==null?undefined:attachments as Prisma.InputJsonValue,createdBy:null}});
   return {lead,commercialRequest};
  });
  let matchCount=0,exchangeStatus=result.commercialRequest.status;
  if(source==="public-wanted"){
   await prisma.commercialRequest.update({where:{id:result.commercialRequest.id},data:{status:"PUBLISHED"}});
   exchangeStatus="PUBLISHED";
   try{const matching=await evaluateCommercialMatches({workspaceId:workspace.id,requestId:result.commercialRequest.id,limit:100});matchCount=matching.matches.length;exchangeStatus=matching.request.status}catch{}
  }
  return NextResponse.json({ok:true,requestId:result.commercialRequest.id,leadId:result.lead.id,status:exchangeStatus,matchCount},{status:201});
 }catch(error){
  console.error("[commercial-request] POST failed",error);
  return NextResponse.json({error:"We could not submit this application right now. Please try again. If the problem continues, contact Aslal support."},{status:500});
 }
}
