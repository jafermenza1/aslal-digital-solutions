# Q1 E2E Gap Reconciliation — 2026-09-26

**Branch:** `main`  
**Purpose:** reconcile the Q1 end-to-end acceptance contract against the current implementation before behavioral acceptance.  
**Acceptance status:** **NOT ACCEPTED** — code hardening is in progress; behavioral evidence is still required.  
**Validation policy:** GitHub Actions remain intentionally disabled. Local validation is limited to `npm run typecheck` and `npm run lint` until the final gate.

## 1. Controlling journey

The Q1 acceptance chain remains:

**Lead Capture → Lead Qualification → Sales Follow-up → Customer → Quote → Order → Payment → Reconciliation → Revenue → Commission Qualification → Commission Approval → Payout → Settlement**

Partner path:

**Partner → Campaign → Campaign Asset/Referral Link → Attributed Lead → Customer → Order → Confirmed Payment → Revenue → Commission → Partner Payout**

Workspace isolation, attribution integrity, payment/reconciliation controls, commission controls, disputes, auditability, mobile, localization and failure recovery remain mandatory.

## 2. Code-level blocker reconciliation

| Area | Prior gap | Current state | Evidence required |
|---|---|---|---|
| Finance payment mutation | Finance lacked `commerce.manage` | **CLOSED** | Finance login must confirm a PENDING payment and reconcile it in its workspace. |
| Payment submission | Payment POST could request `CONFIRMED` | **CLOSED IN CODE** | POST must create PENDING; Finance/admin PATCH must perform confirmation. |
| Commission approval | Finance could not use commission mutation | **CLOSED IN CODE** with dedicated `commissions.manage` permission | Finance must advance QUALIFIED → APPROVED → PAYABLE in the controlled fixture. |
| Payout operations | Payout endpoint used broad partner-management permission | **CLOSED IN CODE** with dedicated `payouts.manage` permission | Finance must create/settle a payout from PAYABLE commissions. |
| Attribution mutation | Lead attribution fields were freely editable | **CLOSED IN CODE** | Locked attribution must reject ordinary edits and permit only authorized, reasoned override with audit evidence. |
| Attribution persistence | No lock metadata | **CLOSED IN SCHEMA** | Migration must apply and lock fields must survive the journey. |
| Dispute reassignment | Resolution stored awarded partner but did not recalculate commission/revenue | **CLOSED IN CODE / ATOMICITY EVIDENCE PENDING** | Resolution now reassigns linked commission and revenue and records old/new attribution; controlled transaction-failure/atomicity proof remains. |
| Public workspace routing | Public lead capture was hard-bound to INTERNAL workspace | **CLOSED IN CODE / CONFIGURATION PENDING** | Public capture now resolves workspace from trusted host mapping with INTERNAL fallback; configure and verify the three-anchor domains. |
| Arabic/RTL | Only en/am/om and root LTR | **CLOSED IN CODE** for locale/RTL foundation | Arabic UI smoke test, RTL layout, font/fallback and critical forms must be verified. |
| Duplicate customer matching | Person reuse exists but universal duplicate policy not proven | **OPEN / ACCEPTANCE** | Execute duplicate identity variants and verify one customer record. |
| Financial/attribution/permission audit | Coverage incomplete | **PARTIAL** | Verify who/what/when/previous/new/reason/workspace for critical transitions. |
| 100-partner provisioning | No proven bulk fixture workflow | **OPEN / ACCEPTANCE** | Execute representative 100-partner fixture and verify uniqueness, referral links, workspace ownership and payout readiness. |
| Mobile/low-bandwidth | Responsive UI exists but no controlled device/network evidence | **PARTIAL** | Run 360×800, 390×844 and 412×915 critical-path checks plus interrupted/retry submissions. |

## 3. Existing implementation that is not a blocker

The current mainline already contains connected foundations for:

- workspace administration and membership;
- role-aware authorization;
- lead capture, scoring, ownership, next action and stage history;
- lead → customer conversion and customer timeline;
- quote/version/negotiation;
- accepted quote → order;
- order → payment;
- payment → reconciliation → revenue;
- partner/campaign/referral lineage;
- commission state machine;
- payout ledger;
- refund/reversal propagation;
- Telegram foundations;
- reporting foundations;
- mobile shell;
- localization dictionary and UI translation infrastructure.

These remain **IMPLEMENTED-UNVERIFIED** until controlled evidence is retained.

## 4. Required next implementation order

1. **Finish dispute attribution reconciliation.**
   - Resolve dispute.
   - Reassign linked commission to awarded partner.
   - Reassign linked revenue attribution.
   - Preserve referral-link context where an awarded partner/campaign link exists.
   - Record old/new attribution and actor in audit evidence.
   - Keep the operation workspace-scoped and atomic.

