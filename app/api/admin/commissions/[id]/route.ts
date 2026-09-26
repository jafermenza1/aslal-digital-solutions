import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const transitions: Record<string, string[]> = {
  PENDING: ["QUALIFIED", "VOID"],
  QUALIFIED: ["APPROVED", "VOID"],
  APPROVED: ["PAYABLE", "VOID"],
  PAYABLE: ["VOID"],
  PAID: [],
  VOID: [],
};

type CommissionStatusRow = RowDataPacket & {
  status: string;
  revenue_id: string | null;
  revenue_status: string | null;
  reconciliation_status: string | null;
  payment_status: string | null;
  payment_workspace_id: string | null;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeWorkspacePermission("commissions.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = access;

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid commission ID." }, { status: 400 });

  try {
    const body = await request.json();
    const nextStatus = String(body.status ?? "").trim().toUpperCase();
    if (!["PENDING", "QUALIFIED", "APPROVED", "PAYABLE", "PAID", "VOID"].includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid commission status." }, { status: 400 });
    }
    if (nextStatus === "PAID") {
      return NextResponse.json({ error: "Commission becomes PAID only when its workspace-scoped payout batch settles it." }, { status: 409 });
    }

    const [rows] = await db.query<CommissionStatusRow[]>(
      `SELECT c.status,c.revenue_id,r.status revenue_status,p.reconciliation_status,p.status payment_status,p.workspace_id payment_workspace_id
       FROM commissions c
       LEFT JOIN revenues r ON r.id=c.revenue_id AND r.workspace_id=c.workspace_id
       LEFT JOIN payments p ON p.id=c.payment_id AND p.workspace_id=c.workspace_id
       WHERE c.id=? AND c.workspace_id=? LIMIT 1`,
      [id, workspace.id],
    );
    const current = rows[0]?.status;
    if (!current) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
    if (!transitions[current]?.includes(nextStatus)) {
      return NextResponse.json({ error: `Cannot move commission from ${current} to ${nextStatus}.` }, { status: 409 });
    }

    const paymentCleared =
      rows[0]?.revenue_status === "RECOGNIZED" &&
      rows[0]?.reconciliation_status === "RECONCILED" &&
      rows[0]?.payment_status === "CONFIRMED" &&
      rows[0]?.payment_workspace_id === workspace.id;

    if (nextStatus === "QUALIFIED" && !paymentCleared) {
      return NextResponse.json({ error: "Commission can only become QUALIFIED after the linked payment is confirmed, reconciled, and revenue is recognized." }, { status: 409 });
    }
    if (["APPROVED", "PAYABLE"].includes(nextStatus) && !paymentCleared) {
      return NextResponse.json({ error: "Commission can only advance after the linked payment is confirmed, reconciled, and revenue is recognized." }, { status: 409 });
    }

    await db.query(`UPDATE commissions SET status=? WHERE id=? AND workspace_id=?`, [nextStatus, id, workspace.id]);
    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    console.error("COMMISSION_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Could not update commission." }, { status: 500 });
  }
}
