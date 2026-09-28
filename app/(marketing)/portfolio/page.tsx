import { RichContent } from "@/components/RichContent";
import Link from "next/link";
import { getPageContent, contentValue } from "@/lib/public-content";

const work=[
 ["Growth systems","Demand → lead → sales","Connect campaigns, forms, CRM and follow-up so the team can see what happens after the click.","/growth-builder"],
 ["Commerce & products","Catalog → order → payment","Build product and service journeys with clear requests, stock states, payments and customer handoff.","/products"],
 ["Conversational sales","Telegram → human handoff","Turn messaging into a useful sales channel with qualification, identity continuity and controlled automation.","/automation-lab"],
 ["Web experiences","Discover → understand → act","Fast, responsive public experiences designed to make the next action obvious.","/services"],
];

export default async function PortfolioPage(){
 const content=await getPageContent("/portfolio");
 return <main className="bg-[#F8FAFC] text-[#1E293B]">
  <section className="hero-glow py-20 sm:py-28"><div className="container-aslal relative z-10 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
   <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Portfolio</div><h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.06em] sm:text-7xl">Systems built to move business forward.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/75"><RichContent content={content} keyName="hero.body" fallback="Explore the kinds of growth, commerce, conversational and web systems Aslal builds. We publish verified outcomes rather than invented numbers." /></p></div>
   <div className="rounded-[2rem] border border-white/10 bg-white/[.07] p-7"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">How we show the work</div><div className="mt-5 flex flex-wrap gap-2">{["Problem","System","Workflow","Outcome"].map(x=><span key={x} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85">{x}</span>)}</div><p className="mt-5 text-sm leading-6 text-white/55">No inflated case-study claims. Aslal separates demonstrated work from illustrative scenarios.</p></div>
  </div></section>
  <section className="bg-white py-20"><div className="container-aslal"><div className="grid gap-5 md:grid-cols-2">{work.map(([k,title,body,href],i)=><article key={k} className="interactive-card rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">{k}</span><span className="text-xs font-black text-slate-400">0{i+1}</span></div><h2 className="mt-8 text-2xl font-black text-[#132238]">{title}</h2><p className="mt-3 max-w-xl leading-7 text-[#475569]">{body}</p><Link href={href} className="mt-7 inline-flex rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white hover:bg-[#0B3270]">Explore →</Link></article>)}</div></div></section>
  <section className="bg-[#F8FAFC] py-20"><div className="container-aslal grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">What a project looks like</div><h2 className="mt-4 text-4xl font-black tracking-tight text-[#132238] sm:text-5xl">From bottleneck to working system.</h2></div><div className="grid gap-3 sm:grid-cols-4">{[["01","Discover","Find the bottleneck"],["02","Design","Map the journey"],["03","Build","Ship the system"],["04","Improve","Measure and refine"]].map(([n,t,d])=><div key={n} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-black text-[#E2B02A]">{n}</span><h3 className="mt-5 font-black text-[#132238]">{t}</h3><p className="mt-2 text-sm leading-6 text-[#64748B]">{d}</p></div>)}</div></div></section>
  <section className="bg-[#E2B02A] py-16 text-[#1E293B]"><div className="container-aslal flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Have a project in mind?</div><h2 className="mt-2 text-3xl font-black">Turn the problem into a plan.</h2></div><Link href="/growth-builder" className="rounded-full bg-[#0F3E8A] px-6 py-4 font-black text-white">Build my growth system →</Link></div></section>
 </main>;
}