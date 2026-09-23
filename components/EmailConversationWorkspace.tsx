"use client";

import { useState } from "react";

type Result = { ok: boolean; status?: string; messageId?: string; conversationId?: string; providerMessageId?: string | null; providerResult?: unknown; error?: string };
type InboxResult = { ok: boolean; processed?: number; results?: Array<Record<string, unknown>>; error?: string };

export default function EmailConversationWorkspace() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("Aslal Digital Solutions — Email workflow test");
  const [message, setMessage] = useState("This is a live Email workflow test from the Aslal Digital Solutions Conversation Center.");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<"send" | "inbox" | "simulate-sent" | "simulate-failed" | "">("");
  const [result, setResult] = useState<Result | null>(null);
  const [inbox, setInbox] = useState<InboxResult | null>(null);

  async function send(mode: "" | "success" | "failure") {
    if (!recipient.trim() || !message.trim() || !confirmed) return;
    setBusy(mode === "success" ? "simulate-sent" : mode === "failure" ? "simulate-failed" : "send");
    setResult(null);
    const response = await fetch("/api/conversations/email-test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipient, subject, body: message, confirmed, ...(mode ? { simulation: mode } : {}) }),
    });
    const data = await response.json().catch(() => ({}));
    setResult(data);
    setBusy("");
  }

  async function checkInbox() {
    setBusy("inbox"); setInbox(null);
    const response = await fetch("/api/conversations/email-inbox", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setInbox(data); setBusy("");
  }

  return <div className="mt-8 space-y-6">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Phase 4 · Email</div>
          <h2 className="mt-2 text-3xl font-black">Email provider workflow</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">This screen is the Email-specific operational path: live SMTP send → persisted SENT/FAILED → IMAP inbox polling → inbound conversation creation and idempotency.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Acceptance mode not required</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-bold">Test recipient
          <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-medium" />
        </label>
        <label className="text-sm font-bold">Subject
          <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-medium" />
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold">Message
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-medium" />
      </label>
      <label className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
        <span>I confirm this is an authorized test recipient. The live button sends through the configured production SMTP provider.</span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => void send("")} disabled={busy !== "" || !recipient.trim() || !message.trim() || !confirmed} className="rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white disabled:opacity-40">{busy === "send" ? "Sending…" : "1. Send live SMTP test"}</button>
        <button onClick={() => void send("success")} disabled={busy !== "" || !recipient.trim() || !message.trim() || !confirmed} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black disabled:opacity-40">{busy === "simulate-sent" ? "Running…" : "Simulate SENT"}</button>
        <button onClick={() => void send("failure")} disabled={busy !== "" || !recipient.trim() || !message.trim() || !confirmed} className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 disabled:opacity-40">{busy === "simulate-failed" ? "Running…" : "Simulate FAILED"}</button>
        <button onClick={() => void checkInbox()} disabled={busy !== ""} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">{busy === "inbox" ? "Checking IMAP…" : "2. Check Email Inbox Now"}</button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={"rounded-2xl border p-5 " + (result?.status === "SENT" ? "border-emerald-200 bg-emerald-50" : result?.status === "FAILED" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50")}>
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">SMTP result</div>
          {!result ? <p className="mt-2 text-sm text-slate-500">Run a live or simulated send.</p> : <>
            <div className="mt-2 text-2xl font-black">{result.status || "ERROR"}</div>
            {result.messageId && <div className="mt-2 break-all text-xs text-slate-600">CRM Message ID: <code>{result.messageId}</code></div>}
            {result.conversationId && <div className="mt-1 break-all text-xs text-slate-600">Conversation ID: <code>{result.conversationId}</code></div>}
            {result.providerMessageId && <div className="mt-1 break-all text-xs text-slate-600">Provider Message ID: <code>{result.providerMessageId}</code></div>}
            {result.error && <div className="mt-2 text-sm font-bold text-rose-700">{result.error}</div>}
            {result.providerResult && <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{JSON.stringify(result.providerResult, null, 2)}</pre>}
          </>}
        </div>
        <div className={"rounded-2xl border p-5 " + (inbox?.ok ? "border-emerald-200 bg-emerald-50" : inbox ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50")}>
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">IMAP inbox</div>
          {!inbox ? <p className="mt-2 text-sm text-slate-500">Run the inbox check after sending or receiving a test email.</p> : <>
            <div className="mt-2 text-2xl font-black">{inbox.ok ? "CHECKED" : "FAILED"}</div>
            {inbox.processed !== undefined && <div className="mt-1 text-sm font-bold">Processed: {inbox.processed}</div>}
            {inbox.results && <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">{JSON.stringify(inbox.results, null, 2)}</pre>}
            {inbox.error && <div className="mt-2 text-sm font-bold text-rose-700">{inbox.error}</div>}
          </>}
        </div>
      </div>
    </section>

    <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-black">Email acceptance sequence</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["01", "SMTP", "Send to an authorized mailbox; provider response is persisted."],
          ["02", "Lifecycle", "Provider success becomes SENT; provider exception becomes FAILED."],
          ["03", "IMAP", "Check INBOX; unseen mail is parsed and persisted as inbound."],
          ["04", "Safety", "Message-ID deduplication, identity linking and closed-thread handling are exercised."],
        ].map(([n,t,d]) => <div key={n} className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"><div className="text-xs font-black text-[#0F3E8A]">{n}</div><div className="mt-1 font-black">{t}</div><div className="mt-1 text-sm leading-5 text-slate-500">{d}</div></div>)}
      </div>
    </section>
  </div>;
}
