import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function POST(request:Request){
 const access=await authorizeWorkspacePermission("partners.manage",typeof new URL(request.url).searchParams.get("workspaceId")==="string"?new URL(request.url).searchParams.get("workspaceId"):undefined); const actor=access?.user;
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
 try{
  const b=await request.json();
  const partnerId=String(b.partnerId??"").trim();
  const competingPartnerId=String(b.competingPartnerId??"").trim()||null;
  const leadId=String(b.leadId??"").trim()||null;
  const campaignId=String(b.campaignId??"").trim()||null;
  const commissionId=String(b.commissionId??"").trim()||null;
  const subject=String(b.subject??"").trim();
  const description=String(b.description??"").trim();
  const evidenceRef=String(b.evidenceRef??"").trim()||null;

  if(!partnerId||!subject||!description)return NextResponse.json({error:"Partner, subject and description are required."},{status:400});
  if(competingPartnerId===partnerId)return NextResponse.json({error:"Competing partner must be different from the claimant."},{status:400});

  const [partners]=await db.query<any[]>(`SELECT id FROM partners WHERE id IN (?,?) AND workspace_id=?`,[partnerId,competingPartnerId||partnerId,access.workspace.id]);
  const ids=new Set((partners as Array<{id:string}>).map(x=>x.id));
  if(!ids.has(partnerId)|| (competingPartnerId&&!ids.has(competingPartnerId)))return NextResponse.json({error:"One or more partners were not found."},{status:400});

  if(leadId){
   const [lead]=await db.query<any[]>(`SELECT id FROM leads WHERE id=? AND workspace_id=? LIMIT 1`,[leadId,access.workspace.id]);
   if(!lead[0])return NextResponse.json({error:"Lead not found."},{status:400});
  }

  const id=randomUUID();\n  if(campaignId){const [r]=await db.query<any[]>(`SELECT id FROM partner_campaigns WHERE id=? AND workspace_id=? LIMIT 1`,[campaignId,access.workspace.id]);if(!r[0])return NextResponse.json({error:"Campaign not found in this workspace."},{status:400});}\n  if(commissionId){const [r]=await db.query<any[]>(`SELECT id FROM commissions WHERE id=? AND workspace_id=? LIMIT 1`,[commissionId,access.workspace.id]);if(!r[0])return NextResponse.json({error:"Commission not found in this workspace."},{status:400});}
  await db.query(
   `INSERT INTO partner_disputes
      (id,workspace_id,partner_id,competing_partner_id,lead_id,campaign_id,commission_id,subject,description,evidence_ref,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,'OPEN',NOW(),NOW())`,
   [id,access.workspace.id,partnerId,competingPartnerId,leadId,campaignId,commissionId,subject,description,evidenceRef]
  );
  await db.query(
   `INSERT INTO user_audits (id,user_id,actor,action,reason,details,created_at)
    VALUES (UUID(),NULL,?,?,?,?,?,NOW())`,
   [actor.email,"PARTNER_ATTRIBUTION_DISPUTE_CREATED","Partner attribution dispute opened.",
    JSON.stringify({disputeId:id,partnerId,competingPartnerId,leadId,campaignId,commissionId,evidenceRef})]
  );
  return NextResponse.json({ok:true,id,status:"OPEN"},{status:201});
 }catch(error){
  console.error("PARTNER_DISPUTE_CREATE_ERROR",error);
  return NextResponse.json({error:"Could not create dispute."},{status:500});
 }
}

export async function GET(){
 const access=await authorizeWorkspacePermission("partners.manage"); if(!access)return NextResponse.json({error:"Unauthorized"},{status:403});
 const [rows]=await db.query(
  `SELECT d.id,d.partner_id,p.name partner_name,d.competing_partner_id,cp.name competing_partner_name,
          d.awarded_partner_id,ap.name awarded_partner_name,d.lead_id,d.campaign_id,c.name campaign_name,
          d.commission_id,d.subject,d.description,d.evidence_ref,d.decision_notes,d.status,d.resolution,
          d.resolved_by,d.resolved_at,d.created_at
     FROM partner_disputes d
     JOIN partners p ON p.id=d.partner_id
     LEFT JOIN partners cp ON cp.id=d.competing_partner_id
     LEFT JOIN partners ap ON ap.id=d.awarded_partner_id
     LEFT JOIN partner_campaigns c ON c.id=d.campaign_id
    WHERE d.workspace_id=? ORDER BY d.created_at DESC LIMIT 250`,[access.workspace.id]
 );
 return NextResponse.json({disputes:rows});
}
