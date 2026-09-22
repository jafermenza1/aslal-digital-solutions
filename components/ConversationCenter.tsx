"use client";

import { useMemo, useState } from "react";

type Conversation = {
  id: string; channel: string; status: string; assignedTo: string | null;
  personId: string | null; leadId: string | null; customerId: string | null; opportunityId: string | null;
  externalThreadId: string | null; lastMessageAt: Date | null; updatedAt: Date;
  person: { id: string; name: string | null; email: string | null; phone: string | null } | null;
  lead: { id: string; name: string; email: string | null; phone: string | null } | null;
  customer: { id: string; name: string; email: string | null; phone: string | null } | null;
  messages: { id: string; direction: string; status: string; body: string; createdAt: Date; senderAddress: string | null; recipientAddress: string | null }[];
};

export default function ConversationCenter({ initialConversations, viewer }: { initialConversations: Conversation[]; viewer: string }) {
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || "");
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState<Conversation["messages"]>(initialConversations[0]?.messages || []);
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const selected = useMemo(() => conversations.find(c => c.id === selectedId) || null, [conversations, selectedId]);
  const contact = selected?.person || selected?.customer || selected?.lead || null;

  async function loadMessages(id: string) {
    const response = await fetch("/api/conversations/" + id + "/messages", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setMessages(data.messages || []);
  }

  async function send() {
    if (!selected || !body.trim() || !recipient.trim()) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/" + selected.id + "/messages", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ body, recipient }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Message could not be sent."); return; }
    setBody(""); setNotice("Message sent and recorded in the customer timeline.");
    await loadMessages(selected.id);
  }

  async function handoff(action: "handoff" | "release") {
    if (!selected) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/conversations/" + selected.id + "/handoff", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setNotice(data.error || "Handoff update failed."); return; }
    setConversations(current => current.map(c => c.id === selected.id ? { ...c, status: data.conversation.status, assignedTo: data.conversation.assignedTo } : c));
    setNotice(action === "handoff" ? "Conversation assigned to you." : "Human handoff released.");
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-black">Conversations</h2><span className="text-xs text-slate-400">{conversations.length}</span></div>
        <div className="space-y-2">
          {conversations.map(c => {
            const identity = c.person?.name || c.customer?.name || c.lead?.name || "Unclaimed sender";
            const last = c.messages[0];
            return <button key={c.id} onClick={() => {
                setSelectedId(c.id);
                void loadMessages(c.id);
              }} className={"w-full rounded-2xl border p-4 text-left " + (selectedId === c.id ? "border-[#0F3E8A] bg-blue-50" : "border-slate-100 hover:bg-slate-50")}>
              <div className="flex items-center justify-between gap-2"><b className="truncate">{identity}</b><span className="text-[10px] font-black">{c.channel}</span></div>
              <div className="mt-1 truncate text-xs text-slate-500">{last?.body || "No messages yet"}</div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>{c.status === "HUMAN_HANDOFF" ? "Human: " + (c.assignedTo || "unassigned") : c.status}</span><span>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : "—"}</span></div>
            </button>;
          })}
          {!conversations.length && <p className="py-12 text-center text-sm text-slate-500">No conversations yet. Configure a provider or run the controlled Phase 4 suite.</p>}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        {!selected ? <div className="py-20 text-center text-slate-500">Select a conversation.</div> : <>
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row">
            <div><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">{selected.channel} · {selected.status}</div><h2 className="mt-1 text-2xl font-black">{contact?.name || "Unclaimed sender"}</h2><p className="mt-1 text-sm text-slate-500">{contact?.email || contact?.phone || "No verified contact address"} · Conversation {selected.id}</p></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handoff("handoff")} disabled={busy || (selected.status === "HUMAN_HANDOFF" && selected.assignedTo === viewer)} className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-xs font-black text-white disabled:opacity-40">Take handoff</button>
              {selected.status === "HUMAN_HANDOFF" && <button onClick={() => handoff("release")} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black">Release</button>}
            </div>
          </div>
          <div className="my-5 max-h-[480px] space-y-3 overflow-y-auto">
            {messages.map(m => <div key={m.id} className={"max-w-[85%] rounded-2xl p-4 " + (m.direction === "OUTBOUND" ? "ml-auto bg-[#0F3E8A] text-white" : "bg-slate-100 text-slate-900")}><div className="text-sm whitespace-pre-wrap">{m.body}</div><div className={"mt-2 text-[10px] " + (m.direction === "OUTBOUND" ? "text-white/60" : "text-slate-400")}>{m.direction} · {m.status} · {new Date(m.createdAt).toLocaleString()}</div></div>)}
            {!messages.length && <p className="py-16 text-center text-sm text-slate-400">No messages in this conversation.</p>}
          </div>
          <div className="border-t border-slate-100 pt-5">
            {notice && <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{notice}</div>}
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]"><input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient address" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" /><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a message…" rows={3} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div>
            <button onClick={send} disabled={busy || !body.trim() || !recipient.trim()} className="mt-3 rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B] disabled:opacity-40">{busy ? "Working…" : "Send message"}</button>
          </div>
        </>}
      </section>
    </div>
  );
}
