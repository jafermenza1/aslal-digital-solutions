import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/SectionTitle";

export const revalidate = 60;

function firstLines(value:string|null) {
  return (value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,3);
}
export default async function ProductsPage() {
  const products=await prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]});
  return <main>
    <section className="hero-glow bg-[#071F47] py-24 text-white">
      <div className="container-aslal">
        <SectionTitle eyebrow="Aslal catalog" title="Products, services and solutions built around your growth." description="Browse what Aslal can provide, implement, market or customize. Every item connects directly to an attributed growth request."/>
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p,index)=><Link key={p.id} href={"/products/"+p.slug} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] transition duration-300 hover:-translate-y-1 hover:bg-white/[.1]">
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#0F3E8A] to-[#071F47]">
              {p.imageUrl?<img src={p.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>:<div className="flex h-full items-end p-7"><span className="rounded-full bg-[#E2B02A] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#1E293B]">{String(p.kind)}</span></div>}
              {p.featured&&<span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">Featured</span>}
            </div>
            <div className="p-7">
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#E2B02A]">{p.providerName||"Aslal Digital Solutions"} · {p.relationshipType}</div>
              <h2 className="mt-3 text-3xl font-black">{p.name}</h2>
              {p.tagline&&<p className="mt-2 font-semibold text-white/70">{p.tagline}</p>}
              <p className="mt-4 leading-7 text-white/60">{p.shortDescription}</p>
              {firstLines(p.benefits).length>0&&<div className="mt-5 space-y-2">{firstLines(p.benefits).map(x=><div key={x} className="text-sm text-white/55">✓ {x}</div>)}</div>}
              <div className="mt-7 flex items-center justify-between gap-3"><span className="font-black text-[#E2B02A]">{p.startingPrice||"Request a quote"}</span><span className="font-black">Explore →</span></div>
            </div>
          </Link>)}
        </div>
        {!products.length&&<div className="mt-10 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">The Aslal catalog is being prepared. Contact us to discuss a service or product.</div>}
      </div>
    </section>
  </main>;
}
