import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";

const ROLES=["OWNER","ADMIN","MANAGER","SALES","FINANCE","AUDITOR","CLIENT","PARTNER","MEMBER"] as const;
const STATUSES=["ACTIVE","SUSPENDED","REMOVED"] as const;

async function actorCanManage(actor:any, workspaceId:string) {
  if (actor.role==="ADMIN" || actor.role==="SUPER_ADMIN") return true;
  const [rows]=await db.query<any[]>("SELECT role,status FROM workspace_users WHERE workspace_id=? AND user_id=? LIMIT 1",[workspaceId,actor.id]);
  return rows[0]?.status==="ACTIVE" && ["OWNER","ADMIN"].includes(rows[0].role);
}

async function writeHistory(workspaceId:string,membershipId:string,userId:string,actorId:string,action:string,fromRole:string|null,toRole:string|null,fromStatus:string|null,toStatus:string|null,reason:string) {
  await db.query(`INSERT INTO workspace_membership_history
    (id,workspace_id,user_id,membership_id,action,from_role,to_role,from_status,to_status,reason,actor_id,created_at)
    VALUES (UUID(),?,?,?,?,?,?,?,?,?,?,NOW())`,
    [workspaceId,userId,membershipId,action,fromRole,toRole,fromStatus,toStatus,reason,actorId]);
}

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("users.manage"); if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params; const access=await getWorkspaceForUser(actor,id);
 if(!access)return NextResponse.json({error:"Workspace not found or not authorized."},{status:403});
 const [rows]=await db.query(`SELECT wu.id,wu.user_id,u.email,u.name,u.role,wu.role workspace_role,wu.status,wu.suspended_at,wu.removed_at,wu.created_at
   FROM workspace_users wu JOIN users u ON u.id=wu.user_id WHERE wu.workspace_id=? ORDER BY u.name`,[id]);
 const [history]=await db.query(`SELECT h.*,u.email actor_email FROM workspace_membership_history h LEFT JOIN users u ON u.id=h.actor_id WHERE h.workspace_id=? ORDER BY h.created_at DESC LIMIT 500`,[id]);
 return NextResponse.json({members:rows,history});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("users.manage"); if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params; const access=await getWorkspaceForUser(actor,id);
 if(!access || !(await actorCanManage(actor,id)))return NextResponse.json({error:"You cannot manage membership in this workspace."},{status:403});
 const b=await request.json().catch(()=>({})); const userId=String(b.userId??"").trim(); const role=String(b.role??"MEMBER").trim(); const reason=String(b.reason??"").trim();
 if(!userId||!reason)return NextResponse.json({error:"userId and reason are required."},{status:400});
 if(!ROLES.includes(role as any))return NextResponse.json({error:"Invalid workspace role."},{status:400});
 if((role==="OWNER"||role==="ADMIN")&&actor.role!=="ADMIN"&&actor.role!=="SUPER_ADMIN"&&actor.id!==userId&&actor.workspaceRole!=="OWNER")return NextResponse.json({error:"Only an owner or administrator can assign elevated workspace roles."},{status:403});
 const [target]=await db.query<any[]>("SELECT id,active FROM users WHERE id=? LIMIT 1",[userId]); if(!target[0]||!target[0].active)return NextResponse.json({error:"Active user not found."},{status:404});
 const [existing]=await db.query<any[]>("SELECT id,role,status FROM workspace_users WHERE workspace_id=? AND user_id=? LIMIT 1",[id,userId]);
 if(existing[0]){
   if(existing[0].status==="REMOVED")return NextResponse.json({error:"Membership was removed; create a new membership instead."},{status:409});
   if(existing[0].role===role)return NextResponse.json({ok:true,unchanged:true,membershipId:existing[0].id,role,status:existing[0].status});
   if(existing[0].role==="OWNER" && role!=="OWNER"){
     const [owners]=await db.query<any[]>("SELECT COUNT(*) count FROM workspace_users WHERE workspace_id=? AND role='OWNER' AND status='ACTIVE'",[id]);
     if(Number(owners[0]?.count||0)<=1)return NextResponse.json({error:"The last active OWNER cannot be demoted."},{status:409});
   }
   await db.query("UPDATE workspace_users SET role=?,status='ACTIVE',suspended_at=NULL,removed_at=NULL WHERE id=?",[role,existing[0].id]);
   await writeHistory(id,existing[0].id,userId,actor.id,"ROLE_CHANGED",existing[0].role,role,existing[0].status,"ACTIVE",reason);
   return NextResponse.json({ok:true,membershipId:existing[0].id,role,status:"ACTIVE"});
 }
 const membershipId=(await db.query<any[]>("SELECT UUID() id"))[0][0].id;
 await db.query("INSERT INTO workspace_users (id,workspace_id,user_id,role,status,created_at) VALUES (?,?,?,?,'ACTIVE',NOW())",[membershipId,id,userId,role]);
 await writeHistory(id,membershipId,userId,actor.id,"ADDED",null,role,null,"ACTIVE",reason);
 return NextResponse.json({ok:true,membershipId,role,status:"ACTIVE"});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("users.manage"); if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params; if(!await getWorkspaceForUser(actor,id)||!(await actorCanManage(actor,id)))return NextResponse.json({error:"You cannot manage membership in this workspace."},{status:403});
 const b=await request.json().catch(()=>({})); const userId=String(b.userId??"").trim(); const action=String(b.action??"").toUpperCase(); const reason=String(b.reason??"").trim();
 if(!userId||!reason)return NextResponse.json({error:"userId and reason are required."},{status:400});
 if(!["SUSPEND","REACTIVATE"].includes(action))return NextResponse.json({error:"Action must be SUSPEND or REACTIVATE."},{status:400});
 const [rows]=await db.query<any[]>("SELECT id,role,status FROM workspace_users WHERE workspace_id=? AND user_id=? LIMIT 1",[id,userId]); const m=rows[0];
 if(!m||m.status==="REMOVED")return NextResponse.json({error:"Active membership not found."},{status:404});
 if(action==="SUSPEND"&&m.role==="OWNER"){const [owners]=await db.query<any[]>("SELECT COUNT(*) count FROM workspace_users WHERE workspace_id=? AND role='OWNER' AND status='ACTIVE'",[id]);if(Number(owners[0]?.count||0)<=1)return NextResponse.json({error:"The last active OWNER cannot be suspended."},{status:409});}
 const next=action==="SUSPEND"?"SUSPENDED":"ACTIVE";
 await db.query("UPDATE workspace_users SET status=?,suspended_at=?,removed_at=NULL WHERE id=?",[next,next==="SUSPENDED"?new Date():null,m.id]);
 await writeHistory(id,m.id,userId,actor.id,action,m.role,m.role,m.status,next,reason);
 return NextResponse.json({ok:true,membershipId:m.id,status:next});
}

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("users.manage"); if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params; if(!await getWorkspaceForUser(actor,id)||!(await actorCanManage(actor,id)))return NextResponse.json({error:"You cannot manage membership in this workspace."},{status:403});
 const b=await request.json().catch(()=>({})); const userId=String(b.userId??"").trim(); const reason=String(b.reason??"").trim();
 if(!userId||!reason)return NextResponse.json({error:"userId and reason are required."},{status:400});
 const [rows]=await db.query<any[]>("SELECT id,role,status FROM workspace_users WHERE workspace_id=? AND user_id=? LIMIT 1",[id,userId]); const m=rows[0];
 if(!m||m.status==="REMOVED")return NextResponse.json({error:"Membership not found."},{status:404});
 if(m.role==="OWNER"){const [owners]=await db.query<any[]>("SELECT COUNT(*) count FROM workspace_users WHERE workspace_id=? AND role='OWNER' AND status='ACTIVE'",[id]);if(Number(owners[0]?.count||0)<=1)return NextResponse.json({error:"The last active OWNER cannot be removed."},{status:409});}
 await db.query("UPDATE workspace_users SET status='REMOVED',removed_at=NOW() WHERE id=?",[m.id]);
 await writeHistory(id,m.id,userId,actor.id,"REMOVED",m.role,null,m.status,"REMOVED",reason);
 return NextResponse.json({ok:true,membershipId:m.id,status:"REMOVED"});
}
