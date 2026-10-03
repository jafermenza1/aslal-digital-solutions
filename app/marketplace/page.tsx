import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

export const dynamic="force-dynamic";

export default async function MarketplacePage(){
 const workspaceId=resolvePublicWorkspaceId();
 const listings=await prisma.commercialListing.findMany({where:{workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},orderBy:[{featured:"desc"},{publishedAt:"desc"}],include:{product:{select:{name:true,kind:true,shortDescription:true,imageUrl:true,startingPrice:true}}}});
 return <main className="min-h-screen bg-[#F8FAFC] py-12"><div className="mx-auto max-w-7xl px-5">
  <div className="mb-10"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal Commercial Exchange</div><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Listings</h1><p className="mt-3 max-w-3xl text-slate-600">Products, services and selected assets published through the Aslal commercial engine.</p></div>
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{listings.map(x=><Link key={x.id} href={"/marketplace/listings/"+x.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">{x.listingType} · {x.category}</div><h2 className="mt-3 text-xl font-black text-slate-950">{x.title}</h2><p className="mt-2 line-clamp-3 text-sm text-slate-500">{x.description||x.product?.shortDescription||"Commercial offering."}</p><div className="mt-5 flex items-center justify-between text-sm font-bold"><span>{x.priceLabel||x.product?.startingPrice||"Request quote"}</span><span className="text-[#0F3E8A]">View →</span></div></Link>)}</div>
  {!listings.length&&<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No published commercial listings are available yet.</div>}
 </div></main>;
}
export const metadata: Metadata = { title: "Marketplace | Aslal Digital Solutions", description: "Discover published products, services and commercial offers from Aslal's business network in Ethiopia.", alternates: { canonical: "https://aslaldigital.com/marketplace" }, openGraph: { title: "Marketplace | Aslal Digital Solutions", description: "Discover published products, services and commercial offers from Aslal's business network in Ethiopia.", url: "https://aslaldigital.com/marketplace", type: "website" } };
