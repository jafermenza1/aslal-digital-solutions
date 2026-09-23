import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { hashPassword } from "@/lib/users";
import { generatePartnerCardPdf, partnerCardFileName } from "@/lib/partner-card";
import { sendEmail } from "@/lib/email";
import { randomBytes } from "node:crypto";

const PARTNER_TYPES = new Set(["AGENT", "INFLUENCER", "AFFILIATE", "RESELLER"]);
const PARTNER_STATUSES = new Set(["ACTIVE", "PAUSED", "PENDING"]);

async function isAuthorized() {
  return Boolean(await authorizePermission("partners.manage"));
}

function adminRecipient() {
  return String(process.env.PARTNER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@aslaldigital.com").trim();
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase() || null;
    const type = String(body.type ?? "AGENT").toUpperCase();
    const status = String(body.status ?? "ACTIVE").toUpperCase();
    const code = String(body.code ?? "").trim().toLowerCase();
    const campaign = String(body.campaign ?? "").trim() || null;
    const productSlug = String(body.productSlug ?? "").trim() || null;
    const requestCredentials = body.requestCredentials === true || body.requestCredentials === "true";
    let destinationPath = String(body.destinationPath ?? "/").trim() || "/";

    if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Partner name must be 2–160 characters." }, { status: 400 });
    if (!PARTNER_TYPES.has(type) || !PARTNER_STATUSES.has(status)) return NextResponse.json({ error: "Invalid partner type or status." }, { status: 400 });
    if (email && email.length > 190) return NextResponse.json({ error: "Email is too long." }, { status: 400 });

    const generatedBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "partner";
    const generatedCode = code || `${generatedBase}-${crypto.randomUUID().slice(0, 8)}`;
    const finalCode = generatedCode.slice(0, 100);

    if (!/^[a-z0-9][a-z0-9_-]{2,99}$/.test(finalCode)) {
      return NextResponse.json({ error: "Referral code must be 3–100 lowercase letters, numbers, hyphens or underscores." }, { status: 400 });
    }
    if (productSlug && destinationPath === "/") destinationPath = `/contact?product=${encodeURIComponent(productSlug)}`;
    if (!destinationPath.startsWith("/") || destinationPath.startsWith("//") || destinationPath.length > 500) {
      return NextResponse.json({ error: "Destination must be an internal path." }, { status: 400 });
    }

    const partnerId = crypto.randomUUID();
    await db.query("INSERT INTO partners (id, name, email, type, status, portal_requested) VALUES (?, ?, ?, ?, ?, ?)", [
      partnerId, name, email, type, status, requestCredentials ? 1 : 0,
    ]);

    try {
      await db.query(
        "INSERT INTO referral_links (id, partner_id, code, campaign, product_slug, destination_path) VALUES (?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), partnerId, finalCode, campaign, productSlug, destinationPath],
      );
    } catch (error) {
      await db.query("DELETE FROM partners WHERE id = ?", [partnerId]);
      const message = error instanceof Error && /duplicate|unique/i.test(error.message) ? "That referral code already exists." : "Could not create referral link.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    let username = "";
    let temporaryPassword = "";
    if (requestCredentials) {
      username = `${generatedBase}-${crypto.randomUUID().slice(0, 6)}`;
      temporaryPassword = randomBytes(12).toString("base64url");
      const loginEmail = `${username}@partners.aslaldigital.com`;

      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: loginEmail,
          name,
          passwordHash: hashPassword(temporaryPassword),
          role: "PARTNER",
          active: true,
          partnerId,
          permissions: { grant: [], revoke: [] },
        },
      });

      await db.query("UPDATE partners SET username = ? WHERE id = ?", [username, partnerId]);
    }

    let emailSent = false;
    let emailRecipient = email || adminRecipient();
    try {
      const pdf = await generatePartnerCardPdf(partnerId);
      const message = {
        subject: `Aslal partner card — ${name}`,
        body: [
          `Hello ${name},`,
          "",
          "Your Aslal Digital Solutions partner card is attached.",
          `Referral code: ${finalCode}`,
          `Referral link: ${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}`,
          requestCredentials ? `Partner username: ${username}` : "",
          requestCredentials ? `Temporary password: ${temporaryPassword}` : "",
          requestCredentials ? "Please sign in and change the temporary password after first login." : "",
        ].filter(Boolean).join("\n"),
        html: `<p>Hello ${name},</p><p>Your Aslal Digital Solutions partner card is attached.</p><p><strong>Referral code:</strong> ${finalCode}<br/><strong>Referral link:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}">${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}</a></p>${requestCredentials ? `<p><strong>Username:</strong> ${username}<br/><strong>Temporary password:</strong> ${temporaryPassword}</p>` : ""}`,
        attachments: [{ filename: partnerCardFileName(finalCode), content: pdf, contentType: "application/pdf" }],
      };
      try {
        await sendEmail({ recipient: emailRecipient, ...message });
        emailSent = true;
      } catch (primaryError) {
        console.error("PARTNER_CARD_EMAIL_ERROR", primaryError);
        const fallback = adminRecipient();
        if (emailRecipient !== fallback) {
          emailRecipient = fallback;
          await sendEmail({ recipient: fallback, ...message });
          emailSent = true;
        }
      }
    } catch (error) {
      console.error("PARTNER_CARD_GENERATION_ERROR", error);
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com"}/go/${finalCode}`;
    return NextResponse.json({
      ok: true,
      partnerId,
      code: finalCode,
      referralUrl: publicUrl,
      username: requestCredentials ? username : null,
      credentialsIssued: requestCredentials,
      emailSent,
      emailRecipient,
      emailFallbackUsed: !email,
    }, { status: 201 });
  } catch (error) {
    console.error("PARTNER_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not create partner." }, { status: 500 });
  }
}
