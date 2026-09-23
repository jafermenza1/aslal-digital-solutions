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

export async function ensureContactTemplate() {
  return prisma.emailTemplate.upsert({
    where: { templateKey: CONTACT_AUTOREPLY_KEY },
    update: {},
    create: { id: randomUUID(), ...DEFAULT_CONTACT_TEMPLATE, updatedBy: "system" },
  });
}

function escapeHtml(value: string) {
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

export function renderTemplate(template: string, values: Record<string,string>, html=false) {
  const safe = Object.fromEntries(Object.entries(values).map(([key,value])=>[key,html?escapeHtml(value):value]));
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key:string) => safe[key] ?? "");
}

export function templateVariables() {
  return ["name","email","companyOrType","serviceOrProduct","message","leadId","contactUrl","logoUrl","location","phone","email"];
}
