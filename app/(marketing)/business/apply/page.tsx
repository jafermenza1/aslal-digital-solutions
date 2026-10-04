"use client";
import {useState} from "react";
import Link from "next/link";

type Notice={kind:"success"|"error";text:string};

export default function BusinessApplyPage(){
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState<Notice|null>(null);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setBusy(true); setNotice(null);
  const form=e.currentTarget;
  const f=Object.fromEntries(new FormData(form).entries());
  try{
   const r=await fetch("/api/commercial/requests",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({
    workspaceId:"00000000-0000-0000-0000-000000000001",requestType:"RFP",source:"public-business-marketplace-application",
    title:"Business marketplace onboarding — "+String(f.businessName||""),organizationName:String(f.businessName||""),
    contactName:String(f.contactName||""),contactEmail:String(f.email||""),contactPhone:String(f.phone||""),
    category:String(f.applicantType||"BUSINESS"),requestedItem:String(f.businessType||""),
    description:String(f.description||"")+"\n\nRequested access: business owner/staff marketplace self-service.",contactPreference:"EMAIL"
   })});
   const raw=await r.text();
   let d:{requestId?:string;error?:string}={};
   if(raw.trim()){try{d=JSON.parse(raw)}catch{d={error:"The server returned an invalid response. Please try again."}}}
   if(!r.ok)throw new Error(d.error||"Application could not be submitted (HTTP "+r.status+").");
   if(!d.requestId)throw new Error("The application was received without a reference number. Please contact Aslal support before submitting again.");
   setNotice({kind:"success",text:"Application received. Reference: "+d.requestId+". Aslal will review the business and provide workspace access for permitted users."});
   form.reset();
  }catch(err){setNotice({kind:"error",text:err instanceof Error?err.message:"Application could not be submitted. Please try again."})}
  finally{setBusy(false)}
 }
 const field="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm outline-none placeholder:text-slate-400 focus:border-[#E2B02A] focus:ring-2 focus:ring-[#E2B02A]/30";
 return <main className="min-h-screen bg-[#070C18] py-16 text-white"><div className="container-aslal max-w-4xl">
  <Link href="/partner" className="text-sm font-bold text-[#F4C84A] underline-offset-4 hover:underline">← Business partner page</Link>
  <section className="mt-6 rounded-[2rem] border border-slate-700 bg-slate-950 p-7 shadow-2xl sm:p-10">
   <div className="font-mono text-[10px] font-black tracking-[.22em] text-[#F4C84A]">BUSINESS / PROFESSIONAL MARKETPLACE ACCESS</div>
   <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">List what your business or professional practice offers.</h1>
   <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Apply for a workspace where permitted owners and staff can manage products, services, commercial listings and professional provider profiles. Your application enters the existing Lead → Commercial Request workflow.</p>
   <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
    <input required name="businessName" placeholder="Business / professional name" className={field}/><input required name="contactName" placeholder="Your name" className={field}/>
    <input required type="email" name="email" placeholder="Business email" className={field}/><input required name="phone" placeholder="Phone" className={field}/>
    <select name="applicantType" defaultValue="BUSINESS" className={field} aria-label="Applicant type"><option value="BUSINESS" className="bg-slate-900 text-white">Business owner / company</option><option value="PROFESSIONAL" className="bg-slate-900 text-white">Professional / service provider</option></select>
    <input name="businessType" placeholder="Business / profession type" className={field}/>
    <textarea required name="description" rows={6} placeholder="What products/services do you want to publish? Include location, categories and anything we should verify." className={field+" md:col-span-2"}/>
    <button type="submit" disabled={busy} className="rounded-xl bg-[#E2B02A] px-6 py-3 font-black text-[#070C18] shadow-sm transition hover:bg-[#F4C84A] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit">{busy?"Submitting…":"Apply for marketplace access"}</button>
   </form>
   {notice&&<div role={notice.kind==="error"?"alert":"status"} className={"mt-5 rounded-xl border p-4 text-sm font-bold "+(notice.kind==="success"?"border-emerald-400/40 bg-emerald-950 text-emerald-100":"border-red-400/40 bg-red-950 text-red-100")}>{notice.text}</div>}
  </section>
 </div></main>
}
