"use client";

import { useEffect, useState } from "react";

type Config = {
  enabled:boolean; miniAppEnabled:boolean; miniAppUrl:string|null; menuButtonEnabled:boolean; menuButtonText:string;
  defaultPage:string; localeMode:string; requireWorkspace:boolean; requireAuth:boolean;
  showProducts:boolean; showResources:boolean; showCategories:boolean; showSearch:boolean; showFeatured:boolean;
  showSpecifications:boolean; showGallery:boolean; showRelatedItems:boolean; showAvailability:boolean; showPrice:boolean; showStock:boolean;
  primaryCta:string; secondaryCta:string|null; allowInquiry:boolean; allowAddToOrder:boolean; allowDirectOrder:boolean; allowCheckout:boolean;
  requireCustomerIdentity:boolean; requirePhone:boolean; requireDeliveryInformation:boolean; requireSalesApproval:boolean; orderConfirmationMode:string;
  paymentEnabled:boolean; allowedPaymentMethods:string[]|null; defaultPaymentMethod:string|null; currency:string;
  requirePaymentBeforeOrder:boolean; allowPayLater:boolean; paymentExpiryMinutes:number; receiptEnabled:boolean;
  captureStartParameter:boolean; preserveCampaignAttribution:boolean; preservePartnerAttribution:boolean; preserveReferralAttribution:boolean;
  attributionExpiryHours:number; createCustomerOnCommerceAction:boolean; createLeadOnInquiry:boolean;
  title:string|null; logoUrl:string|null; themeMode:string; primaryColor:string|null; secondaryColor:string|null; showWorkspaceBranding:boolean;
};

const checks=[
 ["miniAppEnabled","Enable Mini App"],["menuButtonEnabled","Show menu button"],["requireWorkspace","Require workspace context"],["requireAuth","Require authenticated user"],
 ["showProducts","Products"],["showResources","Resources"],["showCategories","Categories"],["showSearch","Search"],["showFeatured","Featured items"],
 ["showSpecifications","Specifications"],["showGallery","Media/gallery"],["showRelatedItems","Related items"],["showAvailability","Availability"],["showPrice","Prices"],["showStock","Stock"],
 ["allowInquiry","Inquiry CTA"],["allowAddToOrder","Add to order"],["allowDirectOrder","Direct order"],["allowCheckout","Checkout"],["requireCustomerIdentity","Require customer identity"],
 ["requirePhone","Require phone"],["requireDeliveryInformation","Require delivery information"],["requireSalesApproval","Require sales approval"],
 ["paymentEnabled","Enable payment"],["requirePaymentBeforeOrder","Require payment before order"],["allowPayLater","Allow pay later"],["receiptEnabled","Receipts"],
 ["captureStartParameter","Capture Telegram start parameter"],["preserveCampaignAttribution","Preserve campaign attribution"],["preservePartnerAttribution","Preserve partner attribution"],["preserveReferralAttribution","Preserve referral attribution"],
 ["createCustomerOnCommerceAction","Create/resolve customer on commerce"],["createLeadOnInquiry","Create lead on inquiry"],["showWorkspaceBranding","Workspace branding"]
] as const;

export function TelegramMiniAppSettings({workspaceId}:{workspaceId:string}){
 const [config,setConfig]=useState<Config|null>(null),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{let cancelled=false;fetch("/api/admin/telegram/config?workspaceId="+encodeURIComponent(workspaceId),{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to load Telegram configuration.");if(!cancelled)setConfig(d.config)}).catch(e=>{if(!cancelled)setNotice(e instanceof Error?e.message:"Unable to load Telegram configuration.")});return()=>{cancelled=true}},[workspaceId]);
 if(!config)return <section className="dashboard-panel p-5">{notice||"Loading Telegram Mini App settings…"}</section>;
 const set=(key:keyof Config,value:unknown)=>setConfig(v=>v?({...v,[key]:value} as Config):v);
 async function save(){setBusy(true);setNotice("");try{const r=await fetch("/api/admin/telegram/config",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId,...config})});const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to save Telegram configuration.");setConfig(d.config);setNotice("Telegram Mini App settings saved.");}catch(e){setNotice(e instanceof Error?e.message:"Unable to save Telegram configuration.")}finally{setBusy(false)}}
 return <section className="dashboard-panel p-5 space-y-6">
  <div className="dashboard-panel-heading"><div><span className="dashboard-kicker">MINI APP / CATALOG</span><h3>Telegram channel configuration</h3><p className="mt-1 text-sm opacity-70">These settings configure the Telegram presentation layer. Products, resources, orders, payments and attribution remain canonical Aslal records.</p></div></div>
  {notice&&<div className="rounded-xl border p-3 text-sm">{notice}</div>}
  <div className="grid gap-4 md:grid-cols-2">
   <label className="text-sm font-bold">Mini App URL<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.miniAppUrl||""} onChange={e=>set("miniAppUrl",e.target.value)}/></label>
   <label className="text-sm font-bold">Menu button text<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.menuButtonText} onChange={e=>set("menuButtonText",e.target.value)}/></label>
   <label className="text-sm font-bold">Default page<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.defaultPage} onChange={e=>set("defaultPage",e.target.value)}/></label>
   <label className="text-sm font-bold">Locale mode<select className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.localeMode} onChange={e=>set("localeMode",e.target.value)}><option value="telegram">Telegram locale</option><option value="user">User preference</option><option value="default">Workspace default</option></select></label>
  </div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{checks.map(([key,label])=><label key={key} className="flex items-center gap-3 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={Boolean(config[key])} onChange={e=>set(key,e.target.checked)}/>{label}</label>)}</div>
  <div className="grid gap-4 md:grid-cols-3">
   <label className="text-sm font-bold">Primary CTA<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.primaryCta} onChange={e=>set("primaryCta",e.target.value)}/></label>
   <label className="text-sm font-bold">Order confirmation mode<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.orderConfirmationMode} onChange={e=>set("orderConfirmationMode",e.target.value)}/></label>
   <label className="text-sm font-bold">Currency<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.currency} onChange={e=>set("currency",e.target.value.toUpperCase())}/></label>
   <label className="text-sm font-bold">Payment methods<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={(config.allowedPaymentMethods||[]).join(",")} onChange={e=>set("allowedPaymentMethods",e.target.value.split(",").map(v=>v.trim().toUpperCase()).filter(Boolean))}/></label>
   <label className="text-sm font-bold">Default payment method<input className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.defaultPaymentMethod||""} onChange={e=>set("defaultPaymentMethod",e.target.value)}/></label>
   <label className="text-sm font-bold">Payment expiry (minutes)<input type="number" min="1" className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.paymentExpiryMinutes} onChange={e=>set("paymentExpiryMinutes",Number(e.target.value))}/></label>
   <label className="text-sm font-bold">Attribution expiry (hours)<input type="number" min="1" className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.attributionExpiryHours} onChange={e=>set("attributionExpiryHours",Number(e.target.value))}/></label>
   <label className="text-sm font-bold">Theme mode<select className="mt-2 w-full rounded-xl border p-3 text-slate-900" value={config.themeMode} onChange={e=>set("themeMode",e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
  </div>
  <button type="button" disabled={busy} onClick={()=>void save()} className="dashboard-primary-link">{busy?"Saving…":"Save Telegram Mini App settings"}</button>
 </section>;
}
