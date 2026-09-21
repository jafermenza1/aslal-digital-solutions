"use client";

import Image from "next/image";
import Link from "next/link";

export function BrandLogo({href="/"}:{href?:string}) {
  return <Link href={href} className="brand-logo" aria-label="Aslal Digital Solutions home">
    <span className="brand-logo-orbit" aria-hidden="true"/>
    <span className="brand-logo-mark"><Image src="/brand-logo.svg" alt="" width={44} height={44} priority /></span>
    <span className="brand-logo-copy"><b>ASLAL</b><small>DIGITAL SOLUTIONS</small></span>
  </Link>;
}
