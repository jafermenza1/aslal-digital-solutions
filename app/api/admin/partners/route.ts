import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { generatePartnerNumber, generateResellerNumber } from "@/lib/partner-identity";

const PARTNER_TYPES = new Set(["AGENT", "INFLUENCER", "AFFILIATE", "RESELLER"]);
const PARTNER_STATUSES = new Set(["ACTIVE", "PAUSED", "PENDING"]);

async function isAuthorized() {
  return Boolean(await authorizePermission("partners.manage"));
}


export async function POST(request: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const actor = await authorizeWorkspacePermission("partners.manage", String(body?.workspaceId || "").trim() || undefined)?.user;
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const workspace = await getWorkspaceForUser(actor, String(body.workspaceId || "").trim() || undefined);
    if (!workspace) return NextResponse.json({ error: "Select a workspace you are authorized to manage." }, { status: 403 });
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase() || null;
    const type = String(body.type ?? "AGENT").toUpperCase();
    const status = "PENDING";
    const code = String(body.code ?? "").trim().toLowerCase();
    const bio = String(body.bio ?? "").trim() || null;
    const specialties = String(body.specialties ?? "").trim() || null;
    const serviceAreas = String(body.serviceAreas ?? "").trim() || null;
    const audienceSize = body.audienceSize === undefined || body.audienceSize === "" ? null : Number(body.audienceSize);
    const campaign = String(body.campaign ?? "").trim() || null;
    const productSlug = String(body.productSlug ?? "").trim() || null;
    let destinationPath = String(body.destinationPath ?? "/").trim() || "/";

    if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Partner name must be 2–160 characters." }, { status: 400 });
    if (!PARTNER_TYPES.has(type) || !PARTNER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid partner type or status." }, { status: 400 });
    if (email && email.length > 190) return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    if (bio && bio.length > 5000 || specialties && specialties.length > 5000 || serviceAreas && serviceAreas.length > 5000) return NextResponse.json({ error: "Partner profile text is too long." }, { status: 400 });
    if (audienceSize !== null && (!Number.isInteger(audienceSize) || audienceSize < 0)) return NextResponse.json({ error: "Audience size must be a non-negative integer." }, { status: 400 });

    const generatedBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "partner";
    const generatedCode = code || `${generatedBase}-${crypto.randomUUID().slice(0, 8)}`;
    const finalCode = generatedCode.slice(0, 100);

    if (!/^[a-z0-9][a-z0-9_-]{2,99}$/.test(finalCode)) {
      return NextResponse.json({ error: "Referral code must be 3–100 lowercase letters, numbers, hyphens or underscores." }, { status: 400 });
    }
    if (productSlug && destinationPath === "/") destinationPath = `/products/${encodeURIComponent(productSlug)}`;
    if (!destinationPath.startsWith("/") || destinationPath.startsWith("//") || destinationPath.length > 500) {
      return NextResponse.json({ error: "Destination must be an internal path." }, { status: 400 });
    }

    const partnerId = crypto.randomUUID();
    const partnerNumber = generatePartnerNumber(type as "AGENT" | "INFLUENCER" | "AFFILIATE" | "RESELLER");
    await db.query("INSERT INTO partners (id, workspace_id, partner_number, name, email, type, status, bio, specialties, service_areas, audience_size, portal_requested, registration_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INTERNAL')", [
      partnerId, workspace.id, partnerNumber, name, email, type, status, bio, specialties, serviceAreas, audienceSize, 0,
    ]);
    if (type === "RESELLER") {
      const businessName = String(body.businessName ?? name).trim().slice(0, 190);
      await db.query(
        "INSERT INTO resellers (id, workspace_id, partner_id, reseller_number, business_name, business_registration_number, tax_number, business_type, address, status, default_currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)",
        [crypto.randomUUID(), workspace.id, partnerId, generateResellerNumber(), businessName, String(body.businessRegistrationNumber ?? "").trim().slice(0,100) || null, String(body.taxNumber ?? "").trim().slice(0,100) || null, String(body.businessType ?? "").trim().slice(0,100) || null, String(body.address ?? "").trim().slice(0,500) || null, String(body.currency ?? "ETB").toUpperCase().slice(0,10)]
      );
    }

    try {
      await db.query(
        "INSERT INTO referral_links (id, workspace_id, partner_id, code, campaign, product_slug, destination_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), workspace.id, partnerId, finalCode, campaign, productSlug, destinationPath],
      );
    } catch (error) {
      await db.query("DELETE FROM partners WHERE id = ?", [partnerId]);
      const message = error instanceof Error && /duplicate|unique/i.test(error.message) ? "That referral code already exists." : "Could not create referral link.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Partner creation is intentionally isolated from portal credentials and ID-card generation.
    // This keeps the core partner/referral record usable even when email or PDF tooling fails.
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}`;
    return NextResponse.json({
      ok: true,
      partnerId,
      partnerNumber,
      code: finalCode,
      referralUrl: publicUrl,
      credentialsIssued: false,
      verificationStatus: "REGISTERED",
      workflow: ["REGISTERED","PROFILE_COMPLETED","VERIFICATION","APPROVED","CREDENTIALS","CAMPAIGN_MATCHING","ACTIVE"],
      emailSent: false,
      emailRecipient: email || null,
      emailFallbackUsed: false,
      emailError: null,
      workspace: { id: workspace.id, name: workspace.name },
      nextActions: {
        credentials: `/api/admin/partners/${partnerId}/credentials`,
        card: `/api/admin/partners/${partnerId}/card`,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("PARTNER_CREATE_ERROR", error);
    const message = error instanceof Error ? error.message : "";
    if (/duplicate|unique/i.test(message)) return NextResponse.json({ error: "A partner or referral identifier already exists. Choose a different referral code or try again." }, { status: 409 });
    if (/foreign key|constraint/i.test(message)) return NextResponse.json({ error: "Partner creation was blocked by a workspace or related-record constraint. Confirm the selected workspace is active and try again." }, { status: 409 });
    return NextResponse.json({ error: "Could not create partner. The server recorded the failure; retry after confirming the selected workspace." }, { status: 500 });
  }
}
