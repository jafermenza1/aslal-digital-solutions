"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { publicCommerceIntents } from "@/lib/public-commerce-contract";
import { HomeDemandConstellation, HomeSignalStrip } from "@/components/HomeDemandConstellation";

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

type HeroContent=Record<string,{value:string;fontFamily:string;fontSize:number}>;
function AnimatedHeroText({content}:{content:HeroContent}){
  const [index,setIndex]=useState(0);
  const editableSlides=[content["home.hero.slide1.title"]?.value,content["home.hero.slide2.title"]?.value,content["home.hero.slide3.title"]?.value].filter(Boolean) as string[];
  useEffect(()=>{const t=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>window.clearInterval(t);},[]);
  const activeSlides=editableSlides.length===3?editableSlides:slides.map(x=>x.title);
  const subtitle=content["home.hero.subtitle"]?.value||"Aslal your Growth Partner";
  return <div className="min-h-[235px] max-w-2xl"><AnimatePresence mode="wait"><motion.div key={index} initial={{opacity:0,y:20,filter:"blur(8px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} exit={{opacity:0,y:-20,filter:"blur(8px)"}} transition={{duration:.7,ease:"easeOut"}} className="space-y-3"><h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-4xl md:text-5xl">{activeSlides[index].replace(/\s+/g," ").trim()}</h1><p className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-[#E2B02A]"><span className="inline-block h-[2px] w-3 bg-[#E2B02A]"/>{subtitle}</p></motion.div></AnimatePresence></div>;
}



function ProvenOutcomeDashboard(){
  const [active,setActive]=useState(0),[hovered,setHovered]=useState(false);
  useEffect(()=>{if(hovered)return;const t=window.setInterval(()=>setActive(i=>(i+1)%steps.length),1800);return()=>window.clearInterval(t);},[hovered]);
  const activate=(i:number)=>{setHovered(true);setActive(i);playHapticAudio();};
  return <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#0F3E8A]/60 p-5 shadow-2xl backdrop-blur-md sm:p-6">
    <div className="mb-6 grid grid-cols-2 gap-3">{steps.map((step,i)=>{const on=i===active;return <motion.div key={step.id} onMouseEnter={()=>activate(i)} onMouseLeave={()=>setHovered(false)} animate={{scale:on?1.04:1,borderColor:on?"#E2B02A":"rgba(30,41,59,.5)",boxShadow:on?"0 0 20px rgba(226,176,42,.25)":"none"}} transition={{duration:.2}} className={"relative cursor-pointer overflow-hidden rounded-xl border p-4 "+(on?"bg-[#1E293B]/90":"bg-[#1E293B]/40")}>{on&&<span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-[#E2B02A]"/>}<span className={"mb-1 block font-mono text-xs "+(on?"text-[#E2B02A]":"text-slate-400")}>{step.id}</span><span className={"text-base font-bold "+(on?"text-white":"text-slate-300")}>{step.title}</span></motion.div>;})}</div>
    <div className="rounded-xl border border-slate-700/80 bg-[#0F3E8A] p-4"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] tracking-widest text-slate-400">OUTCOME ARCHITECTURE</span><span className="rounded border border-[#E2B02A]/30 bg-[#E2B02A]/10 px-2 py-0.5 text-xs font-bold text-[#E2B02A]">ROI</span></div><p className="text-sm font-semibold tracking-wide text-white">Attention <span className="text-[#E2B02A]">→</span> Action <span className="text-[#E2B02A]">→</span> Growth</p><div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><motion.div className="h-full bg-gradient-to-r from-[#0F3E8A] via-[#E2B02A] to-[#F8FAFC]" animate={{width:((active+1)/steps.length)*100+"%"}} transition={{duration:.3}}/></div></div>
  </div>;
}

export function ProvenMarketingHero({content,telegramUrl,whatsappUrl}:{content:HeroContent;telegramUrl:string;whatsappUrl:string}){
  const title=content["home.hero.publicTitle"]?.value||"Grow your business.";
  const body=content["home.hero.publicBody"]?.value||"We help Ethiopian businesses attract customers, manage conversations, sell and measure results.";
  return <section className="public-home-hero relative isolate flex min-h-[680px] w-full items-center overflow-hidden px-5 py-20 sm:px-8 lg:min-h-[760px]">
    <APlexusCanvas/>
    <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_70%_50%,rgba(226,176,42,.10),transparent_28%),linear-gradient(90deg,rgba(7,12,24,.98)_0%,rgba(15,62,138,.88)_58%,rgba(15,62,138,.60)_100%)]"/>
    <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/35 bg-[#1E293B]/70 px-3 py-1.5 text-[10px] font-mono font-black tracking-[.12em] text-[#E2B02A] backdrop-blur-md sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-[#E2B02A] shadow-[0_0_14px_#E2B02A]"/> ASLAL DIGITAL SOLUTIONS · ETHIOPIA
        </div>
        <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] text-[#F8FAFC] sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-[#E2B02A] sm:text-2xl">Connect marketing, sales and digital commerce.</p>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/contact?goal=Tell%20us%20what%20you%20need" className="inline-flex items-center justify-center rounded-2xl bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B] shadow-[0_12px_45px_rgba(226,176,42,.18)] transition hover:-translate-y-0.5">Tell us what you need <ArrowRight className="ml-2" size={17}/></Link>
          <Link href="/marketplace" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[.07] px-7 py-4 font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#E2B02A]/60">Browse solutions <ArrowRight className="ml-2" size={17}/></Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-white/55">
          <span>Prefer chat?</span>
          <a href={telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white transition hover:text-[#E2B02A]"><Send size={15}/> Telegram</a>
          <span className="text-white/20">·</span>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white transition hover:text-[#E2B02A]"><MessageCircle size={15}/> WhatsApp</a>
        </div>
      </div>
      <div className="relative mx-auto flex min-h-[330px] w-full max-w-[520px] items-center justify-center">
        <div className="public-home-orbit absolute h-[300px] w-[300px] rounded-full border border-white/10 sm:h-[390px] sm:w-[390px]"/>
        <div className="public-home-orbit public-home-orbit-delay absolute h-[210px] w-[210px] rounded-full border border-[#E2B02A]/20 sm:h-[280px] sm:w-[280px]"/>
        <div className="relative grid h-36 w-36 place-items-center rounded-full border border-[#E2B02A]/45 bg-[#0F172A]/90 shadow-[0_0_90px_rgba(226,176,42,.16)] backdrop-blur-xl sm:h-44 sm:w-44">
          <div className="text-center"><div className="mx-auto h-3 w-3 rounded-full bg-[#E2B02A] shadow-[0_0_24px_#E2B02A]"/><div className="mt-4 text-sm font-black tracking-[.18em] text-white">ASLAL</div><div className="mt-1 text-[9px] font-mono font-bold tracking-[.2em] text-[#E2B02A]">CONNECT · GROW</div></div>
        </div>
        {[
          ["Customers","top-[8%] left-[8%]"],
          ["Conversations","right-[2%] top-[43%]"],
          ["Commerce","bottom-[7%] left-[12%]"]
        ].map(([label,pos])=><div key={label} className={`absolute ${pos} rounded-full border border-white/10 bg-[#1E293B]/85 px-4 py-2 text-[10px] font-black text-white/80 shadow-xl backdrop-blur-md sm:text-xs`}><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#E2B02A]"/>{label}</div>)}
      </div>
    </div>
  </section>;
}
function OutcomeDashboard(){
  return <HomeDemandConstellation />;
}

export function AslalInteractiveHero({content}:{content:HeroContent}){
  const [intentOpen,setIntentOpen]=useState(false);
  const intentDetails: Record<string, { label: string; hint: string; next: string }> = {
    growth: { label: "Get more customers", hint: "Marketing, SEO, campaigns & lead generation", next: "Open Growth Builder" },
    sell: { label: "Sell online", hint: "Products, orders, payments & customer follow-up", next: "Browse solutions" },
    automate: { label: "Automate conversations", hint: "Telegram, WhatsApp & human handoff", next: "Design the workflow" },
    system: { label: "Build a digital system", hint: "Website, CRM, automation & connected workflows", next: "Design the system" },
  };
  const intents = publicCommerceIntents.map((intent) => ({
    ...intent,
    href: intent.key === "growth"
      ? "/growth-builder?goal=Get%20more%20customers"
      : intent.key === "sell"
        ? "/products"
        : `${intent.href}?goal=${intent.key === "automate" ? "Automate%20conversations" : "Build%20a%20digital%20system"}`,
    ...intentDetails[intent.key],
  }));  return <section className="aslal-hero relative isolate flex min-h-[760px] w-full items-center justify-center overflow-hidden px-5 py-20 sm:px-6 lg:min-h-screen">
    <APlexusCanvas/><div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_25%_45%,rgba(15,62,138,.14),transparent_42%),linear-gradient(90deg,rgba(30,41,59,.96)_0%,rgba(30,41,59,.88)_48%,rgba(30,41,59,.58)_100%)]"/>
    <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
      <div className="space-y-7 lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/40 bg-[#1E293B]/80 px-3 py-1.5 text-[10px] font-mono font-bold text-[#E2B02A] sm:text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-[#E2B02A]"/>LOCAL IMPLEMENTATION · CONNECTED COMMERCE · HUMAN SUPPORT</div>
        <AnimatedHeroText content={content}/>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#1E293B]/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#E2B02A]">Start with your goal</p><p className="mt-1 text-sm text-white/65">You do not need to know which service you need.</p></div><span className="hidden text-xs text-white/40 sm:block">1 minute</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {intents.map(intent=><Link key={intent.label} href={intent.href} className="group rounded-2xl border border-white/10 bg-white/[.04] p-4 transition hover:border-[#E2B02A]/70 hover:bg-white/[.08]"><div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{intent.label}</span><span className="text-[#E2B02A] transition group-hover:translate-x-1">→</span></div><p className="mt-1 text-xs leading-5 text-white/50">{intent.hint}</p></Link>)}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"><Link href="/contact" className="text-xs font-bold text-white/60 hover:text-[#E2B02A]">I’m not sure — tell Aslal what I need →</Link><Link href="/telegram" className="text-xs font-bold text-sky-200/80 hover:text-white">I want to talk to a person →</Link></div>
        </div>
        <div className="flex flex-wrap gap-3"><Link href="/products" className="rounded-xl border border-slate-700 bg-[#1E293B]/60 px-6 py-3.5 text-sm font-semibold text-[#F8FAFC] backdrop-blur-sm transition hover:border-[#E2B02A] hover:text-[#E2B02A]">Explore Solutions</Link><Link href="/telegram" className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-6 py-3.5 text-sm font-semibold text-sky-100 backdrop-blur-sm transition hover:border-sky-300">Chat on Telegram</Link></div>
      </div>
      <div className="relative flex justify-center lg:col-span-5 lg:justify-end"><div className="aslal-hero-orbit absolute inset-0 -z-10" /><OutcomeDashboard/></div>
    </div>
  <HomeSignalStrip /></section>;
}
