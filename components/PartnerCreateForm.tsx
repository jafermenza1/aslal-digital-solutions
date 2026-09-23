"use client";

import { FormEvent, useState } from "react";

type Created = {
  id: string;
  name: string;
  code: string;
  url: string;
  product: string;
  campaign: string;
  email: string;
  emailSent: boolean;
  emailRecipient: string;
  credentialsIssued: boolean;
  username: string | null;
};

export default function PartnerCreateForm({ products = [] }: { products?: Array<{ slug:string; name:string }> }) {
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [created,setCreated]=useState<Created|null>(null);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form=event.currentTarget;
    const payload=Object.fromEntries(new FormData(form).entries());
    try {
      const response=await fetch("/api/admin/partners",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Could not create partner.");
      const selectedProduct=products.find(p=>p.slug===String(payload.productSlug||""));
      setCreated({
        id:String(data.partnerId),
        name:String(payload.name),
        code:String(data.code||""),
        url:String(data.referralUrl||""),
        product:selectedProduct?.name||"All solutions",
        campaign:String(payload.campaign||""),
        email:String(payload.email||""),
        emailSent:Boolean(data.emailSent),
        emailRecipient:String(data.emailRecipient||""),
        credentialsIssued:Boolean(data.credentialsIssued),
        username:data.username ? String(data.username) : null,
      });
      setMessage(data.emailSent ? `Partner card emailed to ${data.emailRecipient}.` : "Partner created; the card email could not be sent. Download it below and check SMTP settings.");
    } catch(error) { setMessage(error instanceof Error?error.message:"Could not create partner."); }
    finally { setBusy(false); }
  }

  function resetAndClose() { setOpen(false); setCreated(null); setMessage(""); }
  function startAnother() { setCreated(null); setMessage(""); }

  return <><button type="button" onClick={()=>{setOpen(true);setCreated(null);setMessage("");}} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0b3475]">+ Add partner</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
        {!created ? <form onSubmit={submit}>
          <div className="flex items-start justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner operations</div><h2 className="mt-1 text-2xl font-black">Create partner</h2><p className="mt-1 text-sm text-slate-500">Create the partner record, referral link, wallet-size card and email package from one workflow.</p></div><button type="button" onClick={resetAndClose} className="rounded-full border px-3 py-1 text-slate-500">×</button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required placeholder="Partner or agent name"/><Field label="Registered email" name="email" type="email" placeholder="name@example.com"/>
            <label className="text-sm font-bold text-slate-700">Type<select name="type" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>AGENT</option><option>INFLUENCER</option><option>AFFILIATE</option><option>RESELLER</option></select></label>
            <label className="text-sm font-bold text-slate-700">Status<select name="status" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>ACTIVE</option><option>PENDING</option><option>PAUSED</option></select></label>
            <Field label="Referral code" name="code" placeholder="e.g. agent-abebe"/><Field label="Campaign" name="campaign" placeholder="e.g. tiktok-september"/>
            <label className="text-sm font-bold text-slate-700">Product / service<select name="productSlug" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="">All solutions</option>{products.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
            <Field label="Destination" name="destinationPath" defaultValue="/" placeholder="/products/crm-pro"/>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input name="requestCredentials" value="true" type="checkbox" className="mt-1 h-4 w-4"/>
            <span><b>Partner requested login credentials</b><span className="mt-1 block text-xs leading-5 text-slate-500">Generate a unique username and temporary password. The password is stored only as a secure hash; the plaintext is included only in the onboarding email.</span></span>
          </label>
          {message && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</div>}
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={resetAndClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Cancel</button><button disabled={busy} className="rounded-full bg-[#E2B02A] px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy?"Creating…":"Create partner"}</button></div>
        </form> : <div>
          <div className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-600">✓</div><div className="mt-4 text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner created</div><h2 className="mt-2 text-2xl font-black">{created.name}</h2><p className="mt-2 text-sm text-slate-500">Wallet-size partner card generated with referral link and QR code.</p></div>
          <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5"><div className="text-xs font-black uppercase text-slate-400">Referral identity</div><a href={created.url} target="_blank" rel="noreferrer" className="mt-2 block break-all font-mono text-sm font-black text-[#0F3E8A] underline">{created.url} ↗</a><div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><div><b>Code:</b> {created.code}</div><div><b>Type:</b> partner</div><div><b>Product:</b> {created.product}</div></div></div>
          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <div className="font-black text-slate-900">Delivery</div>
            <p className="mt-1 text-sm text-slate-500">{created.emailSent ? `PDF card emailed to ${created.emailRecipient}.` : `Email delivery was not confirmed. Admin fallback is ${created.emailRecipient}.`}</p>
            {created.credentialsIssued && <p className="mt-2 text-xs font-semibold text-amber-700">Credentials issued for username <span className="font-mono">{created.username}</span>. The temporary password is never displayed again in the dashboard.</p>}
          </div>
          {created.email && <div className="mt-3 text-xs text-slate-400">Registered partner email: {created.email}</div>}
          <div className="mt-6 flex flex-wrap justify-end gap-3"><a href={`/api/admin/partners/${created.id}/card`} className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-black text-slate-950">Download printable PDF</a><button type="button" onClick={startAnother} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Create another</button><button type="button" onClick={resetAndClose} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">Close</button></div>
        </div>}
      </div>
    </div>}
  </>;
}
function Field({label,name,type="text",required,placeholder,defaultValue}:{label:string;name:string;type?:string;required?:boolean;placeholder?:string;defaultValue?:string}) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]"/></label>;
}
