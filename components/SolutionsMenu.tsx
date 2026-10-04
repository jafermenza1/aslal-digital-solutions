"use client";
import Link from "next/link";
import { ChevronDown, Package, Store, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SolutionsMenu(){
 const [open,setOpen]=useState(false);
 const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const rootRef=useRef<HTMLDivElement>(null);
 const cancelClose=()=>{if(closeTimer.current){clearTimeout(closeTimer.current);closeTimer.current=null;}};
 const scheduleClose=()=>{cancelClose();closeTimer.current=setTimeout(()=>setOpen(false),260);};

 useEffect(()=>{
  const onPointerDown=(event:PointerEvent)=>{if(!rootRef.current?.contains(event.target as Node))setOpen(false);};
  const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);(rootRef.current?.querySelector("button") as HTMLButtonElement|null)?.focus();}};
  document.addEventListener("pointerdown",onPointerDown);
  document.addEventListener("keydown",onKeyDown);
  return()=>{document.removeEventListener("pointerdown",onPointerDown);document.removeEventListener("keydown",onKeyDown);cancelClose();};
 },[]);

 return <div ref={rootRef} className="solutions-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
  <button type="button" className="solutions-menu-trigger" aria-expanded={open} aria-haspopup="true" onClick={()=>{cancelClose();setOpen(v=>!v)}} onFocus={()=>setOpen(true)}>
   Solutions <ChevronDown size={14} aria-hidden="true" className={open?"rotate-180 transition":"transition"}/>
  </button>
  {open&&<div className="solutions-menu-panel" role="menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
   <Link role="menuitem" href="/marketplace" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Store size={18} aria-hidden="true"/></span><span><b>Marketplace</b><small>Discover live offers, products and commercial listings</small></span></Link>
   <Link role="menuitem" href="/products" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Package size={18} aria-hidden="true"/></span><span><b>Products</b><small>Products, packages & services in one commerce catalog</small></span></Link>
   <Link role="menuitem" href="/services" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Wrench size={18} aria-hidden="true"/></span><span><b>Services</b><small>Open the same unified catalog at the services view</small></span></Link>
  </div>}
 </div>;
}
