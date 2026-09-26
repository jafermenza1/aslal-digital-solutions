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

## Telegram partner agent workbench — Q1 completion

The dedicated partner workbench now has a Telegram webhook and secure partner-account linking flow.

- Partner portal generates a one-time Telegram deep-link token only for ACTIVE + VERIFIED partners.
- Telegram /start <token> binds the private Telegram chat to that partner and consumes the token.
- Workspace-scoped commands are available: /campaigns, /campaign <id>, /apply <id>, /links, /earnings, /me, /help.
- Campaign details expose only published assets from the partner's workspace.
- Campaign applications enforce partner status, verification, campaign status, partner-type eligibility and workspace matching.
- Referral links, commissions and payouts are read using the partner's workspace boundary.
- Webhook requests require TELEGRAM_WEBHOOK_SECRET and TELEGRAM_BOT_TOKEN.
- Live Telegram delivery, webhook registration and pilot acceptance remain IMPLEMENTED / UNVERIFIED until credentials are configured and a controlled partner test is completed.


## Current verification against the operational plan — 2026-09-26

**Result: Q1 operational plan is NOT YET FULLY SYSTEM-SUPPORTED.**

The commercial core is substantially connected, but the Month 1–3 pilot cannot yet be treated as a fully executable controlled operating model.

| Plan item | Current status | Verification |
|---|---|---|
| Strict lead → sale → payment state machine | PARTIAL / UNVERIFIED | Lead, quote, order, payment, reconciliation, revenue and commission states exist; controlled transition tests remain required. |
| Manual payment reconciliation portal | BLOCKED / MISSING UI | Payment stores provider, transaction reference, evidence reference, notes, verifier and timestamps, but the Finance page does not currently provide the required receipt-verification/reconciliation workbench. |
| Telebirr/CBE/M-Pesa receipt handling | PARTIAL | Provider-neutral manual fields exist. No provider-specific verification integration is claimed. |
| Lead SLA timers | PARTIAL / BLOCKED | 15-minute high-intent and overdue workflow definitions exist, but no scheduler invocation of processWorkflowExecution was found; automation creates tasks/activities rather than SMS/Telegram SLA alerts. |
| 3 anchor client onboarding | FOUNDATION ONLY | Workspace isolation and trusted host mapping exist, but three configured anchor workspaces plus client-access evidence are not established. |
| 100 agent onboarding | PARTIAL | Partner creation, verification, referral links and ID cards exist. No bulk 100-agent provisioning workflow was found. |
| Partner ID ASL-P-0001…0100 | GAP | Current generator uses ASL-<sequence>-<year>, not the specified Q1 display format. |
| QR identity badges | IMPLEMENTED / UNVERIFIED | Partner card/QR generation exists; 100-agent issuance has not been proven. |
| Partner Workbench V1 | PARTIAL / UNVERIFIED | Partner portal and Telegram partner workbench exist; live Telegram delivery and controlled asset publishing remain unverified. |
| Campaign materials | IMPLEMENTED / UNVERIFIED | Campaign assets support CREATIVE, COPY, PRICE_SHEET, QR, POSTER and LINK with lifecycle states. |
| Client CRM dashboard | BLOCKED | No dedicated client-facing CRM dashboard was found exposing only that client's pipeline, assigned leads and rep task list. |
| Facebook/TikTok/direct agent campaign execution | EXTERNAL | The system carries campaign/referral attribution; external ad-account execution is not an in-product capability. |
| Weekly client pipeline audit | PARTIAL | Lead/stage/task dashboards exist, but no dedicated repeatable client audit pack was found. |
| Manual bulk mobile-money payouts | PARTIAL / UNVERIFIED | Payout batches select reconciled PAYABLE commissions and prevent duplicate settlement. Actual Telebirr/CBE money movement remains external. |
| Attribution dispute SOP | PARTIAL | Dispute workflow and reassignment logic exist; formal operator SOP/evidence run remains required. |
| Cancelled/refunded order handling | IMPLEMENTED / UNVERIFIED | Payment reversal/refund propagates to revenue and commission; controlled evidence remains required. |
| Merchant invoice billing/payment collection | IMPLEMENTED / UNVERIFIED | Invoice and payment-allocation domains exist; operational billing SOP and acceptance evidence remain. |
| Attribution lock | IMPLEMENTED / UNVERIFIED | Lock metadata and audited override controls exist. First-touch/last-touch policy and 30-day retention are not explicit. |
| 30-day cookie/link retention | GAP | Referral click/visitor records exist, but no explicit 30-day attribution retention/expiry policy was found. |
| Commission from collected payment | IMPLEMENTED / UNVERIFIED | Reconciled confirmed payment → recognized revenue → commission/payout controls exist; behavioral proof remains. |

### Required remaining work

1. Finance manual reconciliation workbench with receipt/evidence capture, provider, transaction reference, decision, verifier and exception reason.
2. Protected scheduler/worker that invokes overdue/high-intent execution; add idempotent SMS/Telegram notification action where required.
3. Complete three-anchor isolation: A/B/C workspaces, client role access and client-scoped CRM/report surfaces.
4. Bulk 100-agent provisioning and reconciliation of the requested ASL-P-0001…ASL-P-0100 display convention.
5. Campaign asset publishing/distribution acceptance.
6. Repeatable weekly client pipeline audit view/report.
7. Formal dispute/refund/invoice/payout SOPs and retained evidence.
8. Explicit first-touch/last-touch policy plus 30-day retention/override rules.
9. Run typecheck/lint, then controlled Month 1–3 acceptance.

