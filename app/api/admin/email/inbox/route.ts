import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")||"";
 const access=await authorizeWorkspacePermission("email.view",workspaceId);
 if(!access)return NextResponse.json({error:"Email access denied."},{status:403});
 const conversations=await prisma.conversation.findMany({where:{workspaceId:access.workspace.id,channel:"EMAIL"},orderBy:{updatedAt:"desc"},take:100,include:{person:{select:{name:true,email:true,phone:true}},lead:{select:{id:true,name:true,email:true,company:true,status:true}},messages:{orderBy:{createdAt:"desc"},take:10,select:{id:true,direction:true,status:true,body:true,createdAt:true,senderAddress:true,recipientAddress:true}}}});
 return NextResponse.json({conversations});
}
