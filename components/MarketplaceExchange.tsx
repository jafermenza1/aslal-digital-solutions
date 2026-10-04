"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Building2, HeartPulse, MapPin, Package,
  Search, ShieldCheck, Sparkles, Store, Wrench, Zap
} from "lucide-react";

type Listing={
 id:string;slug:string;title:string;listingType:"PRODUCT"|"SERVICE"|"ASSET"|"PROPERTY";
 category:string;description:string|null;location:string|null;askingPrice:string|null;
 currency:string;priceLabel:string|null;inspectionRequired:boolean;featured:boolean;
 product:{name:string;kind:string;shortDescription:string|null;imageUrl:string|null;startingPrice:string|null}|null;
};

const categoryIcon=(listing:Listing)=>{
 const text=(listing.category+" "+listing.title+" "+(listing.description||"")).toLowerCase();
 if(listing.listingType==="PROPERTY"||/real estate|property|house|land|apartment|villa|building/.test(text)) return Building2;
 if(/medical|hospital|clinic|laboratory|diagnostic|surgical|health/.test(text)) return HeartPulse;
 if(listing.listingType==="ASSET") return Package;
 if(listing.listingType==="SERVICE") return Wrench;
 return Store;
};
const kindLabel=(type:Listing["listingType"])=>({PRODUCT:"PRODUCT",SERVICE:"SERVICE",ASSET:"ASSET",PROPERTY:"PROPERTY"}[type]);

