import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { generatePartnerCardPdf, partnerCardFileName } from "@/lib/partner-card";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizePermission("partners.manage"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [rows] = await db.query<Array<{ id:string; status:string; account_status:string; verification_status:string }>>(
      "SELECT id, status, account_status, verification_status FROM partners WHERE id = ? OR partner_number = ? LIMIT 1",
      [id, id],
    );
    const partner = rows[0];
    if (!partner) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    if (partner.status !== "ACTIVE" || partner.account_status !== "ACTIVE" || partner.verification_status !== "VERIFIED") {
      return NextResponse.json({ error: "The official partner ID card is available only after verification and activation." }, { status: 409 });
    }
    const pdf = await generatePartnerCardPdf(partner.id);
    const body = new ArrayBuffer(pdf.byteLength);
    new Uint8Array(body).set(pdf);
    const filenameKey = id.startsWith("ASL-") ? id : id.slice(0, 12);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${partnerCardFileName(filenameKey)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PARTNER_CARD_DOWNLOAD_ERROR", error);
    const detail = error instanceof Error ? error.message : "Partner card prerequisites could not be prepared.";
    return NextResponse.json({ error: "Could not generate partner card.", detail }, { status: 500 });
  }
}
