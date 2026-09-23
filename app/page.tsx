import Link from "next/link";
import { AslalInteractiveHero } from "@/components/AslalInteractiveHero";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";

const divisions = [
  { n:"01", title:"Digital Presence", text:"Websites, e-commerce, landing pages, web applications, customer portals and booking experiences.", href:"/services" },
  { n:"02", title:"Software Marketplace", text:"Proven software products that can be configured, integrated, customized and implemented for your business.", href:"/products" },
  { n:"03", title:"Digital Growth", text:"Content, campaigns, commerce, CRM, automation, SEO and brand systems connected to measurable outcomes.", href:"/services" },
  { n:"04", title:"Commerce & Payments", text:"E-commerce journeys, checkout, order management and localized payment integrations for the Ethiopian market.", href:"/services" },
  { n:"05", title:"Customer Systems", text:"Lead capture, qualification, sales pipelines, follow-up and reporting built around your sales process.", href:"/services" },
  { n:"06", title:"Automation", text:"WhatsApp, Telegram, AI sales assistants, lead qualification and internal notifications with human handoff.", href:"/demo" },
];

const products = [
  ["Web Development","Web experiences","Website development, e-commerce, landing pages, web applications and customer portals.","/products/web-development"],
  ["Software Marketplace","Software + implementation","Existing or affiliated software products configured, customized, integrated and implemented for clients.","/products/software-marketplace"],
  ["Content Creation","Growth content","Campaign creative, social content, video direction, copy and conversion-focused storytelling.","/products/content-creation"],
  ["E-commerce & Payments","Commerce systems","Commerce journeys and localized payment integration designed for the Ethiopian market.","/products/ecommerce-payments"],
  ["CRM & Lead Systems","Customer systems","Lead capture, sales pipelines, qualification, follow-up and reporting.","/products/crm-lead-systems"],
];

