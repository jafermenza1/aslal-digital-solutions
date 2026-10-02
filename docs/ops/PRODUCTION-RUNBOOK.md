# Production Operations Runbook

## Health

Use GET /api/health. HTTP 200 means application/database readiness is healthy. HTTP 503 means database readiness failed.

## Monitor

Monitor HTTP 5xx rate, latency, health failures, failed payments/webhooks, reconciliation exceptions, failed payouts, stuck communication outbox records, database storage and connection errors.

## Severity

SEV-1: financial duplication, cross-workspace exposure, database corruption, double payment/payout movement.

SEV-2: provider outage, sustained webhook failure, payout queue failure, application unavailable.

SEV-3: isolated UI/API issue with a safe manual workaround.

## Incident procedure

1. Identify incident start and affected workspace(s).
2. Stop or isolate a financial mutation path if duplication is suspected.
3. Preserve payment, webhook, payout and provider references.
4. Never delete financial history.
5. Reconcile provider and Aslal records.
6. Apply the smallest controlled correction.
7. Re-run the failed and duplicate/retry scenarios.
8. Record root cause, impact, correction and prevention.

## Payment failure

Keep the payment FAILED. Verify revenue remains unrecognized and commission is not payable. Correct provider/configuration conditions before retrying.

## Webhook failure

Check signature secret, provider delivery status and event ID. Replay only after confirming whether the event was processed. The same provider/event ID is idempotent.

## Refund

Use the refund workflow. Never delete the payment. Confirm provider evidence and refund amount. For partial refunds verify remaining revenue and commission. If the commission is already PAID, escalate to Finance for payout clawback before refunding.

## Payout failure

Keep the original failed payout record. Verify beneficiary data, provider reference and balance. Retry only after the failure cause is understood. Never create an untracked duplicate payout.

## Workspace incident

Restrict the affected account if necessary, preserve request identifiers, and compare workspace IDs across user, membership, order, payment, revenue, commission and payout records.

## Database outage

Use the health endpoint to distinguish application availability from database readiness. Check hosting database status, credentials, connection limits and storage before repeated application restarts.

## Restore

Stop writes, restore the database, verify migration status, run health checks, run read-only financial reports, execute the commercial acceptance script, then reopen financial operations only after reconciliation.
