import { PublicProductCatalog } from "@/components/PublicProductCatalog";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;


export default async function ProductsPage(){
 const products=await prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]});
 return <main>
  <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal">
   <div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal products & services</div><h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl">Proven technology, local implementation, practical growth.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Explore a solution, open its dedicated page to understand what it does, then request a quote or demo. Every request connects directly to our sales workflow.</p></div>
   <PublicProductCatalog products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,providerName:p.providerName,relationshipType:p.relationshipType,tagline:p.tagline,shortDescription:p.shortDescription,benefits:p.benefits,imageUrl:p.imageUrl,featured:p.featured}))} />
   {!products.length&&<div className="mt-10 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">The Aslal catalog is being prepared. Contact us to discuss a service or product.</div>}
  </div></section>
 </main>;
}