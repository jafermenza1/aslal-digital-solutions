"use client";

import { useMemo, useState } from "react";

export type PartnerCatalogItem = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  type: string;
  status: string;
  code: string | null;
  campaign: string | null;
  productSlug: string | null;
  destinationPath: string | null;
  createdAt: string;
};

function shortId(id: string) {
  return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

export default function PartnerCatalog({ partners }: { partners: PartnerCatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState<Record<string,string>>({});

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

      <div className="overflow-x-auto">
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
                  <button
                    type="button"
                    title={p.id}
                    onClick={() => copy(p.id)}
                    className="mt-1 font-mono text-[10px] text-slate-400 hover:text-[#0F3E8A]"
                  >
                    ID: {shortId(p.id)} · copy
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
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{p.status}</span>
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
                  <a href={`/api/admin/partners/${encodeURIComponent(p.id)}/card`} className="whitespace-nowrap rounded-xl bg-[#E2B02A] px-3 py-2 text-xs font-black text-slate-950">
                    Download card
                  </a>
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
    </section>
  );
}
