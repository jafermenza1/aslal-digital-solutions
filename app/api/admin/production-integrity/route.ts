import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, isAdminEmail } from "@/lib/security";
import { getProductionIntegrityReport } from "@/lib/production-integrity";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getProductionIntegrityReport(), { headers: { "Cache-Control": "no-store" } });
}
