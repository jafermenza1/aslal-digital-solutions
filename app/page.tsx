import Link from "next/link";
import {
  ArrowRight, Bot, CheckCircle2, Code2, CreditCard, Globe2, LineChart,
  MessageSquare, Search, Settings2, ShoppingCart, Sparkles, Workflow, Zap
} from "lucide-react";
import { AslalInteractiveHero } from "@/components/AslalInteractiveHero";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";

const capabilities = [
  { icon: Globe2, title: "Digital Presence", text: "Websites, landing pages, e-commerce, applications and customer portals built to move visitors toward action.", href: "/services" },
  { icon: Code2, title: "Software & Integration", text: "Proven software configured, customized and connected to the systems your business already uses.", href: "/products" },
  { icon: ShoppingCart, title: "Commerce & Payments", text: "Commerce journeys, checkout, order management and localized payment integrations for Ethiopia.", href: "/services" },
  { icon: MessageSquare, title: "Customer Systems", text: "Lead capture, qualification, CRM, follow-up and reporting organized around your sales process.", href: "/services" },
  { icon: Bot, title: "Automation", text: "WhatsApp, Telegram, AI-assisted sales flows and internal notifications with human handoff.", href: "/demo" },
  { icon: Search, title: "Growth & SEO", text: "Content, campaigns, search visibility and conversion systems connected to commercial intent.", href: "/services" },
];

const outcomes = [
  { icon: Zap, title: "Attract", text: "Create attention from the right audience." },
  { icon: MessageSquare, title: "Capture", text: "Turn interest into identifiable demand." },
  { icon: Settings2, title: "Qualify", text: "Separate real opportunities from noise." },
  { icon: Workflow, title: "Automate", text: "Keep follow-up moving without losing the human touch." },
  { icon: LineChart, title: "Convert", text: "Support sales with clearer next actions." },
  { icon: CheckCircle2, title: "Retain", text: "Build repeat business and measurable customer value." },
];

const products = [
  ["Web Development","Web experiences","Websites, e-commerce, landing pages, web applications and customer portals.","/products/web-development"],
  ["Software Marketplace","Software + implementation","Existing or affiliated software configured, customized, integrated and implemented for clients.","/products/software-marketplace"],
  ["Content Creation","Growth content","Campaign creative, social content, video direction, copy and conversion-focused storytelling.","/products/content-creation"],
  ["E-commerce & Payments","Commerce systems","Commerce journeys and localized payment integration designed for the Ethiopian market.","/products/ecommerce-payments"],
  ["CRM & Lead Systems","Customer systems","Lead capture, sales pipelines, qualification, follow-up and reporting.","/products/crm-lead-systems"],
];

