import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { resolvePermissions } from "@/lib/permissions";
import { UserManagement } from "@/components/UserManagement";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user=await requirePermission("users.manage");
  const users=await prisma.user.findMany({
    orderBy:[{active:"desc"},{name:"asc"}],
    select:{id:true,email:true,name:true,role:true,active:true,permissions:true,lastLoginAt:true},
  });
  const rows=users.map(u=>({id:u.id,email:u.email,name:u.name,role:u.role,active:u.active,permissions:resolvePermissions(u.role,u.permissions),lastLoginAt:u.lastLoginAt?.toISOString()??null}));
  return <main className="min-h-screen bg-[#071F47] py-10 text-white">
    <div className="mx-auto max-w-[1380px] px-4 sm:px-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Administration / Access</div><h1 className="mt-2 text-4xl font-black">Users & permissions</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Create operators, assign a role, and fine-tune the permissions they need without sharing admin credentials.</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/55">{user.email}</span><Link href="/dashboard/products" className="rounded-full border border-white/15 px-4 py-3 text-sm font-black">Products & services</Link><Link href="/dashboard/email-templates" className="rounded-full border border-white/15 px-4 py-3 text-sm font-black">Auto-reply email</Link><Link href="/dashboard" className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B]">← Dashboard</Link></div>
      </header>
      <div className="mt-8"><UserManagement initial={rows}/></div>
    </div>
  </main>;
}
