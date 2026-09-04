"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Partner = { id: string; name: string; status: string };
type Lead = { id: string; name: string; company: string | null; status: string; deal_value: number | string | null };
type Link = { id: string; code: string; partner_id: string; partner_name: string };
type Commission = { id: string; partner_id: string; partner_name: string; lead_id: string | null; lead_name: string | null; referral_link_id: string | null; referral_code: string | null; amount: number | string; currency: string; status: string; created_at: string };

const nextStatus: Record<string, string[]> = {
  PENDING: ["QUALIFIED", "VOID"],
  QUALIFIED: ["APPROVED", "VOID"],
  APPROVED: ["PAYABLE", "VOID"],
  PAYABLE: ["PAID", "VOID"],
  PAID: [],
  VOID: [],
};

const money = (value: number | string) => Number(value || 0).toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CommissionOperations() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [referralLinkId, setReferralLinkId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const partnerLinks = useMemo(() => links.filter((link) => link.partner_id === partnerId), [links, partnerId]);

  async function load() {
    const response = await fetch("/api/admin/commissions", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load commission operations.");
    const data = await response.json();
    setPartners(data.partners ?? []);
    setLeads(data.leads ?? []);
    setLinks(data.links ?? []);
    setCommissions(data.commissions ?? []);
  }

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : "Could not load commission operations.")); }, []);

  async function createCommission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/commissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partnerId, leadId, referralLinkId, amount, status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create commission.");
      setMessage("Commission created."); setAmount(""); setLeadId(""); setReferralLinkId(""); setStatus("PENDING");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create commission."); }
    finally { setBusy(false); }
  }

  async function move(id: string, next: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/commissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update commission.");
      setMessage(`Commission moved to ${next}.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update commission."); }
    finally { setBusy(false); }
  }

  return <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-black">Commission operations</h2><p className="mt-1 text-sm text-slate-500">Create earned commissions and move them through qualification, approval, payable and paid.</p></div><div className="rounded-full bg-[#0F3E8A]/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0F3E8A]">PENDING → QUALIFIED → APPROVED → PAYABLE → PAID</div></div>
    <form onSubmit={createCommission} className="mt-6 grid gap-3 lg:grid-cols-6">
      <select required value={partnerId} onChange={(e) => { setPartnerId(e.target.value); setReferralLinkId(""); }} className="rounded-xl border border-slate-200 px-3 py-3 text-sm lg:col-span-2"><option value="">Partner</option>{partners.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.status}</option>)}</select>
      <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm lg:col-span-2"><option value="">Optional lead</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}{l.company ? ` · ${l.company}` : ""} · {l.status}</option>)}</select>
      <select value={referralLinkId} onChange={(e) => setReferralLinkId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm lg:col-span-2"><option value="">Optional referral link</option>{partnerLinks.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}</select>
      <input required inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (ETB)" className="rounded-xl border border-slate-200 px-3 py-3 text-sm lg:col-span-2" />
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm"><option>PENDING</option><option>QUALIFIED</option><option>APPROVED</option><option>PAYABLE</option></select>
      <button disabled={busy || !partnerId} className="rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? "Saving…" : "Create commission"}</button>
    </form>
    {message && <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}
    {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Partner","Lead","Referral","Amount","Status","Next action","Created"].map((h) => <th key={h} className="px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead><tbody>{commissions.map((c) => <tr key={c.id} className="border-t border-slate-100"><td className="px-4 py-4 font-black">{c.partner_name}</td><td className="px-4 py-4">{c.lead_name || "Manual"}</td><td className="px-4 py-4 font-mono text-xs">{c.referral_code || "—"}</td><td className="px-4 py-4 font-black">{c.currency} {money(c.amount)}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{c.status}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{(nextStatus[c.status] || []).map((next) => <button key={next} type="button" disabled={busy} onClick={() => move(c.id, next)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-[#0F3E8A] hover:bg-slate-50 disabled:opacity-50">{next}</button>)}</div></td><td className="px-4 py-4 text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString("en-GB")}</td></tr>)}{!commissions.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No commissions recorded yet.</td></tr>}</tbody></table></div>
  </section>;
}
