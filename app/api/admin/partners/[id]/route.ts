import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

const PARTNER_TYPES = new Set(["AGENT", "INFLUENCER", "AFFILIATE", "RESELLER"]);
const PARTNER_STATUSES = new Set(["ACTIVE", "PAUSED", "PENDING"]);

async function authorized() {
  return Boolean(await authorizePermission("partners.manage"));
}

async function resolvePartner(id: string) {
  const [rows] = await db.query<(import("mysql2").RowDataPacket & { id: string })[]>(
    "SELECT id FROM partners WHERE id = ? OR partner_number = ? LIMIT 1",
    [id, id],
  );
  return rows[0]?.id || null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const partnerId = await resolvePartner(String((await params).id || "").trim());
    if (!partnerId) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase() || null;
    const type = String(body.type ?? "").toUpperCase();
    const status = String(body.status ?? "").toUpperCase();
    const bio = String(body.bio ?? "").trim() || null;
    const specialties = String(body.specialties ?? "").trim() || null;
    const serviceAreas = String(body.serviceAreas ?? "").trim() || null;
    const audienceSize = body.audienceSize === undefined || body.audienceSize === "" || body.audienceSize === null ? null : Number(body.audienceSize);

    if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Partner name must be 2–160 characters." }, { status: 400 });
    if (!PARTNER_TYPES.has(type)) return NextResponse.json({ error: "Invalid partner type." }, { status: 400 });
    if (!PARTNER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid partner status." }, { status: 400 });
    if (email && email.length > 190) return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    if (audienceSize !== null && (!Number.isInteger(audienceSize) || audienceSize < 0)) return NextResponse.json({ error: "Audience size must be a non-negative integer." }, { status: 400 });
    if ((bio && bio.length > 5000) || (specialties && specialties.length > 5000) || (serviceAreas && serviceAreas.length > 5000)) return NextResponse.json({ error: "Partner profile text is too long." }, { status: 400 });

    await db.query(
      "UPDATE partners SET name=?,email=?,type=?,status=?,bio=?,specialties=?,service_areas=?,audience_size=? WHERE id=?",
      [name, email, type, status, bio, specialties, serviceAreas, audienceSize, partnerId],
    );
    return NextResponse.json({ ok: true, message: status === "PAUSED" ? "Partner suspended." : "Partner updated." });
  } catch (error) {
    console.error("PARTNER_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Could not update partner." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const partnerId = await resolvePartner(String((await params).id || "").trim());
    if (!partnerId) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    await db.query("DELETE FROM partners WHERE id = ?", [partnerId]);
    return NextResponse.json({ ok: true, message: "Partner deleted." });
  } catch (error) {
    console.error("PARTNER_DELETE_ERROR", error);
    return NextResponse.json({ error: "Could not delete partner. Suspend the partner instead if retained campaign or financial records prevent deletion." }, { status: 409 });
  }
}
