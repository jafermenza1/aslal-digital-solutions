"use client";

import { useState } from "react";

export default function BulkPartnerProvisioner({ workspaceId }: { workspaceId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function provision() {
    if (!window.confirm("Provision the deterministic Q1 fixture ASL-P-0001 through ASL-P-0100 in this workspace?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/partners/bulk-provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, count: 100 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not provision partner fixture.");
      setMessage("Provisioned " + data.created + " new partner identities; " + data.reused + " already existed. Range: ASL-P-0001 → ASL-P-0100.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not provision partner fixture.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Q1 provisioning fixture</div>
      <h3 className="mt-1 text-lg font-black">100 agent identities</h3>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
        Creates deterministic pending AGENT records and unique referral identities for ASL-P-0001 through ASL-P-0100.
        This fixture creates no credentials, payments or commission activity and never moves an existing partner between workspaces.
      </p>
      {message && <div className="mt-4 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">{message}</div>}
      <button type="button" onClick={provision} disabled={busy} className="mt-4 rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-50">
        {busy ? "Provisioning…" : "Provision ASL-P-0001 → ASL-P-0100"}
      </button>
    </section>
  );
}
