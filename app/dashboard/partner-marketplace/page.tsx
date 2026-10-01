"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";

type Offer={id:string;name:string;description:string|null;admissionMode:string;business:{name:string;slug:string};profile:any;terms:any;joined:boolean;eligible:boolean;trust:any;participantCount:number};
export default function PartnerMarketplacePage(){
 const [offers,setOffers]=useState<Offer[]>([]); const [q,setQ]=useState(""); const [category,setCategory]=useState(""); const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);const p=new URLSearchParams();if(q)p.set("q",q);if(category)p.set("category",category);const r=await fetch("/api/partner/marketplace?"+p);const j=await r.json();setOffers(j.programs||[]);setLoading(false)};
 useEffect(()=>{load()},[category]);
 const categories=useMemo(()=>[...new Set(offers.map(o=>o.profile?.category).filter(Boolean))] as string[],[offers]);
 return <main className="mx-auto max-w-7xl px-6 py-10">
  <div className="mb-8"><p className="text-sm font-medium opacity-70">PARTNER NETWORK</p><h1 className="text-3xl font-semibold mt-1">Partner Marketplace</h1><p className="mt-2 max-w-2xl opacity-70">Discover published partner programs from independent businesses and manage your participation from one account.</p></div>
  <div className="flex flex-wrap gap-3 mb-8"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search programs, businesses..." className="min-w-[260px] flex-1 rounded-xl border px-4 py-3 bg-transparent"/><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border px-4 py-3 bg-transparent"><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select><button onClick={load} className="rounded-xl px-5 py-3 border font-medium">Search</button></div>
  {loading?<p className="opacity-70">Loading programs…</p>:<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{offers.map(o=><article key={o.id} className="rounded-2xl border p-5">
   <div className="flex items-start justify-between gap-3"><div><div className="text-xs opacity-60">{o.profile?.category||"General"}</div><h2 className="text-xl font-semibold mt-1">{o.name}</h2><p className="text-sm opacity-60 mt-1">{o.business.name}</p></div>{o.profile?.featured&&<span className="text-xs rounded-full px-2 py-1 border">Featured</span>}</div>
   <p className="mt-4 text-sm opacity-75 line-clamp-3">{o.profile?.offerSummary||o.description||"Partner opportunity"}</p>
   <div className="mt-4 text-sm"><strong>{o.terms?.currency||"ETB"}</strong> · {o.terms?.payoutSchedule||"Manual payout"} · {o.terms?.attributionWindowDays??30}d attribution</div>
   <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full border px-2 py-1">Published</span>{o.trust.activeTerms&&<span className="rounded-full border px-2 py-1">Active terms</span>}{o.trust.businessActive&&<span className="rounded-full border px-2 py-1">Active business</span>}</div>
   <Link href={"/dashboard/partner-marketplace/"+o.id} className="mt-5 inline-flex rounded-xl border px-4 py-2 text-sm font-medium">View offer</Link>
  </article>)}</div>}
 </main>
}
