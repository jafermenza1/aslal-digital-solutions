"use client";
import {useEffect,useState} from "react";
export default function ContactConfirmPage(){
 const [state,setState]=useState<"loading"|"ok"|"error">("loading"),[message,setMessage]=useState("");
 useEffect(()=>{fetch("/api/contact/confirm"+window.location.search,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Confirmation failed.");setMessage("Your contact details are confirmed. Aslal can continue your request.");setState("ok")}).catch(e=>{setMessage(e instanceof Error?e.message:"Confirmation failed.");setState("error")})},[]);
 return <main className="min-h-[70vh] bg-[#070C18] px-5 py-24 text-[#F8FAFC]"><div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-[#0F172A] p-8 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E2B02A] text-2xl text-[#1E293B]">{state==="loading"?"…":state==="ok"?"✓":"!"}</div><h1 className="mt-6 text-3xl font-black">{state==="ok"?"Contact confirmed":"Contact confirmation"}</h1><p className="mt-4 text-white/60">{state==="loading"?"Checking your secure confirmation link…":message}</p><a href="/contact" className="mt-7 inline-flex rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Return to Aslal</a></div></main>;
}
