"use client";

import Link from "next/link";
import { useState } from "react";

type Quote = {
  id: string; quoteNumber: string; version: number; status: string; currency: string;
  subtotal: number; discount: number; total: number; terms: string | null; expiresAt: string | Date | null;
  createdBy: string | null; customer: { name: string } | null; opportunity: { name: string } | null;
  items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; lineTotal: number }>;
  events: Array<{ type: string; actor: string | null; note: string | null; createdAt: string | Date }>;
};
type Opportunity = { id: string; name: string; expectedValue: number; currency: string; stage: string; ownerEmail: string | null; leadName: string; company: string | null };
type Customer = { id: string; name: string; email: string | null };

const actions = (status: string) =>
  status === "DRAFT" ? ["SENT", "CANCELLED"] :
  status === "SENT" ? ["VIEWED", "NEGOTIATING", "ACCEPTED", "REJECTED", "CANCELLED", "REVISE"] :
  status === "VIEWED" || status === "NEGOTIATING" ? ["NEGOTIATING", "ACCEPTED", "REJECTED", "CANCELLED", "REVISE"] : [];

export default function QuotesWorkspace({
  initialQuotes, opportunities, customers,
}: { initialQuotes: Quote[]; opportunities: Opportunity[]; customers: Customer[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [selected, setSelected] = useState<Quote | null>(initialQuotes[0] || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id || "");
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("Growth consultation");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [terms, setTerms] = useState("Valid subject to scope confirmation and agreed delivery terms.");
  const [expiresAt, setExpiresAt] = useState("");

  async function act(id: string, action: string) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      const refreshed = await fetch(`/api/quotes/${id}`).then(r => r.json());
      const q = refreshed.quote as Quote;
      setQuotes(prev => prev.map(x => x.id === id ? { ...x, ...q } : x));
      setSelected(q);
      setMessage(`Quote ${action.toLowerCase()} successfully.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to update quote"); }
    finally { setBusy(false); }
  }

  async function createQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const body = {
        opportunityId: opportunityId || undefined, customerId: customerId || undefined,
        currency: opportunityId ? opportunities.find(o => o.id === opportunityId)?.currency || "ETB" : "ETB",
        items: [{ description, quantity: Number(quantity), unitPrice: Number(unitPrice), discount: Number(discount) }],
        discount: 0, terms, expiresAt: expiresAt || undefined,
      };
      const res = await fetch("/api/quotes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create quote");
      const created = data.quote as Quote;
      const normalized = { ...created, subtotal: Number(created.subtotal), discount: Number(created.discount), total: Number(created.total), items: created.items.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), discount: Number(i.discount), lineTotal: Number(i.lineTotal) })) };
      setQuotes(prev => [normalized, ...prev]);
      setSelected(normalized); setShowCreate(false); setMessage("Draft quote created. Review it, then send it.");
      setDescription("Growth consultation"); setQuantity("1"); setUnitPrice(""); setDiscount("0");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to create quote"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#F8FAFC] py-10">
    <div className="container-aslal">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Sales</div><h1 className="mt-2 text-4xl font-black tracking-tight">Quotes & negotiation</h1><p className="mt-2 max-w-3xl text-slate-500">Turn an active opportunity into a traceable commercial offer, send it, record negotiation, and preserve every revision.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setShowCreate(v => !v)} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-bold text-white">{showCreate ? "Close quote form" : "+ New quote"}</button><Link href="/dashboard/leads" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Sales pipeline</Link></div>
      </div>

      {showCreate && <form onSubmit={createQuote} className="mt-7 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-bold">Opportunity<select value={opportunityId} onChange={e => setOpportunityId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="">Select opportunity</option>{opportunities.map(o => <option key={o.id} value={o.id}>{o.name} · {o.leadName}{o.company ? ` · ${o.company}` : ""}</option>)}</select></label>
          <label className="text-sm font-bold">Customer<select value={customerId} onChange={e => setCustomerId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="">Optional customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.email ? ` · ${c.email}` : ""}</option>)}</select></label>
          <label className="text-sm font-bold">Line item<input required value={description} onChange={e => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
          <label className="text-sm font-bold">Unit price (ETB)<input required min="0" step="0.01" type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
          <label className="text-sm font-bold">Quantity<input min="0.001" step="0.001" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
          <label className="text-sm font-bold">Line discount<input min="0" step="0.01" type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
          <label className="text-sm font-bold">Expires<input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
          <label className="text-sm font-bold md:col-span-2 xl:col-span-1">Terms<input value={terms} onChange={e => setTerms(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={busy || (!opportunityId && !customerId)} className="rounded-xl bg-[#0F3E8A] px-5 py-3 font-bold text-white disabled:opacity-50">Create draft quote</button><span className="text-sm text-slate-500">A quote must be linked to an opportunity or customer.</span></div>
      </form>}

      {message && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#0F3E8A]">{message}</div>}

      <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)]">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-6"><span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">QUOTE HISTORY</span><h2 className="mt-1 text-xl font-black">{quotes.length} quote versions</h2></div><div className="divide-y divide-slate-100">{quotes.map(q => <button key={q.id} type="button" onClick={() => setSelected(q)} className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 ${selected?.id === q.id ? "bg-blue-50/60" : ""}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F3E8A] text-xs font-black text-white">Q</span><span className="min-w-0 flex-1"><strong className="block truncate">{q.quoteNumber} · v{q.version}</strong><small className="block truncate text-slate-500">{q.customer?.name || q.opportunity?.name || "Unlinked"} · {q.status}</small></span><strong className="shrink-0">{q.currency} {q.total.toLocaleString()}</strong></button>)}{!quotes.length && <div className="p-12 text-center text-slate-500">No quotes yet. Start from an active opportunity.</div>}</div></div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">{selected ? <><span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{selected.status}</span><h2 className="mt-1 text-2xl font-black">{selected.quoteNumber} · v{selected.version}</h2><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">Subtotal</span><strong>{selected.currency} {selected.subtotal.toLocaleString()}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">Total</span><strong>{selected.currency} {selected.total.toLocaleString()}</strong></div></div><p className="mt-4 text-sm text-slate-600">{selected.terms || "No special terms recorded."}</p><div className="mt-5 space-y-2">{selected.items.map((i,n) => <div key={n} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3 text-sm"><span>{i.description} × {i.quantity}</span><strong>{selected.currency} {i.lineTotal.toLocaleString()}</strong></div>)}</div><div className="mt-5 flex flex-wrap gap-2">{actions(selected.status).map(a => <button key={a} type="button" disabled={busy} onClick={() => act(selected.id,a)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black hover:border-[#0F3E8A] hover:text-[#0F3E8A] disabled:opacity-50">{a}</button>)}</div><div className="mt-7"><span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">RECONSTRUCTABLE HISTORY</span><div className="mt-3 space-y-2">{selected.events.map((e,i) => <div key={i} className="flex items-start justify-between gap-3 border-l-2 border-slate-200 pl-3 text-sm"><span><strong>{e.type}</strong> · {e.actor || "system"}{e.note ? ` — ${e.note}` : ""}</span><small className="shrink-0 text-slate-400">{new Date(e.createdAt).toLocaleString()}</small></div>)}</div></div></> : <div className="py-16 text-center text-slate-500">Select a quote.</div>}</div>
      </section>
    </div>
  </main>;
}
