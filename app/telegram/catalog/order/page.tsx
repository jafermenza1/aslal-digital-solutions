"use client";

import {FormEvent,useState} from "react";

export default function TelegramCatalogOrder(){
 const q=typeof window!=="undefined"?new URLSearchParams(window.location.search):new URLSearchParams();
 const workspaceId=q.get("workspaceId")||""; const slug=q.get("slug")||""; const campaignId=q.get("campaignId")||"";
 const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [loading,setLoading]=useState(false); const [result,setResult]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setResult("");try{
   const tg=(window as any).Telegram?.WebApp; const chatId=tg?.initDataUnsafe?.user?.id?String(tg.initDataUnsafe.user.id):"";
   const r=await fetch("/api/telegram/catalog/order",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspaceId,slug,campaignId,name,phone,chatId})});
   const d=await r.json(); if(!r.ok)throw new Error(d.error||"Unable to start order.");
   setResult("Order "+d.orderNumber+" created. Payment is pending confirmation. "+(d.paymentMessage||"Our team will provide the available payment option."));
 }catch(e){setResult(e instanceof Error?e.message:"Unable to start order.");}finally{setLoading(false);}}
 return <main className="min-h-screen bg-[#f7faf8] p-5"><div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-wider text-[#0a5a44]">ASLAL CHECKOUT</div><h1 className="mt-2 text-2xl font-black">Start your order</h1><p className="mt-2 text-sm text-slate-500">We create the order in the same Aslal workspace and keep payment in the controlled pending state until verified.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-bold">Name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border px-3"/></label><label className="block text-sm font-bold">Phone<input required value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border px-3"/></label><button disabled={loading} className="min-h-12 w-full rounded-xl bg-[#0a5a44] px-4 py-3 font-black text-white disabled:opacity-50">{loading?"Creating…":"Create order & continue to payment"}</button></form>{result&&<div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6">{result}</div>}</div></main>;
}
