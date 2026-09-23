import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeEqual, signSession } from "@/lib/security";
import { hashPassword, verifyPassword } from "@/lib/users";

const attempts = new Map<string, { count:number; resetAt:number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
function isRateLimited(key:string) {
  const current=attempts.get(key);
  if(!current||current.resetAt<=Date.now()){ attempts.delete(key); return false; }
  return current.count>=MAX_ATTEMPTS;
}
function recordFailedAttempt(key:string) {
  const now=Date.now(); const current=attempts.get(key);
  if(!current||current.resetAt<=now) attempts.set(key,{count:1,resetAt:now+WINDOW_MS});
  else current.count+=1;
}
function clearAttempts(key:string){ attempts.delete(key); }

export async function POST(request:NextRequest) {
  const key=getClientKey(request);
  if(isRateLimited(key)) return NextResponse.json({error:"Too many login attempts. Please try again later."},{status:429});

  try {
    const body=await request.json();
    const email=String(body.email||"").trim().toLowerCase().slice(0,190);
    const password=String(body.password||"");
    const configuredEmail=String(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
    const configuredPassword=String(process.env.ADMIN_PASSWORD||"");

    if(!email||!password) return NextResponse.json({error:"Email and password are required."},{status:400});

    let valid=false;
    try {
      const user=await prisma.user.findUnique({where:{email}});
      if(user) {
        valid=user.active&&verifyPassword(password,user.passwordHash);
        if(valid) await prisma.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}});
      } else if(configuredEmail && configuredPassword && safeEqual(email,configuredEmail) && safeEqual(password,configuredPassword)) {
        const user=await prisma.user.create({
          data:{id:crypto.randomUUID(),email,name:"Aslal Administrator",passwordHash:hashPassword(password),role:"SUPER_ADMIN",active:true,permissions:{grant:[],revoke:[]}},
        });
        await prisma.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}});
        valid=true;
      }
    } catch(error) {
      // Preserve the existing environment-admin login path during a schema rollout or local setup.
      if(configuredEmail && configuredPassword) valid=safeEqual(email,configuredEmail)&&safeEqual(password,configuredPassword);
    }

    if(!valid) {
      recordFailedAttempt(key);
      return NextResponse.json({error:"Invalid credentials."},{status:401});
    }

    clearAttempts(key);
    const response=NextResponse.json({ok:true});
    response.cookies.set("aslal_session",signSession(email),{
      httpOnly:true,
      sameSite:"lax",
      secure:process.env.NODE_ENV==="production",
      maxAge:60*60*12,
      path:"/",
    });
    return response;
  } catch {
    return NextResponse.json({error:"Invalid request."},{status:400});
  }
}
