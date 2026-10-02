"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product={id:string;name:string;slug:string};
type Campaign={id:string;name:string;deliveryMode:"ONLINE"|"OFFLINE"|"HYBRID";serviceAreas:Array<{id:string;name:string;areaType:"CITY"|"EVENT"}>;partners:Array<{id:string;name:string;partnerNumber:string;type:string}>};
type Props={openDefault?:boolean;products?:Product[];campaigns?:Campaign[]};

const channels=[
  ["PHONE","Phone call"],["PHYSICAL_MEETING","Physical meeting / walk-in"],["EVENT","Event / exhibition"],["FLYER","Flyer / brochure"],["RADIO","Radio campaign"],["TELEVISION","Television campaign"],["OUTDOOR","Outdoor / billboard"],["FIELD_AGENT","Field sales / agent"],["WORD_OF_MOUTH","Word of mouth"],["OTHER_OFFLINE","Other offline"],
];

export function OfflineLeadForm({openDefault=false,products=[],campaigns=[]}:Props){
 const router=useRouter();
 const [open,setOpen]=useState(openDefault),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[campaignId,setCampaignId]=useState(""),[serviceAreaId,setServiceAreaId]=useState(""),[partnerId,setPartnerId]=useState("");
 const campaign=campaigns.find(c=>c.id===campaignId);
 const areas=campaign?.serviceAreas||[];
 const partners=campaign?.partners||[];
 const requiresArea=campaign?.deliveryMode!=="ONLINE";
 const availablePartners=useMemo(()=>partners,[partners]);
 function reset(){setCampaignId("");setServiceAreaId("");setPartnerId("");}
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  try{
   const data=Object.fromEntries(new FormData(e.currentTarget).entries());
   const res=await fetch("/api/admin/leads/manual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,campaignId,serviceAreaId,partnerId,campaignName:campaign?.name||"",locationName:areas.find(a=>a.id===serviceAreaId)?.name||""})});
   const json=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(json.error||"Could not create offline lead.");
   setMessage("Lead captured and linked to the normal sales workflow.");(e.target as HTMLFormElement).reset();reset();setOpen(false);router.refresh();
  }catch(err){setMessage(err instanceof Error?err.message:"Could not create lead.");}finally{setBusy(false);}
 }
 return <section className="mt-6 rounded-[2rem] border border-[#0F3E8A]/10 bg-white shadow-sm">
  <button type="button" onClick={()=>setOpen(v=>!v)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
   <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Offline demand</div><h2 className="mt-2 text-xl font-black">Capture a phone, meeting, event or offline campaign lead</h2><p className="mt-1 text-sm text-slate-500">Select canonical campaigns, service areas and partners instead of typing names. The lead remains part of the same attribution → opportunity → quote → order workflow.</p></div><span className="rounded-full bg-[#0F3E8A] px-3 py-1.5 text-xs font-black text-white">{open?"Close":"Add lead"}</span>
  </button>
  {open&&<form onSubmit={submit} className="border-t border-slate-100 p-5 sm:p-6">
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <input name="name" required placeholder="Customer name" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="company" placeholder="Company / business" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <select name="businessType" required defaultValue="" className="rounded-xl border border-slate-200 px-4 py-3"><option value="" disabled>Business type</option>{["Retail","Professional Services","Manufacturing","Hospitality","Education","Healthcare","Real Estate","Other"].map(x=><option key={x}>{x}</option>)}</select>
    <input name="email" type="email" placeholder="Email (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <select name="leadCategory" required defaultValue="" className="rounded-xl border border-slate-200 px-4 py-3"><option value="" disabled>How did the customer arrive?</option>{channels.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    <select value={campaignId} onChange={e=>{setCampaignId(e.target.value);setServiceAreaId("");setPartnerId("");}} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Campaign / promotion (optional)</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name} · {c.deliveryMode}</option>)}</select>
    <select value={serviceAreaId} onChange={e=>setServiceAreaId(e.target.value)} disabled={!campaign||!requiresArea} required={Boolean(campaign&&requiresArea)} className="rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-50"><option value="">{campaign&&requiresArea?"Supported city / event":"Service area (select campaign first)"}</option>{areas.map(a=><option key={a.id} value={a.id}>{a.areaType}: {a.name}</option>)}</select>
    <select value={partnerId} onChange={e=>setPartnerId(e.target.value)} disabled={!campaign||availablePartners.length===0} className="rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-50"><option value="">Partner attribution (optional)</option>{availablePartners.map(p=><option key={p.id} value={p.id}>{p.name} · {p.partnerNumber}</option>)}</select>
    <select name="productId" defaultValue="" className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Product / service interest (optional)</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
   </div>
   <textarea name="message" required rows={4} placeholder="Customer request, need, product/service context, and useful sales notes." className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3"/>
   {message&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">{message}</div>}
   <button disabled={busy} className="mt-4 rounded-full bg-[#0F3E8A] px-6 py-3 font-black text-white disabled:opacity-50">{busy?"Saving…":"Capture offline lead"}</button>
  </form>}
 </section>;
}
