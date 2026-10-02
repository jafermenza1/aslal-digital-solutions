import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const started = Date.now();
  const deep = new URL(request.url).searchParams.get("deep") !== "0";
  try {
    if (deep) await db.query("SELECT 1");
    return NextResponse.json(
      {
        status: "ok",
        application: "ok",
        database: deep ? "ok" : "not_checked",
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        application: "ok",
        database: "error",
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
