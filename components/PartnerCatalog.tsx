"use client";

import { useMemo, useState } from "react";

export type PartnerCatalogItem = {
  id: string;
  partnerNumber: string;
  name: string;
  email: string | null;
  username: string | null;
  type: string;
  status: string;
  bio: string | null;
  specialties: string | null;
  serviceAreas: string | null;
  audienceSize: number | null;
  code: string | null;
  campaign: string | null;
  productSlug: string | null;
  destinationPath: string | null;
  createdAt: string;
};

function shortId(id: string) {
  return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

function statusLabel(status: string) {
  return status === "PAUSED" ? "Suspended" : status === "PENDING" ? "Pending review" : "Active";
}

function statusClasses(status: string) {
  if (status === "PAUSED") return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  if (status === "PENDING") return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
}

export default function PartnerCatalog({ partners, adminOnlyActions = false }: { partners: PartnerCatalogItem[]; adminOnlyActions?: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState<Record<string,string>>({});
  const [editing, setEditing] = useState<PartnerCatalogItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", type: "AGENT", status: "PENDING", bio: "", specialties: "", serviceAreas: "", audienceSize: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) => {
      const matchesQuery =
        !q ||
        [p.id, p.name, p.email, p.username, p.code, p.campaign, p.productSlug].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        );
      return matchesQuery && (status === "ALL" || p.status === status) && (type === "ALL" || p.type === type);
    });
  }, [partners, query, status, type]);

  function startEdit(p: PartnerCatalogItem) {
    setEditing(p);
    setForm({ name: p.name, email: p.email || "", type: p.type, status: p.status, bio: p.bio || "", specialties: p.specialties || "", serviceAreas: p.serviceAreas || "", audienceSize: p.audienceSize == null ? "" : String(p.audienceSize) });
    setNotice((n) => ({ ...n, [p.id]: "" }));
  }

  async function saveEdit() {
    if (!editing) return;
    setBusyId(editing.id);
    try {
      const response = await fetch(`/api/admin/partners/${encodeURIComponent(editing.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, audienceSize: form.audienceSize }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update partner.");
      setNotice((n) => ({ ...n, [editing.id]: data.message || "Partner updated." }));
      setEditing(null);
      window.location.reload();
    } catch (error) {
      setNotice((n) => ({ ...n, [editing.id]: error instanceof Error ? error.message : "Update failed." }));
    } finally { setBusyId(""); }
  }

  async function deletePartner(p: PartnerCatalogItem) {
    const confirmed = window.confirm(`Delete partner ${p.partnerNumber} — ${p.name}? This permanently removes the partner record and related cascade records. Use Suspend instead when you need to retain history.`);
    if (!confirmed) return;
    setBusyId(p.id);
    try {
      const response = await fetch(`/api/admin/partners/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete partner.");
      window.location.reload();
    } catch (error) {
      setNotice((n) => ({ ...n, [p.id]: error instanceof Error ? error.message : "Delete failed." }));
    } finally { setBusyId(""); }
  }

  async function generateCard(p: PartnerCatalogItem) {
    setBusyId(p.id); setNotice((n) => ({ ...n, [p.id]: "" }));
    try {
      const response = await fetch(`/api/admin/partners/${encodeURIComponent(p.id)}/card`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Could not generate the partner ID card.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aslal-partner-card-${p.partnerNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice((n) => ({ ...n, [p.id]: "Partner ID card generated successfully." }));
    } catch (error) {
      setNotice((n) => ({ ...n, [p.id]: error instanceof Error ? error.message : "ID card generation failed." }));
    } finally { setBusyId(""); }
  }

  async function issueCredentials(id: string) {
    setBusyId(id); setNotice((n) => ({ ...n, [id]: "" }));
    try {
      const response = await fetch(`/api/admin/partners/${encodeURIComponent(id)}/credentials`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not issue credentials.");
      setNotice((n) => ({ ...n, [id]: data.emailSent ? "Credentials issued and emailed." : data.message || "Credentials issued." }));
    } catch (error) {
      setNotice((n) => ({ ...n, [id]: error instanceof Error ? error.message : "Credential action failed." }));
    } finally { setBusyId(""); }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard may be unavailable in restricted browser contexts.
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner catalog</div>
            <h2 className="mt-1 text-xl font-black">Stored partners</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and inspect partner identities, referral records and routing created by this workspace.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-black text-slate-600">
            {filtered.length} of {partners.length} partners
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_170px_170px]">
          <div className="md:col-span-3 rounded-2xl bg-[#0F3E8A]/5 p-4 text-sm text-slate-600"><span className="font-black text-[#0F3E8A]">Admin actions:</span> Edit partner details here, or set status to <b>Paused</b> to suspend promotion while retaining history. Use Delete only for permanent removal.</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ID, email, code, campaign or product…"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0F3E8A]"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="PENDING">Pending</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">
            <option value="ALL">All types</option>
            <option value="AGENT">Agent</option>
            <option value="INFLUENCER">Influencer</option>
            <option value="AFFILIATE">Affiliate</option>
            <option value="RESELLER">Reseller</option>
          </select>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="bg-[#0F3E8A] text-white">
            <tr>
              {["Partner / ID", "Contact / portal", "Type", "Status", "Referral", "Campaign / product", "Destination", "Created", "Actions"].map((h) => (
                <th key={h} className="px-4 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
                <td className="px-4 py-4">
                  <div className="font-black">{p.name}</div>
                  <div className="mt-1 font-mono text-xs font-black text-[#0F3E8A]">{p.partnerNumber}</div>
                  <button
                    type="button"
                    title={p.id}
                    onClick={() => copy(p.id)}
                    className="mt-1 font-mono text-[10px] text-slate-400 hover:text-[#0F3E8A]"
                  >
                    DB ID: {shortId(p.id)} · copy
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div>{p.email || "No email"}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {p.username ? `Portal: ${p.username}` : "No portal credentials"}
                  </div>
                </td>
                <td className="px-4 py-4 font-bold">{p.type}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClasses(p.status)}`}>{statusLabel(p.status)}</span>{p.status === "PAUSED" && <div className="mt-1 text-[11px] font-semibold text-amber-700">Promotion suspended</div>}{p.status === "PENDING" && <div className="mt-1 text-[11px] font-semibold text-slate-500">Needs review</div>}
                </td>
                <td className="px-4 py-4">
                  {p.code ? (
                    <>
                      <div className="font-mono font-black text-[#0F3E8A]">{p.code}</div>
                      <a href={`/go/${encodeURIComponent(p.code)}`} target="_blank" rel="noreferrer" className="text-xs font-bold underline">
                        Open referral ↗
                      </a>
                    </>
                  ) : "—"}
                </td>
                <td className="px-4 py-4">
                  {p.campaign || "—"}
                  <div className="text-xs text-slate-400">{p.productSlug || "All products"}</div>
                </td>
                <td className="max-w-[220px] break-all px-4 py-4 font-mono text-xs text-slate-500">{p.destinationPath || "—"}</td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleString("en-ET")}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => generateCard(p)} disabled={busyId === p.id} className="whitespace-nowrap rounded-xl bg-[#E2B02A] px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50">{busyId === p.id ? "Preparing ID…" : "Generate ID"}</button>
                    <button type="button" onClick={() => startEdit(p)} disabled={!adminOnlyActions} className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#0F3E8A] disabled:cursor-not-allowed disabled:opacity-50">Edit / suspend</button>
                    <button type="button" onClick={() => issueCredentials(p.id)} disabled={busyId === p.id} className="whitespace-nowrap rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white disabled:opacity-50">
                      {busyId === p.id ? "Working…" : p.username ? "Credentials active" : "Issue credentials"}
                    </button>
                    <button type="button" onClick={() => deletePartner(p)} disabled={!adminOnlyActions || busyId === p.id} className="whitespace-nowrap rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-50">Delete</button>
                  </div>
                  {notice[p.id] && <div className="mt-2 max-w-[220px] text-[10px] font-semibold text-slate-500">{notice[p.id]}</div>}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                  {partners.length ? "No partners match the current filters." : "No partners have been added yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 lg:hidden">
        {filtered.map((p) => (
          <article key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-black text-slate-950">{p.name}</h3><div className="mt-1 font-mono text-xs font-black text-[#0F3E8A]">{p.partnerNumber}</div><div className="mt-1 text-xs text-slate-400">{p.email || "No email"}{p.username ? " · Portal: " + p.username : ""}</div></div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${statusClasses(p.status)}`}>{statusLabel(p.status)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3"><div className="font-black uppercase tracking-wider text-slate-400">Type</div><div className="mt-1 font-bold">{p.type}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="font-black uppercase tracking-wider text-slate-400">Referral</div><div className="mt-1 font-mono font-bold text-[#0F3E8A]">{p.code || "Not created"}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="font-black uppercase tracking-wider text-slate-400">Campaign</div><div className="mt-1 font-bold">{p.campaign || "—"}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="font-black uppercase tracking-wider text-slate-400">Product</div><div className="mt-1 font-bold">{p.productSlug || "All products"}</div></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => generateCard(p)} disabled={busyId === p.id} className="rounded-xl bg-[#E2B02A] px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50">{busyId === p.id ? "Preparing…" : "ID card"}</button>
              <button type="button" onClick={() => startEdit(p)} disabled={!adminOnlyActions} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#0F3E8A] disabled:opacity-50">Edit / suspend</button>
              <button type="button" onClick={() => issueCredentials(p.id)} disabled={busyId === p.id} className="rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white disabled:opacity-50">{busyId === p.id ? "Working…" : p.username ? "Credentials active" : "Issue credentials"}</button>
              <button type="button" onClick={() => deletePartner(p)} disabled={!adminOnlyActions || busyId === p.id} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-50">Delete</button>
            </div>
            {notice[p.id] && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{notice[p.id]}</div>}
          </article>
        ))}
        {!filtered.length && <div className="px-5 py-14 text-center text-slate-500">{partners.length ? "No partners match the current filters." : "No partners have been added yet."}</div>}
      </div>
      {editing && adminOnlyActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Admin partner controls</div><h3 className="mt-1 text-2xl font-black">Edit {editing.partnerNumber}</h3><p className="mt-1 text-sm text-slate-500">Set status to Paused to suspend promotion and retain the partner history.</p></div>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-3 py-2 text-sm font-black">Close</button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Name</span><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Email</span><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Type</span><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><option>AGENT</option><option>INFLUENCER</option><option>AFFILIATE</option><option>RESELLER</option></select></label>
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Status</span><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><option>ACTIVE</option><option>PAUSED</option><option>PENDING</option></select></label>
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Audience size</span><input type="number" min="0" value={form.audienceSize} onChange={e=>setForm(f=>({...f,audienceSize:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Specialties</span><input value={form.specialties} onChange={e=>setForm(f=>({...f,specialties:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
              <label className="sm:col-span-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Service areas</span><input value={form.serviceAreas} onChange={e=>setForm(f=>({...f,serviceAreas:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
              <label className="sm:col-span-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Bio</span><textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border px-5 py-3 text-sm font-black">Cancel</button><button type="button" onClick={saveEdit} disabled={busyId===editing.id} className="rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busyId===editing.id?"Saving…":"Save changes"}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
