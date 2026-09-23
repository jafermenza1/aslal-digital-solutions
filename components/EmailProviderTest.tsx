"use client";

import { useState } from "react";

type Result = { ok: boolean; status: "SENT" | "FAILED"; messageId?: string; conversationId?: string; providerMessageId?: string | null; error?: string };

export default function EmailProviderTest() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("Aslal Digital Solutions — Email provider test");
  const [body, setBody] = useState("This is a live SMTP test from the Aslal Digital Solutions Conversation Center.");
  const [simulation, setSimulation] = useState<"" | "success" | "failure">("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(mode: "" | "success" | "failure") {
    if (!recipient.trim() || !body.trim()) return;
    setBusy(true); setResult(null); setSimulation(mode);
    const response = await fetch("/api/conversations/email-test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recipient, subject, body, ...(mode ? { simulation: mode } : {}) }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false); setResult(data);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Live Email</div>
          <h2 className="mt-1 text-2xl font-black">SMTP provider test</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Sends through the configured SMTP provider and writes the result to a real Conversation message as SENT or FAILED. The recipient must already exist in the CRM with Email consent.</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Acceptance mode not required</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient email" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      </div>
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      <div className="mt-3 flex flex-wrap gap-3">
        <button onClick={() => void submit("")} disabled={busy || !recipient.trim() || !body.trim()} className="rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-40">{busy ? "Sending…" : "Send live provider test"}</button>
        <button onClick={() => void submit("success")} disabled={busy || !recipient.trim() || !body.trim()} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black disabled:opacity-40">Simulate SENT</button>
        <button onClick={() => void submit("failure")} disabled={busy || !recipient.trim() || !body.trim()} className="rounded-xl border border-rose-200 px-4 py-3 text-xs font-black text-rose-700 disabled:opacity-40">Simulate FAILED</button>
      </div>
      {result && <div className={"mt-4 rounded-2xl border p-4 " + (result.status === "SENT" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black uppercase tracking-wider">Result</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black">{result.status}</span></div>
        <div className="mt-2 grid gap-1 text-xs text-slate-600">
          {result.messageId && <div>Message: <code>{result.messageId}</code></div>}
          {result.conversationId && <div>Conversation: <code>{result.conversationId}</code></div>}
          {result.providerMessageId && <div>Provider Message-ID: <code>{result.providerMessageId}</code></div>}
          {result.error && <div className="font-bold text-rose-700">Error: {result.error}</div>}
        </div>
      </div>}
    </section>
  );
}
