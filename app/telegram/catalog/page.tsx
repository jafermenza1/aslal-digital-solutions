"use client";
import Image from "next/image";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,Search,SlidersHorizontal,X} from "lucide-react";
import {useRouter} from "next/navigation";
type Workspace={id:string;name:string;slug:string};
type Item={id:string;workspaceId:string;name?:string;title?:string;slug:string;description?:string|null;preview?:string;shortDescription?:string;tagline?:string|null;imageUrl?:string|null;media:string[];startingPrice?:string|null;ctaLabel?:string|null;cta?:string;kind?:string;category?:string;specifications?:Record<string,unknown>|null;relationshipType:string;providerName?:string|null;featured?:boolean;stockQuantity?:number|null;search?:{directAnswer?:string;localContext?:string}};
const money=(v:string|null|undefined)=>v||"Price on request";
function initialQueryValue(key:string,storageKey:string){if(typeof window==="undefined")return "";const p=new URLSearchParams(window.location.search);return p.get(key)||sessionStorage.getItem(storageKey)||"";}
export default function TelegramCatalogPage(){
 const router=useRouter();
 const [items,setItems]=useState<{products:Item[];resources:Item[]}>({products:[],resources:[]});
 const [workspaces,setWorkspaces]=useState<Workspace[]>([]);
 const [selectedWorkspace,setSelectedWorkspace]=useState("ALL");
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [query,setQuery]=useState(""),[category,setCategory]=useState("All"),[sort,setSort]=useState("featured");
 const [selected,setSelected]=useState<Item|null>(null);
 const [workspaceId,setWorkspaceId]=useState(()=>initialQueryValue("workspaceId","aslal_telegram_workspace_id"));
 const [campaignId]=useState(()=>initialQueryValue("campaignId","aslal_telegram_campaign_id"));
 const [showStock,setShowStock]=useState(false);

 useEffect(()=>{
  const p=new URLSearchParams(window.location.search),explicit=p.get("workspaceId")||"",campaign=p.get("campaignId")||"";
  const queryString=explicit?"?workspaceId="+encodeURIComponent(explicit)+(campaign?"&campaignId="+encodeURIComponent(campaign):""):(campaign?"?campaignId="+encodeURIComponent(campaign):"");
  fetch("/api/telegram/catalog"+queryString)
   .then(r=>r.ok?r.json():r.json().then(d=>Promise.reject(new Error(d.error||"Catalog unavailable"))))
   .then(d=>{
    const w=String(d.workspaceId||"");setWorkspaceId(w);setSelectedWorkspace(w||"ALL");setWorkspaces(d.workspaces||[]);
    if(w)sessionStorage.setItem("aslal_telegram_workspace_id",w);
    if(campaign)sessionStorage.setItem("aslal_telegram_campaign_id",campaign);
    setItems({products:d.products||[],resources:d.resources||[]});setShowStock(Boolean(d.showStock));
   }).catch(e=>setError(e instanceof Error?e.message:"Catalog unavailable")).finally(()=>setLoading(false));
  const s=document.createElement("script");s.src="https://telegram.org/js/telegram-web-app.js";s.async=true;
  s.onload=()=>{const tg=(window as any).Telegram?.WebApp;if(tg){tg.ready();tg.expand();const initData=String(tg.initData||"");const identityWorkspace=explicit||sessionStorage.getItem("aslal_telegram_workspace_id")||"";if(initData&&identityWorkspace){void fetch("/api/telegram/identity",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId:identityWorkspace,initData,event:"CATALOG_OPENED"})}).catch(()=>null);}}};
  document.head.appendChild(s);return()=>s.remove();
 },[]);

 const products=useMemo(()=>items.products,[items.products]);
 useEffect(()=>{
  const q=query.trim();if(!q||!workspaceId)return;
  const t=setTimeout(()=>{void fetch("/api/catalog/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId,query:q,source:"TELEGRAM_CATALOG",locale:document.documentElement.lang||"en",resultsCount:products.length})}).catch(()=>null)},700);
  return()=>clearTimeout(t);
 },[query,workspaceId,products.length]);

 const categories=useMemo(()=>["All",...Array.from(new Set(products.map(x=>x.category||"Products")))], [products]);
 const visible=useMemo(()=>products.filter(x=>(category==="All"||x.category===category)&&((x.name||"")+" "+(x.shortDescription||x.description||"")).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="price"?(parseFloat((a.startingPrice||"").replace(/[^0-9.]/g,""))||999999)-(parseFloat((b.startingPrice||"").replace(/[^0-9.]/g,""))||999999):sort==="name"?(a.name||"").localeCompare(b.name||""):Number(Boolean(b.featured))-Number(Boolean(a.featured))),[products,category,query,sort]);

 const selectWorkspace=async(id:string)=>{
  setSelectedWorkspace(id);setLoading(true);setError("");
  try{const q=id!=="ALL"?"?workspaceId="+encodeURIComponent(id)+(campaignId?"&campaignId="+encodeURIComponent(campaignId):""):(campaignId?"?campaignId="+encodeURIComponent(campaignId):"");const r=await fetch("/api/telegram/catalog"+q);const d=await r.json();if(!r.ok)throw new Error(d.error||"Catalog unavailable");setWorkspaceId(String(d.workspaceId||""));setItems({products:d.products||[],resources:d.resources||[]});}
  catch(e){setError(e instanceof Error?e.message:"Catalog unavailable")}finally{setLoading(false)}
 };
 const trackProductView=(item:Item)=>{const tg=(window as any).Telegram?.WebApp,initData=String(tg?.initData||"");if(initData&&item.workspaceId)void fetch("/api/telegram/identity",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId:item.workspaceId,initData,event:"PRODUCT_VIEW",productSlug:item.slug,metadata:{name:item.name,kind:item.kind||null}})}).catch(()=>null);};
 const openOrder=(item:Item)=>{trackProductView(item);sessionStorage.setItem("aslal_telegram_order_slug",item.slug);const q=new URLSearchParams({workspaceId:item.workspaceId||workspaceId,slug:item.slug});if(campaignId)q.set("campaignId",campaignId);router.push("/telegram/catalog/order?"+q.toString());};

 if(loading)return <main className="telegram-catalog-page"><section className="telegram-catalog-skeleton"><div/><div/><div className="grid grid-cols-2 gap-3"><i/><i/><i/><i/></div></section></main>;
 if(error)return <main className="telegram-catalog-page"><section className="rounded-3xl border border-red-300/30 bg-red-50 p-5 text-red-700">{error}</section></main>;

 return <main className="telegram-catalog-page">
  <section className="telegram-catalog-hero"><div className="telegram-hero-grid" aria-hidden="true"/><div className="relative z-10">
   <div className="flex items-center gap-2 font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]"><ShoppingBag size={14}/> ASLAL FAST CATALOG <span className="h-1.5 w-1.5 rounded-full bg-[#E2B02A] shadow-[0_0_12px_#E2B02A]"/></div>
   <h1 className="mt-4 text-3xl font-black tracking-[-.045em] text-white sm:text-4xl">Browse. Ask. Order.</h1>
   <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">A compact storefront for products and services—built to move naturally from Telegram conversation into an Aslal order request.</p>
   <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white p-2 text-[#1E293B] shadow-[0_20px_60px_rgba(7,12,24,.25)]"><Search size={18}/><input aria-label="Search products" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products and services…" className="min-w-0 flex-1 bg-transparent p-2 text-sm font-bold outline-none"/></div>
  </div></section>

  {workspaces.length>0&&<div className="telegram-filter-row">{["ALL",...workspaces.map(x=>x.id)].map(id=><button key={id} type="button" onClick={()=>{void selectWorkspace(id)}} className={selectedWorkspace===id?"active":""}>{id==="ALL"?"All workspaces":workspaces.find(w=>w.id===id)?.name}</button>)}</div>}
  <div className="telegram-filter-row">{categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)} className={category===c?"active":""}>{c}</button>)}<label className="telegram-sort"><Filter size={14}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="name">Name</option><option value="price">Price</option></select></label></div>

  <section className="telegram-catalog-content">
   <div className="flex items-end justify-between gap-3"><div><span className="font-mono text-[9px] font-black tracking-[.2em] text-[#0F3E8A] dark:text-[#E2B02A]">PRODUCT & SERVICE CATALOG</span><h2 className="mt-2 text-2xl font-black">Available now</h2></div><span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-black dark:border-white/10 dark:bg-white/5">{visible.length}</span></div>
   {visible.length===0?<div className="mt-7 rounded-3xl border border-dashed border-black/10 p-10 text-center dark:border-white/10"><Search className="mx-auto opacity-40" size={28}/><h3 className="mt-3 font-black">No matching products</h3><p className="mt-1 text-sm opacity-55">Try another search or category.</p></div>:<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{visible.map(item=><article key={item.id} className="telegram-product-card group">
    <div className="relative aspect-square overflow-hidden bg-[#0F3E8A]/10 dark:bg-white/[.04]">{item.imageUrl?<Image src={item.imageUrl} alt="" fill sizes="(max-width:640px) 50vw,33vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized/>:<div className="grid h-full place-items-center"><Box className="text-[#0F3E8A] dark:text-[#E2B02A]" size={34}/>}</div></div>
    <div className="p-3 sm:p-4"><div className="flex items-center justify-between gap-2"><span className="text-[8px] font-black uppercase tracking-wider text-[#0F3E8A] dark:text-[#E2B02A]">{item.category||item.kind||"Product"}</span>{item.featured&&<Sparkles className="text-[#E2B02A]" size={13}/>}</div><h3 className="mt-2 line-clamp-2 text-sm font-black">{item.name}</h3><div className="mt-2 text-sm font-black text-[#0F3E8A] dark:text-[#E2B02A]">{money(item.startingPrice)}</div>{showStock&&item.stockQuantity!==null&&item.stockQuantity!==undefined&&<div className="mt-1 text-[9px] font-bold opacity-50">{"Stock "+item.stockQuantity}</div>}<button type="button" onClick={()=>{trackProductView(item);setSelected(item)}} className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-xl bg-[#0F3E8A] px-2 py-2 text-[10px] font-black text-white transition hover:bg-[#E2B02A] hover:text-[#1E293B]">View <ArrowRight size={13}/></button></div>
   </article>)}</div>}
  </section>

  {items.resources.length>0&&<section className="telegram-resource-strip"><div><span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">HELPFUL RESOURCES</span><h2 className="mt-2 text-xl font-black text-white">Useful information alongside the catalog.</h2></div><div className="mt-4 grid gap-3">{items.resources.slice(0,4).map(r=><div key={r.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="flex items-center gap-2 text-xs font-black text-white"><Send size={14} className="text-[#E2B02A]"/>{r.title}</div><p className="mt-2 text-xs leading-5 text-white/45">{r.description||r.preview}</p></div>)}</div></section>}

  {selected&&<div className="fixed inset-0 z-50 grid items-end bg-[#070C18]/75 p-3 backdrop-blur-sm sm:items-center"><section className="telegram-detail mx-auto max-h-[90vh] w-full max-w-lg overflow-auto rounded-[2rem] p-5 sm:p-7"><div className="flex justify-between gap-4"><div><div className="text-[9px] font-black uppercase tracking-[.18em] text-[#0F3E8A] dark:text-[#E2B02A]">{selected.category||selected.kind}</div><h2 className="mt-1 text-2xl font-black">{selected.name}</h2></div><button type="button" onClick={()=>setSelected(null)} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/10"><X size={18}/></button></div>{selected.imageUrl&&<div className="relative mt-4 h-64 w-full"><Image src={selected.imageUrl} alt="" fill sizes="512px" className="rounded-2xl object-cover" unoptimized/></div>}<p className="mt-4 text-sm leading-6 opacity-70">{selected.description||selected.shortDescription}</p>{selected.search?.directAnswer&&<div className="mt-4 rounded-2xl bg-[#0F3E8A]/5 p-4 dark:bg-white/5"><div className="text-[9px] font-black uppercase tracking-wider text-[#0F3E8A] dark:text-[#E2B02A]">Quick answer</div><p className="mt-2 text-sm leading-6">{selected.search.directAnswer}</p></div>}{selected.search?.localContext&&<p className="mt-3 text-xs leading-5 opacity-60">{selected.search.localContext}</p>}{selected.specifications&&<dl className="mt-4 grid grid-cols-2 gap-2 text-xs">{Object.entries(selected.specifications).map(([k,v])=><div key={k} className="rounded-xl bg-black/5 p-3 dark:bg-white/5"><dt className="font-bold opacity-55">{k}</dt><dd className="mt-1 font-semibold">{String(v)}</dd></div>)}</dl>}<div className="mt-6 flex items-center justify-between gap-3"><span className="text-lg font-black">{money(selected.startingPrice)}</span><button type="button" onClick={()=>openOrder(selected)} className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Order <ArrowRight size={15}/></button></div></section></div>}
 </main>;
}
