"use client";

import { FormEvent, useState } from "react";

export default function PartnerCreateForm({ products = [] }: { products?: Array<{ slug: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [referralUrl, setReferralUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setReferralUrl("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/admin/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create partner.");
      setReferralUrl(data.referralUrl || "");
      setMessage(data.referralUrl ? "Partner created. The public referral link is ready to share." : "Partner created.");
      event.currentTarget.reset();
      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create partner.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0b3475]">+ Add partner</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[2rem] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner operations</div><h2 className="mt-1 text-2xl font-black">Create partner</h2><p className="mt-1 text-sm text-slate-500">Add a partner and optionally issue their first referral link.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-full border px-3 py-1 text-slate-500">×</button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required placeholder="Partner or agent name" />
          <Field label="Email" name="email" type="email" placeholder="name@example.com" />
          <label className="text-sm font-bold text-slate-700">Type<select name="type" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>AGENT</option><option>INFLUENCER</option><option>AFFILIATE</option><option>RESELLER</option></select></label>
          <label className="text-sm font-bold text-slate-700">Status<select name="status" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>ACTIVE</option><option>PENDING</option><option>PAUSED</option></select></label>
          <Field label="Referral code" name="code" placeholder="e.g. agent-abebe" />
          <Field label="Campaign" name="campaign" placeholder="e.g. tiktok-september" />
          <label className="text-sm font-bold text-slate-700">Product / service<select name="productSlug" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="">All solutions</option>{products.map(product => <option key={product.slug} value={product.slug}>{product.name}</option>)}</select></label>
          <Field label="Destination" name="destinationPath" defaultValue="/" placeholder="/products" />
        </div>
        {message && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}{referralUrl && <a href={referralUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-[#0F3E8A] underline">{referralUrl} ↗</a>}</div>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Cancel</button><button disabled={busy} className="rounded-full bg-[#E2B02A] px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy ? "Creating…" : "Create partner"}</button></div>
      </form>
    </div>}
  </>;
}

function Field({ label, name, type = "text", required, placeholder, defaultValue }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]" /></label>;
}
