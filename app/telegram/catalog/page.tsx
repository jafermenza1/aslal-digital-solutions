"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

type Item={id:string;name?:string;title?:string;slug:string;description?:string|null;preview?:string;shortDescription?:string;tagline?:string|null;imageUrl?:string|null;media:string[];startingPrice?:string|null;ctaLabel?:string|null;cta?:string;kind?:string;category?:string;specifications?:Record<string,unknown>|null;relationshipType:string;providerName?:string|null};

export default function TelegramCatalogPage(){
 const [items,setItems]=useState<{products:Item[];resources:Item[]}>({products:[],resources:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selected,setSelected]=useState<Item|null>(null);
 const router=useRouter();
 const [workspaceId,setWorkspaceId]=useState("");
 const [campaignId]=useState(()=>new URLSearchParams(window.location.search).get("campaignId")||"");

 useEffect(()=>{
   const params=new URLSearchParams(window.location.search);
   const explicitWorkspaceId=params.get("workspaceId")||"";
   const campaign=params.get("campaignId")||"";
   const query=explicitWorkspaceId?"?workspaceId="+encodeURIComponent(explicitWorkspaceId)+(campaign?"&campaignId="+encodeURIComponent(campaign):""):(campaign?"?campaignId="+encodeURIComponent(campaign):"");
   fetch("/api/telegram/catalog"+query)
     .then(r=>r.ok?r.json():r.json().then(d=>Promise.reject(new Error(d.error||"Catalog unavailable"))))
     .then(d=>{
       const resolvedWorkspaceId=String(d.workspaceId||"");
       setWorkspaceId(resolvedWorkspaceId);
       if(resolvedWorkspaceId)sessionStorage.setItem("aslal_telegram_workspace_id",resolvedWorkspaceId);
       if(campaign)sessionStorage.setItem("aslal_telegram_campaign_id",campaign);
       setItems({products:d.products||[],resources:d.resources||[]});
     })
     .catch(e=>setError(e instanceof Error?e.message:"Catalog unavailable"))
     .finally(()=>setLoading(false));
 },[]);

 useEffect(()=>{
   const script=document.createElement("script");
   script.src="https://telegram.org/js/telegram-web-app.js";
   script.async=true;
   script.onload=()=>{const tg=(window as any).Telegram?.WebApp;if(tg){tg.ready();tg.expand();}};
   document.head.appendChild(script);
   return()=>{script.remove();};
 },[]);

 const openOrder=(item:Item)=>{
   if(workspaceId)sessionStorage.setItem("aslal_telegram_workspace_id",workspaceId);sessionStorage.setItem("aslal_telegram_order_slug",item.slug);
   const q=new URLSearchParams({workspaceId,slug:item.slug});
   if(campaignId)q.set("campaignId",campaignId);
   router.push("/telegram/catalog/order?"+q.toString());
 };

 if(loading)return <main className="min-h-screen bg-[#f7faf8] p-5 text-slate-700">Loading Aslal catalog…</main>;
 if(error)return <main className="min-h-screen bg-[#f7faf8] p-5 text-red-700">{error}</main>;
 if(!workspaceId)return <main className="min-h-screen bg-[#f7faf8] p-5 text-red-700">The catalog could not resolve its workspace context.</main>;

 return <main className="min-h-screen bg-[#f7faf8] p-4 pb-8 text-slate-900">
  <header className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0a5a44]">ASLAL CATALOG</div><h1 className="mt-1 text-2xl font-black">Products, services & resources</h1><p className="mt-1 text-sm text-slate-500">Explore the offer, review the details, then start an order or request.</p></header>
  <section className="grid gap-3">
   {[...items.products,...items.resources].map(item=><article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {item.imageUrl&&<img src={item.imageUrl} alt="" className="h-40 w-full object-cover"/>}{item.media?.filter(u=>/\.(mp4|webm|mov|gif)$/i.test(u)).slice(0,1).map(u=>/\.gif$/i.test(u)?<img key={u} src={u} alt="" className="h-40 w-full object-cover"/>:<video key={u} src={u} controls playsInline muted className="h-40 w-full object-cover"/>) }
    <div className="p-4"><div className="text-[10px] font-black uppercase tracking-wider text-[#0a5a44]">{item.kind||item.category}</div><h2 className="mt-1 text-lg font-black">{item.name||item.title}</h2><p className="mt-1 text-sm text-slate-600">{item.tagline||item.shortDescription||item.preview||item.description}</p>
     {item.startingPrice&&<div className="mt-3 font-black">{item.startingPrice} ETB</div>}
     <div className="mt-3 flex gap-2"><button onClick={()=>setSelected(item)} className="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold">Details</button><button onClick={()=>openOrder(item)} className="min-h-11 flex-1 rounded-xl bg-[#0a5a44] px-3 py-2 text-sm font-black text-white">{item.ctaLabel||item.cta||"Order / Request"}</button></div>
    </div>
   </article>)}
  </section>
  {selected&&<div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3" onClick={()=>setSelected(null)}><section className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase text-[#0a5a44]">{selected.kind||selected.category}</div><h2 className="mt-1 text-2xl font-black">{selected.name||selected.title}</h2></div><button onClick={()=>setSelected(null)} className="min-h-11 min-w-11 rounded-full border">×</button></div><p className="mt-4 leading-7 text-slate-600">{selected.description||selected.shortDescription||selected.preview}</p>{selected.specifications&&<div className="mt-5"><h3 className="font-black">Specifications</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-sm">{Object.entries(selected.specifications).map(([k,v])=><div key={k} className="rounded-xl bg-slate-50 p-3"><dt className="font-bold text-slate-500">{k}</dt><dd className="mt-1">{String(v)}</dd></div>)}</dl></div>}<button onClick={()=>openOrder(selected)} className="mt-5 min-h-12 w-full rounded-xl bg-[#0a5a44] px-4 py-3 font-black text-white">{selected.ctaLabel||selected.cta||"Start order / request"}</button></section></div>}
 </main>;
}
