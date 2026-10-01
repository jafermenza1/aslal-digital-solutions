import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export type RiskSeverity = "LOW"|"MEDIUM"|"HIGH"|"CRITICAL";

type Signal = {
  code:string; severity:RiskSeverity; score:number; summary:string; explanation:string;
  partnerId?:string|null; leadId?:string|null; orderId?:string|null; evidence:Record<string,unknown>;
};

function norm(v:string|null|undefined){return String(v||"").trim().toLowerCase().replace(/[^a-z0-9+@.]/g,"");}

export async function detectPartnerRisk(workspaceId:string, partnerId:string){
  const [partners]=await db.query<(RowDataPacket & {id:string;name:string;email:string|null;phone:string|null;telegram_chat_id:string|null;account_status:string})[]>(
    "SELECT id,name,email,phone,telegram_chat_id,account_status FROM partners WHERE id=? AND workspace_id=? LIMIT 1",[partnerId,workspaceId]);
  const partner=partners[0]; if(!partner) throw new Error("Partner not found.");
  const signals:Signal[]=[];
  const email=norm(partner.email), phone=norm(partner.phone), telegram=norm(partner.telegram_chat_id);

  if(email||phone||telegram){
    const [leads]=await db.query<(RowDataPacket & {id:string;name:string;email:string|null;phone:string|null;telegram_chat_id:string|null})[]>(
      "SELECT id,name,email,phone,telegram_chat_id FROM leads WHERE workspace_id=? AND ((?<>'' AND LOWER(TRIM(COALESCE(email,'')))=?) OR (?<>'' AND REPLACE(REPLACE(REPLACE(TRIM(COALESCE(phone,'')),' ',''),'-',''),'(', '')=?) OR (?<>'' AND TRIM(COALESCE(telegram_chat_id,''))=?)) LIMIT 20",
      [workspaceId,email,email,phone,phone,telegram,telegram]);
    for(const lead of leads){
      signals.push({code:"SELF_REFERRAL_MATCH",severity:"HIGH",score:75,summary:"Partner identity matches a lead.",explanation:"The partner email, phone, or Telegram identity matches a customer lead in the same business workspace. This is a review signal, not an automatic earnings reversal.",partnerId,leadId:lead.id,evidence:{leadId:lead.id,leadName:lead.name,matchedFields:[email&&norm(lead.email)===email?"email":null,phone&&norm(lead.phone)===phone?"phone":null,telegram&&norm(lead.telegram_chat_id)===telegram?"telegram":null].filter(Boolean)}});
    }
  }

  const [orders]=await db.query<(RowDataPacket & {id:string;order_number:string;customer_id:string|null;total:string;created_at:string})[]>(
    "SELECT id,order_number,customer_id,total,created_at FROM orders WHERE workspace_id=? AND partner_id=? ORDER BY created_at DESC LIMIT 50",[workspaceId,partnerId]);
  const customerIds=orders.map(o=>o.customer_id).filter(Boolean) as string[];
  if(customerIds.length>1){
    const [counts]=await db.query<(RowDataPacket & {customer_id:string;cnt:number})[]>(
      `SELECT customer_id,COUNT(*) cnt FROM orders WHERE workspace_id=? AND partner_id=? AND customer_id IS NOT NULL GROUP BY customer_id HAVING COUNT(*)>=3`,
      [workspaceId,partnerId]);
    for(const x of counts) signals.push({code:"REPEATED_CUSTOMER_ORDERS",severity:"MEDIUM",score:35,summary:"Partner has repeated orders for the same customer.",explanation:"Multiple orders for one customer may be legitimate repeat business or may require review for artificial activity.",partnerId,evidence:{customerId:x.customer_id,orderCount:x.cnt}});
  }

  const [clicks]=await db.query<(RowDataPacket & {ip_hash:string|null;cnt:number;partners:number})[]>(
    `SELECT rc.ip_hash,COUNT(*) cnt,COUNT(DISTINCT rl.partner_id) partners
     FROM referral_clicks rc JOIN referral_links rl ON rl.id=rc.referral_link_id
     WHERE rl.workspace_id=? AND rc.created_at>=DATE_SUB(NOW(),INTERVAL 24 HOUR) AND rc.ip_hash IS NOT NULL
     GROUP BY rc.ip_hash HAVING COUNT(DISTINCT rl.partner_id)>=3 AND COUNT(*)>=10 ORDER BY cnt DESC LIMIT 10`,
    [workspaceId]);
  for(const x of clicks) signals.push({code:"SHARED_TRAFFIC_CLUSTER",severity:"MEDIUM",score:30,summary:"High-volume referral traffic overlaps multiple partners.",explanation:"The same hashed network address generated substantial referral activity across multiple partners. Shared networks can be legitimate; review the surrounding evidence before taking action.",partnerId,evidence:{ipHash:x.ip_hash,clicks24h:x.cnt,partnerCount:x.partners}});

  return signals;
}

export async function persistRiskSignals(workspaceId:string, signals:Signal[]){
  const ids:string[]=[];
  for(const s of signals){
    const [existing]=await db.query<(RowDataPacket & {id:string})[]>(
      "SELECT id FROM partner_risk_signals WHERE workspace_id=? AND partner_id <=> ? AND lead_id <=> ? AND order_id <=> ? AND signal_code=? AND status IN ('OPEN','UNDER_REVIEW') LIMIT 1",
      [workspaceId,s.partnerId||null,s.leadId||null,s.orderId||null,s.code]);
    if(existing[0]){ids.push(existing[0].id);continue;}
    const id=randomUUID();
    await db.query("INSERT INTO partner_risk_signals (id,workspace_id,partner_id,lead_id,order_id,signal_code,severity,score,summary,explanation,evidence) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [id,workspaceId,s.partnerId||null,s.leadId||null,s.orderId||null,s.code,s.severity,s.score,s.summary,s.explanation,JSON.stringify(s.evidence)]);
    ids.push(id);
  }
  return ids;
}

export async function auditTrustEvent(input:{workspaceId:string;actor:string;action:string;entityType:string;entityId?:string|null;before?:unknown;after?:unknown;reason?:string}){
  await db.query("INSERT INTO trust_audit_events (id,workspace_id,actor,action,entity_type,entity_id,before_state,after_state,reason) VALUES (?,?,?,?,?,?,?,?,?)",
    [randomUUID(),input.workspaceId,input.actor,input.action,input.entityType,input.entityId||null,input.before?JSON.stringify(input.before):null,input.after?JSON.stringify(input.after):null,input.reason||null]);
}
