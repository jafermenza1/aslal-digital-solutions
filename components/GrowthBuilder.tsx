"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { publicCommerceIntents, type PublicCommerceIntentKey } from "@/lib/public-commerce-contract";
import { getCopy } from "@/lib/i18n";

const stages: { key: PublicCommerceIntentKey; label: string }[] = publicCommerceIntents.map((intent) => ({
  key: intent.key,
  label: getCopy("en").commerce.intents[intent.key],
}));
const channels = ["TikTok", "Telegram", "Facebook", "Website", "Instagram", "WhatsApp", "Other"];

function initialStage(): PublicCommerceIntentKey {
  if (typeof window === "undefined") return stages[0].key;
  const goal = new URLSearchParams(window.location.search).get("goal")?.toLowerCase() || "";
  const match = stages.find((item) => item.key.toLowerCase() === goal || item.label.toLowerCase() === goal);
  return match?.key || stages[0].key;
}

export function GrowthBuilder() {
  const router = useRouter();
  const [stage, setStage] = useState<PublicCommerceIntentKey>(initialStage);
  const [selected, setSelected] = useState<string[]>([]);
  const stageLabel = useMemo(() => stages.find((item) => item.key === stage)?.label || stages[0].label, [stage]);

  function toggle(channel: string) {
    setSelected((current) => current.includes(channel) ? current.filter((x) => x !== channel) : [...current, channel]);
  }

  function continueToContact() {
    const params = new URLSearchParams({ goal: stage, channels: selected.join(",") });
    router.push("/contact?" + params.toString());
  }

  return <div className="grid gap-6 lg:grid-cols-[1fr_.7fr]">
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-8">
      <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Start simple</div>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">What are you trying to improve?</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {stages.map((item) => {
          const active = stage === item.key;
          return <button key={item.key} type="button" onClick={() => setStage(item.key)} aria-pressed={active} className={"flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-4 text-left font-bold transition " + (active ? "border-[#0F3E8A] bg-[#0F3E8A] text-white shadow-lg" : "border-slate-200 bg-[#F8FAFC] text-[#1E293B] hover:-translate-y-0.5 hover:border-[#0F3E8A]/30")}>
            <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border " + (active ? "border-white bg-white text-[#0F3E8A]" : "border-slate-300 bg-white")}>{active ? "✓" : ""}</span>
            {item.label}
          </button>;
        })}
      </div>

      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Next</div>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Which channels matter?</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            const active = selected.includes(channel);
            return <button key={channel} type="button" onClick={() => toggle(channel)} aria-pressed={active} className={"flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition " + (active ? "border-[#E2B02A] bg-[#E2B02A]/15 text-[#1E293B]" : "border-slate-200 bg-white text-slate-600 hover:border-[#0F3E8A]/30")}>
              <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border " + (active ? "border-[#0F3E8A] bg-[#0F3E8A] text-white" : "border-slate-300 bg-white")}>{active ? "✓" : ""}</span>
              {channel}
            </button>;
          })}
        </div>
      </div>
    </div>

    <aside className="relative overflow-hidden rounded-[2rem] bg-[#0F3E8A] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#E2B02A]/20 pulse-ring" aria-hidden="true" />
      <div className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Your starting point</div>
      <h2 className="relative z-10 mt-4 text-3xl font-black">{stageLabel}</h2>
      <p className="relative z-10 mt-4 leading-7 text-white/75">We will attach this starting point and your preferred channels to the conversation so you do not have to explain the same thing twice.</p>
      <div className="relative z-10 mt-7 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[.07] px-4 py-3 font-semibold">Goal: {stageLabel}</div>
        <div className="rounded-xl border border-white/10 bg-white/[.07] px-4 py-3 font-semibold">Channels: {selected.length ? selected.join(", ") : "We can discuss this with you"}</div>
      </div>
      <button type="button" onClick={continueToContact} className="relative z-10 mt-8 w-full rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] shadow-[0_12px_45px_rgba(226,176,42,.18)] transition hover:-translate-y-0.5">Show me where to start →</button>
    </aside>
  </div>;
}
