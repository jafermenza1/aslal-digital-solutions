import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";

export async function GET(){
 const user=await authorizePermission("customers.view");
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [rows]=await db.query(
  user.role==="ADMIN"||user.role==="SUPER_ADMIN"
   ? `SELECT id,name,slug,client_type,active,created_at FROM workspaces ORDER BY name`
   : `SELECT w.id,w.name,w.slug,w.client_type,w.active,w.created_at
        FROM workspaces w JOIN workspace_users wu ON wu.workspace_id=w.id
       WHERE wu.user_id=? AND w.active=1 ORDER BY w.name`,
  user.role==="ADMIN"||user.role==="SUPER_ADMIN"?[]:[user.id]
 );
 return NextResponse.json({workspaces:rows,internalWorkspaceId:INTERNAL_WORKSPACE_ID});
}

export async function POST(request:Request){
 const user=await authorizePermission("customers.view");
 if(!user || (user.role!=="ADMIN"&&user.role!=="SUPER_ADMIN"))return NextResponse.json({error:"Only administrators can create client workspaces."},{status:403});
 try{
  const b=await request.json();
  const name=String(b.name??"").trim();
  const slug=String(b.slug??"").trim().toLowerCase();
  const clientType=String(b.clientType??"").trim()||null;
  if(!name||!slug)return NextResponse.json({error:"Workspace name and slug are required."},{status:400});
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return NextResponse.json({error:"Workspace slug must use lowercase letters, numbers and hyphens."},{status:400});
  const id=randomUUID();
  const connection=await db.getConnection();
  try{
   await connection.beginTransaction();
   await connection.query(
    `INSERT INTO workspaces (id,name,slug,client_type,active,created_at,updated_at) VALUES (?,?,?,?,1,NOW(),NOW())`,
    [id,name,slug,clientType]
   );
   await connection.query(
    `INSERT INTO workspace_users (id,workspace_id,user_id,role,created_at) VALUES (UUID(),?,?,?,NOW())`,
    [randomUUID(),id,user.id,"OWNER"]
   );
   await connection.commit();
  }catch(error){
   await connection.rollback();
   throw error;
  }finally{
   connection.release();
  }
  return NextResponse.json({ok:true,id,name,slug,clientType,ownerUserId:user.id},{status:201});
 }catch(error){
  console.error("WORKSPACE_CREATE_ERROR",error);
  const message=error instanceof Error?error.message:"";
  if(message.includes("uq_workspaces_slug")||message.includes("Duplicate"))return NextResponse.json({error:"A workspace with this slug already exists."},{status:409});
  return NextResponse.json({error:"Could not create workspace."},{status:500});
 }
}
