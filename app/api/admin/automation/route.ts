import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail, verifySession } from "@/lib/security";
import { getAutomationSnapshot } from "@/lib/automation";
import { authorizePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await authorizePermission("operations.view");
  if (!user) return NextResponse.json({ error: "Operations permission required." }, { status: 403 });

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
