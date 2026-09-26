import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";

const TOTAL = 100;
const PREFIX = "ASL-P-";

function partnerNumber(index: number) {
  return PREFIX + String(index).padStart(4, "0");
}

function referralCode(index: number) {
  return "q1-agent-" + String(index).padStart(3, "0");
}

export async function POST(request: Request) {
  const actor = await authorizePermission("partners.manage");
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const workspace = await getWorkspaceForUser(actor, String(body.workspaceId || "").trim() || undefined);
    if (!workspace) {
      return NextResponse.json({ error: "Select a workspace you are authorized to manage." }, { status: 403 });
    }

    const requestedCount = body.count === undefined ? TOTAL : Number(body.count);
    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > TOTAL) {
      return NextResponse.json({ error: "count must be an integer from 1 to 100." }, { status: 400 });
    }

    const numbers = Array.from({ length: requestedCount }, (_, i) => partnerNumber(i + 1));
    const codes = numbers.map((_, i) => referralCode(i + 1));

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.query<
        Array<{ id: string; partner_number: string; workspace_id: string; name: string }>
      >(
        `SELECT id, partner_number, workspace_id, name
         FROM partners
         WHERE partner_number IN (?)
         FOR UPDATE`,
        [numbers],
      );

      const existing = new Map(existingRows.map((row) => [row.partner_number, row]));
      const conflicts = existingRows.filter((row) => row.workspace_id !== workspace.id);
      if (conflicts.length) {
        await connection.rollback();
        return NextResponse.json({
          error: "The requested ASL-P identifiers already belong to another workspace.",
          conflicts: conflicts.map((row) => ({ partnerNumber: row.partner_number, workspaceId: row.workspace_id })),
        }, { status: 409 });
      }

      const [linkRows] = await connection.query<
        Array<{ code: string; partner_id: string; workspace_id: string }>
      >(
        `SELECT code, partner_id, workspace_id
         FROM referral_links
         WHERE code IN (?)
         FOR UPDATE`,
        [codes],
      );

      const links = new Map(linkRows.map((row) => [row.code, row]));
      const linkConflicts = linkRows.filter((row) => row.workspace_id !== workspace.id);
      if (linkConflicts.length) {
        await connection.rollback();
        return NextResponse.json({
          error: "One or more deterministic referral codes already belong to another workspace.",
          conflicts: linkConflicts.map((row) => ({ code: row.code, workspaceId: row.workspace_id })),
        }, { status: 409 });
      }

      const created: string[] = [];
      const reused: string[] = [];

      for (let index = 1; index <= requestedCount; index += 1) {
        const number = partnerNumber(index);
        const code = referralCode(index);
        const current = existing.get(number);

        let partnerId = current?.id;
        if (!partnerId) {
          partnerId = randomUUID();
          await connection.query(
            `INSERT INTO partners
              (id, workspace_id, partner_number, name, email, type, status, bio, specialties, service_areas, audience_size, portal_requested)
             VALUES (?, ?, ?, ?, NULL, 'AGENT', 'PENDING', ?, NULL, NULL, NULL, 0)`,
            [
              partnerId,
              workspace.id,
              number,
              "Q1 Pilot Agent " + String(index).padStart(3, "0"),
              "Deterministic Q1 fixture agent for provisioning and isolation acceptance.",
            ],
          );
          created.push(number);
        } else {
          reused.push(number);
        }

        const link = links.get(code);
        if (link && link.partner_id !== partnerId) {
          await connection.rollback();
          return NextResponse.json({
            error: "A deterministic referral code is attached to a different partner.",
            code,
            partnerNumber: number,
          }, { status: 409 });
        }

        if (!link) {
          await connection.query(
            `INSERT INTO referral_links
              (id, workspace_id, partner_id, code, campaign, product_slug, destination_path)
             VALUES (?, ?, ?, ?, 'q1-pilot', NULL, '/dashboard/partner')`,
            [randomUUID(), workspace.id, partnerId, code],
          );
        }
      }

      await connection.commit();

      return NextResponse.json({
        ok: true,
        mode: "deterministic-q1-fixture",
        workspace: { id: workspace.id, name: workspace.name },
        requested: requestedCount,
        created: created.length,
        reused: reused.length,
        partnerNumbers: numbers,
        referralCodes: codes,
        status: "PENDING",
        credentialsIssued: false,
        note: "Fixture records are provisioning identities only; no real person credentials or financial activity are created.",
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("PARTNER_BULK_PROVISION_ERROR", error);
    const message = error instanceof Error ? error.message : "";
    if (/duplicate|unique/i.test(message)) {
      return NextResponse.json({ error: "A partner or referral identifier already exists. Re-run after resolving the conflicting identifier." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not provision the partner fixture. The transaction was rolled back." }, { status: 500 });
  }
}