2. **Configure and verify trusted public workspace routing.**
   - Do not accept an arbitrary workspace ID from an unauthenticated browser.
   - Use deployment/domain/form configuration to map a public origin to a workspace.
   - Keep INTERNAL as the safe default for the Aslal public site.
   - Support the three-anchor fixture through explicit trusted configuration.

3. **Execute duplicate-customer acceptance rules.**
   - Email match.
   - Phone match.
   - Existing Person + changed contact detail.
   - Conflicting identity evidence must require explicit review rather than silently merging.

4. **Complete audit coverage.**
   - Payment confirmation/reconciliation.
   - Revenue changes.
   - Commission state changes.
   - Payout settlement.
   - Attribution override/dispute reassignment.
   - Permission/membership changes.

5. **Prepare representative 100-partner fixture.**
   - Use deterministic test data.
   - Verify unique partner IDs and referral links.
   - Verify workspace isolation.
   - Verify no duplicate commission/payout records.

6. **Run manual validation.**
   - `npm run typecheck`
   - `npm run lint`

7. **Execute the Q1 two-workspace behavioral matrix.**
   - Only after code-level blockers above are closed.
   - Retain screenshots/request-response records/database evidence as appropriate.
   - Do not mark Q1 accepted from code inspection or successful lint/typecheck.

## 5. Current release truth

This pass changes implementation controls but **does not change Q1 acceptance to PASS**.

The next acceptance checkpoint is:

**Workspace A/B → Finance/Sales/Auditor/Client → lead → customer → quote → order → payment PENDING → Finance CONFIRMED → reconciliation → revenue → commission QUALIFIED → Finance APPROVED → PAYABLE → payout settlement → refund/dispute/attribution checks → audit → reporting → mobile/localization checks.**



## Operational blocker closure alignment — 2026-09-26

The next implementation step is **Step 1 — Manual payment reconciliation workbench**.

Current mainline evidence was rechecked:
- payment capture UI exists in the Orders workspace;
- the hardened payment POST endpoint rejects direct CONFIRMED/REVERSED/REFUNDED creation and requires PENDING first;
- reconciliation PATCH requires evidence before RECONCILED and records verifier/activity;
- the Finance page currently focuses on commission approval and payout batches.

Therefore the remaining Step 1 gap is not absence of all payment UI; it is the mismatch between the existing capture UI and the hardened state contract, plus the absence of a Finance-controlled payment review queue.

The Q1 acceptance state remains **NOT ACCEPTED**. This correction changes implementation planning only; it does not provide behavioral acceptance evidence.


## 

### UI/Prisma alignment review — 2026-09-26

The current payment/revenue/commission Prisma model remains aligned with the Q1 lifecycle: `Payment` records remain PENDING until Finance confirmation, reconciliation evidence is persisted, `Revenue` is linked to the reconciled payment, and `Commission` is linked to revenue/payment/order. The Orders UI now records payments as PENDING and displays reconciliation history only; receipt matching, collection confirmation and reconciliation are owned by the Finance workbench. No Prisma schema change is required for this UI alignment pass. Behavioral database migration/production-schema verification remains an acceptance task.
Step 1 implementation progress — 2026-09-26

Step 1 implementation closed the previously identified UI/API mismatch. The Orders UI no longer attempts direct payment confirmation. Finance now has a dedicated reconciliation workbench backed by a workspace-scoped queue. The remaining Step 1 work is validation: typecheck, lint, and controlled payment lifecycle evidence.

Q1 remains NOT ACCEPTED.


## Step 2 implementation progress — 2026-09-26

**Step:** Sales SLA scheduler and notification safety.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Current mainline now has two distinct protected scheduler surfaces:

- `/api/cron/sales-automation` — internal lead SLA/workflow execution only;
- `/api/cron/telegram-followups` — customer-facing Telegram follow-up processing, separately authorized.

This separation is required for the Q1 acceptance contract because the Gate 2 SLA scheduler must not unexpectedly send promotional/customer follow-up messages. The workflow engine now atomically claims PENDING executions and due PENDING actions, reducing duplicate work under concurrent scheduler calls. Existing unique idempotency keys, overdue-deadline keys, bounded retries, stale-running recovery and stop-condition hooks remain in place.

### Remaining Step 2 evidence

1. Invoke the protected SLA scheduler with valid authorization.
2. Prove one high-intent execution and internal task/activity creation.
3. Repeat the same trigger key and prove no second execution.
4. Run the scheduler repeatedly against the same overdue deadline and prove one reminder execution/task.
5. Prove bounded retry and stale-running recovery.
6. Prove inbound reply cancellation.
7. Prove WON and LOST cancellation.
8. Prove Workspace A ownership never selects a Workspace B sales user.
9. Verify the operator automation view exposes recent/pending/failed executions by workspace.
10. Verify the SLA scheduler produces no customer promotional message; Telegram follow-up execution is tested separately under its own protected endpoint if the pilot requires it.
11. Run `npm run typecheck` and `npm run lint` and retain the results.

