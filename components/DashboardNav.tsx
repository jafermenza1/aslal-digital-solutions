"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getAppUi } from "@/lib/app-i18n";

type Item={key:keyof ReturnType<typeof getAppUi>["nav"];href:string;permission:string;icon:keyof typeof ICONS;group:keyof ReturnType<typeof getAppUi>["groups"];nested?:boolean;label?:string;match?:string};

const ICONS={
home:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
leads:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>,
users:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 20c.5-3.5 2.2-5 5.5-5s5 1.5 5.5 5M16 11a3 3 0 1 0 0-6M16.5 15c2.2.2 3.5 1.8 4 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
message:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5.5 4v-4.5A2.5 2.5 0 0 1 2 13V5.5h2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
mail:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7"/></svg>,
chart:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V9m6 10V5m6 14v-7m4 7V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
quotes:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="1.7"/><path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
journey:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="19" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="19" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="m7.5 11 9-4M7.5 13l9 4" stroke="currentColor" strokeWidth="1.7"/></svg>,
ops:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v3m0 12v3M3 12h3m12 0h3m-4.6-6.4-2.1 2.1m-8.6 8.6-2.1 2.1m13 0-2.1-2.1M7.7 7.7 5.6 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/></svg>,
partner:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M2.5 19c.4-3 2-4.5 4.5-4.5S11 16 11.5 19M12.5 19c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5" stroke="currentColor" strokeWidth="1.7"/></svg>,
box:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
store:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10h16l-1-5H5l-1 5Zm1 0v9h14v-9M8 14h8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M4 10a3 3 0 0 0 5 0 3 3 0 0 0 6 0 3 3 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7"/></svg>
} as const;

const ITEMS:Item[]=[
{key:"overview",href:"/dashboard",permission:"dashboard.view",icon:"home",group:"command"},
{key:"overview",href:"/dashboard/workbench",permission:"dashboard.view",icon:"home",group:"command",label:"My Workbench"},
{key:"insights",href:"/dashboard/reports",permission:"dashboard.view",icon:"chart",group:"command",label:"Reports Center"},
{key:"journey",href:"/dashboard/journey",permission:"dashboard.view",icon:"journey",group:"command"},
{key:"insights",href:"/dashboard/insights",permission:"insights.view",icon:"chart",group:"command"},

{key:"leads",href:"/dashboard/leads",permission:"leads.view",icon:"leads",group:"revenue"},
{key:"customers",href:"/dashboard/customers",permission:"customers.view",icon:"users",group:"revenue"},
{key:"quotes",href:"/dashboard/quotes",permission:"commerce.view",icon:"quotes",group:"revenue"},
{key:"quotes",href:"/dashboard/orders",permission:"commerce.view",icon:"box",group:"revenue",label:"Orders"},
{key:"conversations",href:"/dashboard/conversations",permission:"conversations.view",icon:"message",group:"revenue"},
{key:"emailTemplates",href:"/dashboard/email",permission:"email.view",icon:"mail",group:"revenue",label:"Email Operations"},
{key:"telegramSales",href:"/dashboard/telegram",permission:"telegram.view",icon:"message",group:"revenue",label:"Telegram Sales"},

{key:"partners",href:"/dashboard/partners",permission:"partners.manage",icon:"partner",group:"growth",label:"Partners & Commissions"},
{key:"partners",href:"/dashboard/partners?tab=engine",permission:"partners.manage",icon:"store",group:"growth",label:"Partner Marketplace"},
{key:"partners",href:"/dashboard/partners/network",permission:"partners.manage",icon:"partner",group:"growth",label:"Partner Network"},
{key:"partners",href:"/dashboard/partner-settings",permission:"partners.manage",icon:"partner",group:"growth",nested:true,label:"Partner Registration Settings"},
{key:"partners",href:"/dashboard/partner-sales-assets",permission:"partners.manage",icon:"store",group:"growth",nested:true,label:"Partner Sales Assets"},

{key:"products",href:"/dashboard/products",permission:"products.manage",icon:"box",group:"commerce",label:"Products & Services"},
{key:"products",href:"/dashboard/listings",permission:"listings.manage",icon:"store",group:"commerce",label:"Commercial Listings"},
{key:"operations",href:"/dashboard/operations",permission:"operations.view",icon:"ops",group:"commerce"},
{key:"operations",href:"/dashboard/finance",permission:"commissions.manage",icon:"ops",group:"commerce",label:"Finance & Payouts"},

{key:"users",href:"/dashboard/users",permission:"users.manage",icon:"users",group:"administration",label:"Users & Access"},
{key:"users",href:"/dashboard/workspaces",permission:"users.manage",icon:"users",group:"administration",label:"Workspaces"},
{key:"emailTemplates",href:"/dashboard/email-templates",permission:"email_templates.manage",icon:"mail",group:"administration",nested:true,label:"Email Templates"},
{key:"publicContent",href:"/dashboard/public-content",permission:"content.manage",icon:"store",group:"administration",nested:true,label:"Website Content & Brand"},
{key:"publicContent",href:"/dashboard/resources",permission:"content.manage",icon:"store",group:"administration",nested:true,label:"Resources"},
{key:"publicContent",href:"/dashboard/team",permission:"content.manage",icon:"users",group:"administration",nested:true,label:"Team"},
{key:"publicContent",href:"/dashboard/social-profiles",permission:"content.manage",icon:"message",group:"administration",nested:true,label:"Social Profiles"},

{key:"publicCatalog",href:"/products",permission:"dashboard.view",icon:"store",group:"explore"},
{key:"partnerPortal",href:"/dashboard/partner",permission:"partner.portal.view",icon:"partner",group:"explore"},
{key:"partnerPortal",href:"/dashboard/partner/sales-assets",permission:"partner.portal.view",icon:"store",group:"explore",nested:true,label:"Sell & Print"}
];

