"use client";
import { useState } from "react";
export function CustomerConversionButton({leadId}:{leadId:string}) {
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [done,setDone]=useState(false);
 async function convert(){
  setBusy(true); setMessage("");
  try{
   const response=await fetch("/api/customers/from-lead",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({leadId})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok) throw new Error(data.error||"Customer conversion failed.");
   setDone(true);
   setMessage(data.created===false?"This lead is already converted. No duplicate customer was created.":"Customer created successfully. The WON value and attribution were preserved.");
  }catch(error){setMessage(error instanceof Error?error.message:"Customer conversion failed.");}
  finally{setBusy(false);}
 }
 return <div className="space-y-3">
  <button type="button" onClick={convert} disabled={busy||done} className="w-full rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B] disabled:opacity-50">{busy?"Converting…":done?"Conversion recorded":"Convert WON lead to customer"}</button>
  {message && <div role="status" aria-live="polite" className={`rounded-xl ${dataClass(message)} p-3 text-xs font-semibold`}>{message}</div>}
 </div>;
}
function dataClass(message:string){return message.startsWith("Customer created")?"bg-emerald-50 text-emerald-800":"bg-blue-50 text-blue-800";}
