"use client";
import { useEffect, useState } from "react";

type UserRow={id:string;email:string;name:string;role:string;active:boolean;permissions:string[];lastLoginAt:string|null};
const permissions=[
 "dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view",
 "conversations.view","conversations.send","conversations.manage","products.manage",
 "email_templates.manage","users.manage","partners.manage","insights.view","operations.view"
];

export function UserManagement({initial}:{initial:UserRow[]}) {
 const [rows,setRows]=useState(initial),[busy,setBusy]=useState(""),[notice,setNotice]=useState("");
 const [draft,setDraft]=useState({id:"",name:"",email:"",password:"",role:"SALES_OPERATOR",active:true,selected:permissions.slice(0,7)});
 const edit=(u:UserRow)=>setDraft({id:u.id,name:u.name,email:u.email,password:"",role:u.role,active:u.active,selected:u.permissions});
 const reset=()=>setDraft({id:"",name:"",email:"",password:"",role:"SALES_OPERATOR",active:true,selected:permissions.slice(0,7)});
 const roleDefaults=(role:string)=>{
  const map:any={SUPER_ADMIN:permissions,ADMIN:permissions,SALES_MANAGER:["dashboard.view","leads.view","leads.create","leads.edit","customers.view","conversations.view","conversations.send","conversations.manage","insights.view","operations.view"],SALES_OPERATOR:["dashboard.view","leads.view","leads.create","leads.edit","customers.view","conversations.view","conversations.send"],MARKETING_OPERATOR:["dashboard.view","leads.view","customers.view","products.manage","email_templates.manage","insights.view"],PARTNER_MANAGER:["dashboard.view","leads.view","customers.view","partners.manage","insights.view"]};
  return map[role]||[];
 };
 const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy("save");setNotice("");
  const defaults=roleDefaults(draft.role);const grant=draft.selected.filter(p=>!defaults.includes(p));const revoke=defaults.filter(p=>!draft.selected.includes(p));
  const payload={...draft,password:draft.password||undefined,permissions:{grant,revoke},reason:"User management update"};
  const r=await fetch(draft.id?"/api/admin/users/"+draft.id:"/api/admin/users",{method:draft.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json().catch(()=>({}));if(!r.ok){setNotice(j.error||"Unable to save user.");}else{setNotice("User saved. Access changes are now enforced for new requests.");setRows(draft.id?rows.map(x=>x.id===draft.id?j.user:x):[j.user,...rows]);reset();}setBusy("");};
 const toggle=async(u:UserRow)=>{setBusy(u.id);const r=await fetch("/api/admin/users/"+u.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!u.active,reason:"User activation state update"})});const j=await r.json().catch(()=>({}));if(r.ok)setRows(rows.map(x=>x.id===u.id?j.user:x));else setNotice(j.error||"Unable to update user.");setBusy("");};
 return <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
  <form onSubmit={save} className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 sm:p-6">
   <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">User access</div><h2 className="mt-2 text-xl font-black">{draft.id?"Edit user":"Add user"}</h2></div>{draft.id&&<button type="button" onClick={reset} className="text-xs font-bold text-white/50">Cancel</button>}</div>
   <div className="mt-5 grid gap-3">
    <input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Full name" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/>
    <input required type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} placeholder="Email" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/>
    <input type="password" minLength={10} value={draft.password} onChange={e=>setDraft({...draft,password:e.target.value})} placeholder={draft.id?"New password (leave blank to keep)":"Password · 10+ characters"} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/>
    <select value={draft.role} onChange={e=>{const role=e.target.value;setDraft({...draft,role,selected:roleDefaults(role)})}} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white"><option>SUPER_ADMIN</option><option>ADMIN</option><option>SALES_MANAGER</option><option>SALES_OPERATOR</option><option>MARKETING_OPERATOR</option><option>PARTNER_MANAGER</option></select>
    <label className="flex items-center gap-3 text-sm font-bold text-white/70"><input type="checkbox" checked={draft.active} onChange={e=>setDraft({...draft,active:e.target.checked})}/> Active user</label>
   </div>
   <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.16em] text-white/45">Editable permissions</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map(p=><label key={p} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs"><input type="checkbox" checked={draft.selected.includes(p)} onChange={e=>setDraft({...draft,selected:e.target.checked?Array.from(new Set([...draft.selected,p])):draft.selected.filter(x=>x!==p)})}/><span className="font-semibold text-white/75">{p}</span></label>)}</div></div>
   {notice&&<div className="mt-4 rounded-xl border border-[#E2B02A]/20 bg-[#E2B02A]/10 p-3 text-sm text-white/80">{notice}</div>}
   <button disabled={!!busy} className="mt-5 rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B]">{busy==="save"?"Saving…":draft.id?"Save access":"Create user"}</button>
  </form>
  <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.03]">
   <div className="border-b border-white/10 p-5 sm:p-6"><div className="text-[10px] font-black uppercase tracking-[.16em] text-[#E2B02A]">Workspace users</div><h2 className="mt-2 text-xl font-black">People who can operate the Growth OS</h2></div>
   <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-white/35"><tr>{["Name","Role","Status","Permissions","Last login","Actions"].map(h=><th key={h} className="px-4 py-4">{h}</th>)}</tr></thead><tbody>{rows.map(u=><tr key={u.id} className="border-t border-white/5 align-top"><td className="px-4 py-4"><div className="font-black">{u.name}</div><div className="text-xs text-white/40">{u.email}</div></td><td className="px-4 py-4 text-xs font-bold">{u.role}</td><td className="px-4 py-4"><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black">{u.active?"ACTIVE":"OFF"}</span></td><td className="max-w-[230px] px-4 py-4 text-xs text-white/50">{u.permissions.length} permissions</td><td className="px-4 py-4 text-xs text-white/45">{u.lastLoginAt?new Date(u.lastLoginAt).toLocaleString("en-ET"):"Never"}</td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={()=>edit(u)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Edit</button><button type="button" disabled={busy===u.id} onClick={()=>toggle(u)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">{u.active?"Disable":"Enable"}</button></div></td></tr>)}</tbody></table></div>
   <div className="space-y-3 p-4 lg:hidden">{rows.map(u=><article key={u.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="font-black">{u.name}</div><div className="text-xs text-white/40">{u.email}</div><div className="mt-3 text-xs">{u.role} · {u.active?"ACTIVE":"OFF"} · {u.permissions.length} permissions</div><div className="mt-3 flex gap-2"><button type="button" onClick={()=>edit(u)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Edit</button><button type="button" onClick={()=>toggle(u)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">{u.active?"Disable":"Enable"}</button></div></article>)}</div>
  </section>
 </div>;
}