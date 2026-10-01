# P7 — Automated Payout Engine

## Objective

Provide one payout lifecycle that supports manual payouts today and Telebirr/M-Pesa automation later without changing commission accounting.

## Providers

Supported provider identifiers: MANUAL, TELEBIRR, MPESA.

Telebirr and M-Pesa are intentionally represented as provider adapters but are not falsely marked as integrated. Their adapters remain unconfigured until the official API contract, credentials, callback/webhook rules, authentication requirements, supported currencies, and settlement behavior are supplied.

## Manual operation

Finance can create a payout containing only PAYABLE commissions, select MANUAL, make the payment outside Aslal, enter the payment reference, optionally attach evidence and notes, verify the payment, and confirm the payout. Confirmation consumes payout items through the P6 commission ledger and creates PAID events.

## Provider abstraction

`lib/payout-providers.ts` defines validate(), submit(), and verify(). Future Telebirr/M-Pesa implementations must conform to this interface. Provider-specific assumptions are deliberately excluded until official APIs are supplied.

## Execution record

`payout_executions` stores provider, execution status, attempt count, idempotency key, provider transaction ID, sanitized request/response, failure code/reason, and submission/confirmation timestamps.

## Manual verification

`payout_verifications` stores verification status, method, payment reference, evidence URL, notes, verifier, and verification time.

## API

POST `/api/admin/partner-engine/payouts/execute` supports CREATE_EXECUTION and VERIFY_MANUAL.

CREATE_EXECUTION requires payoutId, provider, and idempotencyKey.

VERIFY_MANUAL requires payoutId and an explicit payment reference, with optional evidenceUrl and notes.

## Security

Workspace scoped; finance permission required; every execution is idempotent; manual verification requires a payment reference; paid commissions cannot be paid again; provider credentials remain server-side; future webhooks must be signature-verified and idempotent.

## Telebirr/M-Pesa readiness

When APIs become available, add provider credentials/configuration, adapter implementation, authentication/signing, submit/status operations, webhook verification, provider transaction persistence, retry policy, failure classification, and reconciliation. The existing schema and payout abstraction are designed so those additions do not require a payout-accounting redesign.

## Acceptance criteria

- Manual payout can be created and verified.
- Manual verification creates P6 PAID ledger events.
- Duplicate verification is harmless.
- A commission cannot be paid twice.
- Payout execution has an idempotency key.
- Telebirr and M-Pesa can be selected as future providers but remain explicitly unconfigured until their adapters exist.
- Provider execution records are independent of commission accounting.
- Failed provider execution can move to manual review without changing the original commission ledger.
- Workspace isolation applies to execution and verification.

## Runtime certification

```bash
npx prisma generate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm test
```

Then test manual payout creation, manual verification, duplicate verification, insufficient balance, idempotency, provider-not-configured fallback, workspace isolation, and PAID ledger creation.
