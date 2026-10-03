import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Calculator, ClipboardList, FileSpreadsheet, MessageCircle, Send, Zap } from "lucide-react";
import { EventTracker } from "@/components/EventTracker";
import { RichContent } from "@/components/RichContent";
import { getPageContent, contentValue } from "@/lib/public-content";
import { getResources } from "@/lib/resources-server";

export const metadata: Metadata = {
  title: "Resources & Playbooks | Aslal Digital Solutions",
  description: "Practical playbooks, diagnostics, calculators and templates for B2B digital growth, sales and automation.",
  alternates: { canonical: "https://aslaldigital.com/resources" },
  openGraph: { title: "Resources & Playbooks | Aslal Digital Solutions", description: "Practical playbooks, diagnostics, calculators and templates for B2B digital growth, sales and automation.", url: "https://aslaldigital.com/resources", type: "website", siteName: "Aslal Digital Solutions", images: [{ url: "https://aslaldigital.com/og/resources.png", width: 1200, height: 630, alt: "Aslal Digital Solutions Resources" }] },
  twitter: { card: "summary_large_image", title: "Aslal Resources", description: "Playbooks, diagnostics, calculators and templates for digital growth.", images: ["https://aslaldigital.com/og/resources.png"] },
};

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ category?: string; days?: string }> }) {
  const params = await searchParams;
  const category = params.category || "";
  const days = Number(params.days || 3650);
  const [content, resources] = await Promise.all([getPageContent("/resources"), getResources({ category: category || undefined, days })]);
  const diagnostics = resources.filter((resource) => resource.category === "tool");
  const playbooks = resources.filter((resource) => resource.category === "guide");
  const frameworks = resources.filter((resource) => resource.category === "template");
  const categories = Array.from(new Set(resources.map((resource) => resource.category)));

  return (
    <main>
      <EventTracker eventName="CONTENT_VIEW" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Aslal Resources", url: "https://aslaldigital.com/resources", description: "Practical playbooks, diagnostic tools and templates for digital growth in Ethiopia." }) }} />

      <section className="relative overflow-hidden bg-[#F8FAFC] py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[800px] -translate-x-1/2 rounded-full bg-[#0F3E8A]/10 blur-[120px]" />
        <div className="container-aslal relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-black uppercase tracking-[.22em] text-[#0F3E8A]">{contentValue(content, "hero.eyebrow", "Resources")}</div>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.04em] text-[#1E293B] sm:text-5xl lg:text-6xl">{contentValue(content, "hero.title", "Field-Tested Blueprints & Tools for B2B Digital Systems")}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600"><RichContent content={content} keyName="hero.body" fallback="Stop relying on guesswork. Access practical implementation guides, interactive calculators and automation frameworks built to connect digital marketing with sales execution." /></p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link href="/resources?days=3650" className={!category ? "rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white transition hover:bg-[#E2B02A] hover:text-[#0F3E8A]" : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#E2B02A] hover:bg-[#E2B02A] hover:text-[#0F3E8A]"}>All</Link>
            {categories.map((item) => <Link key={item} href={"/resources?category=" + encodeURIComponent(item) + "&days=" + days} className={category === item ? "rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white" : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"}>{item}</Link>)}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] pb-20 sm:pb-24">
        <div className="container-aslal">
          {diagnostics.length > 0 && <ResourceSection icon={<Zap className="h-5 w-5" aria-hidden="true" />} title="Interactive Diagnostics & Calculators"><div className="grid grid-cols-1 gap-6 md:grid-cols-2">{diagnostics.map((resource) => <ResourceCard key={resource.id} resource={resource} featured />)}</div></ResourceSection>}
          {playbooks.length > 0 && <ResourceSection icon={<BookOpen className="h-5 w-5" aria-hidden="true" />} title="Technical Playbooks & Guides"><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{playbooks.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div></ResourceSection>}
          {frameworks.length > 0 && <ResourceSection icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />} title="Ready-to-Use Frameworks & Schemas"><div className="grid grid-cols-1 gap-6 md:grid-cols-2">{frameworks.map((resource) => <ResourceCard key={resource.id} resource={resource} compact />)}</div></ResourceSection>}
          {!resources.length && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No resources match this category and time filter.</div>}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#0F3E8A]/20 bg-gradient-to-b from-[#F8FAFC] to-[#E8EEF8]">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#0F3E8A]/5 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#E2B02A]/10 blur-[80px]" />
        <div className="container-aslal relative z-10 py-20 text-center">
          <h2 className="text-3xl font-black text-[#1E293B] sm:text-4xl">Ready to Turn These Frameworks into Your Growth System?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Skip the DIY trial-and-error. Book a consultation with the Aslal growth team to audit your current stack and plan the next implementation step.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contact?goal=Growth%20system%20audit" className="w-full rounded-lg bg-[#E2B02A] px-8 py-3.5 font-black text-[#1E293B] shadow-[0_4px_14px_rgba(226,176,42,.35)] transition hover:-translate-y-0.5 hover:bg-[#0F3E8A] hover:text-white sm:w-auto">Book a 30-Min System Audit</Link>
            <a href="https://t.me/aslal_digital" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-3.5 font-medium text-[#1E293B] transition hover:border-[#E2B02A] hover:bg-[#E2B02A] hover:text-[#0F3E8A] sm:w-auto">Telegram — Chat with Architect</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResourceSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <section className="mb-20"><div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-4"><span className="text-xl font-black text-[#0F3E8A]">{icon}</span><h2 className="text-2xl font-black text-[#1E293B]">{title}</h2></div>{children}</section>;
}

function ResourceCard({ resource, featured = false, compact = false }: { resource: Awaited<ReturnType<typeof getResources>>[number]; featured?: boolean; compact?: boolean }) {
  const downloadable = Boolean(resource.download_url);
  return (
    <article className={compact ? "flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#E2B02A] hover:shadow-md" : "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-xl"}>
      {!compact && <div className="absolute right-0 top-0 rounded-bl-lg bg-[#0F3E8A] px-3 py-1 text-xs font-black text-white">{downloadable ? "DOWNLOADABLE" : "INTERACTIVE"}</div>}
      <div className={compact ? "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F3E8A]/10 text-[#0F3E8A]" : "mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0F3E8A]/10 text-[#0F3E8A]"}>{resource.category === "tool" ? (resource.slug.includes("roi") ? <Calculator className="h-6 w-6" aria-hidden="true" /> : <Zap className="h-6 w-6" aria-hidden="true" />) : resource.category === "guide" ? <BookOpen className="h-6 w-6" aria-hidden="true" /> : <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />}</div>
      <div className={compact ? "" : "flex flex-1 flex-col"}>
        <div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">{resource.category}</div>
        <h3 className={compact ? "mt-1 text-lg font-black text-[#1E293B]" : "mt-2 text-xl font-black text-[#1E293B]"}>{resource.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p>
        {!compact && <p className="mt-5 flex-1 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600"><strong className="text-[#0F3E8A]">Preview:</strong> {resource.preview}</p>}
        <div className="mt-5"><Link href={"/resources/" + resource.slug} className={compact ? "inline-flex items-center gap-1 text-sm font-black text-[#0F3E8A] transition hover:text-[#E2B02A]" : "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F3E8A] px-4 py-3 text-sm font-black text-white transition hover:bg-[#E2B02A] hover:text-[#0F3E8A]"}>{downloadable ? "Get Resource" : resource.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </article>
  );
}
