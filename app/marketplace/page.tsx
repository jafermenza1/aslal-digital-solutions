import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import { MarketplaceExchange } from "@/components/MarketplaceExchange";

export const dynamic="force-dynamic";

export default async function MarketplacePage(){
 const workspaceId=resolvePublicWorkspaceId();
 const listings=await prisma.commercialListing.findMany({
  where:{workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},
  orderBy:[{featured:"desc"},{publishedAt:"desc"}],
  include:{product:{select:{name:true,kind:true,shortDescription:true,imageUrl:true,startingPrice:true}}},
 });
 return <main className="min-h-screen bg-[var(--ui-canvas)]"><div className="container-aslal py-6"><div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"><div><div className="text-sm font-black text-slate-900">Business owner or professional?</div><div className="text-xs text-slate-500">Apply to list your products or services. Approved submissions appear in the public marketplace.</div></div><Link href="/business/apply" className="rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white">Apply to list</Link></div></div><MarketplaceExchange listings={listings.map(x=>({
  id:x.id,slug:x.slug,title:x.title,listingType:x.listingType,category:x.category,
  description:x.description,location:x.location,askingPrice:x.askingPrice?.toString()||null,
  currency:x.currency,priceLabel:x.priceLabel,inspectionRequired:x.inspectionRequired,
  featured:x.featured,product:x.product?{...x.product,startingPrice:x.product.startingPrice?.toString()||null}:null
 }))}/></main>;
}

export const metadata:Metadata={
 title:"Marketplace | Aslal Digital Solutions",
 description:"Discover products, services, equipment, property and commercial assets through the Aslal exchange.",
 alternates:{canonical:"https://aslaldigital.com/marketplace"},
 openGraph:{title:"Marketplace | Aslal Digital Solutions",description:"Discover products, services, equipment, property and commercial assets through the Aslal exchange.",url:"https://aslaldigital.com/marketplace",type:"website"}
};
