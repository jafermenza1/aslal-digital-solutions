"use client";
import { useEffect, useState } from "react";

type Program={id:string;name:string;slug:string;description:string|null;status:string;admissionMode:string;allowedPartnerTypes:string|null;terms?:Array<{version:number;earningsDescription:string;qualifyingEvent:string;attributionPolicy:string;attributionWindowDays:number;refundHoldDays:number;payoutSchedule:string;minimumPayout:string|number;exclusions:string|null}>;partnerCount?:number;campaignCount?:number};

const steps=["Offer","Audience","Earnings","Timing","Publish"];

export default function PartnerProgramBuilder(){
 const [programs,setPrograms]=useState<Program[]>([]);
 const [step,setStep]=useState(0); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 const [form,setForm]=useState({name:"",slug:"",description:"",admissionMode:"OPEN",allowedPartnerTypes:"AFFILIATE,INFLUENCER",earningsDescription:"",qualifyingEvent:"Confirmed sale",attributionPolicy:"LAST_CLICK",attributionWindowDays:"30",refundHoldDays:"14",payoutSchedule:"MONTHLY",minimumPayout:"0",exclusions:"",currency:"ETB"});
 async function load(){const r=await fetch("/api/admin/partner-engine/programs");const d=await r.json();if(r.ok)setPrograms(d.programs||[]);else setMessage(d.error||"Could not load programs.");}
 useEffect(()=>{void load()},[]);
 const set=(k:string,v:string)=>setForm(x=>({...x,[k]:v}));
 async function publish(){
  setBusy(true);setMessage("");
  try{
   const r=await fetch("/api/admin/partner-engine/programs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,allowedPartnerTypes:form.allowedPartnerTypes.split(",").map(x=>x.trim()).filter(Boolean),attributionWindowDays:Number(form.attributionWindowDays),refundHoldDays:Number(form.refundHoldDays),minimumPayout:Number(form.minimumPayout),status:"PUBLISHED"})});
   const d=await r.json(); if(!r.ok) throw new Error(d.error||"Program creation failed.");
   setMessage("Partner program published with its initial commercial terms.");
   setForm({name:"",slug:"",description:"",admissionMode:"OPEN",allowedPartnerTypes:"AFFILIATE,INFLUENCER",earningsDescription:"",qualifyingEvent:"Confirmed sale",attributionPolicy:"LAST_CLICK",attributionWindowDays:"30",refundHoldDays:"14",payoutSchedule:"MONTHLY",minimumPayout:"0",exclusions:"",currency:"ETB"});
   setStep(0); await load();
  }catch(e){setMessage(e instanceof Error?e.message:"Program creation failed.");}finally{setBusy(false);}
 }
 return <section className="space-y-6">
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
   <div className="flex flex-wrap gap-2">{steps.map((s,i)=><button type="button" key={s} onClick={()=>i<=step&&setStep(i)} className={`rounded-full px-3 py-2 text-xs font-black ${i===step?"bg-slate-900 text-white":"bg-slate-100 text-slate-500"}`}>{i+1}. {s}</button>)}</div>
   <div className="mt-6">
    {step===0&&<div className="grid gap-4 md:grid-cols-2"><Field label="Program name" value={form.name} onChange={v=>set("name",v)} required/><Field label="Slug" value={form.slug} onChange={v=>set("slug",v)} required/><Field label="Description" value={form.description} onChange={v=>set("description",v)} area/><Select label="Admission" value={form.admissionMode} onChange={v=>set("admissionMode",v)} options={["OPEN","VERIFICATION_REQUIRED","BUSINESS_APPROVAL","INVITATION_ONLY"]}/></div>}
    {step===1&&<div className="grid gap-4 md:grid-cols-2"><Field label="Allowed partner types" value={form.allowedPartnerTypes} onChange={v=>set("allowedPartnerTypes",v)}/><p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Use comma-separated types: AFFILIATE, INFLUENCER, AGENT, RESELLER. The program is shown only to compatible partner types.</p></div>}
    {step===2&&<div className="grid gap-4 md:grid-cols-2"><Field label="How partners earn" value={form.earningsDescription} onChange={v=>set("earningsDescription",v)} area required/><Field label="Qualifying event" value={form.qualifyingEvent} onChange={v=>set("qualifyingEvent",v)} required/><Select label="Attribution policy" value={form.attributionPolicy} onChange={v=>set("attributionPolicy",v)} options={["LAST_CLICK","FIRST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"]}/><Field label="Currency" value={form.currency} onChange={v=>set("currency",v)} /></div>}
    {step===3&&<div className="grid gap-4 md:grid-cols-2"><Field label="Attribution window (days)" value={form.attributionWindowDays} onChange={v=>set("attributionWindowDays",v)} type="number"/><Field label="Refund hold (days)" value={form.refundHoldDays} onChange={v=>set("refundHoldDays",v)} type="number"/><Field label="Payout schedule" value={form.payoutSchedule} onChange={v=>set("payoutSchedule",v)} required/><Field label="Minimum payout" value={form.minimumPayout} onChange={v=>set("minimumPayout",v)} type="number"/><Field label="Exclusions" value={form.exclusions} onChange={v=>set("exclusions",v)} area/></div>}
    {step===4&&<div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-black">Publish review</h3><dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm"><Review k="Program" v={form.name}/><Review k="Admission" v={form.admissionMode}/><Review k="Partner types" v={form.allowedPartnerTypes}/><Review k="Earnings" v={form.earningsDescription}/><Review k="Qualifying event" v={form.qualifyingEvent}/><Review k="Attribution" v={`${form.attributionPolicy} / ${form.attributionWindowDays} days`}/><Review k="Refund hold" v={`${form.refundHoldDays} days`}/><Review k="Payout" v={`${form.payoutSchedule}; minimum ${form.minimumPayout} ${form.currency}`}/></dl></div>}
   </div>
   <div className="mt-6 flex justify-between gap-3"><button type="button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black disabled:opacity-40">Back</button>{step<4?<button type="button" onClick={()=>setStep(s=>Math.min(4,s+1))} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white">Continue</button>:<button type="button" disabled={busy} onClick={publish} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-slate-950">{busy?"Publishing…":"Publish program"}</button>}</div>
  </div>
  {message&&<div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-slate-700">{message}</div>}
  <div className="grid gap-4 md:grid-cols-2">{programs.map(p=><article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h3 className="font-black">{p.name}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black">{p.status}</span></div><p className="mt-2 text-sm text-slate-500">{p.description||"No description"}</p><div className="mt-4 text-xs text-slate-500">{p.admissionMode} · {p.allowedPartnerTypes||"All types"} · {p.partnerCount||0} partners · {p.campaignCount||0} campaigns</div></article>)}</div>
 </section>;
}
function Field({label,value,onChange,required=false,area=false,type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;area?:boolean;type?:string}){return <label className="text-sm font-bold text-slate-700">{label}{required&&" *"}{area?<textarea required={required} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>:<input required={required} type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>}</label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label className="text-sm font-bold text-slate-700">{label}<select value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{options.map(x=><option key={x}>{x}</option>)}</select></label>}
function Review({k,v}:{k:string;v:string}){return <div><dt className="text-[10px] font-black uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-1 font-bold text-slate-800">{v||"—"}</dd></div>}
