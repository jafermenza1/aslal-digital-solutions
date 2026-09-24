import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import { generatePartnerCardPdf, partnerCardFileName } from "@/lib/partner-card";
import { sendEmail } from "@/lib/email";
import type { RowDataPacket } from "mysql2/promise";

function adminRecipient() { return String(process.env.PARTNER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@aslaldigital.com").trim(); }

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizePermission("partners.manage"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const [rows] = await db.query<(RowDataPacket & { id: string; name: string; email: string | null })[]>("SELECT id, name, email FROM partners WHERE id = ? LIMIT 1", [id]);
    const partner = rows[0];
    if (!partner) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    const pdf = await generatePartnerCardPdf(id);
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com").replace(/\\/$/, "");
    const [referrals] = await db.query<(RowDataPacket & { code: string })[]>("SELECT code FROM referral_links WHERE partner_id = ? ORDER BY created_at ASC LIMIT 1", [id]);
    const code = referrals[0]?.code;
    if (!code) return NextResponse.json({ error: "Partner referral link is not ready." }, { status: 409 });
    const recipient = partner.email || adminRecipient();
    const result = await sendEmail({
      recipient,
      subject: "Aslal partner ID card — " + partner.name,
      body: ["Hello " + partner.name + ",", "", "Your Aslal Digital Solutions partner ID card is attached.", "Referral code: " + code, "Referral link: " + baseUrl + "/go/" + code].join("\
"),
      html: "<p>Hello " + partner.name + ",</p><p>Your Aslal Digital Solutions partner ID card is attached.</p><p><strong>Referral code:</strong> " + code + "<br/><strong>Referral link:</strong> <a href=\"" + baseUrl + "/go/" + code + "\">" + baseUrl + "/go/" + code + "</a></p>",
      attachments: [{ filename: partnerCardFileName(code), content: pdf, contentType: "application/pdf" }],
    });
    if (!result.accepted?.length) throw new Error(result.rejected?.join(", ") || "SMTP did not accept the message.");
    return NextResponse.json({ ok: true, emailSent: true, recipient });
  } catch (error) {
    console.error("PARTNER_CARD_EMAIL_ERROR", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not email partner ID card." }, { status: 500 });
  }
}
