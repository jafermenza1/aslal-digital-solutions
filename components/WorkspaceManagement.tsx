"use client";

import { useEffect, useState } from "react";

type Workspace={id:string;name:string;slug:string;client_type?:string|null;active:boolean;member_count?:number};
type Member={membership_id:string;user_id:string;email:string;name:string;role:string;workspace_role:string;active:boolean};
type User={id:string;email:string;name:string;role:string;active:boolean};

const workspaceRoles=["OWNER","ADMIN","MANAGER","SALES","FINANCE","AUDITOR","CLIENT","PARTNER","MEMBER"];

export default function WorkspaceManagement({initial,canManage}:{initial:Workspace[];canManage:boolean}){
 const [workspaces,setWorkspaces]=useState(initial);
 const [selected,setSelected]=useState<Workspace|null>(initial[0]||null);
 const [members,setMembers]=useState<Member[]>([]);
 const [users,setUsers]=useState<User[]>([]);
 const [busy,setBusy]=useState("");
 const [notice,setNotice]=useState("");
 const [form,setForm]=useState({name:"",slug:"",clientType:""});
 const [member,setMember]=useState({userId:"",role:"MEMBER"});
 const initialSelected=initial[0]||null;
 const [edit,setEdit]=useState({name:initialSelected?.name||"",slug:initialSelected?.slug||"",clientType:initialSelected?.client_type||"",active:initialSelected?.active??true});

 useEffect(()=>{if(selected)void loadMembers(selected.id);},[selected]);
 useEffect(()=>{fetch("/api/admin/users").then(r=>r.ok?r.json():null).then(d=>d?.users&&setUsers(d.users)).catch(()=>{});},[]);

 async function loadMembers(id:string){
  const r=await fetch("/api/admin/workspaces/"+encodeURIComponent(id)+"/members");
  const d=await r.json().catch(()=>({}));
  if(r.ok)setMembers(d.members||[]);
 }
 async function createWorkspace(e:React.FormEvent){
  e.preventDefault();setBusy("create");setNotice("");
  try{const r=await fetch("/api/admin/workspaces",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not create workspace.");const w={...d,client_type:d.clientType,active:true};setWorkspaces(v=>[...v,w]);setSelected(w);setForm({name:"",slug:"",clientType:""});setNotice("Workspace created and you are its OWNER.");}catch(e){setNotice(e instanceof Error?e.message:"Could not create workspace.");}finally{setBusy("");}
 }
 async function saveWorkspace(e:React.FormEvent){
  e.preventDefault();if(!selected)return;setBusy("save");setNotice("");
  try{const r=await fetch("/api/admin/workspaces/"+encodeURIComponent(selected.id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(edit)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not update workspace.");setWorkspaces(v=>v.map(w=>w.id===selected.id?{...w,...d.workspace}:w));setSelected(v=>v?{...v,...d.workspace}:v);setNotice("Workspace updated.");}catch(e){setNotice(e instanceof Error?e.message:"Could not update workspace.");}finally{setBusy("");}
 }
 async function activate(){
  if(!selected)return;setBusy("activate");setNotice("");
  try{const r=await fetch("/api/admin/workspaces/active",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId:selected.id})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not select workspace.");setNotice("Active workspace set to "+d.workspace.name+". Reloading…");window.location.reload();}catch(e){setNotice(e instanceof Error?e.message:"Could not select workspace.");}finally{setBusy("");}
 }
 async function amendMember(userId:string,role:string){if(!selected)return;setBusy("member-"+userId);setNotice("");try{const r=await fetch("/api/admin/workspaces/"+encodeURIComponent(selected.id)+"/members",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,role})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not amend membership.");await loadMembers(selected.id);setNotice("Membership updated.");}catch(e){setNotice(e instanceof Error?e.message:"Could not amend membership.");}finally{setBusy("");}}
 async function removeMember(userId:string){if(!selected||!window.confirm("Remove this user from the workspace?"))return;setBusy("remove-"+userId);setNotice("");try{const r=await fetch("/api/admin/workspaces/"+encodeURIComponent(selected.id)+"/members?userId="+encodeURIComponent(userId),{method:"DELETE"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not remove membership.");await loadMembers(selected.id);setNotice("Membership removed.");}catch(e){setNotice(e instanceof Error?e.message:"Could not remove membership.");}finally{setBusy("");}}
 async function addMember(e:React.FormEvent){
  e.preventDefault();if(!selected||!member.userId)return;setBusy("member");setNotice("");
  try{const r=await fetch("/api/admin/workspaces/"+encodeURIComponent(selected.id)+"/members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(member)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not assign user.");await loadMembers(selected.id);setMember({userId:"",role:"MEMBER"});setNotice("Workspace membership saved.");}catch(e){setNotice(e instanceof Error?e.message:"Could not assign user.");}finally{setBusy("");}
 }

 return <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
  <section className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 sm:p-6">
   <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">Workspace registry</div>
   <h2 className="mt-2 text-xl font-black">Select the business context</h2>
   <div className="mt-5 space-y-2">{workspaces.map(w=><button key={w.id} type="button" onClick={()=>{setSelected(w);setEdit({name:w.name,slug:w.slug,clientType:w.client_type||"",active:w.active});}} className={"w-full rounded-2xl border p-4 text-left "+(selected?.id===w.id?"border-[#E2B02A]/60 bg-[#E2B02A]/10":"border-white/10 bg-white/[.02]")}><div className="flex items-center justify-between gap-3"><span className="font-black">{w.name}</span><span className={"rounded-full px-2 py-1 text-[10px] font-black "+(w.active?"bg-emerald-400/10 text-emerald-300":"bg-white/10 text-white/40")}>{w.active?"ACTIVE":"OFF"}</span></div><div className="mt-1 text-xs text-white/40">{w.slug} · {w.client_type||"Internal"}{w.member_count===undefined?"":" · "+w.member_count+" members"}</div></button>)}</div>
   {canManage&&<form onSubmit={createWorkspace} className="mt-6 border-t border-white/10 pt-6"><div className="text-sm font-black">Create workspace</div><div className="mt-3 grid gap-3"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Workspace name" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/><input required value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="workspace-slug" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/><input value={form.clientType} onChange={e=>setForm({...form,clientType:e.target.value})} placeholder="Client type (optional)" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30"/><button disabled={busy==="create"} className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B]">{busy==="create"?"Creating…":"Create workspace"}</button></div></form>}
  </section>
  <section className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 sm:p-6">
   {!selected?<div className="py-12 text-center text-white/45">Select a workspace.</div>:<>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">Workspace administration</div><h2 className="mt-2 text-2xl font-black">{selected.name}</h2><p className="mt-1 text-xs text-white/40">{selected.slug} · {selected.client_type||"Internal workspace"}</p></div><button type="button" onClick={activate} disabled={busy==="activate"} className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B]">{busy==="activate"?"Selecting…":"Use as active workspace"}</button></div>
    {canManage&&<form onSubmit={saveWorkspace} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.02] p-4 sm:grid-cols-2"><input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} placeholder="Name" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white"/><input value={edit.slug} onChange={e=>setEdit({...edit,slug:e.target.value})} placeholder="Slug" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white"/><input value={edit.clientType} onChange={e=>setEdit({...edit,clientType:e.target.value})} placeholder="Client type" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white"/><label className="flex items-center gap-3 text-sm font-bold text-white/70"><input type="checkbox" checked={edit.active} onChange={e=>setEdit({...edit,active:e.target.checked})}/> Active workspace</label><button className="rounded-full border border-white/15 px-5 py-3 text-sm font-black sm:col-span-2" disabled={busy==="save"}>{busy==="save"?"Saving…":"Save workspace"}</button></form>}
    {canManage&&<form onSubmit={addMember} className="mt-6 rounded-2xl border border-white/10 bg-white/[.02] p-4"><div className="text-sm font-black">Assign user to this workspace</div><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px_auto]"><select required value={member.userId} onChange={e=>setMember({...member,userId:e.target.value})} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white"><option value="">Select user</option>{users.filter(u=>u.active).map(u=><option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}</select><select value={member.role} onChange={e=>setMember({...member,role:e.target.value})} className="rounded-xl border border-white/10 bg-white/[.05] bg-white px-4 py-3 text-sm text-slate-900">{workspaceRoles.map(role=><option key={role}>{role}</option>)}</select><button disabled={busy==="member"} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">{busy==="member"?"Saving…":"Assign"}</button></div></form>}
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-white/35"><tr>{["User","Account role","Workspace role","Status"].map(h=><th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody>{members.map(m=><tr key={m.membership_id} className="border-t border-white/5"><td className="px-3 py-3"><div className="font-black">{m.name}</div><div className="text-xs text-white/40">{m.email}</div></td><td className="px-3 py-3 text-xs font-bold">{m.role}</td><td className="px-3 py-3"><select defaultValue={m.workspace_role} onChange={e=>void amendMember(m.user_id,e.target.value)} disabled={busy==="member-"+m.user_id} className="rounded-lg border border-white/10 bg-white/[.05] px-2 py-1 text-xs font-bold text-[#E2B02A]">{workspaceRoles.map(role=><option key={role}>{role}</option>)}</select></td><td className="px-3 py-3"><div className="flex items-center gap-2"><span className="text-xs">{m.active?"ACTIVE":"OFF"}</span><button type="button" onClick={()=>void removeMember(m.user_id)} disabled={busy==="remove-"+m.user_id} className="rounded-lg border border-red-400/20 px-2 py-1 text-[10px] font-bold text-red-300">Remove</button></div></td></tr>)}{!members.length&&<tr><td colSpan={4} className="px-3 py-10 text-center text-white/40">No workspace members yet.</td></tr>}</tbody></table></div>
   </>}
   {notice&&<div className="mt-5 rounded-xl border border-[#E2B02A]/20 bg-[#E2B02A]/10 p-3 text-sm text-white/80">{notice}</div>}
  </section>
 </div>
}