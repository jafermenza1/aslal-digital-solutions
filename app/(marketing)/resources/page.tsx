import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { EventTracker } from "@/components/EventTracker";
import { getPageContent, contentValue } from "@/lib/public-content";
import { RESOURCES } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Resources, Playbooks & Growth Tools | Aslal Digital Solutions",
  description: "Practical Ethiopia-focused playbooks, payment integration guides, conversational sales blueprints, funnel architecture, growth diagnostics, ROI tools and CRM templates.",
  alternates: { canonical: "https://aslaldigital.com/resources" },
  openGraph: {
    title: "Resources, Playbooks & Growth Tools | Aslal Digital Solutions",
    description: "Use practical guides and interactive tools to diagnose growth bottlenecks, improve digital commerce and build connected sales systems.",
    url: "https://aslaldigital.com/resources",
    type: "website",
    siteName: "Aslal Digital Solutions",
    images: [{ url: "https://aslaldigital.com/og/resources.png", width: 1200, height: 630, alt: "Aslal Digital Solutions Resources" }],
  },
  twitter: { card: "summary_large_image", title: "Aslal Resources", description: "Playbooks, diagnostics, calculators and CRM templates for digital growth.", images: ["https://aslaldigital.com/og/resources.png"] },
};

const groups = [
  {title:"Playbooks & Implementation Guides",kind:"guide" as const},
  {title:"Interactive Diagnostic Tools",kind:"tool" as const},
  {title:"Templates & Frameworks",kind:"template" as const},
];

export default async function ResourcesPage() {
  const content=await getPageContent("/resources");
  return <main>
    <EventTracker eventName="CONTENT_VIEW"/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage","name":"Aslal Resources","url":"https://aslaldigital.com/resources","description":"Practical playbooks, diagnostic tools and templates for digital growth in Ethiopia."})}} />
    <section className="bg-[#F8FAFC] py-24">
      <div className="container-aslal">
        <SectionTitle eyebrow={contentValue(content,"hero.eyebrow","Resources")} title={contentValue(content,"hero.title","Practical resources that help you decide what to fix next.")} description={contentValue(content,"hero.body","Use the preview first. Then take the next step when the resource reveals a real business bottleneck.")}/>
        <div className="mt-14 space-y-16">
          {groups.map(group=><section key={group.kind}>
            <div className="mb-7 flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">{group.kind}</div><h2 className="mt-2 text-3xl font-black">{group.title}</h2></div></div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {RESOURCES.filter(resource=>resource.kind===group.kind).map((resource,index)=><article key={resource.slug} className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">0{index+1} • {resource.kind}</div>
                <h3 className="mt-5 text-2xl font-black leading-tight">{resource.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{resource.description}</p>
                <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><strong className="text-[#0F3E8A]">Preview:</strong> {resource.preview}</p>
                <div className="mt-auto pt-7"><Link href={`/resources/${resource.slug}`} className="inline-flex rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Explore resource →</Link></div>
              </article>)}
            </div>
          </section>)}
        </div>
      </div>
    </section>
    <section className="bg-[#071F47] py-20 text-white">
      <div className="container-aslal grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Resource → lead engine</div><h2 className="mt-4 text-3xl font-black sm:text-4xl">Useful content should shorten the distance to a useful conversation.</h2><p className="mt-4 max-w-2xl leading-8 text-white/65">Aslal keeps resource previews open, tracks meaningful engagement through first-party events and sends commercial intent into the same lead workflow used for the rest of the website.</p></div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-7"><div className="text-sm font-black text-[#E2B02A]">Intent-based next steps</div><ul className="mt-4 space-y-3 text-sm leading-6 text-white/70"><li>Payment guide → custom payment integration quote</li><li>Funnel calculator → technical funnel audit</li><li>Sales blueprint → automation planning</li><li>CRM template → pipeline implementation</li></ul><Link href="/growth-builder" className="mt-7 inline-flex rounded-full bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Start with the bottleneck →</Link></div>
      </div>
    </section>
    <section className="bg-[#F8FAFC] py-16"><div className="container-aslal"><div className="rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-9"><h2 className="text-2xl font-black">{contentValue(content,"cta.title","Need implementation, not another article?")}</h2><p className="mt-2 text-slate-600">{contentValue(content,"cta.body","Tell us what you are trying to improve and we will map the right digital system.")}</p><Link href="/contact?goal=Resource%20implementation%20request" className="mt-6 inline-flex rounded-full bg-[#0F3E8A] px-6 py-4 font-black text-white">Request implementation help →</Link></div></div></section>
  </main>;
}