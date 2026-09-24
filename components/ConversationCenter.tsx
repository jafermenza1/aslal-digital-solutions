"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Conversation = {
  id: string; channel: string; status: string; assignedTo: string | null;
  personId: string | null; leadId: string | null; customerId: string | null; opportunityId: string | null;
  externalThreadId: string | null; lastMessageAt: Date | null; updatedAt: Date;
  person: { id: string; name: string | null; email: string | null; phone: string | null } | null;
  lead: { id: string; name: string; email: string | null; phone: string | null; company: string | null; businessType: string | null; status: string; score: number; ownerEmail: string | null; nextAction: string | null; nextActionDueAt: Date | null } | null;
  customer: { id: string; name: string; email: string | null; phone: string | null } | null;
  messages: { id: string; direction: string; status: string; body: string; createdAt: Date; senderAddress: string | null; recipientAddress: string | null }[];
};

type Diagnostic = {
  ok: boolean; smtp?: { ok: boolean; host: string; port: number; user: string; passwordConfigured: boolean; secure: boolean; requireTLS: boolean; error?: string };
  imap?: { ok: boolean; host: string; port: number; user: string; passwordConfigured: boolean; secure: boolean; mailbox: string; error?: string };
};

const filters = ["ALL", "NEEDS_ATTENTION", "EMAIL", "OPEN", "CLOSED"] as const;

