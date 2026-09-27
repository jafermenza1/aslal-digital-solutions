import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

type ResourceRow = RowDataPacket & { title: string; download_url: string | null };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [rows] = await db.query<ResourceRow[]>(
    "SELECT title,download_url FROM resources WHERE slug=? AND active=1 LIMIT 1",
    [slug]
  );
  const resource = rows[0];
  if (!resource?.download_url) return NextResponse.json({ error: "Resource download is unavailable." }, { status: 404 });

  const pathname = new URL(resource.download_url, request.url).pathname;
  const relative = pathname.replace(/^\/+/, "");
  if (!relative.startsWith("resources/downloads/") || relative.includes("..")) {
    return NextResponse.json({ error: "Invalid resource download." }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", relative);
    const file = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": filename.endsWith(".csv") ? "text/csv; charset=utf-8" : "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "The requested resource file could not be found." }, { status: 404 });
  }
}
