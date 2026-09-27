import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { siteConfig } from "@/lib/config";
import { ensureContactTemplate, renderTemplate } from "@/lib/email-templates";
import { dispatchEmail, queueEmail } from "@/lib/email-queue";

export async function sendContactAutoReply(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { person: { include: { communicationPreference: true } }, productInterests: { include: { product: true }, orderBy: { interestScore: "desc" }, take: 1 } },
  });
  if (!lead?.email) return { sent:false, skipped:"no-email" };
  if (lead.person?.communicationPreference?.globalOptOut) return { sent:false, skipped:"global-opt-out" };
  if (!lead.workspaceId) return { sent:false, skipped:"no-workspace" };

  const template = await ensureContactTemplate();
  if (!template.active || !template.transactional) return { sent:false, skipped:"template-disabled" };

  const serviceOrProduct = lead.productInterests[0]?.product.name || lead.leadCategory || "your growth request";
  const values = {
    name: lead.name,
    email: lead.email,
    companyOrType: lead.company || lead.businessType || "Business request",
    serviceOrProduct,
    message: lead.message || "We received your request.",
    leadId: lead.id,
    contactUrl: `${siteConfig.url}/contact`,
    logoUrl: `${siteConfig.url}/brand-logo.svg`,
    location: siteConfig.location,
    phone: siteConfig.phone,
    unsubscribeUrl: `${siteConfig.url}/contact`,
  };
  const subject = renderTemplate(template.subjectTemplate, values).replace(/[\r\n]+/g," ").trim().slice(0,250);
  const html = renderTemplate(template.htmlTemplate, values, true);
  const text = renderTemplate(template.textTemplate, values);

  const conversation = await prisma.conversation.findFirst({
    where: { channel:"EMAIL", leadId:lead.id, status:{not:"CLOSED"} },
    orderBy:{updatedAt:"desc"},
  }) || await prisma.conversation.create({
    data:{id:randomUUID(),workspaceId:lead.workspaceId,channel:"EMAIL",status:"OPEN",personId:lead.personId,leadId:lead.id,externalThreadId:`contact:${lead.id}`},
  });

  const message = await prisma.message.create({
    data:{
      id:randomUUID(),conversationId:conversation.id,direction:"OUTBOUND",status:"QUEUED",
      recipientAddress:lead.email,body:text,metadata:{source:"contact-autoreply",templateKey:template.templateKey,html},
    },
  });

  const outbox = await queueEmail({
    workspaceId: lead.workspaceId,
    leadId: lead.id,
    personId: lead.personId,
    messageId: message.id,
    recipientAddress: lead.email,
    subject,
    htmlBody: html,
    textBody: text,
    templateKey: template.templateKey,
    createdBy: "system:contact-autoreply",
  });

  const result = await dispatchEmail(outbox.id);
  if (result.status === "SENT") {
    await prisma.$transaction([
      prisma.message.update({where:{id:message.id},data:{status:"SENT",sentAt:new Date(),externalMessageId:result.providerMessageId,metadata:{source:"contact-autoreply",templateKey:template.templateKey,html,emailOutboxId:outbox.id,providerMessageId:result.providerMessageId}}}),
      prisma.conversation.update({where:{id:conversation.id},data:{lastMessageAt:new Date()}}),
      prisma.activity.create({data:{type:"MESSAGE_OUTBOUND",subject:"EMAIL contact request auto-reply",details:{messageId:message.id,emailOutboxId:outbox.id,leadId:lead.id,templateKey:template.templateKey},personId:lead.personId,opportunityId:null,customerId:null}}),
    ]);
    return {sent:true,messageId:message.id,emailOutboxId:outbox.id};
  }

  await prisma.$transaction([
    prisma.message.update({where:{id:message.id},data:{status:"FAILED",metadata:{source:"contact-autoreply",templateKey:template.templateKey,emailOutboxId:outbox.id,failureReason:result.status==="FAILED"?"Provider error":"Email dispatch skipped"}}}),
    prisma.activity.create({data:{type:"MESSAGE_OUTBOUND_FAILED",subject:"EMAIL contact request auto-reply requires review",details:{messageId:message.id,emailOutboxId:outbox.id,leadId:lead.id,templateKey:template.templateKey,queueStatus:result.status},personId:lead.personId,opportunityId:null,customerId:null}}),
  ]);
  return {sent:false,skipped:"provider-error",emailOutboxId:outbox.id};
}
