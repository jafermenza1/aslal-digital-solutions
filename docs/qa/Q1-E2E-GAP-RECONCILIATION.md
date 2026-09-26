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
| Dispute reassignment | Resolution stored awarded partner but did not recalculate commission/revenue | **OPEN** | Resolution must update commercial attribution atomically and retain audit history. |
| Public workspace routing | Public lead capture is still hard-bound to INTERNAL workspace | **OPEN / DESIGN REQUIRED** | Three-anchor fixture needs a trusted workspace-routing mechanism; arbitrary client-supplied workspace IDs must not be trusted. |
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

2. **Implement trusted public workspace routing.**
   - Do not accept an arbitrary workspace ID from an unauthenticated browser.
   - Use deployment/domain/form configuration to map a public origin to a workspace.
   - Keep INTERNAL as the safe default for the Aslal public site.
   - Support the three-anchor fixture through explicit trusted configuration.

3. **Complete duplicate-customer acceptance rules.**
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

