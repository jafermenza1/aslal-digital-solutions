"use client";

import { useEffect, useState } from "react";

export function CommercialControlsManager({ workspaceId }: { workspaceId: string }) {
  const [signals, setSignals] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [s, d] = await Promise.all([
      fetch("/api/admin/commercial-controls?workspaceId=" + workspaceId + "&kind=SIGNALS").then(r => r.json()),
      fetch("/api/admin/commercial-controls?workspaceId=" + workspaceId + "&kind=DISPUTES").then(r => r.json()),
    ]);
    setSignals(s.signals || []);
    setDisputes(d.disputes || []);
  }

  useEffect(() => { if (workspaceId) load(); }, [workspaceId]);

  async function update(kind: string, id: string, action: string, extra: Record<string, unknown> = {}) {
    const r = await fetch("/api/admin/commercial-controls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, kind, id, action, ...extra }),
    });
    const j = await r.json();
    if (!r.ok) { setMessage(j.error || "Operation failed."); return; }
    setMessage("Control updated.");
    await load();
  }

  async function createSignal() {
    const r = await fetch("/api/admin/commercial-controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId, kind: "SIGNAL",
        type: "SUSPICIOUS_ATTRIBUTION_CHANGE",
        summary: "Operator-created commercial integrity review signal",
        severity: 1,
        details: { source: "operator" },
      }),
    });
    const j = await r.json();
    setMessage(r.ok ? "Review signal created." : (j.error || "Could not create signal."));
    if (r.ok) await load();
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-rose-600">CE-12 / Leakage & Disputes</div>
          <h2 className="mt-1 text-2xl font-black">Commercial integrity review</h2>
          <p className="text-sm text-slate-500">Signals trigger review; they are not proof. Original attribution and earnings remain unchanged unless an authorized resolution explicitly changes them.</p>
        </div>
        <button onClick={load} className="rounded border px-3 py-2 text-xs font-bold">Refresh</button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={createSignal} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Create review signal</button>
        {message && <span className="rounded bg-slate-50 px-3 py-2 text-xs">{message}</span>}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-bold">Leakage signals ({signals.length})</h3>
          <div className="mt-2 space-y-2">
            {signals.map(x => (
              <div key={x.id} className="rounded-lg border p-3">
                <div className="flex justify-between gap-2"><b>{x.type}</b><span className="text-xs">{x.status} · severity {x.severity}</span></div>
                <p className="mt-1 text-sm">{x.summary}</p>
                <div className="mt-2 flex gap-2">
                  {x.status === "OPEN" && <button onClick={() => update("SIGNAL", x.id, "STATUS", { status: "ACKNOWLEDGED" })} className="rounded border px-2 py-1 text-xs">Acknowledge</button>}
                  {["OPEN", "ACKNOWLEDGED"].includes(x.status) && <button onClick={() => update("SIGNAL", x.id, "STATUS", { status: "INVESTIGATING" })} className="rounded border px-2 py-1 text-xs">Investigate</button>}
                  {x.status === "INVESTIGATING" && <>
                    <button onClick={() => update("SIGNAL", x.id, "STATUS", { status: "SUBSTANTIATED" })} className="rounded border px-2 py-1 text-xs">Substantiate</button>
                    <button onClick={() => update("SIGNAL", x.id, "STATUS", { status: "DISMISSED" })} className="rounded border px-2 py-1 text-xs">Dismiss</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold">Disputes ({disputes.length})</h3>
          <div className="mt-2 space-y-2">
            {disputes.map(x => (
              <div key={x.id} className="rounded-lg border p-3">
                <div className="flex justify-between gap-2"><b>{x.subject}</b><span className="text-xs">{x.status}</span></div>
                <p className="text-sm text-slate-500">{x.type} · {x.partner?.name || "No partner"}</p>
                {["OPEN", "EVIDENCE_REQUESTED"].includes(x.status) && <button onClick={() => update("DISPUTE", x.id, "STATUS", { status: "UNDER_REVIEW" })} className="mt-2 rounded border px-2 py-1 text-xs">Review</button>}
                {["UNDER_REVIEW", "EVIDENCE_REQUESTED"].includes(x.status) && <button onClick={() => update("DISPUTE", x.id, "RESOLVE", { resolution: "PRESERVE_COMMISSION", resolutionNotes: "Evidence reviewed; preserve existing earning." })} className="ml-2 mt-2 rounded border px-2 py-1 text-xs">Preserve commission</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
