import { cache } from "react";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { localeCookie, normalizeLocale, type Locale } from "@/lib/i18n";

export const PUBLIC_FONT_OPTIONS = [
  { value: "inherit", label: "Site default" },
  { value: "Inter, ui-sans-serif, system-ui, sans-serif", label: "Inter / System" },
  { value: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif", label: "Plus Jakarta Sans" },
  { value: "Noto Sans, ui-sans-serif, system-ui, sans-serif", label: "Noto Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
] as const;

export type PublicContentDefinition = { pagePath:string; key:string; label:string; defaultValue:string; fontFamily?:string; fontSize?:number };

export const PUBLIC_CONTENT: PublicContentDefinition[] = [
{pagePath:"/",key:"home.hero.slide1.title",label:"Hero slide 1",defaultValue:"We implement, customize and connect digital systems for your Business.",fontSize:40},
{pagePath:"/",key:"home.hero.slide2.title",label:"Hero slide 2",defaultValue:"We are helping businesses turn attention into Revenue.",fontSize:40},
{pagePath:"/",key:"home.hero.slide3.title",label:"Hero slide 3",defaultValue:"Aslal capture demand and streamline your Sales.",fontSize:40},
{pagePath:"/",key:"home.hero.subtitle",label:"Hero subtitle",defaultValue:"Aslal your Growth Partner",fontSize:18},
{pagePath:"/",key:"home.difference.eyebrow",label:"Difference eyebrow",defaultValue:"01 — THE DIFFERENCE",fontSize:10},
{pagePath:"/",key:"home.difference.title",label:"Difference heading",defaultValue:"Your website should do more than exist.",fontSize:48},
{pagePath:"/",key:"home.difference.body",label:"Difference paragraph",defaultValue:"A traditional website can attract attention and lose it. Your growth system should understand interest, recommend a path, start a conversation, create a lead and support sales follow-up.",fontSize:18},
{pagePath:"/",key:"home.solutions.eyebrow",label:"Solutions eyebrow",defaultValue:"02 — SOLUTIONS",fontSize:10},
{pagePath:"/",key:"home.solutions.title",label:"Solutions heading",defaultValue:"Six connected divisions. One growth partner.",fontSize:48},
{pagePath:"/",key:"home.solutions.body",label:"Solutions paragraph",defaultValue:"From digital presence to customer systems, we connect the pieces instead of selling isolated services.",fontSize:18},
{pagePath:"/",key:"home.products.eyebrow",label:"Products eyebrow",defaultValue:"03 — PRODUCTS",fontSize:10},
{pagePath:"/",key:"home.products.title",label:"Products heading",defaultValue:"Proven products. Local implementation. Custom fit.",fontSize:48},
{pagePath:"/",key:"home.products.body",label:"Products paragraph",defaultValue:"Explore the public catalog, open a dedicated product page for the full explanation, then request a quote or demo directly into our sales system.",fontSize:18},
{pagePath:"/",key:"home.growth.eyebrow",label:"Growth eyebrow",defaultValue:"04 — DIGITAL GROWTH",fontSize:10},
{pagePath:"/",key:"home.growth.title",label:"Growth heading",defaultValue:"Content, commerce, customer systems, automation, brand and search.",fontSize:48},
{pagePath:"/",key:"home.growth.body",label:"Growth paragraph",defaultValue:"Social content, video, graphics, copywriting, campaign creatives, e-commerce, payment integration, CRM, lead management, sales automation, Telegram, WhatsApp, SEO and brand systems can work as one connected engine.",fontSize:18},
{pagePath:"/",key:"home.local.eyebrow",label:"Local eyebrow",defaultValue:"05 — LOCAL BY DESIGN",fontSize:10},
{pagePath:"/",key:"home.local.title",label:"Local heading",defaultValue:"Built for Ethiopia. Ready to scale.",fontSize:48},
{pagePath:"/",key:"home.local.body",label:"Local paragraph",defaultValue:"We design around local payment realities, customer behavior, language, connectivity and operational constraints while keeping the technology modern and extensible.",fontSize:18},
{pagePath:"/",key:"home.builder.eyebrow",label:"Builder eyebrow",defaultValue:"06 — START WITH THE BOTTLENECK",fontSize:10},
{pagePath:"/",key:"home.builder.title",label:"Builder heading",defaultValue:"Not sure exactly what you need?",fontSize:56},
{pagePath:"/",key:"home.builder.body",label:"Builder paragraph",defaultValue:"Tell us what is holding your business back. The Growth System Builder turns the problem into a practical starting point.",fontSize:18},
{pagePath:"/",key:"home.builder.cta",label:"Builder CTA",defaultValue:"Build My Growth System",fontSize:14},
{pagePath:"/",key:"home.trust",label:"Trust statement",defaultValue:"Engineered Growth. Local Context. Measurable ROI.",fontSize:48},
{pagePath:"/about",key:"hero.eyebrow",label:"About eyebrow",defaultValue:"About Aslal",fontSize:10},
{pagePath:"/about",key:"hero.title",label:"About heading",defaultValue:"Digital systems that turn business problems into measurable growth.",fontSize:56},
{pagePath:"/about",key:"hero.body",label:"About intro",defaultValue:"Aslal Digital Solutions combines technology and marketing to help businesses build digital systems that attract attention, create conversations and support measurable growth.",fontSize:18},
{pagePath:"/about",key:"think.eyebrow",label:"How we think eyebrow",defaultValue:"Our story & mission",fontSize:10},
{pagePath:"/about",key:"think.title",label:"Mission heading",defaultValue:"Bridge the gap between digital attention and business operations.",fontSize:40},
{pagePath:"/about",key:"think.body",label:"Mission description",defaultValue:"We combine digital presence, software implementation, marketing, CRM, sales automation, conversational channels, search and measurement around the business problem that matters first.",fontSize:18},
{pagePath:"/about",key:"cta.title",label:"About CTA heading",defaultValue:"Build the growth system your business actually needs.",fontSize:44},
{pagePath:"/about",key:"cta.body",label:"About CTA body",defaultValue:"Start with the bottleneck. We will map the practical digital system around it.",fontSize:16},
{pagePath:"/services",key:"hero.eyebrow",label:"Services eyebrow",defaultValue:"Solutions",fontSize:10},
{pagePath:"/services",key:"hero.title",label:"Services heading",defaultValue:"One growth system. Multiple capabilities.",fontSize:56},
{pagePath:"/services",key:"hero.body",label:"Services intro",defaultValue:"From digital presence to software implementation, marketing, sales automation and search growth.",fontSize:18},
{pagePath:"/services",key:"list.eyebrow",label:"Services list eyebrow",defaultValue:"What we build",fontSize:10},
{pagePath:"/services",key:"list.title",label:"Services list heading",defaultValue:"Technology and marketing connected around outcomes.",fontSize:40},
{pagePath:"/services",key:"builder.title",label:"Services builder heading",defaultValue:"Not sure what you need?",fontSize:32},
{pagePath:"/services",key:"builder.body",label:"Services builder body",defaultValue:"Use our growth system builder and we'll turn your goals into a practical starting point.",fontSize:16},
{pagePath:"/resources",key:"hero.eyebrow",label:"Resources eyebrow",defaultValue:"Resources",fontSize:10},
{pagePath:"/resources",key:"hero.title",label:"Resources heading",defaultValue:"Ideas for building better digital systems.",fontSize:44},
{pagePath:"/resources",key:"hero.body",label:"Resources intro",defaultValue:"A growing knowledge hub for business owners and teams making technology, marketing and automation decisions.",fontSize:18},
{pagePath:"/resources",key:"cta.title",label:"Resources CTA heading",defaultValue:"Need a system, not another article?",fontSize:32},
{pagePath:"/resources",key:"cta.body",label:"Resources CTA body",defaultValue:"Start with your actual business goal and we'll map the digital pieces.",fontSize:16},
{pagePath:"/work",key:"hero.eyebrow",label:"Work eyebrow",defaultValue:"Work",fontSize:10},
{pagePath:"/work",key:"hero.title",label:"Work heading",defaultValue:"Proof should be measurable.",fontSize:44},
{pagePath:"/work",key:"hero.body",label:"Work intro",defaultValue:"This section is intentionally ready for real Aslal case studies. We will add verified client outcomes rather than inventing performance numbers.",fontSize:18},
{pagePath:"/contact",key:"hero.eyebrow",label:"Contact eyebrow",defaultValue:"Start a project",fontSize:10},
{pagePath:"/contact",key:"hero.title",label:"Contact heading",defaultValue:"Tell us what you want to grow.",fontSize:56},
{pagePath:"/contact",key:"hero.body",label:"Contact intro",defaultValue:"Your request enters the Aslal lead system so our team can qualify it and follow up.",fontSize:18},
{pagePath:"/contact",key:"intro.title",label:"Contact intro heading",defaultValue:"A practical first conversation.",fontSize:32},
{pagePath:"/contact",key:"intro.body",label:"Contact intro body",defaultValue:"Website, software, digital marketing, CRM, automation, SEO or a combination — we'll map the right starting point.",fontSize:16},
{pagePath:"/demo",key:"hero.eyebrow",label:"Demo eyebrow",defaultValue:"Automation Lab",fontSize:10},
{pagePath:"/demo",key:"hero.title",label:"Demo heading",defaultValue:"Experience the sales systems we build.",fontSize:56},
{pagePath:"/demo",key:"hero.body",label:"Demo intro",defaultValue:"These entry points are part of the Aslal demonstration strategy. Connect the official bot credentials when ready.",fontSize:18},
{pagePath:"/growth-builder",key:"hero.eyebrow",label:"Builder eyebrow",defaultValue:"Growth System Builder",fontSize:10},
{pagePath:"/growth-builder",key:"hero.title",label:"Builder heading",defaultValue:"Start with the business problem. Build the system around it.",fontSize:56},
{pagePath:"/growth-builder",key:"hero.body",label:"Builder intro",defaultValue:"Choose a growth priority and the channels you care about. We'll turn your starting point into a focused conversation with Aslal.",fontSize:18},
{pagePath:"/products",key:"hero.title",label:"Products heading",defaultValue:"Proven technology, local implementation, practical growth.",fontSize:56},
{pagePath:"/products",key:"hero.body",label:"Products intro",defaultValue:"Explore a solution, open its dedicated page to understand what it does, then request a quote or demo. Every request connects directly to our sales workflow.",fontSize:18},
{pagePath:"/privacy",key:"title",label:"Privacy title",defaultValue:"Privacy Policy",fontSize:48},
{pagePath:"/privacy",key:"body",label:"Privacy body",defaultValue:"Aslal Digital Solutions respects your privacy. Information submitted through our website is used to respond to enquiries, deliver requested services and improve our digital experiences. We do not sell personal information. Contact us if you need details about data held about you.",fontSize:18},
{pagePath:"/terms",key:"title",label:"Terms title",defaultValue:"Terms of Use",fontSize:48},
{pagePath:"/terms",key:"body",label:"Terms body",defaultValue:"Use of this website and our digital services is subject to applicable Ethiopian law and any service agreement issued for a specific engagement. Website content is provided for general information and may change as our services evolve.",fontSize:18},
];

export type ContentMap=Record<string,{value:string;richHtml?:string;fontFamily:string;fontSize:number}>;

type ContentRow=RowDataPacket&{page_path:string;content_key:string;label:string;value:string;rich_html:string|null;font_family:string;font_size:number;active:number};

export const getPageContent=cache(async(pagePath:string, requestedLocale?:Locale)=>{
 const locale=normalizeLocale(requestedLocale || (await cookies()).get(localeCookie)?.value);
 const [rows]=await db.query<ContentRow[]>(`SELECT p.page_path,p.content_key,p.label,COALESCE(t.translated_text,p.value) AS value,p.rich_html,p.font_family,p.font_size,p.active FROM public_content p LEFT JOIN translation_entries t ON t.workspace_id=? AND t.surface='SITE' AND t.locale=? AND t.translation_key=p.content_key AND t.active=1 WHERE p.page_path=? AND p.active=1`,["00000000-0000-0000-0000-000000000001",locale,pagePath]);
 const map:Record<string,{value:string;richHtml?:string;fontFamily:string;fontSize:number}>={};
 for(const row of rows) map[row.content_key]={value:row.value,richHtml:row.rich_html||"",fontFamily:row.font_family,fontSize:Number(row.font_size)};
 return map;
});
export function contentValue(map:Record<string,{value:string;fontFamily:string;fontSize:number}>,key:string,fallback:string){return map[key]?.value||fallback;}
export function contentStyle(map:Record<string,{value:string;fontFamily:string;fontSize:number}>,key:string,fallbackSize=16){const item=map[key];return item?{fontFamily:item.fontFamily==="inherit"?undefined:item.fontFamily,fontSize:item.fontSize+"px"}:{fontSize:fallbackSize+"px"};}
export async function ensurePublicContent(){for(const item of PUBLIC_CONTENT) await db.query("INSERT INTO public_content (id,page_path,content_key,label,value,font_family,font_size) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE label=VALUES(label)",[randomUUID(),item.pagePath,item.key,item.label,item.defaultValue,item.fontFamily||"inherit",item.fontSize||16]);}
export function contentHtml(map:Record<string,{value:string;richHtml?:string;fontFamily:string;fontSize:number}>,key:string,fallback:string){
 const item=map[key]; if(item?.richHtml?.trim()) return item.richHtml;
 return escapeHtml(item?.value||fallback).replace(/\r?\n/g,"<br />");
}
function escapeHtml(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
