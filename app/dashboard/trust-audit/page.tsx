"use client";
import {useEffect,useState} from "react";
export default function TrustAuditCenter(){
 const [events,setEvents]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/admin/partner-engine/audit").then(r=>r.json()).then(d=>setEvents(d.events||[]))},[]);
 return <main className="space-y-6"><header><div className="text-xs font-black uppercase tracking-widest text-amber-500">P9 · Audit Center</div><h1 className="mt-1 text-3xl font-black">Trust & Safety Audit</h1><p className="mt-2 text-sm text-slate-500">Immutable review history for risk scans, evidence, restrictions and restoration decisions.</p></header><section className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">{events.map(e=><div key={e.id} className="border-b border-black/5 p-4 last:border-0 dark:border-white/5"><div className="flex flex-wrap justify-between gap-2"><span className="font-black">{e.action}</span><span className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString()}</span></div><div className="mt-1 text-xs text-slate-500">{e.entity_type} · {e.entity_id||"—"} · {e.actor}</div>{e.reason&&<p className="mt-2 text-sm">{e.reason}</p>}</div>)}</section></main>;
}