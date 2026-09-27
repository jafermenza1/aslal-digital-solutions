import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { EmailOutboxStatus } from "@/lib/prisma";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const row=await prisma.emailOutbox.findUnique({where:{id}});
  if(!row)return NextResponse.json({error:"Email message not found."},{status:404});
  const access=await authorizeWorkspacePermission("email.view",row.workspaceId);
  if(!access)return NextResponse.json({error:"Email access is not permitted."},{status:403});
  return NextResponse.json({email:row,attempts:await prisma.emailDeliveryAttempt.findMany({where:{outboxId:id},orderBy:{attemptNumber:"desc"}}),events:await prisma.emailEvent.findMany({where:{outboxId:id},orderBy:{occurredAt:"desc"}})});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const row=await prisma.emailOutbox.findUnique({where:{id}});
  if(!row)return NextResponse.json({error:"Email message not found."},{status:404});
  const access=await authorizeWorkspacePermission("email.manage",row.workspaceId);
  if(!access)return NextResponse.json({error:"Email management is not permitted."},{status:403});
  if(row.status===EmailOutboxStatus.SENT||row.status===EmailOutboxStatus.DISCARDED)return NextResponse.json({error:"Sent or discarded messages are immutable."},{status:409});
  const body=await request.json().catch(()=>({}));
  const subject=String(body.subject??row.subject).replace(/[\r\n]+/g," ").trim().slice(0,250);
  const textBody=String(body.textBody??row.textBody).slice(0,20000);
  const htmlBody=String(body.htmlBody??row.htmlBody).slice(0,60000);
  if(!subject||!textBody||!htmlBody)return NextResponse.json({error:"Subject, plain text and HTML message are required."},{status:400});
  const email=await prisma.emailOutbox.update({where:{id},data:{subject,textBody,htmlBody,status:EmailOutboxStatus.DRAFT,nextAttemptAt:null}});
  return NextResponse.json({ok:true,email});
}
