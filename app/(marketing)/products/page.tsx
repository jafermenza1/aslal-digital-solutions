import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

function firstLines(value:string|null){return (value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,3);}
function contactHref(name:string,goal:string){return `/contact?product=${encodeURIComponent(name)}&goal=${encodeURIComponent(goal)}`;}

export default async function ProductsPage(){
 const products=await prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]});
 return <main>
  <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal">
   <div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal products & services</div><h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl">Proven technology, local implementation, practical growth.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Explore a solution, open its dedicated page to understand what it does, then request a quote or demo. Every request connects directly to our sales workflow.</p></div>
   <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {products.map(p=><article key={p.id} className="catalog-card group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] transition duration-300 hover:-translate-y-1 hover:border-[#E2B02A]/60 hover:bg-white/[.1]">
      <Link href={"/products/"+p.slug} className="block">
       <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#163f87] to-[#071F47]">{p.imageUrl?<img src={p.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>:<div className="flex h-full items-end p-7"><span className="rounded-full bg-[#E2B02A] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#1E293B]">{String(p.kind)}</span></div>}{p.featured&&<span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">Featured</span>}</div>
       <div className="p-7"><div className="text-xs font-black uppercase tracking-[.16em] text-[#E2B02A]">{p.providerName||"Aslal Digital Solutions"} · {p.relationshipType}</div><h2 className="catalog-title mt-3 text-3xl font-black transition-colors duration-200">{p.name}</h2>{p.tagline&&<p className="mt-2 font-semibold text-white/70">{p.tagline}</p>}<p className="mt-4 leading-7 text-white/60">{p.shortDescription}</p>{firstLines(p.benefits).length>0&&<div className="mt-5 space-y-2">{firstLines(p.benefits).map(x=><div key={x} className="text-sm text-white/55">✓ {x}</div>)}</div>}<div className="mt-7 font-black text-[#E2B02A]">Explore More →</div></div>
      </Link>
      <div className="flex flex-wrap gap-2 border-t border-white/10 px-7 pb-7 pt-4"><Link href={contactHref(p.name,"Request a quote")} className="rounded-full bg-[#E2B02A] px-4 py-2 text-xs font-black text-[#1E293B]">Request Quote</Link><Link href={contactHref(p.name,"Request a demo")} className="rounded-full border border-white/20 px-4 py-2 text-xs font-black text-white hover:border-[#E2B02A] hover:text-[#E2B02A]">Request Demo</Link></div>
    </article>)}
   </div>
   {!products.length&&<div className="mt-10 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">The Aslal catalog is being prepared. Contact us to discuss a service or product.</div>}
  </div></section>
 </main>;
}