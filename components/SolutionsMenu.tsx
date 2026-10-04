"use client";
import Link from "next/link";
import { ChevronDown, Package, Store, Wrench } from "lucide-react";
import { useState } from "react";

export function SolutionsMenu(){
 const [open,setOpen]=useState(false);
 return <div className="solutions-menu" onMouseLeave={()=>setOpen(false)}>
  <button type="button" className="solutions-menu-trigger" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
   Solutions <ChevronDown size={14} aria-hidden="true" className={open?"rotate-180 transition":"transition"}/>
  </button>
  {open&&<div className="solutions-menu-panel">
   <Link href="/marketplace" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Store size={18}/></span><span><b>Marketplace</b><small>Discover live offers, products and commercial listings</small></span></Link>
   <Link href="/products" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Package size={18}/></span><span><b>Products</b><small>Products, packages & services in one commerce catalog</small></span></Link>
   <Link href="/services" onClick={()=>setOpen(false)}><span className="solutions-menu-icon"><Wrench size={18}/></span><span><b>Services</b><small>Open the same unified catalog at the services view</small></span></Link>
  </div>}
 </div>;
}