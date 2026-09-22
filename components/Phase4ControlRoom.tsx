"use client";

import { useMemo, useState } from "react";

type Lead = { id: string; name: string; email: string | null; phone: string | null; company: string | null; personId: string | null };
type Channel = "EMAIL" | "SMS" | "TELEGRAM" | "WHATSAPP" | "MESSENGER";
type Snapshot = { conversations:number;messages:number;handoffs:number;inbound:number;outbound:number;sent:number;delivered:number;failed:number;channelAccounts:number;optOuts:number;messageActivities:number };
type Result = { name:string; ok:boolean; detail:string };

export default function Phase4ControlRoom({
  leads,
  providerConfigured,
  snapshot,
  simulationEnabled,
}: {
  leads: Lead[];
  providerConfigured: Record<Channel, boolean>;
  snapshot: Snapshot;
  simulationEnabled: boolean;
}) {
  const [leadId, setLeadId] = useState(leads[0]?.id || "");
  const [channel, setChannel] = useState<Channel>("EMAIL");
  const selected = useMemo(() => leads.find(l => l.id === leadId), [leads, leadId]);
  const defaultRecipient = channel === "EMAIL" ? selected?.email || "" : selected?.phone || "";
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("Phase 4 live provider acceptance test from Aslal Growth OS.");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [notice, setNotice] = useState("");

  async function run(action: string) {
    if (!leadId) return setNotice("Select a Lead linked to a Person.");
    setBusy(true); setNotice(""); setResults([]);
    try {
      const response = await fetch("/api/acceptance/phase-4", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, leadId, channel, recipient: recipient || defaultRecipient, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Acceptance action failed");
      if (action === "simulation-suite") setResults(data.results || []);
      else setNotice(data.ok ? "Completed successfully." : "Provider test failed; inspect the result below.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Acceptance action failed");
    } finally { setBusy(false); }
  }

  return <div className="mt-7">
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[["Conversations",snapshot.conversations],["Messages",snapshot.messages],["Inbound",snapshot.inbound],["Outbound",snapshot.outbound],["Handoffs",snapshot.handoffs]].map(([k,v]) =>
        <div key={String(k)} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-bold text-slate-400">{k}</div><div className="mt-2 text-3xl font-black">{v}</div></div>
      )}
    </section>

    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div><h2 className="text-xl font-black">1. Select a controlled test fixture</h2><p className="mt-1 text-sm text-slate-500">The fixture must already have a trusted Person identity. Tests are tagged <code>acceptanceTest</code>.</p></div>
        <span className={"rounded-full px-3 py-1 text-xs font-black " + (simulationEnabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{simulationEnabled ? "SIMULATION ENABLED" : "SIMULATION DISABLED"}</span>
      </div>
      {!leads.length ? <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">No Lead linked to a Person is available. Link a Lead to a Person first.</div> :
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_.7fr_.9fr]">
        <label className="text-sm font-bold">Known Lead<select value={leadId} onChange={e=>setLeadId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-medium">{leads.map(l=><option key={l.id} value={l.id}>{l.name}{l.company?" · "+l.company:""}{l.email?" · "+l.email:""}</option>)}</select></label>
        <label className="text-sm font-bold">Channel<select value={channel} onChange={e=>setChannel(e.target.value as Channel)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-medium">{(["EMAIL","SMS","TELEGRAM","WHATSAPP","MESSENGER"] as Channel[]).map(c=><option key={c} value={c}>{c} {providerConfigured[c]?"· configured":"· not configured"}</option>)}</select></label>
        <label className="text-sm font-bold">Recipient<input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder={defaultRecipient || "provider address / chat id"} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-medium"/></label>
      </div>}
    </section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Controlled / no provider delivery</div>
        <h2 className="mt-2 text-xl font-black">2. Run the complete safety suite</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Exercises permission, simulated outbound persistence, channel revocation, global opt-out, human handoff, signed inbound, invalid signatures, unknown-sender identity protection, retry idempotency, and timeline activity.</p>
        <button disabled={!simulationEnabled || busy || !leads.length} onClick={()=>run("simulation-suite")} className="mt-5 rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{busy?"Running…":"Run safety + webhook suite"}</button>
        <div className="mt-5 space-y-2">{results.map(r=><div key={r.name} className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"><div className="flex items-center justify-between gap-3"><b>{r.name}</b><span className={r.ok?"font-black text-emerald-700":"font-black text-red-700"}>{r.ok?"PASS":"FAIL"}</span></div><div className="mt-1 text-xs text-slate-500">{r.detail}</div></div>)}</div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Provider / real delivery</div>
        <h2 className="mt-2 text-xl font-black">3. Run an explicit live provider test</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">This contacts the selected provider and creates a real outbound Message. Only run it against an address/chat you control. Provider configuration is never displayed here.</p>
        <label className="mt-5 block text-sm font-bold">Test message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-medium"/></label>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">LIVE TEST: {channel} is {providerConfigured[channel] ? "configured" : "not configured"}. A successful test records SENT; provider failure records FAILED.</div>
        <button disabled={busy || !leads.length || !providerConfigured[channel]} onClick={()=>run("live-send")} className="mt-5 rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40">{busy?"Sending…":"Send live provider test"}</button>
        {notice && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{notice}</div>}
      </div>
    </section>

    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-black">4. Acceptance workflow after the suite</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Known identity", "Lead → Person is selected and conversation remains linked."],
          ["Consent gate", "Only explicitly allowed channel can dispatch; global opt-out blocks all."],
          ["Inbound boundary", "Signature is verified before persistence; unknown sender stays unclaimed."],
          ["Retry safety", "Repeated externalMessageId is deduplicated."],
          ["Handoff", "HUMAN_HANDOFF assigns the authenticated operator and prevents competing ownership."],
          ["Timeline", "MESSAGE_INBOUND / MESSAGE_OUTBOUND activities are attached to CRM context."],
          ["Provider proof", "Live configured channels are exercised separately from simulation."],
          ["Evidence", "Record Message IDs, Conversation ID, provider result, timestamp and test channel."],
          ["Production", "After acceptance, run CI, deploy, verify health, then repeat one controlled production test."],
        ].map(([title,detail],i)=><div key={title} className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"><div className="text-xs font-black text-[#0F3E8A]">0{i+1}</div><div className="mt-1 font-black">{title}</div><div className="mt-1 text-sm leading-5 text-slate-500">{detail}</div></div>)}
      </div>
    </section>

    <div className="mt-6 flex flex-wrap gap-3">
      <a href="/dashboard/customers" className="rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">Customers & timelines</a>
      <a href="/dashboard/leads" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Leads</a>
      <a href="/dashboard/journey" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Visitor journeys</a>
    </div>
  </div>;
}
