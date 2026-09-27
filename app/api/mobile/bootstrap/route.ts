import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rows] = await db.query<any[]>(
    user.role === "SUPER_ADMIN" || user.role === "ADMIN"
      ? `SELECT id,name,slug,client_type,active,created_at
         FROM workspaces
         WHERE active=1
         ORDER BY name`
      : `SELECT w.id,w.name,w.slug,w.client_type,w.active,w.created_at
         FROM workspaces w
         INNER JOIN workspace_users wu ON wu.workspace_id=w.id
         WHERE wu.user_id=? AND w.active=1
         ORDER BY w.name`,
    user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? [] : [user.id],
  );

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
    workspaces: rows,
  });
}
