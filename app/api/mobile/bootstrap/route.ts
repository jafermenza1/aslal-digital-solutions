import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const workspaces = await prisma.workspace.findMany({
    where: isAdmin
      ? { active: true }
      : { active: true, users: { some: { userId: user.id } } },
    select: {
      id: true,
      name: true,
      slug: true,
      clientType: true,
      active: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
    workspaces,
  });
}
