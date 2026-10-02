import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";

const PARTNER_TYPES = new Set(["AGENT", "INFLUENCER", "AFFILIATE", "RESELLER"]);
const PARTNER_STATUSES = new Set(["ACTIVE", "PAUSED", "PENDING"]);

async function isAuthorized() {
  return Boolean(await authorizePermission("partners.manage"));
}


export async function POST(request: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const actor = await authorizePermission("partners.manage");
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const workspace = await getWorkspaceForUser(actor, String(body.workspaceId || "").trim() || undefined);
    if (!workspace) return NextResponse.json({ error: "Select a workspace you are authorized to manage." }, { status: 403 });
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase() || null;
    const type = String(body.type ?? "AGENT").toUpperCase();
    const status = "PENDING";
    const code = String(body.code ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim() || null;
    const country = String(body.country ?? "").trim() || "Ethiopia";
    const bio = String(body.bio ?? "").trim() || null;
    const specialties = String(body.specialties ?? "").trim() || null;
    const serviceAreas = String(body.serviceAreas ?? "").trim() || null;
    const audienceSize = body.audienceSize === undefined || body.audienceSize === "" ? null : Number(body.audienceSize);

    if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Partner name must be 2–160 characters." }, { status: 400 });
    if (!PARTNER_TYPES.has(type) || !PARTNER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid partner type or status." }, { status: 400 });
    if (email && email.length > 190) return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    if (phone && phone.length > 40) return NextResponse.json({ error: "Phone number is too long." }, { status: 400 });
    if (country.length > 100) return NextResponse.json({ error: "Country is too long." }, { status: 400 });
    if (bio && bio.length > 5000 || specialties && specialties.length > 5000 || serviceAreas && serviceAreas.length > 5000) return NextResponse.json({ error: "Partner profile text is too long." }, { status: 400 });
    if (audienceSize !== null && (!Number.isInteger(audienceSize) || audienceSize < 0)) return NextResponse.json({ error: "Audience size must be a non-negative integer." }, { status: 400 });

    const generatedBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "partner";
    const generatedCode = code || `${generatedBase}-${crypto.randomUUID().slice(0, 8)}`;
    const finalCode = generatedCode.slice(0, 100);

    if (!/^[a-z0-9][a-z0-9_-]{2,99}$/.test(finalCode)) {
      return NextResponse.json({ error: "Referral code must be 3–100 lowercase letters, numbers, hyphens or underscores." }, { status: 400 });
    }

    const partnerId = crypto.randomUUID();
    let identityId = String(body.identityId ?? "").trim() || "";
    let createdIdentity = false;
    if (identityId) {
      const [identityRows] = await db.query<any[]>("SELECT id FROM partner_identities WHERE id=? LIMIT 1",[identityId]);
      if (!identityRows[0]) return NextResponse.json({ error: "Partner identity not found." }, { status: 404 });
    } else {
      identityId = crypto.randomUUID();
      await db.query("INSERT INTO partner_identities (id,name,email,phone,created_at,updated_at) VALUES (?,?,?,?,NOW(),NOW())",[identityId,name,email,phone]);
      createdIdentity = true;
    }
    // Human-facing partner IDs are sequential business identifiers; the UUID remains the internal DB key.
    const year = new Date().getFullYear();
    const [seqRows] = await db.query<{ next: number }[] & import("mysql2").RowDataPacket[]>(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(partner_number, 5, 10) AS UNSIGNED)), 100) + 1 AS next FROM partners WHERE partner_number LIKE CONCAT('ASL-', '%', '-', ?) ",
      [year],
    );
    const nextNumber = Number(seqRows[0]?.next || 101);
    const partnerNumber = `ASL-${nextNumber}-${year}`;
    await db.query("INSERT INTO partners (id, identity_id, workspace_id, partner_number, name, email, phone, country, type, status, account_status, onboarding_status, onboarding_step, bio, specialties, service_areas, audience_size, portal_requested) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED', 'IN_PROGRESS', 'PROFILE', ?, ?, ?, ?, 0)", [
      partnerId, identityId, workspace.id, partnerNumber, name, email, phone, country, type, status, bio, specialties, serviceAreas, audienceSize,
    ]);

    try {
      await db.query(
        "INSERT INTO referral_links (id, workspace_id, partner_id, code, campaign, product_slug, destination_path) VALUES (?, ?, ?, ?, NULL, NULL, '/')",
        [crypto.randomUUID(), workspace.id, partnerId, finalCode],
      );
    } catch (error) {
      await db.query("DELETE FROM partners WHERE id = ?", [partnerId]);
      if (createdIdentity) await db.query("DELETE FROM partner_identities WHERE id = ?", [identityId]);
      const message = error instanceof Error && /duplicate|unique/i.test(error.message) ? "That referral code already exists." : "Could not create referral link.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Partner creation is intentionally isolated from portal credentials and ID-card generation.
    // This keeps the core partner/referral record usable even when email or PDF tooling fails.
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}`;
    return NextResponse.json({
      ok: true,
      partnerId,
      identityId,
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
