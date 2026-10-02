"use client";
import {useState} from "react";

type Party={id:string;name:string;type:string;status:string;email?:string|null;phone?:string|null};
type Target={id:string;name:string;partnerNumber?:string;email?:string;type?:string};
type Listing={id:string;title:string};
type Authorization={id:string;authorizationType:string;status:string;party?:Party|null;partner?:Target|null;user?:Target|null;effectiveAt:string;expiresAt?:string|null;territory?:string|null;channel?:string|null;protectionDays?:number|null};

const PARTY_TYPES=["BUSINESS","SUPPLIER","ASSET_OWNER","SERVICE_PROVIDER","EXTERNAL_OWNER"];
const AUTH_TYPES=["OWNED","SUPPLIED","RESELLER_AUTHORIZED","IMPLEMENTATION_PARTNER","AFFILIATE_PROMOTION","SERVICE_PROVIDER","CUSTOM"];
const AUTH_STATUSES=["REQUESTED","APPROVED","ACTIVE","SUSPENDED","EXPIRED","REVOKED"];

export function CommercialAuthorizationManager({workspaceId,initialParties,listings,users,partners}:{workspaceId:string;initialParties:Party[];listings:Listing[];users:Target[];partners:Target[]}){
 const [parties,setParties]=useState(initialParties),[selected,setSelected]=useState(listings[0]?.id||""),[auths,setAuths]=useState<Authorization[]>([]),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 const [party,setParty]=useState({name:"",type:"SUPPLIER",email:"",phone:""});
 const [target,setTarget]=useState({kind:"PARTNER",id:"",authorizationType:"RESELLER_AUTHORIZED",status:"REQUESTED",territory:"",channel:"",protectionDays:""});
 const loadAuth=async(id:string)=>{setSelected(id);if(!id){setAuths([]);return;}const r=await fetch("/api/admin/commercial-listings/"+id+"/authorizations?workspaceId="+encodeURIComponent(workspaceId));const d=await r.json().catch(()=>({}));setAuths(r.ok?d.authorizations||[]:[]);};
 const addParty=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setNotice("");try{const r=await fetch("/api/admin/commercial-parties",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...party,workspaceId})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not create party.");setParties([d.party,...parties]);setParty({name:"",type:"SUPPLIER",email:"",phone:""});setNotice("Owner/supplier saved.");}catch(e){setNotice(e instanceof Error?e.message:"Could not save party.");}finally{setBusy(false);}};
 const addAuth=async(e:React.FormEvent)=>{e.preventDefault();if(!selected||!target.id){setNotice("Choose a listing and an authorized target.");return;}setBusy(true);setNotice("");try{const body:any={workspaceId,authorizationType:target.authorizationType,status:target.status,territory:target.territory,channel:target.channel,protectionDays:target.protectionDays?Number(target.protectionDays):null};body[target.kind==="PARTNER"?"partnerId":target.kind==="USER"?"userId":"partyId"]=target.id;const r=await fetch("/api/admin/commercial-listings/"+selected+"/authorizations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not create authorization.");setAuths([d.authorization,...auths]);setNotice("Commercial authorization recorded.");}catch(e){setNotice(e instanceof Error?e.message:"Could not save authorization.");}finally{setBusy(false);}};
 const setStatus=async(a:Authorization,status:string)=>{const r=await fetch("/api/admin/commercial-listings/"+selected+"/authorizations/"+a.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId,status})});const d=await r.json().catch(()=>({}));if(r.ok)setAuths(auths.map(x=>x.id===a.id?{...x,...d.authorization}:x));else setNotice(d.error||"Could not change authorization.");};
 return <div className="mt-8 grid gap-6 xl:grid-cols-2">
  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
   <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">CE-2 / Owner & Supplier Registry</div>
   <h2 className="mt-2 text-2xl font-black">Commercial parties</h2>
   <p className="mt-2 text-sm leading-6 text-slate-500">Identify the business, supplier, asset owner or service provider controlling the commercial offering. This does not claim external legal verification.</p>
   <form onSubmit={addParty} className="mt-5 grid gap-3 sm:grid-cols-2">
    <input required value={party.name} onChange={e=>setParty({...party,name:e.target.value})} placeholder="Party / supplier name" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <select value={party.type} onChange={e=>setParty({...party,type:e.target.value})} className="rounded-xl border border-slate-200 px-4 py-3">{PARTY_TYPES.map(x=><option key={x}>{x}</option>)}</select>
    <input value={party.contactName||""} onChange={e=>setParty({...party,contactName:e.target.value} as any)} placeholder="Contact name (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input value={party.email} onChange={e=>setParty({...party,email:e.target.value})} placeholder="Email (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <input value={party.phone} onChange={e=>setParty({...party,phone:e.target.value})} placeholder="Phone (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
    <button disabled={busy} className="rounded-xl bg-[#0F3E8A] px-4 py-3 font-black text-white">Add party</button>
   </form>
   {notice&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">{notice}</div>}
   <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">{parties.map(p=><div key={p.id} className="flex items-center justify-between gap-3 p-4"><div><div className="font-black">{p.name}</div><div className="text-xs text-slate-500">{p.type} · {p.status}</div></div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-[#0F3E8A]">Commercial party</span></div>)}{!parties.length&&<div className="p-5 text-sm text-slate-500">No commercial parties registered.</div>}</div>
  </section>
  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
   <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">Distribution authorization</div>
   <h2 className="mt-2 text-2xl font-black">Who may distribute this listing?</h2>
   <div className="mt-5 grid gap-3">
    <select value={selected} onChange={e=>loadAuth(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Choose listing</option>{listings.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select>
    <div className="grid gap-3 sm:grid-cols-2">
     <select value={target.kind} onChange={e=>setTarget({...target,kind:e.target.value,id:""})} className="rounded-xl border border-slate-200 px-4 py-3"><option value="PARTNER">Partner</option><option value="USER">Staff user</option><option value="PARTY">Commercial party</option></select>
     <select value={target.id} onChange={e=>setTarget({...target,id:e.target.value})} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Choose target</option>{(target.kind==="PARTNER"?partners:target.kind==="USER"?users:parties).map((x:any)=><option key={x.id} value={x.id}>{x.name}{x.partnerNumber?" · "+x.partnerNumber:""}</option>)}</select>
     <select value={target.authorizationType} onChange={e=>setTarget({...target,authorizationType:e.target.value})} className="rounded-xl border border-slate-200 px-4 py-3">{AUTH_TYPES.map(x=><option key={x}>{x}</option>)}</select>
     <select value={target.status} onChange={e=>setTarget({...target,status:e.target.value})} className="rounded-xl border border-slate-200 px-4 py-3">{AUTH_STATUSES.map(x=><option key={x}>{x}</option>)}</select>
     <input value={target.territory} onChange={e=>setTarget({...target,territory:e.target.value})} placeholder="Territory (optional)" className="rounded-xl border border-slate-200 px-4 py-3"/>
     <input value={target.channel} onChange={e=>setTarget({...target,channel:e.target.value})} placeholder="Channel (Telegram, TikTok, direct…)" className="rounded-xl border border-slate-200 px-4 py-3"/>
     <input type="number" min="0" value={target.protectionDays} onChange={e=>setTarget({...target,protectionDays:e.target.value})} placeholder="Protection days" className="rounded-xl border border-slate-200 px-4 py-3"/>
     <button disabled={busy||!selected} onClick={addAuth as any} className="rounded-xl bg-[#E2B02A] px-4 py-3 font-black text-[#1E293B]">Record authorization</button>
    </div>
   </div>
   <div className="mt-6 space-y-3">{auths.map(a=><div key={a.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-black">{a.party?.name||a.partner?.name||a.user?.name||"Target"}</div><div className="text-xs text-slate-500">{a.authorizationType} · {a.status}{a.territory?" · "+a.territory:""}{a.channel?" · "+a.channel:""}</div></div><select value={a.status} onChange={e=>setStatus(a,e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold">{AUTH_STATUSES.map(x=><option key={x}>{x}</option>)}</select></div></div>)}{selected&&!auths.length&&<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No authorizations recorded for this listing yet.</div>}</div>
  </section>
 </div>;
}
