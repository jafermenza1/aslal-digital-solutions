"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, CircleDollarSign, MessageCircle, Network, ShoppingBag, Target } from "lucide-react";

const nodes=[
 {label:"DEMAND",Icon:Target},
 {label:"CHAT",Icon:MessageCircle},
 {label:"PARTNER",Icon:Network},
 {label:"COMMERCE",Icon:ShoppingBag},
 {label:"VALUE",Icon:CircleDollarSign},
 {label:"AUTOMATION",Icon:Bot},
];

export function InteractiveOrbit({compact=false}:{compact?:boolean}){
 const [paused,setPaused]=useState(false);
 const audio=useRef<AudioContext|null>(null);
 function cue(){
  try{
   const C=window.AudioContext;if(!C)return;
   const ctx=audio.current||new C();audio.current=ctx;
   if(ctx.state==="suspended")void ctx.resume();
   const o=ctx.createOscillator(),g=ctx.createGain();
   o.type="sine";o.frequency.setValueAtTime(660,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(440,ctx.currentTime+.055);
   g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.055);
   o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.055);
  }catch{}
 }
 useEffect(()=>()=>{if(audio.current)void audio.current.close()},[]);
 const size=compact?"h-[290px] w-[290px] sm:h-[360px] sm:w-[360px]":"h-[330px] w-[330px] sm:h-[430px] sm:w-[430px]";
 return <div className={"relative "+size} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onPointerDown={()=>{setPaused(true);cue()}} role="img" aria-label="Interactive Aslal connected commerce orbit">
  <div className={"absolute inset-[10%] rounded-full border border-[#E2B02A]/25 "+(paused?"":"animate-[orbitSpin_22s_linear_infinite]")}/>
  <div className={"absolute inset-[24%] rounded-full border border-white/10 "+(paused?"":"animate-[orbitSpinReverse_15s_linear_infinite]")}/>
  <div className="absolute inset-0 grid place-items-center">
   <div className="relative grid h-32 w-32 place-items-center rounded-full border border-[#E2B02A]/45 bg-[#0F172A]/90 shadow-[0_0_90px_rgba(226,176,42,.2)] backdrop-blur-xl sm:h-40 sm:w-40">
    <div className="text-center"><span className="mx-auto block h-3 w-3 rounded-full bg-[#E2B02A] shadow-[0_0_24px_#E2B02A]"/><strong className="mt-3 block text-sm tracking-[.18em] text-white">ASLAL</strong><span className="mt-1 block font-mono text-[8px] tracking-[.2em] text-[#E2B02A]">CONNECTED GROWTH</span></div>
   </div>
  </div>
  {nodes.map(({label,Icon},i)=>{
   const angle=(360/nodes.length)*i-90;
   return <button key={label} type="button" onMouseEnter={cue} onFocus={()=>{setPaused(true);cue()}} onClick={()=>{setPaused(true);cue()}} style={{transform:"rotate("+angle+"deg) translateY(-"+(compact?120:145)+"px) rotate("+(-angle)+"deg)"}} className="absolute left-1/2 top-1/2 -ml-12 -mt-6 grid h-12 w-24 place-items-center rounded-2xl border border-white/10 bg-[#1E293B]/90 text-white shadow-xl backdrop-blur-md transition hover:border-[#E2B02A]/70 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#E2B02A]"><span className="flex items-center gap-1.5 text-[9px] font-black"><Icon size={14} className="text-[#E2B02A]"/>{label}</span></button>
  })}
 </div>
}
