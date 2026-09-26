"use client";

import { useEffect, useState } from "react";
import { AdminTelegramSales } from "./AdminTelegramSales";
import { TelegramMiniAppSettings } from "./TelegramMiniAppSettings";

type Tab = "sales"|"public"|"qualification"|"catalog"|"knowledge"|"payments"|"handoff";
type Config = Record<string, any>;

const tabs:[Tab,string][]=[
 ["sales","Sales"],
 ["public","Public Experience"],
 ["qualification","Qualification"],
 ["catalog","Catalog / Mini App"],
 ["knowledge","Knowledge Base"],
 ["payments","Payments"],
 ["handoff","Human Handoff"],
];

export function TelegramAdminWorkspace({workspaceId,workspaceName}:{workspaceId:string;workspaceName:string}){
 const [tab,setTab]=useState<Tab>("sales");
 const [config,setConfig]=useState<Config|null>(null);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);

 useEffect(()=>{fetch("/api/admin/telegram/config?workspaceId="+encodeURIComponent(workspaceId),{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to load Telegram configuration.");setConfig(d.config)}).catch(e=>setNotice(e instanceof Error?e.message:"Unable to load Telegram configuration."))},[workspaceId]);

 async function save(patch:Config){
   if(!config)return;
   setBusy(true);setNotice("");
   try{
     const r=await fetch("/api/admin/telegram/config",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId,...patch})});
     const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to save.");
     setConfig(d.config);setNotice("Saved.");
   }catch(e){setNotice(e instanceof Error?e.message:"Unable to save.");}finally{setBusy(false)}
 }
 const toggle=(key:string)=>setConfig(c=>c?{...c,[key]:!c[key]}:c);
 const json=(key:string,fallback:any)=>JSON.stringify(config?.[key]??fallback,null,2);

 if(!config)return <div className="dashboard-panel p-5">{notice||"Loading Telegram workspace…"}</div>;
 return <div className="space-y-5">
  <div className="dashboard-panel p-2 overflow-x-auto"><div className="flex min-w-max gap-2">{tabs.map(([id,label])=><button key={id} type="button" onClick={()=>setTab(id)} className={tab===id?"dashboard-primary-link":"dashboard-secondary-link"}>{label}</button>)}</div></div>
  {notice&&<div className="dashboard-panel p-3 text-sm">{notice}</div>}

  {tab==="sales"&&<AdminTelegramSales workspaceId={workspaceId} workspaceName={workspaceName}/>}
  {tab==="catalog"&&<TelegramMiniAppSettings workspaceId={workspaceId}/>}

  {tab==="public"&&<section className="dashboard-panel p-5 space-y-5">
    <div><span className="dashboard-kicker">PUBLIC / NO LOGIN</span><h2>Public Telegram experience</h2><p className="text-sm opacity-70">Visitors can start the bot, browse the catalog, qualify demand and request an agent without creating an Aslal account.</p></div>
    <div className="grid gap-3 md:grid-cols-2">{[["publicEnabled","Public bot experience"],["allowAnonymousUsers","Allow anonymous users"],["inlineModeEnabled","Enable Telegram Inline Mode"],["inlineCatalogEnabled","Expose catalog in Inline Mode"]].map(([k,l])=><label key={k} className="flex items-center gap-3 rounded-xl border p-4 font-bold"><input type="checkbox" checked={!!config[k]} onChange={()=>toggle(k)}/>{l}</label>)}</div>
    <label className="block text-sm font-bold">Public menu JSON<textarea rows={6} className="mt-2 w-full rounded-xl border p-3 text-slate-900 font-mono text-xs" value={json("publicMenu",["Catalog","Qualify me","Pricing","Talk to Agent"])} onChange={e=>{try{setConfig(c=>({...c,publicMenu:JSON.parse(e.target.value)}))}catch{}}}/></label>
    <button disabled={busy} onClick={()=>void save({publicEnabled:config.publicEnabled,allowAnonymousUsers:config.allowAnonymousUsers,inlineModeEnabled:config.inlineModeEnabled,inlineCatalogEnabled:config.inlineCatalogEnabled,publicMenu:config.publicMenu})} className="dashboard-primary-link">{busy?"Saving…":"Save public settings"}</button>
  </section>}

  {tab==="qualification"&&<section className="dashboard-panel p-5 space-y-5">
    <div><span className="dashboard-kicker">DETERMINISTIC STATE MACHINE</span><h2>Lead qualification flow</h2><p className="text-sm opacity-70">Use button-driven steps. Answers are stored in the public Telegram session and can be promoted into the canonical lead record.</p></div>
    <label className="flex items-center gap-3 rounded-xl border p-4 font-bold"><input type="checkbox" checked={!!config.qualificationEnabled} onChange={()=>toggle("qualificationEnabled")}/> Enable decision-tree qualification</label>
    <label className="block text-sm font-bold">Flow JSON<textarea rows={18} className="mt-2 w-full rounded-xl border p-3 text-slate-900 font-mono text-xs" value={json("qualificationFlow",[])} onChange={e=>{try{setConfig(c=>({...c,qualificationFlow:JSON.parse(e.target.value)}))}catch{}}}/></label>
    <p className="text-xs opacity-60">Example step: <code>{'{ "id": "service", "question": "Select Service", "options": [{ "label": "Website", "value": "website", "next": "budget" }] }'}</code>.</p>
    <button disabled={busy} onClick={()=>void save({qualificationEnabled:config.qualificationEnabled,qualificationFlow:config.qualificationFlow})} className="dashboard-primary-link">{busy?"Saving…":"Save qualification"}</button>
  </section>}

  {tab==="knowledge"&&<section className="dashboard-panel p-5 space-y-5">
    <div><span className="dashboard-kicker">MENU + KEYWORDS</span><h2>Knowledge base rules</h2><p className="text-sm opacity-70">Exact or regex rules can return a configured answer/card without AI. Keep matching deterministic.</p></div>
    <label className="flex items-center gap-3 rounded-xl border p-4 font-bold"><input type="checkbox" checked={!!config.knowledgeBaseEnabled} onChange={()=>toggle("knowledgeBaseEnabled")}/> Enable keyword knowledge base</label>
    <label className="block text-sm font-bold">Keyword rules JSON<textarea rows={18} className="mt-2 w-full rounded-xl border p-3 text-slate-900 font-mono text-xs" value={json("keywordRules",[])} onChange={e=>{try{setConfig(c=>({...c,keywordRules:JSON.parse(e.target.value)}))}catch{}}}/></label>
    <p className="text-xs opacity-60">Example: <code>{'{ "pattern": "\\b(price|pricing|cost)\\b", "mode": "REGEX", "response": "Here is our pricing…", "priority": 10 }'}</code>.</p>
    <button disabled={busy} onClick={()=>void save({knowledgeBaseEnabled:config.knowledgeBaseEnabled,keywordRules:config.keywordRules})} className="dashboard-primary-link">{busy?"Saving…":"Save knowledge rules"}</button>
  </section>}

  {tab==="payments"&&<section className="dashboard-panel p-5 space-y-5">
    <div><span className="dashboard-kicker">CHECKOUT</span><h2>Telegram payment settings</h2><p className="text-sm opacity-70">Provider credentials remain server-side. This tab controls which adapters the public flow may offer.</p></div>
    <div className="grid gap-3 md:grid-cols-2">{[["paymentEnabled","Enable commerce payments"],["telegramPaymentsEnabled","Telegram Payments API"],["localPaymentsEnabled","Local Ethiopian payment adapters"]].map(([k,l])=><label key={k} className="flex items-center gap-3 rounded-xl border p-4 font-bold"><input type="checkbox" checked={!!config[k]} onChange={()=>toggle(k)}/>{l}</label>)}</div>
    <label className="block text-sm font-bold">Providers<textarea rows={4} className="mt-2 w-full rounded-xl border p-3 text-slate-900 font-mono text-xs" value={json("paymentProviders",["CHAPA","TELEBIRR","CBE_BIRR"])} onChange={e=>{try{setConfig(c=>({...c,paymentProviders:JSON.parse(e.target.value)}))}catch{}}}/></label>
    <button disabled={busy} onClick={()=>void save({paymentEnabled:config.paymentEnabled,telegramPaymentsEnabled:config.telegramPaymentsEnabled,localPaymentsEnabled:config.localPaymentsEnabled,paymentProviders:config.paymentProviders})} className="dashboard-primary-link">{busy?"Saving…":"Save payment settings"}</button>
  </section>}

  {tab==="handoff"&&<section className="dashboard-panel p-5 space-y-5">
    <div><span className="dashboard-kicker">HUMAN HANDOFF</span><h2>Agent routing</h2><p className="text-sm opacity-70">“Talk to Agent” changes the public session to SUPPORT_REQUESTED and routes the conversation to the configured admin group.</p></div>
    <label className="flex items-center gap-3 rounded-xl border p-4 font-bold"><input type="checkbox" checked={!!config.humanHandoffEnabled} onChange={()=>toggle("humanHandoffEnabled")}/> Enable human handoff</label>
    <label className="text-sm font-bold block">Admin group/channel chat ID<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.handoffChatId||""} onChange={e=>setConfig(c=>({...c,handoffChatId:e.target.value}))} placeholder="-1001234567890"/></label>
    <label className="text-sm font-bold block">Handoff mode<select className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.handoffMode||"ADMIN_GROUP"} onChange={e=>setConfig(c=>({...c,handoffMode:e.target.value}))}><option value="ADMIN_GROUP">Admin group</option><option value="ASSIGNED_STAFF">Assigned staff</option></select></label>
    <button disabled={busy} onClick={()=>void save({humanHandoffEnabled:config.humanHandoffEnabled,handoffChatId:config.handoffChatId,handoffMode:config.handoffMode})} className="dashboard-primary-link">{busy?"Saving…":"Save handoff settings"}</button>
  </section>}
 </div>;
}
