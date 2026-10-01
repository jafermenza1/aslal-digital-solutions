"use client";

import Link from "next/link";
import React from "react";
import { usePathname,useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { DashboardNav } from "@/components/DashboardNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAppUi } from "@/lib/app-i18n";
import type { Locale } from "@/lib/i18n";
import type { WorkspaceContext } from "@/lib/workspaces";

type User={name:string;email:string;role:string;permissions:string[]};
type WorkspaceOption=WorkspaceContext;
function WorkspaceSwitcher({current,workspaces}:{current:WorkspaceContext|null;workspaces:WorkspaceOption[]}){const [busy,setBusy]=React.useState(false);async function choose(id:string){setBusy(true);try{const r=await fetch("/api/admin/workspaces/active",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId:id})});if(r.ok)window.location.reload();}finally{setBusy(false);}}return <select aria-label="Active business workspace" disabled={busy||workspaces.length<2} value={current?.id||""} onChange={e=>void choose(e.target.value)} className="max-w-[220px] rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-xs font-bold text-white">{workspaces.map(w=><option key={w.id} value={w.id}>{w.name} · {w.role}</option>)}</select>;}
const roleLabels:Record<string,string>={SUPER_ADMIN:"Super Administrator",ADMIN:"Administrator",BUSINESS_OWNER:"Business Owner",SALES_MANAGER:"Sales Manager",SALES_OPERATOR:"Sales Operator",MARKETING_OPERATOR:"Marketing Operator",PARTNER_MANAGER:"Partner Manager",PARTNER:"Partner",FINANCE:"Finance Manager",AUDITOR:"Auditor",CLIENT:"Client"};

function titleFor(pathname:string,t:ReturnType<typeof getAppUi>){const entries:[string,string][]=[
["/dashboard/quotes",t.nav.quotes],["/dashboard/orders","Orders"],
["/dashboard/leads",t.nav.leads],["/dashboard/customers",t.nav.customers],["/dashboard/conversations",t.nav.conversations],["/dashboard/email-templates",t.nav.emailTemplates],["/dashboard/email","Email Operations"],
["/dashboard/insights",t.nav.insights],["/dashboard/journey",t.nav.journey],["/dashboard/operations",t.nav.operations],["/dashboard/partners",t.nav.partners],["/dashboard/finance","Finance & Payouts"],["/dashboard/workspaces","Workspaces"],["/dashboard/partner",t.nav.partnerPortal],["/dashboard/products",t.nav.products],["/dashboard/users",t.nav.users],["/dashboard/telegram",t.nav.telegramSales],["/dashboard",t.nav.overview]
];return entries.find(([href])=>pathname===href||pathname.startsWith(href+"/"))?.[1]||t.nav.overview;}

export function DashboardShell({user,locale,children,workspace,workspaces,workspacePermissions}:{user:User;locale:Locale;children:React.ReactNode;workspace:WorkspaceContext|null;workspaces:WorkspaceContext[];workspacePermissions:string[]}){const pathname=usePathname();const router=useRouter();const t=getAppUi(locale);const title=titleFor(pathname,t);
 React.useEffect(()=>{let lastActivity=Date.now();let stopped=false;const mark=()=>{lastActivity=Date.now();};const events=["pointerdown","keydown","touchstart","scroll"];events.forEach(event=>window.addEventListener(event,mark,{passive:true}));const timer=window.setInterval(async()=>{if(stopped||Date.now()-lastActivity>4*60*1000)return;try{const response=await fetch("/api/auth/heartbeat",{method:"POST",cache:"no-store",credentials:"same-origin"});if(response.status===401)router.push("/login?error=session-expired");}catch{}},2*60*1000);return()=>{stopped=true;window.clearInterval(timer);events.forEach(event=>window.removeEventListener(event,mark));};},[router]);
return <div className="dashboard-app">
 <aside className="dashboard-sidebar">
  <div className="dashboard-sidebar-top"><BrandLogo href="/dashboard"/><div className="dashboard-role">{workspace?.name||"No workspace"} · {workspace?.role||roleLabels[user.role]||user.role}</div></div>
  <DashboardNav locale={locale} permissions={workspacePermissions}/>
  <div className="dashboard-sidebar-bottom"><div className="dashboard-status"><span className="dashboard-status-dot" aria-hidden="true"/><div><strong>System online</strong><span>Database-backed workspace</span></div></div><Link href="/" className="dashboard-website-link">↗ {t.shell.website}</Link></div>
 </aside>
 <div className="dashboard-main">
  <header className="dashboard-topbar">
   <div className="dashboard-topbar-heading"><span>{t.dashboard.eyebrow}</span><div className="dashboard-topbar-title-row"><h1>{title}</h1><Link href={`/dashboard/help/${pathname==="/dashboard"?"overview":pathname.split("/").filter(Boolean).slice(1).join("-")}`} target="_blank" rel="noopener noreferrer" className="dashboard-topbar-help" aria-label={`Help for ${title}`}>?</Link></div></div>
   <div className="dashboard-topbar-actions"><WorkspaceSwitcher current={workspace} workspaces={workspaces}/><div className="dashboard-user-chip"><span className="dashboard-user-avatar">{(user.name||user.email).charAt(0).toUpperCase()}</span><span className="dashboard-user-name">{user.name}</span></div><ThemeToggle compact/><LanguageToggle locale={locale}/><Link href="/" className="dashboard-top-link">{t.shell.website}</Link><form action="/api/auth/logout" method="post"><button className="dashboard-signout">{t.shell.signOut}</button></form></div>
  </header>
  <div className="dashboard-mobile-nav-wrap"><DashboardNav locale={locale} permissions={workspacePermissions} mobile/></div>
  <main className="dashboard-content">{children}</main>
 </div>
</div>;}
