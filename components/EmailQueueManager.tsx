"use client";

import { useMemo, useState } from "react";

type Row={id:string;status:string;messageType:string;recipientAddress:string;subject:string;templateKey:string|null;failureReason:string|null;attemptCount:number;maxAttempts:number;nextAttemptAt:string|null;createdAt:string;updatedAt:string;leadId:string|null};

export function EmailQueueManager({initial}:{initial:Row[]}) {
  const [rows,setRows]=useState(initial);
  const [selected,setSelected]=useState<Row|null>(initial[0]||null);
  const [subject,setSubject]=useState(initial[0]?.subject||"");
  const [textBody,setTextBody]=useState("");
  const [htmlBody,setHtmlBody]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");

  const needsAttention=useMemo(()=>rows.filter(r=>r.status==="FAILED"||r.status==="DRAFT"),[rows]);
  function open(row:Row){setSelected(row);setSubject(row.subject);setNotice("");load(row.id);}
  async function load(id:string){
    const res=await fetch("/api/admin/email-outbox/"+id);
    const data=await res.json().catch(()=>({}));
    if(res.ok){setTextBody(data.email.textBody||"");setHtmlBody(data.email.htmlBody||"");}
  }
  async function update(action:"save"|"send"|"discard"){
    if(!selected)return;
    setBusy(true);setNotice("");
    try{
      if(action==="save"){
        const res=await fetch("/api/admin/email-outbox/"+selected.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject,textBody,htmlBody})});
        const data=await res.json().catch(()=>({})); if(!res.ok)throw new Error(data.error||"Unable to save draft.");
        setRows(old=>old.map(r=>r.id===selected.id?{...r,...data.email,status:"DRAFT"}:r)); setSelected(s=>s?{...s,...data.email,status:"DRAFT"}:s); setNotice("Saved as draft. It will not send until you choose Send.");
      }else{
        const endpoint=action==="send"?"/retry":"/discard";
        const res=await fetch("/api/admin/email-outbox/"+selected.id+endpoint,{method:"POST"});
        const data=await res.json().catch(()=>({})); if(!res.ok)throw new Error(data.error||"Unable to update message.");
        if(action==="send"){setNotice(data.result?.status==="SENT"?"Email sent successfully.":"Email returned to the queue for provider retry.");}
        else setNotice("Message discarded and will not be sent.");
        window.location.reload();
      }
    }catch(e){setNotice(e instanceof Error?e.message:"Email action failed.");}
    finally{setBusy(false);}
  }
  return <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
    <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><div className="flex items-center justify-between"><div><div className="dashboard-kicker">EMAIL OPERATIONS</div><h2 className="text-xl font-black">Outbox</h2></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{needsAttention.length} attention</span></div><p className="mt-2 text-xs leading-5 text-slate-500">Every automated message is stored before provider delivery. Failed messages remain editable.</p></div>
      <div className="max-h-[720px] overflow-y-auto">{rows.map(row=><button key={row.id} onClick={()=>open(row)} className={"w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 "+(selected?.id===row.id?"bg-blue-50":"")}><div className="flex items-center justify-between gap-3"><strong className="truncate text-sm">{row.subject}</strong><span className={"rounded-full px-2 py-1 text-[10px] font-black "+(row.status==="FAILED"?"bg-red-100 text-red-700":row.status==="SENT"?"bg-emerald-100 text-emerald-700":row.status==="DRAFT"?"bg-amber-100 text-amber-700":"bg-blue-100 text-blue-700")}>{row.status}</span></div><div className="mt-1 truncate text-xs text-slate-500">{row.recipientAddress}</div><div className="mt-2 text-[11px] text-slate-400">{row.templateKey||"manual"} · attempts {row.attemptCount}/{row.maxAttempts}</div>{row.failureReason&&<div className="mt-2 line-clamp-2 text-xs font-semibold text-red-600">{row.failureReason}</div>}</button>)}{!rows.length&&<div className="p-10 text-center text-sm text-slate-500">No email messages in this workspace.</div>}</div>
    </aside>
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {selected?<><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="dashboard-kicker">{selected.messageType} · {selected.status}</div><h2 className="mt-2 text-2xl font-black">{selected.recipientAddress}</h2><p className="mt-1 text-sm text-slate-500">{selected.failureReason||"Review the generated message before sending."}</p></div><div className="text-xs text-slate-400">Attempts {selected.attemptCount}/{selected.maxAttempts}</div></div>
      <div className="mt-6 grid gap-4"><label className="text-sm font-bold">Subject<input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/></label><label className="text-sm font-bold">Plain-text message<textarea value={textBody} onChange={e=>setTextBody(e.target.value)} rows={12} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs"/></label><label className="text-sm font-bold">HTML message<textarea value={htmlBody} onChange={e=>setHtmlBody(e.target.value)} rows={12} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs"/></label></div>
      {notice&&<div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold">{notice}</div>}
      <div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>update("save")} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black">Save draft</button><button disabled={busy} onClick={()=>update("send")} className="rounded-xl bg-[#0F3E8A] px-4 py-3 text-sm font-black text-white">Send now</button><button disabled={busy} onClick={()=>update("discard")} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-700">Discard</button></div></>:<div className="p-12 text-center text-slate-500">Select a message to inspect and edit.</div>}
    </section>
  </div>;
}
