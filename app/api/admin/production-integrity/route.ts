import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, isAdminEmail } from "@/lib/security";
import { getProductionIntegrityReport } from "@/lib/production-integrity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  const configuredToken = String(process.env.PRODUCTION_INTEGRITY_TOKEN || "");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const tokenAuthorized = Boolean(configuredToken) && bearer === configuredToken;
  if ((!session || !isAdminEmail(session.email)) && !tokenAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getProductionIntegrityReport(), { headers: { "Cache-Control": "no-store" } });
}
