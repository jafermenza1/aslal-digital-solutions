import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { generatePartnerCardPdf, partnerCardFileName } from "@/lib/partner-card";

export async function GET() {
  const user = await authorizePermission("partner.portal.view");
  if (!user || user.role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const partner = await prisma.partner.findFirst({
      where: {
        user: { is: { id: user.id } },
        status: "ACTIVE",
        accountStatus: "ACTIVE",
        verificationStatus: "VERIFIED",
      },
      select: { id: true, partnerNumber: true, name: true },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Your partner ID is available after verification and activation." },
        { status: 409 },
      );
    }

    const pdf = await generatePartnerCardPdf(partner.id);
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${partnerCardFileName(partner.partnerNumber || partner.id)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PARTNER_SELF_ID_CARD_ERROR", error);
    return NextResponse.json(
      { error: "Could not generate your partner ID card right now." },
      { status: 500 },
    );
  }
}
