import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

const transitions: Record<string, string[]> = {
  PENDING: ["QUALIFIED", "VOID"],
  QUALIFIED: ["APPROVED", "VOID"],
  APPROVED: ["PAYABLE", "VOID"],
  PAYABLE: ["PAID", "VOID"],
  PAID: [],
  VOID: [],
};

type CommissionStatusRow = RowDataPacket & { status: string; revenue_id: string | null; revenue_status: string | null; reconciliation_status: string | null; };


async function authorized() {
  return Boolean(verifySession((await cookies()).get("aslal_session")?.value));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid commission ID." }, { status: 400 });

  try {
    const body = await request.json();
    const nextStatus = String(body.status ?? "").trim().toUpperCase();
    if (!["PENDING", "QUALIFIED", "APPROVED", "PAYABLE", "PAID", "VOID"].includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid commission status." }, { status: 400 });
    }

    const [rows] = await db.query<CommissionStatusRow[]>(`SELECT c.status,c.revenue_id,r.status revenue_status,p.reconciliation_status FROM commissions c LEFT JOIN revenues r ON r.id=c.revenue_id LEFT JOIN payments p ON p.id=c.payment_id WHERE c.id=? LIMIT 1`, [id]);
    const current = rows[0]?.status;
    if (!current) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
    if (!transitions[current]?.includes(nextStatus)) {
      return NextResponse.json({ error: `Cannot move commission from ${current} to ${nextStatus}.` }, { status: 409 });
    }
    if (["APPROVED", "PAYABLE", "PAID"].includes(nextStatus) && (rows[0]?.revenue_status !== "RECOGNIZED" || rows[0]?.reconciliation_status !== "RECONCILED")) {
      return NextResponse.json({ error: "Commission can only advance after the linked payment is reconciled and revenue is recognized." }, { status: 409 });
    }

    await db.query(`UPDATE commissions SET status=? WHERE id=?`, [nextStatus, id]);
    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    console.error("COMMISSION_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Could not update commission." }, { status: 500 });
  }
}
