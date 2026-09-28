import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { RESOURCES } from "@/lib/resources";
import type { RowDataPacket } from "mysql2/promise";

export type DbResource = {
  id:string; workspace_id:string|null; slug:string; category:string; title:string; description:string; preview:string;
  cta:string; intent:string; download_url:string|null; active:number; published_at:Date; updated_at:Date;
};

export async function ensureResources() {
  for (const resource of RESOURCES) {
    await db.query(
      `INSERT INTO resources (id,slug,category,title,description,preview,cta,intent,download_url)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),preview=VALUES(preview),cta=VALUES(cta),intent=VALUES(intent),download_url=VALUES(download_url)`,
      [randomUUID(),resource.slug,resource.kind,resource.title,resource.description,resource.preview,resource.cta,resource.intent,resource.download||null]
    );
  }
}

export async function getResources(filters?:{category?:string;days?:number}) {
  await ensureResources();
  const category=filters?.category;
  const days=Math.min(3650,Math.max(1,Number(filters?.days||3650)));
  const [rows]=await db.query<(RowDataPacket&DbResource)[]>(
    `SELECT id,workspace_id,slug,category,title,description,preview,cta,intent,download_url,active,published_at,updated_at
     FROM resources
     WHERE active=1 AND published_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${category?"AND category = ?":""}
     ORDER BY published_at DESC`,
    category?[days,category]:[days]
  );
  return rows;
}

export async function getResourceBySlug(slug:string) {
  await ensureResources();
  const [rows]=await db.query<(RowDataPacket&DbResource)[]>(
    "SELECT id,slug,category,title,description,preview,cta,intent,download_url,active,published_at,updated_at FROM resources WHERE slug=? AND active=1 LIMIT 1",
    [slug]
  );
  return rows[0]||null;
}
