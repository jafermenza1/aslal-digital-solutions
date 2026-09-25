import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, isAdminEmail } from "@/lib/security";
import { getProductionIntegrityReport } from "@/lib/production-integrity";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  const configuredToken = String(process.env.PRODUCTION_INTEGRITY_TOKEN || "");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const tokenAuthorized = Boolean(configuredToken) && bearer === configuredToken;
  const workspaceId = new URL(request.url).searchParams.get("workspaceId") || "";
  if (session && isAdminEmail(session.email)) {
    const access = await authorizeWorkspacePermission("operations.view", workspaceId || undefined);
    if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
    return NextResponse.json(await getProductionIntegrityReport(access.workspace.id), { headers: { "Cache-Control": "no-store" } });
  }
  if (!tokenAuthorized || !workspaceId) return NextResponse.json({ error: "Unauthorized or workspaceId required" }, { status: 401 });
  return NextResponse.json(await getProductionIntegrityReport(workspaceId), { headers: { "Cache-Control": "no-store" } });
}
