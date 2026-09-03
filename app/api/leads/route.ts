import { NextRequest, NextResponse } from "next/server";
import { LeadStatus, prisma } from "@/lib/prisma";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { randomUUID } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

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
    if (clean(body.website, 200)) return NextResponse.json({ ok: true });

    const name = clean(body.name, 160);
    const email = clean(body.email, 190).toLowerCase();
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 190);
    const businessType = clean(body.businessType, 100);
    const message = clean(body.message, 5000);
    const productSlug = clean(body.productSlug, 160);

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: "Please provide an email or phone number so we can contact you." }, { status: 400 });

    recordSubmission(key);
    const visitorId = await getOrCreateVisitor();
    const referralCode = await getReferralCode();
    const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
    const source = referralCode ? "partner" : visitor?.firstSource || "website";

    const leadId = randomUUID();
    await prisma.$transaction(async (tx) => {
      await tx.lead.create({
        data: {
          id: leadId,
          visitorId,
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
          businessType: businessType || null,
          message,
          status: LeadStatus.NEW,
          score: 25,
          source,
          medium: visitor?.firstMedium || null,
          campaign: visitor?.firstCampaign || null,
          referralCode: referralCode || null,
        },
      });

      await tx.leadStageHistory.create({
        data: { leadId, fromStage: null, toStage: LeadStatus.NEW, changedBy: "website" },
      });

      if (productSlug) {
        const product = await tx.product.findUnique({ where: { slug: productSlug } });
        if (product) {
          await tx.leadProductInterest.create({
            data: { id: randomUUID(), leadId, productId: product.id, source: "contact_form", interestScore: 10 },
          });
        }
      }
    });

    return NextResponse.json({ ok: true, leadId });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to submit the request right now." }, { status: 500 });
  }
}
