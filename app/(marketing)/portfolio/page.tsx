import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { getPageContent, contentValue } from "@/lib/public-content";

export default async function PortfolioPage() {
  const content=await getPageContent("/portfolio");
  return <main>
    <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal relative z-10"><SectionTitle eyebrow={contentValue(content,"hero.eyebrow","Portfolio")} title={contentValue(content,"hero.title","Proof, work and experiences in one place.")} description={contentValue(content,"hero.body","Explore verified work, implementation examples and the automation experiences that demonstrate how Aslal turns digital capability into commercial systems.")}/></div></section>
    <section className="py-20"><div className="container-aslal">
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="interactive-card rounded-[2rem] bg-[#0F3E8A] p-9 text-white"><div className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Case study</div><h2 className="relative z-10 mt-5 text-3xl font-black">Client growth system</h2><p className="relative z-10 mt-4 leading-7 text-white/70">Verified case studies belong here: starting point, implementation, measurable result and lessons learned. Aslal does not publish invented performance numbers.</p><span className="relative z-10 mt-8 inline-block font-black text-[#E2B02A]">Explore proof →</span></article>
        <article className="interactive-card rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-9"><div className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Implementation</div><h2 className="relative z-10 mt-5 text-3xl font-black">Software implementation</h2><p className="relative z-10 mt-4 leading-7 text-slate-600">Show the product relationship, customization, integration and business outcome for each verified implementation.</p><Link href="/products" className="relative z-10 mt-8 inline-block font-black text-[#0F3E8A]">Explore products →</Link></article>
      </div>
    </div></section>
    <section className="bg-[#F8FAFC] py-20"><div className="container-aslal"><div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Automation Lab</div><h2 className="mt-3 text-4xl font-black text-[#1E293B]">Experience the systems before you buy.</h2><p className="mt-4 leading-7 text-slate-600">Use live entry points for sales conversations and automation demos, then move directly into a growth consultation.</p><Link href="/automation-lab" className="mt-7 inline-flex rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Open Automation Lab →</Link></div></div></section>
  </main>;
}