import { NextResponse } from "next/server";
import { getSocialProfiles } from "@/lib/social-profiles";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{return NextResponse.json({profiles:await getSocialProfiles(new URL(request.url).hostname)},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});}catch{return NextResponse.json({profiles:[]});}}