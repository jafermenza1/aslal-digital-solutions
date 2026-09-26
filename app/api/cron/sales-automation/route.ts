import { NextResponse } from "next/server";
import { runScheduledAutomation } from "@/lib/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = String(process.env.AUTOMATION_CRON_SECRET || "");
  if (!secret) return NextResponse.json({ ok: false, error: "AUTOMATION_CRON_SECRET is not configured" }, { status: 503 });
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (provided !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(
      { ok: true, ...(await runScheduledAutomation()) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("SALES_AUTOMATION_CRON_ERROR", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Sales automation processing failed" },
      { status: 502 },
    );
  }
}
