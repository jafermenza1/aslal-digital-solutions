"use client";

import { useState } from "react";

type Payment = {
  revenue: { recognizedAmount: number; commissionableAmount: number; status: string } | null; commission: { amount: number; status: string } | null;
  id: string; provider: string; providerTransactionRef: string | null; idempotencyKey: string;
  amount: number; currency: string; method: string | null; status: string; reconciliationStatus: string;
  createdAt: string | Date; confirmedAt: string | Date | null; reconciledAt: string | Date | null;
};
type Order = {
  id: string; orderNumber: string; status: string; currency: string; subtotal: number; discount: number; total: number;
  paymentState: string; fulfillmentState: string; source: string | null; campaign: string | null; referralCode: string | null;
  salesOwnerEmail: string | null; createdAt: string | Date; customer: { name: string; email: string | null; phone: string | null } | null;
  partner: { partnerNumber: string; name: string } | null; referralLink: { code: string; campaign: string | null; productSlug: string | null } | null;
  items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; lineTotal: number }>;
  payments: Payment[];
};

export default function OrdersWorkspace({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<Order | null>(initialOrders[0] || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("MANUAL");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [amount, setAmount] = useState("");

  async function recordPayment() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const value = Number(amount);
      const res = await fetch(`/api/orders/${selected.id}/payments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider, method, amount: value, currency: selected.currency,
          status: "CONFIRMED", idempotencyKey: `manual-${selected.id}-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record payment");
      const refreshed = await fetch("/api/orders").then((r) => r.json());
      const next = (refreshed.orders || []) as Order[];
      setOrders(next); setSelected(next.find((o) => o.id === selected.id) || selected);
      setAmount(""); setMessage("Payment recorded as confirmed. Reconciliation remains a separate auditable step.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to record payment");
    } finally { setBusy(false); }
  }

  async function reconcile(payment: Payment, state: string) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ reconciliationStatus: state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update reconciliation");
      const refreshed = await fetch("/api/orders").then((r) => r.json());
      const next = (refreshed.orders || []) as Order[];
      setOrders(next); setSelected(next.find((o) => o.id === selected?.id) || null);
      setMessage(`Payment marked ${state.toLowerCase()}.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to update payment"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Commerce</div><h1 className="mt-2 text-4xl font-black tracking-tight">Orders & payments</h1><p className="mt-2 max-w-3xl text-slate-500">A confirmed order is a commercial commitment. Payments are recorded separately and reconciliation is explicit.</p></div>
    </div>
    {message && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#0F3E8A]">{message}</div>}
    {selected && (
      <>
      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Commercial journey</div><h2 className="mt-1 text-xl font-black">From captured demand to partner commission</h2><p className="mt-1 text-sm text-slate-500">Each step has a clear owner, record and next action. Nothing is counted as revenue until payment reconciliation is complete.</p></div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Order {selected.orderNumber}</div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {[
          ["Lead","Captured demand",true],
          ["Opportunity","Sales pursuit",true],
          ["Accepted quote","Commercial agreement",true],
          ["Confirmed order","Commitment",selected.status !== "DRAFT"],
          ["Payment","Collected funds",selected.payments.length > 0],
          ["Reconciliation","Verified collection",selected.payments.some((p) => p.reconciliationStatus === "RECONCILED")],
          ["Revenue","Recognized",selected.payments.some((p) => p.revenue?.status === "RECOGNIZED")],
          ["Commission","Partner earning",selected.payments.some((p) => p.commission && p.commission.status !== "VOID")],
        ].map(([title,subtitle,done]) => <div key={String(title)} className={`rounded-2xl border p-3 ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-emerald-500" : "bg-slate-300"}`} /><span className="text-xs font-black uppercase tracking-wide">{String(title)}</span></div>
          <div className="mt-1 text-[11px] text-slate-500">{String(subtitle)}</div>
        </div>)}
      </div>
    </section>
    <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,.9fr)]">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-6"><span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">ORDER HISTORY</span><h2 className="mt-1 text-xl font-black">{orders.length} orders</h2></div><div className="divide-y divide-slate-100">{orders.map(o => <button key={o.id} type="button" onClick={() => setSelected(o)} className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 ${selected?.id === o.id ? "bg-blue-50/60" : ""}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F3E8A] text-xs font-black text-white">SO</span><span className="min-w-0 flex-1"><strong className="block truncate">{o.orderNumber}</strong><small className="block truncate text-slate-500">{o.customer?.name || "Customer missing"} · {o.status} · payment {o.paymentState}</small></span><strong className="shrink-0">{o.currency} {o.total.toLocaleString()}</strong></button>)}{!orders.length && <div className="p-12 text-center text-slate-500">No orders yet. Accept a quote, then create its confirmed order.</div>}</div></div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">{selected ? <><span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{selected.status}</span><h2 className="mt-1 text-2xl font-black">{selected.orderNumber}</h2><p className="mt-1 text-sm text-slate-500">{selected.customer?.name || "Customer missing"} · {selected.customer?.email || "No email"}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">Order total</span><strong>{selected.currency} {selected.total.toLocaleString()}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">Payment state</span><strong>{selected.paymentState}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">Recognized revenue</span><strong>{selected.currency} {selected.payments.reduce((sum,p)=>sum+(p.revenue?.recognizedAmount || 0),0).toLocaleString()}</strong></div></div><div className="mt-5 space-y-2">{selected.items.map((i,n)=><div key={n} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3 text-sm"><span>{i.description} × {i.quantity}</span><strong>{selected.currency} {i.lineTotal.toLocaleString()}</strong></div>)}</div><div className="mt-6 rounded-2xl border border-slate-200 p-4"><h3 className="font-black">Record payment</h3><div className="mt-3 grid gap-3 sm:grid-cols-3"><input value={provider} onChange={e=>setProvider(e.target.value)} placeholder="Provider" className="rounded-xl border border-slate-200 px-3 py-2 text-sm"/><input value={method} onChange={e=>setMethod(e.target.value)} placeholder="Method" className="rounded-xl border border-slate-200 px-3 py-2 text-sm"/><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="rounded-xl border border-slate-200 px-3 py-2 text-sm"/></div><button type="button" disabled={busy || !amount} onClick={recordPayment} className="mt-3 rounded-xl bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white disabled:opacity-50">Record confirmed payment</button></div><div className="mt-6"><h3 className="font-black">Payment & reconciliation history</h3><div className="mt-3 space-y-3">{selected.payments.map(p=><div key={p.id} className="rounded-xl border border-slate-100 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{p.currency} {p.amount.toLocaleString()} · {p.status}</strong><span className="text-slate-500">{p.provider} / {p.method || "—"}</span></div><div className="mt-1 text-xs text-slate-500">Reconciliation: {p.reconciliationStatus} · {p.providerTransactionRef || "No provider reference"}</div>{p.revenue && <div className="mt-2 text-xs font-semibold text-emerald-700">Revenue recognized: {p.currency} {p.revenue.recognizedAmount.toLocaleString()} · {p.revenue.status}{p.commission ? ` · Commission: ${p.currency} ${p.commission.amount.toLocaleString()} (${p.commission.status})` : ""}</div>}{p.status === "CONFIRMED" && p.reconciliationStatus !== "RECONCILED" && <div className="mt-2 flex gap-2"><button type="button" disabled={busy} onClick={()=>reconcile(p,"MATCHED")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black">Mark matched</button><button type="button" disabled={busy} onClick={()=>reconcile(p,"RECONCILED")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black">Mark reconciled</button><button type="button" disabled={busy} onClick={()=>reconcile(p,"EXCEPTION")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black">Flag exception</button></div>}</div>)}{!selected.payments.length && <p className="text-sm text-slate-500">No payments recorded yet.</p>}</div></div></> : <div className="py-16 text-center text-slate-500">Select an order.</div>}</div>
    </section>
      </>
    )}
  </div>
  </main>;
}
