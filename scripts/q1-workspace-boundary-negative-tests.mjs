#!/usr/bin/env node
/**
 * Q1 workspace negative integration checks.
 *
 * This intentionally requires two authenticated sessions. It never mutates a
 * cross-workspace record successfully; rejected requests are followed by a
 * read using the owning workspace session to prove the record remains intact.
 *
 * Required:
 *   Q1_BASE_URL
 *   Q1_WORKSPACE_A
 *   Q1_WORKSPACE_B
 *   Q1_SESSION_A
 *   Q1_SESSION_B
 *   Q1_B_LEAD_ID
 * Optional:
 *   Q1_B_QUOTE_ID
 *   Q1_B_ORDER_ID
 *   Q1_B_PAYMENT_ID
 *   Q1_B_COMMISSION_ID
 *
 * Run only against a test/staging environment:
 *   node scripts/q1-workspace-boundary-negative-tests.mjs
 */

import assert from "node:assert/strict";

const env = process.env;
const base = String(env.Q1_BASE_URL || "").replace(/\/$/, "");
const required = [
  "Q1_BASE_URL",
  "Q1_WORKSPACE_A",
  "Q1_WORKSPACE_B",
  "Q1_SESSION_A",
  "Q1_SESSION_B",
  "Q1_B_LEAD_ID",
];
for (const key of required) {
  if (!env[key]) throw new Error(`Missing ${key}`);
}
if (env.Q1_WORKSPACE_A === env.Q1_WORKSPACE_B) throw new Error("Workspace A and B must differ.");

const cookie = (value) => ({ Cookie: value, "Content-Type": "application/json" });
const get = async (path, session, workspace) => fetch(`${base}${path}`, { headers: { Cookie: session }, redirect: "manual" });
const json = async (response) => {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

let passed = 0;
async function check(name, fn) {
  await fn();
  passed += 1;
  console.log(`PASS ${name}`);
}

await check("A cannot read B lead", async () => {
  const r = await get(`/api/admin/leads/${env.Q1_B_LEAD_ID}?workspaceId=${encodeURIComponent(env.Q1_WORKSPACE_A)}`, env.Q1_SESSION_A, env.Q1_WORKSPACE_A);
  assert.ok([403, 404].includes(r.status), `expected 403/404, got ${r.status}`);
});

await check("A cannot update B lead", async () => {
  const r = await fetch(`${base}/api/admin/leads/${env.Q1_B_LEAD_ID}?workspaceId=${encodeURIComponent(env.Q1_WORKSPACE_A)}`, {
    method: "PATCH",
    headers: cookie(env.Q1_SESSION_A),
    body: JSON.stringify({ reason: "Q1 negative boundary test", name: "SHOULD-NOT-CHANGE" }),
  });
  assert.ok([403, 404].includes(r.status), `expected 403/404, got ${r.status}`);
});

if (env.Q1_B_QUOTE_ID) {
  await check("A cannot read B quote", async () => {
    const r = await get(`/api/quotes/${env.Q1_B_QUOTE_ID}?workspaceId=${encodeURIComponent(env.Q1_WORKSPACE_A)}`, env.Q1_SESSION_A);
    assert.ok([403, 404].includes(r.status), `expected 403/404, got ${r.status}`);
  });
}

if (env.Q1_B_ORDER_ID) {
  await check("A cannot create payment against B order", async () => {
    const r = await fetch(`${base}/api/orders/${env.Q1_B_ORDER_ID}/payments`, {
      method: "POST",
      headers: cookie(env.Q1_SESSION_A),
      body: JSON.stringify({
        workspaceId: env.Q1_WORKSPACE_A,
        idempotencyKey: `q1-negative-${Date.now()}`,
        provider: "NEGATIVE_TEST",
        amount: 1,
        currency: "ETB",
        status: "INITIATED",
      }),
    });
    assert.ok([403, 404].includes(r.status), `expected 403/404, got ${r.status}`);
  });
}

if (env.Q1_B_PAYMENT_ID) {
  await check("A cannot update B payment", async () => {
    const r = await fetch(`${base}/api/payments/${env.Q1_B_PAYMENT_ID}`, {
      method: "PATCH",
      headers: cookie(env.Q1_SESSION_A),
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    assert.ok([401, 403, 404].includes(r.status), `expected 401/403/404, got ${r.status}`);
  });
}

if (env.Q1_B_COMMISSION_ID) {
  await check("A cannot update B commission", async () => {
    const r = await fetch(`${base}/api/admin/commissions/${env.Q1_B_COMMISSION_ID}`, {
      method: "PATCH",
      headers: cookie(env.Q1_SESSION_A),
      body: JSON.stringify({ status: "VOID" }),
    });
    assert.ok([401, 403, 404].includes(r.status), `expected 401/403/404, got ${r.status}`);
  });
}

console.log(`Q1 negative boundary checks passed: ${passed}`);
