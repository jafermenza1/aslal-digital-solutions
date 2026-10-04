import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { evaluateCommercialMatches } from "@/lib/commercial-matching";

const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const n=(v:unknown)=>v==null||v===""?null:Number(v);
const allowed=["BUY_REQUEST","ASSET_REQUEST","SERVICE_REQUEST","RFP"] as const;

export async function POST(request:Request){
  const body=await request.json().catch(()=>({}));
  const workspaceId=s(body.workspaceId,36), type=s(body.requestType,30) as typeof allowed[number];
  const source=s(body.source,100)||"public";
  if(!workspaceId||!allowed.includes(type)) return NextResponse.json({error:"workspaceId and a valid requestType are required."},{status:400});
  const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true}});
  if(!workspace) return NextResponse.json({error:"Workspace not found."},{status:404});
  const contactName=s(body.contactName,160);
  const title=s(body.title,190);
  if(!contactName||!title) return NextResponse.json({error:"title and contactName are required."},{status:400});
  const partnerId=s(body.partnerId,36)||null;
  if(partnerId){
    const partner=await prisma.partner.findFirst({where:{id:partnerId,workspaceId,status:"ACTIVE",accountStatus:"ACTIVE"}});
    if(!partner) return NextResponse.json({error:"Partner attribution is not valid for this workspace."},{status:422});
  }
  const result=await prisma.$transaction(async tx=>{
    const lead=await tx.lead.create({data:{
      id:randomUUID(),workspaceId:workspace.id,name:contactName,email:s(body.contactEmail,190)||null,phone:s(body.contactPhone,40)||null,
      company:s(body.organizationName,190)||null,message:[title,s(body.description,20000)].filter(Boolean).join("\n\n"),
      status:"NEW",score:10,source,medium:s(body.medium,100)||null,campaign:s(body.campaign,150)||null,
      referralCode:s(body.referralCode,100)||null,captureMode:"WEB",leadCategory:type
    }});
    if(partnerId){
      await tx.leadAttribution.create({data:{id:randomUUID(),workspaceId:workspace.id,leadId:lead.id,attributionType:"COMMERCIAL_REQUEST",source,medium:s(body.medium,100)||null,campaign:s(body.campaign,150)||null,partnerId}});
    }
    const commercialRequest=await tx.commercialRequest.create({data:{
      id:randomUUID(),workspaceId:workspace.id,requestType:type,status:"SUBMITTED",title,category:s(body.category,100)||null,
      requestedItem:s(body.requestedItem,250)||null,description:s(body.description,20000)||null,quantity:n(body.quantity),
      conditionPreference:s(body.conditionPreference,60)||null,budgetMin:n(body.budgetMin),budgetMax:n(body.budgetMax),currency:s(body.currency,10)||"ETB",
      location:s(body.location,190)||null,serviceArea:s(body.serviceArea,190)||null,deadline:body.deadline?new Date(body.deadline):null,
      organizationName:s(body.organizationName,190)||null,contactName,contactEmail:s(body.contactEmail,190)||null,contactPhone:s(body.contactPhone,40)||null,
      contactPreference:s(body.contactPreference,40)||null,privacyVisibility:s(body.privacyVisibility,30)||"CONTROLLED",
      source,campaign:s(body.campaign,150)||null,partnerId,leadId:lead.id,
      specifications:body.specifications||null,attachments:body.attachments||null,createdBy:null
    }});
    return {lead,commercialRequest};
  });
  let matchCount=0;
  let exchangeStatus=result.commercialRequest.status;
  if(source==="public-wanted"){
    await prisma.commercialRequest.update({where:{id:result.commercialRequest.id},data:{status:"PUBLISHED"}});
    exchangeStatus="PUBLISHED";
    try{
      const matching=await evaluateCommercialMatches({workspaceId:workspace.id,requestId:result.commercialRequest.id,limit:100});
      matchCount=matching.matches.length;
      exchangeStatus=matching.request.status;
    }catch{
      // The demand is still published; matching can be retried by the commercial workbench.
    }
  }
  return NextResponse.json({ok:true,requestId:result.commercialRequest.id,leadId:result.lead.id,status:exchangeStatus,matchCount},{status:201});
}
