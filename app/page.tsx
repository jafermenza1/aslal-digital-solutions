import Link from "next/link";
import { cookies } from "next/headers";

const solutions=[
 ["CRM Pro","Affiliate / Implementation","A practical CRM foundation for managing leads, sales activity and follow-ups.","/products"],
 ["Commerce Stack","Custom Solution","End-to-end e-commerce, localized payment integration and customer journeys.","/services"],
 ["Sales Automation","Custom Solution","High-converting website, WhatsApp and Telegram experiences that qualify and convert demand.","/services"],
];
const capabilities=[
 ["01","Web Experiences","Websites, e-commerce, landing pages, web applications and customer portals."],
 ["02","E-commerce & Payments","Commerce journeys and localized payment integration for the Ethiopian market."],
 ["03","Branding & Re-branding","Brand systems, digital identity and consistent customer experiences."],
 ["04","CRM & Lead Systems","Lead capture, pipelines, qualification, follow-up and reporting."],
 ["05","WhatsApp Sales Automation","Conversational sales flows with seamless human handoffs."],
 ["06","Telegram Sales Bots","Interactive qualification and sales experiences."],
 ["07","SEO","Technical, content and commercial-intent search optimization."],
 ["08","Content Creation","Campaign creative, social content, video direction and conversion storytelling."],
 ["09","Software Marketplace","Proven software products customized, integrated and implemented for your needs."],
];

export default async function Home(){
 const c=(await cookies()).get("aslal_locale")?.value;
 return <main>
  <section className="hero-glow grid-bg relative isolate">
   <div className="container-aslal relative z-10 grid min-h-[720px] items-center gap-12 py-24 lg:grid-cols-[1.08fr_.92fr]">
    <div>
     <div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/35 bg-[#E2B02A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]"><span className="status-dot"/> Proven products · local implementation · custom fit</div>
     <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl lg:text-[82px]">Technology and Marketing, <span className="text-[#E2B02A]">Connected</span> Around Outcomes.</h1>
     <p className="mt-7 max-w-2xl text-lg leading-8 text-[#F8FAFC]/75 sm:text-xl">We do not just build websites or sell software. We implement, customize and connect proven digital tools designed to capture demand, streamline payments and close deals in the Ethiopian market.</p>
     <div className="mt-9 flex flex-wrap gap-3"><Link href="/growth-builder" className="glow-button rounded-full bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B]">Build My Growth System →</Link><Link href="/services" className="rounded-full border border-white/20 bg-white/10 px-7 py-4 font-black text-white hover:bg-white/15">Explore Solutions</Link></div>
     <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-black uppercase tracking-[.16em] text-white/55"><span>CRM</span><span>Commerce</span><span>Payments</span><span>Automation</span><span>SEO</span></div>
    </div>
    <div className="hero-drift rounded-[30px] border border-white/15 bg-[#071F47]/80 p-5 shadow-2xl backdrop-blur-md">
     <div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#F8FAFC]/45">ASLAL GROWTH SYSTEM</div><div className="mt-2 text-2xl font-black">Demand → Revenue</div></div><span className="rounded-full bg-[#E2B02A]/15 px-3 py-1 text-[9px] font-black text-[#E2B02A]">LIVE MODEL</span></div>
     <div className="mt-6 grid grid-cols-2 gap-3">{["Attract","Capture","Qualify","Automate","Convert","Retain"].map((x,i)=><div key={x} className={`rounded-2xl border p-4 ${i===5?"border-[#E2B02A]/40 bg-[#E2B02A]/10":"border-white/10 bg-white/[.035]"}`}><div className="text-[9px] font-black tracking-[.18em] text-white/30">0{i+1}</div><div className="mt-2 text-sm font-black">{x}</div></div>)}</div>
     <div className="mt-4 rounded-2xl border border-white/10 bg-[#0F3E8A]/70 p-5"><div className="flex items-end justify-between"><div><div className="text-xs text-white/45">Outcome architecture</div><div className="mt-2 text-xl font-black">Attention → action → growth</div></div><div className="text-2xl font-black text-[#E2B02A]">ROI</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-[#E2B02A]"/></div></div>
    </div>
   </div>
  </section>

  <section className="bg-[#F8FAFC] py-24 text-[#1E293B]"><div className="container-aslal"><div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">SOLUTIONS BUILT FOR YOUR BUSINESS REALITY</div><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Practical systems without the custom-build price tag.</h2><p className="mt-5 text-lg leading-8 text-[#1E293B]/65">We partner with trusted providers and combine proven tools with local implementation.</p></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{solutions.map(([title,tag,desc,href])=><Link href={href} key={title} className="interactive-card rounded-[26px] border border-[#0F3E8A]/10 bg-white p-7 shadow-sm"><span className="rounded-full bg-[#E2B02A]/15 px-3 py-1 text-[9px] font-black uppercase tracking-[.15em] text-[#0F3E8A]">{tag}</span><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-[#1E293B]/65">{desc}</p><div className="mt-7 font-black text-[#0F3E8A]">View solution →</div></Link>)}</div></div></section>

  <section className="bg-[#0F3E8A] py-24 text-[#F8FAFC]"><div className="container-aslal"><div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">THE ENGINE / CAPABILITIES</div><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Everything You Need to Scale, Under One Roof.</h2><p className="mt-5 text-lg leading-8 text-white/70">Nine connected capabilities, grouped around presence, sales automation, traffic and software.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{capabilities.map(([n,title,desc])=><div key={n} className="interactive-card rounded-[24px] border border-white/10 bg-white/[.06] p-6"><div className="text-xs font-black tracking-[.2em] text-[#E2B02A]">{n}</div><h3 className="mt-10 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{desc}</p></div>)}</div></div></section>

  <section className="bg-[#F8FAFC] py-20 text-[#1E293B]"><div className="container-aslal grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">SOCIAL PROOF & TRUST</div><h2 className="mt-3 text-4xl font-black">Local context. Technical precision. Measurable ROI.</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["LOCAL","TRUSTED","CONNECTED","MEASURABLE"].map(x=><div key={x} className="rounded-2xl border border-[#0F3E8A]/10 bg-white p-5 text-center text-xs font-black tracking-[.12em] text-[#0F3E8A]">{x}</div>)}</div></div></section>

  <section id="growth-builder" className="bg-[#E2B02A] py-24 text-[#1E293B]"><div className="container-aslal flex flex-col justify-between gap-10 lg:flex-row lg:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em]">NOT SURE EXACTLY WHAT YOU NEED?</div><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Find the bottleneck. Build the system. Measure the growth.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-[#1E293B]/75">Tell us your current bottlenecks and we&apos;ll turn your goals into a practical, step-by-step starting point.</p></div><Link href="/growth-builder" className="shrink-0 rounded-full bg-[#0F3E8A] px-8 py-5 text-center font-black text-white shadow-xl">Build my growth system →</Link></div></section>
 </main>;
}
