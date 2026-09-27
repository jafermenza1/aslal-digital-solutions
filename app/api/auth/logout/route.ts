import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"), 303);
  response.cookies.set("aslal_session", "", { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", maxAge:0, expires:new Date(0), path:"/" });
  return response;
}
