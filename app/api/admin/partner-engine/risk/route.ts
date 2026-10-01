import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { auditTrustEvent, detectPartnerRisk, persistRiskSignals } from "@/lib/trust-risk-engine";

export async function GET(request:Request){
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const u=new URL(request.url), status=u.searchParams.get("status")||"OPEN", partnerId=u.searchParams.get("partnerId");
  const [rows]=await db.query<(RowDataPacket & Record<string,unknown>)[]>(
    `SELECT r.*,p.partner_number,p.name partner_name,p.account_status
     FROM partner_risk_signals r LEFT JOIN partners p ON p.id=r.partner_id
     WHERE r.workspace_id=? AND (?='ALL' OR r.status=?) AND (?='' OR r.partner_id=?)
     ORDER BY FIELD(r.severity,'CRITICAL','HIGH','MEDIUM','LOW'),r.created_at DESC LIMIT 200`,
    [access.workspace.id,status,status,partnerId||"",partnerId||""]);
  return NextResponse.json({signals:rows});
}

export async function POST(request:Request){
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const body=await request.json();
    const action=String(body.action||"SCAN").toUpperCase();
    if(action==="SCAN_ALL"){
      const [partners]=await db.query<(RowDataPacket & {id:string})[]>("SELECT id FROM partners WHERE workspace_id=? AND account_status IN ('ACTIVE','RESTRICTED','SUSPENDED') LIMIT 1000",[access.workspace.id]);
      let total=0; const ids:string[]=[];
      for(const p of partners){ const found=await detectPartnerRisk(access.workspace.id,p.id); const created=await persistRiskSignals(access.workspace.id,found); total+=found.length; ids.push(...created); }
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"RISK_SCAN_ALL",entityType:"WORKSPACE",entityId:access.workspace.id,after:{partners:partners.length,signals:total}});
      return NextResponse.json({partnersScanned:partners.length,signalsDetected:total,signalIds:ids});
    }
    if(action==="SCAN"){
      if(!body.partnerId)return NextResponse.json({error:"partnerId is required."},{status:400});
      const signals=await detectPartnerRisk(access.workspace.id,String(body.partnerId));
      const ids=await persistRiskSignals(access.workspace.id,signals);
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"RISK_SCAN",entityType:"PARTNER",entityId:String(body.partnerId),after:{signalCount:signals.length,signalIds:ids}});
      return NextResponse.json({signals,signalIds:ids});
    }
    if(action==="ADD_EVIDENCE"){
      if(!body.riskSignalId||!String(body.description||"").trim())return NextResponse.json({error:"riskSignalId and description are required."},{status:400});
      const [s]=await db.query<(RowDataPacket & {id:string;partner_id:string|null;status:string})[]>("SELECT id,partner_id,status FROM partner_risk_signals WHERE id=? AND workspace_id=? LIMIT 1",[String(body.riskSignalId),access.workspace.id]);
      if(!s[0])return NextResponse.json({error:"Risk signal not found."},{status:404});
      const id=randomUUID();
      await db.query("INSERT INTO partner_risk_evidence (id,workspace_id,risk_signal_id,partner_id,evidence_type,reference,description,submitted_by) VALUES (?,?,?,?,?,?,?,?)",
        [id,access.workspace.id,s[0].id,s[0].partner_id,String(body.evidenceType||"DOCUMENT"),body.reference?String(body.reference).slice(0,1000):null,String(body.description).slice(0,10000),access.user.email]);
      await db.query("UPDATE partner_risk_signals SET status='UNDER_REVIEW' WHERE id=? AND workspace_id=? AND status='OPEN'",[s[0].id,access.workspace.id]);
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"RISK_EVIDENCE_ADDED",entityType:"RISK_SIGNAL",entityId:s[0].id,reason:String(body.description).slice(0,500)});
      return NextResponse.json({evidenceId:id});
    }
    if(action==="REVIEW"){
      const signalId=String(body.riskSignalId||""); const decision=String(body.decision||"").toUpperCase(); const reason=String(body.reason||"").trim();
      if(!signalId||!["CONFIRM","DISMISS","RESOLVE"].includes(decision)||reason.length<10)return NextResponse.json({error:"A valid decision and review reason of at least 10 characters are required."},{status:400});
      const [s]=await db.query<(RowDataPacket & {id:string;partner_id:string|null;status:string;severity:string})[]>("SELECT id,partner_id,status,severity FROM partner_risk_signals WHERE id=? AND workspace_id=? LIMIT 1",[signalId,access.workspace.id]);
      if(!s[0])return NextResponse.json({error:"Risk signal not found."},{status:404});
      const next=decision==="CONFIRM"?"CONFIRMED":decision==="DISMISS"?"DISMISSED":"RESOLVED";
      await db.query("UPDATE partner_risk_signals SET status=?,reviewed_by=?,reviewed_at=NOW(),review_note=? WHERE id=? AND workspace_id=?",[next,access.user.email,reason,signalId,access.workspace.id]);
      await db.query("INSERT INTO partner_risk_reviews (id,workspace_id,risk_signal_id,action,decision,reason,reviewer) VALUES (?,?,?,?,?,?,?)",
        [randomUUID(),access.workspace.id,signalId,decision,next,reason,access.user.email]);
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"RISK_REVIEW",entityType:"RISK_SIGNAL",entityId:signalId,before:{status:s[0].status},after:{status:next},reason});
      return NextResponse.json({status:next});
    }
    if(action==="RESTRICT"){
      const partnerId=String(body.partnerId||""); const level=String(body.level||"").toUpperCase(); const reason=String(body.reason||"").trim();
      if(!partnerId||!["RESTRICTED","SUSPENDED"].includes(level)||reason.length<10)return NextResponse.json({error:"partnerId, level and a substantive reason are required."},{status:400});
      const [p]=await db.query<(RowDataPacket & {id:string;account_status:string;name:string})[]>("SELECT id,account_status,name FROM partners WHERE id=? AND workspace_id=? LIMIT 1",[partnerId,access.workspace.id]);
      if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
      await db.query("UPDATE partners SET account_status=?,restricted_reason=? WHERE id=? AND workspace_id=?",[level,reason,partnerId,access.workspace.id]);
      const restrictionId=randomUUID();
      await db.query("INSERT INTO partner_restrictions (id,workspace_id,partner_id,level,reason,risk_signal_id,imposed_by) VALUES (?,?,?,?,?,?,?)",
        [restrictionId,access.workspace.id,partnerId,level,reason,body.riskSignalId||null,access.user.email]);
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"PARTNER_RESTRICTED",entityType:"PARTNER",entityId:partnerId,before:{accountStatus:p[0].account_status},after:{accountStatus:level},reason});
      return NextResponse.json({restrictionId,status:level});
    }
    if(action==="RESTORE"){
      const partnerId=String(body.partnerId||""); const reason=String(body.reason||"").trim();
      if(!partnerId||reason.length<10)return NextResponse.json({error:"partnerId and a substantive restoration reason are required."},{status:400});
      const [p]=await db.query<(RowDataPacket & {id:string;account_status:string})[]>("SELECT id,account_status FROM partners WHERE id=? AND workspace_id=? LIMIT 1",[partnerId,access.workspace.id]);
      if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
      await db.query("UPDATE partners SET account_status='ACTIVE',restricted_reason=NULL WHERE id=? AND workspace_id=?",[partnerId,access.workspace.id]);
      await db.query("UPDATE partner_restrictions SET status='LIFTED',lifted_by=?,lifted_at=NOW() WHERE partner_id=? AND workspace_id=? AND status='ACTIVE'",[access.user.email,partnerId,access.workspace.id]);
      await auditTrustEvent({workspaceId:access.workspace.id,actor:access.user.email,action:"PARTNER_RESTORED",entityType:"PARTNER",entityId:partnerId,before:{accountStatus:p[0].account_status},after:{accountStatus:"ACTIVE"},reason});
      return NextResponse.json({status:"ACTIVE"});
    }
    return NextResponse.json({error:"Unsupported action."},{status:400});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Trust operation failed."},{status:400});}
}
