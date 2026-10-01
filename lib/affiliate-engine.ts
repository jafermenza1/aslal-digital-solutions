import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export type AffiliateAttributionPolicy =
  | "LAST_CLICK" | "FIRST_CLICK" | "LEAD_REGISTRATION" | "DEAL_REGISTRATION" | "PROMO_CODE" | "MANUAL_APPROVAL";

export type AffiliateAttribution = {
  referralCode: string;
  referralLinkId: string;
  partnerId: string;
  campaignId: string | null;
  programId: string | null;
  termsId: string | null;
  contractId: string | null;
  policy: AffiliateAttributionPolicy;
  attributionWindowDays: number;
  matchedAt: Date;
  reason: "DIRECT_REFERRAL" | "FIRST_CLICK" | "LAST_CLICK" | "LEAD_REGISTRATION" | "DEAL_REGISTRATION" | "PROMO_CODE";
};

type LinkRow = RowDataPacket & {
  referral_link_id: string;
  code: string;
  partner_id: string;
  campaign_id: string | null;
  program_id: string | null;
  terms_id: string | null;
  contract_id: string | null;
  attribution_policy: string | null;
  attribution_window_days: number | null;
  program_status: string | null;
};

function normalizePolicy(value: unknown): AffiliateAttributionPolicy {
  const p = String(value || "LAST_CLICK").toUpperCase();
  return ["LAST_CLICK","FIRST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"].includes(p)
    ? p as AffiliateAttributionPolicy
    : "LAST_CLICK";
}

async function getLink(workspaceId: string, code: string): Promise<LinkRow | null> {
  const [rows] = await db.query<LinkRow[]>(`
    SELECT rl.id referral_link_id, rl.code, rl.partner_id, rl.campaign_id,
           pc.program_id, pt.id terms_id, cc.id contract_id,
           pt.attribution_policy, pt.attribution_window_days, pp.status program_status
    FROM referral_links rl
    INNER JOIN partners p ON p.id=rl.partner_id
    LEFT JOIN partner_campaigns pc ON pc.id=rl.campaign_id AND pc.workspace_id=rl.workspace_id
    LEFT JOIN partner_programs pp ON pp.id=pc.program_id AND pp.workspace_id=rl.workspace_id
    LEFT JOIN program_terms pt ON pt.program_id=pc.program_id AND pt.active=1
    LEFT JOIN commission_contracts cc ON cc.program_id=pc.program_id AND cc.partner_id=rl.partner_id AND cc.status='ACTIVE'
    WHERE rl.workspace_id=? AND rl.code=? AND p.account_status='ACTIVE'
    LIMIT 1
  `, [workspaceId, code]);
  return rows[0] || null;
}

function validLink(link: LinkRow | null): link is LinkRow {
  return Boolean(link && (!link.program_id || (link.program_status === "PUBLISHED" && link.contract_id)));
}

export async function resolveAffiliateAttribution(input: {
  workspaceId: string;
  referralCode?: string | null;
  occurredAt?: Date;
  policyOverride?: AffiliateAttributionPolicy;
}): Promise<AffiliateAttribution | null> {
  const code = String(input.referralCode || "").trim();
  if (!code) return null;
  const at = input.occurredAt || new Date();
  const link = await getLink(input.workspaceId, code);
  if (!validLink(link)) return null;

  const policy = input.policyOverride || normalizePolicy(link.attribution_policy);
  const windowDays = Math.max(0, Number(link.attribution_window_days ?? 30));

  if (policy === "FIRST_CLICK" || policy === "LAST_CLICK") {
    const order = policy === "FIRST_CLICK" ? "ASC" : "DESC";
    const [clicks] = await db.query<RowDataPacket[]>(`
      SELECT created_at FROM referral_clicks
      WHERE referral_link_id=? AND created_at<=? AND created_at>=DATE_SUB(?,INTERVAL ? DAY)
      ORDER BY created_at ${order}, id ${order} LIMIT 1
    `, [link.referral_link_id, at, at, windowDays]);
    if (!clicks[0]) return null;
    return {
      referralCode: link.code, referralLinkId: link.referral_link_id, partnerId: link.partner_id,
      campaignId: link.campaign_id || null, programId: link.program_id || null, termsId: link.terms_id || null,
      contractId: link.contract_id || null, policy, attributionWindowDays: windowDays,
      matchedAt: new Date(clicks[0].created_at),
      reason: policy === "FIRST_CLICK" ? "FIRST_CLICK" : "LAST_CLICK",
    };
  }

  const reason = policy === "LEAD_REGISTRATION" ? "LEAD_REGISTRATION"
    : policy === "DEAL_REGISTRATION" ? "DEAL_REGISTRATION"
    : policy === "PROMO_CODE" ? "PROMO_CODE" : "DIRECT_REFERRAL";

  return {
    referralCode: link.code, referralLinkId: link.referral_link_id, partnerId: link.partner_id,
    campaignId: link.campaign_id || null, programId: link.program_id || null, termsId: link.terms_id || null,
    contractId: link.contract_id || null, policy, attributionWindowDays: windowDays,
    matchedAt: at, reason,
  };
}

