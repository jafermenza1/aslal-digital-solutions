import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { normalizeEthiopianPhone } from "@/lib/ethiopian-phone";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { runLeadCreatedAutomation } from "@/lib/automation";
import { sendContactAutoReply } from "@/lib/contact-autoreply";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import { recordLeadAttribution, type AttributionInput } from "@/lib/attribution";

type VisitorRow = RowDataPacket & {
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  first_referral_code: string | null;
};

type ReferralAttributionRow = RowDataPacket & {
  code: string;
  created_at: Date;
};

type ProductRow = RowDataPacket & { id: string; slug: string; name: string };
type PersonRow = RowDataPacket & { id: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
const DEFAULT_NEXT_ACTION = "Review new lead and confirm sales owner";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const current = attempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return current.count >= MAX_SUBMISSIONS;
}

function recordSubmission(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else current.count += 1;
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  if (isRateLimited(key)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  try {
    const body = await request.json();
    if (clean(body.website, 200)) return NextResponse.json({ ok: true, ignored: true });

    const name = clean(body.name, 160);
    const email = clean(body.email, 190).toLowerCase();
    const phoneInput = clean(body.phone, 40);
    const phone = normalizeEthiopianPhone(phoneInput);
    const company = clean(body.company, 190);
    const businessType = clean(body.businessType, 100);
    const message = clean(body.message, 5000);
    const productSlug = clean(body.productSlug, 160);
    const productIdInput = clean(body.productId, 36);
    const emailConsent = body.emailConsent === true || body.emailConsent === "true" || body.emailConsent === "on";
    const growthGoal = clean(body.growthGoal, 200);
    const growthChannels = clean(body.growthChannels, 500);
    let attribution: AttributionInput = {};
    if (typeof body.attribution === "string") { try { attribution = JSON.parse(body.attribution) as AttributionInput; } catch {} }
    const requestedSource = clean(attribution.source, 100) || null;
    const requestedMedium = clean(attribution.medium, 100) || null;
    const requestedCampaign = clean(attribution.campaign, 150) || null;
    const enrichedMessage = [
      message,
      growthGoal ? `Growth Builder goal: ${growthGoal}` : "",
      growthChannels ? `Growth Builder channels: ${growthChannels}` : "",
    ].filter(Boolean).join("\n\n");

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (phoneInput && !phone) return NextResponse.json({ error: "Please enter a valid Ethiopian phone number." }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: "Please provide an email or valid Ethiopian phone number so we can contact you." }, { status: 400 });

    recordSubmission(key);
    const visitorId = await getOrCreateVisitor();
    const workspaceId = resolvePublicWorkspaceId(request.headers.get("host"));
    const requestedReferralCode = await getReferralCode();
    const [visitorRows] = await db.execute<VisitorRow[]>(
      "SELECT first_source, first_medium, first_campaign, first_referral_code FROM visitors WHERE id = ? LIMIT 1",
      [visitorId]
    );
    const visitor = visitorRows[0];
    const [referralRows] = requestedReferralCode
      ? await db.execute<ReferralAttributionRow[]>(
          "SELECT rl.code, rc.created_at FROM referral_clicks rc INNER JOIN referral_links rl ON rl.id = rc.referral_link_id WHERE rc.visitor_id = ? AND rl.code = ? AND rl.workspace_id = ? ORDER BY rc.created_at DESC LIMIT 1",
          [visitorId, requestedReferralCode, workspaceId]
        )
      : [[] as ReferralAttributionRow[]];
    const referralTouch = referralRows[0];
    const referralExpiry = referralTouch
      ? new Date(referralTouch.created_at.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null;
    const referralCode = referralTouch && referralExpiry && referralExpiry > new Date() ? referralTouch.code : null;
    const source = referralCode ? "partner" : visitor?.first_source || requestedSource || "website";
    const medium = referralCode ? "referral" : visitor?.first_medium || requestedMedium || null;
    const campaign = referralCode ? (visitor?.first_campaign || requestedCampaign || null) : visitor?.first_campaign || requestedCampaign || null;
    const leadId = randomUUID();
    const nextActionDueAt = new Date(Date.now() + 30 * 60 * 1000);
    let personId = "";
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      const [personRows] = await connection.execute<PersonRow[]>(
        email
          ? "SELECT id FROM persons WHERE email = ? LIMIT 1"
          : "SELECT id FROM persons WHERE phone = ? LIMIT 1",
        [email || phone]
      );
      personId = personRows[0]?.id || randomUUID();
      if (!personRows[0]) {
        await connection.execute(
          `INSERT INTO persons (id, name, email, phone)
           VALUES (?, ?, ?, ?)`,
          [personId, name, email || null, phone]
        );
      } else {
        await connection.execute(
          `UPDATE persons SET name = ?, phone = ?, email = ? WHERE id = ?`,
          [name, phone, email || null, personId]
        );
      }

      if (email && emailConsent) {
        await connection.execute(
          `INSERT INTO communication_preferences
            (id, person_id, email_allowed, sms_allowed, telegram_allowed, whatsapp_allowed, messenger_allowed, global_opt_out, updated_at)
           VALUES (?, ?, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NOW())
           ON DUPLICATE KEY UPDATE email_allowed = IF(global_opt_out, email_allowed, TRUE), updated_at = NOW()`,
          [randomUUID(), personId]
        );
      }

      await connection.execute(
        `INSERT INTO leads
          (id, workspace_id, visitor_id, person_id, name, email, phone, company, business_type, message, status, score, source, medium, campaign, owner_email, next_action, next_action_due_at, referral_code, attribution_locked_at, attribution_locked_by, attribution_override_reason, attribution_expires_at, capture_mode, lead_category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', 25, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'WEB', 'Website contact')`,
        [
          leadId,
          workspaceId,
          visitorId,
          personId,
          name,
          email || null,
          phone,
          company || null,
          businessType || null,
          enrichedMessage,
          source,
          medium,
          campaign,
          siteConfig.defaultLeadOwnerEmail,
          DEFAULT_NEXT_ACTION,
          nextActionDueAt,
          referralCode || null,
          referralCode ? new Date() : null,
          referralCode ? "website" : null,
          referralExpiry,
        ]
      );

      await connection.execute(
        `INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, changed_by, note)
         VALUES (?, NULL, 'NEW', 'website', 'System triage owner and next-action deadline assigned at capture.')`,
        [leadId]
      );

      if (productIdInput || productSlug) {
        const [productRows] = await connection.execute<ProductRow[]>(
          productIdInput
            ? "SELECT id, slug, name FROM products WHERE id = ? AND active = 1 LIMIT 1"
            : "SELECT id, slug, name FROM products WHERE slug = ? AND active = 1 LIMIT 1",
          [productIdInput || productSlug]
        );
        const product = productRows[0];
        if (!product) throw new Error("Selected product/service does not exist.");
        await connection.execute(
          `INSERT INTO lead_product_interest
            (id, lead_id, product_id, source, interest_score)
           VALUES (?, ?, ?, 'contact_form', 10)
           ON DUPLICATE KEY UPDATE interest_score = interest_score + 1, last_seen_at = NOW()`,
          [randomUUID(), leadId, product.id]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    try {
      await recalculateLeadScore(leadId);
    } catch (error) {
      console.error("LEAD_SCORE_ERROR", error);
    }

    try {
      await runLeadCreatedAutomation(leadId);
    } catch (error) {
      console.error("LEAD_AUTOMATION_ERROR", error);
    }

    let autoReply: "SENT" | "SKIPPED" = "SKIPPED";
    if (email && emailConsent) {
      try {
        const reply = await sendContactAutoReply(leadId);
        autoReply = reply.sent ? "SENT" : "SKIPPED";
      } catch (error) {
        console.error("CONTACT_AUTO_REPLY_ERROR", error);
      }
    }

    return NextResponse.json({ ok: true, leadId, autoReply });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "Selected product/service does not exist.") {
      return NextResponse.json({ error: "The selected solution is no longer available. Please choose another option." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to submit the request right now. Please try again; no lead was intentionally accepted unless a success response is returned." }, { status: 500 });
  }
}
