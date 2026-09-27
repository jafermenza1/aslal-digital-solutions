"use client";
import {useEffect,useState} from "react";
import {Moon,Sun,ShoppingBag} from "lucide-react";

export function TelegramMiniAppShell({children}:{children:React.ReactNode}){
 const [dark,setDark]=useState(false);
 useEffect(()=>{
  const stored=localStorage.getItem("aslal_telegram_theme");
  const system=window.matchMedia("(prefers-color-scheme: dark)").matches;
  setDark(stored?stored==="dark":system);
 },[]);
 useEffect(()=>{document.documentElement.dataset.telegramTheme=dark?"dark":"light";document.body.style.background=dark?"#071F47":"#F8FAFC";return()=>{document.body.style.background=""}},[dark]);
 function toggle(){const next=!dark;setDark(next);localStorage.setItem("aslal_telegram_theme",next?"dark":"light");}
 return <div className={(dark?"dark ":"")+(dark?"min-h-screen bg-[#071F47] text-[#F8FAFC]":"min-h-screen bg-[#F8FAFC] text-[#1E293B]")}>
   <div className="mx-auto min-h-screen w-full max-w-[760px]">
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-inherit px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2"><img src="/favicon.svg" alt="Aslal" className="h-8 w-8"/><span className="text-sm font-black tracking-tight">ASLAL</span></div>
      <button type="button" onClick={toggle} aria-label={dark?"Use day mode":"Use dark mode"} className={dark?"grid h-10 w-10 place-items-center rounded-full bg-white/10":"grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
    </div>
    <div className="p-3 sm:p-5">{children}</div>
   </div>
 </div>;
}
