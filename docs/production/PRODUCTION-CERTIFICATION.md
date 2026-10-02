# Aslal Digital Solutions — Production Hardening & Certification

## Objective

Prove that the commercial system can be operated repeatedly, safely and recoverably. Code existence is not certification evidence.

## Automated gates

1. npm ci
2. npm run prisma:generate
3. npx prisma validate
4. npm run lint
5. npm run typecheck
6. npm run build
7. node scripts/production-hardening-tests.mjs
8. npm audit --omit=dev --audit-level=high
9. k6 load smoke against the release candidate
10. controlled commercial acceptance against a prepared partner-attributed order

## Mandatory commercial evidence

Capture IDs and timestamps for partner registration/verification, active program and campaign, referral link, attributed lead/customer, order, pending payment, provider confirmation, duplicate webhook replay, finance reconciliation, recognized revenue, commission eligibility, payout approval, successful payout, payout failure/retry, partial refund, full refund, and a foreign-workspace negative access attempt.

The code harness covers deterministic control rules and load smoke. Financial mutations must be executed against a dedicated staging fixture or explicitly approved certification environment; no production credentials or real customer funds belong in automated CI.

## Failure matrix

| Scenario | Expected result | Evidence |
|---|---|---|
| Payment failure | FAILED payment; no recognized revenue or payable commission | payment/activity |
| Duplicate webhook | second delivery acknowledged without duplicate financial state | provider + event ID |
| Full refund | REFUNDED payment/order and reversed recognized revenue | refund/revenue/commission |
| Partial refund | PARTIALLY_REFUNDED payment and reduced remaining revenue/commission | refund/revenue/commission |
| Payout failure | FAILED payout remains retryable without duplicate ledger movement | payout/reference/audit |
| Workspace crossover | request denied and no foreign records returned or mutated | response + audit |
| Database outage | health/readiness returns 503 | monitoring evidence |
| Restore | restored DB passes migration status and commercial smoke | restore log |

## Load acceptance

Initial k6 baseline: 5 virtual users for 60 seconds, HTTP failure rate below 1%, p95 below 800 ms for public smoke endpoints. Capacity claims must only be made for the tested environment.

## Security acceptance

Unauthenticated financial APIs must reject access. Workspace-scoped APIs must reject foreign workspace IDs. Login throttling must block repeated failures. Webhooks require signatures and durable event IDs. Payment/refund idempotency keys must be unique. Security headers must be present. High/critical dependency vulnerabilities must be resolved or formally risk-accepted before certification.

## Backup and recovery

Baseline shared-host target: RPO 24 hours and RTO 4 hours unless the hosting provider supplies stronger recovery. Run a restore drill at least monthly and before major financial schema changes.

## Certification rule

CERTIFIED requires all mandatory evidence, all automated gates passing, two consecutive successful commercial journey runs, and no open financial-integrity or cross-workspace exposure defect.

CONDITIONALLY CERTIFIED means code gates pass but real-provider, real-payout, backup-restore or disaster-recovery evidence is still pending.

NOT CERTIFIED means the commercial journey cannot be repeated or a financial-integrity/security control fails.
