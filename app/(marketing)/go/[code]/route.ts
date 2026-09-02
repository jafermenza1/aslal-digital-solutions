import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, setReferralCode } from "@/lib/tracking";
import { createHmac } from "node:crypto";

function hashIp(value: string) {
  const secret = process.env.SESSION_SECRET || "development-only-change-me";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [rows] = await db.execute<any[]>("SELECT * FROM referral_links WHERE code = ? LIMIT 1", [code]);
  const link = rows[0];
  if (!link) return NextResponse.redirect(new URL("/", request.url));

  const visitorId = await getOrCreateVisitor();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = forwarded ? hashIp(forwarded) : null;
  await db.execute(
    "INSERT INTO referral_clicks (referral_link_id, visitor_id, ip_hash, user_agent) VALUES (?, ?, ?, ?)",
    [link.id, visitorId, ipHash, request.headers.get("user-agent")?.slice(0, 500) || null]
  );
  await setReferralCode(code);

  const destination = String(link.destination_path || "/").startsWith("/") ? link.destination_path : "/";
  const url = new URL(destination, request.url);
  url.searchParams.set("utm_source", "partner");
  url.searchParams.set("utm_campaign", link.campaign || code);
  return NextResponse.redirect(url);
}
