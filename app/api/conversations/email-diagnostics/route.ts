import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail, verifySession } from "@/lib/security";
import { verifyEmailProviders } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const result = await verifyEmailProviders();
    return NextResponse.json({ ok: result.smtp.ok && result.imap.ok, provider: "EMAIL", ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, provider: "EMAIL", error: error instanceof Error ? error.message : "Email diagnostics failed" },
      { status: 502 },
    );
  }
}