This verification preserves the existing Order → Payment → Reconciliation → Revenue → Commission → Payout chain and identifies the operational controls still required for the stated pilot.


---

## Operational blocker closure progress — 2026-09-26

The closure program is now controlled by the canonical NEXT-DEVELOPMENT-PLAN.md. The current evidence was rechecked before planning the implementation sequence.

### Step 1 correction to prior reconciliation

The earlier statement that manual reconciliation UI was completely missing is too broad for the current mainline. app/dashboard/orders/OrdersWorkspace.tsx already contains payment recording and reconciliation controls, and app/api/payments/[id]/route.ts enforces evidence for RECONCILED and records the verifier/activity.

The actual Step 1 blocker is **UI/API workflow mismatch and Finance-surface placement**:
- the Orders UI currently submits status: "CONFIRMED" when recording a manual payment;
- the payment API correctly rejects direct CONFIRMED creation and requires PENDING first;
- the Finance page currently exposes commission/payout operations but not a dedicated payment review queue;
- therefore the intended Month 1 operator workflow is not yet executable end-to-end through the Finance role.

### Updated closure status

| Blocker | Current truth | Next action |
|---|---|---|
| Manual payment reconciliation | **PARTIAL — UI/API mismatch** | Close Step 1 by making capture PENDING-only and adding Finance review/reconciliation surface. |
| SLA scheduler | **FOUNDATION PRESENT — ACCEPTANCE PENDING** | Execute protected scheduler/idempotency/stop-condition proof; no GitHub Actions restoration. |
| Three-anchor isolation | **FOUNDATION — ACCEPTANCE BLOCKED** | Build client-scoped CRM/report surfaces and prove A/B/C isolation. |
| 100-agent onboarding | **PARTIAL** | Add deterministic bulk fixture/provisioning and ID display convention. |
| Attribution retention | **PARTIAL** | Define first/last-touch and 30-day retention/expiry semantics and implement missing controls. |
| Weekly audit/distribution | **PARTIAL** | Add repeatable audit pack and finish campaign-asset publishing evidence. |
| SOP/evidence pack | **OPEN** | Document dispute/refund/invoice/receipt/payout procedures and evidence requirements. |
| Q1 acceptance | **NOT ACCEPTED** | Execute only after blocker steps exit. |

### Current Step

**STEP 1 — Manual payment reconciliation workbench**

No Q1 acceptance claim is changed by this documentation update. The next code change should address only Step 1 and preserve the existing Order → Payment → Reconciliation → Revenue → Commission → Payout chain.


## Step 1 implementation progress — 2026-09-26

The Step 1 implementation is now present: the Orders capture path creates `PENDING` payments; Finance has a dedicated workspace-scoped reconciliation queue; receipt evidence and exception notes are captured; confirmation precedes reconciliation; reconciliation remains evidence-gated and drives the existing revenue/commission transaction path.

**Status:** IMPLEMENTED — behavioral and local validation pending. Q1 remains NOT ACCEPTED.


## Step 2 implementation progress — 2026-09-26

**Current step:** Sales SLA scheduler and notification safety.
**Status:** FOUNDATION HARDENED — BEHAVIORAL ACCEPTANCE PENDING.

The Step 2 implementation now separates the internal SLA scheduler from customer-facing Telegram follow-up processing. `/api/cron/sales-automation` is protected and runs only overdue/high-intent workflow processing. Telegram customer follow-ups are isolated behind `/api/cron/telegram-followups`, preventing a Gate 2 scheduler invocation from implicitly sending customer messages.

The workflow engine also now atomically claims PENDING executions and due PENDING actions before processing them. This closes the concurrent-worker duplication risk at the execution/action claim boundary while retaining the existing unique idempotency key, overdue deadline key, bounded retry and stale-recovery controls.

The owner-selection path remains workspace-scoped to active sales-capable members. Reply, WON and LOST cancellation hooks remain wired to inbound messaging and lead status transitions.

**Acceptance remains pending.** The controlled proof must demonstrate scheduler success, same-trigger idempotency, one overdue reminder per deadline, retry/stale recovery, reply cancellation, terminal-state cancellation, workspace isolation, operator visibility and absence of customer promotional messaging from the SLA scheduler.


## Step 3 implementation progress — 2026-09-26

**Step:** Three-anchor workspace/client boundary.
**Status:** IMPLEMENTED FOUNDATION — ACCEPTANCE PENDING.

A dedicated CLIENT CRM surface is now implemented at `/dashboard/client`. It authorizes the client against the requested/active workspace before loading data and scopes every client-visible lead, customer, order, task and commission query to that workspace. CLIENT no longer has the generic `commerce.view` permission, so the broad Orders workspace is not exposed as a client surface.

The existing workspace authorization layer continues to reject requested workspaces for users without membership. The implementation therefore supports the intended A/B/C fixture while preserving the safe boundary.

**Acceptance remains pending:** configure three isolated anchor workspaces and their role users, then execute direct cross-workspace negative tests and client-surface checks with retained evidence.
