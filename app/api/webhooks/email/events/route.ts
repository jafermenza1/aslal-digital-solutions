import { NextResponse } from "next/server";
import { prisma, EmailEventType } from "@/lib/prisma";
import { recordEmailEvent } from "@/lib/email-queue";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const allowed=new Set(Object.values(EmailEventType));

export async function POST(request:Request) {
 const secret=String(process.env.EMAIL_EVENTS_WEBHOOK_SECRET||"");
 if(!secret)return NextResponse.json({error:"EMAIL_EVENTS_WEBHOOK_SECRET is not configured"},{status:503});
 const provided=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";
 if(provided!==secret)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));
 const providerMessageId=typeof body.providerMessageId==="string"?body.providerMessageId.trim():"";
 const eventType=typeof body.eventType==="string"?body.eventType.toUpperCase() as EmailEventType:null;
 if(!providerMessageId||!eventType||!allowed.has(eventType))return NextResponse.json({error:"providerMessageId and a supported eventType are required."},{status:400});
 const outbox=await prisma.emailOutbox.findFirst({where:{providerMessageId}});
 if(!outbox)return NextResponse.json({ok:true,ignored:true});
 await recordEmailEvent(outbox.id,eventType,body.metadata,typeof body.providerEventId==="string"?body.providerEventId:null);
 if(eventType===EmailEventType.BOUNCED||eventType===EmailEventType.UNSUBSCRIBED){
   await prisma.emailOutbox.update({where:{id:outbox.id},data:{failureReason:eventType===EmailEventType.BOUNCED?"Provider reported a bounce.":"Recipient unsubscribed."}});
 }
 return NextResponse.json({ok:true,outboxId:outbox.id});
}
