"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const slides = [
  { title: "We implement, customize and connect digital systems for your Business.", subtitle: "Aslal your Growth Partner" },
  { title: "We are helping businesses turn attention into Revenue.", subtitle: "Aslal your Growth Partner" },
  { title: "Aslal capture demand and streamline your Sales.", subtitle: "Aslal your Growth Partner" },
];
const steps = [
  { id: "01", title: "Attract" }, { id: "02", title: "Capture" }, { id: "03", title: "Qualify" },
  { id: "04", title: "Automate" }, { id: "05", title: "Convert" }, { id: "06", title: "Retain" },
];

function APlexusCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf=0,width=0,height=0;
    let reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes=[{x:.80,y:.25},{x:.73,y:.65},{x:.87,y:.65},{x:.76,y:.45},{x:.84,y:.45},{x:.80,y:.15}];
    const packets=[{from:1,to:0,t:0,s:.008},{from:0,to:2,t:.3,s:.006},{from:3,to:4,t:.6,s:.01},{from:0,to:5,t:.1,s:.005}];
    const resize=()=>{const d=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);};
    const draw=(time:number)=>{
      ctx.clearRect(0,0,width,height);
      for(const [i,j] of [[1,0],[0,2],[3,4],[0,5]]){const a=nodes[i],b=nodes[j];ctx.beginPath();ctx.moveTo(a.x*width,a.y*height);ctx.lineTo(b.x*width,b.y*height);ctx.strokeStyle="rgba(248,250,252,.14)";ctx.lineWidth=1.5;ctx.stroke();}
      packets.forEach(p=>{if(!reduceMotion)p.t=(p.t+p.s)%1;const a=nodes[p.from],b=nodes[p.to],x=(a.x+(b.x-a.x)*p.t)*width,y=(a.y+(b.y-a.y)*p.t)*height;ctx.fillStyle="#E2B02A";ctx.shadowColor="#E2B02A";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
      nodes.forEach((n,i)=>{const x=n.x*width,y=n.y*height,p=reduceMotion?6:Math.sin(time*.004+i)*4+6;ctx.strokeStyle="rgba(226,176,42,.4)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,p+6,0,Math.PI*2);ctx.stroke();ctx.fillStyle=i===0||i===5?"#E2B02A":"#F8FAFC";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
      raf=requestAnimationFrame(draw);
    };
    resize();window.addEventListener("resize",resize);const media=window.matchMedia("(prefers-reduced-motion: reduce)");const change=(e:MediaQueryListEvent)=>{reduceMotion=e.matches;};media.addEventListener("change",change);raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);media.removeEventListener("change",change);};
  },[]);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full bg-[#0F3E8A]" />;
}

function playHapticAudio(){
  try{const C=window.AudioContext;if(!C)return;const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.setValueAtTime(800,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+.04);gain.gain.setValueAtTime(.08,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.04);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.04);osc.onended=()=>{void ctx.close();};}catch{}
}

function AnimatedHeroText(){
  const [index,setIndex]=useState(0);
  useEffect(()=>{const t=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>window.clearInterval(t);},[]);
  return <div className="min-h-[235px] max-w-2xl"><AnimatePresence mode="wait"><motion.div key={index} initial={{opacity:0,y:20,filter:"blur(8px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} exit={{opacity:0,y:-20,filter:"blur(8px)"}} transition={{duration:.7,ease:"easeOut"}} className="space-y-3"><h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-4xl md:text-5xl">{slides[index].title}</h1><p className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-[#E2B02A]"><span className="inline-block h-[2px] w-3 bg-[#E2B02A]"/>{slides[index].subtitle}</p></motion.div></AnimatePresence></div>;
}

function OutcomeDashboard(){
  const [active,setActive]=useState(0),[hovered,setHovered]=useState(false);
  useEffect(()=>{if(hovered)return;const t=window.setInterval(()=>setActive(i=>(i+1)%steps.length),1800);return()=>window.clearInterval(t);},[hovered]);
  const activate=(i:number)=>{setHovered(true);setActive(i);playHapticAudio();};
  return <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#0F3E8A]/60 p-5 shadow-2xl backdrop-blur-md sm:p-6">
    <div className="mb-6 grid grid-cols-2 gap-3">{steps.map((step,i)=>{const on=i===active;return <motion.div key={step.id} onMouseEnter={()=>activate(i)} onMouseLeave={()=>setHovered(false)} animate={{scale:on?1.04:1,borderColor:on?"#E2B02A":"rgba(51,65,85,.5)",boxShadow:on?"0 0 20px rgba(226,176,42,.25)":"none"}} transition={{duration:.2}} className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 ${on?"bg-[#1E293B]/90":"bg-[#1E293B]/40"}`}>{on&&<span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-[#E2B02A]"/>}<span className={`mb-1 block font-mono text-xs ${on?"text-[#E2B02A]":"text-slate-400"}`}>{step.id}</span><span className={`text-base font-bold ${on?"text-white":"text-slate-300"}`}>{step.title}</span></motion.div>;})}</div>
    <div className="rounded-xl border border-slate-700/80 bg-[#0A2B61] p-4"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] tracking-widest text-slate-400">OUTCOME ARCHITECTURE</span><span className="rounded border border-[#E2B02A]/30 bg-[#E2B02A]/10 px-2 py-0.5 text-xs font-bold text-[#E2B02A]">ROI</span></div><p className="text-sm font-semibold tracking-wide text-white">Attention <span className="text-[#E2B02A]">→</span> Action <span className="text-[#E2B02A]">→</span> Growth</p><div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><motion.div className="h-full bg-gradient-to-r from-[#0F3E8A] via-[#E2B02A] to-[#F8FAFC]" animate={{width:`${((active+1)/steps.length)*100}%`}} transition={{duration:.3}}/></div></div>
  </div>;
}

export function AslalInteractiveHero(){
  return <section className="relative isolate flex min-h-[760px] w-full items-center justify-center overflow-hidden px-5 py-20 sm:px-6 lg:min-h-screen">
    <APlexusCanvas/><div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_25%_45%,rgba(15,62,138,.14),transparent_42%),linear-gradient(90deg,rgba(7,31,71,.96)_0%,rgba(7,31,71,.88)_48%,rgba(7,31,71,.58)_100%)]"/>
    <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="space-y-7 lg:col-span-7"><div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/40 bg-[#1E293B]/80 px-3 py-1.5 text-[10px] font-mono font-bold text-[#E2B02A] sm:text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-[#E2B02A]"/>PROVEN PRODUCTS · LOCAL IMPLEMENTATION · CUSTOM FIT</div><AnimatedHeroText/><div className="flex flex-wrap gap-3 pt-1"><Link href="/growth-builder" className="rounded-xl bg-[#E2B02A] px-6 py-3.5 text-sm font-bold text-[#1E293B] shadow-lg transition hover:bg-[#ebd05d] hover:shadow-[#E2B02A]/30 sm:px-7">Build My Growth System →</Link><Link href="/products" className="rounded-xl border border-slate-700 bg-[#1E293B]/60 px-6 py-3.5 text-sm font-semibold text-[#F8FAFC] backdrop-blur-sm transition hover:border-[#E2B02A] hover:text-[#E2B02A] sm:px-7">Explore Solutions</Link></div></div>
      <div className="flex justify-center lg:col-span-5 lg:justify-end"><OutcomeDashboard/></div>
    </div>
  </section>;
}
