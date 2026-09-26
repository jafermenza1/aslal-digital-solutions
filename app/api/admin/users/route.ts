import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { allPermissions, type Permission, resolvePermissions } from "@/lib/permissions";
import { hashPassword } from "@/lib/users";
import { UserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { getWorkspaceForUser } from "@/lib/workspaces";

function permissionOverrides(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { grant: [], revoke: [] };
  const data = value as { grant?: unknown; revoke?: unknown };
  const allowed = new Set(allPermissions());
  const clean = (input: unknown) => Array.isArray(input)
    ? input.filter((v): v is string => typeof v === "string" && allowed.has(v as Permission))
    : [];
  return { grant: clean(data.grant), revoke: clean(data.revoke) };
}

function present(user: { id:string; email:string; name:string; role:UserRole; active:boolean; permissions:unknown; lastLoginAt:Date|null }) {
  return {
    ...user,
    permissions: resolvePermissions(user.role, user.permissions).sort(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export async function GET() {
  const actor = await authorizePermission("users.manage");
  if (!actor) return NextResponse.json({ error: "User administration is not permitted." }, { status: 403 });
  const workspace = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN" ? null : await getWorkspaceForUser(actor);
  if (actor.role !== "ADMIN" && actor.role !== "SUPER_ADMIN" && !workspace) {
    return NextResponse.json({ error: "No active workspace is available." }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: workspace ? { workspaceUsers: { some: { workspaceId: workspace.id } } } : undefined,
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id:true, email:true, name:true, role:true, active:true, permissions:true, lastLoginAt:true },
  });
  return NextResponse.json({ users: users.map(present) });
}

export async function POST(request: Request) {
  const actor = await authorizePermission("users.manage");
  if (!actor) return NextResponse.json({ error: "User administration is not permitted." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 160);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 190);
  const password = String(body.password || "");
  const role = String(body.role || "SALES_OPERATOR") as UserRole;
  const active = body.active !== false;
  const reason = String(body.reason || "").trim().slice(0, 2000);
  const requestedWorkspaceId = String(body.workspaceId || "").trim() || undefined;
  const workspaceRole = String(body.workspaceRole || role).trim().slice(0, 80) || role;

  if (!name || !email || !password || !reason) return NextResponse.json({ error: "Name, email, password and reason are required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!Object.values(UserRole).includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  if (role === UserRole.SUPER_ADMIN && actor.role !== UserRole.SUPER_ADMIN) return NextResponse.json({ error: "Only a super administrator can create another super administrator." }, { status: 403 });
  if (password.length < 10) return NextResponse.json({ error: "Password must contain at least 10 characters." }, { status: 400 });
  const workspace = await getWorkspaceForUser(actor, requestedWorkspaceId);
  if (!workspace) return NextResponse.json({ error: "Select a workspace you are authorized to manage." }, { status: 403 });
  const allowedWorkspaceRoles = new Set(["OWNER","ADMIN","MANAGER","SALES","FINANCE","AUDITOR","CLIENT","PARTNER","MEMBER"]);
  if (!allowedWorkspaceRoles.has(workspaceRole)) return NextResponse.json({ error: "Invalid workspace role." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id:true } });
  if (existing) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });

  const permissions = permissionOverrides(body.permissions);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id: randomUUID(),
          name,
          email,
          passwordHash: hashPassword(password),
          role,
          active,
          permissions,
        },
      });
      await tx.workspaceUser.create({
        data: { id: randomUUID(), workspaceId: workspace.id, userId: created.id, role: workspaceRole },
      });
      await tx.userAudit.create({
        data: {
          id: randomUUID(),
          userId: created.id,
          actor: actor.email,
          action: "CREATE",
          reason,
          details: { role, active, workspaceId: workspace.id, workspaceRole },
        },
      });
      return created;
    });
    return NextResponse.json({ ok:true, user: present(user), workspace: { id: workspace.id, name: workspace.name, role: workspaceRole } });
  } catch (error) {
    console.error("USER_CREATE_ERROR", error);
    const message = error instanceof Error && /unique|duplicate/i.test(error.message)
      ? "A user with that email already exists."
      : "Could not create the user. No partial user record was saved.";
    return NextResponse.json({ error: message }, { status: message.includes("email") ? 409 : 500 });
  }
}
