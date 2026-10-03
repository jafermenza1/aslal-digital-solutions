"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type RoiCopy = {
  visitors:string; aov:string; current:string; lift:string; estimate:string; claim:string;
};

export function HomeRoiEstimator({t}:{t:RoiCopy}) {
  const [visitors,setVisitors]=useState(10000);
  const [aov,setAov]=useState(1500);
  const current=visitors*0.01*aov;
  const annualLift=(visitors*0.035*aov-current)*12;

  return <div className="mt-12 grid gap-8 rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-sm lg:grid-cols-2 lg:p-10">
    <div className="space-y-8">
      <label className="block">
        <span className="flex justify-between text-sm font-bold text-slate-700"><span>{t.visitors}</span><b className="text-[#0F3E8A]">{visitors.toLocaleString()}</b></span>
        <input aria-label={t.visitors} type="range" min="1000" max="100000" step="1000" value={visitors} onChange={e=>setVisitors(Number(e.target.value))} className="mt-4 h-2 w-full cursor-pointer accent-[#0F3E8A]"/>
      </label>
      <label className="block">
        <span className="flex justify-between text-sm font-bold text-slate-700"><span>{t.aov}</span><b className="text-[#0F3E8A]">{aov.toLocaleString()}</b></span>
        <input aria-label={t.aov} type="range" min="100" max="10000" step="100" value={aov} onChange={e=>setAov(Number(e.target.value))} className="mt-4 h-2 w-full cursor-pointer accent-[#0F3E8A]"/>
      </label>
      <div className="rounded-2xl border border-[#0F3E8A]/10 bg-white p-5">
        <div className="flex items-center gap-3"><Sparkles size={18} className="text-[#E2B02A]"/><p className="text-sm font-bold text-[#1E293B]">{t.estimate}</p></div>
        <div className="mt-5 flex items-end gap-2"><div className="h-3 w-1/4 rounded-full bg-[#0F3E8A]/20"/><div className="h-6 w-2/4 rounded-full bg-[#0F3E8A]/40"/><div className="h-10 w-3/4 rounded-full bg-[#E2B02A]"/><div className="h-14 flex-1 rounded-full bg-[#0F3E8A]"/></div>
      </div>
    </div>
    <div className="flex flex-col justify-center rounded-[1.5rem] bg-[#0F3E8A] p-7 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-sm text-white/65">{t.current}</span><span className="text-lg font-bold">{Math.round(current).toLocaleString()} ETB</span></div>
      <div className="py-7"><span className="text-xs font-black uppercase tracking-widest text-[#E2B02A]">{t.lift}</span><span className="mt-2 block text-4xl font-black">+{Math.round(annualLift).toLocaleString()} ETB</span></div>
      <Link href="/growth-builder" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-4 font-black text-[#1E293B] transition hover:bg-[#E2B02A]">{t.claim}<ArrowRight size={17}/></Link>
    </div>
  </div>;
}
