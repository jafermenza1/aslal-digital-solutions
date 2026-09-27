import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { siteConfig } from "@/lib/config";

export const CONTACT_AUTOREPLY_KEY = "contact_request_confirmation";

const defaultSubject = "We received your request — Aslal Digital Solutions";
const defaultHtml = `<!doctype html>
<html><body style="margin:0;background:#f4f8f6;font-family:Arial,Helvetica,sans-serif;color:#102a24">
<div style="max-width:680px;margin:0 auto;padding:28px 16px">
  <div style="background:#062e24;border-radius:24px;padding:28px 30px;color:#fff">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="{{logoUrl}}" width="48" height="48" alt="Aslal Digital Solutions" style="display:block;border-radius:12px;background:#fff;padding:4px">
      <div><div style="font-size:10px;letter-spacing:2px;font-weight:700;color:#e2b02a">ASLAL GROWTH OS</div><div style="font-size:20px;font-weight:800">Aslal Digital Solutions</div></div>
    </div>
    <div style="margin-top:28px;font-size:30px;line-height:1.15;font-weight:800">Thanks, {{name}}.</div>
    <p style="margin:14px 0 0;color:#d8ebe4;font-size:16px;line-height:1.7">We received your request and it is now in our sales workflow. Our team will review it and follow up using the contact details you provided.</p>
  </div>
  <div style="background:#fff;margin-top:14px;border-radius:24px;padding:28px 30px;box-shadow:0 10px 35px rgba(6,46,36,.08)">
    <div style="font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#0f6b52;font-weight:800">Your request</div>
    <div style="margin-top:16px;padding:18px;border-radius:18px;background:#f4f8f6">
      <div style="font-weight:800;font-size:18px">{{serviceOrProduct}}</div>
      <div style="margin-top:8px;color:#52645e;line-height:1.7">{{message}}</div>
      <div style="margin-top:12px;color:#52645e"><strong>Business:</strong> {{companyOrType}}</div>
      <div style="margin-top:6px;color:#52645e"><strong>Request ID:</strong> {{leadId}}</div>
    </div>
    <a href="{{contactUrl}}" style="display:inline-block;margin-top:22px;background:#e2b02a;color:#15231f;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:800">View Aslal contact page</a>
  </div>
  <p style="margin:18px 4px;color:#6b7b75;font-size:12px;line-height:1.6">This is a service-request acknowledgement, not a marketing subscription. You can manage communication preferences when applicable.</p>
  <div style="padding:20px 4px;color:#6b7b75;font-size:12px;line-height:1.6">
    <strong style="color:#102a24">Aslal Digital Solutions</strong><br>{{location}} · {{phone}} · {{email}}
  </div>
</div></body></html>`;
const defaultText = `Hello {{name}},

We received your request for {{serviceOrProduct}}.

{{message}}

Request ID: {{leadId}}

Our team will review it and follow up using the contact details you provided.

{{location}} · {{phone}} · {{email}}
`;

export const DEFAULT_CONTACT_TEMPLATE = {
  templateKey: CONTACT_AUTOREPLY_KEY,
  name: "Contact request confirmation",
  subjectTemplate: defaultSubject,
  htmlTemplate: defaultHtml,
  textTemplate: defaultText,
  transactional: true,
  active: true,
};


const brandedHtml = (title: string, intro: string, ctaLabel: string, ctaUrl: string, footer = "{{location}} · {{phone}} · {{email}}") => `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1e293b"><div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="background:#0F3E8A;border-radius:24px;padding:28px 30px;color:#fff"><div style="font-size:10px;letter-spacing:2px;font-weight:800;color:#E2B02A">ASLAL GROWTH OS</div><div style="margin-top:8px;font-size:25px;font-weight:800">Aslal Digital Solutions</div><div style="margin-top:24px;font-size:28px;line-height:1.2;font-weight:800">${title}</div><p style="margin:14px 0 0;color:#e2e8f0;font-size:16px;line-height:1.7">${intro}</p></div><div style="background:#fff;margin-top:14px;border-radius:24px;padding:28px 30px;box-shadow:0 10px 35px rgba(15,62,138,.08)"><div style="color:#475569;line-height:1.8">{{message}}</div><a href="${ctaUrl}" style="display:inline-block;margin-top:22px;background:#E2B02A;color:#1e293b;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:800">${ctaLabel}</a></div><div style="padding:20px 4px;color:#64748b;font-size:12px;line-height:1.6">${footer}</div></div></body></html>`;

