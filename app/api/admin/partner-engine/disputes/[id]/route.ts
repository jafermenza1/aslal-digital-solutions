import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUS=new Set(["OPEN","UNDER_REVIEW","RESOLVED","REJECTED"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const access=await authorizeWorkspacePermission("partners.manage"); const actor=access?.user;
 if(!access)return NextResponse.json({error:"Unauthorized"},{status:403});
 const {id}=await params;
 try{
  const b=await request.json();
  const status=String(b.status??"").toUpperCase();
  const resolution=String(b.resolution??"").trim()||null;
  const evidenceRef=String(b.evidenceRef??"").trim()||null;
  const decisionNotes=String(b.decisionNotes??"").trim()||null;
  const awardedPartnerId=String(b.awardedPartnerId??"").trim()||null;

  if(!STATUS.has(status))return NextResponse.json({error:"Invalid dispute status."},{status:400});
  if(["RESOLVED","REJECTED"].includes(status)&&!resolution)return NextResponse.json({error:"A resolution note is required."},{status:400});
  if(status==="RESOLVED"&&!awardedPartnerId)return NextResponse.json({error:"Resolved attribution disputes require the partner who was awarded attribution."},{status:400});
  if(status==="RESOLVED"&&!evidenceRef)return NextResponse.json({error:"Resolved attribution disputes require evidence reference."},{status:400});

  const [existing]=await db.query<RowDataPacket[]>(
   `SELECT id,partner_id,competing_partner_id,lead_id,status FROM partner_disputes WHERE id=? AND workspace_id=? LIMIT 1`,[id,access.workspace.id]
  );
  const dispute=existing[0] as {id:string;partner_id:string;competing_partner_id:string|null;lead_id:string|null;status:string}|undefined;
  if(!dispute)return NextResponse.json({error:"Dispute not found."},{status:404});

  if(awardedPartnerId){
   const [partner]=await db.query<RowDataPacket[]>(`SELECT id FROM partners WHERE id=? AND workspace_id=?`,[awardedPartnerId,access.workspace.id]);
   if(!partner[0])return NextResponse.json({error:"Awarded partner not found."},{status:400});
   if(awardedPartnerId!==dispute.partner_id&&awardedPartnerId!==dispute.competing_partner_id){
    return NextResponse.json({error:"Awarded partner must be one of the disputing partners."},{status:400});
   }
  }

  const [r]=await db.query<(RowDataPacket & {affectedRows:number})[]>(
   `UPDATE partner_disputes
      SET status=?,resolution=?,evidence_ref=?,decision_notes=?,awarded_partner_id=?,
          resolved_by=?,resolved_at=?
    WHERE id=? AND workspace_id=?`,
   [status,resolution,evidenceRef,decisionNotes,awardedPartnerId,
    ["RESOLVED","REJECTED"].includes(status)?actor.email:null,
    ["RESOLVED","REJECTED"].includes(status)?new Date():null,id,access.workspace.id]
  );
  if(!r[0]?.affectedRows)return NextResponse.json({error:"Dispute was not updated."},{status:409});

  if(["RESOLVED","REJECTED"].includes(status)){
   await db.query(
    `INSERT INTO user_audits (id,user_id,actor,action,reason,details,created_at)
     VALUES (UUID(),NULL,?,?,?,?,?,NOW())`,
    [actor.email,"PARTNER_ATTRIBUTION_DISPUTE_RESOLVED",
     resolution||"Partner attribution dispute resolved.",
     JSON.stringify({disputeId:id,status,awardedPartnerId,evidenceRef,leadId:dispute.lead_id,previousStatus:dispute.status})]
   );
  }

  return NextResponse.json({ok:true,status,awardedPartnerId});
 }catch(error){
  console.error("PARTNER_DISPUTE_UPDATE_ERROR",error);
  return NextResponse.json({error:"Could not update dispute."},{status:500});
 }
}