Q1 acceptance remains **NOT ACCEPTED** until these behavioral records are retained.


## Step 3 implementation progress — 2026-09-26

**Step:** Three-anchor workspace/client boundary.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

### Code changes

- Added `app/dashboard/client/page.tsx` as a dedicated workspace-scoped client CRM surface.
- CLIENT users are redirected from the generic dashboard to the dedicated surface.
- The client surface queries only through an authorized workspace context and applies `workspaceId = access.workspace.id` to client-visible lead/customer/order/task/commission data.
- CLIENT no longer receives `commerce.view`; order/payment visibility is presented through the controlled client surface instead of the broad operational Orders page.
- Existing `authorizeWorkspacePermission` membership checks remain the server-side boundary for workspace selection.

### Remaining behavioral evidence

1. Create/configure three anchor workspaces A/B/C.
2. Provision intended Finance, Sales, Auditor and Client users in each anchor.
3. Verify Client A sees only A leads/customers/orders/tasks/commission data.
4. Verify Client B and C similarly.
5. Attempt direct cross-workspace dashboard/API access with A credentials against B and C IDs; expect denial/no data leakage.
6. Execute existing Q1 negative tests for lead, quote, order, payment, customer, revenue, commission and payout paths.
7. Verify client users cannot reach generic operational mutation surfaces.
8. Retain screenshots/request-response/database evidence and local typecheck/lint results.

Q1 remains **NOT ACCEPTED**.


## Step 4 implementation progress — 2026-09-26

**Step:** 100-agent provisioning and identity.  
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

The prior `100-partner provisioning` gap is now closed at the implementation level. A protected admin endpoint and Partner workspace control provision the deterministic Q1 fixture `ASL-P-0001` through `ASL-P-0100` as pending AGENT records with deterministic referral identities.

The implementation is transactional, workspace-scoped and rerunnable. Matching fixture records are reused; identifier collisions with another workspace or non-fixture records fail closed. The fixture intentionally does not create credentials, payment, commission or payout activity.

### Remaining evidence

- Execute the 100-record fixture.
- Verify unique partner numbers and referral codes.
- Verify partner/referral workspace ownership.
- Repeat execution and verify no duplicates.
- Attempt unauthorized workspace provisioning and verify rejection.
- Retain database and request/response evidence.
- Keep the distinction between a test/pilot fixture and actual recruitment/vetting.

Q1 remains **NOT ACCEPTED**.


## Step 5 — Attribution policy and retention

**Status: IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING**

The Q1 attribution gap is now narrowed from an undefined policy to an explicit controlled model:

| Control | Mainline behavior |
|---|---|
| First touch | Visitor first source/medium/campaign/referral is retained with COALESCE semantics. |
| Last touch | Latest valid referral click for the resolved workspace is selected at lead capture. |
| Workspace boundary | Referral click must belong to the same workspace as the public lead capture. |
| 30-day window | Referral cookie is 30 days; lead attribution expiry is derived from the qualifying click timestamp. |
| Lock | Partner-attributed lead is locked at capture. |
| Override | Locked attribution requires partner-management authorization and an explicit reason. |
| Dispute | Competing attribution is resolved through the existing workspace-scoped dispute workflow. |
| Financial reassignment | Resolved disputes update linked commission/revenue attribution through the controlled transaction path. |

Remaining evidence gap: execute the controlled tests, including a forced transaction failure, and retain database/audit evidence. Code presence is not acceptance evidence.
\n\n## Step 6 — Client audit/reporting and campaign distribution\n\n**Status: IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING**\n\nThe weekly audit/reporting gap now has a concrete mainline path: /api/admin/reports/weekly-pipeline is workspace-scoped, supports explicit date ranges, returns structured JSON, and exports CSV. It preserves first-touch fields and joins current partner/campaign attribution, published asset count, opportunity state/value and confirmed-order evidence. The CLIENT CRM exposes the seven-day export.\n\nExisting Telegram partner campaign details already select only PUBLISHED assets within the partner workspace.\n\nRemaining evidence gap: execute the audit for the anchor workspaces, verify repeatability and cross-workspace denial, then reconstruct a controlled campaign → asset → referral → visitor/lead lineage and prove unpublished assets remain hidden.\n

## Step 7 — Operational SOP and evidence pack

**Status: IMPLEMENTED FOUNDATION — OPERATIONAL ACCEPTANCE PENDING**

A dedicated Q1 operator SOP/evidence document now maps disputed attribution, cancellation/refund, merchant invoicing/collection, payout preparation, and receipt exception handling to system controls, actors, evidence and recovery paths.

Remaining gap: SOP existence is not operational proof. Each procedure must be executed and its evidence retained, including failed-transaction rollback and the distinction between payout preparation and actual external settlement.
