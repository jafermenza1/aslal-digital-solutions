import { RichContent } from "@/components/RichContent";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";
import { marketingServices } from "@/lib/marketing-services";
import { getWebsiteSettings } from "@/lib/website-settings";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import { ServicePackageBuilder } from "@/components/ServicePackageBuilder";

export const revalidate = 60;

export default async function ServicesPage() {
  const [content,settings] = await Promise.all([getPageContent("/services"),getWebsiteSettings(resolvePublicWorkspaceId())]);
  return <main>
    <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal relative z-10"><div className="max-w-4xl">
      <div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">{contentValue(content,"hero.eyebrow","Solutions")}</div>
      <h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","One growth system. Multiple capabilities.")}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75" style={contentStyle(content,"hero.body",18)}><RichContent content={content} keyName="hero.body" fallback="Explore a capability, understand the outcome, then request the right next step." /></p>
    </div></div></section>
    <ServicePackageBuilder packages={settings.servicePackages}/><section className="py-24"><div className="container-aslal">
      <SectionTitle eyebrow={contentValue(content,"list.eyebrow","What we build")} title={contentValue(content,"list.title","Technology and marketing connected around outcomes.")}/><Link href="/services/packages" className="mt-6 inline-flex rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B]">Explore Aslal Growth Packages →</Link>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{marketingServices.map((item,i)=><article key={item.slug} className="interactive-card rounded-3xl border border-slate-200 bg-white p-7">
        <div className="relative z-10 text-xs font-black text-[#E2B02A]">{String(i+1).padStart(2,"0")}</div>
        <h2 className="relative z-10 mt-7 text-2xl font-black">{item.name}</h2>
        <p className="relative z-10 mt-3 leading-7 text-slate-600">{item.description}</p>
        <Link href={`/services/${item.slug}`} className="relative z-10 mt-7 inline-flex font-bold text-[#0F3E8A] hover:text-[#E2B02A]">Explore More →</Link>
      </article>)}</div>
      <div className="mt-14 interactive-card rounded-[2rem] bg-[#F8FAFC] p-8 sm:p-12"><h2 className="relative z-10 text-3xl font-black" style={contentStyle(content,"builder.title",32)}>{contentValue(content,"builder.title","Not sure what you need?")}</h2><p className="relative z-10 mt-3 max-w-2xl leading-7 text-slate-600" style={contentStyle(content,"builder.body",16)}><RichContent content={content} keyName="builder.body" fallback="Use our growth system builder and we&apos;ll turn your goals into a practical starting point." /></p><Link href="/growth-builder" className="glow-button relative z-10 mt-7 inline-block rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] hover:bg-[#ebd05d]">Build my growth system →</Link></div>
    </div></section>
  </main>;
}
