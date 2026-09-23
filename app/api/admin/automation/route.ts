import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail, verifySession } from "@/lib/security";
import { getAutomationSnapshot } from "@/lib/automation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    return NextResponse.json(await getAutomationSnapshot(50), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("AUTOMATION_SNAPSHOT_ERROR", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Automation snapshot failed" },
      { status: 500 },
    );
  }
}
