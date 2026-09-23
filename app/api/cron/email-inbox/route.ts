import { NextResponse } from "next/server";
import { pollEmailInbox } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.EMAIL_INBOX_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "EMAIL_INBOX_CRON_SECRET is not configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  const provided = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (provided !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pollEmailInbox();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Email inbox processing failed" },
      { status: 502 },
    );
  }
}
