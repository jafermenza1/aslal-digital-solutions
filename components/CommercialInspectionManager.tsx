"use client";
import {useEffect,useState} from "react";

type Listing={id:string;title:string};
type Registration={id:string;status:string;buyerName?:string|null;partner:{id:string;name:string;partnerNumber:string};lead:{id:string;name:string}};
type Appointment={id:string;status:string;outcome:string;appointmentType:string;scheduledStart?:string|null;scheduledEnd?:string|null;location?:string|null;checkInAt?:string|null;registration:{id:string;status:string;protectedUntil?:string|null};listing:{id:string;title:string};partner:{id:string;name:string;partnerNumber:string};lead:{id:string;name:string}};
const STATUS=["REQUESTED","SCHEDULED","CONFIRMED","ATTENDED","COMPLETED","CANCELLED","NO_SHOW"];
const OUTCOMES=["PENDING","INSPECTION_COMPLETED","INTERESTED","NEEDS_QUOTE","NEGOTIATING","NOT_INTERESTED","RESCHEDULE_REQUIRED","NOT_AS_DESCRIBED","NO_DECISION","OTHER"];

export function CommercialInspectionManager({workspaceId,listings,registrations}:{workspaceId:string;listings:Listing[];registrations:Registration[]}){
 const [registrationId,setRegistrationId]=useState(registrations[0]?.id||""),[appointments,setAppointments]=useState<Appointment[]>([]),[start,setStart]=useState(""),[end,setEnd]=useState(""),[location,setLocation]=useState(""),[notice,setNotice]=useState(""),[checkInToken,setCheckInToken]=useState("");
 const load=async()=>{const r=await fetch("/api/admin/commercial-appointments?workspaceId="+encodeURIComponent(workspaceId)+(registrationId?"&registrationId="+encodeURIComponent(registrationId):""));const d=await r.json().catch(()=>({}));setAppointments(r.ok?d.appointments||[]:[]);};
 useEffect(()=>{void load();},[registrationId]);
 const create=async(e:React.FormEvent)=>{e.preventDefault();setNotice("");const r=await fetch("/api/admin/commercial-appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId,registrationId,scheduledStart:start?new Date(start).toISOString():null,scheduledEnd:end?new Date(end).toISOString():null,location})});const d=await r.json().catch(()=>({}));if(!r.ok){setNotice(d.error||"Could not schedule inspection.");return;}setCheckInToken(d.checkInToken||"");setNotice("Inspection appointment recorded.");await load();};
 const update=async(id:string,status:string,outcome?:string)=>{const r=await fetch("/api/admin/commercial-appointments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId,id,status,outcome})});const d=await r.json().catch(()=>({}));setNotice(r.ok?"Appointment updated.":(d.error||"Could not update appointment."));if(r.ok)await load();};
 return <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
  <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">CE-5 / Inspection & Appointment</div>
  <h2 className="mt-2 text-2xl font-black">Turn the protected opportunity into field evidence</h2>
  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Schedule an inspection or sales appointment against a protected deal. Attendance is recorded separately from the commercial outcome so a real meeting never silently becomes a lost commission.</p>
  <form onSubmit={create} className="mt-5 grid gap-3 md:grid-cols-2">
   <select required value={registrationId} onChange={e=>setRegistrationId(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">Choose protected registration</option>{registrations.filter(x=>["PROTECTED","CONVERTED"].includes(x.status)).map(x=><option key={x.id} value={x.id}>{x.buyerName||x.lead.name} · {x.partner.name}</option>)}</select>
   <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Inspection / meeting location" className="rounded-xl border border-slate-200 px-4 py-3"/>
   <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3"/>
   <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3"/>
   <button className="rounded-xl bg-[#0F3E8A] px-4 py-3 font-black text-white md:col-span-2">Schedule inspection</button>
  </form>
  {checkInToken&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><b>QR check-in token created.</b><div className="mt-1 break-all font-mono text-xs">{checkInToken}</div><div className="mt-1 text-xs text-slate-600">The raw token is shown once. A QR/print surface can encode this token in the next UI increment.</div></div>}
  {notice&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">{notice}</div>}
  <div className="mt-6 space-y-3">{appointments.map(a=><div key={a.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="font-black">{a.lead.name} · {a.partner.name}</div><div className="text-xs text-slate-500">{a.listing.title} · {a.status} · {a.outcome}{a.scheduledStart?" · "+new Date(a.scheduledStart).toLocaleString():""}{a.checkInAt?" · checked in":"")}</div></div><div className="flex flex-wrap gap-2">{a.status==="SCHEDULED"&&<button onClick={()=>update(a.id,"CONFIRMED")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">Confirm</button>}{a.status==="ATTENDED"&&<button onClick={()=>update(a.id,"COMPLETED","INSPECTION_COMPLETED")} className="rounded-lg bg-[#E2B02A] px-3 py-2 text-xs font-black">Complete inspection</button>}{["SCHEDULED","CONFIRMED"].includes(a.status)&&<button onClick={()=>update(a.id,"NO_SHOW")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">No-show</button>}{!["COMPLETED","CANCELLED","NO_SHOW"].includes(a.status)&&<button onClick={()=>update(a.id,"CANCELLED")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">Cancel</button>}</div></div></div>)}{!appointments.length&&<div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No appointments for this registration.</div>}</div>
 </section>;
}
