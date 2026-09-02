import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security";
import { db } from "@/lib/db";

export async function GET() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [[visitorRows], [leadRows], [hotRows], [eventRows]] = await Promise.all([
    db.query("SELECT COUNT(*) AS count FROM visitors"),
    db.query("SELECT COUNT(*) AS count FROM leads"),
    db.query("SELECT COUNT(*) AS count FROM leads WHERE score >= 60"),
    db.query("SELECT event_name, COUNT(*) AS count FROM events GROUP BY event_name ORDER BY count DESC LIMIT 8"),
  ]);
  return NextResponse.json({ visitors: (visitorRows as any)[0]?.count || 0, leads: (leadRows as any)[0]?.count || 0, hotLeads: (hotRows as any)[0]?.count || 0, events: eventRows });
}
