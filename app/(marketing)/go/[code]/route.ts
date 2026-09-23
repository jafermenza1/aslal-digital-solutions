import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, setReferralCode } from "@/lib/tracking";
import { siteConfig } from "@/lib/config";
import { createHmac } from "node:crypto";

function hashIp(value: string) {
  const secret = process.env.SESSION_SECRET || "development-only-change-me";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [rows] = await db.execute<any[]>("SELECT * FROM referral_links WHERE code = ? LIMIT 1", [code]);
  const link = rows[0];

  if (!link) return NextResponse.redirect(new URL("/contact?goal=Partner%20referral", siteConfig.url));

  const visitorId = await getOrCreateVisitor();
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = forwarded ? hashIp(forwarded) : null;

  await db.execute(
    "INSERT INTO referral_clicks (referral_link_id, visitor_id, ip_hash, user_agent) VALUES (?, ?, ?, ?)",
    [link.id, visitorId, ipHash, headerStore.get("user-agent")?.slice(0, 500) || null],
  );

  await setReferralCode(code);

  const destination = String(link.destination_path || "/contact");
  const safeDestination = destination.startsWith("/") && !destination.startsWith("//") ? destination : "/contact";
  const url = new URL(safeDestination, siteConfig.url);
  url.searchParams.set("utm_source", "partner");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", link.campaign || code);

  if (link.product_slug && !url.searchParams.has("product")) {
    url.searchParams.set("product", link.product_slug);
  }
  if (link.code) {
    url.searchParams.set("referral", link.code);
  }

  return NextResponse.redirect(url.toString());
}
