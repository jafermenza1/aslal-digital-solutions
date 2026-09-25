import { prisma } from "@/lib/prisma";
import { sendThroughAdapter } from "@/lib/messaging";
import { randomUUID } from "node:crypto";

export async function runTelegramFollowUps(limit=100) {
  const now = new Date();
  const destinations = await prisma.telegramDestination.findMany({
    where:{active:true,optIn:true,followUpEnabled:true,nextFollowUpAt:{lte:now},followUpAttempts:{lt:20},leadId:{not:null}},
    orderBy:{nextFollowUpAt:"asc"},
    take:Math.max(1,Math.min(200,limit)),
  });
  let sent=0,handedOff=0,failed=0;
  for (const d of destinations) {
    const conversation = await prisma.conversation.findFirst({
      where:{workspaceId:d.workspaceId,channel:"TELEGRAM",externalThreadId:d.chatId,status:{not:"CLOSED"}},
      orderBy:{updatedAt:"desc"},
      select:{id:true,assignedTo:true,leadId:true},
    });
    if (!conversation) continue;
    const inbound = await prisma.message.findFirst({where:{conversationId:conversation.id,direction:"INBOUND",createdAt:{gt:d.createdAt}},orderBy:{createdAt:"desc"},select:{id:true}});
    if (inbound) {
      await prisma.$transaction([
        prisma.telegramDestination.update({where:{id:d.id},data:{followUpEnabled:false,nextFollowUpAt:null,handedOffAt:now}}),
        prisma.conversation.update({where:{id:conversation.id},data:{status:"HUMAN_HANDOFF",humanHandoffAt:now,assignedTo:conversation.assignedTo || undefined}}),
      ]);
      handedOff++;
      continue;
    }
    const body=(d.followUpMessage||"Just following up on the information we sent. Reply here and our sales team will continue with you.").slice(0,4000);
    const message=await prisma.message.create({data:{id:randomUUID(),conversationId:conversation.id,direction:"OUTBOUND",status:"QUEUED",recipientAddress:d.chatId,body,metadata:{actor:"automation:telegram-follow-up",attempt:d.followUpAttempts+1}}});
    try {
      const provider=await sendThroughAdapter({channel:"TELEGRAM",recipient:d.chatId,externalThreadId:d.chatId,body});
      const attempts=d.followUpAttempts+1;
      const done=attempts>=d.followUpMaxAttempts;
      await prisma.$transaction([
        prisma.message.update({where:{id:message.id},data:{status:"SENT",sentAt:now,metadata:{actor:"automation:telegram-follow-up",attempt:attempts,provider}}}),
        prisma.conversation.update({where:{id:conversation.id},data:{lastMessageAt:now}}),
        prisma.telegramDestination.update({where:{id:d.id},data:{followUpAttempts:attempts,followUpEnabled:!done,nextFollowUpAt:done?null:new Date(now.getTime()+d.followUpIntervalMinutes*60000)}}),
      ]);
      sent++;
    } catch(error) {
      await prisma.message.update({where:{id:message.id},data:{status:"FAILED",metadata:{actor:"automation:telegram-follow-up",error:error instanceof Error?error.message:"Telegram provider failed"}}});
      failed++;
    }
  }
  return {sent,handedOff,failed};
}
