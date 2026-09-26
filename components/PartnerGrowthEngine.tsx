"use client";
import { useEffect,useState } from "react";
import PartnerPayoutBatch from "./PartnerPayoutBatch";

type Partner={id:string;name:string;type:string;status:string;verification_status:string;tier:string;audience_size:number|null;campaigns:number;active_campaigns:number;leads:number;won:number;revenue:number|string|null;open_disputes:number};
type Campaign={id:string;name:string;status:string;target_description:string|null;location:string|null;budget:number|string;partner_budget:number|string;reward_type:string;reward_amount:number|string|null;reward_rate:number|string|null;required_partner_types:string|null;product_id:string|null;product_name:string|null;resource_id:string|null;resource_title:string|null;currency:string;partner_count:number;active_partner_count:number};
type Product={id:string;name:string;kind:string};
type Dispute={id:string;partner_name:string;campaign_name:string|null;subject:string;description:string;status:string};
type Payout={id:string;partner_name:string;amount:number|string;currency:string;status:string;reference:string|null;commission_count:number;created_at:string;paid_at:string|null};
const money=(v:number|string|null|undefined)=>Number(v??0).toLocaleString("en-ET",{maximumFractionDigits:2});

export default function PartnerGrowthEngine(){
 const [partners,setPartners]=useState<Partner[]>([]),[campaigns,setCampaigns]=useState<Campaign[]>([]),[products,setProducts]=useState<Product[]>([]),[resources,setResources]=useState<{id:string;title:string;category:string}[]>([]),[disputes,setDisputes]=useState<Dispute[]>([]),[payouts,setPayouts]=useState<Payout[]>([]);
 const [message,setMessage]=useState(""),[busy,setBusy]=useState("");
 const [form,setForm]=useState({name:"",targetDescription:"",location:"",budget:"",partnerBudget:"",rewardType:"FIXED",rewardAmount:"",rewardRate:"",requiredPartnerTypes:"AGENT,INFLUENCER",productId:"",resourceId:"",description:""});
 const [payout,setPayout]=useState({partnerId:"",amount:"",status:"PENDING",reference:"",notes:""});

 async function load(){
  try{
   const rs=await Promise.all(["/api/admin/partner-engine/partners","/api/admin/partner-engine/campaigns","/api/admin/partner-engine/disputes","/api/admin/partner-engine/payouts"].map(u=>fetch(u)));
   if(rs.some(r=>!r.ok))throw new Error("Could not load partner engine data.");
   const [a,b,c,d]=await Promise.all(rs.map(r=>r.json()));
   setPartners(a.partners||[]);setCampaigns(b.campaigns||[]);setProducts(b.products||[]);setResources(b.resources||[]);setDisputes(c.disputes||[]);setPayouts(d.payouts||[]);
  }catch(e){setMessage(e instanceof Error?e.message:"Could not load partner engine.");}
 }
 // The initial data load is intentionally performed from the async loader after mount; the loader updates state only after network completion.\n // eslint-disable-next-line react-hooks/set-state-in-effect\n useEffect(()=>{void load()},[]);

 async function createCampaign(e:React.FormEvent){
  e.preventDefault();setBusy("campaign");setMessage("");
  try{const r=await fetch("/api/admin/partner-engine/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,status:"DRAFT",currency:"ETB"})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Campaign creation failed.");setMessage("Campaign draft created. Open it when ready for partner applications.");setForm({name:"",targetDescription:"",location:"",budget:"",partnerBudget:"",rewardType:"FIXED",rewardAmount:"",rewardRate:"",requiredPartnerTypes:"AGENT,INFLUENCER",productId:"",description:""});await load()}catch(e){setMessage(e instanceof Error?e.message:"Campaign creation failed.")}finally{setBusy("")}
 }
 async function updateCampaign(id:string,value:string){setBusy("campaign:"+id);try{const r=await fetch("/api/admin/partner-engine/campaigns/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:value})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Campaign update failed.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Campaign update failed.")}finally{setBusy("")}}
 async function updatePartner(id:string,field:string,value:string){
  setBusy(id);try{const r=await fetch("/api/admin/partner-engine/partners/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({[field]:value})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Partner update failed.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Partner update failed.")}finally{setBusy("")}
 }
 async function createPayout(e:React.FormEvent){
  e.preventDefault();setBusy("payout");
  try{const r=await fetch("/api/admin/partner-engine/payouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payout)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Payout record failed.");setMessage("Payout ledger record created. It records an operational payout only; it does not move funds.");setPayout({partnerId:"",amount:"",status:"PENDING",reference:"",notes:""});await load()}catch(e){setMessage(e instanceof Error?e.message:"Payout record failed.")}finally{setBusy("")}
 }
 async function invite(campaignId:string,partnerId:string){
  setBusy(campaignId+partnerId);
  try{const r=await fetch("/api/admin/partner-engine/campaigns/"+campaignId+"/partners",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({partnerId,status:"INVITED"})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Invite failed.");setMessage("Partner assignment updated.")}catch(e){setMessage(e instanceof Error?e.message:"Invite failed.")}finally{setBusy("")}
 }
 async function dispute(id:string,status:string){
  const resolution=status==="RESOLVED"||status==="REJECTED"?prompt("Resolution note"):"";
  if((status==="RESOLVED"||status==="REJECTED")&&!resolution)return;
  try{const r=await fetch("/api/admin/partner-engine/disputes/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,resolution})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Dispute update failed.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Dispute update failed.")}
 }

 return <section className="mt-8 space-y-8">
  <div className="rounded-[2rem] bg-[#052B21] p-6 text-white shadow-sm sm:p-8">
   <div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">Partner Engine / Phase F</div>
   <h2 className="mt-2 text-2xl font-black">Partner growth network</h2>
   <p className="mt-2 max-w-4xl text-sm text-white/70">Campaign opportunities, partner matching, verification, performance, tiers, disputes and payout history. Payout records remain a ledger until Order/Payment reconciliation is accepted.</p>
   <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Stat label="Verified partners" value={partners.filter(p=>p.verification_status==="VERIFIED"&&p.status==="ACTIVE").length}/>
    <Stat label="Open campaigns" value={campaigns.filter(c=>["OPEN","ACTIVE"].includes(c.status)).length}/>
    <Stat label="Open disputes" value={disputes.filter(d=>["OPEN","UNDER_REVIEW"].includes(d.status)).length}/>
    <Stat label="Paid ledger" value={"ETB "+money(payouts.filter(p=>p.status==="PAID").reduce((n,p)=>n+Number(p.amount),0))}/>
   </div>
  </div>
  {message&&<div className="rounded-xl bg-[#E2B02A]/10 p-4 text-sm font-bold text-slate-700">{message}</div>}

  <section className="grid gap-8 xl:grid-cols-[1.2fr_.8fr]">
   <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-black">Create campaign opportunity</h3>
    <p className="mt-1 text-sm text-slate-500">Reserve a total campaign budget and a partner budget, then recruit verified partners.</p></div><span className="rounded-full bg-[#0F3E8A]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">Step 1</span></div>
    <form onSubmit={createCampaign} className="mt-5 grid gap-3 sm:grid-cols-2">
     <Input required label="Campaign name" value={form.name} onChange={v=>setForm({...form,name:v})}/>
     <Input required label="Target / objective" value={form.targetDescription} onChange={v=>setForm({...form,targetDescription:v})}/>
     <Input label="Location" value={form.location} onChange={v=>setForm({...form,location:v})}/>
     <Input required type="number" min="0" label="Total budget" value={form.budget} onChange={v=>setForm({...form,budget:v})}/>
     <label className="text-sm font-bold text-slate-700">Product / service association<select value={form.productId} onChange={e=>setForm({...form,productId:e.target.value,resourceId:e.target.value?"":form.resourceId})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">No association</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} · {p.kind}</option>)}</select></label>
     <label className="text-sm font-bold text-slate-700">Resource association<select value={form.resourceId} onChange={e=>setForm({...form,resourceId:e.target.value,productId:e.target.value?"":form.productId})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">No association</option>{resources.map(r=><option key={r.id} value={r.id}>{r.title} · {r.category}</option>)}</select></label>
     <Input required type="number" min="0" label="Partner budget" value={form.partnerBudget} onChange={v=>setForm({...form,partnerBudget:v})}/>
     <Input type="number" min="0" label="Reward amount" value={form.rewardAmount} onChange={v=>setForm({...form,rewardAmount:v})}/>
     <Input type="number" min="0" max="100" label="Sale rate %" value={form.rewardRate} onChange={v=>setForm({...form,rewardRate:v})}/>
     <Input label="Partner types" value={form.requiredPartnerTypes} onChange={v=>setForm({...form,requiredPartnerTypes:v})}/>
     <label className="text-sm font-bold">Reward model<select value={form.rewardType} onChange={e=>setForm({...form,rewardType:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{["FIXED","PER_LEAD","PERCENT_SALE","HYBRID","MARGIN"].map(x=><option key={x}>{x}</option>)}</select></label>
     <label className="sm:col-span-2 text-sm font-bold">Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5"/></label>
     <button disabled={busy==="campaign"} className="sm:col-span-2 rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">{busy==="campaign"?"Creating…":"Create campaign"}</button>
    </form>
   </div>
   <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-black">Record payout</h3>
    <p className="mt-1 text-sm text-slate-500">Operational ledger only; actual funds remain outside this Phase F scope.</p>
    <form onSubmit={createPayout} className="mt-5 space-y-3">
     <select value={payout.partnerId} onChange={e=>setPayout({...payout,partnerId:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">Select partner</option>{partners.map(p=><option key={p.id} value={p.id}>{p.name} · {p.tier}</option>)}</select>
     <Input label="Amount" value={payout.amount} onChange={v=>setPayout({...payout,amount:v})}/>
     <select value={payout.status} onChange={e=>setPayout({...payout,status:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{["PENDING","APPROVED","PAID","FAILED","VOID"].map(x=><option key={x}>{x}</option>)}</select>
     <Input label="Reference" value={payout.reference} onChange={v=>setPayout({...payout,reference:v})}/>
     <textarea placeholder="Reconciliation notes" value={payout.notes} onChange={e=>setPayout({...payout,notes:e.target.value})} className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
     <button disabled={busy==="payout"} className="w-full rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-slate-950">{busy==="payout"?"Saving…":"Save payout record"}</button>
    </form>
   </div>
  </section>

  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-black">Campaign marketplace</h3><p className="mt-1 text-sm text-slate-500">Draft → Open → Active → Paused → Completed/Cancelled.</p><div className="mt-4 space-y-3">{campaigns.map(c=><div key={c.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-black">{c.name}</div><div className="mt-1 text-xs text-slate-500">{c.product_name||c.resource_title||"No product/resource"} · {c.location||"Any location"} · {c.target_description||"No objective"}</div><div className="mt-1 text-xs text-slate-400">Total {c.currency} {money(c.budget)} · Partner {c.currency} {money(c.partner_budget)} · {c.reward_type.replaceAll("_"," ")}</div></div><select aria-label={"Campaign status for "+c.name} value={c.status} disabled={busy==="campaign:"+c.id} onChange={e=>updateCampaign(c.id,e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black">{["DRAFT","OPEN","ACTIVE","PAUSED","COMPLETED","CANCELLED"].map(s=><option key={s} value={s}>{s}</option>)}</select></div></div>)}</div></section><section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
   <div className="border-b border-slate-100 p-6"><h3 className="text-xl font-black">Partner directory</h3><p className="mt-1 text-sm text-slate-500">Use factual verification, tier, type, audience and actual attributed outcomes for partner selection.</p></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-[#0F3E8A] text-white"><tr>{["Partner","Type","Verification","Tier","Audience","Campaigns","Leads/Won","Revenue","Disputes","Status"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{partners.map(p=><tr key={p.id} className="border-t border-slate-100"><td className="px-4 py-4 font-black">{p.name}</td><td className="px-4 py-4">{p.type}</td><td className="px-4 py-4"><select value={p.verification_status} disabled={busy===p.id} onChange={e=>updatePartner(p.id,"verificationStatus",e.target.value)} className="rounded-lg border px-2 py-1 text-xs">{["REGISTERED","VERIFIED","SUSPENDED"].map(x=><option key={x}>{x}</option>)}</select></td><td className="px-4 py-4"><select value={p.tier} disabled={busy===p.id} onChange={e=>updatePartner(p.id,"tier",e.target.value)} className="rounded-lg border px-2 py-1 text-xs">{["STARTER","VERIFIED","PRO","ELITE"].map(x=><option key={x}>{x}</option>)}</select></td><td className="px-4 py-4">{p.audience_size?.toLocaleString("en-ET")||"—"}</td><td className="px-4 py-4">{p.active_campaigns}/{p.campaigns}</td><td className="px-4 py-4">{p.leads}/{p.won}</td><td className="px-4 py-4 font-black">ETB {money(p.revenue)}</td><td className="px-4 py-4">{p.open_disputes}</td><td className="px-4 py-4"><select value={p.status} disabled={busy===p.id} onChange={e=>updatePartner(p.id,"status",e.target.value)} className="rounded-lg border px-2 py-1 text-xs">{["ACTIVE","PAUSED","PENDING"].map(x=><option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table></div>
  </section>

  <PartnerPayoutBatch />
  <section className="grid gap-8 xl:grid-cols-2">
   <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-black">Campaign matching</h3><div className="mt-4 space-y-3">{campaigns.map(c=><CampaignCard key={c.id} campaign={c} partners={partners} onInvite={invite} busy={busy}/>)}</div></div>
   <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-black">Disputes</h3><div className="mt-4 space-y-3">{disputes.map(d=><div key={d.id} className="rounded-2xl border p-4"><div className="font-black">{d.subject}</div><div className="text-xs text-slate-400">{d.partner_name} · {d.campaign_name||"No campaign"}</div><p className="mt-2 text-sm text-slate-600">{d.description}</p><div className="mt-2 flex gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black">{d.status}</span>{["OPEN","UNDER_REVIEW"].includes(d.status)&&<><button onClick={()=>dispute(d.id,"UNDER_REVIEW")} className="rounded-lg border px-2 py-1 text-[10px] font-black">Review</button><button onClick={()=>dispute(d.id,"RESOLVED")} className="rounded-lg bg-[#0F3E8A] px-2 py-1 text-[10px] font-black text-white">Resolve</button></>}</div></div>)}{!disputes.length&&<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No partner disputes.</div>}</div></div>
  </section>

  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-black">Payout history</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Partner","Amount","Status","Reference","Commission items","Created","Paid"].map(x=><th key={x} className="px-4 py-3 text-xs uppercase text-slate-500">{x}</th>)}</tr></thead><tbody>{payouts.map(p=><tr key={p.id} className="border-t"><td className="px-4 py-3 font-bold">{p.partner_name}</td><td className="px-4 py-3 font-black">ETB {money(p.amount)}</td><td className="px-4 py-3">{p.status}</td><td className="px-4 py-3">{p.reference||"—"}</td><td className="px-4 py-3">{p.commission_count}</td><td className="px-4 py-3 text-xs">{new Date(p.created_at).toLocaleString("en-ET")}</td><td className="px-4 py-3 text-xs">{p.paid_at?new Date(p.paid_at).toLocaleString("en-ET"):"—"}</td></tr>)}</tbody></table></div></section>
 </section>
}

function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl bg-white/10 p-4"><div className="text-[10px] font-black uppercase tracking-wider text-white/50">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>}
function Input({label,value,onChange,required=false,type="text",min,max}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;type?:string;min?:string;max?:string}){return <label className="text-sm font-bold text-slate-700">{label}{required&&<span className="ml-1 text-[#0F3E8A]" aria-hidden="true">*</span>}<input required={required} type={type} min={min} max={max} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#0F3E8A] focus:ring-2 focus:ring-[#0F3E8A]/10"/></label>}
function CampaignCard({campaign,partners,onInvite,busy}:{campaign:Campaign;partners:Partner[];onInvite:(c:string,p:string)=>void;busy:string}){
 const [open,setOpen]=useState(false); const types=(campaign.required_partner_types||"").split(",").map(x=>x.trim()).filter(Boolean);
 const matches=partners.filter(p=>p.status==="ACTIVE"&&p.verification_status==="VERIFIED"&&(!types.length||types.includes(p.type)));
 return <div className="rounded-2xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{campaign.name}</div><div className="text-xs text-slate-400">{campaign.status} · {campaign.location||"Any location"} · Partner budget ETB {money(campaign.partner_budget)}</div><div className="mt-1 text-sm text-slate-600">{campaign.target_description||"No objective recorded."}</div></div><button onClick={()=>setOpen(!open)} className="rounded-lg border px-3 py-2 text-xs font-black">{open?"Hide":"Match"}</button></div>{open&&<div className="mt-4 grid gap-2 sm:grid-cols-2">{matches.slice(0,30).map(p=><div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><div className="text-sm font-black">{p.name}</div><div className="text-[10px] text-slate-500">{p.type} · {p.tier} · {p.won} won</div></div><button disabled={busy===campaign.id+p.id} onClick={()=>onInvite(campaign.id,p.id)} className="rounded-lg bg-[#0F3E8A] px-2 py-2 text-[10px] font-black text-white">Invite</button></div>)}</div>}</div>
}
