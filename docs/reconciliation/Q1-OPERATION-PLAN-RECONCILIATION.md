# Q1 Operation Plan — System Gap Reconciliation

**Date:** 2026-09-25  
**Purpose:** Reconcile the Q1 pilot operating plan against the actual mainline implementation without treating schema/UI existence as proof of operational readiness.

## Executive result

The system supports a substantial part of the Q1 operating model, but it does **not yet support the entire plan safely end-to-end**.

The strongest existing chain is now:

**Lead → Person/Opportunity/Customer → Quote → Order → Payment → Reconciliation → Revenue → Commission**

However, several Q1 operational controls are still missing or only partial:

1. payment evidence and verifier/audit controls;
2. real SMS/Telegram SLA notification delivery and scheduler acceptance;
3. client/anchor workspace isolation;
4. campaign asset/material management;
5. commission-to-payout batch linkage;
6. attribution-dispute resolution for competing agents;
7. merchant invoice/billing records;
8. partner ID format alignment with the Q1 plan;
9. controlled production evidence for the whole journey.

The correct implementation priority is to close these gaps without replacing the existing commercial foundation.

## Reconciliation changes applied in mainline

The following Q1 controls have now been hardened in code without replacing the existing commercial chain:

- manual payment reconciliation stores an evidence reference, verification notes and verifier identity;
- RECONCILED payments require evidence and create a customer/order activity record;
- payment mutation now requires the explicit `commerce.manage` permission;
- commission approval/payable/paid transitions require reconciled payment and recognized revenue;
- payout batches can be built from PAYABLE commissions only, create payout-item links, and prevent double settlement;
- attribution disputes now record competing partner, evidence, decision notes, awarded attribution and resolving actor;
- merchant invoice records can be issued from confirmed orders and reconciled payments can be allocated without exceeding either payment or invoice balance;
- campaign assets now have a first-class lifecycle for creatives, copy, price sheets, QR/poster and tracked links;
- partner payout workspace now exposes eligible payable commissions for batch selection;
- the Q1 reconciliation document is linked from the repository README.

These changes still require CI, migration deployment and controlled production acceptance. They do not constitute proof that the Q1 operating plan is fully accepted.

## Q1 requirement matrix

| Q1 requirement | Current mainline | Status | Gap to close |
|---|---|---|---|
| Strict lead → sale → payment state progression | Lead, opportunity, quote, order and payment domains exist | PARTIAL / UNVERIFIED | Controlled production acceptance and stricter financial transition evidence |
| Manual bank/mobile-money reconciliation | Orders workspace can record confirmed manual payment and mark MATCHED/RECONCILED/EXCEPTION | PARTIAL | Receipt/evidence reference, verifier, reconciliation reason, immutable activity/audit trail, exception queue |
| Telebirr/CBE/M-Pesa receipt verification | Provider-neutral manual payment fields exist | PARTIAL | Provider-specific evidence capture and verification SOP; no provider API should be implied |
| Lead SLA timers | LEAD_CREATED and LEAD_OVERDUE workflows create tasks/activities | PARTIAL | Scheduler acceptance plus SMS/Telegram notification adapter/action if those channels are required for the pilot |
| First 100 agent onboarding | Partner records, verification, tiers and partner IDs exist | IMPLEMENTED / PARTIAL | Bulk onboarding workflow and exact Q1 ID format need reconciliation |
| Q1 Partner ID format ASL-P-0001… | Existing partnerNumber is ASL-<sequence>-<year> | GAP | Decide whether Q1 uses a new display alias or update the operating plan; do not silently rewrite existing IDs |
| Referral links / QR identity | Referral links and partner-card/QR work exist | IMPLEMENTED-UNVERIFIED | Controlled issuance test for 100-agent cohort |
| Partner Workbench | Partner self-service/campaign workspace plus first-class campaign assets | IMPLEMENTED / PARTIAL | Controlled publishing/distribution acceptance and partner-facing asset UX remain |
| Telegram bot workbench | No Telegram Bot API implementation found | MISSING | Provider integration, authentication/linking, campaign commands and message audit |
| Client CRM dashboard | Internal dashboard exists | PARTIAL / BLOCKED FOR 3 INDEPENDENT CLIENTS | Client-scoped workspace/tenant boundary and role enforcement are required before exposing multiple anchor clients |
| Campaign launch attribution | Campaign/referral attribution exists | PARTIAL | First-class campaign asset/placement lineage is still incomplete |
| Weekly pipeline audits | Lead dashboard, stage history and tasks exist | IMPLEMENTED | Add operational audit/report view if clients need a repeatable weekly pack |
| Manual bulk agent payouts | Partner payout ledger exists | PARTIAL | Batch payout generation from payable commissions and payout-item linkage |
| Commission based on collected payment | Reconciled payment creates revenue and commission | IMPLEMENTED IN CODE / UNVERIFIED | Controlled evidence; commission must not become payable before reconciliation |
| Cancelled/refunded order handling | Payment reversal/refund reverses revenue and voids commission | IMPLEMENTED / PARTIAL | Audit evidence and controlled acceptance for cancellation/refund scenarios |
| Disputed lead attribution | Attribution dispute case now stores competing partner, lead, evidence, decision notes, awarded partner and resolving actor | IMPLEMENTED / UNVERIFIED | Controlled dispute creation and resolution acceptance remains |
| Merchant invoice billing/payment collection | Invoice, invoice-item and reconciled-payment allocation domains now exist | IMPLEMENTED / UNVERIFIED | Production migration and controlled invoice/payment allocation acceptance remain |
| Anchor-client pilot operations | Single-workspace foundation exists | BLOCKED for safe 3-client isolation | Tenant/workspace model or an explicitly segregated pilot deployment |
| Full Q1 end-to-end proof | No accepted controlled journey yet | MISSING / UNVERIFIED | One repeatable acceptance script with evidence at every transition |

