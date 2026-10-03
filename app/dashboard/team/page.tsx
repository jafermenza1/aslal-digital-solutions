import { requirePermission } from "@/lib/authorization";
import { getAllTeamMembers } from "@/lib/team-members";
import { TeamManager } from "@/components/TeamManager";
export const dynamic="force-dynamic";
export default async function TeamAdminPage(){await requirePermission("content.manage");const members=await getAllTeamMembers();return <main className="dashboard-page min-h-screen py-10"><div className="container-aslal"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Website CMS / About</div><h1 className="mt-2 text-4xl font-black tracking-tight">Team members</h1><p className="mt-2 max-w-3xl text-slate-500">Add, edit, publish, hide and reorder the people shown on the public About page. Profile images accept optimized WebP/JPG/PNG URLs; the public grid lazy-loads them.</p></div><div className="mt-8"><TeamManager initial={members}/></div></div></main>}
