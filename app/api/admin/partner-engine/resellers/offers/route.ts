import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId") || undefined;
  const access = await authorizeWorkspacePermission("partners.manage", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const [rows] = await db.query<any[]>(
    "SELECT o.*,r.partner_id,r.reseller_number,r.business_name FROM reseller_offers o JOIN resellers r ON r.id=o.reseller_id WHERE o.workspace_id=? ORDER BY o.created_at DESC",
    [access.workspace.id],
  );
  return NextResponse.json({ offers: rows });
}

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const b = await request.json();
    const resellerId = String(b.resellerId || "").trim();
    const name = String(b.name || "").trim().slice(0,190);
    const productId = String(b.productId || "").trim() || null;
    const campaignId = String(b.campaignId || "").trim() || null;
    const currency = String(b.currency || "ETB").trim().toUpperCase().slice(0,10);
    const listPrice = Number(b.listPrice);
    const resellerPrice = Number(b.resellerPrice);
    const minimumQuantity = Number(b.minimumQuantity ?? 1);
    const maximumQuantity = b.maximumQuantity === undefined || b.maximumQuantity === null || b.maximumQuantity === "" ? null : Number(b.maximumQuantity);
    if (!resellerId || !name || !Number.isFinite(listPrice) || !Number.isFinite(resellerPrice) || listPrice < 0 || resellerPrice < 0 || resellerPrice > listPrice) {
      return NextResponse.json({ error: "Valid reseller, name, list price and reseller price are required; reseller price cannot exceed list price." }, { status: 400 });
    }
    if (!Number.isFinite(minimumQuantity) || minimumQuantity <= 0 || (maximumQuantity !== null && (!Number.isFinite(maximumQuantity) || maximumQuantity < minimumQuantity))) {
      return NextResponse.json({ error: "Invalid quantity limits." }, { status: 400 });
    }
    const [resellers] = await db.query<any[]>("SELECT id,partner_id,status,workspace_id FROM resellers WHERE id=? AND workspace_id=? LIMIT 1",[resellerId,access.workspace.id]);
    if (!resellers[0]) return NextResponse.json({ error: "Reseller not found." }, { status: 404 });
    const [result] = await db.query<any>(
      "INSERT INTO reseller_offers (id,workspace_id,reseller_id,product_id,campaign_id,name,status,currency,list_price,reseller_price,minimum_quantity,maximum_quantity,terms_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [randomUUID(),access.workspace.id,resellerId,productId,campaignId,name,"ACTIVE",currency,listPrice,resellerPrice,minimumQuantity,maximumQuantity,JSON.stringify({listPrice,resellerPrice,currency})],
    );
    return NextResponse.json({ ok: true, offerId: result.insertId || null }, { status: 201 });
  } catch (e) {
    console.error("RESELLER_OFFER_CREATE_ERROR",e);
    return NextResponse.json({ error: "Could not create reseller offer." }, { status: 500 });
  }
}
