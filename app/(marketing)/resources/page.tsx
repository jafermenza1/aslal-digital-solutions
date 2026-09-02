import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const resources = [
  ["Growth systems", "How to connect traffic, interest, leads, conversations and revenue into one measurable journey."],
  ["Automation", "Practical ways WhatsApp, Telegram, CRM and workflow automation can reduce sales friction."],
  ["Digital commerce", "What Ethiopian businesses should consider when designing e-commerce and payment journeys."],
];

export default function ResourcesPage() {
  return <main>
    <section className="bg-[#F8FAFC] py-24"><div className="container-aslal"><SectionTitle eyebrow="Resources" title="Ideas for building better digital systems." description="A growing knowledge hub for business owners and teams making technology, marketing and automation decisions."/><div className="mt-14 grid gap-5 md:grid-cols-3">{resources.map(([title,desc],i)=><article key={title} className="interactive-card rounded-[2rem] border border-slate-200 bg-white p-8"><div className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">0{i+1} • GUIDE</div><h2 className="relative z-10 mt-7 text-2xl font-black">{title}</h2><p className="relative z-10 mt-4 leading-7 text-slate-600">{desc}</p><div className="relative z-10 mt-8 font-black text-[#0F3E8A]">Coming in the next release →</div></article>)}</div></div></section>
    <section className="bg-[#0F3E8A] py-20 text-white"><div className="container-aslal flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><h2 className="text-3xl font-black">Need a system, not another article?</h2><p className="mt-2 text-white/70">Start with your actual business goal and we'll map the digital pieces.</p></div><Link href="/contact" className="glow-button rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Build my growth system →</Link></div></section>
  </main>;
}
