"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result={kind:string;title:string;detail:string;href:string};
export function GlobalCommandSearch(){
 const [open,setOpen]=useState(false),[q,setQ]=useState(""),[results,setResults]=useState<Result[]>([]),[busy,setBusy]=useState(false);
 const close=()=>{setOpen(false);setQ("");setResults([])};
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(true)}if(e.key==="Escape")close()};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 useEffect(()=>{if(q.trim().length<2)return;const timer=setTimeout(async()=>{setBusy(true);try{const r=await fetch("/api/admin/global-search?q="+encodeURIComponent(q.trim()),{cache:"no-store"});const d=await r.json();setResults(r.ok?d.results||[]:[])}finally{setBusy(false)}},180);return()=>clearTimeout(timer)},[q]);
 return <><button type="button" onClick={()=>setOpen(true)} className="hidden min-w-[190px] items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-500 hover:border-[#0F3E8A] md:flex dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"><span>Search Aslal…</span><kbd className="rounded-md border px-1.5 py-0.5 text-[9px]">⌘K</kbd></button>
 {open&&<div className="fixed inset-0 z-[100] bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={close}><div className="mx-auto mt-[8vh] max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center border-b border-slate-200 px-5 dark:border-white/10"><span className="text-slate-400">⌕</span><input ref={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Find a user, business, product, partner or listing…" className="h-16 flex-1 bg-transparent px-3 text-base font-semibold outline-none dark:text-white"/><button type="button" onClick={close} className="rounded-lg border px-2 py-1 text-xs">Esc</button></div><div className="max-h-[55vh] overflow-auto p-2">{busy&&<div className="p-5 text-sm text-slate-500">Searching…</div>}{!busy&&!q&&<div className="p-5 text-sm text-slate-500">Start typing. Search results stay inside your permitted workspace scope.</div>}{!busy&&q&&results.length===0&&<div className="p-5 text-sm text-slate-500">No matching records.</div>}{results.map(r=><Link key={r.kind+r.href+r.title} href={r.href} onClick={close} className="block rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800"><div className="text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">{r.kind}</div><div className="mt-1 font-black dark:text-white">{r.title}</div><div className="mt-1 text-xs text-slate-500 dark:text-slate-300">{r.detail}</div></Link>)}</div></div></div>}
 </>;
}
