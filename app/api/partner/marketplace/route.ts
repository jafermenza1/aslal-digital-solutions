import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { canJoinProgram } from "@/lib/partner-access";

export async function GET(req: Request) {
  const access = await authorizePermission("partner.portal.view");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const category = (url.searchParams.get("category") || "").trim();
  const type = (url.searchParams.get("type") || "").trim().toUpperCase();
  const programs = await prisma.partnerProgram.findMany({
    where: {
      status: "PUBLISHED",
      workspace: { active: true },
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { marketplaceProfile: { is: { headline: { contains: q } } } }] } : {}),
      ...(category ? { marketplaceProfile: { is: { category } } } : {}),
    },
    include: {
      workspace: { select: { id: true, name: true, slug: true, active: true } },
      marketplaceProfile: true,
      terms: { where: { active: true }, take: 1, select: { version: true, currency: true, earningsDescription: true, qualifyingEvent: true, attributionPolicy: true, attributionWindowDays: true, refundHoldDays: true, payoutSchedule: true, minimumPayout: true, exclusions: true } },
      _count: { select: { contracts: true } },
    },
    orderBy: [{ marketplaceProfile: { featured: "desc" } }, { publishedAt: "desc" }],
    take: 100,
  });
  const filtered = type ? programs.filter(p => {
    const allowed = (p.allowedPartnerTypes || "").split(",").map(x => x.trim()).filter(Boolean);
    return !allowed.length || allowed.includes(type);
  }) : programs;
  const partner = await prisma.partner.findFirst({ where: { user: { is: { id: access.id } } }, select: { id: true, type: true, accountStatus: true, verificationLevel: true } });
  const contracts = partner ? await prisma.commissionContract.findMany({ where: { partnerId: partner.id, status: "ACTIVE" }, select: { programId: true } }) : [];
  const joined = new Set(contracts.map(c => c.programId));
  return NextResponse.json({
    programs: filtered.map(p => ({
      id: p.id, workspaceId: p.workspaceId, business: p.workspace,
      name: p.name, slug: p.slug, description: p.description, admissionMode: p.admissionMode,
      allowedPartnerTypes: (p.allowedPartnerTypes || "").split(",").filter(Boolean),
      profile: p.marketplaceProfile,
      terms: p.terms[0] || null,
      participantCount: p._count.contracts,
      joined: joined.has(p.id),
      eligible: partner ? (() => {
        const allowed=(p.allowedPartnerTypes||"").split(",").map(x=>x.trim()).filter(Boolean);
        return (!allowed.length || allowed.includes(partner.type)) && canJoinProgram(partner, p.admissionMode);
      })() : false,
      trust: { businessActive: p.workspace.active, published: true, activeTerms: Boolean(p.terms[0]), platformListed: true },
    })),
  });
}
