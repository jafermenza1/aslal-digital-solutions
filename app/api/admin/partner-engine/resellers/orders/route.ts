import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { calculateResellerAmounts, resolveActiveReseller, resolveResellerOffer, resellerOrderNumber } from "@/lib/reseller-engine";

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const b = await request.json();
    const orderId = String(b.orderId || "").trim();
    const partnerId = String(b.partnerId || "").trim();
    const offerId = String(b.offerId || "").trim();
    const quantity = Number(b.quantity ?? 1);
    const requestedDiscount = Number(b.discountAmount ?? 0);
    const loc=b.customerLocation&&typeof b.customerLocation==="object"?b.customerLocation:{};
    if (!orderId || !partnerId || !offerId || !Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "orderId, partnerId, offerId and a positive quantity are required." }, { status: 400 });
    }
    const [orders] = await db.query<any[]>("SELECT id,workspace_id,total,currency,partner_id FROM orders WHERE id=? AND workspace_id=? LIMIT 1",[orderId,access.workspace.id]);
    const order = orders[0];
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const reseller = await resolveActiveReseller(access.workspace.id,partnerId);
    if (!reseller) return NextResponse.json({ error: "The partner is not an active reseller." }, { status: 409 });
    const offer = await resolveResellerOffer(access.workspace.id,reseller.resellerId,offerId);
    if (!offer) return NextResponse.json({ error: "Reseller offer is not active or is outside its validity window." }, { status: 409 });
    if (offer.agreement_id) {
      const [territories] = await db.query<any[]>("SELECT country,region,city,district,allowed FROM reseller_territories WHERE agreement_id=?",[offer.agreement_id]);
      if (territories.length) { const matches=territories.filter(t=>(!t.country||t.country===String(loc.country||""))&&(!t.region||t.region===String(loc.region||""))&&(!t.city||t.city===String(loc.city||""))&&(!t.district||t.district===String(loc.district||""))); if (!matches.some(t=>t.allowed)) return NextResponse.json({error:"Customer location is outside the reseller agreement territory."},{status:409}); }
    }
    if (quantity < Number(offer.minimum_quantity) || (offer.maximum_quantity !== null && quantity > Number(offer.maximum_quantity))) {
      return NextResponse.json({ error: "Quantity is outside the reseller offer limits." }, { status: 409 });
    }
    const amounts = calculateResellerAmounts({listPrice:Number(offer.list_price),resellerPrice:Number(offer.reseller_price),quantity});
    const permittedDiscount = amounts.listAmount * Number(offer.permitted_discount_percent || 0) / 100;
    if (!Number.isFinite(requestedDiscount) || requestedDiscount < 0 || requestedDiscount > permittedDiscount + 0.01) return NextResponse.json({ error: "Requested discount exceeds the reseller agreement limit." }, { status: 409 });
    const finalResellerAmount = amounts.resellerAmount - requestedDiscount;
    if (Math.abs(Number(order.total)-finalResellerAmount) > 0.01) {
      return NextResponse.json({ error: "Order total does not match the selected reseller price. Reseller pricing must be explicit and auditable." }, { status: 409 });
    }
    if (order.partner_id && order.partner_id !== partnerId) return NextResponse.json({ error: "Order already belongs to another partner." }, { status: 409 });
    const [existing] = await db.query<any[]>("SELECT id FROM reseller_orders WHERE order_id=? LIMIT 1",[orderId]);
    if (existing[0]) return NextResponse.json({ error: "Order already has a reseller trace." }, { status: 409 });
    const id = randomUUID();
    const number = resellerOrderNumber();
    await db.query("START TRANSACTION");
    try {
      await db.query("UPDATE orders SET partner_id=? WHERE id=? AND workspace_id=?",[partnerId,orderId,access.workspace.id]);
      await db.query(
        "INSERT INTO reseller_orders (id,workspace_id,reseller_id,order_id,offer_id,agreement_id,reseller_order_number,currency,quantity,list_amount,reseller_amount,margin_amount,permitted_discount_amount,applied_discount_amount,customer_ownership,fulfillment_responsibility,return_responsibility,status,terms_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [id,access.workspace.id,reseller.resellerId,orderId,offer.id,offer.agreement_id,number,offer.currency,quantity,amounts.listAmount,finalResellerAmount,amounts.listAmount-finalResellerAmount,permittedDiscount,requestedDiscount,offer.customer_ownership,offer.fulfillment_responsibility,offer.return_responsibility,"REGISTERED",offer.terms_snapshot || null],
      );
      await db.query("COMMIT");
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
    return NextResponse.json({ ok:true,resellerOrder:{id,resellerOrderNumber:number,resellerId:reseller.resellerId,orderId,offerId:offer.id,...amounts,finalResellerAmount,permittedDiscount,requestedDiscount} },{status:201});
  } catch(e) {
    console.error("RESELLER_ORDER_ATTACH_ERROR",e);
    return NextResponse.json({error:"Could not attach reseller order."},{status:500});
  }
}
