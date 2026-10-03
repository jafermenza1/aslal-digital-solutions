"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { publicCommerceIntents, type PublicCommerceIntentKey } from "@/lib/public-commerce-contract";
import { getCopy } from "@/lib/i18n";

const stages: { key: PublicCommerceIntentKey; label: string }[] = publicCommerceIntents.map((intent) => ({
  key: intent.key,
  label: getCopy("en").commerce.intents[intent.key],
}));
const channels = ["Website", "WhatsApp", "Telegram", "SEO", "CRM", "E-commerce"];

export function GrowthBuilder() {
  const router = useRouter();
  const [stage, setStage] = useState<PublicCommerceIntentKey>(stages[0].key);
  const [selected, setSelected] = useState<string[]>(["Website"]);
  const [business, setBusiness] = useState("");
  const stageLabel = stages.find((item) => item.key === stage)?.label || stages[0].label;
  const summary = useMemo(() => `${stageLabel} through ${selected.join(", ") || "your digital channels"}.`, [stageLabel, selected]);

  function toggle(channel: string) { setSelected((current) => current.includes(channel) ? current.filter((x) => x !== channel) : [...current, channel]); }

  function continueToContact() {
    const params = new URLSearchParams({ business, goal: stage, channels: selected.join(", ") });
    router.push(`/contact?${params.toString()}`);
  }

  return <div className="grid gap-8 lg:grid-cols-[1fr_.8fr]">
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-blue-900/5 sm:p-9">
      <label className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">01 • Business</label>
      <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business or organization" className="mt-3 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 outline-none transition focus:border-[#0F3E8A] focus:ring-4 focus:ring-blue-900/10" />
      <label className="mt-8 block text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">02 • What do you want to achieve?</label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{stages.map((item) => <button key={item.key} type="button" onClick={() => setStage(item.key)} className={`rounded-2xl border px-4 py-4 text-left font-bold transition ${stage === item.key ? "border-[#0F3E8A] bg-[#0F3E8A] text-white shadow-lg" : "border-slate-200 bg-[#F8FAFC] hover:-translate-y-0.5"}`}>{item.label}</button>)}</div>
      <label className="mt-8 block text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">03 • Where do you want to work with customers?</label>
      <div className="mt-3 flex flex-wrap gap-2">{channels.map((channel) => <button key={channel} type="button" onClick={() => toggle(channel)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selected.includes(channel) ? "border-[#E2B02A] bg-[#E2B02A]/15 text-[#1E293B]" : "border-slate-200 text-slate-600 hover:border-[#0F3E8A]/30"}`}>{channel}</button>)}</div>
    </div>
    <div className="relative overflow-hidden rounded-[2rem] bg-[#0F3E8A] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#E2B02A]/20 pulse-ring" />
      <div className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Your starting point</div>
      <h2 className="relative z-10 mt-5 text-3xl font-black tracking-tight">{stageLabel}</h2>
      <p className="relative z-10 mt-4 leading-7 text-white/70">{summary}</p>
      <div className="relative z-10 mt-8 space-y-3">{selected.map((channel, i) => <div key={channel} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.07] px-4 py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#E2B02A] text-xs font-black text-[#1E293B]">{i + 1}</span><span className="font-semibold">{channel}</span></div>)}</div>
      <button type="button" onClick={continueToContact} className="glow-button relative z-10 mt-8 w-full rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Turn this into a plan →</button>
    </div>
  </div>;
}
