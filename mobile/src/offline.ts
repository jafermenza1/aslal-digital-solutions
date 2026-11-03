import * as SQLite from "expo-sqlite";
import type { LocalOperationStatus } from "./contracts";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getMobileDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("aslal-mobile.db");
    const db = await databasePromise;
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS mobile_outbox (
        operation_id TEXT PRIMARY KEY NOT NULL,
        device_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        entity TEXT NOT NULL,
        action TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        client_created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_mobile_outbox_workspace_status
        ON mobile_outbox(workspace_id, status);
      CREATE TABLE IF NOT EXISTS mobile_lead_cache (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_mobile_lead_cache_workspace
        ON mobile_lead_cache(workspace_id, updated_at);
    `);
    return db;
  }
  return databasePromise;
}

export async function queueOperation(input: {
  operationId: string;
  deviceId: string;
  workspaceId: string;
  entity: string;
  action: string;
  payload: unknown;
}) {
  const db = await getMobileDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO mobile_outbox
      (operation_id, device_id, workspace_id, entity, action, payload_json, client_created_at, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'QUEUED', ?)`,
    input.operationId, input.deviceId, input.workspaceId, input.entity, input.action,
    JSON.stringify(input.payload), new Date().toISOString(), new Date().toISOString(),
  );
}

export async function listPendingOperations(workspaceId: string) {
  const db = await getMobileDatabase();
  return db.getAllAsync<{
    operation_id: string; device_id: string; workspace_id: string; entity: string; action: string;
    payload_json: string; client_created_at: string; status: LocalOperationStatus;
    attempt_count: number; last_error: string | null;
  }>(
    `SELECT operation_id, device_id, workspace_id, entity, action, payload_json,
            client_created_at, status, attempt_count, last_error
       FROM mobile_outbox
      WHERE workspace_id = ?
        AND status IN ('QUEUED', 'SYNCING', 'FAILED', 'CONFLICT')
      ORDER BY client_created_at ASC`,
    workspaceId,
  );
}

export async function setOperationStatus(operationId: string, status: LocalOperationStatus, error?: string) {
  const db = await getMobileDatabase();
  await db.runAsync(
    "UPDATE mobile_outbox SET status = ?, attempt_count = attempt_count + 1, last_error = ?, updated_at = ? WHERE operation_id = ?",
    status, error ?? null, new Date().toISOString(), operationId,
  );
}

export async function cacheLeads(workspaceId: string, leads: unknown[]) {
  const db = await getMobileDatabase();
  await db.withTransactionAsync(async () => {
    for (const lead of leads) {
      const row = lead as { id?: string; updatedAt?: string };
      if (!row.id) continue;
      await db.runAsync(
        "INSERT OR REPLACE INTO mobile_lead_cache (id, workspace_id, data_json, updated_at) VALUES (?, ?, ?, ?)",
        row.id, workspaceId, JSON.stringify(lead), row.updatedAt || new Date().toISOString(),
      );
    }
  });
}

export async function listCachedLeads(workspaceId: string) {
  const db = await getMobileDatabase();
  const rows = await db.getAllAsync<{ data_json: string }>(
    "SELECT data_json FROM mobile_lead_cache WHERE workspace_id = ? ORDER BY updated_at DESC LIMIT 100",
    workspaceId,
  );
  return rows.flatMap((row) => {
    try { return [JSON.parse(row.data_json)]; } catch { return []; }
  });
}
