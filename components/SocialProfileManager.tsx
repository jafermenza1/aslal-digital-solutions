"use client";

import { useState } from "react";
import { Facebook, Instagram, Linkedin, MessageCircle, Send, Music2, Youtube, Twitter } from "lucide-react";

const platforms = ["facebook","instagram","tiktok","linkedin","whatsapp","telegram","youtube","x"] as const;
const icons = { facebook: Facebook, instagram: Instagram, tiktok: Music2, linkedin: Linkedin, whatsapp: MessageCircle, telegram: Send, youtube: Youtube, x: Twitter };

type Item = {
  id: string;
  platform: string;
  label: string;
  url: string;
  handle: string | null;
  display_order: number;
  is_active: number;
};

export function SocialProfileManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Item | null>(null);
  const [notice, setNotice] = useState("");

  const blank = (): Item => ({
    id: "",
    platform: "facebook",
    label: "Facebook",
    url: "",
    handle: null,
    display_order: items.length,
    is_active: 1,
  });

  const edit = (item: Item) => setDraft({ ...item });
  const field = (key: keyof Item, value: unknown) => setDraft((current) => current ? { ...current, [key]: value } : current);

  async function save() {
    if (!draft) return;
    setNotice("Saving…");
    const response = await fetch("/api/admin/social-profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(data.error || "Could not save.");
      return;
    }
    setNotice("Saved.");
    window.location.reload();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this social profile?")) return;
    const response = await fetch("/api/admin/social-profiles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) window.location.reload();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await Promise.all(next.map((item, order) =>
      fetch("/api/admin/social-profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, displayOrder: order }),
      })
    ));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_.8fr]">
      <section className="space-y-3">
        {items.map((item, index) => {
          const Icon = icons[item.platform as keyof typeof icons] || GlobeFallback;
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0F3E8A] text-[#E2B02A]">
                <Icon size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black uppercase tracking-[.12em] text-[#0F3E8A]">{item.platform} · {item.is_active ? "Visible" : "Hidden"}</div>
                <h2 className="font-black">{item.label}</h2>
                <p className="truncate text-sm text-slate-500">{item.url}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void move(index, -1)} disabled={index === 0} className="rounded-full border px-3 py-2 font-black">↑</button>
                <button type="button" onClick={() => edit(item)} className="rounded-full bg-[#0F3E8A] px-4 py-2 text-sm font-black text-white">Edit</button>
                <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-200 px-3 py-2 text-sm font-bold text-red-700">×</button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-7">
        {draft ? (
          <>
            <h2 className="text-2xl font-black">{draft.id ? "Edit social profile" : "Add social profile"}</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-bold">
                Platform
                <select className="mt-1 w-full rounded-xl border p-3" value={draft.platform} onChange={(event) => {
                  const platform = event.target.value;
                  field("platform", platform);
                  field("label", platform.charAt(0).toUpperCase() + platform.slice(1));
                }}>
                  {platforms.map((platform) => <option key={platform}>{platform}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold">Label<input className="mt-1 w-full rounded-xl border p-3" value={draft.label} onChange={(event) => field("label", event.target.value)} /></label>
              <label className="block text-sm font-bold">Profile URL<input className="mt-1 w-full rounded-xl border p-3" placeholder="https://..." value={draft.url} onChange={(event) => field("url", event.target.value)} /></label>
              <label className="block text-sm font-bold">Handle <span className="font-normal text-slate-400">(optional)</span><input className="mt-1 w-full rounded-xl border p-3" value={draft.handle || ""} onChange={(event) => field("handle", event.target.value || null)} /></label>
              <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => field("is_active", event.target.checked ? 1 : 0)} /> Visible on website</label>
              <button type="button" onClick={() => void save()} className="w-full rounded-full bg-[#E2B02A] px-5 py-3 font-black">Save social profile</button>
              {notice && <p className="text-sm text-slate-500">{notice}</p>}
            </div>
          </>
        ) : (
          <button type="button" onClick={() => setDraft(blank())} className="w-full rounded-2xl border-2 border-dashed border-slate-300 p-10 font-black text-[#0F3E8A]">+ Add social profile</button>
        )}
      </section>
    </div>
  );
}

function GlobeFallback() {
  return <span className="text-xl">◎</span>;
}
