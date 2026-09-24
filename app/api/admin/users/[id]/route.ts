import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { allPermissions, type Permission, resolvePermissions } from "@/lib/permissions";
import { hashPassword } from "@/lib/users";
import { UserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id:string }> }) {
  const actor = await authorizePermission("users.manage");
  if (!actor) return NextResponse.json({ error: "User administration is not permitted." }, { status: 403 });
  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const name = body.name === undefined ? target.name : String(body.name || "").trim().slice(0, 160);
  const email = body.email === undefined ? target.email : String(body.email || "").trim().toLowerCase().slice(0, 190);
  const role = body.role === undefined ? target.role : String(body.role) as UserRole;
  const active = body.active === undefined ? target.active : Boolean(body.active);
  const reason = String(body.reason || "").trim().slice(0, 2000);

  if (!reason) return NextResponse.json({ error: "A reason is required for access changes." }, { status: 400 });
  if (!name || !email || !Object.values(UserRole).includes(role)) return NextResponse.json({ error: "Name, email and valid role are required." }, { status: 400 });
  if (target.role === UserRole.SUPER_ADMIN && actor.role !== UserRole.SUPER_ADMIN) return NextResponse.json({ error: "Only a super administrator can modify a super administrator." }, { status: 403 });
  if (role === UserRole.SUPER_ADMIN && actor.role !== UserRole.SUPER_ADMIN) return NextResponse.json({ error: "Only a super administrator can assign that role." }, { status: 403 });
  if (actor.id === target.id && !active) return NextResponse.json({ error: "You cannot disable your own account." }, { status: 400 });
  if (actor.id === target.id && role !== target.role) return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id:true } });
  if (existing && existing.id !== target.id) return NextResponse.json({ error: "That email is already assigned to another user." }, { status: 409 });

  const password = typeof body.password === "string" && body.password ? body.password : null;
  if (password && password.length < 10) return NextResponse.json({ error: "New password must contain at least 10 characters." }, { status: 400 });

  const permissions = permissionOverrides(body.permissions === undefined ? target.permissions : body.permissions);
  if (actor.id === target.id && !resolvePermissions(role, permissions).includes("users.manage" as Permission)) {
    return NextResponse.json({ error: "You cannot remove your own user-management permission." }, { status: 400 });
  }
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
          active,
          permissions,
          ...(password ? { passwordHash: hashPassword(password) } : {}),
        },
      });
      await tx.userAudit.create({
        data: {
          id: randomUUID(),
          userId: target.id,
          actor: actor.email,
          action: "UPDATE",
          reason,
          details: { role, active, passwordChanged: Boolean(password), permissions },
        },
      });
      return saved;
    });
    return NextResponse.json({ ok:true, user: present(updated) });
  } catch (error) {
    console.error("USER_UPDATE_ERROR", error);
    const message = error instanceof Error && /unique|duplicate/i.test(error.message)
      ? "That email is already assigned to another user."
      : "Could not save the user. No partial access change was committed.";
    return NextResponse.json({ error: message }, { status: message.includes("email") ? 409 : 500 });
  }
}
