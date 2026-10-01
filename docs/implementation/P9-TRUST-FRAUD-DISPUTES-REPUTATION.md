# P9 — Trust, Fraud, Disputes and Reputation

## Purpose

P9 protects the Aslal partner network while keeping every risk decision explainable, reviewable and reversible where appropriate.

## Core rule

**Detect → explain → preserve evidence → review → decide → audit.**

A risk signal does not automatically void a commission, delete attribution, or destroy partner earnings.

## Risk signals

The first engine detects:

- SELF_REFERRAL_MATCH — partner identity matches a lead identity in the same workspace.
- DUPLICATE_CUSTOMER_IDENTITY — normalized customer email/phone appears on multiple customer records.
- REPEATED_CUSTOMER_ORDERS — repeated orders for one customer by the same partner.
- SHARED_TRAFFIC_CLUSTER — unusually concentrated referral activity from one hashed network identity across multiple partners.

Signals carry severity, score, explanation and evidence. Scores are triage information, not automatic guilt determinations.

## Self-referral

Self-referral checks compare normalized partner email, phone and Telegram identity against workspace lead identities. A match creates a review signal. It does not automatically reverse a commission.

## Duplicate customers

Customer identity duplication is detected independently from fraud. The system records the duplicate pattern so business staff can distinguish data-quality problems from intentional manipulation.

## Review workflow

Risk signal lifecycle:

`OPEN → UNDER_REVIEW → CONFIRMED / DISMISSED / RESOLVED`

Evidence can be attached to a signal. Reviewers must provide a substantive reason. Every review is recorded in the trust audit center.

## Restriction and suspension

Authorized business users can impose:

- RESTRICTED — account access may remain available depending on the existing account controls, while sensitive participation can be reviewed.
- SUSPENDED — partner login is blocked by the existing authentication boundary.

Restrictions are separately recorded with reason, reviewer, timestamps and related risk signal. Restoration is explicit and audited.

## Earnings protection

P9 does not automatically:

- void commissions;
- reverse revenue;
- delete referral attribution;
- cancel payouts;
- mark legitimate sales fraudulent.

Existing P6 ledger rules remain the financial source of truth. Any financial adjustment must use the existing commission ledger and its reason/idempotency controls.

## Disputes

The existing PartnerDispute workflow remains the formal attribution/earning dispute mechanism. P9 adds risk signals and evidence as supporting review material rather than replacing disputes.

## Partner history

The partner trust history endpoint exposes the partner's own risk signals, restrictions, disputes and commission history. It is workspace-scoped and does not expose another business's information.

## Business trust information

Marketplace trust information remains descriptive and factual: active business, published program, active terms, platform-listed status, program support and eligibility information. P9 does not introduce subjective trust ratings or reputation scores.

## Audit center

`trust_audit_events` records:

- risk scans;
- evidence submission;
- risk decisions;
- restriction/suspension;
- restoration;
- actor;
- before/after state;
- reason;
- timestamp.

The audit center is workspace-scoped.

## APIs

- `GET/POST /api/admin/partner-engine/risk` — list, scan, review, evidence, restrict, restore.
- `GET /api/admin/partner-engine/audit` — trust audit center.
- `GET /api/admin/partner-engine/partners/{id}/trust` — business partner trust profile.
- `GET /api/partner/trust-history` — partner-facing history.
- Existing `/api/partner/disputes` and admin dispute APIs remain the formal dispute channel.

## UI

- `/dashboard/partner-risk` — Trust & Risk Review.
- `/dashboard/trust-audit` — Trust Audit Center.

## Exit criteria

1. A partner can generate a risk signal without losing earnings automatically.
2. A reviewer can inspect the explanation and evidence.
3. A reviewer can dismiss a false positive with a recorded reason.
4. A confirmed case can be restricted or suspended explicitly.
5. A suspended partner cannot log in through the existing authentication boundary.
6. Restoration is explicit and audited.
7. Existing commission ledger history remains intact.
8. Partner disputes remain available.
9. Business A cannot inspect Business B's risk or financial data.
10. Every consequential P9 action is auditable.

## Runtime certification

Run:

    npx prisma generate
    npx prisma migrate deploy
    npm run typecheck
    npm run lint
    npm test

Then execute controlled tests for self-referral, duplicate customer data, shared traffic, false-positive dismissal, evidence review, restriction, suspension, restoration, dispute continuity, commission preservation and two-business isolation.