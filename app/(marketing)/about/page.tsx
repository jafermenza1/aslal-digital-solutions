import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const principles = [
  ["01", "Local context", "We build for the realities of Ethiopian businesses while keeping the engineering standard global."],
  ["02", "Systems thinking", "Websites, software, marketing, sales and automation work better when designed as one system."],
  ["03", "Measurable outcomes", "We prioritize useful signals, attribution and business results over vanity metrics."],
  ["04", "Technical precision", "Clean implementation, sensible integrations and maintainable foundations come first."],
];

export default function AboutPage() {
  return <main>
    <section className="relative overflow-hidden bg-[#0F3E8A] py-24 text-white hero-glow"><div className="container-aslal relative z-10 max-w-5xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">About Aslal</div><h1 className="mt-5 text-5xl font-black tracking-[-.05em] sm:text-7xl">A digital growth partner built around systems, not noise.</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/75">Aslal Digital Solutions combines technology and marketing to help businesses build digital systems that attract attention, create conversations and support measurable growth.</p></div></section>
    <section className="bg-white py-24"><div className="container-aslal"><SectionTitle eyebrow="How we think" title="Engineering growth with local context and global discipline." description="Our job is not simply to launch another website. It is to connect the right digital capabilities around a business objective."/><div className="mt-14 grid gap-5 md:grid-cols-2">{principles.map(([n,t,d])=><div key={n} className="interactive-card rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-8"><div className="text-xs font-black tracking-[.2em] text-[#E2B02A]">{n}</div><h2 className="relative z-10 mt-7 text-2xl font-black">{t}</h2><p className="relative z-10 mt-3 max-w-xl leading-7 text-slate-600">{d}</p></div>)}</div></div></section>
    <section className="bg-[#1E293B] py-24 text-white"><div className="container-aslal flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Next step</div><h2 className="mt-4 max-w-3xl text-4xl font-black sm:text-5xl">Tell us where growth is getting stuck.</h2><p className="mt-5 max-w-2xl leading-8 text-white/70">We can turn the problem into a practical digital system roadmap.</p></div><Link href="/contact" className="glow-button shrink-0 rounded-full bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B]">Start a conversation →</Link></div></section>
  </main>;
}
