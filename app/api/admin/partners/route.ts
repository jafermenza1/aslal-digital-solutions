import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/security";

const PARTNER_TYPES = new Set(["AGENT", "INFLUENCER", "AFFILIATE", "RESELLER"]);
const PARTNER_STATUSES = new Set(["ACTIVE", "PAUSED", "PENDING"]);

async function isAuthorized() {
  return Boolean(verifySession((await cookies()).get("aslal_session")?.value));
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim() || null;
    const type = String(body.type ?? "AGENT").toUpperCase();
    const status = String(body.status ?? "ACTIVE").toUpperCase();
    const code = String(body.code ?? "").trim().toLowerCase();
    const campaign = String(body.campaign ?? "").trim() || null;
    const productSlug = String(body.productSlug ?? "").trim() || null;
    let destinationPath = String(body.destinationPath ?? "/").trim() || "/";

    if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Partner name must be 2–160 characters." }, { status: 400 });
    if (!PARTNER_TYPES.has(type) || !PARTNER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid partner type or status." }, { status: 400 });
    if (email && email.length > 190) return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    const generatedCode = code || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80)}-${crypto.randomUUID().slice(0, 8)}`;
    const finalCode = generatedCode.slice(0, 100);
    if (finalCode && !/^[a-z0-9][a-z0-9_-]{2,99}$/.test(finalCode)) return NextResponse.json({ error: "Referral code must be 3–100 lowercase letters, numbers, hyphens or underscores." }, { status: 400 });
    if (productSlug && destinationPath === "/") destinationPath = `/contact?product=${encodeURIComponent(productSlug)}`;
    if (!destinationPath.startsWith("/") || destinationPath.startsWith("//") || destinationPath.length > 500) return NextResponse.json({ error: "Destination must be an internal path." }, { status: 400 });

    const partnerId = crypto.randomUUID();
    await db.query("INSERT INTO partners (id, name, email, type, status) VALUES (?, ?, ?, ?, ?)", [partnerId, name, email, type, status]);

    if (finalCode) {
      try {
        await db.query("INSERT INTO referral_links (id, partner_id, code, campaign, product_slug, destination_path) VALUES (?, ?, ?, ?, ?, ?)", [crypto.randomUUID(), partnerId, finalCode, campaign, productSlug, destinationPath]);
      } catch (error) {
        await db.query("DELETE FROM partners WHERE id = ?", [partnerId]);
        const message = error instanceof Error && /duplicate|unique/i.test(error.message) ? "That referral code already exists." : "Could not create referral link.";
        return NextResponse.json({ error: message }, { status: 409 });
      }
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}`;
    return NextResponse.json({ ok: true, partnerId, code: finalCode, referralUrl: publicUrl }, { status: 201 });
  } catch (error) {
    console.error("PARTNER_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not create partner." }, { status: 500 });
  }
}
