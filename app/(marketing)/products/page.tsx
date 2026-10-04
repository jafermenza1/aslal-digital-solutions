import Link from "next/link";
import { ArrowRight, Bot, Boxes, MessageCircle, Package, Search, Sparkles, Wrench } from "lucide-react";
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
 const description="Explore Aslal products first, then choose a structured package or individual service when you need more.";
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
  <section className="relative overflow-hidden bg-[#0F3E8A] py-16 text-white sm:py-20">
   <div className="absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(248,250,252,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(248,250,252,.06) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
   <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-[#E2B02A]/15 blur-3xl"/>
   <div className="container-aslal relative z-10">
    <div className="max-w-4xl">
     <div className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]"><Package size={15}/> ASLAL PRODUCTS</div>
     <h1 className="mt-4 text-5xl font-black tracking-[-.055em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","Find the right product. Start there.")}</h1>
     <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}>{contentValue(content,"hero.body","Browse published products and offers first. If you need a broader solution, choose a package next or explore individual services.")}</p>
     <div className="mt-7 flex flex-wrap gap-3">
      <a href="#products" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3.5 font-black text-[#1E293B] shadow-[0_15px_45px_rgba(226,176,42,.22)]">Browse products <ArrowRight size={16}/></a>
      <a href="#packages" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.06] px-5 py-3.5 font-bold text-white">View packages <Sparkles size={16}/></a>
     </div>
    </div>
   </div>
  </section>

  <section id="products" className="scroll-mt-24 bg-[#0F172A] py-14 sm:py-18">
   <div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
     <div>
      <span className="font-mono text-[10px] font-black tracking-[.24em] text-[#E2B02A]">01 · PRODUCTS</span>
      <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Published products and offers.</h2>
      <p className="mt-3 max-w-2xl text-white/55">Choose a product to see its details and the appropriate request, order, or contact workflow.</p>
     </div>
     <div className="inline-flex items-center gap-2 text-xs font-bold text-white/40"><Search size={15}/> Product catalog</div>
    </div>
    <div className="mt-7"><PublicProductCatalog products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,providerName:p.providerName,relationshipType:p.relationshipType,tagline:p.tagline,shortDescription:p.shortDescription,benefits:p.benefits,imageUrl:p.imageUrl,featured:p.featured}))}/></div>
   </div>
  </section>

  <section id="packages" className="scroll-mt-24 bg-[#070C18] py-16 sm:py-20">
   <div className="container-aslal">
    <div className="max-w-3xl">
     <span className="font-mono text-[10px] font-black tracking-[.24em] text-[#E2B02A]">02 · PACKAGES</span>
     <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">Need more than one product? Choose a package.</h2>
     <p className="mt-4 text-lg leading-8 text-white/55">Packages combine related work into a structured starting point. Select one to configure scope and continue through Aslal's request, quotation, and order workflow.</p>
    </div>
    <div className="mt-8"><ServicePackageBuilder packages={settings.servicePackages} workspaceId={workspaceId}/></div>
   </div>
  </section>

  <section id="services" className="scroll-mt-24 bg-[#F8FAFC] py-16 sm:py-20">
   <div className="container-aslal">
    <div className="max-w-3xl">
     <span className="font-mono text-[10px] font-black tracking-[.24em] text-[#0F3E8A]">03 · SERVICES</span>
     <h2 className="mt-3 text-4xl font-black sm:text-5xl">Looking for one specific capability?</h2>
     <p className="mt-3 text-lg leading-8 text-slate-500">Explore individual services when you already know exactly what you need.</p>
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
     {marketingServices.map((item,i)=><Link key={item.slug} href={"/services/"+item.slug} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-[0_20px_60px_rgba(15,62,138,.10)]">
       <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-black tracking-widest text-[#0F3E8A]">0{(i%9)+1}</span><Wrench className="text-[#0F3E8A]" size={19}/></div>
       <h3 className="mt-6 text-xl font-black group-hover:text-[#0F3E8A]">{item.name}</h3>
       <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
       <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Explore <ArrowRight size={15}/></span>
     </Link>)}
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <Link href="/growth-builder" className="rounded-2xl bg-[#0F3E8A] p-5 text-white transition hover:-translate-y-1"><Bot className="text-[#E2B02A]" size={22}/><h3 className="mt-3 font-black">Not sure?</h3><p className="mt-1 text-sm leading-6 text-white/60">Let Growth Builder suggest where to start.</p></Link>
      <Link href="/wanted" className="rounded-2xl bg-[#1E293B] p-5 text-white transition hover:-translate-y-1"><Boxes className="text-[#E2B02A]" size={22}/><h3 className="mt-3 font-black">Need something custom?</h3><p className="mt-1 text-sm leading-6 text-white/60">Publish demand for the network to respond.</p></Link>
      <Link href="/telegram" className="rounded-2xl bg-[#0F3E8A] p-5 text-white transition hover:-translate-y-1"><MessageCircle className="text-[#E2B02A]" size={22}/><h3 className="mt-3 font-black">Prefer conversation?</h3><p className="mt-1 text-sm leading-6 text-white/60">Start in Telegram with human handoff.</p></Link>
    </div>
   </div>
  </section>
 </main>;
}
