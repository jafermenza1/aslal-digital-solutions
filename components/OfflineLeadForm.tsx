"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const channels=["Radio","Television","Outdoor / Billboard","Flyer / Brochure","Event / Exhibition","Field Agent","Direct Sales","Word of Mouth","Other Offline"];

export function OfflineLeadForm({openDefault=false}:{openDefault?:boolean}) {
 const router=useRouter();
 const [open,setOpen]=useState(openDefault),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); setBusy(true); setMessage("");
  try {
   const data=Object.fromEntries(new FormData(e.currentTarget).entries());
   const res=await fetch("/api/admin/leads/manual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
   const json=await res.json().catch(()=>({}));
   if(!res.ok) throw new Error(json.error||"Could not create offline lead.");
   setMessage("Offline lead captured and placed into the normal sales workflow.");
   (e.target as HTMLFormElement).reset(); setOpen(false); router.refresh();
  } catch(err){setMessage(err instanceof Error?err.message:"Could not create lead.");}
  finally{setBusy(false);}
 }
 return <section className="mt-6 rounded-[2rem] border border-[#0F3E8A]/10 bg-white shadow-sm">
  <button type="button" onClick={()=>setOpen(v=>!v)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
   <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Offline demand</div><h2 className="mt-2 text-xl font-black">Capture a lead from radio, event, flyer or field sales</h2><p className="mt-1 text-sm text-slate-500">It gets the same owner, next action, stage history, scoring and follow-up automation as a web lead.</p></div><span className="rounded-full bg-[#0F3E8A] px-3 py-1.5 text-xs font-black text-white">{open?"Close":"Add lead"}</span>
  </button>
  {open&&<form onSubmit={submit} className="border-t border-slate-100 p-5 sm:p-6">
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <input name="name" required placeholder="Customer name" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="company" placeholder="Company / business" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <select name="businessType" required defaultValue="" className="rounded-xl border border-slate-200 px-4 py-3"><option value="" disabled>Business type</option><option>Retail</option><option>Professional Services</option><option>Manufacturing</option><option>Hospitality</option><option>Education</option><option>Healthcare</option><option>Real Estate</option><option>Other</option></select>
    <input name="email" type="email" placeholder="Email (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <select name="leadCategory" required defaultValue="" className="rounded-xl border border-slate-200 px-4 py-3"><option value="" disabled>Offline source</option>{channels.map(x=><option key={x}>{x}</option>)}</select>
    <input name="campaign" placeholder="Campaign / promotion name" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="location" placeholder="Location / event venue" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input name="reference" placeholder="Reference / voucher / agent note" className="rounded-xl border border-slate-200 px-4 py-3"/>
   </div>
   <textarea name="message" required rows={4} placeholder="What did the customer ask for? Include product/service interest and useful context." className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3"/>
   {message&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">{message}</div>}
   <button disabled={busy} className="mt-4 rounded-full bg-[#0F3E8A] px-6 py-3 font-black text-white disabled:opacity-50">{busy?"Saving…":"Capture offline lead"}</button>
  </form>}
 </section>;
}