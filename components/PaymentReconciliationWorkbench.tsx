"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string; provider: string; providerTransactionRef: string | null; amount: number; currency: string;
  method: string | null; status: string; reconciliationStatus: string;
  reconciliationEvidenceRef: string | null; reconciliationNotes: string | null;
  createdAt: string; order: { orderNumber: string; total: number; currency: string; paymentState: string;
  customer: { name: string; email: string | null; phone: string | null } | null };
};

export default function PaymentReconciliationWorkbench() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState<Record<string,string>>({});
  const [notes, setNotes] = useState<Record<string,string>>({});

  async function load() {
    const res = await fetch("/api/admin/payments/reconciliation", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load payment queue.");
    setPayments(data.payments || []);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/payments/reconciliation", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load payment queue.");
        if (active) setPayments(data.payments || []);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Could not load payment queue.");
      });
    return () => { active = false; };
  }, []);

  async function patch(payment: Payment, body: Record<string,string>) {
    setBusy(payment.id); setMessage(""); setError("");
    try {
      const res = await fetch("/api/payments/" + payment.id, {
        method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment update failed.");
      setMessage("Payment " + payment.order.orderNumber + " updated.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Payment update failed."); }
    finally { setBusy(""); }
  }

  const value = (p: Payment, key: "evidence"|"notes") => key === "evidence"
    ? (evidence[p.id] ?? p.reconciliationEvidenceRef ?? "")
    : (notes[p.id] ?? p.reconciliationNotes ?? "");

  async function match(p: Payment) {
    const ref = value(p,"evidence").trim();
    if (!ref) return setError("Receipt/evidence reference is required before matching.");
    await patch(p,{reconciliationStatus:"MATCHED",reconciliationEvidenceRef:ref,reconciliationNotes:value(p,"notes").trim()});
  }
  async function confirm(p: Payment) {
    if (p.reconciliationStatus !== "MATCHED") return setError("Match the receipt/evidence before confirming collection.");
    await patch(p,{status:"CONFIRMED"});
  }
  async function reconcile(p: Payment) {
    const ref=value(p,"evidence").trim();
    if (p.status !== "CONFIRMED") return setError("Only a confirmed payment can be reconciled.");
    if (!ref) return setError("Receipt/evidence reference is required before reconciliation.");
    await patch(p,{reconciliationStatus:"RECONCILED",reconciliationEvidenceRef:ref,reconciliationNotes:value(p,"notes").trim()});
  }
  async function exception(p: Payment) {
    const reason=value(p,"notes").trim();
    if (!reason) return setError("An exception reason is required.");
    await patch(p,{reconciliationStatus:"EXCEPTION",reconciliationEvidenceRef:value(p,"evidence").trim(),reconciliationNotes:reason});
  }

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Finance / Manual collection verification</div>
      <h2 className="mt-2 text-2xl font-black">Payment reconciliation workbench</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">Capture receipt evidence, match it, confirm collection, then reconcile into recognized revenue. Actions are workspace-scoped and audited.</p></div>
      <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black">{payments.length} pending review</div>
    </div>
    {message && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}
    {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
    <div className="mt-6 space-y-4">
      {payments.map((p) => {
        const isBusy=p.id===busy;
        const matched=p.reconciliationStatus==="MATCHED";
        const confirmed=p.status==="CONFIRMED";
        return <article key={p.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><span className="font-black">{p.order.orderNumber}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{p.status}</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#0F3E8A]">{p.reconciliationStatus}</span></div>
              <p className="mt-1 text-sm text-slate-500">{p.order.customer?.name || "Customer unavailable"} · {p.currency} {p.amount.toLocaleString("en-ET",{minimumFractionDigits:2})} · {p.provider} · {p.method || "method not recorded"}</p>
              <p className="mt-1 text-xs text-slate-400">Provider reference: {p.providerTransactionRef || "not supplied"} · Created {new Date(p.createdAt).toLocaleString("en-ET")}</p>
            </div>
            <div className="text-sm font-black">Order {p.order.currency} {p.order.total.toLocaleString("en-ET",{minimumFractionDigits:2})}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input aria-label="Receipt or evidence reference" value={value(p,"evidence")} onChange={e=>setEvidence(x=>({...x,[p.id]:e.target.value}))} placeholder="Slip ID, transaction reference, evidence ID" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
            <input aria-label="Verification note or exception reason" value={value(p,"notes")} onChange={e=>setNotes(x=>({...x,[p.id]:e.target.value}))} placeholder="Verification note / exception reason" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!matched && !confirmed && <button disabled={isBusy} onClick={()=>void match(p)} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-black disabled:opacity-50">Match receipt</button>}
            {matched && !confirmed && <button disabled={isBusy} onClick={()=>void confirm(p)} className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-xs font-black text-white disabled:opacity-50">Confirm collection</button>}
            {confirmed && p.reconciliationStatus!=="RECONCILED" && <button disabled={isBusy} onClick={()=>void reconcile(p)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50">Reconcile → revenue</button>}
            {p.reconciliationStatus!=="RECONCILED" && <button disabled={isBusy} onClick={()=>void exception(p)} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-700 disabled:opacity-50">Flag exception</button>}
          </div>
        </article>;
      })}
      {!payments.length && <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No payments currently require Finance review.</div>}
    </div>
  </section>;
}