export const CORE_EMAIL_TEMPLATES = [
  DEFAULT_CONTACT_TEMPLATE,
  { templateKey:"lead_owner_alert", name:"New lead owner alert", subjectTemplate:"New lead: {{name}} — {{companyOrType}}", htmlTemplate:brandedHtml("New lead assigned","A new demand record needs sales attention.","Open lead","{{contactUrl}}"), textTemplate:"New lead assigned\n\n{{name}} — {{companyOrType}}\n{{message}}\nLead ID: {{leadId}}", transactional:true, active:true },
  { templateKey:"sales_followup", name:"Sales follow-up", subjectTemplate:"Following up on your Aslal request", htmlTemplate:brandedHtml("Following up","We wanted to keep your growth request moving and make it easy to continue the conversation.","Continue conversation","{{contactUrl}}","{{location}} · {{phone}} · {{email}} · Manage preferences: {{unsubscribeUrl}}"), textTemplate:"Hello {{name}},\n\nWe are following up on your Aslal request.\n\n{{message}}\n\n{{contactUrl}}\n\nManage preferences: {{unsubscribeUrl}}", transactional:false, active:true },
  { templateKey:"quote_sent", name:"Quote sent", subjectTemplate:"Your Aslal quote is ready", htmlTemplate:brandedHtml("Your quote is ready","We prepared the requested commercial proposal. Please review the terms and let us know if you have questions.","Review quote","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nYour Aslal quote is ready for review.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"quote_accepted", name:"Quote accepted", subjectTemplate:"Quote accepted — next steps", htmlTemplate:brandedHtml("Quote accepted","Thank you. We recorded your acceptance and will move the commercial workflow to the next step.","View request","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nYour quote acceptance was recorded. We will proceed with the next step.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"order_confirmed", name:"Order confirmation", subjectTemplate:"Order confirmed — Aslal Digital Solutions", htmlTemplate:brandedHtml("Order confirmed","Your order has been confirmed. Keep this message for your records.","Contact Aslal","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nYour order has been confirmed.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"payment_received", name:"Payment received", subjectTemplate:"Payment received — Aslal Digital Solutions", htmlTemplate:brandedHtml("Payment received","We recorded the payment information associated with your transaction.","View details","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nWe recorded your payment.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"payment_reconciliation_exception", name:"Payment reconciliation exception", subjectTemplate:"Payment needs review — Aslal", htmlTemplate:brandedHtml("Payment needs review","A payment record needs reconciliation before the commercial journey can continue.","Contact Aslal","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nYour payment record requires review before reconciliation is complete.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"revenue_commission_ready", name:"Revenue and commission ready", subjectTemplate:"Revenue recognized — commission workflow updated", htmlTemplate:brandedHtml("Commercial record updated","The cleared-funds workflow has advanced and the associated commercial record is ready for the next finance step.","Open Aslal","{{contactUrl}}"), textTemplate:"Revenue recognized and commission workflow updated.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"partner_commission_approved", name:"Partner commission approved", subjectTemplate:"Partner commission approved", htmlTemplate:brandedHtml("Commission approved","Your partner commission has passed the approval step and is ready for the applicable payout process.","Open partner portal","{{contactUrl}}"), textTemplate:"Hello {{name}},\n\nYour partner commission was approved.\n\n{{message}}\n\n{{contactUrl}}", transactional:true, active:true },
  { templateKey:"resource_nurture", name:"Resource nurture", subjectTemplate:"A useful Aslal resource for {{companyOrType}}", htmlTemplate:brandedHtml("A useful resource","Here is a resource selected for your business-growth context.","Open resource","{{contactUrl}}","{{location}} · {{phone}} · {{email}} · Manage preferences: {{unsubscribeUrl}}"), textTemplate:"Hello {{name}},\n\nWe thought this resource may be useful:\n\n{{message}}\n\n{{contactUrl}}\n\nManage preferences: {{unsubscribeUrl}}", transactional:false, active:true },
  { templateKey:"marketing_campaign", name:"Marketing campaign", subjectTemplate:"{{companyOrType}} — Aslal growth update", htmlTemplate:brandedHtml("Growth update","Here is the latest Aslal update, offer, insight, or campaign message.","Learn more","{{contactUrl}}","{{location}} · {{phone}} · {{email}} · Unsubscribe/manage preferences: {{unsubscribeUrl}}"), textTemplate:"Hello {{name}},\n\n{{message}}\n\n{{contactUrl}}\n\nUnsubscribe/manage preferences: {{unsubscribeUrl}}", transactional:false, active:true },
  { templateKey:"reengagement", name:"Re-engagement", subjectTemplate:"Still working on your growth plan?", htmlTemplate:brandedHtml("Still interested?","If the timing is right, we can continue from the last recorded request instead of starting over.","Continue","{{contactUrl}}","{{location}} · {{phone}} · {{email}} · Manage preferences: {{unsubscribeUrl}}"), textTemplate:"Hello {{name}},\n\nIf you would like to continue your growth request, we can pick up from the existing record.\n\n{{message}}\n\n{{contactUrl}}\n\nManage preferences: {{unsubscribeUrl}}", transactional:false, active:true },
];

export async function ensureCoreEmailTemplates() {\n  for (const template of CORE_EMAIL_TEMPLATES) {\n    await prisma.emailTemplate.upsert({ where: { templateKey: template.templateKey }, update: {}, create: { id: randomUUID(), ...template, updatedBy: "system" } });\n  }\n  return prisma.emailTemplate.findMany({ where: { templateKey: { in: CORE_EMAIL_TEMPLATES.map(item => item.templateKey) } } });\n}\n\nexport async function ensureContactTemplate() {\n  await ensureCoreEmailTemplates();\n  return prisma.emailTemplate.findUniqueOrThrow({ where: { templateKey: CONTACT_AUTOREPLY_KEY } });\n}

function escapeHtml(value: string) {
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

export function renderTemplate(template: string, values: Record<string,string>, html=false) {
  const safe = Object.fromEntries(Object.entries(values).map(([key,value])=>[key,html?escapeHtml(value):value]));
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key:string) => safe[key] ?? "");
}

export function templateVariables() {
  return ["name","email","companyOrType","serviceOrProduct","message","leadId","contactUrl","logoUrl","location","phone","unsubscribeUrl"];
}
