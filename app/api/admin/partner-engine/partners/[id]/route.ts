import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const VERIFICATION=new Set(["REGISTERED","VERIFIED","SUSPENDED"]);
const TIERS=new Set(["STARTER","VERIFIED","PRO","ELITE"]);
const STATUS=new Set(["ACTIVE","PAUSED","PENDING"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  try{
    const b=await request.json();
    const [partnerRows]=await db.query<(RowDataPacket & {id:string;workspace_id:string;verification_status:string;status:string;account_status:string})[]>(
      "SELECT id,workspace_id,verification_status,status,account_status FROM partners WHERE id=? LIMIT 1",[id]
    );
    const current=partnerRows[0];
    if(!current)return NextResponse.json({error:"Partner not found."},{status:404});
    const actor=await authorizeWorkspacePermission("partners.manage",String(b.workspaceId||current.workspace_id));
    if(!actor)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});

    const fields:string[]=[]; const values:unknown[]=[];
    let nextVerification=current.verification_status;
    let nextStatus=current.status;

    if(b.verificationStatus!==undefined){
      const v=String(b.verificationStatus).toUpperCase();
      if(!VERIFICATION.has(v))return NextResponse.json({error:"Invalid verification status."},{status:400});
      nextVerification=v;
      fields.push("verification_status=?"); values.push(v);
      if(v==="VERIFIED"){
        fields.push("verified_at=NOW()","verified_by=?","verification_level='VERIFIED'");
        values.push(actor.user.email);
      } else if(v==="SUSPENDED"){
        fields.push("account_status='SUSPENDED'");
        if(nextStatus==="ACTIVE"){nextStatus="PAUSED";fields.push("status=?");values.push("PAUSED");}
      } else {
        fields.push("verification_level='BASIC'");
      }
    }

    if(b.tier!==undefined){
      const v=String(b.tier).toUpperCase();
      if(!TIERS.has(v))return NextResponse.json({error:"Invalid partner tier."},{status:400});
      fields.push("tier=?");values.push(v);
    }

    if(b.status!==undefined){
      const v=String(b.status).toUpperCase();
      if(!STATUS.has(v))return NextResponse.json({error:"Invalid partner status."},{status:400});
      if(v==="ACTIVE" && nextVerification!=="VERIFIED")return NextResponse.json({error:"Verify the partner first. Activation requires verification status VERIFIED."},{status:409});
      nextStatus=v;
      fields.push("status=?");values.push(v);
    }

    for(const [key,column] of [["bio","bio"],["specialties","specialties"],["serviceAreas","service_areas"],["verificationNotes","verification_notes"],["logoUrl","logo_url"]] as const){
      if(b[key]!==undefined){
        const v=String(b[key]??"").trim();
        if(key==="logoUrl" && v && !/^https:\/\//i.test(v))return NextResponse.json({error:"Partner logo must be an HTTPS URL."},{status:400});
        if(v.length>5000)return NextResponse.json({error:"Profile text is too long."},{status:400});
        fields.push(column+"=?");values.push(v||null);
      }
    }
    if(b.audienceSize!==undefined){
      const v=Number(b.audienceSize);
      if(!Number.isInteger(v)||v<0||v>2147483647)return NextResponse.json({error:"Audience size must be a non-negative integer."},{status:400});
      fields.push("audience_size=?");values.push(v);
    }

    if(b.status!==undefined || b.verificationStatus!==undefined){
      if(nextStatus==="ACTIVE"){
        if(nextVerification!=="VERIFIED")return NextResponse.json({error:"Activation requires a VERIFIED partner."},{status:409});
        fields.push("account_status='ACTIVE'","onboarding_status='IN_PROGRESS'","onboarding_step='PAYOUT'");
      } else if(nextVerification==="SUSPENDED" || nextStatus==="PAUSED"){
        fields.push("account_status='SUSPENDED'");
      } else {
        fields.push("account_status='REGISTERED'");
      }
    }

    if(!fields.length)return NextResponse.json({error:"No partner changes supplied."},{status:400});
    values.push(id);
    const [result]=await db.query<ResultSetHeader>(`UPDATE partners SET ${fields.join(", ")} WHERE id=? AND workspace_id=?`,[...values,actor.workspace.id]);
    if(!result.affectedRows)return NextResponse.json({error:"Partner was not found in the selected workspace."},{status:404});

    return NextResponse.json({
      ok:true,
      verificationStatus:nextVerification,
      status:nextStatus,
      accountStatus:nextStatus==="ACTIVE"?"ACTIVE":nextVerification==="SUSPENDED"||nextStatus==="PAUSED"?"SUSPENDED":"REGISTERED",
      nextStep:nextStatus==="ACTIVE"?"Complete payout/terms onboarding, then issue portal credentials or match the partner to an eligible campaign.":nextVerification==="VERIFIED"?"Complete the remaining onboarding checks, then activate the verified partner.":"Complete profile review and verification.",
    });
  }catch(error){
    console.error("PARTNER_PROFILE_UPDATE_ERROR",error);
    return NextResponse.json({error:"Could not update partner."},{status:500});
  }
}
