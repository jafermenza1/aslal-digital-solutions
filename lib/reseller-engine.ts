import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export type ResellerEligibility = {
  resellerId: string;
  partnerId: string;
  workspaceId: string;
  status: string;
};

export async function resolveActiveReseller(workspaceId: string, partnerId: string): Promise<ResellerEligibility | null> {
  const [rows] = await db.query<any[]>(
    "SELECT id,reseller_id,partner_id,workspace_id,status FROM resellers WHERE workspace_id=? AND partner_id=? AND status='ACTIVE' LIMIT 1",
    [workspaceId, partnerId],
  );
  const row = rows[0];
  return row ? { resellerId: row.id, partnerId: row.partner_id, workspaceId: row.workspace_id, status: row.status } : null;
}

export async function resolveResellerOffer(workspaceId: string, resellerId: string, offerId: string) {
  const [rows] = await db.query<any[]>(
    "SELECT id,reseller_id,workspace_id,status,currency,list_price,reseller_price,minimum_quantity,maximum_quantity,valid_from,valid_until,terms_snapshot FROM reseller_offers WHERE id=? AND reseller_id=? AND workspace_id=? LIMIT 1",
    [offerId, resellerId, workspaceId],
  );
  const offer = rows[0];
  if (!offer || offer.status !== "ACTIVE") return null;
  const now = Date.now();
  if (offer.valid_from && new Date(offer.valid_from).getTime() > now) return null;
  if (offer.valid_until && new Date(offer.valid_until).getTime() < now) return null;
  return offer;
}

export function calculateResellerAmounts(input: { listPrice: number; resellerPrice: number; quantity: number }) {
  if (!Number.isFinite(input.listPrice) || !Number.isFinite(input.resellerPrice) || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Invalid reseller pricing values.");
  }
  if (input.resellerPrice < 0 || input.listPrice < 0) throw new Error("Reseller prices cannot be negative.");
  const listAmount = input.listPrice * input.quantity;
  const resellerAmount = input.resellerPrice * input.quantity;
  return { listAmount, resellerAmount, marginAmount: listAmount - resellerAmount };
}

export function resellerOrderNumber() {
  return `RSO-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${randomUUID().slice(0,8).toUpperCase()}`;
}
