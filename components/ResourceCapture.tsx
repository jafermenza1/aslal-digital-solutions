"use client";
import { useEffect, useState, type FormEvent } from "react";

export function ResourceCapture({resourceId,resourceSlug,downloadUrl,cta}:{resourceId:string;resourceSlug:string;downloadUrl:string|null;cta:string}){
 const [name,setName]=useState(""),[contact,setContact]=useState(""),[channel,setChannel]=useState<"WEB"|"WHATSAPP"|"TELEGRAM">("WEB"),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[link,setLink]=useState<string|null>(null);\n useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("aslal_resource_profile")||"null");if(saved?.name)setName(String(saved.name));if(saved?.contact)setContact(String(saved.contact));}catch{ /* ignore invalid local profile */}},[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");
  const res=await fetch("/api/resources/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resourceId,resourceSlug,name,contact,channel})});
  const data=await res.json().catch(()=>({}));setBusy(false);
  if(!res.ok){setMessage(data.error||"Unable to request the resource.");return;}
  setLink(data.downloadUrl||downloadUrl||null);setMessage(data.deliveryMessage||"Your resource is ready.");try{localStorage.setItem("aslal_resource_profile",JSON.stringify({name,contact}))}catch{/* storage may be unavailable */}
 }
 return <div className="rounded-[2rem] border border-[#0F3E8A]/15 bg-white p-6 shadow-lg sm:p-8">
  <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Unlock the full resource</div>
  <h3 className="mt-2 text-2xl font-black">{cta}</h3>
  <p className="mt-2 text-sm leading-6 text-slate-600">Only two fields. We use the contact to deliver the resource and connect meaningful implementation intent to the Aslal sales workflow.</p>
  {link?<div className="mt-6"><a href={link} download className="inline-flex rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Download now →</a><p className="mt-3 text-xs text-slate-500">{message}</p></div>:
  <form onSubmit={submit} className="mt-6 space-y-4">
   <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]"/>
   <input required value={contact} onChange={e=>setContact(e.target.value)} placeholder="Email or Ethiopian phone number" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]"/>
   <div className="grid grid-cols-3 gap-2"><button type="button" onClick={()=>setChannel("WEB")} className={channel==="WEB"?"rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white":"rounded-xl border px-3 py-2 text-xs font-bold"}>Web</button><button type="button" onClick={()=>setChannel("WHATSAPP")} className={channel==="WHATSAPP"?"rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white":"rounded-xl border px-3 py-2 text-xs font-bold"}>WhatsApp</button><button type="button" onClick={()=>setChannel("TELEGRAM")} className={channel==="TELEGRAM"?"rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white":"rounded-xl border px-3 py-2 text-xs font-bold"}>Telegram</button></div>
   <button disabled={busy} className="w-full rounded-full bg-[#E2B02A] px-5 py-4 font-black text-[#1E293B] disabled:opacity-50">{busy?"Preparing…":channel==="WHATSAPP"?"Send to WhatsApp →":channel==="TELEGRAM"?"Open in Telegram →":"Unlock resource →"}</button>
   {message&&<p className="text-sm text-slate-600">{message}</p>}
  </form>}
 </div>
}
