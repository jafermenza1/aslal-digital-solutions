import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail, verifySession } from "@/lib/security";
import { pollEmailInbox } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const result = await pollEmailInbox();
    return NextResponse.json({ ok: true, provider: "IMAP", action: "email-inbox", ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, provider: "IMAP", action: "email-inbox", error: error instanceof Error ? error.message : "Email inbox check failed" }, { status: 502 });
  }
}
