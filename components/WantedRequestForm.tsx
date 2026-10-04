"use client";
import { useState } from "react";
import { ArrowRight, FileText, MapPin, MessageCircle, PackageSearch, Send, Sparkles } from "lucide-react";

type FormState = { requestType:string; title:string; requestedItem:string; category:string; description:string; quantity:string; conditionPreference:string; budgetMin:string; budgetMax:string; location:string; serviceArea:string; deadline:string; organizationName:string; contactName:string; contactEmail:string; contactPhone:string; contactPreference:string };

const initial:FormState={requestType:"BUY_REQUEST",title:"",requestedItem:"",category:"",description:"",quantity:"1",conditionPreference:"NEW",budgetMin:"",budgetMax:"",location:"",serviceArea:"",deadline:"",organizationName:"",contactName:"",contactEmail:"",contactPhone:"",contactPreference:"PHONE"};

export function WantedRequestForm({workspaceId,workspaceName}:{workspaceId:string;workspaceName:string}){
 const [f,setF]=useState<FormState>(initial); const [state,setState]=useState("");
 const set=(key:keyof FormState,value:string)=>setF(x=>({...x,[key]:value}));
 const submit=async()=>{setState("Sending…");try{const r=await fetch("/api/commercial/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId,...f,source:"public-wanted"})});const d=await r.json();setState(r.ok?"Request received · Reference: "+d.requestId+" ·  Exchange matches: "+String(d.matchCount??0):(d.error||"Submission failed"));if(r.ok)setF({...initial,requestType:f.requestType});}catch{setState("Network error. Please try again.");}};
 const input="w-full rounded-xl border border-white/10 bg-[#070C18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#E2B02A]/60 focus:ring-1 focus:ring-[#E2B02A]/30";
 return <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-5 shadow-[0_25px_80px_rgba(30,41,59,.28)] backdrop-blur-xl sm:p-8">
   <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 font-mono text-[9px] font-black tracking-[.22em] text-[#E2B02A]"><PackageSearch size={14}/>{workspaceName} · ASLAL WANTED</div><h2 className="mt-3 text-3xl font-black tracking-tight text-white">Describe what you need.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">A structured request lets suitable suppliers, service providers and partners respond without turning your requirement into a messy chat.</p></div><Sparkles className="text-[#E2B02A]/70" size={28}/></div>
   <div className="mt-8 grid gap-8">
    <section><div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60"><FileText size={15} className="text-[#E2B02A]"/> What are you looking for?</div><div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold text-white/45">Request type<select value={f.requestType} onChange={e=>set("requestType",e.target.value)} className={input+" mt-2"}><option value="BUY_REQUEST">Buy a product</option><option value="ASSET_REQUEST">Find an asset</option><option value="SERVICE_REQUEST">Request a service</option><option value="RFP">Publish an RFP</option></select></label>
      <label className="text-xs font-bold text-white/45">Short title<input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. 20 office laptops" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Item / service<input value={f.requestedItem} onChange={e=>set("requestedItem",e.target.value)} placeholder="What should be supplied?" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Category<input value={f.category} onChange={e=>set("category",e.target.value)} placeholder="Technology, printing, training…" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45 sm:col-span-2">Describe the requirement<textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="Specifications, quantities, preferred brands, delivery requirements…" className={input+" mt-2 resize-y"}/></label>
    </div></section>
    <section><div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60"><MapPin size={15} className="text-[#E2B02A]"/> Budget & delivery</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-bold text-white/45">Quantity<input value={f.quantity} onChange={e=>set("quantity",e.target.value)} className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Condition<select value={f.conditionPreference} onChange={e=>set("conditionPreference",e.target.value)} className={input+" mt-2"}><option value="NEW">New</option><option value="USED">Used</option><option value="EITHER">Either</option></select></label>
      <label className="text-xs font-bold text-white/45">Budget from (ETB)<input value={f.budgetMin} onChange={e=>set("budgetMin",e.target.value)} inputMode="numeric" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Budget to (ETB)<input value={f.budgetMax} onChange={e=>set("budgetMax",e.target.value)} inputMode="numeric" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Location<input value={f.location} onChange={e=>set("location",e.target.value)} placeholder="Addis Ababa, Shashemene…" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Service area<input value={f.serviceArea} onChange={e=>set("serviceArea",e.target.value)} placeholder="Where should it be delivered?" className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45 sm:col-span-2">Needed by<input type="date" value={f.deadline} onChange={e=>set("deadline",e.target.value)} className={input+" mt-2"}/></label>
    </div></section>
    <section><div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60"><MessageCircle size={15} className="text-[#E2B02A]"/> How should we reach you?</div><div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold text-white/45">Your name<input value={f.contactName} onChange={e=>set("contactName",e.target.value)} className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Organization<input value={f.organizationName} onChange={e=>set("organizationName",e.target.value)} className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Email<input type="email" value={f.contactEmail} onChange={e=>set("contactEmail",e.target.value)} className={input+" mt-2"}/></label>
      <label className="text-xs font-bold text-white/45">Phone / Telegram<input value={f.contactPhone} onChange={e=>set("contactPhone",e.target.value)} className={input+" mt-2"}/></label>
    </div></section>
   </div>
   <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-white/30">Your request enters the controlled commercial workflow. A human can follow up when the requirement needs clarification.</p><button onClick={submit} disabled={state==="Sending…"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-3.5 text-sm font-black text-[#070C18] shadow-[0_12px_35px_rgba(226,176,42,.18)] transition hover:-translate-y-0.5 disabled:opacity-60">{state||"Publish my request"}<Send size={15}/></button></div>
 </div>;
}