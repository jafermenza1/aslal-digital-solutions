import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.query("SELECT 1");
    return NextResponse.json({ status: "ok", application: "ok", database: "ok", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", application: "ok", database: "error", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
