import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { randomUUID } from "node:crypto";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = await params;
  try {
    const b = await request.json();
    const access = await authorizeWorkspacePermission("commerce.manage", typeof b.workspaceId === "string" ? b.workspaceId : undefined);
    if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

    const paymentId = String(b.paymentId ?? "").trim();
    const requestedAmount = Number(b.amount);
    if (!paymentId || !Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json({ error: "A positive payment allocation amount is required." }, { status: 400 });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [invoices] = await conn.query<any[]>(
        `SELECT i.id,i.order_id,i.customer_id,i.workspace_id,i.currency,i.status,i.total,i.amount_paid,i.balance_due,
                o.workspace_id order_workspace_id,c.workspace_id customer_workspace_id
         FROM invoices i
         LEFT JOIN orders o ON o.id=i.order_id
         LEFT JOIN customers c ON c.id=i.customer_id
         WHERE i.id=? AND i.workspace_id=? FOR UPDATE`,
        [invoiceId, access.workspace.id],
      );
      const invoice = invoices[0];
      if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      if (invoice.order_workspace_id !== access.workspace.id || (invoice.customer_id && invoice.customer_workspace_id !== access.workspace.id)) {
        return NextResponse.json({ error: "Invoice references a record outside the active workspace." }, { status: 403 });
      }
      if (invoice.status === "VOID" || invoice.status === "PAID") {
        return NextResponse.json({ error: "This invoice cannot accept another payment." }, { status: 400 });
      }

      const [payments] = await conn.query<any[]>(
        `SELECT id,order_id,customer_id,workspace_id,currency,status,reconciliation_status,amount
         FROM payments WHERE id=? AND workspace_id=? FOR UPDATE`,
        [paymentId, access.workspace.id],
      );
      const payment = payments[0];
      if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
      if (payment.order_id !== invoice.order_id) return NextResponse.json({ error: "Payment does not belong to the invoice order." }, { status: 400 });
      if (payment.workspace_id !== invoice.workspace_id) return NextResponse.json({ error: "Payment belongs to a different workspace." }, { status: 403 });
      if (payment.customer_id && invoice.customer_id && payment.customer_id !== invoice.customer_id) {
        return NextResponse.json({ error: "Payment customer does not match invoice customer." }, { status: 400 });
      }
      if (payment.status !== "CONFIRMED" || payment.reconciliation_status !== "RECONCILED") {
        return NextResponse.json({ error: "Only confirmed and reconciled payments can be allocated to an invoice." }, { status: 400 });
      }
      if (payment.currency !== invoice.currency) return NextResponse.json({ error: "Payment currency does not match invoice currency." }, { status: 400 });

      const [existing] = await conn.query<any[]>(
        `SELECT id FROM invoice_payments WHERE invoice_id=? AND payment_id=? LIMIT 1`,
        [invoiceId, paymentId],
      );
      if (existing[0]) return NextResponse.json({ error: "This payment is already allocated to the invoice." }, { status: 409 });

      const [allocated] = await conn.query<any[]>(
        `SELECT COALESCE(SUM(ip.amount),0) allocated
         FROM invoice_payments ip
         INNER JOIN invoices i ON i.id=ip.invoice_id AND i.workspace_id=?
         WHERE ip.payment_id=?`,
        [access.workspace.id, paymentId],
      );
      const unallocated = Math.max(0, Number(payment.amount) - Number(allocated[0]?.allocated || 0));
      if (requestedAmount > unallocated + 0.0001) return NextResponse.json({ error: "Allocation exceeds the payment's unallocated amount." }, { status: 400 });
      if (requestedAmount > Number(invoice.balance_due) + 0.0001) return NextResponse.json({ error: "Allocation exceeds the invoice balance." }, { status: 400 });

      const newPaid = Number(invoice.amount_paid) + requestedAmount;
      const newBalance = Math.max(0, Number(invoice.total) - newPaid);
      const status = newBalance <= 0.0001 ? "PAID" : "PARTIALLY_PAID";

      await conn.query(
        `INSERT INTO invoice_payments (id,invoice_id,payment_id,amount,allocated_at,allocated_by) VALUES (?,?,?,?,NOW(),?)`,
        [randomUUID(), invoiceId, paymentId, requestedAmount, access.user.email],
      );
      await conn.query(
        `UPDATE invoices SET amount_paid=?,balance_due=?,status=?,paid_at=?,updated_at=NOW() WHERE id=? AND workspace_id=?`,
        [newPaid, newBalance, status, status === "PAID" ? new Date() : null, invoiceId, access.workspace.id],
      );
      await conn.query(
        `INSERT INTO user_audits (id,user_id,actor,action,reason,details,created_at)
         VALUES (UUID(),NULL,?,?,?,?,?,NOW())`,
        [access.user.email, "INVOICE_PAYMENT_ALLOCATED", "Reconciled payment allocated to invoice.",
          JSON.stringify({ invoiceId, paymentId, amount: requestedAmount, newPaid, newBalance, status, workspaceId: access.workspace.id })],
      );

      await conn.commit();
      return NextResponse.json({ ok: true, invoiceId, paymentId, amount: requestedAmount, status, amountPaid: newPaid, balanceDue: newBalance });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("INVOICE_PAYMENT_ALLOCATION_ERROR", error);
    return NextResponse.json({ error: "Could not allocate payment to invoice." }, { status: 500 });
  }
}
