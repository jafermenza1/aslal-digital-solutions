import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, Grid3X3, MapPin, Search, ShieldCheck, Sparkles, Store, Tag, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

export const dynamic="force-dynamic";

export default async function MarketplacePage(){
 const workspaceId=resolvePublicWorkspaceId();
 const listings=await prisma.commercialListing.findMany({where:{workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},orderBy:[{featured:"desc"},{publishedAt:"desc"}],include:{product:{select:{name:true,kind:true,shortDescription:true,imageUrl:true,startingPrice:true}}}});
 return <main className="min-h-screen overflow-hidden bg-[#070C18] text-white">
  <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(15,62,138,.55),transparent_35%),radial-gradient(circle_at_20%_60%,rgba(226,176,42,.10),transparent_28%)] py-16 sm:py-20">
   <div className="container-aslal">
    <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
     <div className="max-w-4xl"><div className="flex items-center gap-3 font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]"><Store size={15}/> ASLAL COMMERCE NETWORK <span className="h-1.5 w-1.5 rounded-full bg-[#E2B02A] shadow-[0_0_14px_#E2B02A]"/></div><h1 className="mt-5 text-5xl font-black tracking-[-.05em] sm:text-6xl">Discover. Compare. <span className="text-[#E2B02A]">Act.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">A high-trust commercial place for products, services and offers published through the Aslal network.</p></div>
     <Link href="/wanted" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#070C18] shadow-[0_12px_40px_rgba(226,176,42,.18)] transition hover:-translate-y-1">I want something else <ArrowRight size={17}/></Link>
    </div>
    <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.045] px-5 py-4"><Search size={18} className="text-white/35"/><span className="text-sm text-white/35">Search products, services, offers…</span></div>
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.045] px-5 py-4 text-xs font-bold text-white/55"><Grid3X3 size={16}/> Categories</div>
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.045] px-5 py-4 text-xs font-bold text-white/55"><MapPin size={16}/> Ethiopia</div>
    </div>
   </div>
  </section>
  <section className="bg-[#0F172A] py-10">
   <div className="container-aslal">
    <div className="mb-7 flex items-center justify-between"><div><span className="font-mono text-[9px] font-black tracking-[.22em] text-[#E2B02A]">LIVE INVENTORY</span><h2 className="mt-2 text-2xl font-black">Available now</h2></div><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-xs font-bold text-white/45">{listings.length} offers</span></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
     {listings.map(x=><Link key={x.id} href={"/marketplace/listings/"+x.slug} className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#070C18] transition duration-300 hover:-translate-y-1 hover:border-[#E2B02A]/45 hover:shadow-[0_20px_60px_rgba(30,41,59,.28)]">
       <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#0F3E8A] to-[#0F172A]">{x.product?.imageUrl?<img src={x.product.imageUrl} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"/>:<div className="grid h-full place-items-center"><Sparkles size={38} className="text-[#E2B02A]/60"/></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#070C18] via-transparent to-transparent"/><span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#070C18]/70 px-3 py-1 font-mono text-[9px] font-black tracking-wider text-[#E2B02A]">{x.listingType}</span>{x.featured&&<span className="absolute right-4 top-4 rounded-full bg-[#E2B02A] px-3 py-1 text-[9px] font-black text-[#070C18]">FEATURED</span>}</div>
       <div className="p-6"><div className="flex items-center gap-2 text-[10px] font-bold text-white/35"><Tag size={12}/>{x.category||"General"}</div><h3 className="mt-3 text-xl font-black">{x.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{x.description||x.product?.shortDescription||"Commercial offering."}</p><div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="font-black text-[#E2B02A]">{x.priceLabel||x.product?.startingPrice||"Request quote"}</span><span className="inline-flex items-center gap-1 text-xs font-black text-white/45 group-hover:text-white">View <ArrowRight size={14}/></span></div><div className="mt-4 flex items-center gap-3 text-[9px] font-bold text-white/30"><span className="inline-flex items-center gap-1"><ShieldCheck size={12}/> Aslal workflow</span><span className="inline-flex items-center gap-1"><BadgeCheck size={12}/> Published</span><span className="inline-flex items-center gap-1"><Zap size={12}/> Fast path</span></div></div>
     </Link>)}
    </div>
    {!listings.length&&<div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[.03] p-16 text-center"><Bot className="mx-auto text-[#E2B02A]" size={30}/><h3 className="mt-4 text-xl font-black">The network is waiting for its next offer.</h3><p className="mt-2 text-sm text-white/45">If you are looking for something specific, publish a wanted request.</p><Link href="/wanted" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#070C18]">Publish what I need <ArrowRight size={15}/></Link></div>}
   </div>
  </section>
  <section className="border-t border-white/10 bg-[#070C18] py-12"><div className="container-aslal"><div className="grid gap-3 md:grid-cols-3"><Link href="/wanted" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">DEMAND</span><h3 className="mt-2 font-black text-white">Wanted</h3><p className="mt-1 text-xs text-white/40">Publish what you need.</p></Link><Link href="/partner-network" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">PARTNER</span><h3 className="mt-2 font-black text-white">Join the network</h3><p className="mt-1 text-xs text-white/40">For influencers, agents and resellers.</p></Link><Link href="/partner" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">BUSINESS</span><h3 className="mt-2 font-black text-white">Grow through partners</h3><p className="mt-1 text-xs text-white/40">For business owners and SMEs.</p></Link></div><div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-black tracking-wider text-white/30"><span>VERIFIED WORKFLOW</span><span>•</span><span>ATTRIBUTED COMMERCE</span><span>•</span><span>HUMAN SUPPORT</span><span>•</span><span>ETHIOPIA FIRST</span></div></div></section>
 </main>;
}
export const metadata: Metadata = { title: "Marketplace | Aslal Digital Solutions", description: "Discover products, services and commercial offers from the Aslal network.", alternates: { canonical: "https://aslaldigital.com/marketplace" }, openGraph: { title: "Marketplace | Aslal Digital Solutions", description: "Discover products, services and commercial offers from the Aslal network.", url: "https://aslaldigital.com/marketplace", type: "website" } };
