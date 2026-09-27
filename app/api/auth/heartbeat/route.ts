import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {signSession,verifySession,SESSION_IDLE_MS} from "@/lib/security";
export const dynamic="force-dynamic";

export async function POST(request: Request){
  const store=await cookies();
  const mobileClient=request.headers.get("x-aslal-client")==="mobile";
  const suppliedCookie=store.get("aslal_session")?.value;
  const current=verifySession(suppliedCookie);
  if(!current)return NextResponse.json({ok:false,error:"Session expired."},{status:401});

  const sessionToken=signSession(current.email);
  const response=NextResponse.json(mobileClient?{ok:true,sessionToken}:{ok:true});
  response.cookies.set("aslal_session",sessionToken,{
    httpOnly:true,
    sameSite:"lax",
    secure:process.env.NODE_ENV==="production",
    maxAge:SESSION_IDLE_MS/1000,
    path:"/"
  });
  return response;
}
