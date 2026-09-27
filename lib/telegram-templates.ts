import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { TelegramMessageType } from "@/lib/prisma";

export const CORE_TELEGRAM_TEMPLATES=[
 {templateKey:"lead_acknowledgement",name:"Lead acknowledgement",messageType:TelegramMessageType.TRANSACTIONAL,contentTemplate:"👋 Hi {{name}}! We received your request for {{companyOrType}}. A member of the Aslal team can continue with you here.\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"🛍 Open catalog",web_app:{url:"https://aslaldigital.com/telegram/catalog"}}],[{text:"👤 Talk to an agent",callback_data:"support:request"}]]}},
 {templateKey:"lead_owner_alert",name:"Sales owner alert",messageType:TelegramMessageType.SALES,contentTemplate:"🔔 New Telegram lead\n{{name}} — {{companyOrType}}\nLead: {{leadId}}\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"Open lead",url:"https://aslaldigital.com/dashboard/leads"}]]}},
 {templateKey:"sales_followup",name:"Sales follow-up",messageType:TelegramMessageType.MARKETING,contentTemplate:"Hi {{name}} 👋\n\nWe are following up on your Aslal request. If you are ready, choose an option below and we will continue from your existing request.\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"💬 Continue",callback_data:"sales:continue"},{text:"👤 Agent",callback_data:"support:request"}],[{text:"🛍 Catalog",web_app:{url:"https://aslaldigital.com/telegram/catalog"}}]]}},
 {templateKey:"quote_sent",name:"Quote sent",messageType:TelegramMessageType.TRANSACTIONAL,contentTemplate:"📄 Your Aslal quote is ready.\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"Review quote",callback_data:"quote:review"},{text:"Ask a question",callback_data:"support:request"}]]}},
 {templateKey:"quote_accepted",name:"Quote accepted",messageType:TelegramMessageType.TRANSACTIONAL,contentTemplate:"✅ Thank you, {{name}}. Your quote acceptance has been recorded.\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"Next step",callback_data:"order:next"}]]}},
 {templateKey:"order_confirmed",name:"Order confirmation",messageType:TelegramMessageType.TRANSACTIONAL,contentTemplate:"🧾 Order confirmed.\n\n{{message}}\n\nWe will keep the next step available here.",replyMarkup:{inline_keyboard:[[{text:"View order",callback_data:"order:view"},{text:"Contact sales",callback_data:"support:request"}]]}},
 {templateKey:"payment_received",name:"Payment received",messageType:TelegramMessageType.TRANSACTIONAL,contentTemplate:"💳 Payment information received.\n\n{{message}}\n\nWe will update you again when reconciliation is complete."},
 {templateKey:"payment_reconciliation_exception",name:"Payment reconciliation exception",messageType:TelegramMessageType.SUPPORT,contentTemplate:"⚠️ We need to review a payment record before the transaction can continue.\n\n{{message}}\n\nAn Aslal team member will help you here.",replyMarkup:{inline_keyboard:[[{text:"👤 Talk to agent",callback_data:"support:request"}]]}},
 {templateKey:"revenue_commission_ready",name:"Revenue recognized",messageType:TelegramMessageType.SYSTEM,contentTemplate:"✅ The commercial record has advanced to the next finance step.\n\n{{message}}"},
 {templateKey:"partner_campaign_invite",name:"Partner campaign invite",messageType:TelegramMessageType.PARTNER,contentTemplate:"🎯 New Aslal campaign opportunity\n\n{{message}}\n\nOpen the partner workbench to review campaign details and materials.",replyMarkup:{inline_keyboard:[[{text:"Campaigns",callback_data:"partner:campaigns"},{text:"Catalog",web_app:{url:"https://aslaldigital.com/telegram/catalog"}}]]}},
 {templateKey:"partner_commission_approved",name:"Partner commission approved",messageType:TelegramMessageType.PARTNER,contentTemplate:"💰 Commission approved\n\n{{message}}\n\nYour payout workflow can now continue.",replyMarkup:{inline_keyboard:[[{text:"View earnings",callback_data:"partner:earnings"}]]}},
 {templateKey:"product_back_in_stock",name:"Product back in stock",messageType:TelegramMessageType.MARKETING,contentTemplate:"📦 Good news, {{name}}! {{message}} is available again.",replyMarkup:{inline_keyboard:[[{text:"🛍 Open catalog",web_app:{url:"https://aslaldigital.com/telegram/catalog"}}]]}},
 {templateKey:"human_handoff",name:"Human handoff",messageType:TelegramMessageType.SUPPORT,contentTemplate:"👤 A member of the Aslal team has taken over this conversation. Please continue here and we will help you with the existing request."},
 {templateKey:"resource_nurture",name:"Resource nurture",messageType:TelegramMessageType.MARKETING,contentTemplate:"📚 {{name}}, here is a resource that may help with your growth request:\n\n{{message}}",replyMarkup:{inline_keyboard:[[{text:"Open resource",callback_data:"resource:open"}]]}},
 {templateKey:"reengagement",name:"Re-engagement",messageType:TelegramMessageType.MARKETING,contentTemplate:"Hi {{name}} 👋\n\nWould you like to continue the request you started with Aslal? We kept your context so you do not need to start over.",replyMarkup:{inline_keyboard:[[{text:"Continue",callback_data:"sales:continue"},{text:"Talk to agent",callback_data:"support:request"}]]}},
];

export async function ensureCoreTelegramTemplates(workspaceId:string){
 for(const template of CORE_TELEGRAM_TEMPLATES){
  await prisma.telegramTemplate.upsert({
   where:{workspaceId_templateKey:{workspaceId,templateKey:template.templateKey}},
   update:{name:template.name,messageType:template.messageType,contentTemplate:template.contentTemplate,replyMarkup:template.replyMarkup,active:true},
   create:{id:randomUUID(),workspaceId,templateKey:template.templateKey,name:template.name,messageType:template.messageType,contentTemplate:template.contentTemplate,replyMarkup:template.replyMarkup,active:true,updatedBy:"system"}
  });
 }
 return prisma.telegramTemplate.findMany({where:{workspaceId}});
}
