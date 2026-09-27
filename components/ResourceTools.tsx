"use client";

import { useEffect, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { browserAttribution } from "@/lib/browser-attribution";

type ToolProps = { resourceId?: string; resourceSlug: string };

function LeadGate({ resourceId, resourceSlug, toolName, growthGoal, children }: { resourceId?: string; resourceSlug: string; toolName: string; growthGoal: string; children: ReactNode }) {
  const key = "aslal_resource_tool_lead:" + resourceSlug;
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { setUnlocked(localStorage.getItem(key) === "1"); } catch {} }, [key]);

  function gate(event: MouseEvent) {
    if (unlocked) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a")) {
      event.preventDefault();
      setError("");
      setOpen(true);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !contact.trim()) { setError("Please enter your name and email or Ethiopian phone number."); return; }
    const email = contact.includes("@") ? contact.toLowerCase() : "";
    const phone = email ? "" : contact;
    setBusy(true); setError("");
    try {
      const attribution = browserAttribution();
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, company,
          message: "Interactive resource tool used: " + toolName,
          growthGoal, leadCategory: "Resource interactive tool", resourceId, resourceSlug,
          attribution: attribution ? JSON.stringify(attribution) : "",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || "We could not save your request. Please try again."); return; }
      try {
        localStorage.setItem(key, "1");
        localStorage.setItem("aslal_resource_profile", JSON.stringify({ name, contact }));
      } catch {}
      setUnlocked(true); setOpen(false);
    } catch { setError("We could not connect to Aslal right now. Please try again."); }
    finally { setBusy(false); }
  }

  return <>
    <div onClickCapture={gate}>{children}</div>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071F47]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Unlock this interactive tool</div>
        <h2 className="mt-3 text-2xl font-black text-[#1E293B] sm:text-3xl">Get your result and let Aslal follow up with the next step.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter your contact once. Your browsing stays on this page and you return to the tool immediately after submitting.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
          <input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or Ethiopian phone number" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Business / company (optional)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-full bg-[#E2B02A] px-5 py-3.5 font-black text-[#1E293B] disabled:opacity-50">{busy ? "Saving your access…" : "Continue to the tool →"}</button>
          <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full border border-slate-200 px-5 py-3 font-bold text-slate-600">Not now</button>
        </form>
      </div>
    </div>}
  </>;
}

export function ResourceInteractiveTools({ roiResourceId, bottleneckResourceId }: { roiResourceId?: string; bottleneckResourceId?: string }) {
  return <section className="border-y border-[#0F3E8A]/10 bg-[#F8FAFC] py-14">
    <div className="container-aslal">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs font-black uppercase tracking-[.22em] text-[#0F3E8A]">Aslal Growth OS</div>
        <h2 className="mt-3 text-3xl font-black text-[#1E293B] sm:text-4xl">Interactive Growth Diagnostics & Estimators</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">Identify a growth constraint and model the commercial opportunity without leaving the Resources page.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadGate resourceId={roiResourceId} resourceSlug="ecommerce-conversion-payment-roi-calculator" toolName="E-Commerce Conversion & Payment ROI Calculator" growthGoal="e-commerce conversion and payment ROI">
          <RoiEstimator resourceId={roiResourceId} resourceSlug="ecommerce-conversion-payment-roi-calculator" />
        </LeadGate>
        <LeadGate resourceId={bottleneckResourceId} resourceSlug="digital-growth-bottleneck-assessor" toolName="Digital Growth Bottleneck Assessor" growthGoal="growth bottleneck assessment">
          <BottleneckAssessor resourceId={bottleneckResourceId} resourceSlug="digital-growth-bottleneck-assessor" />
        </LeadGate>
      </div>
    </div>
  </section>;
}

function RoiEstimator({ resourceId, resourceSlug }: ToolProps) {
  const [visitors, setVisitors] = useState(10000), [aov, setAov] = useState(1500), [conversion, setConversion] = useState(1), [lift, setLift] = useState(250);
  useEffect(() => { fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventName: "RESOURCE_TOOL_USE", pagePath: window.location.pathname, productSlug: resourceSlug, metadata: { resourceId, tool: "roi-estimator" } }) }).catch(() => undefined); }, [resourceId, resourceSlug]);
  const current = visitors * (conversion / 100) * aov;
  const improved = visitors * ((conversion * (1 + lift / 100)) / 100) * aov;
  const annualLift = Math.max(0, (improved - current) * 12);
  const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  return <section className="flex h-full flex-col justify-between rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-6 shadow-lg sm:p-7">
    <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Revenue model</div><h3 className="mt-2 text-2xl font-black text-[#1E293B]">2-Min Localized ROI Estimator</h3><p className="mt-2 text-sm leading-6 text-slate-600">Estimate revenue recovery from better conversion and localized payment or conversational sales journeys.</p>
      <div className="mt-7 space-y-6">
        <Range label="Monthly web traffic" value={visitors} display={visitors.toLocaleString()} min={1000} max={100000} step={1000} setValue={setVisitors} />
        <Range label="Average order value (ETB)" value={aov} display={aov.toLocaleString()} min={100} max={10000} step={100} setValue={setAov} />
        <Range label="Current conversion rate" value={conversion} display={conversion + "%"} min={0.1} max={10} step={0.1} setValue={setConversion} />
        <Range label="Scenario conversion lift" value={lift} display={lift + "%"} min={0} max={500} step={10} setValue={setLift} />
      </div>
    </div>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
      <div className="flex justify-between border-b border-slate-200 pb-3 text-sm"><span className="text-slate-500">Current monthly revenue</span><strong>{money.format(current)} ETB</strong></div>
      <div className="flex justify-between pt-3 text-sm"><span className="font-bold text-[#0F3E8A]">Estimated annual revenue lift</span><strong className="text-xl font-black text-[#0F3E8A]">+{money.format(annualLift)} ETB</strong></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Illustrative scenario only. Actual outcomes depend on traffic quality, offer, payment completion and sales follow-up.</p>
    </div>
  </section>;
}

