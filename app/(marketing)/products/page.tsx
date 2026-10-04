import Link from "next/link";
import { ArrowRight, Bot, Boxes, CheckCircle2, MessageCircle, Package, Search, Sparkles, Target, Wrench, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";
import { getWebsiteSettings } from "@/lib/website-settings";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import { PublicProductCatalog } from "@/components/PublicProductCatalog";
import { ServicePackageBuilder } from "@/components/ServicePackageBuilder";
import { marketingServices } from "@/lib/marketing-services";
import type { Metadata } from "next";

export const revalidate=60;

export async function generateMetadata():Promise<Metadata>{
 const title="Products | Aslal Digital Solutions";
 const description="Explore Aslal products, service packages and connected growth capabilities in one commerce-ready catalog.";
 const url="https://aslaldigital.com/products";
 return {title,description,alternates:{canonical:url},openGraph:{title,description,url,type:"website",siteName:"Aslal Digital Solutions"}};
}

export default async function ProductsPage(){
 const workspaceId=resolvePublicWorkspaceId();
 const [content,settings,products]=await Promise.all([
   getPageContent("/products"),
   getWebsiteSettings(workspaceId),
   prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]})
 ]);
 return <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
  <section className="relative overflow-hidden bg-[#0F3E8A] py-20 text-white sm:py-28">
   <div className="absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(248,250,252,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(248,250,252,.06) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
   <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-[#E2B02A]/15 blur-3xl"/>
   <div className="container-aslal relative z-10">
    <div className="max-w-4xl"><div className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]"><Package size={15}/> ASLAL SOLUTIONS COMMERCE</div>
     <h1 className="mt-5 text-5xl font-black tracking-[-.055em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","Products, packages and services—one path to action.")}</h1>
     <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}>{contentValue(content,"hero.body","Choose a ready solution, configure a growth package, or explore a capability. Every path keeps your request connected to the Aslal commercial workflow.")}</p>
     <div className="mt-8 flex flex-wrap gap-3">
      <a href="#products" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3.5 font-black text-[#1E293B] shadow-[0_15px_45px_rgba(226,176,42,.22)]">Browse catalog <ArrowRight size={16}/></a>
      <a href="#packages" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.06] px-5 py-3.5 font-bold text-white">Build a package <Sparkles size={16}/></a>
     </div>
    </div>
    <div className="mt-12 grid gap-3 sm:grid-cols-3">
      {[[Target,"01","Choose","Product, service or package"],[Zap,"02","Configure","Select the right scope"],[CheckCircle2,"03","Act","Request, order or discuss"]].map(([I,n,t,d])=>{const Icon=I as typeof Target;return <div key={String(n)} className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur"><Icon className="text-[#E2B02A]" size={20}/><div className="mt-4 font-mono text-[9px] font-black tracking-widest text-white/35">{String(n)}</div><h2 className="mt-1 font-black">{String(t)}</h2><p className="mt-1 text-sm text-white/50">{String(d)}</p></div>})}
    </div>
   </div>
  </section>

  <section id="products" className="scroll-mt-24 bg-[#0F172A] py-16 sm:py-20">
   <div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="font-mono text-[10px] font-black tracking-[.24em] text-[#E2B02A]">01 · READY SOLUTIONS</span><h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Products that can move into action.</h2><p className="mt-4 max-w-2xl text-white/50">Explore published products and services. Open any offer for details and the correct next workflow.</p></div><div className="inline-flex items-center gap-2 text-xs font-bold text-white/40"><Search size={15}/> Catalog</div></div>
    <div className="mt-8"><PublicProductCatalog products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,providerName:p.providerName,relationshipType:p.relationshipType,tagline:p.tagline,shortDescription:p.shortDescription,benefits:p.benefits,imageUrl:p.imageUrl,featured:p.featured}))}/></div>
   </div>
  </section>

  <section id="packages" className="scroll-mt-24 bg-[#070C18] py-20 sm:py-24">
   <div className="container-aslal"><div className="max-w-3xl"><span className="font-mono text-[10px] font-black tracking-[.24em] text-[#E2B02A]">02 · GROWTH PACKAGES</span><h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Choose the operating level. Then make it yours.</h2><p className="mt-4 text-lg leading-8 text-white/50">Packages are structured commercial starting points. Selecting a package creates a controlled order request with the selected scope so Aslal can qualify it and continue through quotation and order confirmation.</p></div><div className="mt-10"><ServicePackageBuilder packages={settings.servicePackages} workspaceId={workspaceId}/></div></div>
  </section>

  <section id="services" className="scroll-mt-24 bg-[#F8FAFC] py-20">
   <div className="container-aslal">
    <div className="max-w-3xl"><span className="font-mono text-[10px] font-black tracking-[.24em] text-[#0F3E8A]">03 · CAPABILITIES</span><h2 className="mt-3 text-4xl font-black sm:text-5xl">Need a capability before choosing a package?</h2><p className="mt-4 text-lg leading-8 text-slate-500">Explore individual capabilities when you already know the work you need. Each capability leads to its own contextual request workflow.</p></div>
    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
     {marketingServices.map((item,i)=><Link key={item.slug} href={"/services/"+item.slug} className="group rounded-[1.7rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-[0_20px_60px_rgba(15,62,138,.10)]">
       <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-black tracking-widest text-[#0F3E8A]">0{(i%9)+1}</span><Wrench className="text-[#0F3E8A]" size={19}/></div><h3 className="mt-7 text-2xl font-black group-hover:text-[#0F3E8A]">{item.name}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{item.description}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Explore capability <ArrowRight size={15}/></span>
     </Link>)}
    </div>
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      <Link href="/growth-builder" className="rounded-2xl bg-[#0F3E8A] p-6 text-white transition hover:-translate-y-1"><Bot className="text-[#E2B02A]" size={22}/><h3 className="mt-4 font-black">Not sure?</h3><p className="mt-2 text-sm leading-6 text-white/60">Let the Growth Builder map your starting point.</p></Link>
      <Link href="/wanted" className="rounded-2xl bg-[#1E293B] p-6 text-white transition hover:-translate-y-1"><Boxes className="text-[#E2B02A]" size={22}/><h3 className="mt-4 font-black">Need something custom?</h3><p className="mt-2 text-sm leading-6 text-white/60">Publish demand and let the network respond.</p></Link>
      <Link href="/telegram" className="rounded-2xl bg-[#0F3E8A] p-6 text-white transition hover:-translate-y-1"><MessageCircle className="text-[#E2B02A]" size={22}/><h3 className="mt-4 font-black">Prefer conversation?</h3><p className="mt-2 text-sm leading-6 text-white/60">Start in Telegram and keep human handoff available.</p></Link>
    </div>
   </div>
  </section>
 </main>;
}
