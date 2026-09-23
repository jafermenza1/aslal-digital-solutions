"use client";
import { useState } from "react";

export function EmailTemplateEditor({initial}:{initial:{id:string;name:string;subjectTemplate:string;htmlTemplate:string;textTemplate:string;active:boolean}}){
 const [state,setState]=useState(initial),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice("");
  const r=await fetch("/api/admin/email-templates/"+state.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...state,reason:"Updated contact auto-reply template"})});
  const j=await r.json().catch(()=>({}));setNotice(r.ok?"Template saved and will be used for new contact acknowledgements.":j.error||"Unable to save template.");setBusy(false);
 }
 const vars=["{{name}}","{{serviceOrProduct}}","{{message}}","{{companyOrType}}","{{leadId}}","{{contactUrl}}","{{logoUrl}}","{{location}}","{{phone}}","{{email}}"];
 return <form onSubmit={save} className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 sm:p-7">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">Transactional email</div><h2 className="mt-2 text-2xl font-black">{state.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Rich HTML acknowledgement for a submitted contact request. It is not a marketing campaign.</p></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={state.active} onChange={e=>setState({...state,active:e.target.checked})}/> Active</label></div>
  <div className="mt-5 rounded-2xl bg-white/[.04] p-4 text-xs leading-6 text-white/55"><b className="text-white">Variables:</b> {vars.join(" · ")}</div>
  <div className="mt-5 grid gap-4"><label className="text-sm font-bold">Subject<input value={state.subjectTemplate} onChange={e=>setState({...state,subjectTemplate:e.target.value})} maxLength={250} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-white"/></label>
  <label className="text-sm font-bold">HTML template<textarea value={state.htmlTemplate} onChange={e=>setState({...state,htmlTemplate:e.target.value})} rows={18} className="mt-2 w-full rounded-xl border border-white/10 bg-[#061a15] px-4 py-3 font-mono text-xs text-white"/></label>
  <label className="text-sm font-bold">Plain-text fallback<textarea value={state.textTemplate} onChange={e=>setState({...state,textTemplate:e.target.value})} rows={10} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 font-mono text-xs text-white"/></label></div>
  {notice&&<div className="mt-4 rounded-xl bg-white/[.05] p-3 text-sm">{notice}</div>}
  <button disabled={busy} className="mt-5 rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B]">{busy?"Saving…":"Save template"}</button>
 </form>;
}