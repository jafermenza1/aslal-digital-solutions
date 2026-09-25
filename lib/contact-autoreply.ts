import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { siteConfig } from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { ensureContactTemplate, renderTemplate } from "@/lib/email-templates";

export async function sendContactAutoReply(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { person: { include: { communicationPreference: true } }, productInterests: { include: { product: true }, orderBy: { interestScore: "desc" }, take: 1 } },
  });
  if (!lead?.email) return { sent:false, skipped:"no-email" };
  if (!lead.person?.communicationPreference?.emailAllowed || lead.person.communicationPreference.globalOptOut) {
    return { sent:false, skipped:"email-not-permitted" };
  }

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
  };
  const subject = renderTemplate(template.subjectTemplate, values).replace(/[\r\n]+/g," ").trim().slice(0,250);
  const html = renderTemplate(template.htmlTemplate, values, true);
  const text = renderTemplate(template.textTemplate, values);
  const conversation = await prisma.conversation.findFirst({
    where: { channel:"EMAIL", leadId:lead.id, status:{not:"CLOSED"} },
    orderBy:{updatedAt:"desc"},
  }) || await prisma.conversation.create({
    data:{id:randomUUID(),workspaceId:lead.workspaceId || "00000000-0000-0000-0000-000000000001",channel:"EMAIL",status:"OPEN",personId:lead.personId,leadId:lead.id,externalThreadId:`contact:${lead.id}`},
  });

  const message = await prisma.message.create({
    data:{
      id:randomUUID(),conversationId:conversation.id,direction:"OUTBOUND",status:"QUEUED",
      recipientAddress:lead.email,body:text,metadata:{source:"contact-autoreply",templateKey:template.templateKey,html},
    },
  });
  try {
    const result=await sendEmail({recipient:lead.email,body:text,html,subject});
    const providerMessageId=typeof result.messageId==="string"?result.messageId:null;
    await prisma.$transaction([
      prisma.message.update({where:{id:message.id},data:{status:"SENT",sentAt:new Date(),externalMessageId:providerMessageId,metadata:{source:"contact-autoreply",templateKey:template.templateKey,html,providerMessageId}}}),
      prisma.conversation.update({where:{id:conversation.id},data:{lastMessageAt:new Date()}}),
      prisma.activity.create({data:{type:"MESSAGE_OUTBOUND",subject:"EMAIL contact request auto-reply",details:{messageId:message.id,leadId:lead.id,templateKey:template.templateKey},personId:lead.personId,opportunityId:null,customerId:null}}),
    ]);
    return {sent:true,messageId:message.id};
  } catch (error) {
    await prisma.$transaction([
      prisma.message.update({where:{id:message.id},data:{status:"FAILED",metadata:{source:"contact-autoreply",templateKey:template.templateKey,error:error instanceof Error?error.message:"Provider error"}}}),
      prisma.activity.create({data:{type:"MESSAGE_OUTBOUND_FAILED",subject:"EMAIL contact request auto-reply failed",details:{messageId:message.id,leadId:lead.id},personId:lead.personId,opportunityId:null,customerId:null}}),
    ]);
    return {sent:false,skipped:"provider-error"};
  }
}