export default async function Home(){
  const content=await getPageContent("/");
  const cv=(key:string,fallback:string)=>contentValue(content,key,fallback);
  const cs=(key:string,size:number)=>contentStyle(content,key,size);

  return <main className="landing-page">
    <AslalInteractiveHero content={content}/>

    <section className="landing-section light-section" aria-labelledby="proof-title">
      <div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="section-heading">
          <span style={cs("home.proof.eyebrow",10)}>{cv("home.proof.eyebrow","01 — HOW ASLAL HELPS")}</span>
          <h2 id="proof-title" style={cs("home.proof.title",48)}>{cv("home.proof.title","Turn digital activity into a managed commercial journey.")}</h2>
          <p style={cs("home.proof.body",18)}>{cv("home.proof.body","Aslal combines websites, marketing, customer systems, automation and sales execution so your team can move from attention to qualified demand and measurable next action.")}</p>
          <Link href="/growth-builder" className="inline-flex items-center gap-2 mt-6 font-black text-[#0F3E8A] hover:text-[#E2B02A]">Find your growth path <ArrowRight size={17}/></Link>
        </div>
        <div className="rounded-[2rem] bg-[#0F3E8A] p-6 sm:p-8 shadow-2xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["01","Attract","Content, campaigns, SEO and digital presence"],
              ["02","Capture","Forms, conversations and identifiable demand"],
              ["03","Qualify","Ownership, qualification and next actions"],
              ["04","Follow up","Tasks, automation and human conversations"],
              ["05","Convert","Quotes, orders and payment workflows"],
              ["06","Measure","Pipeline, revenue and operational reporting"],
            ].map(([n,t,d])=><div key={n} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><span className="font-mono text-xs text-[#E2B02A]">{n}</span><h3 className="mt-3 font-black text-white">{t}</h3><p className="mt-2 text-sm leading-6 text-white/55">{d}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="landing-section capability-section" aria-labelledby="offers-title">
      <div className="container-aslal">
        <div className="section-heading section-heading-light">
          <span style={cs("home.offers.eyebrow",10)}>{cv("home.offers.eyebrow","02 — WHAT YOU CAN BUY")}</span>
          <h2 id="offers-title" style={cs("home.offers.title",48)}>{cv("home.offers.title","Start with a service, package or product. Grow into a system.")}</h2>
          <p style={cs("home.offers.body",18)}>{cv("home.offers.body","Choose a focused capability when you know what you need, or use the Growth System Builder when you want Aslal to map the right starting scope.")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Marketing Packages","Starter, Growth and Market Leader packages for consistent demand generation and managed growth.","/products/marketing-growth"],
            ["Products & Solutions","Software, web, CRM, commerce and implementation offers with dedicated explanation pages.","/products"],
            ["Aslal Services","Custom digital, automation, branding, SEO and customer-system capabilities.","/services"],
          ].map(([title,text,href])=><Link key={title} href={href} className="group rounded-[1.7rem] border border-white/10 bg-white/[.035] p-7 hover:-translate-y-1 hover:border-[#E2B02A]/70 hover:bg-[#E2B02A]/[.07] transition">
            <h3 className="text-2xl font-black text-white group-hover:text-[#E2B02A]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/58">{text}</p><span className="mt-7 inline-flex items-center gap-2 font-black text-[#E2B02A]">Explore <ArrowRight size={16}/></span>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="landing-section light-section" aria-labelledby="portfolio-title">
      <div className="container-aslal grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
        <div className="section-heading">
          <span style={cs("home.portfolio.eyebrow",10)}>{cv("home.portfolio.eyebrow","03 — PORTFOLIO & AUTOMATION LAB")}</span>
          <h2 id="portfolio-title" style={cs("home.portfolio.title",48)}>{cv("home.portfolio.title","See the systems, work and live experiences behind the offer.")}</h2>
          <p style={cs("home.portfolio.body",18)}>{cv("home.portfolio.body","Explore verified work, implementation examples and interactive automation experiences without separating them from the commercial journey.")}</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/portfolio" className="site-cta">View Portfolio <ArrowRight size={16}/></Link><Link href="/automation-lab" className="hero-secondary border-slate-300 text-[#0F3E8A]">Open Automation Lab <ArrowRight size={16}/></Link></div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="space-y-4">
            {["Verified case studies and implementation proof","Interactive WhatsApp and Telegram sales experiences","Clear path from interest to Aslal consultation"].map((x,i)=><div key={x} className="flex gap-4 rounded-2xl bg-[#F8FAFC] p-5"><span className="font-mono text-xs font-black text-[#0F3E8A]">0{i+1}</span><p className="font-bold text-[#1E293B]">{x}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="landing-section capability-section" aria-labelledby="fit-title">
      <div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="section-heading section-heading-light">
          <span style={cs("home.fit.eyebrow",10)}>{cv("home.fit.eyebrow","04 — THE ASLAL MODEL")}</span>
          <h2 id="fit-title" style={cs("home.fit.title",48)}>{cv("home.fit.title","One commercial thread from first touch to customer value.")}</h2>
          <p style={cs("home.fit.body",18)}>{cv("home.fit.body","Marketing creates demand. Growth OS captures and qualifies it. Sales follows up. Commerce and finance complete the transaction. Reporting closes the loop.")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Demand","Pipeline","Commerce","Measurement"].map((x,i)=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><span className="font-mono text-xs text-[#E2B02A]">0{i+1}</span><h3 className="mt-4 font-black text-white">{x}</h3><p className="mt-2 text-sm text-white/50">{["Attract and capture interest","Qualify and manage follow-up","Quote, order, payment and reconciliation","Revenue, commission and reporting"][i]}</p></div>)}
        </div>
      </div>
    </section>

    <section className="landing-section builder-section" aria-labelledby="builder-title">
      <div className="container-aslal">
        <div className="builder-inner">
          <div><span style={cs("home.builder.eyebrow",10)}>{cv("home.builder.eyebrow","05 — START WITH THE BOTTLENECK")}</span><h2 id="builder-title" style={cs("home.builder.title",56)}>{cv("home.builder.title","Tell us what is holding growth back.")}</h2><p style={cs("home.builder.body",18)}>{cv("home.builder.body","Use the Growth System Builder to describe your business, goal and channels. Your request enters the Aslal sales workflow for qualification and follow-up.")}</p></div>
          <Link href="/growth-builder">{cv("home.builder.cta","Build My Growth System")} <ArrowRight size={18}/></Link>
        </div>
      </div>
    </section>

    <section className="landing-section trust-section">
      <div className="container-aslal trust-inner">
        <div><span>ASLAL DIGITAL SOLUTIONS</span><h2 style={cs("home.trust",48)}>{cv("home.trust","Engineered Growth. Local Context. Measurable ROI.")}</h2></div>
        <div className="trust-pills"><b>BUILD</b><b>AUTOMATE</b><b>GROW</b><b>MEASURE</b></div>
      </div>
    </section>
  </main>;
}
