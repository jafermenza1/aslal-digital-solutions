"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { DashboardNav } from "@/components/DashboardNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAppUi } from "@/lib/app-i18n";
import type { Locale } from "@/lib/i18n";

type User={name:string;email:string;role:string;permissions:string[]};
const roleLabels:Record<string,string>={SUPER_ADMIN:"Super Administrator",ADMIN:"Administrator",BUSINESS_OWNER:"Business Owner",SALES_MANAGER:"Sales Manager",SALES_OPERATOR:"Sales Operator",MARKETING_OPERATOR:"Marketing Operator",PARTNER_MANAGER:"Partner Manager"};

function titleFor(pathname:string,t:ReturnType<typeof getAppUi>){const entries:[string,string][]=[
["/dashboard/quotes",t.nav.quotes],
["/dashboard/leads",t.nav.leads],["/dashboard/customers",t.nav.customers],["/dashboard/conversations",t.nav.conversations],["/dashboard/email-templates",t.nav.emailTemplates],
["/dashboard/insights",t.nav.insights],["/dashboard/journey",t.nav.journey],["/dashboard/operations",t.nav.operations],["/dashboard/partners",t.nav.partners],["/dashboard/products",t.nav.products],["/dashboard/users",t.nav.users],["/dashboard",t.nav.overview]
];return entries.find(([href])=>pathname===href||pathname.startsWith(href+"/"))?.[1]||t.nav.overview;}

export function DashboardShell({user,locale,children}:{user:User;locale:Locale;children:React.ReactNode}){const pathname=usePathname();const t=getAppUi(locale);const title=titleFor(pathname,t);
return <div className="dashboard-app">
 <aside className="dashboard-sidebar">
  <div className="dashboard-sidebar-top"><BrandLogo href="/dashboard"/><div className="dashboard-role">{roleLabels[user.role]||user.role}</div></div>
  <DashboardNav locale={locale} permissions={user.permissions}/>
  <div className="dashboard-sidebar-bottom"><div className="dashboard-status"><span className="dashboard-status-dot" aria-hidden="true"/><div><strong>System online</strong><span>Database-backed workspace</span></div></div><Link href="/" className="dashboard-website-link">↗ {t.shell.website}</Link></div>
 </aside>
 <div className="dashboard-main">
  <header className="dashboard-topbar">
   <div className="dashboard-topbar-heading"><span>{t.dashboard.eyebrow}</span><div className="dashboard-topbar-title-row"><h1>{title}</h1><Link href={`/dashboard/help/${pathname==="/dashboard"?"overview":pathname.split("/").filter(Boolean).slice(1).join("-")}`} target="_blank" rel="noopener noreferrer" className="dashboard-topbar-help" aria-label={`Help for ${title}`}>?</Link></div></div>
   <div className="dashboard-topbar-actions"><div className="dashboard-user-chip"><span className="dashboard-user-avatar">{(user.name||user.email).charAt(0).toUpperCase()}</span><span className="dashboard-user-name">{user.name}</span></div><ThemeToggle compact/><LanguageToggle locale={locale}/><Link href="/" className="dashboard-top-link">{t.shell.website}</Link><form action="/api/auth/logout" method="post"><button className="dashboard-signout">{t.shell.signOut}</button></form></div>
  </header>
  <div className="dashboard-mobile-nav-wrap"><DashboardNav locale={locale} permissions={user.permissions} mobile/></div>
  <main className="dashboard-content">{children}</main>
 </div>
</div>;}