export default function ConversationCenter({ initialConversations, viewer }: { initialConversations: Conversation[]; viewer: string }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || "");
  const [messages, setMessages] = useState<Conversation["messages"]>(initialConversations[0]?.messages || []);
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<"queue"|"conversation"|"email">("queue");

  const stats = useMemo(() => ({
    total: conversations.length,
    open: conversations.filter(c => c.status === "OPEN").length,
    handoff: conversations.filter(c => c.status === "HUMAN_HANDOFF").length,
    closed: conversations.filter(c => c.status === "CLOSED").length,
    email: conversations.filter(c => c.channel === "EMAIL").length,
  }), [conversations]);

  const visible = useMemo(() => conversations.filter(c => {
    const contact = c.person || c.customer || c.lead;
    const haystack = [contact?.name, contact?.email, contact?.phone, c.channel, c.lead?.company].filter(Boolean).join(" ").toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (filter === "NEEDS_ATTENTION") return c.status === "HUMAN_HANDOFF" || c.status === "OPEN";
    if (filter === "EMAIL") return c.channel === "EMAIL";
    if (filter === "OPEN") return c.status === "OPEN" || c.status === "HUMAN_HANDOFF";
    if (filter === "CLOSED") return c.status === "CLOSED";
    return true;
  }), [conversations, filter, search]);

  const selected = useMemo(() => conversations.find(c => c.id === selectedId) || null, [conversations, selectedId]);
  const contact = selected?.person || selected?.customer || selected?.lead || null;

  async function loadMessages(id: string) {
    const response = await fetch("/api/conversations/" + id + "/messages", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setMessages(data.messages || []);
    else setNotice(data.error || "Could not load messages.");
  }

  async function changeStatus(status: "OPEN" | "CLOSED") {
    if (!selected) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/" + selected.id + "/status", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Status update failed."); return; }
    setConversations(current => current.map(c => c.id === selected.id ? { ...c, status: data.conversation.status, assignedTo: data.conversation.assignedTo } : c));
    setNotice(status === "CLOSED" ? "Conversation closed. It remains in the CRM history." : "Conversation reopened.");
  }

  async function handoff(action: "handoff" | "release") {
    if (!selected) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/" + selected.id + "/handoff", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Ownership update failed."); return; }
    setConversations(current => current.map(c => c.id === selected.id ? { ...c, status: data.conversation.status, assignedTo: data.conversation.assignedTo } : c));
    setNotice(action === "handoff" ? "Conversation assigned to you." : "Human ownership released.");
  }

  async function send() {
    if (!selected || !body.trim() || !recipient.trim()) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/" + selected.id + "/messages", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ body, recipient, subject }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Message could not be sent."); return; }
    setBody(""); setNotice("Message sent and recorded in the customer timeline.");
    await loadMessages(selected.id);
  }

  async function checkInbox() {
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/email-inbox", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    setNotice(response.ok ? `Inbox checked — ${data.processed || 0} message(s) processed.` : (data.error || "Inbox check failed."));
  }

  async function diagnostics() {
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/email-diagnostics", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Email diagnostics failed."); return; }
    setDiagnostic(data); setNotice(data.ok ? "Email transport is authenticated and ready." : "Check the email provider details below.");
  }

  return (
    <div className="space-y-6 text-white">
      <header className="portal-card p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Admin workspace / Conversations</div>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Conversation command center</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Capture → qualify → respond → assign ownership → follow up → close. Email, handoff and provider health are managed from one operational queue.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[["All",stats.total],["Open",stats.open],["Handoff",stats.handoff],["Email",stats.email],["Closed",stats.closed]].map(([label,value]) => (
              <button key={String(label)} onClick={() => setFilter(label === "All" ? "ALL" : label === "Handoff" ? "NEEDS_ATTENTION" : String(label).toUpperCase() as (typeof filters)[number])} className="rounded-xl bg-white/[.06] px-4 py-3 text-left">
                <div className="text-[10px] font-bold uppercase text-white/40">{label}</div><div className="mt-1 text-xl font-black">{value}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[.03] p-2" role="tablist" aria-label="Conversation workspace"><button type="button" role="tab" aria-selected={workspaceTab==="queue"} onClick={()=>setWorkspaceTab("queue")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(workspaceTab==="queue"?"bg-[#E2B02A] text-[#1E293B]":"text-white/60")}>Queue</button><button type="button" role="tab" aria-selected={workspaceTab==="conversation"} onClick={()=>setWorkspaceTab("conversation")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(workspaceTab==="conversation"?"bg-[#E2B02A] text-[#1E293B]":"text-white/60")}>Conversation</button><button type="button" role="tab" aria-selected={workspaceTab==="email"} onClick={()=>setWorkspaceTab("email")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(workspaceTab==="email"?"bg-[#E2B02A] text-[#1E293B]":"text-white/60")}>Email tools</button></div>

      {workspaceTab === "queue" && <section className="portal-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === f ? "bg-[#E2B02A] text-[#1E293B]" : "bg-white/[.06] text-white/65"}`}>{f === "NEEDS_ATTENTION" ? "Needs attention" : f}</button>)}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search person, company, email…" className="w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white placeholder:text-white/30 lg:max-w-sm" />
        </div>
        <div className="mt-4 text-xs text-white/35">Showing {visible.length} matching conversations. Open a row to work in the Conversation tab.</div>
      </section>}

      {workspaceTab === "conversation" && <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <section className="portal-card overflow-hidden">
          <div className="border-b border-white/10 p-4"><div className="flex justify-between"><h2 className="font-black">Work queue</h2><span className="text-xs text-white/35">{visible.length}</span></div></div>
          <div className="max-h-[720px] overflow-y-auto p-2">
            {visible.map(c => {
              const identity = c.person?.name || c.customer?.name || c.lead?.name || "Unclaimed sender";
              const last = c.messages[0];
              return <button key={c.id} onClick={() => { setSelectedId(c.id); setRecipient(c.person?.email || c.customer?.email || c.lead?.email || last?.senderAddress || ""); setSubject(c.channel === "EMAIL" ? "Re: " : ""); void loadMessages(c.id); }} className={`w-full rounded-2xl p-4 text-left ${selectedId === c.id ? "bg-[#0F3E8A]" : "hover:bg-white/[.04]"}`}>
                <div className="flex items-center justify-between gap-2"><b className="truncate">{identity}</b><span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-black">{c.channel}</span></div>
                {c.lead?.company && <div className="mt-1 truncate text-[11px] text-white/40">{c.lead.company} · {c.lead.businessType || "business"}</div>}
                <div className="mt-2 truncate text-xs text-white/55">{last?.body || "No messages yet"}</div>
                <div className="mt-2 flex justify-between text-[10px] text-white/35"><span>{c.status === "HUMAN_HANDOFF" ? "Human · " + (c.assignedTo || "unassigned") : c.status}</span><span>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : "—"}</span></div>
              </button>;
            })}
            {!visible.length && <div className="p-10 text-center text-sm text-white/40">No conversations match this queue.</div>}
          </div>
        </section>

        <section className="portal-card min-w-0 p-5 sm:p-6">
          {!selected ? <div className="py-24 text-center text-white/40">No conversation selected.</div> : <>
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">{selected.channel} · {selected.status}</div><h2 className="mt-1 text-2xl font-black">{contact?.name || "Unclaimed sender"}</h2><p className="mt-1 break-all text-sm text-white/45">{contact?.email || contact?.phone || "No verified contact address"}</p></div>
              <div className="flex flex-wrap gap-2">
                {(selected.status !== "HUMAN_HANDOFF" || selected.assignedTo !== viewer) && <button onClick={() => void handoff("handoff")} disabled={busy} className="rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-xs font-black">Take ownership</button>}
                {selected.status === "HUMAN_HANDOFF" && selected.assignedTo === viewer && <button onClick={() => void handoff("release")} disabled={busy} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black">Release</button>}
                {selected.status === "CLOSED" ? <button onClick={() => void changeStatus("OPEN")} disabled={busy} className="rounded-xl border border-emerald-400/30 px-4 py-2.5 text-xs font-black text-emerald-300">Reopen</button> : <button onClick={() => void changeStatus("CLOSED")} disabled={busy} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black">Close</button>}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="min-w-0">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[.18em] text-white/35">Conversation timeline</div>
                <div className="max-h-[510px] space-y-3 overflow-y-auto pr-1">
                  {messages.map(m => <div key={m.id} className={`max-w-[88%] rounded-2xl p-4 ${m.direction === "OUTBOUND" ? "ml-auto bg-[#0F3E8A]" : "bg-white/[.07]"}`}><div className="whitespace-pre-wrap text-sm leading-6">{m.body}</div><div className="mt-2 text-[10px] text-white/35">{m.direction} · {m.status} · {new Date(m.createdAt).toLocaleString()}</div></div>)}
                  {!messages.length && <p className="py-16 text-center text-sm text-white/35">No messages in this conversation.</p>}
                </div>
              </div>

              <aside className="rounded-2xl bg-white/[.04] p-4">
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">Business workflow</div>
                {selected.lead ? <>
                  <div className="mt-4 text-xs text-white/40">Lead stage</div><div className="mt-1 font-black">{selected.lead.status} · score {selected.lead.score}</div>
                  <div className="mt-3 text-xs text-white/40">Owner</div><div className="mt-1 text-sm font-bold">{selected.lead.ownerEmail || "Unassigned"}</div>
                  <div className="mt-3 text-xs text-white/40">Next action</div><div className="mt-1 text-sm font-bold">{selected.lead.nextAction || "No next action recorded"}</div>
                  {selected.lead.nextActionDueAt && <div className="mt-1 text-xs text-white/40">Due {new Date(selected.lead.nextActionDueAt).toLocaleString()}</div>}
                  <Link href={`/dashboard/leads/${selected.lead.id}`} className="mt-5 block rounded-xl bg-[#E2B02A] px-4 py-3 text-center text-xs font-black text-[#1E293B]">Open lead workflow ↗</Link>
                </> : <p className="mt-4 text-sm text-white/45">This conversation is not linked to a lead yet. Resolve identity before treating it as sales demand.</p>}
              </aside>
            </div>

            {notice && <div className="mt-5 rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm text-white/65">{notice}</div>}
            {selected.status !== "CLOSED" && <div className="mt-5 border-t border-white/10 pt-5">
              <div className="mb-3 text-[10px] font-black uppercase tracking-[.18em] text-white/35">Reply / next touch</div>
              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]"><input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient address" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" /><input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (Email)" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" /></div>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write the next customer-facing response…" rows={4} className="mt-3 w-full rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" />
              <button onClick={() => void send()} disabled={busy || !body.trim() || !recipient.trim()} className="mt-3 rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B] disabled:opacity-40">{busy ? "Working…" : "Send & record response"}</button>
            </div>}
          </>}
        </section>
      </div>}

      {workspaceTab === "email" && <section className="portal-card p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Email tools</h2><p className="mt-1 text-sm text-white/45">Check the mailbox and verify SMTP/IMAP connectivity without cluttering the queue.</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>void checkInbox()} disabled={busy} className="rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-xs font-black">Check email inbox</button><button onClick={()=>void diagnostics()} disabled={busy} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-white/75">Test email connection</button></div></div>{diagnostic&&<div className="mt-5 grid gap-3 sm:grid-cols-2">{([["SMTP",diagnostic.smtp],["IMAP",diagnostic.imap]] as const).map(([name,p])=><div key={name} className="rounded-xl border border-white/10 bg-white/[.04] p-4"><div className="flex justify-between"><b>{name}</b><span className={p?.ok?"text-emerald-300":"text-rose-300"}>{p?.ok?"READY":"FAILED"}</span></div><div className="mt-2 text-xs leading-5 text-white/45">{p?.host||"not configured"}:{p?.port} · {p?.user||"no mailbox"} · password {p?.passwordConfigured?"loaded":"missing"}</div>{p?.error&&<div className="mt-2 text-xs font-bold text-rose-300">{p.error}</div>}</div>)}</div>}</section>}
    </div>
  );
}
