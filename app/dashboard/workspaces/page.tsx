import { requirePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import WorkspaceManagement from "@/components/WorkspaceManagement";
import type { RowDataPacket } from "mysql2";

export const dynamic="force-dynamic";

type WorkspaceRow = RowDataPacket & {
  id:string;
  name:string;
  slug:string;
  client_type:string|null;
  active:number;
  member_count:number;
};

export default async function WorkspacesPage(){
 const user=await requirePermission("users.manage");
 const [rows]=await db.query<WorkspaceRow[]>(
  user.role==="ADMIN"||user.role==="SUPER_ADMIN"
   ? "SELECT w.id,w.name,w.slug,w.client_type,w.active,(SELECT COUNT(*) FROM workspace_users wu WHERE wu.workspace_id=w.id) member_count FROM workspaces w ORDER BY w.name"
   : "SELECT w.id,w.name,w.slug,w.client_type,w.active,(SELECT COUNT(*) FROM workspace_users wu2 WHERE wu2.workspace_id=w.id) member_count FROM workspaces w JOIN workspace_users wu ON wu.workspace_id=w.id WHERE wu.user_id=? AND w.active=1 ORDER BY w.name",
  user.role==="ADMIN"||user.role==="SUPER_ADMIN"?[]:[user.id],
 );
 return <main className=" min-h-screen py-10"><div className="mx-auto max-w-[1480px] px-4 sm:px-7">
  <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Administration / Workspaces</div><h1 className="mt-2 text-4xl font-black">Workspace administration</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Create business workspaces, select the active context, maintain membership, and keep every operational record tied to the correct business boundary.</p></div><div className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/55">{user.email}</div></header>
  <div className="mt-8"><WorkspaceManagement initial={rows.map(w=>({...w,active:Boolean(w.active),member_count:Number(w.member_count)}))} canManage={user.role==="ADMIN"||user.role==="SUPER_ADMIN"||user.workspaceRole==="OWNER"||user.workspaceRole==="ADMIN"}/></div>
 </div></main>;
}
