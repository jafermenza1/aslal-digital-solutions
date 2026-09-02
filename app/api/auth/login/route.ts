import { NextRequest, NextResponse } from "next/server";
import { signSession } from "@/lib/security";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (email !== String(process.env.ADMIN_EMAIL || "").toLowerCase() || password !== String(process.env.ADMIN_PASSWORD || "")) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("aslal_session", signSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
  return response;
}
