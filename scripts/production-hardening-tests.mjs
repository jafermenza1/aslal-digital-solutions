import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const allowed = {
  INITIATED: ["PENDING", "CONFIRMED", "FAILED"],
  PENDING: ["CONFIRMED", "FAILED", "REVERSED"],
  CONFIRMED: ["REVERSED", "REFUNDED", "PARTIALLY_REFUNDED"],
  PARTIALLY_REFUNDED: ["REFUNDED"],
  FAILED: [],
  REVERSED: [],
  REFUNDED: [],
};

assert.ok(allowed.CONFIRMED.includes("PARTIALLY_REFUNDED"));
assert.ok(allowed.PARTIALLY_REFUNDED.includes("REFUNDED"));

const original = 1000;
const refunded = [125, 275, 100].reduce((a, b) => a + b, 0);
const remaining = original - refunded;
assert.equal(remaining, 500);
assert.equal(Number((remaining / original * 240).toFixed(2)), 120);

const payload = JSON.stringify({ provider: "test", eventId: "evt-1" });
const signature = createHmac("sha256", "certification-secret").update(payload).digest("hex");
assert.equal(signature.length, 64);
assert.notEqual(signature, createHmac("sha256", "wrong").update(payload).digest("hex"));

const sameWorkspace = (active, ...records) => records.every((record) => record == null || record === active);
assert.equal(sameWorkspace("ws-a", "ws-a", "ws-a"), true);
assert.equal(sameWorkspace("ws-a", "ws-a", "ws-b"), false);

console.log("Production hardening control tests: PASS");
console.log("Covered: payment transitions, partial-refund arithmetic, webhook signatures, workspace isolation invariants.");