export function DashboardNav({locale,permissions,mobile=false,open=false,onClose}:{locale:Locale;permissions:string[];mobile?:boolean;open?:boolean;onClose?:()=>void}) {
 const pathname=usePathname(); const t=getAppUi(locale); const allowed=ITEMS.filter(item=>permissions.includes(item.permission));
 const groups=Array.from(new Set(allowed.map(item=>item.group))); const activeGroup=allowed.find(item=>isActive(pathname,item.href,item.match))?.group;
 const [openGroups,setOpenGroups]=useState<Record<string,boolean>>(()=>Object.fromEntries(groups.map(group=>[group,group===activeGroup||group==="revenue"||group==="command"])));
 const toggle=(group:string)=>setOpenGroups(current=>({...current,[group]:!current[group]}));
 if(mobile)return <><button type="button" className={`dashboard-mobile-drawer-backdrop${open?" is-open":""}`} aria-label="Close navigation" aria-hidden={!open} tabIndex={open?0:-1} onClick={onClose}/><aside className={`dashboard-mobile-drawer${open?" is-open":""}`} aria-hidden={!open}>{groups.map(group=>{const items=allowed.filter(item=>item.group===group);const groupOpen=openGroups[group]??false;return <section key={group} className="dashboard-mobile-drawer-group"><button type="button" onClick={()=>toggle(group)} aria-expanded={groupOpen} className="dashboard-mobile-drawer-group-button"><span className="truncate">{t.groups[group]}</span><span aria-hidden="true">{groupOpen?"−":"+"}</span></button>{groupOpen&&<div className="dashboard-mobile-drawer-items">{items.map(item=><NavItem key={item.href} item={item} active={isActive(pathname,item.href,item.match)} label={item.label || t.nav[item.key]} mobile onNavigate={onClose}/>)}</div>}</section>})}</aside></>;
 return <nav className="dashboard-sidebar-nav space-y-2">{groups.map(group=>{const items=allowed.filter(item=>item.group===group);const open=openGroups[group]??false;return <section key={group} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[.02]"><button type="button" onClick={()=>toggle(group)} aria-expanded={open} className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-black uppercase tracking-[.18em] text-white/45 hover:bg-white/[.04] hover:text-white/70"><span>{t.groups[group]}</span><span aria-hidden="true">{open?"−":"+"}</span></button>{open&&<div className="space-y-1 border-t border-white/5 p-1.5">{items.map(item=><NavItem key={item.href} item={item} active={isActive(pathname,item.href)} label={item.label || t.nav[item.key]}/>)}</div>}</section>})}</nav>;
}
function isActive(pathname:string,href:string,match?:string){return match?pathname===match.split("?")[0]:href==="/dashboard"?pathname==="/dashboard":pathname===href||pathname.startsWith(href+"/");}
function NavItem({item,active,label,mobile=false,onNavigate}:{item:Item;active:boolean;label:string;mobile?:boolean;onNavigate?:()=>void}){const icon=ICONS[item.icon];const helpHref=`/dashboard/help/${item.key === "publicCatalog" ? "public-catalog" : item.key}`;return <div className={`dashboard-nav-link-row flex items-center ${active?"active":""}`}><Link href={item.href} onClick={onNavigate} className={`dashboard-nav-item min-w-0 flex-1 ${active?"active ":""}${item.nested?"nested ":""}${mobile?"mobile":""}`} aria-current={active?"page":undefined}><span className="dashboard-nav-icon shrink-0">{icon}</span><span className="truncate">{label}</span>{active&&!mobile&&<span className="dashboard-nav-active-dot shrink-0" aria-hidden="true"/>}<span className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/20 text-[10px] font-black opacity-70 transition group-hover:opacity-100" title={`Help for ${label}`}>?</span></Link><Link href={helpHref} target="_blank" rel="noopener noreferrer" className="sr-only" aria-label={`Open help for ${label}`}>Help</Link></div>;}
