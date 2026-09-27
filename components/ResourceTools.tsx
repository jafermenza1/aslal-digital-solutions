"use client";

import { useEffect, useMemo, useState } from "react";

type ToolProps = { slug:string };

export function ResourceTool({slug}:ToolProps) {
  if (slug === "digital-growth-bottleneck-assessor") return <BottleneckAssessor />;
  if (slug === "ecommerce-conversion-payment-roi-calculator") return <RoiCalculator />;
  return null;
}

function BottleneckAssessor() {
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<string[]>([]);
  const questions=[
    {q:"What is the biggest problem today?",a:[["Not enough qualified traffic","Traffic"],["Traffic arrives but few people enquire","Lead conversion"],["Customers struggle to pay or complete checkout","Payment friction"],["Leads arrive but follow-up is inconsistent","Sales pipeline"]]},
    {q:"Where does demand usually stop?",a:[["Before the website or landing page","Traffic"],["On the page or form","Lead conversion"],["At payment or checkout","Payment friction"],["After the lead is captured","Sales pipeline"]]},
    {q:"What is least visible to your team?",a:[["Which channels create demand","Traffic"],["Why visitors do not convert","Lead conversion"],["Which payments were completed","Payment friction"],["Who owns the next sales action","Sales pipeline"]]},
    {q:"What would create the clearest improvement?",a:[["More targeted acquisition","Traffic"],["Better offers and conversion paths","Lead conversion"],["Better payment and checkout flow","Payment friction"],["CRM ownership and automated follow-up","Sales pipeline"]]},
  ];
  useEffect(()=>{fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventName:"RESOURCE_TOOL_USE",pagePath:window.location.pathname,productSlug:"digital-growth-bottleneck-assessor"})}).catch(()=>undefined)},[]);
  const result=useMemo(()=>{
    if(answers.length!==questions.length)return "";
    const counts:Record<string,number>={Traffic:0,"Lead conversion":0,"Payment friction":0,"Sales pipeline":0};
    answers.forEach(answer=>{counts[answer]=(counts[answer]||0)+1;});
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"";
  },[answers,questions.length]);
  if(result) return <div className="rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-7 shadow-lg"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Your starting signal</div><h3 className="mt-3 text-3xl font-black">{result}</h3><p className="mt-3 leading-7 text-slate-600">Use this as the first investigation point. The result is a diagnostic signal, not a guarantee or formal audit.</p><div className="mt-6 flex flex-wrap gap-3"><a href={result==="Payment friction"?"/contact?goal=Request%20custom%20payment%20integration":"/growth-builder?goal="+encodeURIComponent("Improve "+result)} className="rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Discuss this bottleneck →</a><button onClick={()=>{setAnswers([]);setStep(0)}} className="rounded-full border border-slate-200 px-5 py-3 font-bold">Run again</button></div></div>;
  const current=questions[step];
  return <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Question {step+1} of {questions.length}</div><h3 className="mt-3 text-2xl font-black">{current.q}</h3><div className="mt-6 grid gap-3">{current.a.map(([answer,category])=><button key={answer} onClick={()=>{setAnswers([...answers,category]);setStep(step+1)}} className="rounded-2xl border border-slate-200 p-4 text-left font-bold transition hover:border-[#0F3E8A] hover:bg-slate-50">{answer}</button>)}</div></div>;
}

function RoiCalculator() {
  useEffect(()=>{fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventName:"RESOURCE_TOOL_USE",pagePath:window.location.pathname,productSlug:"ecommerce-conversion-payment-roi-calculator"})}).catch(()=>undefined)},[]);
  const [traffic,setTraffic]=useState(10000);
  const [conversion,setConversion]=useState(1.5);
  const [value,setValue]=useState(5000);
  const [lift,setLift]=useState(30);
  const current=traffic*(conversion/100)*value;
  const improved=traffic*((conversion*(1+lift/100))/100)*value;
  const delta=Math.max(0,improved-current);
  const money=new Intl.NumberFormat("en-US",{maximumFractionDigits:0});
  return <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg"><div className="grid gap-5 sm:grid-cols-2"><NumberField label="Monthly web visits" value={traffic} onChange={setTraffic} min={100} step={100}/><NumberField label="Current conversion rate %" value={conversion} onChange={setConversion} min={0.1} step={0.1}/><NumberField label="Average transaction value (ETB)" value={value} onChange={setValue} min={1} step={100}/><NumberField label="Scenario conversion lift %" value={lift} onChange={setLift} min={0} step={5}/></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><Metric label="Current monthly revenue" value={money.format(current)+" ETB"}/><Metric label="Scenario revenue" value={money.format(improved)+" ETB"}/><Metric label="Potential monthly lift" value={money.format(delta)+" ETB"}/></div><p className="mt-5 text-xs leading-5 text-slate-500">Illustrative scenario only. Actual results depend on traffic quality, offer, payment completion, sales follow-up and other factors.</p><a href="/contact?goal=Book%20a%20funnel%20audit" className="mt-6 inline-flex rounded-full bg-[#0F3E8A] px-5 py-3 font-black text-white">Book a funnel audit →</a></div>;
}
function NumberField({label,value,onChange,min,step}:{label:string;value:number;onChange:(value:number)=>void;min:number;step:number}){return <label className="text-sm font-bold text-slate-700">{label}<input type="number" value={value} min={min} step={step} onChange={e=>onChange(Number(e.target.value)||min)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-[#0F3E8A]"/></label>}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-slate-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 text-xl font-black text-[#0F3E8A]">{value}</div></div>}
