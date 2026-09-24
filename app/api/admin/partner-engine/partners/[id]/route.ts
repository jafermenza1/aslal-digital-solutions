import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

const VERIFICATION=new Set(["REGISTERED","VERIFIED","SUSPENDED"]);
const TIERS=new Set(["STARTER","VERIFIED","PRO","ELITE"]);
const STATUS=new Set(["ACTIVE","PAUSED","PENDING"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const actor=await authorizePermission("partners.manage");
  if(!actor) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params;
  try{
    const b=await request.json();
    const fields:string[]=[]; const values:unknown[]=[];
    if(b.verificationStatus!==undefined){const v=String(b.verificationStatus).toUpperCase();if(!VERIFICATION.has(v))return NextResponse.json({error:"Invalid verification status."},{status:400});fields.push("verification_status=?");values.push(v);if(v==="VERIFIED"){fields.push("verified_at=NOW()","verified_by=?");values.push(actor.email);}}
    if(b.tier!==undefined){const v=String(b.tier).toUpperCase();if(!TIERS.has(v))return NextResponse.json({error:"Invalid partner tier."},{status:400});fields.push("tier=?");values.push(v);}
    if(b.status!==undefined){const v=String(b.status).toUpperCase();if(!STATUS.has(v))return NextResponse.json({error:"Invalid partner status."},{status:400});fields.push("status=?");values.push(v);}
    for(const [key,column] of [["bio","bio"],["specialties","specialties"],["serviceAreas","service_areas"],["verificationNotes","verification_notes"]] as const){if(b[key]!==undefined){const v=String(b[key]??"").trim();if(v.length>5000)return NextResponse.json({error:"Profile text is too long."},{status:400});fields.push(column+"=?");values.push(v||null);}}
    if(b.audienceSize!==undefined){const v=Number(b.audienceSize);if(!Number.isInteger(v)||v<0||v>2147483647)return NextResponse.json({error:"Audience size must be a non-negative integer."},{status:400});fields.push("audience_size=?");values.push(v);}
    if(!fields.length)return NextResponse.json({error:"No partner changes supplied."},{status:400});
    values.push(id);
    const [result]=await db.query<{affectedRows:number}>(`UPDATE partners SET ${fields.join(", ")} WHERE id=?`,values);
    if(!result.affectedRows)return NextResponse.json({error:"Partner not found."},{status:404});
    return NextResponse.json({ok:true});
  }catch(error){console.error("PARTNER_PROFILE_UPDATE_ERROR",error);return NextResponse.json({error:"Could not update partner."},{status:500});}
}
