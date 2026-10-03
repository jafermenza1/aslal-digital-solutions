import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { evaluateCommercialMatches } from "@/lib/commercial-matching";
import { randomUUID } from "node:crypto";
const s=(v:unknown,n=190)=>typeof v==="string"?v.trim().slice(0,n):"";

export async function GET(request:Request){
 const u=new URL(request.url),workspaceId=s(u.searchParams.get("workspaceId"),36),requestId=s(u.searchParams.get("requestId"),36);
 const a=await authorizeWorkspacePermission("products.manage",workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const matches=await prisma.commercialMatch.findMany({where:{workspaceId:a.workspace.id,...(requestId?{requestId}:{})},orderBy:[{score:"desc"},{createdAt:"desc"}],take:250,include:{listing:{select:{id:true,title:true,listingType:true,category:true,location:true,askingPrice:true,currency:true,supplierParty:{select:{id:true,name:true,type:true}},ownerParty:{select:{id:true,name:true,type:true}}}},request:{select:{id:true,title:true,requestType:true,status:true,budgetMin:true,budgetMax:true,currency:true}},partner:{select:{id:true,name:true,partnerNumber:true}},response:{select:{id:true,status:true,quotedAmount:true,currency:true}}}});
 return NextResponse.json({matches});
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),requestId=s(body.requestId,36);
 const a=await authorizeWorkspacePermission("products.manage",workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 try{const result=await evaluateCommercialMatches({workspaceId:a.workspace.id,requestId,actorId:a.user.id,limit:Number(body.limit)||100});return NextResponse.json({ok:true,...result},{status:201});}
 catch(e){const m=e instanceof Error?e.message:"MATCHING_FAILED";const code=m==="REQUEST_NOT_FOUND"?404:m==="REQUEST_NOT_OPEN_FOR_MATCHING"?409:400;return NextResponse.json({error:m},{status:code});}
}

export async function PATCH(request:Request){
 const body=await request.json().catch(()=>({})),workspaceId=s(body.workspaceId,36),id=s(body.id,36),action=s(body.action,40);
 const a=await authorizeWorkspacePermission("products.manage",workspaceId);if(!a)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.commercialMatch.findFirst({where:{id,workspaceId:a.workspace.id},include:{request:true,listing:true,response:true}});
 if(!current)return NextResponse.json({error:"Match not found."},{status:404});
 if(current.expiresAt&&current.expiresAt<=new Date()&&current.status==="SUGGESTED")return NextResponse.json({error:"Match has expired."},{status:409});
 if(action==="SHORTLIST"){const x=await prisma.commercialMatch.update({where:{id},data:{status:"SHORTLISTED",reviewedAt:new Date(),reviewedBy:a.user.id,reviewReason:s(body.reason,5000)||"Shortlisted for commercial follow-up."}});return NextResponse.json({ok:true,match:x});}
 if(action==="REJECT"){const x=await prisma.commercialMatch.update({where:{id},data:{status:"REJECTED",reviewedAt:new Date(),reviewedBy:a.user.id,reviewReason:s(body.reason,5000)||"Rejected during match review."}});return NextResponse.json({ok:true,match:x});}
 if(action==="CONTACT"){const x=await prisma.commercialMatch.update({where:{id},data:{status:"CONTACTED",reviewedAt:new Date(),reviewedBy:a.user.id}});return NextResponse.json({ok:true,match:x});}
 if(action==="CREATE_RESPONSE"){
  if(current.status==="REJECTED")return NextResponse.json({error:"Rejected match cannot create a response."},{status:409});
  const existing=current.responseId?await prisma.commercialRequestResponse.findFirst({where:{id:current.responseId,workspaceId:a.workspace.id}}):null;
  if(existing)return NextResponse.json({ok:true,response:existing});
  const response=await prisma.commercialRequestResponse.create({data:{id:randomUUID(),workspaceId:a.workspace.id,requestId:current.requestId,responderPartyId:current.supplierPartyId,partnerId:current.partnerId,listingId:current.listingId,status:"RESPONDED",responderName:current.listing.supplierPartyId?current.listing.supplierPartyId===current.supplierPartyId?"Matched supplier": "Matched provider":"Matched listing",message:s(body.message,20000)||"Response generated from a reviewed commercial match.",quotedAmount:current.listing.askingPrice,currency:current.listing.currency,availability:s(body.availability,190)||null,estimatedDelivery:s(body.estimatedDelivery,190)||null,terms:s(body.terms,20000)||null,evidence:{matchId:current.id,createdBy:a.user.id},createdBy:a.user.id}});
  const match=await prisma.commercialMatch.update({where:{id},data:{status:"RESPONDED",responseId:response.id,reviewedAt:new Date(),reviewedBy:a.user.id}});
  await prisma.commercialRequest.update({where:{id:current.requestId},data:{status:"RESPONSES_OPEN"}});
  return NextResponse.json({ok:true,match,response},{status:201});
 }
 if(action==="CONVERT"){const x=await prisma.commercialMatch.update({where:{id},data:{status:"CONVERTED",reviewedAt:new Date(),reviewedBy:a.user.id}});return NextResponse.json({ok:true,match:x});}
 return NextResponse.json({error:"Unsupported action."},{status:400});
}
