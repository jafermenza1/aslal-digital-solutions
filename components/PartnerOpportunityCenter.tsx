"use client";
import { useEffect,useState } from "react";
type Campaign={id:string;name:string;description:string|null;status:string;target_description:string|null;location:string|null;product_name:string|null;partner_budget:number|string;currency:string;reward_type:string;reward_amount:number|string|null;reward_rate:number|string|null;required_partner_types:string|null;application_status:string|null;referral_code:string|null};
type Dispute={id:string;subject:string;description:string;status:string;resolution:string|null;created_at:string};
type Payout={id:string;amount:number|string;currency:string;status:string;reference:string|null;created_at:string;paid_at:string|null};
type Commission={id:string;amount:number|string;currency:string;status:string;referral_code:string|null;created_at:string};
const money=(v:number|string|null|undefined)=>Number(v??0).toLocaleString("en-ET",{maximumFractionDigits:2});

export default function PartnerOpportunityCenter(){
 const [campaigns,setCampaigns]=useState<Campaign[]>([]),[disputes,setDisputes]=useState<Dispute[]>([]),[payouts,setPayouts]=useState<Payout[]>([]),[commissions,setCommissions]=useState<Commission[]>([]);
 const [profile,setProfile]=useState({bio:"",specialties:"",serviceAreas:"",audienceSize:""}),[message,setMessage]=useState(""),[busy,setBusy]=useState("");
 const [portalTab,setPortalTab]=useState<"profile"|"opportunities"|"earnings"|"activity">("profile");
 async function load(){
  try{const [a,b,p]=await Promise.all([fetch("/api/partner/opportunities"),fetch("/api/partner/payouts"),fetch("/api/partner/profile")]);const x=await a.json(),y=await b.json(),z=await p.json();if(!a.ok)throw new Error(x.error||"Could not load opportunities.");if(!b.ok)throw new Error(y.error||"Could not load earnings.");setCampaigns(x.campaigns||[]);setPayouts(y.payouts||[]);setCommissions(y.commissions||[]);if(p.ok&&z.partner)setProfile({bio:z.partner.bio||"",specialties:z.partner.specialties||"",serviceAreas:z.partner.service_areas||"",audienceSize:z.partner.audience_size?String(z.partner.audience_size):""})}catch(e){setMessage(e instanceof Error?e.message:"Could not load partner workspace.")}
  try{const r=await fetch("/api/partner/disputes");const d=await r.json();if(r.ok)setDisputes(d.disputes||[])}catch{}
 }
 // The initial data load is intentionally performed after mount.\n // eslint-disable-next-line react-hooks/set-state-in-effect\n useEffect(()=>{void load()},[]);
 async function apply(id:string){setBusy(id);setMessage("");try{const r=await fetch("/api/partner/campaigns/"+id+"/apply",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Application failed.");setMessage(d.alreadyApplied?"You already applied to this campaign.":"Application submitted.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Application failed.")}finally{setBusy("")}}
 async function saveProfile(e:React.FormEvent){e.preventDefault();setBusy("profile");try{const r=await fetch("/api/partner/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...profile,audienceSize:profile.audienceSize?Number(profile.audienceSize):undefined})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Profile update failed.");setMessage("Partner profile updated.")}catch(e){setMessage(e instanceof Error?e.message:"Profile update failed.")}finally{setBusy("")}}
 async function openDispute(e:React.FormEvent){e.preventDefault();setBusy("dispute");const f=new FormData(e.currentTarget as HTMLFormElement);try{const r=await fetch("/api/partner/disputes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:f.get("subject"),description:f.get("description"),commissionId:f.get("commissionId")||null})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not open dispute.");setMessage("Dispute opened.");(e.currentTarget as HTMLFormElement).reset();await load()}catch(e){setMessage(e instanceof Error?e.message:"Could not open dispute.")}finally{setBusy("")}}
 return <section className="mt-8 space-y-6">
  <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" role="tablist" aria-label="Partner portal workspace">
    <button type="button" onClick={()=>setPortalTab("profile")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(portalTab==="profile"?"bg-[#0F3E8A] text-white":"text-slate-500")}>Your profile</button>
    <button type="button" onClick={()=>setPortalTab("opportunities")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(portalTab==="opportunities"?"bg-[#0F3E8A] text-white":"text-slate-500")}>Campaign opportunities</button>
    <button type="button" onClick={()=>setPortalTab("earnings")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(portalTab==="earnings"?"bg-[#0F3E8A] text-white":"text-slate-500")}>Your earnings</button>
    <button type="button" onClick={()=>setPortalTab("activity")} className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(portalTab==="activity"?"bg-[#0F3E8A] text-white":"text-slate-500")}>Applications & disputes</button>
  </div>
  {message&&<div className="rounded-xl bg-[#E2B02A]/10 p-4 text-sm font-bold text-slate-700">{message}</div>}

  {portalTab==="profile"&&<section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
    <form onSubmit={saveProfile} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Your partner profile</h2>
      <p className="mt-1 text-sm text-slate-500">Keep your capabilities current so Aslal can match you with relevant campaigns.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input label="Specialties — what you promote" value={profile.specialties} onChange={v=>setProfile({...profile,specialties:v})}/>
        <Input label="Service areas — where you operate" value={profile.serviceAreas} onChange={v=>setProfile({...profile,serviceAreas:v})}/>
        <Input label="Audience size" value={profile.audienceSize} onChange={v=>setProfile({...profile,audienceSize:v})}/>
        <label className="sm:col-span-2 text-sm font-bold text-slate-700">Short bio<textarea value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5"/></label>
      </div>
      <button disabled={busy==="profile"} className="mt-4 rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">{busy==="profile"?"Saving…":"Save profile"}</button>
    </form>
    <div className="rounded-[2rem] bg-[#052B21] p-6 text-white shadow-sm">
      <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">Partner identity</div>
      <h2 className="mt-2 text-xl font-black">Ready for matching</h2>
      <p className="mt-2 text-sm text-white/65">Your profile helps Aslal match you with eligible campaigns. Keep specialties, service areas and audience information current.</p>
      <div className="mt-5 grid grid-cols-2 gap-3"><Stat label="Open opportunities" value={String(campaigns.filter(c=>["OPEN","ACTIVE"].includes(c.status)).length)}/><Stat label="Applications" value={String(campaigns.filter(c=>c.application_status).length)}/></div>
    </div>
  </section>}

  {portalTab==="opportunities"&&<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Campaign opportunities</h2><p className="mt-1 text-sm text-slate-500">Product/service, lifecycle status, reward terms and application status are visible before you apply.</p></div><span className="rounded-full bg-[#E2B02A]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700">Opportunities</span></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {campaigns.map(c=><div key={c.id} className="rounded-2xl border border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3"><div><div className="font-black">{c.name}</div><div className="mt-1 flex flex-wrap gap-2 text-[10px] font-black uppercase"><span className="rounded-full bg-slate-100 px-2 py-1">{c.status}</span>{c.product_name&&<span className="rounded-full bg-[#0F3E8A]/10 px-2 py-1 text-[#0F3E8A]">{c.product_name}</span>}</div><div className="mt-1 text-xs text-slate-400">{c.location||"Any location"} · {c.reward_type.replaceAll("_"," ")} · Partner budget {c.currency} {money(c.partner_budget)}</div></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black">{c.application_status||"OPEN"}</span></div>
        <p className="mt-3 text-sm text-slate-600">{c.target_description||c.description||"No objective recorded."}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-bold text-slate-400">{c.reward_rate?String(c.reward_rate)+"% sale":c.reward_amount?c.currency+" "+money(c.reward_amount):"Reward terms apply"}</span>{!c.application_status?<button onClick={()=>apply(c.id)} disabled={busy===c.id} className="rounded-xl bg-[#E2B02A] px-4 py-2 text-xs font-black text-slate-950">{busy===c.id?"Applying…":"Apply"}</button>:<span className="text-xs font-bold text-slate-500">Application: {c.application_status}</span>}</div>{["APPROVED","ACTIVE"].includes(c.application_status||"")&&c.referral_code&&<div className="mt-3 rounded-xl border border-[#0F3E8A]/10 bg-[#0F3E8A]/5 p-3"><div className="text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">Campaign referral link</div><div className="mt-1 break-all text-xs text-slate-600">/go/{c.referral_code}</div><a href={"/go/"+c.referral_code} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-lg bg-[#0F3E8A] px-3 py-2 text-[10px] font-black text-white">Open referral link ↗</a><img src={"/api/partner/campaigns/"+c.id+"/qr"} alt="Campaign referral QR code" className="mt-3 h-28 w-28 rounded-lg border border-slate-200 bg-white p-1"/></div>}
      </div>)}
      {!campaigns.length&&<div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">No matching campaigns are currently open.</div>}
    </div>
  </section>}

  {portalTab==="earnings"&&<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-black text-slate-900">Your earnings</h2>
    <p className="mt-1 text-sm text-slate-500">Commission records and payout ledger history. A payout ledger record is an operational record and does not itself move money.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Commission records" value={"ETB "+money(commissions.reduce((n,c)=>n+Number(c.amount),0))}/><Stat label="Paid ledger" value={"ETB "+money(payouts.filter(p=>p.status==="PAID").reduce((n,p)=>n+Number(p.amount),0))}/><Stat label="Payout records" value={String(payouts.length)}/></div>
    <div className="mt-5 space-y-2">{payouts.map(p=><div key={p.id} className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{p.status} · {p.reference||"No reference"} · {new Date(p.created_at).toLocaleDateString("en-ET")}</span><b>ETB {money(p.amount)}</b></div>)}{!payouts.length&&<p className="text-sm text-slate-500">No payout records yet.</p>}</div>
  </section>}

  {portalTab==="activity"&&<section className="grid gap-6 xl:grid-cols-2">
    <form onSubmit={openDispute} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Applications & disputes</h2><p className="mt-1 text-sm text-slate-500">Your campaign applications stay linked to their opportunities. Use disputes for attribution, campaign or commission questions.</p><div className="mt-4 space-y-3"><div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Applications on opportunities: <b>{campaigns.filter(c=>c.application_status).length}</b></div><input name="subject" required minLength={3} maxLength={190} placeholder="Dispute subject" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><select name="commissionId" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">No commission reference</option>{commissions.map(c=><option key={c.id} value={c.id}>{c.id.slice(0,8)} · {c.status} · {c.currency} {money(c.amount)}</option>)}</select><textarea name="description" required minLength={10} placeholder="Explain what happened and the evidence you have." className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5"/><button disabled={busy==="dispute"} className="rounded-xl border border-slate-200 px-5 py-3 font-black">{busy==="dispute"?"Opening…":"Open dispute"}</button></div></form>
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Dispute history</h2><div className="mt-4 space-y-3">{disputes.map(d=><div key={d.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex justify-between gap-3"><b>{d.subject}</b><span className="text-xs font-black">{d.status}</span></div><p className="mt-2 text-sm text-slate-600">{d.description}</p>{d.resolution&&<p className="mt-2 text-xs text-slate-500">Resolution: {d.resolution}</p>}</div>)}{!disputes.length&&<p className="text-sm text-slate-500">No disputes.</p>}</div></div>
  </section>}
 </section>
}
function Input({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="text-sm font-bold text-slate-700">{label}<input value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"/></label>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase text-slate-400">{label}</div><div className="mt-1 font-black text-[#0F3E8A]">{value}</div></div>}
