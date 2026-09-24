import { PublicProductCatalog } from "@/components/PublicProductCatalog";
import { prisma } from "@/lib/prisma";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = { title: "Products & Services | Aslal Digital Solutions", description: "Explore Aslal Digital Solutions products and services, with clear offers and direct request paths.", metadataBase: new URL(siteConfig.url), openGraph: { title: "Products & Services | Aslal Digital Solutions", description: "Explore Aslal Digital Solutions products and services. Request a quote or demo.", url: `${siteConfig.url}/products`, siteName: siteConfig.name, type: "website", images: [{ url: `${siteConfig.url}/api/og/products`, width: 1200, height: 630, alt: "Aslal Digital Solutions products and services" }] }, twitter: { card: "summary_large_image", title: "Products & Services | Aslal Digital Solutions", description: "Explore Aslal Digital Solutions products and services. Request a quote or demo.", images: [`${siteConfig.url}/api/og/products`] } };


export default async function ProductsPage(){
 const content=await getPageContent("/products");
 const products=await prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}]});
 return <main>
  <section className="hero-glow bg-[#0F3E8A] py-24 text-white"><div className="container-aslal relative z-10">
   <div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal products & services</div><h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","Proven technology, local implementation, practical growth.")}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}>{contentValue(content,"hero.body","Explore a solution, open its dedicated page to understand what it does, then request a quote or demo. Every request connects directly to our sales workflow.")}</p></div>
   <PublicProductCatalog products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,providerName:p.providerName,relationshipType:p.relationshipType,tagline:p.tagline,shortDescription:p.shortDescription,benefits:p.benefits,imageUrl:p.imageUrl,featured:p.featured}))} />
   {!products.length&&<div className="mt-10 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">The Aslal catalog is being prepared. Contact us to discuss a service or product.</div>}
  </div></section>
 </main>;
}