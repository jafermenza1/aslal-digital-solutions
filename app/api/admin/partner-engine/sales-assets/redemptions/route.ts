import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

function clean(value: unknown, max = 500) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function parseInput(body: any) {
  const raw = clean(body?.value ?? body?.code ?? body?.serialNumber ?? body?.qrPayload, 500);
  const prefix = "ASLAL:ASSET:";
  if (raw.toUpperCase().startsWith(prefix)) return { raw, serial: raw.slice(prefix.length).trim(), method: "QR" as const };
  return { raw, serial: raw, method: "SERIAL" as const };
}

export async function GET(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage", new URL(request.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT r.id,r.serial_number,r.redeemed_at,r.redeemed_by,r.redemption_method,r.holder_name,r.holder_phone,r.asset_status_before,a.name asset_name,a.asset_type,a.currency,p.name partner_name,p.partner_number,o.order_number,o.id order_id FROM issued_sales_asset_redemptions r JOIN commercial_distribution_items a ON a.id=r.asset_id AND a.workspace_id=r.workspace_id JOIN partners p ON p.id=r.partner_id AND p.workspace_id=r.workspace_id LEFT JOIN orders o ON o.id=r.order_id AND o.workspace_id=r.workspace_id WHERE r.workspace_id=? ORDER BY r.redeemed_at DESC LIMIT 250`, [access.workspace.id]);
  return NextResponse.json({ redemptions: rows });
}

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage", new URL(request.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const { raw, serial, method } = parseInput(body);
  if (!serial) return NextResponse.json({ error: "Enter or scan a QR payload or asset serial number." }, { status: 400 });
  const now = new Date();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRawUnsafe<any[]>(`SELECT i.*,a.name asset_name,a.asset_type,a.status asset_definition_status,a.currency,p.name partner_name,p.partner_number,o.id order_id,o.order_number FROM issued_sales_assets i JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id JOIN partners p ON p.id=i.partner_id AND p.workspace_id=i.workspace_id LEFT JOIN orders o ON o.distribution_asset_id=i.asset_id AND o.workspace_id=i.workspace_id AND o.source='partner_sales_asset' WHERE i.workspace_id=? AND i.serial_number=? LIMIT 1 FOR UPDATE`, [access.workspace.id, serial]);
      const item = rows[0];
      if (!item) throw Object.assign(new Error("Asset not found in this workspace."), { status: 404 });
      if (item.status === "REDEEMED") {
        const history = await tx.$queryRawUnsafe<any[]>("SELECT id,serial_number,redeemed_at,redeemed_by,redemption_method,holder_name,holder_phone FROM issued_sales_asset_redemptions WHERE issued_asset_id=? LIMIT 1", [item.id]);
        return { alreadyRedeemed: true, item, history: history[0] || null };
      }
      if (item.status === "VOID") throw Object.assign(new Error("This asset has been voided and cannot be redeemed."), { status: 409 });
      if (item.status === "EXPIRED") throw Object.assign(new Error("This asset has expired and cannot be redeemed."), { status: 409 });
      if (item.status !== "VALID") throw Object.assign(new Error("This asset is not in a redeemable state."), { status: 409 });
      if (item.asset_definition_status !== "ACTIVE") throw Object.assign(new Error("The underlying sales asset is no longer active."), { status: 409 });
      if (item.valid_from && new Date(item.valid_from) > now) throw Object.assign(new Error("This asset is not valid yet."), { status: 409 });
      if (item.valid_until && new Date(item.valid_until) < now) { await tx.$executeRawUnsafe("UPDATE issued_sales_assets SET status='EXPIRED' WHERE id=? AND status='VALID'", [item.id]); throw Object.assign(new Error("This asset has expired and cannot be redeemed."), { status: 409 }); }
      const redemptionId = randomUUID();
      await tx.$executeRawUnsafe("INSERT INTO issued_sales_asset_redemptions (id,workspace_id,issued_asset_id,serial_number,asset_id,allocation_id,partner_id,order_id,redeemed_by,redeemed_at,redemption_method,verification_payload,holder_name,holder_phone,asset_status_before,valid_from,valid_until) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [redemptionId,access.workspace.id,item.id,item.serial_number,item.asset_id,item.allocation_id,item.partner_id,item.order_id || null,access.user.email,now,method,raw || item.qr_payload,item.holder_name || null,item.holder_phone || null,item.status,item.valid_from || null,item.valid_until || null]);
      await tx.$executeRawUnsafe("UPDATE issued_sales_assets SET status='REDEEMED',redeemed_at=?,redeemed_by=? WHERE id=? AND workspace_id=? AND status='VALID'", [now,access.user.email,item.id,access.workspace.id]);
      return { alreadyRedeemed: false, item, history: { id:redemptionId,serial_number:item.serial_number,redeemed_at:now,redeemed_by:access.user.email,redemption_method:method,holder_name:item.holder_name,holder_phone:item.holder_phone } };
    });
    return NextResponse.json({ ok:true, alreadyRedeemed:result.alreadyRedeemed, status:result.alreadyRedeemed ? "ALREADY_REDEEMED" : "REDEEMED", asset:result.item, redemption:result.history }, { status:result.alreadyRedeemed ? 200 : 201 });
  } catch (error: any) { return NextResponse.json({ error:error instanceof Error ? error.message : "Could not redeem asset." }, { status:Number(error?.status)||409 }); }
}