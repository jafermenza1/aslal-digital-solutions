import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { verifyContactConfirmationToken } from "@/lib/contact-confirmation";

export async function GET(request:Request){
 const url=new URL(request.url),leadId=url.searchParams.get("lead")||"",token=url.searchParams.get("token")||"";
 if(!leadId||!token)return NextResponse.json({ok:false,error:"Confirmation link is incomplete."},{status:400});
 const lead=await prisma.lead.findUnique({where:{id:leadId},select:{id:true,email:true,name:true}});
 if(!lead?.email||!verifyContactConfirmationToken(token,lead.id,lead.email))return NextResponse.json({ok:false,error:"This confirmation link is invalid or expired."},{status:400});
 await prisma.$transaction([
  prisma.lead.update({where:{id:lead.id},data:{nextAction:"Confirmed contact details; continue sales review.",nextActionDueAt:new Date()}}),
  prisma.leadStageHistory.create({data:{id:crypto.randomUUID(),leadId:lead.id,fromStage:null,toStage:"NEW",changedBy:"contact-confirmation",note:"Customer confirmed the contact email through the signed confirmation link."}}),
 ]);
 return NextResponse.json({ok:true,name:lead.name});
}
