import { RichContent } from "@/components/RichContent";
import { PublicProductCatalog } from "@/components/PublicProductCatalog";
import { prisma } from "@/lib/prisma";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

export const revalidate = 60;

export async function generateMetadata(){
 const title="Products & Services | Aslal Digital Solutions";
 const description="Explore Aslal Digital Solutions products and services. Request a quote, sample, or demo.";
 const url="https://aslaldigital.com/products";
 const image="https://aslaldigital.com/og/products.png";
 return {title,description,alternates:{canonical:url},openGraph:{title,description,url,type:"website",siteName:"Aslal Digital Solutions",images:[{url,width:1200,height:630,alt:"Aslal Digital Solutions products and services"}],locale:"en_US"},twitter:{card:"summary_large_image",title,description,images:[image]}};
}


export default async function ProductsPage(){
 const content=await getPageContent("/products");
 const workspaceId=await resolvePublicWorkspaceId();
 const [products,offers]=await Promise.all([prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]}),workspaceId?prisma.catalogOffer.findMany({where:{workspaceId,status:"PUBLISHED",channels:{some:{channel:"WEBSITE",enabled:true}}},include:{product:true},orderBy:[{featured:"desc"},{displayOrder:"asc"},{title:"asc"}]}):Promise.resolve([])]);
 const catalogItems=offers.length?offers.map(o=>({id:o.id,slug:o.product?.slug||o.slug,name:o.title,kind:o.product?.kind||"SERVICE",providerName:o.product?.providerName||null,relationshipType:o.product?.relationshipType||"OWNED",tagline:o.product?.tagline||null,shortDescription:o.shortDescription||o.product?.shortDescription||"",benefits:o.product?.benefits||null,imageUrl:o.product?.imageUrl||null,featured:o.featured})):products.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,providerName:p.providerName,relationshipType:p.relationshipType,tagline:p.tagline,shortDescription:p.shortDescription,benefits:p.benefits,imageUrl:p.imageUrl,featured:p.featured}));
 return <main>
  <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal relative z-10">
   <div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal products & services</div><h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","Proven technology, local implementation, practical growth.")}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}><RichContent content={content} keyName="hero.body" fallback="Explore a solution, open its dedicated page to understand what it does, then request a quote or demo. Every request connects directly to our sales workflow." /></p></div>
   <PublicProductCatalog products={catalogItems} />
   {!products.length&&<div className="mt-10 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">The Aslal catalog is being prepared. Contact us to discuss a service or product.</div>}
  </div></section>
 </main>;
}