import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const access = await authorizePermission("partner.portal.view");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const program = await prisma.partnerProgram.findFirst({
    where: { id: params.id, status: "PUBLISHED", workspace: { active: true } },
    include: {
      workspace: { select: { id: true, name: true, slug: true, active: true } },
      marketplaceProfile: true,
      terms: { where: { active: true }, take: 1 },
      campaigns: { where: { status: { in: ["OPEN", "ACTIVE"] } }, select: { id: true, name: true, description: true, targetDescription: true, location: true, rewardType: true, rewardAmount: true, rewardRate: true, currency: true, startsAt: true, endsAt: true, productId: true, resourceId: true } },
    },
  });
  if (!program) return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  const allowed=(program.allowedPartnerTypes||"").split(",").map(x=>x.trim()).filter(Boolean);
  return NextResponse.json({
    offer: {
      id: program.id, name: program.name, slug: program.slug, description: program.description,
      business: program.workspace, admissionMode: program.admissionMode, allowedPartnerTypes: allowed,
      profile: program.marketplaceProfile, terms: program.terms[0] || null, campaigns: program.campaigns,
      trust: { businessActive: program.workspace.active, published: true, activeTerms: Boolean(program.terms[0]), platformListed: true },
    },
  });
}
