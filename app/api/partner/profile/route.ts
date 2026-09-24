import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

export async function GET(){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [u]=await db.query<{partner_id:string|null}[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [rows]=await db.query(`SELECT id,name,email,type,status,verification_status,tier,bio,specialties,service_areas,audience_size FROM partners WHERE id=? LIMIT 1`,[pid]);
 return NextResponse.json({partner:rows[0]||null});
}

export async function PATCH(request:Request){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await request.json();const fields:string[]=[];const values:unknown[]=[];
  for(const [key,column] of [["bio","bio"],["specialties","specialties"],["serviceAreas","service_areas"]] as const){if(b[key]!==undefined){const v=String(b[key]??"").trim();if(v.length>5000)return NextResponse.json({error:"Profile text is too long."},{status:400});fields.push(column+"=?");values.push(v||null);}}
  if(b.audienceSize!==undefined){const v=Number(b.audienceSize);if(!Number.isInteger(v)||v<0)return NextResponse.json({error:"Audience size must be a non-negative integer."},{status:400});fields.push("audience_size=?");values.push(v);}
  if(!fields.length)return NextResponse.json({error:"No profile changes supplied."},{status:400});
  const [u]=await db.query<{partner_id:string|null}[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
  values.push(pid);await db.query(`UPDATE partners SET ${fields.join(", ")} WHERE id=?`,values);return NextResponse.json({ok:true});
 }catch(error){console.error("PARTNER_PROFILE_PATCH_ERROR",error);return NextResponse.json({error:"Could not update partner profile."},{status:500});}
}
