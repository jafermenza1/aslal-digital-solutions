import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { hashPassword } from "@/lib/users";
import { sendEmail } from "@/lib/email";
import type { RowDataPacket } from "mysql2/promise";

function adminRecipient() {
  return String(process.env.PARTNER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@aslaldigital.com").trim();
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizePermission("partners.manage");
  if (!actor || !["SUPER_ADMIN", "ADMIN"].includes(actor.role)) return NextResponse.json({ error: "Only an administrator can issue partner portal credentials." }, { status: 403 });
  try {
    const { id } = await params;
    const [rows] = await db.query<(RowDataPacket & { id: string; name: string; email: string | null })[]>("SELECT id, name, email FROM partners WHERE id = ? LIMIT 1", [id]);
    const partner = rows[0];
    if (!partner) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    const existing = await prisma.user.findUnique({ where: { partnerId: id }, select: { id: true, email: true } });
    if (existing) return NextResponse.json({ ok: true, alreadyIssued: true, credentialsIssued: true, username: existing.email.replace(/@partners\.aslaldigital\.com$/i, ""), emailSent: false, message: "Portal credentials already exist. No new password was generated." });

    const base = partner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "partner";
    const username = base + "-" + randomBytes(4).toString("hex");
    const loginEmail = username + "@partners.aslaldigital.com";
    const temporaryPassword = randomBytes(12).toString("base64url");

    await prisma.user.create({
      data: { id: crypto.randomUUID(), email: loginEmail, name: partner.name, passwordHash: hashPassword(temporaryPassword), role: "PARTNER", active: true, partnerId: id, permissions: { grant: [], revoke: [] } },
    });
    await db.query("UPDATE partners SET portal_requested = 1, username = ?, password_hash = ? WHERE id = ?", [username, hashPassword(temporaryPassword), id]);

    let emailSent = false;
    let emailRecipient = partner.email || adminRecipient();
    let emailError = "";
    const portalUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com") + "/login";
    const message = {
      subject: "Aslal partner portal credentials — " + partner.name,
      body: ["Hello " + partner.name + ",", "", "Your Aslal Digital Solutions partner portal credentials have been issued.", "Portal: " + portalUrl, "Username: " + username, "Temporary password: " + temporaryPassword, "", "Please sign in and change the temporary password after your first login."].join("\n"),
      html: "<p>Hello " + partner.name + ",</p><p>Your Aslal Digital Solutions partner portal credentials have been issued.</p><p><strong>Portal:</strong> <a href=\"" + portalUrl + "\">" + portalUrl + "</a><br/><strong>Username:</strong> " + username + "<br/><strong>Temporary password:</strong> " + temporaryPassword + "</p><p>Please sign in and change the temporary password after your first login.</p>",
    };
    try {
      const result = await sendEmail({ recipient: emailRecipient, ...message });
      if (!result.accepted?.length) throw new Error(result.rejected?.join(", ") || "SMTP did not accept the message.");
      emailSent = true;
    } catch (primaryError) {
      emailError = primaryError instanceof Error ? primaryError.message : "Credential email delivery failed.";
      const fallback = adminRecipient();
      if (emailRecipient !== fallback) {
        try {
          const result = await sendEmail({ recipient: fallback, ...message });
          if (!result.accepted?.length) throw new Error(result.rejected?.join(", ") || "SMTP did not accept the fallback message.");
          emailRecipient = fallback;
          emailSent = true;
        } catch (fallbackError) {
          emailError += " Fallback failed: " + (fallbackError instanceof Error ? fallbackError.message : "unknown SMTP error");
        }
      }
    }
    return NextResponse.json({ ok: true, credentialsIssued: true, username, emailSent, emailRecipient, emailError: emailError || null, message: emailSent ? "Portal credentials issued and emailed to " + emailRecipient + "." : "Portal credentials were created securely, but the credential email could not be delivered." });
  } catch (error) {
    console.error("PARTNER_CREDENTIALS_ERROR", error);
    return NextResponse.json({ error: "Could not issue portal credentials." }, { status: 500 });
  }
}