export default async function Home(){
 const content=await getPageContent("/");
 return <main className="landing-page">
  <AslalInteractiveHero />

  <section className="landing-section light-section">
   <div className="container-aslal grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
    <div className="section-heading"><span style={contentStyle(content,"home.difference.eyebrow",10)}>{contentValue(content,"home.difference.eyebrow","01 — THE DIFFERENCE")}</span><h2 style={contentStyle(content,"home.difference.title",48)}>{contentValue(content,"home.difference.title","Your website should do more than exist.")}</h2><p style={contentStyle(content,"home.difference.body",18)}>{contentValue(content,"home.difference.body","A traditional website can attract attention and lose it. Your growth system should understand interest, recommend a path, start a conversation, create a lead and support sales follow-up.")}</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7"><div className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Traditional website</div><div className="mt-8 space-y-4 font-bold text-slate-700"><div>Visitor</div><div className="text-slate-300">↓</div><div>Reads</div><div className="text-slate-300">↓</div><div>Leaves</div></div></div>
      <div className="rounded-[2rem] bg-[#0F3E8A] p-7 text-white shadow-xl"><div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">Aslal growth system</div><div className="mt-8 space-y-4 font-bold"><div>Visitor</div><div className="text-white/35">↓</div><div>Understands interest</div><div className="text-white/35">↓</div><div>Starts conversation</div><div className="text-white/35">↓</div><div>Lead → sales follow-up → customer</div></div></div>
    </div>
   </div>
  </section>

  <section className="landing-section capability-section">
   <div className="container-aslal"><div className="section-heading section-heading-light"><span style={contentStyle(content,"home.solutions.eyebrow",10)}>{contentValue(content,"home.solutions.eyebrow","02 — SOLUTIONS")}</span><h2 style={contentStyle(content,"home.solutions.title",48)}>{contentValue(content,"home.solutions.title","Six connected divisions. One growth partner.")}</h2><p style={contentStyle(content,"home.solutions.body",18)}>{contentValue(content,"home.solutions.body","From digital presence to customer systems, we connect the pieces instead of selling isolated services.")}</p></div>
    <div className="capability-grid">{divisions.map(x=><Link key={x.n} href={x.href} className="capability-card group"><em>{x.n}</em><h3>{x.title}</h3><p>{x.text}</p><b className="mt-5 inline-block text-[#E2B02A]">Explore <span className="transition-transform group-hover:translate-x-1">→</span></b></Link>)}</div>
   </div>
  </section>

  <section className="landing-section light-section">
   <div className="container-aslal">
    <div className="section-heading"><span style={contentStyle(content,"home.products.eyebrow",10)}>{contentValue(content,"home.products.eyebrow","03 — PRODUCTS")}</span><h2 style={contentStyle(content,"home.products.title",48)}>{contentValue(content,"home.products.title","Proven products. Local implementation. Custom fit.")}</h2><p style={contentStyle(content,"home.products.body",18)}>{contentValue(content,"home.products.body","Explore the public catalog, open a dedicated product page for the full explanation, then request a quote or demo directly into our sales system.")}</p></div>
    <div className="solution-grid">{products.map(([name,tag,desc,href])=><article key={name} className="solution-card group"><span>{tag}</span><h3>{name}</h3><p>{desc}</p><div className="mt-6 flex flex-wrap items-center gap-3"><Link href={href} className="font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Explore More →</Link><Link href={`/contact?product=${encodeURIComponent(name)}&goal=Request%20a%20quote`} className="rounded-full bg-[#E2B02A] px-4 py-2 text-xs font-black text-[#1E293B]">Request Quote</Link></div></article>)}</div>
    <div className="mt-8 flex justify-center"><Link href="/products" className="hero-secondary border-slate-300 text-[#0F3E8A]">View All Products →</Link></div>
   </div>
  </section>

  <section className="landing-section capability-section">
   <div className="container-aslal grid gap-14 lg:grid-cols-[1fr_.8fr] lg:items-center">
    <div className="section-heading section-heading-light"><span style={contentStyle(content,"home.growth.eyebrow",10)}>{contentValue(content,"home.growth.eyebrow","04 — DIGITAL GROWTH")}</span><h2 style={contentStyle(content,"home.growth.title",48)}>{contentValue(content,"home.growth.title","Content, commerce, customer systems, automation, brand and search.")}</h2><p style={contentStyle(content,"home.growth.body",18)}>{contentValue(content,"home.growth.body","Social content, video, graphics, copywriting, campaign creatives, e-commerce, payment integration, CRM, lead management, sales automation, Telegram, WhatsApp, SEO and brand systems can work as one connected engine.")}</p></div>
    <div className="grid gap-3 sm:grid-cols-2">{["Content","Commerce","Customer systems","Automation","Brand","Search"].map((x,i)=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><span className="text-xs font-black text-[#E2B02A]">0{i+1}</span><h3 className="mt-2 text-lg font-black text-white">{x}</h3><p className="mt-2 text-sm leading-6 text-white/55">{["Social, video, graphics, copy and campaign creative.","E-commerce, checkout, payments and order journeys.","CRM, lead management, pipeline and follow-up.","Bots, AI sales assistants, qualification and notifications.","Branding, rebranding, visual identity and guidelines.","Local, technical, content and commercial SEO."][i]}</p></div>)}</div>
   </div>
  </section>

  <section className="landing-section light-section">
   <div className="container-aslal grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
    <div><span className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]" style={contentStyle(content,"home.local.eyebrow",10)}>{contentValue(content,"home.local.eyebrow","05 — LOCAL BY DESIGN")}</span><h2 className="mt-4 text-4xl font-black tracking-tight text-[#1E293B] sm:text-5xl" style={contentStyle(content,"home.local.title",48)}>{contentValue(content,"home.local.title","Built for Ethiopia. Ready to scale.")}</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600" style={contentStyle(content,"home.local.body",18)}>{contentValue(content,"home.local.body","We design around local payment realities, customer behavior, language, connectivity and operational constraints while keeping the technology modern and extensible.")}</p></div>
    <div className="rounded-[2rem] bg-[#0F3E8A] p-8 text-white"><div className="grid grid-cols-2 gap-4">{["Local context","Technical precision","Connected execution","Measurable ROI"].map(x=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><span className="text-[#E2B02A]">✦</span><p className="mt-3 font-black">{x}</p></div>)}</div></div>
   </div>
  </section>

  <section className="landing-section builder-section"><div className="container-aslal builder-inner"><div><span style={contentStyle(content,"home.builder.eyebrow",10)}>{contentValue(content,"home.builder.eyebrow","06 — START WITH THE BOTTLENECK")}</span><h2 style={contentStyle(content,"home.builder.title",56)}>{contentValue(content,"home.builder.title","Not sure exactly what you need?")}</h2><p style={contentStyle(content,"home.builder.body",18)}>{contentValue(content,"home.builder.body","Tell us what is holding your business back. The Growth System Builder turns the problem into a practical starting point.")}</p></div><Link href="/growth-builder">{contentValue(content,"home.builder.cta","Build My Growth System")} <span>→</span></Link></div></section>
  <section className="landing-section trust-section"><div className="container-aslal trust-inner"><div><span>ASLAL DIGITAL SOLUTIONS</span><h2 style={contentStyle(content,"home.trust",48)}>{contentValue(content,"home.trust","Engineered Growth. Local Context. Measurable ROI.")}</h2></div><div className="trust-pills"><b>BUILD</b><b>AUTOMATE</b><b>GROW</b><b>MEASURE</b></div></div></section>
 </main>;
}
