import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyContactConfirmationToken } from "@/lib/contact-confirmation";

export async function GET(request:Request){
 const url=new URL(request.url),leadId=url.searchParams.get("lead")||"",token=url.searchParams.get("token")||"";
 if(!leadId||!token)return NextResponse.json({ok:false,error:"Confirmation link is incomplete."},{status:400});
 const lead=await prisma.lead.findUnique({where:{id:leadId},select:{id:true,email:true,name:true}});
 if(!lead?.email||!verifyContactConfirmationToken(token,lead.id,lead.email))return NextResponse.json({ok:false,error:"This confirmation link is invalid or expired."},{status:400});
 await prisma.lead.update({where:{id:lead.id},data:{nextAction:"Confirmed contact details; continue sales review.",nextActionDueAt:new Date()}});
 return NextResponse.json({ok:true,name:lead.name});
}