/**
 * Resolves a lead against the actual referral-click history, rather than trusting
 * the browser's current referral cookie. For program-linked referrals, competing
 * clicks are compared only within the same program so the program's published
 * attribution policy determines the winner.
 */
export async function resolveAffiliateAttributionForLead(input: {
  workspaceId: string;
  leadId: string;
  occurredAt?: Date;
  referralCode?: string | null;
  promoCode?: string | null;
}): Promise<AffiliateAttribution | null> {
  const at = input.occurredAt || new Date();
  const preferredCode = String(input.promoCode || input.referralCode || "").trim();
  const preferred = preferredCode ? await getLink(input.workspaceId, preferredCode) : null;
  if (preferred && !validLink(preferred)) return null;

  const [leads] = await db.query<RowDataPacket[]>(
    "SELECT visitor_id, referral_code FROM leads WHERE id=? AND workspace_id=? LIMIT 1",
    [input.leadId, input.workspaceId],
  );
  const visitorId = leads[0]?.visitor_id;
  if (!visitorId) return preferred ? resolveAffiliateAttribution({
    workspaceId: input.workspaceId, referralCode: preferred.code, occurredAt: at,
    policyOverride: input.promoCode ? "PROMO_CODE" : undefined,
  }) : null;

  const programClause = preferred?.program_id ? " AND pc.program_id=?" : "";
  const params: unknown[] = [visitorId, input.workspaceId, at];
  if (preferred?.program_id) params.push(preferred.program_id);

  const [clicks] = await db.query<RowDataPacket[]>(`
    SELECT rc.created_at, rl.id referral_link_id, rl.code, rl.partner_id, rl.campaign_id,
           pc.program_id, pt.id terms_id, cc.id contract_id,
           pt.attribution_policy, pt.attribution_window_days, pp.status program_status
    FROM referral_clicks rc
    INNER JOIN referral_links rl ON rl.id=rc.referral_link_id AND rl.workspace_id=?
    INNER JOIN partners p ON p.id=rl.partner_id AND p.account_status='ACTIVE'
    LEFT JOIN partner_campaigns pc ON pc.id=rl.campaign_id AND pc.workspace_id=rl.workspace_id
    LEFT JOIN partner_programs pp ON pp.id=pc.program_id AND pp.workspace_id=rl.workspace_id
    LEFT JOIN program_terms pt ON pt.program_id=pc.program_id AND pt.active=1
    LEFT JOIN commission_contracts cc ON cc.program_id=pc.program_id AND cc.partner_id=rl.partner_id AND cc.status='ACTIVE'
    WHERE rc.visitor_id=? AND rc.created_at<=? ${programClause}
      AND (pc.program_id IS NULL OR (pp.status='PUBLISHED' AND cc.id IS NOT NULL))
    ORDER BY rc.created_at ASC, rc.id ASC
  `, [input.workspaceId, input.workspaceId, visitorId, at, ...(preferred?.program_id ? [preferred.program_id] : [])]);

  if (!clicks.length) return preferred ? resolveAffiliateAttribution({
    workspaceId: input.workspaceId, referralCode: preferred.code, occurredAt: at,
    policyOverride: input.promoCode ? "PROMO_CODE" : undefined,
  }) : null;

  const policy = normalizePolicy(preferred?.attribution_policy || clicks[clicks.length - 1].attribution_policy);
  if (policy === "LEAD_REGISTRATION" || policy === "DEAL_REGISTRATION") {
    const [locked] = await db.query<RowDataPacket[]>(
      `SELECT la.referral_code,la.referral_link_id,la.partner_id,la.campaign_id,la.created_at,
              rl.campaign_id link_campaign_id, pc.program_id, pt.id terms_id, cc.id contract_id
       FROM lead_attributions la
       INNER JOIN referral_links rl ON rl.id=la.referral_link_id AND rl.workspace_id=la.workspace_id
       LEFT JOIN partner_campaigns pc ON pc.id=rl.campaign_id AND pc.workspace_id=rl.workspace_id
       LEFT JOIN program_terms pt ON pt.program_id=pc.program_id AND pt.active=1
       LEFT JOIN commission_contracts cc ON cc.program_id=pc.program_id AND cc.partner_id=la.partner_id AND cc.status='ACTIVE'
       WHERE la.lead_id=? AND la.workspace_id=? AND la.partner_id IS NOT NULL
       ORDER BY la.created_at DESC LIMIT 1`,
      [input.leadId, input.workspaceId],
    );
    const row = locked[0];
    if (row) return {
      referralCode: row.referral_code, referralLinkId: row.referral_link_id, partnerId: row.partner_id,
      campaignId: row.campaign_id || row.link_campaign_id || null, programId: row.program_id || null,
      termsId: row.terms_id || null, contractId: row.contract_id || null, policy,
      attributionWindowDays: Math.max(0, Number(preferred?.attribution_window_days ?? 30)),
      matchedAt: new Date(row.created_at), reason: policy,
    };
  }
  if (input.promoCode && preferred && preferred.code === input.promoCode) {
    return {
      referralCode: preferred.code, referralLinkId: preferred.referral_link_id, partnerId: preferred.partner_id,
      campaignId: preferred.campaign_id || null, programId: preferred.program_id || null, termsId: preferred.terms_id || null,
      contractId: preferred.contract_id || null, policy: "PROMO_CODE",
      attributionWindowDays: Math.max(0, Number(preferred.attribution_window_days ?? 30)),
      matchedAt: at, reason: "PROMO_CODE",
    };
  }

  const windowDays = Math.max(0, Number(preferred?.attribution_window_days ?? clicks[clicks.length - 1].attribution_window_days ?? 30));
  const minTime = at.getTime() - windowDays * 86400000;
  const eligible = clicks.filter(c => new Date(c.created_at).getTime() >= minTime);
  if (!eligible.length) return null;

  const chosen = policy === "FIRST_CLICK" ? eligible[0] : eligible[eligible.length - 1];
  const reason = policy === "FIRST_CLICK" ? "FIRST_CLICK" : "LAST_CLICK";

  return {
    referralCode: chosen.code, referralLinkId: chosen.referral_link_id, partnerId: chosen.partner_id,
    campaignId: chosen.campaign_id || null, programId: chosen.program_id || null, termsId: chosen.terms_id || null,
    contractId: chosen.contract_id || null, policy, attributionWindowDays: windowDays,
    matchedAt: new Date(chosen.created_at), reason,
  };
}

