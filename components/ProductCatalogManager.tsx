"use client";
import { useState } from "react";
import Link from "next/link";

type ProductRow={
 id:string;slug:string;name:string;kind:"PRODUCT"|"SERVICE";providerName:string|null;relationshipType:string;tagline:string|null;
 shortDescription:string;description:string|null;features:string|null;benefits:string|null;idealFor:string|null;deliverables:string|null;
 imageUrl:string|null;galleryUrls:string|null;startingPrice:string|null;ctaLabel:string|null;ctaNote:string|null;sortOrder:number;featured:boolean;active:boolean;
};

const blank:Omit<ProductRow,"id">={slug:"",name:"",kind:"SERVICE",providerName:"Aslal Digital Solutions",relationshipType:"OWNED",tagline:"",
 shortDescription:"",description:"",features:"",benefits:"",idealFor:"",deliverables:"",imageUrl:"",galleryUrls:"",startingPrice:"",
 ctaLabel:"Request this",ctaNote:"Tell us what you need and the request will enter the Aslal sales workflow.",sortOrder:0,featured:false,active:true};

export function ProductCatalogManager({initial}:{initial:ProductRow[]}) {
 const [rows,setRows]=useState(initial),[draft,setDraft]=useState<ProductRow>({id:"",...blank}),[editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const set=(key:string,value:any)=>setDraft(d=>({...d,[key]:value}));
 const startCreate=()=>{setDraft({id:"",...blank});setEditing(true);setNotice("")};
 const startEdit=(row:ProductRow)=>{setDraft(row);setEditing(true);setNotice("")};
 const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setNotice("");
  try{
   const payload={...draft,active:draft.active};
   const res=await fetch(draft.id?"/api/admin/products/"+draft.id:"/api/admin/products",{method:draft.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({})); if(!res.ok)throw new Error(data.error||"Could not save.");
   setRows(draft.id?rows.map(x=>x.id===draft.id?data.product:x):[data.product,...rows]); setDraft({id:"",...blank});setEditing(false);setNotice("Catalog item saved. The public page is now using the database record.");
  }catch(e){setNotice(e instanceof Error?e.message:"Could not save catalog item.");}finally{setBusy(false);}
 };
 const toggle=async(row:ProductRow)=>{setBusy(true);setNotice("");
  const res=await fetch("/api/admin/products/"+row.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!row.active,name:row.name,kind:row.kind,relationshipType:row.relationshipType,shortDescription:row.shortDescription,description:row.description,tagline:row.tagline,features:row.features,benefits:row.benefits,idealFor:row.idealFor,deliverables:row.deliverables,imageUrl:row.imageUrl,galleryUrls:row.galleryUrls,startingPrice:row.startingPrice,ctaLabel:row.ctaLabel,ctaNote:row.ctaNote,sortOrder:row.sortOrder,featured:row.featured})});
  const data=await res.json().catch(()=>({}));if(res.ok)setRows(rows.map(x=>x.id===row.id?data.product:x));else setNotice(data.error||"Could not update visibility.");setBusy(false);
 };
 const field=(label:string,key:keyof ProductRow,placeholder?:string)=><label className="grid gap-1 text-sm font-bold text-slate-700">{label}<input value={String(draft[key]??"")} onChange={e=>set(key,e.target.value)} placeholder={placeholder} className="rounded-xl border border-slate-200 px-4 py-3 font-normal"/></label>;
 return <div className="space-y-6">
  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
   <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">Catalog manager</div><h2 className="mt-2 text-2xl font-black">Products & services</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Create a product or service once. The public catalog, detail page and attributed contact CTA use the same record.</p></div><button type="button" onClick={startCreate} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">+ Add product / service</button></div>
   {editing&&<form onSubmit={save} className="mt-6 rounded-3xl border border-[#0F3E8A]/10 bg-[#F8FAFC] p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">{draft.id?"Edit catalog item":"New catalog item"}</div><p className="mt-1 text-sm text-slate-500">Name and short description are required. The public URL slug is generated automatically from the name; add as much detail as customers need.</p></div><button type="button" onClick={()=>setEditing(false)} className="text-sm font-bold text-slate-400">Cancel</button></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {field("Name","name","e.g. Growth CRM")}
      <label className="grid gap-1 text-sm font-bold text-slate-700">Public URL slug<span className="text-[11px] font-normal text-slate-400">{draft.id?"Stable after publication":"Generated automatically from the name"}</span><input value={draft.slug} onChange={e=>set("slug",e.target.value)} disabled={!!draft.id} placeholder="Auto-generated from name" className="rounded-xl border border-slate-200 px-4 py-3 font-normal disabled:bg-slate-100 disabled:text-slate-400"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">Type<select value={draft.kind} onChange={e=>set("kind",e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="SERVICE">Service</option><option value="PRODUCT">Product</option></select></label>
      {field("Provider / brand","providerName","Aslal Digital Solutions")}
      <label className="grid gap-1 text-sm font-bold text-slate-700">Relationship<select value={draft.relationshipType} onChange={e=>set("relationshipType",e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-normal"><option>OWNED</option><option>AFFILIATE</option><option>RESELLER</option><option>IMPLEMENTATION_PARTNER</option><option>CUSTOM</option></select></label>
      {field("Tagline","tagline","Short positioning line")}
      {field("Short description","shortDescription","What it does, in one or two sentences")}
      {field("Starting price","startingPrice","From ETB … / Request quote")}
      {field("Image URL","imageUrl","https://… (optional)")}
      {field("Sort order","sortOrder","0")}
      <label className="grid gap-1 text-sm font-bold text-slate-700 lg:col-span-3">Long description<textarea value={draft.description||""} onChange={e=>set("description",e.target.value)} rows={5} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">Features<textarea value={draft.features||""} onChange={e=>set("features",e.target.value)} placeholder="One feature per line" rows={6} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">Benefits<textarea value={draft.benefits||""} onChange={e=>set("benefits",e.target.value)} placeholder="One benefit per line" rows={6} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">Ideal for<textarea value={draft.idealFor||""} onChange={e=>set("idealFor",e.target.value)} placeholder="One audience/use case per line" rows={6} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">Deliverables<textarea value={draft.deliverables||""} onChange={e=>set("deliverables",e.target.value)} placeholder="One deliverable per line" rows={6} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700 lg:col-span-2">Additional gallery image URLs<textarea value={draft.galleryUrls||""} onChange={e=>set("galleryUrls",e.target.value)} placeholder="One URL per line" rows={6} className="rounded-xl border border-slate-200 p-4 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700 lg:col-span-2">CTA label<input value={draft.ctaLabel||""} onChange={e=>set("ctaLabel",e.target.value)} placeholder="Request this" className="rounded-xl border border-slate-200 px-4 py-3 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700">CTA helper text<input value={draft.ctaNote||""} onChange={e=>set("ctaNote",e.target.value)} placeholder="What happens after clicking" className="rounded-xl border border-slate-200 px-4 py-3 font-normal"/></label>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-bold text-slate-700"><label><input type="checkbox" checked={draft.featured} onChange={e=>set("featured",e.target.checked)} className="mr-2"/>Featured on catalog</label><label><input type="checkbox" checked={draft.active} onChange={e=>set("active",e.target.checked)} className="mr-2"/>Publicly visible</label></div>
    {notice&&<div className="mt-4 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">{notice}</div>}
    <button disabled={busy} className="mt-5 rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B]">{busy?"Saving…":draft.id?"Save changes":"Publish catalog item"}</button>
   </form>}
   {notice&&!editing&&<div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</div>}
  </section>
  <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
   <div className="overflow-x-auto">
    <table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#0F3E8A] text-white"><tr>{["Item","Type","Provider / relationship","Status","Price","Order","Public","Actions"].map(h=><th key={h} className="px-4 py-4 text-xs font-black uppercase tracking-wider">{h}</th>)}</tr></thead>
    <tbody>{rows.map(row=><tr key={row.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
      <td className="px-4 py-4"><div className="font-black text-slate-900">{row.name}</div><div className="mt-1 max-w-[260px] text-xs text-slate-500">{row.shortDescription}</div><div className="mt-1 font-mono text-[10px] text-slate-400">/{row.slug}</div></td>
      <td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-[#0F3E8A]">{row.kind}</span></td>
      <td className="px-4 py-4"><div className="font-semibold">{row.providerName||"—"}</div><div className="text-xs text-slate-400">{row.relationshipType}</div></td>
      <td className="px-4 py-4"><span className={row.active?"rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700":"rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500"}>{row.active?"LIVE":"HIDDEN"}</span>{row.featured&&<div className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#E2B02A]">Featured</div>}</td>
      <td className="px-4 py-4 font-semibold">{row.startingPrice||"Quote"}</td>
      <td className="px-4 py-4">{row.sortOrder}</td>
      <td className="px-4 py-4"><Link href={"/products/"+row.slug} target="_blank" className="font-bold text-[#0F3E8A] underline">Open ↗</Link></td>
      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>startEdit(row)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">Edit</button><button type="button" disabled={busy} onClick={()=>toggle(row)} className="rounded-lg bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white">{row.active?"Hide":"Publish"}</button></div></td>
    </tr>)}</tbody></table>
   </div>
   {!rows.length&&<div className="p-12 text-center text-slate-500">No catalog items yet.</div>}
  </section>
 </div>;
}
