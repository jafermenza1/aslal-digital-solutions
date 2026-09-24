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

    <section className="landing-section light-section" aria-labelledby="difference-title">
      <div className="container-aslal grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
        <div className="section-heading">
          <span style={cs("home.difference.eyebrow",10)}>{cv("home.difference.eyebrow","01 — THE DIFFERENCE")}</span>
          <h2 id="difference-title" style={cs("home.difference.title",48)}>{cv("home.difference.title","Your website should do more than exist.")}</h2>
          <p style={cs("home.difference.body",18)}>{cv("home.difference.body","A digital presence should understand interest, create a conversation, capture demand and help your team move the opportunity forward.")}</p>
          <Link href="/growth-builder" className="inline-flex items-center gap-2 mt-6 font-black text-[#0F3E8A] hover:text-[#E2B02A] transition-colors">Find the bottleneck <ArrowRight size={17}/></Link>
        </div>
        <div className="rounded-[2rem] bg-[#0F3E8A] p-5 sm:p-7 shadow-2xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-6 text-white">
              <span className="text-xs font-black uppercase tracking-[.18em] text-white/45">Traditional website</span>
              <div className="mt-7 space-y-3 font-bold"><div>Visitor arrives</div><div className="text-white/30">↓</div><div>Reads</div><div className="text-white/30">↓</div><div>Leaves</div></div>
            </div>
            <div className="rounded-2xl border border-[#E2B02A]/35 bg-[#E2B02A]/10 p-6 text-white">
              <span className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">Aslal growth system</span>
              <div className="mt-7 space-y-3 font-bold"><div>Visitor arrives</div><div className="text-white/30">↓</div><div>Interest is understood</div><div className="text-white/30">↓</div><div>Conversation starts</div><div className="text-white/30">↓</div><div>Lead → follow-up → customer</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="landing-section capability-section" aria-labelledby="solutions-title">
      <div className="container-aslal">
        <div className="section-heading section-heading-light">
          <span style={cs("home.solutions.eyebrow",10)}>{cv("home.solutions.eyebrow","02 — WHAT WE BUILD")}</span>
          <h2 id="solutions-title" style={cs("home.solutions.title",48)}>{cv("home.solutions.title","Digital systems connected around growth.")}</h2>
          <p style={cs("home.solutions.body",18)}>{cv("home.solutions.body","Instead of disconnected services, Aslal connects presence, demand capture, sales systems, automation and measurement into one practical operating layer.")}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({icon:Icon,title,text,href},i)=><Link key={title} href={href} className="group rounded-[1.7rem] border border-white/10 bg-white/[.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#E2B02A]/70 hover:bg-[#E2B02A]/[.07]">
            <div className="mb-6 flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-xl border border-[#E2B02A]/25 bg-[#E2B02A]/10 text-[#E2B02A] transition group-hover:bg-[#E2B02A] group-hover:text-[#1E293B]"><Icon size={22}/></div><span className="font-mono text-xs text-white/35">0{i+1}</span></div>
            <h3 className="text-xl font-black text-white group-hover:text-[#E2B02A] transition-colors">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#E2B02A]">Explore <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></span>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="landing-section light-section" aria-labelledby="products-title">
      <div className="container-aslal">
        <div className="section-heading">
          <span style={cs("home.products.eyebrow",10)}>{cv("home.products.eyebrow","03 — PRODUCTS & SERVICES")}</span>
          <h2 id="products-title" style={cs("home.products.title",48)}>{cv("home.products.title","Proven products. Local implementation. Custom fit.")}</h2>
          <p style={cs("home.products.body",18)}>{cv("home.products.body","Choose a starting point, explore the full solution and send a request directly into the Aslal sales workflow.")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map(([name,tag,desc,href],i)=><article key={name} className="group rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-xl">
            <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.15em] text-[#0F3E8A]">{tag}</span><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0F3E8A]/5 text-[#0F3E8A] group-hover:bg-[#E2B02A] group-hover:text-[#1E293B] transition"><CreditCard size={17}/></span></div>
            <h3 className="mt-5 text-xl font-black text-[#1E293B] group-hover:text-[#0F3E8A]">{name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={href} className="inline-flex items-center gap-2 font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Explore <ArrowRight size={16}/></Link>
              <Link href={`/contact?product=${encodeURIComponent(name)}&goal=Request%20a%20quote`} className="rounded-full bg-[#E2B02A] px-4 py-2 text-xs font-black text-[#1E293B] transition hover:bg-[#f0c63f]">Request Quote</Link>
            </div>
          </article>)}
        </div>
        <div className="mt-9 flex justify-center"><Link href="/products" className="hero-secondary border-slate-300 text-[#0F3E8A] hover:border-[#E2B02A] hover:text-[#E2B02A]">View All Solutions <ArrowRight size={16}/></Link></div>
      </div>
    </section>

    <section className="landing-section capability-section" aria-labelledby="flow-title">
      <div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="section-heading section-heading-light">
          <span style={cs("home.growth.eyebrow",10)}>{cv("home.growth.eyebrow","04 — THE GROWTH FLOW")}</span>
          <h2 id="flow-title" style={cs("home.growth.title",48)}>{cv("home.growth.title","From attention to revenue, without losing the thread.")}</h2>
          <p style={cs("home.growth.body",18)}>{cv("home.growth.body","Content, commerce, customer systems, automation, brand and search work better when they share the same commercial objective.")}</p>
          <Link href="/growth-builder" className="site-cta mt-7">Build My Growth System <ArrowRight size={16}/></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map(({icon:Icon,title,text},i)=><div key={title} className="rounded-2xl border border-white/10 bg-white/[.04] p-5 transition-all hover:border-[#E2B02A]/70 hover:bg-[#E2B02A]/[.06]">
            <div className="flex items-center gap-3"><Icon size={20} className="text-[#E2B02A]"/><span className="font-mono text-xs text-white/35">0{i+1}</span></div>
            <h3 className="mt-4 font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="landing-section light-section" aria-labelledby="local-title">
      <div className="container-aslal grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div>
          <span className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]" style={cs("home.local.eyebrow",10)}>{cv("home.local.eyebrow","05 — LOCAL BY DESIGN")}</span>
          <h2 id="local-title" className="mt-4 text-4xl font-black tracking-tight text-[#1E293B] sm:text-5xl" style={cs("home.local.title",48)}>{cv("home.local.title","Built for Ethiopia. Ready to scale.")}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600" style={cs("home.local.body",18)}>{cv("home.local.body","We design around local payment realities, customer behavior, language, connectivity and operational constraints while keeping the technology modern and extensible.")}</p>
        </div>
        <div className="rounded-[2rem] bg-[#0F3E8A] p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">{["Local context","Technical precision","Connected execution","Measurable ROI"].map((x,i)=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><span className="font-mono text-xs text-[#E2B02A]">0{i+1}</span><p className="mt-3 font-black text-white">{x}</p></div>)}</div>
        </div>
      </div>
    </section>

    <section className="landing-section builder-section" aria-labelledby="builder-title">
      <div className="container-aslal">
        <div className="builder-inner">
          <div><span style={cs("home.builder.eyebrow",10)}>{cv("home.builder.eyebrow","06 — START WITH THE BOTTLENECK")}</span><h2 id="builder-title" style={cs("home.builder.title",56)}>{cv("home.builder.title","Not sure exactly what you need?")}</h2><p style={cs("home.builder.body",18)}>{cv("home.builder.body","Tell us what is holding your business back. The Growth System Builder turns the problem into a practical starting point.")}</p></div>
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