function Range({ label, value, display, min, max, step, setValue }: { label: string; value: number; display: string; min: number; max: number; step: number; setValue: (v: number) => void }) {
  return <label className="block text-sm font-bold text-slate-700"><span className="flex justify-between gap-3"><span>{label}</span><span className="font-black text-[#0F3E8A]">{display}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-[#0F3E8A]" /></label>;
}

function BottleneckAssessor({ resourceId, resourceSlug }: ToolProps) {
  const questions = [
    { title: "Traffic Source?", options: ["Social DMs", "Word of Mouth", "Paid Ads", "Unstructured"] },
    { title: "Lead Qualification?", options: ["Manual Chat", "Web Form", "Automated Bots", "None"] },
    { title: "Checkout Method?", options: ["Manual Bank Transfer", "Local API (Telebirr)", "Stripe/PayPal", "No Digital Checkout"] },
    { title: "Sales Pipeline?", options: ["Spreadsheets", "CRM Software", "Chat Threads", "None"] },
  ];
  const [step, setStep] = useState(0), [answers, setAnswers] = useState<Record<number, number>>({}), [result, setResult] = useState<{ bottleneck: string; recommendation: string } | null>(null);
  useEffect(() => { fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventName: "RESOURCE_TOOL_USE", pagePath: window.location.pathname, productSlug: resourceSlug, metadata: { resourceId, tool: "bottleneck-assessor" } }) }).catch(() => undefined); }, [resourceId, resourceSlug]);

  function seeResults() {
    const labels = ["Traffic acquisition", "Lead qualification", "Checkout and payment", "Sales pipeline"];
    const counts = [0, 0, 0, 0];
    Object.entries(answers).forEach(([q]) => { counts[Number(q)] += 1; });
    const index = counts.indexOf(Math.max(...counts));
    const recommendation = index === 0 ? "Clarify channel ownership and connect campaign sources to measurable demand." : index === 1 ? "Capture intent consistently and route qualified enquiries into a sales-owned workflow." : index === 2 ? "Reduce payment friction and reconcile completed payments with orders and revenue." : "Give every lead a clear owner, next action and follow-up deadline.";
    setResult({ bottleneck: labels[index], recommendation });
  }

  if (result) return <section className="flex h-full flex-col rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-6 shadow-lg sm:p-7">
    <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Diagnostic result</div><h3 className="mt-2 text-2xl font-black text-[#1E293B]">Growth Bottleneck Assessor</h3>
    <div className="mt-6 rounded-2xl border border-[#0F3E8A]/10 bg-[#F8FAFC] p-5"><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Starting signal</div><div className="mt-2 text-2xl font-black text-[#1E293B]">{result.bottleneck}</div><p className="mt-3 text-sm leading-6 text-slate-600">{result.recommendation}</p></div>
    <div className="mt-auto flex gap-3 pt-6"><button type="button" onClick={() => { setResult(null); setAnswers({}); setStep(0); }} className="rounded-full border border-slate-200 px-5 py-3 font-bold text-slate-700">Run again</button><a href={"/growth-builder?goal=" + encodeURIComponent("Improve " + result.bottleneck)} className="rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Discuss next step →</a></div>
  </section>;

  const current = questions[step];
  return <section className="flex h-full flex-col rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-6 shadow-lg sm:p-7">
    <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Diagnostic tool</div><div className="mt-2 flex items-center justify-between gap-3"><h3 className="text-2xl font-black text-[#1E293B]">Growth Bottleneck Assessor</h3><span className="text-xs font-black text-slate-400">Step {step + 1}/4</span></div>
    <p className="mt-2 text-sm leading-6 text-slate-600">Uncover the operational friction point worth investigating first.</p>
    <div className="mt-7"><h4 className="text-lg font-black text-[#1E293B]">{current.title}</h4><div className="mt-4 space-y-2">{current.options.map((option, index) => {
      const selected = answers[step] === index;
      return <button type="button" key={option} onClick={() => setAnswers((old) => ({ ...old, [step]: index }))} className={selected ? "w-full rounded-2xl border border-[#0F3E8A] bg-[#0F3E8A]/5 p-4 text-left text-sm font-bold text-[#0F3E8A]" : "w-full rounded-2xl border border-slate-200 p-4 text-left text-sm font-bold text-slate-700 hover:border-[#0F3E8A]"}>{option}</button>;
    })}</div></div>
    <div className="mt-auto flex justify-between gap-3 pt-6"><button type="button" disabled={step === 0} onClick={() => setStep((v) => v - 1)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold disabled:invisible">Back</button><button type="button" disabled={answers[step] === undefined} onClick={() => step < 3 ? setStep((v) => v + 1) : seeResults()} className="rounded-full bg-[#0F3E8A] px-6 py-3 text-sm font-black text-white disabled:opacity-40">{step === 3 ? "See results →" : "Next →"}</button></div>
  </section>;
}

export function ResourceTool({ slug, resourceId }: { slug: string; resourceId?: string }) {
  if (slug === "digital-growth-bottleneck-assessor") return <BottleneckAssessor resourceId={resourceId} resourceSlug={slug} />;
  if (slug === "ecommerce-conversion-payment-roi-calculator") return <RoiEstimator resourceId={resourceId} resourceSlug={slug} />;
  return null;
}
