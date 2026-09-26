import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import { INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";

async function canManage(user: Awaited<ReturnType<typeof authorizePermission>>) {
  return Boolean(user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizePermission("users.manage");
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [rows] = await db.query<any[]>(
    `SELECT w.id,w.name,w.slug,w.client_type,w.active,w.created_at,w.updated_at,
            (SELECT COUNT(*) FROM workspace_users wu WHERE wu.workspace_id=w.id) member_count
       FROM workspaces w WHERE w.id=? LIMIT 1`, [id],
  );
  if (!rows[0]) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  const [members] = await db.query<any[]>(
    `SELECT wu.id membership_id,wu.user_id,wu.role workspace_role,u.email,u.name,u.role,u.active
       FROM workspace_users wu JOIN users u ON u.id=wu.user_id
      WHERE wu.workspace_id=? ORDER BY u.name`, [id],
  );
  return NextResponse.json({ workspace: rows[0], members });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizePermission("users.manage");
  if (!(await canManage(actor))) return NextResponse.json({ error: "Only administrators can manage workspaces." }, { status: 403 });
  const { id } = await params;
  if (id === INTERNAL_WORKSPACE_ID) return NextResponse.json({ error: "The Aslal Internal workspace cannot be renamed or deactivated." }, { status: 409 });
  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name === undefined ? undefined : String(body.name).trim();
    const slug = body.slug === undefined ? undefined : String(body.slug).trim().toLowerCase();
    const clientType = body.clientType === undefined ? undefined : (String(body.clientType).trim() || null);
    const active = body.active === undefined ? undefined : Boolean(body.active);
    if (name !== undefined && (!name || name.length > 190)) return NextResponse.json({ error: "Workspace name is required and must be 190 characters or fewer." }, { status: 400 });
    if (slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Workspace slug must use lowercase letters, numbers and hyphens." }, { status: 400 });
    const fields:string[]=[]; const values:unknown[]=[];
    if(name!==undefined){fields.push("name=?");values.push(name);}
    if(slug!==undefined){fields.push("slug=?");values.push(slug);}
    if(clientType!==undefined){fields.push("client_type=?");values.push(clientType);}
    if(active!==undefined){fields.push("active=?");values.push(active?1:0);}
    if(!fields.length)return NextResponse.json({error:"No workspace changes supplied."},{status:400});
    values.push(id);
    await db.query(`UPDATE workspaces SET ${fields.join(",")},updated_at=NOW() WHERE id=?`,values);
    const [rows]=await db.query<any[]>(`SELECT id,name,slug,client_type,active,created_at,updated_at FROM workspaces WHERE id=? LIMIT 1`,[id]);
    if(!rows[0])return NextResponse.json({error:"Workspace not found."},{status:404});
    return NextResponse.json({ok:true,workspace:rows[0]});
  }catch(error){
    console.error("WORKSPACE_UPDATE_ERROR",error);
    const message=error instanceof Error?error.message:"";
    if(/duplicate|uq_workspaces_slug/i.test(message))return NextResponse.json({error:"A workspace with this slug already exists."},{status:409});
    return NextResponse.json({error:"Could not update workspace."},{status:500});
  }
}
