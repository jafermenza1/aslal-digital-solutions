import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { generatePartnerCardPdf, partnerCardFileName } from "@/lib/partner-card";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizePermission("partners.manage"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const pdf = await generatePartnerCardPdf(id);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${partnerCardFileName(id.slice(0, 12))}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not generate partner card." }, { status: 404 });
  }
}
