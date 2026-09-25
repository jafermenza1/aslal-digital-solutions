"use client";

import { useEffect, useState } from "react";

type Commission = {
  id: string;
  partner_id: string;
  partner_name: string;
  amount: number | string;
  currency: string;
  status: string;
  order_number: string | null;
  created_at: string;
};

export default function PartnerPayoutBatch() {
  const [rows, setRows] = useState<Commission[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/partner-engine/payouts", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load payable commissions.");
    setRows(data.payableCommissions || []);
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load payable commissions."));
  }, []);

  const grouped = rows.reduce<Record<string, Commission[]>>((out, row) => {
    (out[row.partner_id] ||= []).push(row);
    return out;
  }, {});

  async function createBatch(partnerId: string) {
    const ids = selected.filter((id) => grouped[partnerId]?.some((row) => row.id === id));
    if (!ids.length) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/partner-engine/payouts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ partnerId, commissionIds: ids, status: "PENDING", currency: "ETB", amount: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create payout batch.");
      setSelected((current) => current.filter((id) => !ids.includes(id)));
      setMessage("Payout batch created from reconciled, payable commissions.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create payout batch.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div>
      <h3 className="text-xl font-black">Commission payout batches</h3>
      <p className="mt-1 text-sm text-slate-500">Only commissions already marked PAYABLE after reconciled revenue appear here. Selecting them creates payout-item links and prevents double settlement.</p>
    </div>
    {message && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold">{message}</div>}
    <div className="mt-5 space-y-5">
      {Object.entries(grouped).map(([partnerId, partnerRows]) => {
        const partnerName = partnerRows[0]?.partner_name || partnerId;
        const total = partnerRows.reduce((sum, row) => sum + Number(row.amount), 0);
        return <div key={partnerId} className="rounded-2xl border border-slate-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="font-black">{partnerName}</div><div className="text-xs text-slate-500">{partnerRows.length} payable commission(s) · ETB {total.toLocaleString("en-ET", { maximumFractionDigits: 2 })}</div></div>
            <button type="button" disabled={busy || !partnerRows.some((row) => selected.includes(row.id))} onClick={() => void createBatch(partnerId)} className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-xs font-black text-white disabled:opacity-40">Create payout batch</button>
          </div>
          <div className="mt-3 space-y-2">
            {partnerRows.map((row) => <label key={row.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <input type="checkbox" checked={selected.includes(row.id)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))}/>
              <span className="min-w-0 flex-1"><span className="block font-bold">ETB {Number(row.amount).toLocaleString("en-ET", { maximumFractionDigits: 2 })}</span><span className="block text-xs text-slate-500">{row.order_number ? `Order ${row.order_number} · ` : ""}{new Date(row.created_at).toLocaleString("en-ET")}</span></span>
              <span className="text-[10px] font-black uppercase text-emerald-700">PAYABLE</span>
            </label>)}
          </div>
        </div>;
      })}
      {!Object.keys(grouped).length && <p className="text-sm text-slate-500">No payable commissions are currently eligible for payout.</p>}
    </div>
  </section>;
}
