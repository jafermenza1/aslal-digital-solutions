import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.json({error:"Message id is required."},{status:400});
 const row=await prisma.telegramOutbox.findUnique({where:{id}});if(!row)return NextResponse.json({error:"Telegram message not found."},{status:404});
 const access=await authorizeWorkspacePermission("telegram.view",row.workspaceId);if(!access)return NextResponse.json({error:"Telegram access is not permitted."},{status:403});
 return NextResponse.json({message:row,attempts:await prisma.telegramDeliveryAttempt.findMany({where:{outboxId:id},orderBy:{attemptNumber:"desc"}}),events:await prisma.telegramDeliveryEvent.findMany({where:{outboxId:id},orderBy:{occurredAt:"desc"}})});
}

export async function PATCH(request:Request){
 const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.json({error:"Message id is required."},{status:400});
 const row=await prisma.telegramOutbox.findUnique({where:{id}});if(!row)return NextResponse.json({error:"Telegram message not found."},{status:404});
 const access=await authorizeWorkspacePermission("telegram.manage",row.workspaceId);if(!access)return NextResponse.json({error:"Telegram management is not permitted."},{status:403});
 if(row.status==="SENT"||row.status==="DISCARDED")return NextResponse.json({error:"Sent or discarded messages are immutable."},{status:409});
 const body=await request.json().catch(()=>({}));const content=String(body.content??row.content).slice(0,4096);
 const message=await prisma.telegramOutbox.update({where:{id},data:{content,replyMarkup:body.replyMarkup??row.replyMarkup,status:"DRAFT",nextAttemptAt:null}});
 return NextResponse.json({ok:true,message});
}