import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
const STATUS=new Set(["OPEN","UNDER_REVIEW","RESOLVED","REJECTED"]);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("partners.manage");if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 try{
  const b=await request.json(),status=String(b.status??"").toUpperCase(),resolution=String(b.resolution??"").trim()||null;
  if(!STATUS.has(status))return NextResponse.json({error:"Invalid dispute status."},{status:400});
  if(["RESOLVED","REJECTED"].includes(status)&&!resolution)return NextResponse.json({error:"A resolution note is required."},{status:400});
  const [r]=await db.query<{affectedRows:number}[]>(`UPDATE partner_disputes SET status=?,resolution=?,resolved_by=?,resolved_at=? WHERE id=?`,[status,resolution,["RESOLVED","REJECTED"].includes(status)?actor.email:null,["RESOLVED","REJECTED"].includes(status)?new Date():null,id]);
  if(!r[0]?.affectedRows)return NextResponse.json({error:"Dispute not found."},{status:404});
  return NextResponse.json({ok:true,status});
 }catch(error){console.error("PARTNER_DISPUTE_UPDATE_ERROR",error);return NextResponse.json({error:"Could not update dispute."},{status:500});}
}
