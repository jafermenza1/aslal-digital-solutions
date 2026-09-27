import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { EmailOutboxStatus } from "@/lib/prisma";

export async function GET(request: Request) {
  const url=new URL(request.url);
  const workspaceId=url.searchParams.get("workspaceId");
  const access=await authorizeWorkspacePermission("email.view",workspaceId);
  if(!access)return NextResponse.json({error:"Email access is not permitted."},{status:403});
  const status=url.searchParams.get("status") as EmailOutboxStatus|""||"";
  const where={workspaceId:access.workspace.id,...(Object.values(EmailOutboxStatus).includes(status)?{status}: {})};
  const emails=await prisma.emailOutbox.findMany({where,orderBy:[{createdAt:"desc"}],take:200,select:{id:true,status:true,messageType:true,recipientAddress:true,subject:true,templateKey:true,failureReason:true,attemptCount:true,maxAttempts:true,nextAttemptAt:true,createdAt:true,updatedAt:true,leadId:true}});
  return NextResponse.json({emails});
}
