import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { EventTracker } from "@/components/EventTracker";
import { getPageContent, contentValue } from "@/lib/public-content";
import { getResources } from "@/lib/resources-server";

export const metadata: Metadata = {
  title: "Resources, Playbooks & Growth Tools | Aslal Digital Solutions",
  description: "Practical Ethiopia-focused playbooks, payment integration guides, conversational sales blueprints, funnel architecture, growth diagnostics, ROI tools and CRM templates.",
  alternates: { canonical: "https://aslaldigital.com/resources" },
  openGraph: { title:"Resources, Playbooks & Growth Tools | Aslal Digital Solutions", description:"Use practical guides and interactive tools to diagnose growth bottlenecks, improve digital commerce and build connected sales systems.", url:"https://aslaldigital.com/resources", type:"website", siteName:"Aslal Digital Solutions", images:[{url:"https://aslaldigital.com/og/resources.png",width:1200,height:630,alt:"Aslal Digital Solutions Resources"}] },
  twitter: { card:"summary_large_image", title:"Aslal Resources", description:"Playbooks, diagnostics, calculators and CRM templates for digital growth.", images:["https://aslaldigital.com/og/resources.png"] },
};

export default async function ResourcesPage({searchParams}:{searchParams:Promise<{category?:string;days?:string}>}) {
 const params=await searchParams; const category=params.category||""; const days=Number(params.days||3650);
 const [content,resources]=await Promise.all([getPageContent("/resources"),getResources({category:category||undefined,days})]);
 const categories=Array.from(new Set(resources.map(x=>x.category)));
 return <main>
  <EventTracker eventName="CONTENT_VIEW"/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage","name":"Aslal Resources","url":"https://aslaldigital.com/resources","description":"Practical playbooks, diagnostic tools and templates for digital growth in Ethiopia."})}} />
  <section className="bg-[#F8FAFC] py-24"><div className="container-aslal">
   <SectionTitle eyebrow={contentValue(content,"hero.eyebrow","Resources")} title={contentValue(content,"hero.title","Practical resources that help you decide what to fix next.")} description={contentValue(content,"hero.body","Use the preview first. Then take the next step when the resource reveals a real business bottleneck.")}/>
   <div className="mt-10 flex flex-wrap gap-2">
    <Link href="/resources?days=3650" className={!category?"rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white":"rounded-full border px-4 py-2 text-sm font-bold"}>All</Link>
    {categories.map(c=><Link key={c} href={`/resources?category=${encodeURIComponent(c)}&days=${days}`} className={category===c?"rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white":"rounded-full border px-4 py-2 text-sm font-bold"}>{c}</Link>)}
    {[30,90,365,3650].map(d=><Link key={d} href={`/resources?days=${d}${category?"&category="+encodeURIComponent(category):""}`} className={days===d?"rounded-full bg-[#E2B02A] px-4 py-2 text-sm font-black text-[#1E293B]":"rounded-full border px-4 py-2 text-sm font-bold"}>{d===3650?"All time":`Last ${d} days`}</Link>)}
   </div>
   <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {resources.map(resource=><article key={resource.id} className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">{resource.category}</div><h2 className="mt-5 text-2xl font-black leading-tight">{resource.title}</h2><p className="mt-4 leading-7 text-slate-600">{resource.description}</p><p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><strong className="text-[#0F3E8A]">Preview:</strong> {resource.preview}</p>
      <div className="mt-auto pt-7"><Link href={`/resources/${resource.slug}`} className="inline-flex rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Explore resource →</Link></div>
    </article>)}
   </div>
   {!resources.length&&<div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No resources match this category and time filter.</div>}
  </div></section>
  <section className="bg-[#071F47] py-20 text-white"><div className="container-aslal grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Resource → lead engine</div><h2 className="mt-4 text-3xl font-black sm:text-4xl">Useful content should shorten the distance to a useful conversation.</h2><p className="mt-4 max-w-2xl leading-8 text-white/65">Previews stay open. High-value templates use short inline capture. Meaningful interactions enter the same lead, scoring and follow-up system used by the rest of Aslal.</p></div><div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-7"><div className="text-sm font-black text-[#E2B02A]">Intent-based next steps</div><ul className="mt-4 space-y-3 text-sm leading-6 text-white/70"><li>Payment guide → custom payment integration quote</li><li>Funnel calculator → technical funnel audit</li><li>Sales blueprint → automation planning</li><li>CRM template → pipeline implementation</li></ul><Link href="/growth-builder" className="mt-7 inline-flex rounded-full bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Start with the bottleneck →</Link></div></div></section>
 </main>;
}