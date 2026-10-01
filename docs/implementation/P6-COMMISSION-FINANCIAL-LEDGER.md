# P6 — Commission and Financial Ledger

## Goal

P6 makes partner earnings financially auditable. The commission record remains the commercial summary, while the immutable ledger event history provides the reconstruction trail.

## Financial model

The system distinguishes:

- `amount`: gross commission earned;
- `currentBalance`: outstanding unpaid balance;
- `status`: lifecycle state;
- ledger events: immutable financial changes and lifecycle evidence.

A normal earning produces `EARNED +amount`.

An adjustment records a positive or negative delta.

A refund, reversal, chargeback, void, or confirmed payout records a negative delta equal to the outstanding balance.

## Historical contract basis

Each commission can retain contract ID, program terms ID, contract snapshot, qualifying event, attribution policy, attribution window, refund hold, reward type, reward amount/rate, and commissionable basis.

Later ProgramTerms versions must not rewrite an already-created commission's historical basis.

## Integrated boundaries

### Reconciled payment

When Finance reconciles a qualifying payment:

1. Revenue is recognized.
2. Commission is created/updated.
3. Historical commercial basis is stored.
4. An idempotent `EARNED` ledger event is recorded.

### Refund or reversal

When a payment is reversed/refunded:

1. Revenue is reversed.
2. The outstanding commission balance is reduced to zero.
3. A `REVERSED` or `REFUNDED` ledger event records the negative amount.
4. The commission becomes `VOID`.

### Payable

A commission may become `PAYABLE` only when payment is confirmed, reconciliation is complete, revenue is recognized, the refund hold has expired, and no open/under-review dispute blocks payment.

### Confirmed payout

When a payout is marked `PAID`:

1. The selected commission balance is locked.
2. The outstanding balance is written as a negative `PAID` ledger event.
3. The commission balance becomes zero.
4. The commission becomes `PAID`.

Payout records remain separate from the commission ledger because a payout is a transfer event, while the commission ledger explains the earning balance.

## Administrative controls

`/api/admin/partner-engine/commissions/[id]`

- GET: commission plus full ledger history.
- PATCH `APPROVE`: records approval.
- PATCH `MARK_PAYABLE`: validates financial eligibility before marking payable.
- PATCH `ADJUST`: records a signed balance adjustment.
- PATCH `REVERSE`, `REFUND`, `CHARGEBACK`, `VOID`: records a negative terminal event.

Every mutation requires a reason and an idempotency key.

## Partner statement

`/api/partner/commission-statement` returns partner identity, gross commission, outstanding balance, status, historical commercial basis, ledger events, and program/terms references where available.

The statement is workspace-scoped and limited to the authenticated partner.

## Reconstruction rule

For each commission:

`opening balance + Σ(amountDelta) = currentBalance`

For new commissions, the opening event is `EARNED`.

For legacy commissions, migration `20261002170000_p6_commission_financial_ledger` seeds an `EARNED` event from the existing commission amount.

The ledger is append-only. Corrections are new events, never edits to prior financial events.

## Required acceptance tests

1. Reconciled sale creates exactly one EARNED event.
2. Repeated reconciliation does not duplicate the EARNED event.
3. Refund creates one REFUNDED event and zero outstanding balance.
4. Reversal creates one REVERSED event and zero outstanding balance.
5. Adjustment changes balance by exactly the requested delta.
6. PAYABLE is blocked before reconciliation.
7. PAYABLE is blocked during refund hold.
8. PAYABLE is blocked by an open dispute.
9. PAID creates one PAID event and zero outstanding balance.
10. Repeated payout cannot consume the same commission twice.
11. Partner statement exposes only the authenticated partner's workspace records.
12. Historical contract snapshot remains unchanged after later terms versions are published.

## Runtime certification

~~~bash
npx prisma generate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm test
~~~

Then execute controlled endpoint smoke tests for reconciliation, refund/reversal, payable transition, adjustment, payout, and partner statement.

P6 is source-implemented on branch `p6-financial-ledger`; runtime certification remains required before treating the milestone as production-complete.