export async function resolveAffiliateAttributionForOrder(input: {
  workspaceId: string;
  orderId: string;
  occurredAt?: Date;
  promoCode?: string | null;
}): Promise<AffiliateAttribution | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT o.referral_code, o.opportunity_id, opp.lead_id
     FROM orders o LEFT JOIN opportunities opp ON opp.id=o.opportunity_id AND opp.workspace_id=o.workspace_id
     WHERE o.id=? AND o.workspace_id=? LIMIT 1`,
    [input.orderId, input.workspaceId],
  );
  const row = rows[0];
  if (!row) return null;
  return resolveAffiliateAttributionForLead({
    workspaceId: input.workspaceId,
    leadId: row.lead_id || "",
    referralCode: row.referral_code,
    promoCode: input.promoCode,
    occurredAt: input.occurredAt,
  });
}


export async function applyLeadAffiliateAttribution(input: {
  workspaceId: string;
  leadId: string;
  referralCode?: string | null;
  promoCode?: string | null;
  occurredAt?: Date;
}) {
  const attribution = await resolveAffiliateAttributionForLead(input);
  if (!attribution) return null;
  const expiresAt = new Date(attribution.matchedAt.getTime() + attribution.attributionWindowDays * 86400000);
  await db.query(
    `UPDATE leads SET referral_code=?, attribution_locked_at=?, attribution_locked_by='affiliate-engine',
       attribution_expires_at=? WHERE id=? AND workspace_id=?`,
    [attribution.referralCode, new Date(), expiresAt, input.leadId, input.workspaceId],
  );
  await db.query(
    `UPDATE lead_attributions SET is_first_touch=FALSE,is_last_touch=FALSE WHERE lead_id=? AND workspace_id=?`,
    [input.leadId, input.workspaceId],
  );
  await db.query(
    `INSERT INTO lead_attributions
      (id,workspace_id,lead_id,attribution_type,source,medium,campaign,referral_code,referral_link_id,partner_id,campaign_id,is_first_touch,is_last_touch)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [randomUUID(), input.workspaceId, input.leadId, "PARTNER", "partner", "referral",
      attribution.referralCode, attribution.referralCode, attribution.referralLinkId, attribution.partnerId,
      attribution.campaignId, attribution.reason === "FIRST_CLICK", attribution.reason === "LAST_CLICK"],
  );
  return attribution;
}
