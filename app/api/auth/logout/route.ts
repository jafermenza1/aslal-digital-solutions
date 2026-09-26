import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set("aslal_session", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
