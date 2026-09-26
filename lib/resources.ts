export type ResourceKind = "guide" | "tool" | "template";

export type Resource = {
  slug:string;
  kind:ResourceKind;
  title:string;
  description:string;
  preview:string;
  cta:string;
  intent:string;
  download?:string;
};

export const RESOURCES: Resource[] = [
  {slug:"ethiopian-ecommerce-payment-integration-manual",kind:"guide",title:"The Ethiopian E-Commerce & Payment Integration Manual",description:"A practical guide to planning local payment integration for Telebirr, Chapa and CBE Birr across custom websites, Shopify and web applications.",preview:"Start with gateway selection, callback security, order states, reconciliation and customer confirmation before writing payment code.",cta:"Request custom payment integration quote",intent:"payment integration"},
  {slug:"whatsapp-telegram-conversational-sales-blueprint",kind:"guide",title:"WhatsApp & Telegram Conversational Sales Blueprint",description:"A field guide for automated lead qualification, catalog conversations, routing rules and human-agent handoffs.",preview:"Map the conversation from first question to qualified lead, then define exactly when automation should hand the conversation to a salesperson.",cta:"Plan my sales automation",intent:"WhatsApp and Telegram sales automation"},
  {slug:"b2b-digital-funnel-architecture-guide",kind:"guide",title:"The B2B Digital Funnel Architecture Guide",description:"A strategic architecture for connecting traffic, landing pages, CRM pipelines and automated follow-up.",preview:"A useful B2B funnel is not a collection of pages. It is a measurable path from source attribution to sales ownership and next action.",cta:"Book a funnel audit",intent:"B2B funnel"},
  {slug:"digital-growth-bottleneck-assessor",kind:"tool",title:"Digital Growth Bottleneck Assessor",description:"A two-minute diagnostic that identifies whether the main constraint is traffic, lead conversion, payment friction or sales pipeline management.",preview:"Answer four focused questions and receive a practical starting diagnosis without submitting a long form.",cta:"Run the assessor",intent:"growth bottleneck"},
  {slug:"ecommerce-conversion-payment-roi-calculator",kind:"tool",title:"E-Commerce Conversion & Payment ROI Calculator",description:"Estimate potential revenue lift from improved conversion and localized payment or conversational sales journeys.",preview:"Use your current traffic, conversion rate and average transaction value to model scenarios. This is an estimate, not a revenue guarantee.",cta:"Calculate my opportunity",intent:"e-commerce ROI"},
  {slug:"omnichannel-lead-qualification-framework",kind:"template",title:"Omnichannel Lead Qualification Framework",description:"Ready-to-adapt conversation scripts and scoring rules for WhatsApp, Telegram and web forms.",preview:"Score intent consistently across messaging and forms, then route qualified demand to a salesperson with context.",cta:"Get the qualification framework",intent:"lead qualification",download:"/resources/downloads/omnichannel-lead-qualification-framework.md"},
  {slug:"growth-crm-pipeline-schema",kind:"template",title:"Growth CRM Pipeline Schema",description:"A downloadable workflow template that maps common local sales stages to HubSpot, Odoo or custom CRM implementations.",preview:"Use the schema as a starting point for stages, required fields, ownership, next actions and handoff rules.",cta:"Download CRM pipeline template",intent:"CRM pipeline",download:"/resources/downloads/growth-crm-pipeline-schema.csv"},
];

export function getResource(slug:string){return RESOURCES.find(resource=>resource.slug===slug);}
