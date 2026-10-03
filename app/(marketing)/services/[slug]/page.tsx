import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMarketingService, marketingServices } from "@/lib/marketing-services";
import { ShareActions } from "@/components/ShareActions";
import { SearchStructuredData, SearchAnswerBlock } from "@/components/SearchStructuredData";
import { getSearchProfile,effectiveSearchProfile } from "@/lib/search-profiles";

export const revalidate = 60;

export async function generateStaticParams() {
  return marketingServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getMarketingService(slug);
  if (!service) return { title: "Service | Aslal Digital Solutions" };
  const profile=await getSearchProfile("internal","SERVICE",slug,"en").catch(()=>null);
  const title = profile?.seoTitle||`${service.name} | Aslal Digital Solutions`;
  const description = profile?.metaDescription||`${service.description} ${service.cta}. Explore the service and request the next step from Aslal.`;
  const url = `https://aslaldigital.com/services/${encodeURIComponent(slug)}`;
  const image = "https://aslaldigital.com/og/products.png";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Aslal Digital Solutions",
      images: [{ url: image, width: 1200, height: 630, alt: `${service.name} — Aslal Digital Solutions` }],
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: profile?.noindex ? {index:false,follow:false} : undefined,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getMarketingService(slug);
  if (!service) notFound();
  const profile=await getSearchProfile("internal","SERVICE",slug,"en").catch(()=>null);
  const url = `https://aslaldigital.com/services/${service.slug}`;
  const requestUrl = `/contact?service=${encodeURIComponent(service.slug)}&goal=${encodeURIComponent(service.cta)}`;

  return <main>
    <section className="overflow-hidden bg-[#0F3E8A] text-white">
      <div className="container-aslal grid gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">Aslal service</div>
          <h1 className="mt-5 text-5xl font-black tracking-[-.05em] sm:text-7xl">{service.name}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-white/75">{service.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={requestUrl} className="rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] hover:bg-[#E2B02A]">{service.cta} →</Link>
            <Link href="/services" className="rounded-full border border-white/15 px-6 py-4 font-bold">← All services</Link>
          </div>
        </div>
        <div className="grid min-h-[300px] place-items-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0F3E8A] to-[#0F3E8A] p-8">
          <div className="text-center"><div className="text-7xl font-black text-[#E2B02A]">{service.name.slice(0,1)}</div><div className="mt-4 text-xs font-black uppercase tracking-[.2em] text-white/50">Aslal capability</div></div>
        </div>
      </div>
    </section>
    <section className="py-20"><div className="container-aslal grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
      <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Why it matters</div><h2 className="mt-3 text-4xl font-black">Built around a practical next action.</h2><p className="mt-5 leading-8 text-slate-600">{service.details}</p></div>
      <div><h2 className="text-2xl font-black">What this can include</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{service.outcomes.map((item)=><div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm"><span className="font-bold text-[#0F3E8A]">✓</span><span className="ml-3">{item}</span></div>)}</div>
        <div className="mt-10 rounded-[2rem] bg-[#F8FAFC] p-7 sm:p-9"><h2 className="text-3xl font-black">Ready to explore this service?</h2><p className="mt-3 leading-7 text-slate-600">Your request can enter the existing Aslal sales workflow for qualification, ownership and follow-up.</p><Link href={requestUrl} className="mt-6 inline-flex rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B] hover:bg-[#E2B02A]">{service.cta} →</Link></div>
      </div>
    </div></section>
    <div className="container-aslal pb-12"><SearchAnswerBlock profile={profile}/></div><section className="border-t border-slate-200 py-8"><div className="container-aslal flex flex-wrap items-center justify-between gap-4"><ShareActions title={`${service.name} | Aslal Digital Solutions`} url={url}/><Link href="/products" className="text-sm font-bold text-[#0F3E8A]">Explore products & packages →</Link></div></section>
  </main>;
}
