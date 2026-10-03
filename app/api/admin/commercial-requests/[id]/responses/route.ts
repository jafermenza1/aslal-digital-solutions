import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";
const n=(v:unknown)=>v==null||v===""?null:Number(v);

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id:requestId}=await params, body=await request.json().catch(()=>({})), workspaceId=s(body.workspaceId,36);
 const a=await authorizeWorkspacePermission("products.manage",workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const r=await prisma.commercialRequest.findFirst({where:{id:requestId,workspaceId:a.workspace.id}});
 if(!r)return NextResponse.json({error:"Request not found."},{status:404});
 if(!["PUBLISHED","MATCHING","RESPONSES_OPEN","NEGOTIATING"].includes(r.status))return NextResponse.json({error:"Request is not accepting commercial responses."},{status:409});
 const partyId=s(body.responderPartyId,36)||null, partnerId=s(body.partnerId,36)||null, listingId=s(body.listingId,36)||null;
 if(!partyId&&!partnerId)return NextResponse.json({error:"A supplier/provider party or partner is required."},{status:400});
 if(partyId){const p=await prisma.commercialParty.findFirst({where:{id:partyId,workspaceId:a.workspace.id,status:"ACTIVE"}});if(!p)return NextResponse.json({error:"Responder party is invalid."},{status:422});}
 if(partnerId){const p=await prisma.partner.findFirst({where:{id:partnerId,workspaceId:a.workspace.id,status:"ACTIVE",accountStatus:"ACTIVE"}});if(!p)return NextResponse.json({error:"Partner is invalid."},{status:422});}
 if(listingId){const l=await prisma.commercialListing.findFirst({where:{id:listingId,workspaceId:a.workspace.id,status:"PUBLISHED",publicVisible:true}});if(!l)return NextResponse.json({error:"Listing is not available."},{status:422});}
 const response=await prisma.commercialRequestResponse.create({data:{id:randomUUID(),workspaceId:a.workspace.id,requestId,responderPartyId:partyId,partnerId,listingId,status:"RESPONDED",responderName:s(body.responderName,190)||"Commercial responder",message:s(body.message,20000)||null,quotedAmount:n(body.quotedAmount),currency:s(body.currency,10)||r.currency,availability:s(body.availability,190)||null,estimatedDelivery:s(body.estimatedDelivery,190)||null,terms:s(body.terms,20000)||null,evidence:{createdBy:a.user.id,createdAt:new Date().toISOString()},createdBy:a.user.id}});
 await prisma.commercialRequest.update({where:{id:requestId},data:{status:"RESPONSES_OPEN"}});
 return NextResponse.json({ok:true,response},{status:201});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id:responseId}=await params, body=await request.json().catch(()=>({})), workspaceId=s(body.workspaceId,36);
 const a=await authorizeWorkspacePermission("products.manage",workspaceId); if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.commercialRequestResponse.findFirst({where:{id:responseId,workspaceId:a.workspace.id},include:{request:true}});
 if(!current)return NextResponse.json({error:"Response not found."},{status:404});
 const status=s(body.status,30) as "INVITED"|"RESPONDED"|"SHORTLISTED"|"REJECTED"|"WITHDRAWN"|"ACCEPTED";
 if(status==="ACCEPTED"){
  const result=await prisma.$transaction(async tx=>{
   await tx.commercialRequestResponse.updateMany({where:{requestId:current.requestId,id:{not:responseId},status:{in:["ACCEPTED","SHORTLISTED"]}},data:{status:"REJECTED",rejectedAt:new Date()}});
   const response=await tx.commercialRequestResponse.update({where:{id:responseId},data:{status:"ACCEPTED",acceptedAt:new Date()}});
   await tx.commercialRequest.update({where:{id:current.requestId},data:{status:"NEGOTIATING"}});
   return response;
  });
  return NextResponse.json({ok:true,response:result});
 }
 if(!["INVITED","RESPONDED","SHORTLISTED","REJECTED","WITHDRAWN"].includes(status))return NextResponse.json({error:"Invalid response status."},{status:400});
 const response=await prisma.commercialRequestResponse.update({where:{id:responseId},data:{status,rejectedAt:status==="REJECTED"?new Date():undefined}});
 return NextResponse.json({ok:true,response});
}
