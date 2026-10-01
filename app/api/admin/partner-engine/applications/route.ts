import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:Request){
  const {authorizeWorkspacePermission}=await import("@/lib/workspaces");
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const url=new URL(req.url),status=url.searchParams.get("status")||undefined;
  const applications=await prisma.partnerProgramApplication.findMany({
    where:{workspaceId:access.workspace.id,...(status?{status:status as never}:{})},
    include:{program:{select:{id:true,name:true,slug:true,status:true,admissionMode:true}},partner:{select:{id:true,partnerNumber:true,name:true,email:true,type:true,accountStatus:true,verificationLevel:true,tier:true}}},
    orderBy:{createdAt:"desc"},take:250,
  });
  return NextResponse.json({applications});
}
