"use client";

import { FormEvent, useState } from "react";

export default function PartnerCreateForm({ products = [] }: { products?: Array<{ slug:string; name:string }> }) {
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [referralUrl,setReferralUrl]=useState("");
  const [created,setCreated]=useState<{name:string;code:string;url:string;product:string;campaign:string}|null>(null);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setReferralUrl("");
    const form=event.currentTarget; const payload=Object.fromEntries(new FormData(form).entries());
    try {
      const response=await fetch("/api/admin/partners",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json(); if(!response.ok) throw new Error(data.error||"Could not create partner.");
      const selectedProduct=products.find(p=>p.slug===String(payload.productSlug||""));
      setReferralUrl(data.referralUrl||"");
      setCreated({name:String(payload.name),code:String(data.code||""),url:String(data.referralUrl||""),product:selectedProduct?.name||"All solutions",campaign:String(payload.campaign||"")});
      setMessage("Partner created successfully.");
      setOpen(true);
    } catch(error) { setMessage(error instanceof Error?error.message:"Could not create partner."); }
    finally { setBusy(false); }
  }

  function resetAndClose() { setOpen(false); setCreated(null); setReferralUrl(""); setMessage(""); }
  function startAnother() { setCreated(null); setReferralUrl(""); setMessage(""); }

  return <><button type="button" onClick={()=>{setOpen(true);setCreated(null);setMessage("");}} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0b3475]">+ Add partner</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-7 shadow-2xl">
        {!created ? <form onSubmit={submit}>
          <div className="flex items-start justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner operations</div><h2 className="mt-1 text-2xl font-black">Create partner</h2><p className="mt-1 text-sm text-slate-500">Add a partner and issue a real public referral link.</p></div><button type="button" onClick={resetAndClose} className="rounded-full border px-3 py-1 text-slate-500">×</button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required placeholder="Partner or agent name"/><Field label="Email" name="email" type="email" placeholder="name@example.com"/>
            <label className="text-sm font-bold text-slate-700">Type<select name="type" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>AGENT</option><option>INFLUENCER</option><option>AFFILIATE</option><option>RESELLER</option></select></label>
            <label className="text-sm font-bold text-slate-700">Status<select name="status" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>ACTIVE</option><option>PENDING</option><option>PAUSED</option></select></label>
            <Field label="Referral code" name="code" placeholder="e.g. agent-abebe"/><Field label="Campaign" name="campaign" placeholder="e.g. tiktok-september"/>
            <label className="text-sm font-bold text-slate-700">Product / service<select name="productSlug" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="">All solutions</option>{products.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
            <Field label="Destination" name="destinationPath" defaultValue="/" placeholder="/products/crm-pro"/>
          </div>
          {message && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</div>}
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={resetAndClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Cancel</button><button disabled={busy} className="rounded-full bg-[#E2B02A] px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy?"Creating…":"Create partner"}</button></div>
        </form> : <div>
          <div className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-600">✓</div><div className="mt-4 text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner created</div><h2 className="mt-2 text-2xl font-black">{created.name}</h2><p className="mt-2 text-sm text-slate-500">Share this real public referral URL.</p></div>
          <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5"><div className="text-xs font-black uppercase text-slate-400">Public referral URL</div><a href={created.url} target="_blank" rel="noreferrer" className="mt-2 block break-all font-mono text-sm font-black text-[#0F3E8A] underline">{created.url} ↗</a><div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><div><b>Type:</b> partner</div><div><b>Campaign:</b> {created.campaign||"—"}</div><div><b>Product:</b> {created.product}</div></div></div>
          <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={startAnother} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Create another</button><button type="button" onClick={resetAndClose} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">Close</button></div>
        </div>}
      </div>
    </div>}
  </>;
}
function Field({label,name,type="text",required,placeholder,defaultValue}:{label:string;name:string;type?:string;required?:boolean;placeholder?:string;defaultValue?:string}) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]"/></label>;
}