## Financial control required for the pilot

The system must preserve this distinction:

**Deal value ≠ order value ≠ payment amount ≠ reconciled collected amount ≠ recognized revenue ≠ commission ≠ payout.**

The accepted financial path is:

**Order → Payment → Reconciliation → Revenue → Commission → Payout**

A manual payment record is not sufficient evidence of collection. For the pilot, the reconciliation screen should require:

- payment/order reference;
- provider and method;
- amount/currency;
- provider transaction reference where available;
- receipt/evidence reference;
- verifier identity;
- verification timestamp;
- reconciliation decision;
- exception/rejection reason where applicable;
- linked activity/audit event.

A payout marked PAID must not be treated as proof of money movement unless an external payout reference or execution record exists.

## Q1 implementation gates

### Gate A — Manual reconciliation

A pilot operator can:

1. find an unpaid/partially paid order;
2. record a manual payment;
3. attach/reference the receipt evidence;
4. verify the amount and provider reference;
5. mark MATCHED or EXCEPTION;
6. mark RECONCILED only after verification;
7. see the resulting revenue;
8. see the resulting partner commission;
9. reconstruct who performed the verification.

### Gate B — Sales SLA

A newly captured high-intent lead:

1. receives an owner;
2. receives a due next action;
3. creates the internal SLA task;
4. is detected as overdue by the scheduler;
5. creates an escalation/reminder;
6. stops eligible automation when the customer replies or the lead reaches WON/LOST;
7. does not create duplicate executions.

If SMS/Telegram is used, delivery must be provider-backed and idempotent; the presence of channel enum values is not acceptance evidence.

### Gate C — Anchor client workspace

Before three independent businesses receive login access, every lead/customer/order/report query must be provably scoped to the correct business workspace. Until that exists, the safe pilot mode is a deliberately segregated environment or one shared internal operator model—not three clients sharing an unscoped data surface.

### Gate D — Commission payout

Only commissions derived from reconciled revenue may enter PAYABLE.

A payout batch should select payable commissions, create payout items, calculate the batch total, record the operator, and prevent the same commission from being paid twice.

### Gate E — Q1 operational acceptance

Run one controlled journey per anchor-client archetype:

**Campaign → referral/QR → visitor → lead → owner/SLA → opportunity → quote → negotiation → accepted order → manual payment → receipt verification → reconciliation → revenue → commission → payout ledger**

Record failures rather than filling missing values artificially.

## Recommended implementation order

1. **Manual reconciliation evidence + audit trail**
2. **Commission payable/payout-item enforcement**
3. **Production scheduler/SLA acceptance**
4. **Attribution dispute workflow**
5. **Merchant invoice/billing foundation**
6. **Campaign asset/material foundation**
7. **Client workspace/tenant boundary before three-client access**
8. **Telegram/SMS adapters only where the pilot actually requires them**
9. **100-agent cohort issuance and controlled bulk onboarding**
10. **Controlled Q1 end-to-end acceptance**

## Non-negotiable preservation rules

- Do not remove or replace the existing Order/Payment/Revenue/Commission chain.
- Do not convert quote value or lead deal value into revenue.
- Do not create commission from an unreconciled payment.
- Do not mark a payout PAID merely because a ledger row exists.
- Do not fabricate historical customer, payment, attribution or commission data.
- Do not expose three anchor clients through the current unscoped single-workspace data model.
- Do not claim SMS, Telegram, payment-provider APIs or payout execution merely because an enum, adapter boundary or ledger exists.
- Keep AI and broad multi-tenant scaling behind the existing roadmap gates.

## Current decision

**Q1 is executable with the current foundation, but not yet fully supported by the system as a controlled production operating model.**

The highest-risk gaps are **manual payment evidence/reconciliation, client isolation, commission-to-payout control, attribution disputes, and invoice/billing**. These should be closed before treating the Q1 plan as fully system-enabled.