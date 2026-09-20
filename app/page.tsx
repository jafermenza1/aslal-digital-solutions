import Link from "next/link";
import { cookies } from "next/headers";
import { SectionTitle } from "@/components/SectionTitle";
import { getCopy, type Locale } from "@/lib/i18n";

const services=[
 ["01","Digital Experiences","Websites, commerce and web apps engineered for speed, trust and conversion."],
 ["02","Growth Systems","SEO, campaigns, content and landing journeys connected to measurable demand."],
 ["03","Sales Operations","Lead capture, qualification, ownership and follow-up built into one operating system."],
 ["04","Automation","WhatsApp, Telegram and workflow automation that reduces response time and manual work."],
];
const proof=[
 ["+150%","Illustrative ROI outcome","Proof-led campaigns and conversion journeys."],
 ["3×","Illustrative lead lift","Demand capture redesigned around intent."],
 ["24/7","Digital response","Automated first response and routing."],
];
export default async function Home(){
 const locale:Locale=(await cookies()).get("aslal_locale")?.value==="am"?"am":"en"; const t=getCopy(locale);
 return <main className="overflow-hidden">
  <section className="hero-glow grid-bg relative isolate min-h-[760px]">
   <div className="container-aslal relative z-10 grid min-h-[760px] items-center gap-14 py-24 lg:grid-cols-[1.08fr_.92fr]">
    <div>
     <div className="inline-flex items-center gap-2 rounded-full border border-[#B7FF4A]/20 bg-[#B7FF4A]/5 px-4 py-2 text-[10px] font-black uppercase tracking-[.22em] text-[#B7FF4A]"><span className="status-dot"/> Ethiopia · Growth Engineering</div>
     <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-7xl lg:text-[88px]">Marketing that looks sharp. <span className="text-[#B7FF4A]">Systems that sell.</span></h1>
     <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">Aslal builds digital experiences, growth campaigns and sales systems that turn attention into measurable commercial action.</p>
     <div className="mt-9 flex flex-wrap gap-3"><Link href="/growth-builder" className="glow-button rounded-full bg-[#B7FF4A] px-6 py-4 font-black text-[#07111f]">Get a free growth audit ↗</Link><Link href="/work" className="rounded-full border border-white/15 bg-white/5 px-6 py-4 font-black text-white transition hover:bg-white/10">See the proof</Link></div>
     <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold uppercase tracking-[.14em] text-white/35"><span>Web</span><span>SEO</span><span>Commerce</span><span>CRM</span><span>Automation</span></div>
    </div>
    <div className="hero-drift">
      <div className="portal-card relative p-5 shadow-2xl shadow-black/30"><div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Growth signal</div><div className="mt-1 text-lg font-black">Demand is moving</div></div><span className="rounded-full bg-[#B7FF4A]/10 px-3 py-1 text-[10px] font-black text-[#B7FF4A]">LIVE MODEL</span></div>
       <div className="mt-6 grid grid-cols-2 gap-3">{["VISITOR","INTEREST","LEAD","CONVERSATION","OPPORTUNITY","REVENUE"].map((x,i)=><div key={x} className={`rounded-2xl border p-4 ${i===5?"border-[#B7FF4A]/40 bg-[#B7FF4A]/10":"border-white/8 bg-white/[.025]"}`}><div className="text-[9px] font-black tracking-[.18em] text-white/25">0{i+1}</div><div className={`mt-2 text-sm font-black ${i===5?"text-[#B7FF4A]":"text-white"}`}>{x}</div></div>)}</div>
       <div className="mt-4 rounded-2xl border border-white/8 bg-[#07111f] p-5"><div className="flex items-end justify-between"><div><div className="text-xs text-white/35">Conversion architecture</div><div className="mt-2 text-2xl font-black">Attention → action</div></div><div className="text-3xl font-black text-[#FF8A3D]">ROI</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#5B8CFF] via-[#B7FF4A] to-[#FF8A3D]"/></div></div>
      </div>
    </div>
   </div>
  </section>

  <section className="border-y border-white/5 bg-[#091523] py-16"><div className="container-aslal grid gap-4 md:grid-cols-3">{proof.map(([big,label,desc])=><div key={big} className="interactive-card rounded-3xl border border-white/8 bg-white/[.025] p-7"><div className="text-5xl font-black tracking-tight text-[#B7FF4A]">{big}</div><div className="mt-3 font-black">{label}</div><p className="mt-2 text-sm leading-6 text-white/40">{desc}</p></div>)}</div></section>

  <section className="bg-[#F5F8FC] py-24 text-[#07111f]"><div className="container-aslal"><SectionTitle eyebrow="THE ASLAL DIFFERENCE" title="Proof first. Process second. Vanity last." description="Every engagement connects creative work to a measurable business outcome."/><div className="mt-14 grid gap-5 lg:grid-cols-3">{[["01","Attract","Make the right people stop, understand and care."],["02","Convert","Turn intent into qualified leads and conversations."],["03","Retain","Give clients visibility, automation and operational trust."]].map(([n,title,desc],i)=><div key={n} className={`interactive-card rounded-[28px] p-8 ${i===1?"bg-[#07111f] text-white":"border border-slate-200 bg-white"}`}><div className={`text-xs font-black tracking-[.2em] ${i===1?"text-[#B7FF4A]":"text-[#5B8CFF]"}`}>{n}</div><h3 className="mt-16 text-2xl font-black">{title}</h3><p className={`mt-3 leading-7 ${i===1?"text-white/55":"text-slate-500"}`}>{desc}</p></div>)}</div></div></section>

  <section className="bg-[#07111f] py-24"><div className="container-aslal"><SectionTitle eyebrow="WHAT WE BUILD" title="A growth stack, not a pile of services." description="The public experience attracts demand. The Growth OS organizes it. The client portal makes delivery transparent."/><div className="mt-14 grid gap-4 md:grid-cols-2">{services.map(([n,title,desc])=><Link href="/services" key={n} className="interactive-card rounded-[28px] border border-white/8 bg-white/[.025] p-8"><div className="flex items-start justify-between"><span className="text-xs font-black tracking-[.2em] text-[#FF8A3D]">{n}</span><span className="text-white/20">↗</span></div><h3 className="mt-12 text-2xl font-black">{title}</h3><p className="mt-3 max-w-xl leading-7 text-white/45">{desc}</p></Link>)}</div></div></section>

  <section className="bg-[#B7FF4A] py-20 text-[#07111f]"><div className="container-aslal flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em]">Ready to move?</div><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Find the bottleneck. Build the system. Measure the growth.</h2></div><Link href="/growth-builder" className="shrink-0 rounded-full bg-[#07111f] px-7 py-4 font-black text-white transition hover:-translate-y-1">Start with a free audit ↗</Link></div></section>
 </main>;
}
