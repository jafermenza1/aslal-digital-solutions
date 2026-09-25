import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("customers.view");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const [rows]=await db.query(
  `SELECT wu.id,wu.user_id,u.email,u.name,u.role,wu.role workspace_role
     FROM workspace_users wu JOIN users u ON u.id=wu.user_id
    WHERE wu.workspace_id=? ORDER BY u.name`,[id]
 );
 return NextResponse.json({members:rows});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("users.manage");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 try{
  const b=await request.json();
  const userId=String(b.userId??"").trim();
  const role=String(b.role??"MEMBER").trim().slice(0,80);
  if(!userId)return NextResponse.json({error:"userId is required."},{status:400});
  const [workspace]=await db.query<any[]>(`SELECT id FROM workspaces WHERE id=? AND active=1 LIMIT 1`,[id]);
  if(!workspace[0])return NextResponse.json({error:"Workspace not found."},{status:404});
  const [user]=await db.query<any[]>(`SELECT id,active FROM users WHERE id=? LIMIT 1`,[userId]);
  if(!user[0]||!user[0].active)return NextResponse.json({error:"Active user not found."},{status:404});
  await db.query(
   `INSERT INTO workspace_users (id,workspace_id,user_id,role,created_at)
    VALUES (UUID(),?,?,?,NOW())
    ON DUPLICATE KEY UPDATE role=VALUES(role)`,[id,userId,role]
  );
  return NextResponse.json({ok:true,workspaceId:id,userId,role});
 }catch(error){
  console.error("WORKSPACE_MEMBER_ERROR",error);
  return NextResponse.json({error:"Could not update workspace membership."},{status:500});
 }
}
