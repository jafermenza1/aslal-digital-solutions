"use client";

import { useState } from "react";

export function UnifiedListingActions({id,status}:{id:string;status:string}){
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const review=async(next:"PUBLISHED"|"REJECTED")=>{
    if(!window.confirm(next==="PUBLISHED"?"Approve and publish this listing?":"Reject this listing and keep it out of the public marketplace?"))return;
    setBusy(true); setNotice("");
    try{
      const res=await fetch("/api/admin/commercial-listings/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next,publicVisible:next==="PUBLISHED",featured:false})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||"Could not update listing.");
      setNotice(next==="PUBLISHED"?"Approved and published.":"Rejected and kept private.");
      window.location.reload();
    }catch(e){setNotice(e instanceof Error?e.message:"Could not update listing.");}
    finally{setBusy(false);}
  };
  if(status!=="PENDING_REVIEW")return null;
  return <div className="mt-5 rounded-2xl border border-[#E2B02A]/30 bg-[#E2B02A]/10 p-4">
    <div className="text-sm font-black">Review decision</div>
    <p className="mt-1 text-xs text-slate-500">This action uses the existing listing review API; publication and permission rules are still enforced server-side.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button disabled={busy} onClick={()=>void review("REJECTED")} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700">{busy?"Working…":"Reject"}</button>
      <button disabled={busy} onClick={()=>void review("PUBLISHED")} className="rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-xs font-black text-white">{busy?"Working…":"Approve & publish"}</button>
    </div>
    {notice&&<div className="mt-3 text-xs font-bold text-slate-600">{notice}</div>}
  </div>;
}
