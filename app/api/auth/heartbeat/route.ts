import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {signSession,verifySession,SESSION_IDLE_MS} from "@/lib/security";
export const dynamic="force-dynamic";
export async function POST(){const store=await cookies();const current=verifySession(store.get("aslal_session")?.value);if(!current)return NextResponse.json({ok:false,error:"Session expired."},{status:401});const response=NextResponse.json({ok:true});response.cookies.set("aslal_session",signSession(current.email),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:SESSION_IDLE_MS/1000,path:"/"});return response;}
