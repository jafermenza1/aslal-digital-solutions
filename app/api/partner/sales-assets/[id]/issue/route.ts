import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const holderName = String(body.holderName ?? "").trim();
  const holderPhone = String(body.holderPhone ?? "").trim();
  const holderEmail = String(body.holderEmail ?? "").trim().toLowerCase();
  if (!holderName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
  if (!holderPhone && !holderEmail) return NextResponse.json({ error: "Customer phone or email is required." }, { status: 400 });
  if (holderEmail && !/^\S+@\S+\.\S+$/.test(holderEmail)) return NextResponse.json({ error: "Customer email is invalid." }, { status: 400 });

  const [u] = await prisma.$queryRawUnsafe<Array<{ partner_id: string | null }>>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`, user.id);
  const partnerId = u?.partner_id;
  if (!partnerId) return NextResponse.json({ error: "Partner account is not linked." }, { status: 409 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const allocation = await tx.partnerSalesAssetAllocation.findFirst({ where: { id, partnerId, status: "ACTIVE" } });
      if (!allocation) throw new Error("Active sales asset allocation not found.");
      const asset = await tx.commercialDistributionItem.findUnique({ where: { id: allocation.assetId } });
      if (!asset) throw new Error("Sales asset not found.");
      if (asset.status !== "ACTIVE") throw new Error("Sales asset is not active.");
      if (allocation.endsAt && allocation.endsAt < new Date()) throw new Error("Allocation has expired.");
      if (allocation.quantityIssued >= allocation.quantityAllocated) throw new Error("No allocated inventory remains.");
      if (asset.inventoryLimit !== null) {
        const issued = await tx.issuedSalesAsset.count({ where: { assetId: allocation.assetId, status: { notIn: ["VOID", "EXPIRED"] } } });
        if (issued >= asset.inventoryLimit) throw new Error("Asset inventory limit has been reached.");
      }

      let customer = holderPhone
        ? await tx.customer.findFirst({ where: { workspaceId: allocation.workspaceId, phone: holderPhone }, orderBy: { createdAt: "asc" } })
        : null;
      if (!customer && holderEmail) {
        customer = await tx.customer.findFirst({ where: { workspaceId: allocation.workspaceId, email: holderEmail }, orderBy: { createdAt: "asc" } });
      }
      if (customer) {
        customer = await tx.customer.update({ where: { id: customer.id }, data: { name: holderName, email: holderEmail || customer.email, phone: holderPhone || customer.phone, status: "ACTIVE" } });
      } else {
        customer = await tx.customer.create({ data: { id: randomUUID(), workspaceId: allocation.workspaceId, name: holderName, email: holderEmail || null, phone: holderPhone || null, status: "ACTIVE" } });
      }

      const serial = `ASL-${new Date().getFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
      const issued = await tx.issuedSalesAsset.create({
        data: {
          id: randomUUID(), workspaceId: allocation.workspaceId, assetId: allocation.assetId, allocationId: allocation.id,
          partnerId, serialNumber: serial, qrPayload: `ASLAL:ASSET:${serial}`, holderName, holderPhone: holderPhone || null,
          issuedPrice: asset.price, issuedValue: asset.value, status: "VALID",
          validFrom: asset.startsAt || new Date(), validUntil: asset.endsAt, issuedBy: user.email,
        },
      });

      const total = Number(asset.price ?? asset.value ?? 0);
      const order = await tx.order.create({
        data: {
          id: randomUUID(),
          workspaceId: allocation.workspaceId,
          orderNumber: `SO-ASSET-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
          status: "CONFIRMED", currency: asset.currency, subtotal: total, discount: 0, total,
          paymentState: "PENDING", fulfillmentState: "ISSUED", source: "partner_sales_asset",
          campaign: allocation.campaignId || undefined, partnerId, distributionAssetId: allocation.assetId,
          customerId: customer.id, salesOwnerEmail: user.email, confirmedAt: new Date(),
          items: { create: { id: randomUUID(), description: asset.name, quantity: 1, unitPrice: total, lineTotal: total } },
        },
      });

      await tx.partnerSalesAssetAllocation.update({ where: { id: allocation.id }, data: { quantityIssued: { increment: 1 } } });
      return { issued, order, customer };
    });
    return NextResponse.json({ ok: true, issued: result.issued, order: result.order, customer: result.customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not record partner sale." }, { status: 409 });
  }
}
