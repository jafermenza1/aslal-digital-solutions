"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Workspace={id:string;name:string;slug:string;role?:string};
export function WorkspaceSwitcher({activeWorkspaceId,activeWorkspaceName}:{activeWorkspaceId:string|null;activeWorkspaceName:string|null}) {
 const router=useRouter(); const [workspaces,setWorkspaces]=useState<Workspace[]>([]); const [value,setValue]=useState(activeWorkspaceId||""); const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/workspaces",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(d?.workspaces){setWorkspaces(d.workspaces);if(d.activeWorkspaceId)setValue(d.activeWorkspaceId);}}).catch(()=>{});},[]);
 async function change(id:string){if(!id||id===value)return;setBusy(true);try{const r=await fetch("/api/admin/workspaces/active",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId:id}),credentials:"same-origin"});if(!r.ok)throw new Error("Unable to change business.");setValue(id);router.refresh();}finally{setBusy(false);}}
 return <label className="flex min-w-[210px] items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2"><span className="sr-only">Active business</span><span className="text-[9px] font-black uppercase tracking-[.16em] text-white/40">Business</span><select value={value} disabled={busy||workspaces.length===0} onChange={e=>change(e.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-black text-white outline-none">{workspaces.length===0&&<option value={value}>{activeWorkspaceName||"No workspace"}</option>}{workspaces.map(w=><option key={w.id} value={w.id}>{w.name} {w.role ? "· "+w.role : ""}</option>)}</select></label>;
}