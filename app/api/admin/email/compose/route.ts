import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { queueEmail, dispatchEmail } from "@/lib/email-queue";

function clean(v:unknown,max:number){return typeof v==="string"?v.trim().slice(0,max):"";}

export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")||"";
 const access=await authorizeWorkspacePermission("email.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Email management is not permitted."},{status:403});
 const templates=await prisma.emailTemplate.findMany({where:{active:true},orderBy:[{transactional:"desc"},{name:"asc"}],select:{id:true,templateKey:true,name:true,subjectTemplate:true,htmlTemplate:true,textTemplate:true,transactional:true}});
 return NextResponse.json({templates});
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const access=await authorizeWorkspacePermission("email.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Email management is not permitted."},{status:403});
 const recipient=clean(body.recipient,320).toLowerCase();
 const subject=clean(body.subject,250).replace(/[\r\n]+/g," ");
 const textBody=clean(body.textBody,30000);
 const htmlBody=typeof body.htmlBody==="string"?body.htmlBody.slice(0,60000):"";
 const leadId=clean(body.leadId,36)||null;
 if(!recipient||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))return NextResponse.json({error:"Enter a valid recipient email address."},{status:400});
 if(!subject||!textBody)return NextResponse.json({error:"Subject and plain-text message are required."},{status:400});
 let personId:string|null=null;
 if(leadId){
  const lead=await prisma.lead.findFirst({where:{id:leadId,workspaceId:access.workspace.id},select:{personId:true}});
  if(!lead)return NextResponse.json({error:"Lead is outside this workspace."},{status:403});
  personId=lead.personId;
 }
 const conversation=leadId?await prisma.conversation.findFirst({where:{workspaceId:access.workspace.id,channel:"EMAIL",leadId,status:{not:"CLOSED"}},orderBy:{updatedAt:"desc"}}):null;
 const thread=conversation||await prisma.conversation.create({data:{id:randomUUID(),workspaceId:access.workspace.id,channel:"EMAIL",status:"OPEN",personId,leadId,externalThreadId:"manual:"+randomUUID()}});
 const message=await prisma.message.create({data:{id:randomUUID(),conversationId:thread.id,direction:"OUTBOUND",status:"QUEUED",recipientAddress:recipient,body:textBody,metadata:{source:"admin-compose",templateKey:clean(body.templateKey,120)||null,html:htmlBody}}});
 const outbox=await queueEmail({workspaceId:access.workspace.id,leadId,personId,messageId:message.id,recipientAddress:recipient,subject,htmlBody,textBody,templateKey:clean(body.templateKey,120)||null,createdBy:access.user.email});
 const result=await dispatchEmail(outbox.id);
 if(result.status==="SENT"){
  await prisma.$transaction([prisma.message.update({where:{id:message.id},data:{status:"SENT",sentAt:new Date(),externalMessageId:result.providerMessageId}}),prisma.conversation.update({where:{id:thread.id},data:{lastMessageAt:new Date()}})]);
  return NextResponse.json({ok:true,status:"SENT",emailOutboxId:outbox.id,messageId:message.id});
 }
 return NextResponse.json({ok:true,status:result.status,emailOutboxId:outbox.id,messageId:message.id});
}
