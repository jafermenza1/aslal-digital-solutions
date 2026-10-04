"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  workspaceId: string;
  listingId?: string;
  listingTitle?: string;
  listingType?: "PRODUCT" | "SERVICE" | "ASSET" | "PROPERTY";
};

export default function CustomerJourney({ workspaceId, listingId, listingTitle, listingType = "PRODUCT" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState(listingTitle ? `I am interested in: ${listingTitle}` : "");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{requestId:string; status:string; matchCount:number} | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/commercial/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          requestType: listingType === "SERVICE" ? "SERVICE_REQUEST" : listingType === "ASSET" ? "ASSET_REQUEST" : "BUY_REQUEST",
          source: "public-marketplace",
          title: listingTitle ? `Customer request — ${listingTitle}` : "Customer purchase request",
          requestedItem: listingTitle || need,
          contactName: name,
          contactEmail: email || undefined,
          contactPhone: phone || undefined,
          description: details || need,
          quantity: Number(quantity) > 0 ? Number(quantity) : 1,
          budgetMax: budget ? Number(budget) : undefined,
          currency: "ETB",
          specifications: listingId ? { listingId } : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not submit your request.");
      setResult({ requestId: data.requestId, status: data.status, matchCount: Number(data.matchCount || 0) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not submit your request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Customer journey</div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Interested? Start the request here.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your request becomes a real Aslal demand record. A business can qualify it, respond, quote and—after acceptance—move it into the existing order and payment workflow.
          </p>
          <div className="mt-5 space-y-2">
            {[
              ["1", "Discover", "Review the published offer and media."],
              ["2", "Request", "Tell the seller what you need."],
              ["3", "Match / quote", "The commercial workflow handles qualification and response."],
              ["4", "Order / payment", "An accepted commercial agreement uses the existing order and payment controls."],
              ["5", "Support", "Keep the request/reference for follow-up with Aslal or the seller."],
            ].map(([n, title, body]) => (
              <div key={n} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0F3E8A] text-xs font-black text-white">{n}</span>
                <div><div className="text-sm font-black">{title}</div><div className="text-xs leading-5 text-slate-500">{body}</div></div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <Link href="/wanted" className="rounded-full border border-slate-200 px-3 py-2 text-slate-700">Make a different request</Link>
            <Link href="/contact" className="rounded-full border border-slate-200 px-3 py-2 text-slate-700">Contact support</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          {result ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-700">Request received</div>
              <h3 className="mt-2 text-xl font-black text-slate-950">Your request is now in the commercial workflow.</h3>
              <p className="mt-2 text-sm text-slate-600">Reference: <strong>{result.requestId}</strong></p>
              <p className="mt-1 text-sm text-slate-600">Status: <strong>{result.status}</strong>{result.matchCount ? ` · ${result.matchCount} initial match(es)` : ""}</p>
              <button type="button" onClick={() => setResult(null)} className="mt-5 rounded-xl bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white">Start another request</button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Your name<input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold">Phone<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold sm:col-span-2">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold sm:col-span-2">What do you need?<input value={need} onChange={e=>setNeed(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold">Quantity<input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold">Budget ceiling (ETB)<input inputMode="decimal" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
                <label className="text-sm font-bold sm:col-span-2">Details<textarea value={details} onChange={e=>setDetails(e.target.value)} rows={4} placeholder="Size, timing, delivery location, preferred option or other useful detail" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" /></label>
              </div>
              {error && <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}
              <button type="button" disabled={busy || !name.trim() || !need.trim()} onClick={()=>void submit()} className="mt-4 w-full rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? "Submitting…" : "Send request"}</button>
              <p className="mt-3 text-center text-[11px] text-slate-400">Your contact details are used to process this commercial request and coordinate follow-up.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
