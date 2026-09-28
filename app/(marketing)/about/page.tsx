import Link from "next/link";
import { AboutTeam } from "@/components/AboutTeam";
import { getPageContent, contentValue } from "@/lib/public-content";
import { getTeamMembers } from "@/lib/team-members";

export const revalidate=60;
export const metadata={title:"About Aslal | Digital Growth Systems for Ethiopia",description:"Meet Aslal Digital Solutions: an Ethiopia-first team connecting marketing, technology, CRM and automation around measurable business growth."};

const pillars=[
  ["01","Growth","Demand generation, content, SEO and campaigns that create qualified conversations."],
  ["02","Systems","Web, CRM, commerce and customer journeys connected to the way your team actually works."],
  ["03","Automation","Telegram, email and workflow automation that keeps follow-up moving without losing the human handoff."],
  ["04","Measurement","Clear signals from visitor and lead activity through sales, orders and revenue."],
];

export default async function AboutPage(){
 const [content,team]=await Promise.all([getPageContent("/about"),getTeamMembers()]);
 return <main className="bg-[#F8FAFC] text-[#1E293B]">
  <section className="hero-glow py-20 sm:py-28"><div className="container-aslal relative z-10 grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
   <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">About Aslal</div>
    <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.06em] sm:text-7xl">Build the digital system behind your growth.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">Aslal connects marketing, technology, sales and automation so businesses can attract demand, respond faster and see what happens next.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/growth-builder" className="rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Build my growth system →</Link><Link href="/portfolio" className="rounded-full border border-white/20 bg-white/5 px-6 py-4 font-bold text-white">See our work</Link></div>
   </div>
   <div className="rounded-[2rem] border border-white/10 bg-white/[.07] p-7 backdrop-blur"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Our focus</div><div className="mt-5 grid grid-cols-2 gap-3">{[["Demand","Attract"],["Conversation","Convert"],["Workflow","Follow up"],["Revenue","Measure"]].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-white/[.05] p-4"><div className="text-sm font-black text-white">{a}</div><div className="mt-1 text-xs text-white/55">{b}</div></div>)}</div></div>
  </div></section>
  <section className="bg-white py-16"><div className="container-aslal"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{pillars.map(([n,t,d])=><article key={n} className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-6"><span className="text-xs font-black tracking-[.18em] text-[#0F3E8A]">{n}</span><h2 className="mt-8 text-xl font-black text-[#132238]">{t}</h2><p className="mt-3 text-sm leading-6 text-[#475569]">{d}</p></article>)}</div></div></section>
  <section className="bg-[#F8FAFC] py-20"><div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
   <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Why we exist</div><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl text-[#132238]">Less fragmentation. More useful action.</h2></div>
   <div className="grid gap-5 text-[#475569]"><p className="text-lg leading-8">Businesses do not need another disconnected tool. They need a practical path from the first visitor or message to a qualified lead, a sale and a clear next action.</p><p className="text-lg leading-8">We build that path around local realities in Ethiopia: the channels customers use, the payments businesses accept, the teams that follow up and the evidence leaders need to make decisions.</p><p className="text-lg leading-8">We keep the work grounded in what can be implemented, measured and improved.</p></div>
  </div></section>
  <AboutTeam members={team}/>
  <section className="bg-[#071F47] py-20 text-white"><div className="container-aslal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Start with the bottleneck</div><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Tell us what should work better.</h2><p className="mt-4 max-w-2xl leading-7 text-white/65">{contentValue(content,"cta.body","We will map the practical digital system around your goal.")}</p></div><Link href="/contact?goal=Build%20my%20growth%20system" className="rounded-full bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B]">Talk to Aslal →</Link></div></section>
 </main>;
}