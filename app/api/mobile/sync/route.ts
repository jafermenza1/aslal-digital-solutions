import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { normalizeEthiopianPhone } from "@/lib/ethiopian-phone";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { runLeadCreatedAutomation } from "@/lib/automation";

type Operation = {
  operationId?: unknown;
  workspaceId?: unknown;
  entity?: unknown;
  action?: unknown;
  payload?: unknown;
  clientCreatedAt?: unknown;
};

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function pushLeadCreate(access: Awaited<ReturnType<typeof authorizeWorkspacePermission>>, op: Operation) {
  if (!access) return { status: 403, body: { status: "REJECTED", reason: "Unauthorized" } };
  const operationId = clean(op.operationId, 64);
  const payload = (op.payload && typeof op.payload === "object") ? op.payload as Record<string, unknown> : {};
  const leadId = clean(payload.id, 36);
  if (!operationId || !leadId || leadId !== operationId) return { status: 400, body: { status: "REJECTED", reason: "operationId must equal the client lead id" } };

  const existing = await prisma.lead.findFirst({ where: { id: leadId, workspaceId: access.workspace.id }, select: { id: true } });
  if (existing) return { status: 200, body: { status: "ACCEPTED", operationId, entityId: existing.id, idempotent: true } };

  const name = clean(payload.name, 160);
  const email = clean(payload.email, 190).toLowerCase();
  const phoneInput = clean(payload.phone, 40);
  const phone = phoneInput ? normalizeEthiopianPhone(phoneInput) : "";
  const message = clean(payload.message, 5000);
  if (!name) return { status: 400, body: { status: "REJECTED", reason: "Name is required" } };
  if (!email && !phone) return { status: 400, body: { status: "REJECTED", reason: "Email or valid phone is required" } };
  if (phoneInput && !phone) return { status: 400, body: { status: "REJECTED", reason: "Invalid Ethiopian phone number" } };
  if (!message) return { status: 400, body: { status: "REJECTED", reason: "Message is required" } };

  const person = email
    ? await prisma.person.findFirst({ where: { email }, select: { id: true } })
    : await prisma.person.findFirst({ where: { phone }, select: { id: true } });
  const personId = person?.id || randomUUID();

  await prisma.$transaction(async (tx) => {
    if (!person) {
      await tx.person.create({ data: { id: personId, name, email: email || null, phone: phone || null } });
    } else {
      await tx.person.update({ where: { id: personId }, data: { name, email: email || undefined, phone: phone || undefined } });
    }

    await tx.lead.create({
      data: {
        id: leadId,
        workspaceId: access.workspace.id,
        personId,
        name,
        email: email || null,
        phone: phone || null,
        company: clean(payload.company, 190) || null,
        businessType: clean(payload.businessType, 100) || null,
        message,
        status: "NEW",
        score: 25,
        source: clean(payload.source, 100) || "mobile",
        medium: clean(payload.medium, 100) || "offline",
        campaign: clean(payload.campaign, 150) || null,
        ownerEmail: access.user.email,
        nextAction: "Review mobile-captured lead",
        nextActionDueAt: new Date(Date.now() + 30 * 60 * 1000),
        referralCode: clean(payload.referralCode, 100) || null,
        captureMode: "OFFLINE",
        leadCategory: clean(payload.leadCategory, 100) || "Mobile capture",
      },
    });
    await tx.leadStageHistory.create({
      data: { leadId, fromStage: null, toStage: "NEW", changedBy: access.user.email, note: "Captured offline by Aslal mobile and accepted by server." },
    });
  });

  try { await recalculateLeadScore(leadId); } catch (error) { console.error("MOBILE_LEAD_SCORE_ERROR", error); }
  try { await runLeadCreatedAutomation(leadId); } catch (error) { console.error("MOBILE_LEAD_AUTOMATION_ERROR", error); }

  return { status: 200, body: { status: "ACCEPTED", operationId, entityId: leadId, idempotent: false } };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.edit", workspaceId);
  if (!access) return NextResponse.json({ status: "REJECTED", reason: "Unauthorized or workspace access denied" }, { status: 403 });

  const operations = Array.isArray(body.operations) ? body.operations as Operation[] : [];
  if (!operations.length) return NextResponse.json({ results: [] });

  const results = [];
  for (const op of operations) {
    if (clean(op.workspaceId, 64) !== access.workspace.id) {
      results.push({ operationId: clean(op.operationId, 64), status: "REJECTED", reason: "Workspace mismatch" });
      continue;
    }
    if (op.entity !== "lead" || op.action !== "create") {
      results.push({ operationId: clean(op.operationId, 64), status: "REJECTED", reason: "Unsupported mobile operation" });
      continue;
    }
    try {
      const result = await pushLeadCreate(access, op);
      results.push({ operationId: clean(op.operationId, 64), ...result.body });
    } catch (error) {
      console.error("MOBILE_SYNC_PUSH_ERROR", error);
      results.push({ operationId: clean(op.operationId, 64), status: "FAILED", reason: "Server could not accept the operation" });
    }
  }
  return NextResponse.json({ results });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const cursor = searchParams.get("cursor");
  const since = cursor ? new Date(cursor) : null;
  if (since && Number.isNaN(since.getTime())) return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });

  const leads = await prisma.lead.findMany({
    where: { workspaceId: access.workspace.id, ...(since ? { updatedAt: { gte: since } } : {}) },
    orderBy: { updatedAt: "asc" },
    take: 100,
    select: {
      id: true, workspaceId: true, name: true, email: true, phone: true, company: true,
      businessType: true, message: true, status: true, score: true, source: true, medium: true,
      campaign: true, ownerEmail: true, nextAction: true, nextActionDueAt: true,
      referralCode: true, captureMode: true, leadCategory: true, createdAt: true, updatedAt: true,
    },
  });
  const nextCursor = leads.length ? leads[leads.length - 1].updatedAt.toISOString() : new Date().toISOString();
  return NextResponse.json({ workspaceId: access.workspace.id, changes: leads, nextCursor });
}
