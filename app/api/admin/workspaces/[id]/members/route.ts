import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const access=await authorizeWorkspacePermission("users.manage",id);
 if(!access)return NextResponse.json({error:"Workspace not found or not authorized."},{status:403});
 const [rows]=await db.query(
  `SELECT wu.id,wu.user_id,u.email,u.name,u.role,wu.role workspace_role
     FROM workspace_users wu JOIN users u ON u.id=wu.user_id
    WHERE wu.workspace_id=? ORDER BY u.name`,[id]
 );
 return NextResponse.json({members:rows});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 try{
  const access=await authorizeWorkspacePermission("users.manage",id);
  if(!access)return NextResponse.json({error:"Workspace not found or not authorized."},{status:403});
  const b=await request.json();
  const userId=String(b.userId??"").trim();
  const role=String(b.role??"MEMBER").trim().slice(0,80);
  const allowedRoles=new Set(["OWNER","ADMIN","MANAGER","SALES","FINANCE","AUDITOR","CLIENT","PARTNER","MEMBER"]);
  if(!allowedRoles.has(role))return NextResponse.json({error:"Invalid workspace role."},{status:400});
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


export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 try{
  const access=await authorizeWorkspacePermission("users.manage",id);
  if(!access)return NextResponse.json({error:"Workspace not found or not authorized."},{status:403});
  const b=await request.json();
  const userId=String(b.userId??"").trim();
  const role=String(b.role??"").trim();
  
  const allowedRoles=new Set(["OWNER","ADMIN","MANAGER","SALES","FINANCE","AUDITOR","CLIENT","PARTNER","MEMBER"]);
  if(!userId)return NextResponse.json({error:"userId is required."},{status:400});
  if(role && !allowedRoles.has(role))return NextResponse.json({error:"Invalid workspace role."},{status:400});
  if(!role)return NextResponse.json({error:"role is required."},{status:400});
  const sets:string[]=[]; const values:any[]=[];
  if(role){sets.push("role=?");values.push(role);}
  
  values.push(id,userId);
  const [result]=await db.query<any>(`UPDATE workspace_users SET ${sets.join(", ")} WHERE workspace_id=? AND user_id=?`,values);
  if(!result.affectedRows)return NextResponse.json({error:"Membership not found."},{status:404});
  return NextResponse.json({ok:true,workspaceId:id,userId,role});
 }catch(error){
  console.error("WORKSPACE_MEMBER_PATCH_ERROR",error);
  return NextResponse.json({error:"Could not amend workspace membership."},{status:500});
 }
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 try{
  const access=await authorizeWorkspacePermission("users.manage",id);
  if(!access)return NextResponse.json({error:"Workspace not found or not authorized."},{status:403});
  const url=new URL(_.url);
  const userId=url.searchParams.get("userId")?.trim();
  if(!userId)return NextResponse.json({error:"userId is required."},{status:400});
  if(userId===access.user.id)return NextResponse.json({error:"You cannot remove your own workspace membership."},{status:400});
  const [result]=await db.query<any>(`DELETE FROM workspace_users WHERE workspace_id=? AND user_id=?`,[id,userId]);
  if(!result.affectedRows)return NextResponse.json({error:"Membership not found."},{status:404});
  return NextResponse.json({ok:true,workspaceId:id,userId});
 }catch(error){
  console.error("WORKSPACE_MEMBER_DELETE_ERROR",error);
  return NextResponse.json({error:"Could not remove workspace membership."},{status:500});
 }
}