export function MarketplaceExchange({listings}:{listings:Listing[]}){
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState("ALL");
 const [location,setLocation]=useState("ALL");
 const locations=useMemo(()=>["ALL",...Array.from(new Set(listings.map(x=>x.location).filter(Boolean) as string[])).slice(0,8)],[listings]);
 const filters=[
  ["ALL","Everything"],["PRODUCT","Products"],["SERVICE","Services"],["PROPERTY","Real estate"],["ASSET","Assets"],["MEDICAL","Medical equipment"]
 ];
 const visible=useMemo(()=>{
  const q=query.trim().toLowerCase();
  return listings.filter(x=>{
   const hay=(x.title+" "+x.category+" "+(x.description||"")+" "+(x.location||"")).toLowerCase();
   const medical= /medical|hospital|clinic|laboratory|diagnostic|surgical|health/.test(hay);
   const typeOk=filter==="ALL"||(filter==="MEDICAL"?medical:x.listingType===filter);
   return typeOk&&(location==="ALL"||x.location===location)&&(!q||hay.includes(q));
  });
 },[filter,location,query,listings]);

 return <main className="marketplace-page min-h-screen overflow-hidden bg-[#070C18] text-[#F8FAFC]">
  <section className="marketplace-hero relative">
   <div className="marketplace-hero-grid" aria-hidden="true"/>
   <div className="container-aslal relative z-10 py-16 sm:py-20 lg:py-24">
    <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_.95fr]">
     <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/30 bg-white/[.045] px-4 py-2 font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A] backdrop-blur-xl"><Store size={14}/> ASLAL COMMERCE EXCHANGE</div>
      <h1 className="mt-6 max-w-4xl text-[clamp(3rem,6.5vw,6.8rem)] font-black leading-[.9] tracking-[-.065em]">Find what moves <span className="text-[#E2B02A]">business</span>.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62 sm:text-xl">Products, services, equipment, property and commercial assets—published offers connected to a real request, response and transaction workflow.</p>
      <div className="mt-8 flex flex-wrap gap-3">
       <Link href="/wanted" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] shadow-[0_16px_55px_rgba(226,176,42,.18)]">Tell us what you need <ArrowRight size={17}/></Link>
       <Link href="/telegram/catalog" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.05] px-6 py-4 font-bold text-white backdrop-blur-xl">Open catalog <ArrowRight size={17}/></Link>
      </div>
     </div>
     <div className="marketplace-hero-panel">
      <div className="flex items-start justify-between gap-4"><div><span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">EXCHANGE MAP</span><h2 className="mt-2 text-2xl font-black">One place. Different kinds of value.</h2></div><Sparkles className="text-[#E2B02A]" size={21}/></div>
      <div className="mt-6 grid grid-cols-2 gap-3">
       {[
        ["Products",Package],["Services",Wrench],["Real estate",Building2],["Medical & equipment",HeartPulse]
       ].map(([label,Icon])=><div key={label as string} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><Icon className="text-[#E2B02A]" size={20}/><div className="mt-4 text-sm font-black text-white">{label as string}</div><div className="mt-1 text-[10px] text-white/35">Discover · qualify · act</div></div>)}
      </div>
      <div className="mt-4 rounded-2xl border border-[#E2B02A]/20 bg-[#0F3E8A]/45 p-4"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#E2B02A]"><Zap size={13}/> Connected workflow</div><div className="mt-2 text-sm font-bold text-white/72">Listing → interest → request → response → agreement → commerce</div></div>
     </div>
    </div>
   </div>
  </section>

  <section className="border-y border-white/10 bg-[#0F172A] py-5">
   <div className="container-aslal">
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
     {filters.map(([value,label])=><button key={value} type="button" onClick={()=>setFilter(value)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${filter===value?"border-[#E2B02A] bg-[#E2B02A] text-[#1E293B]":"border-white/10 bg-white/[.035] text-white/55 hover:border-[#E2B02A]/50 hover:text-white"}`}>{label}</button>)}
    </div>
   </div>
  </section>

  <section className="bg-[#070C18] py-10 sm:py-14">
   <div className="container-aslal">
    <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
     <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, property, equipment, services…" className="h-14 w-full rounded-2xl border border-white/10 bg-white/[.045] pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/28 outline-none transition focus:border-[#E2B02A]/60"/></div>
     <div className="flex items-center gap-2 overflow-x-auto">
      {locations.map(x=><button key={x} type="button" onClick={()=>setLocation(x)} className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-3 text-xs font-bold ${location===x?"border-[#E2B02A]/50 bg-[#E2B02A]/10 text-[#E2B02A]":"border-white/10 bg-white/[.03] text-white/45"}`}>{x!=="ALL"&&<MapPin size={13}/>} {x==="ALL"?"All locations":x}</button>)}
     </div>
    </div>

    <div className="mt-10 flex items-end justify-between gap-4"><div><span className="font-mono text-[9px] font-black tracking-[.22em] text-[#E2B02A]">PUBLISHED EXCHANGE</span><h2 className="mt-2 text-3xl font-black sm:text-4xl">Available opportunities</h2></div><span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs font-bold text-white/45">{visible.length} shown</span></div>

    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
     {visible.map(x=>{
      const Icon=categoryIcon(x);
      const image=x.product?.imageUrl;
      return <Link key={x.id} href={"/marketplace/listings/"+x.slug} className="marketplace-card group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0F172A]">
       <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#0F3E8A] via-[#0F172A] to-[#070C18]">
        {image?<img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>:<div className="absolute inset-0 grid place-items-center"><div className="grid h-20 w-20 place-items-center rounded-3xl border border-[#E2B02A]/25 bg-[#E2B02A]/10 shadow-[0_0_55px_rgba(226,176,42,.08)]"><Icon className="text-[#E2B02A]" size={32}/></div></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070C18] via-transparent to-transparent"/>
        <div className="absolute left-4 top-4 flex gap-2"><span className="rounded-full border border-white/15 bg-[#070C18]/70 px-3 py-1 font-mono text-[9px] font-black tracking-wider text-[#E2B02A]">{kindLabel(x.listingType)}</span>{x.featured&&<span className="rounded-full bg-[#E2B02A] px-3 py-1 text-[9px] font-black text-[#1E293B]">FEATURED</span>}</div>
       </div>
       <div className="p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/35"><Icon size={12} className="text-[#E2B02A]"/>{x.category||"General"}{x.location&&<><span>·</span>{x.location}</>}</div>
        <h3 className="mt-3 line-clamp-2 text-2xl font-black tracking-tight text-white group-hover:text-[#E2B02A]">{x.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/48">{x.description||x.product?.shortDescription||"Commercial offering published through Aslal."}</p>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/10 pt-4"><div><div className="text-[9px] font-mono font-black tracking-wider text-white/30">ASKING / STARTING</div><div className="mt-1 font-black text-[#E2B02A]">{x.priceLabel||((x.askingPrice!==null?x.currency+" "+x.askingPrice:"Request quote"))}</div></div><span className="inline-flex items-center gap-1 text-xs font-black text-white/45 group-hover:text-white">Open <ArrowRight size={14}/></span></div>
        <div className="mt-4 flex flex-wrap gap-2 text-[9px] font-bold text-white/30"><span className="inline-flex items-center gap-1"><ShieldCheck size={12}/> Workflow protected</span>{x.inspectionRequired&&<span className="inline-flex items-center gap-1"><BadgeCheck size={12}/> Inspection</span>}</div>
       </div>
      </Link>
     })}
    </div>

    {!visible.length&&<div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/[.03] p-14 text-center"><Search className="mx-auto text-[#E2B02A]" size={30}/><h3 className="mt-4 text-xl font-black">Nothing matches that search yet.</h3><p className="mt-2 text-sm text-white/45">Tell Aslal what you need and the exchange can work from demand instead.</p><Link href="/wanted" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Publish a demand <ArrowRight size={15}/></Link></div>}
   </div>
  </section>

  <section className="border-t border-white/10 bg-[#0F172A] py-14">
   <div className="container-aslal grid gap-4 md:grid-cols-3">
    <Link href="/wanted" className="rounded-2xl border border-[#E2B02A]/20 bg-[#E2B02A]/[.05] p-6 transition hover:-translate-y-1 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">CANNOT FIND IT?</span><h3 className="mt-3 text-xl font-black">Publish what you need</h3><p className="mt-2 text-sm text-white/45">The exchange can match a demand even when there is no public listing yet.</p></Link>
    <Link href="/telegram/catalog" className="rounded-2xl border border-white/10 bg-white/[.03] p-6 transition hover:-translate-y-1 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">FAST STOREFRONT</span><h3 className="mt-3 text-xl font-black">Open Telegram Catalog</h3><p className="mt-2 text-sm text-white/45">A compact product and service catalog built for conversational selling.</p></Link>
    <Link href="/partner-network" className="rounded-2xl border border-white/10 bg-white/[.03] p-6 transition hover:-translate-y-1 hover:border-[#E2B02A]/50"><span className="font-mono text-[9px] font-black tracking-widest text-[#E2B02A]">PARTNER COMMERCE</span><h3 className="mt-3 text-xl font-black">Share an offer</h3><p className="mt-2 text-sm text-white/45">Partners can use attributed assets and bring qualified demand into the exchange.</p></Link>
   </div>
  </section>
 </main>;
}
