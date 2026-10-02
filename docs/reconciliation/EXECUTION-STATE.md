# Growth OS Execution State

**Current baseline:** 2026-09-23  
**Current mainline:** `main` @ `7d546c410c9c2f39b7d865f713d075ac3523b3d8`
**Latest verified CI:** workflow run `36011102581` for `2a9f40fd95a41c9f4fba42cfe7bd3555ccdf20bd` — SUCCESS (typecheck, lint, production build, Emerald packaging)
**Latest verified deployment:** Emerald workflow run `36011395603` for `2a9f40fd95a41c9f4fba42cfe7bd3555ccdf20bd` — SUCCESS

## Current acceptance-readiness audit — 2026-09-26

**Audit result:** Gate 1 implementation is present on current `main`, but Gate 1 is **not accepted**. The earlier repository audit that reported missing workspace UI and missing Finance/Auditor/Client roles was based on an older mainline snapshot; subsequent Gate 1 commits have now implemented those prerequisites. The remaining work is behavioral verification, not re-planning those already-landed foundations.

### Gate 1 implementation now present on main

- Explicit account roles: `FINANCE`, `AUDITOR`, `CLIENT`.
- Workspace administration UI and lifecycle API.
- Atomic workspace creation with creator OWNER membership.
- Workspace member inspection and assignment with explicit workspace roles.
- User creation requires an authorized workspace and creates the user + workspace membership transactionally.
- Active-workspace context and workspace authorization are implemented.
- Partner and referral-link creation now binds both records to the selected workspace.
- Agent and influencer types use the same workspace-bound partner creation path.

### Gate 1 evidence still required

- Create real Workspace A and Workspace B through the UI.
- Create Finance, Auditor and Client users and verify login/permissions in the intended workspace.
- Create Sales B and assign it to Workspace B; prove Workspace A/B isolation with authenticated sessions.
- Create Agent and Influencer records in both workspaces and verify referral-link ownership.
- Execute the negative cross-workspace scenarios.
- Run local `npm run typecheck` and `npm run lint` under the current no-Actions policy.
- Do not mark Gate 1 accepted from code existence alone.

### Future gate sequence

**Gate 1 — Workspace Administration and Access → Gate 2 — Sales Follow-up/SLA → Gate 3 — Quote/Negotiation Acceptance → Gate 4 — Order/Payment/Reconciliation → Gate 5 — Revenue/Campaign Attribution → Gate 6 — Partner/Influencer Commerce → Gate 7 — Trust/Retention → Gate 8 — Full End-to-End Acceptance → Gate 9 — RBAC/Multi-Tenancy Scale Proof → Gate 10 — Capacity Scaling → Gate 11 — AI only after reliable transaction data.**

The acceptance document for the end-to-end journey remains the controlling behavioral test plan; each gate must produce evidence before the next gate is treated as accepted.

## Authority chain

1. `docs/PRD-ASLAL-GROWTH-OS-v1.0.md`
2. `docs/reconciliation/README.md`
3. `docs/reconciliation/TRACEABILITY.md`
4. `docs/reconciliation/DOMAIN-CONTRACT.md`
5. `docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`
6. This file

## Current phase truth

| Phase/domain | Status | Evidence/state |
|---|---|---|
| Product/domain baseline | SATISFIED | PRD, domain contract and phase controls exist. |
| Deployment pipeline | SATISFIED | CI builds/packages/uploads; deployment installs release and runs Prisma migrations. |
| Production schema | SATISFIED | Ten migrations are present in current main and the current release was installed successfully by Emerald deployment `35915809923`; production business-data integrity remains a separate gate. |
| Sales execution | IMPLEMENTED-UNVERIFIED | Owner, next action, due date, stage history, phone normalization and admin corrections exist; fresh post-migration production data evidence is required. |
| Identity/customer foundation | SATISFIED | Person, Opportunity, Customer, Activity, visitor/event/Growth Opportunity foundations have recorded acceptance evidence. |
| Phase 4A conversations | SATISFIED | Canonical Conversation/Message, consent, opt-out, handoff, signed inbound boundary, idempotency and controlled simulations exist. |
| Provider-specific live messaging | IMPLEMENTED-UNVERIFIED / DEFERRED | Real credentials, templates, provider callbacks and live acceptance are not universal. |
| Automation engine | IMPLEMENTED-UNVERIFIED | Durable Workflow, WorkflowVersion, WorkflowExecution and WorkflowActionExecution models plus an internal-only engine now exist; production execution evidence remains. |
| Quote/negotiation | IMPLEMENTED-UNVERIFIED | Phase 6A first-class versioned Quote, QuoteItem and NegotiationEvent records plus controlled lifecycle/revision API and dashboard workspace are deployed; controlled send/revise/accept/reject reconstruction evidence remains. Order/payment remain unimplemented by design. |
| Revenue attribution | PARTIAL | Lead/opportunity deal values and reports exist; collected-payment evidence is not yet the source of revenue truth. |
| Campaign/asset attribution | PARTIAL | Source/campaign/referral strings exist; first-class Campaign/Campaign Asset lifecycle is absent. |
| Partner/influencer commerce | PARTIAL | Phase F now provides first-class campaign opportunities, partner matching/application, verification/tier controls, partner self-service workspace, disputes and payout ledger; confirmed-payment commission lineage and product eligibility remain incomplete. |
| Trust/reviews | MISSING | Target-state trust layer is not implemented as a complete domain. |
| Retention/referral | MISSING | Post-sale retention and customer-advocacy workflows are not complete. |
| RBAC/multi-tenancy | PARTIAL / SCALE BLOCKER | Single-admin access exists; tenant isolation and full role matrix do not. |
| Privacy lifecycle | PARTIAL | Channel preferences/security boundaries exist; full retention/export/deletion/anonymization remains incomplete. |
| Mobile/low-bandwidth | PARTIAL | Operations dashboard now uses responsive tabbed navigation and mobile cards; critical-path device/network evidence remains. |
| Production integrity automation | IMPLEMENTED-UNVERIFIED | Endpoint and workflow exist; the recorded workflow failed because required GitHub Actions secrets were missing. |
| End-to-end Growth OS | MISSING | Full acquisition → payment → revenue → commission → retention journey is not yet demonstrated. |
| Product/service catalog | IMPLEMENTED-UNVERIFIED | DB-backed admin/public catalog, detail pages, optional imagery, public CTA and product-ID lead attribution implemented; current mainline is awaiting CI/deployment/acceptance. |
| Offline/manual lead capture | IMPLEMENTED-UNVERIFIED | Admin-authorized capture with offline source/category, campaign context, optional catalog interest, normal ownership, scoring and Phase 5 trigger implemented; deployment/acceptance remains. |
| Transactional contact auto-reply | IMPLEMENTED-UNVERIFIED | Consent-gated branded HTML auto-reply and configurable template editor implemented; SMTP/provider/deployment acceptance remains. |
| User roles/editable permissions | PARTIAL | Managed User accounts, business-owner role, editable permissions and user audit foundation implemented; legacy application routes still need full permission enforcement and tenant isolation remains a scale blocker. |
| AI intelligence | MISSING / DEFERRED | Must follow reliable transaction and attribution data. |

## Historical production integrity snapshot

The last known production-integrity result before the latest admin migration recorded:

- 18 active leads;
- 6 missing owners;
- 6 missing next actions;
- 6 missing due dates;
- 12 overdue lead actions;
- 2 WON leads missing positive deal value;
- 2 WON leads without customer relationship;
- 1 open task previously overdue.

This is historical evidence, not current post-migration truth. The latest migration was additive and did not fabricate historical values.

## Operations and partner workspace extension

The operations workspace was tightened around real sales execution: the readiness narrative was removed, new follow-up tasks require an internal owner and due date, owners are selected from active internal users rather than free-text addresses, and existing unassigned tasks remain visible for explicit correction. The partner workspace now creates a referral identity, wallet-size printable partner card with QR code, automatic card email delivery with admin fallback, optional partner login credentials stored only as a password hash, campaign opportunities and partner self-service operations. A partner portal route exposes only partner-attributed performance. Phase F extends this with campaign matching, verification/tier controls, disputes and payout ledger history. This remains **PARTIAL** for the broader partner-commerce domain because revenue-confirmed commission lineage, product eligibility and the remaining commercial gates are not thereby satisfied.

CI `35923732403` passed typecheck, lint, production build, standalone packaging and artifact upload. Emerald deployment `35923977700` passed artifact verification, release installation and production health.

## CI correction — dashboard help

The dashboard help route type correction was completed as a contained CI/quality correction inside the owning phase. The change preserves the existing permission contract and replaces the fragile inline tuple assertion with an explicitly typed section collection. CI run 35920479143 passed typecheck, lint, production build, standalone packaging and artifact upload; Emerald deployment 35920738018 passed artifact verification, release installation and production health. This correction does not change phase status, roadmap order, authorization policy, business data, or acceptance claims.

## CI correction — verify artifact quota tolerance

CI run `36065338086` failed in job `verify` at the `actions/upload-artifact@v4` step with `Failed to CreateArtifact: Artifact storage quota has been hit.` Typecheck, lint, build and packaging completed before that failure. The CI workflow now marks artifact upload as non-blocking and reduces artifact retention from 14 days to 3 days so verification remains truthful about code quality while lowering repeated storage pressure. This correction does not change phase order, business-domain scope, or acceptance claims.

## UI foundation extension (supporting work; no phase reorder)

The dashboard now has a shared permission-aware shell with separate left-side tabs, icon navigation, mobile horizontal navigation, dark/light theme controls and website-language inheritance. The public locale reader and root layout now derive supported locales from the shared dictionary rather than hard-coding the current three languages. Public /products cards use the canonical product detail links with gold hover treatment.

Users, product catalog and email-template administration are separate workspaces. Email templates are visually grouped under Conversations in the shared navigation, while the Product Catalog and Users remain independent management tabs.

An app UI translation dictionary and editing guide are now checked into the repository. This supports R41 mobile/low-bandwidth usability, R46 catalog presentation, R48 email-template administration and R49 permission-aware navigation. Acceptance statuses are unchanged because controlled production/device evidence is still required.

## Current exact next action

1. Complete Gate 1 behavioral acceptance with real Workspace A/B fixtures; do not mark Gate 1 accepted from code existence.
2. Execute Gate 2 controlled sales-follow-up acceptance using the contract in `docs/gates/GATE-2-SALES-FOLLOWUP.md`.
3. Prove workspace-scoped automated ownership, high-intent idempotency, overdue deduplication, reply cancellation and WON/LOST cancellation.
4. Run `npm run typecheck` and `npm run lint` locally; no GitHub Actions workflow is expected under the current cost-control policy.
5. Reconcile R20/R21 only after behavioral evidence exists.
6. Complete the Phase 6A controlled quote acceptance only after the preceding gate evidence is recorded.
7. Do not enable shared multi-tenant SaaS, payment-backed revenue, automated partner commissions or AI autonomy until their roadmap gates are separately satisfied.

## Hard scaling stops

Do not:

- enable shared multi-business SaaS before tenant isolation and RBAC;
- enable high-volume automated customer messaging before stop-condition and consent acceptance;
- claim payment-connected revenue before Order/Payment/reconciliation acceptance;
- claim automated partner commissions from collected revenue before commercial attribution acceptance;
- add AI autonomy to compensate for incomplete data.

## Deployment evidence

CI `35888225371` for the Phase 5 enum correction succeeded.

CI `35890441292` for the responsive operations dashboard refinement succeeded.

Emerald deployment `35890757898` succeeded for current mainline `585956fee10f66ffbaf1b46f213b84d2d947a8a6`.

The deployment workflow passed artifact verification, release installation and production health verification. The current release includes the catalog, offline-lead, user-access and transactional-email extensions. Business-flow acceptance for those extensions is still required.

## Active roadmap

The authoritative implementation and scaling sequence is:

`docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`

Immediate sequence:

**Production Integrity Closure → Phase 5 Sales Follow-up → Quote/Negotiation → Order/Payment → Revenue/Campaign Attribution → Partner/Influencer Commerce → Trust/Retention → End-to-End Verification → RBAC/Multi-Tenancy → Capacity Scaling → AI**

## Gate 1 continuation — workspace administration and access contract

**Mainline:** `main`  
**Status:** IMPLEMENTED — VERIFICATION PENDING

Gate 1 was resumed from the Q1 API-gap audit without resetting or replacing the existing workspace/commercial implementation.

Completed in this increment:
- Added the explicit Finance, Auditor and Client account roles while preserving all existing roles.
- Added least-privilege default permission sets for the three new roles.
- Made user creation require an authorized workspace and persist workspace membership transactionally.
- Added workspace administration UI for create, edit, activate/deactivate, member inspection and active-workspace selection.
- Made workspace creation atomic with creator OWNER membership.
- Added workspace lifecycle API and authorized active-workspace cookie context.
- Bound workspace membership reads/writes to the target workspace authorization boundary.
- Bound partner and referral-link creation to the active/selected workspace, removing the previous mandatory-workspace database failure path.
- Added Gate 1 contract and acceptance matrix at docs/gates/GATE-1-WORKSPACE-ADMIN.md.

Remaining evidence:
- Execute the two-workspace behavioral acceptance with real Workspace A/B fixtures and authenticated sessions.
- Verify Finance, Auditor, Client and Sales B end-to-end through UI/login/workspace assignment.
- Verify Agent and Influencer creation end-to-end in separate workspaces.
- Run authorized typecheck and lint.
- Do not mark Gate 1 accepted from code existence alone.

## Workflow restoration — 2026-09-26

**Branch:** `restore/build-deploy-workflow`  
**Status:** IMPLEMENTED — VALIDATION PENDING

The production build and Emerald deployment path has been restored as a contained deployment correction. Production-integrity and sales-automation workflows remain intentionally disabled.

Restored:
- CI production build using `npm run build`.
- Standalone Emerald release packaging.
- Commit-keyed deployment artifact upload with three-day retention.
- Automatic Emerald deployment after successful CI on `main`.
- Manual deployment for an explicitly supplied `main` commit SHA.
- Artifact verification before SSH transfer.
- Prisma `migrate deploy` against the production environment before the live application release is switched.
- Passenger restart request and `/api/health` verification.

Required GitHub repository secrets:
- `EMERALD_HOST`
- `EMERALD_PORT` (optional; defaults to 22)
- `EMERALD_USER`
- `EMERALD_SSH_KEY`
- `EMERALD_KNOWN_HOSTS` (optional)
- `EMERALD_APP_PATH` (optional; defaults to `/home/aslaldzn/aslal-digital-solutions`)
- `EMERALD_HEALTH_URL` (optional; defaults to `https://aslaldigital.com/api/health`)

This restoration does not constitute production deployment or behavioral acceptance. Those remain separate evidence gates.


## Gate 2 continuation — Sales Follow-up and SLA

**Mainline:** `main`
**Status:** IMPLEMENTED — ACCEPTANCE PENDING
**Contract:** `docs/gates/GATE-2-SALES-FOLLOWUP.md`

The Gate 2 owner-assignment path was hardened so automated owner selection is constrained to active sales-capable users who belong to the lead's workspace. Offline/manual lead capture uses the same workspace-scoped owner rule. This prevents automation from assigning Workspace A work to a Workspace B salesperson.

The durable workflow engine, high-intent triage, overdue reminder, idempotency keys, retry controls, cancellation hooks and protected scheduler endpoint remain implemented. Behavioral acceptance is still pending and must be performed without restoring GitHub Actions.

**Gate 2 acceptance remains pending:** scheduler/manual invocation, completed execution, idempotency, overdue deduplication, reply cancellation, WON/LOST cancellation, retry/stale recovery, no recent failed/stuck executions, operator visibility, and local typecheck/lint evidence.


## Q1 acceptance blocker closure — 2026-09-26

The remaining pre-acceptance code blockers identified during the current-main audit were closed without expanding Q1 scope:

- Finance now has the `commerce.manage` permission required by payment/reconciliation mutation APIs, plus `operations.view` for the financial operating surface.
- Commission operations UI no longer offers the invalid `PAYABLE → PAID` transition. PAID remains payout-controlled; PAYABLE can only move to VOID from the commission state endpoint.
- User provisioning now prevents non-administrators from creating ADMIN/SUPER_ADMIN accounts.
- User provisioning now prevents non-administrators from assigning OWNER/ADMIN workspace roles.
- Existing-user account-role escalation is blocked for non-administrators.
- Partner creation now returns more actionable conflict/constraint errors instead of collapsing all such failures to the generic partner-creation message.

These changes close the identified **code-level** acceptance blockers. They do not constitute acceptance evidence.

### Next Q1 action

Run the controlled two-workspace Q1 acceptance fixture:

`Workspace A + Workspace B → Client/Finance/Auditor/Sales users → Agent/Influencer → cross-workspace negative tests → Lead → Customer → Quote → Order → Payment → Reconciliation → Revenue → Commission → Payout → Refund/Dispute/attribution checks`.

Validation remains local/manual under the current no-Actions policy:

`npm run typecheck`
`npm run lint`

Gate acceptance must wait for behavioral evidence.


## Q1 acceptance-blocker hardening — 2026-09-26

Current main has completed the remaining schema/UI alignment work identified before Q1 acceptance execution:

- UserRole and Gate 1 account roles remain aligned: FINANCE, AUDITOR, and CLIENT are explicit.
- WorkspaceUser.role is now a Prisma WorkspaceRole enum matching the Gate 1 workspace-role contract.
- A MariaDB migration normalizes legacy INTERNAL workspace memberships to MEMBER before enforcing the enum.
- User-management permission defaults and the visible permission editor are aligned with the Gate 1 role contract.
- Account-role selection in the user UI now automatically selects the corresponding workspace role for Finance, Auditor, Client, Sales, Partner, and management roles.
- Existing-user editing no longer presents workspace assignment as if the account-role edit endpoint were changing membership; workspace membership remains managed through Workspace Administration.
- Partner creation already resolves and persists the authorized workspace on both partners and referral_links, with actionable authorization/constraint errors.
- Commission UI/backend state is aligned: PAYABLE cannot be changed directly to PAID; payout settlement is the only path to PAID.

Current main: 6c56e52e22018f15506e75e5e21f7b7c524344ac

These changes remove implementation/schema mismatches; they do not mark Gate 1 or the Q1 E2E plan accepted. Local npm run typecheck and npm run lint, followed by the isolated two-workspace behavioral acceptance matrix, remain required.


## Q1 E2E gap reconciliation pass — 2026-09-26

**Branch:** `main`  
**Status:** **IMPLEMENTED — BEHAVIORAL ACCEPTANCE PENDING**  
**Control record:** `docs/qa/Q1-E2E-GAP-RECONCILIATION.md`

This pass reconciles the current mainline against the Q1 commercial journey before executing the acceptance fixture.

### Completed in this pass

- Added dedicated `commissions.manage` and `payouts.manage` permissions.
- Finance now has payment/reconciliation, commission approval and payout operating permissions without requiring broad partner-management authority.
- Payment submission defaults to `PENDING` and rejects direct `CONFIRMED`, `REVERSED` and `REFUNDED` creation; those states require controlled transition paths.
- Added lead attribution lock metadata: lock timestamp, locking actor and override reason.
- Public partner-attributed lead capture locks attribution at first capture.
- Lead admin attribution edits now require partner-management authorization when locked and always retain an audit reason.
- Added Arabic locale content and RTL root-layout behavior.
- Added a Prisma migration for attribution-lock fields.

### Remaining Q1 gaps before acceptance

1. Dispute resolution now reassigns linked commission/revenue attribution and retains old/new audit evidence; transaction-failure atomicity still needs behavioral proof.
2. Public lead capture now uses trusted host → workspace configuration with INTERNAL fallback; configure and verify the three-anchor fixture.
3. Duplicate-customer matching now blocks same-workspace duplicate customer creation by email/phone; execute the behavioral matrix.
4. Financial, attribution and permission audit coverage must be checked across every critical transition.
5. A deterministic 100-partner fixture must be executed and evidence retained.
6. Mobile/low-bandwidth and Arabic/RTL critical-path tests still require actual device/browser evidence.
7. Local `npm run typecheck` and `npm run lint` must be run; no GitHub Actions should be restored for this phase.

### Acceptance checkpoint

The next controlled fixture is:

**Workspace A/B → Finance/Sales/Auditor/Client → Lead → Customer → Quote → Order → Payment PENDING → Finance CONFIRMED → Reconciliation → Revenue → Commission QUALIFIED → Finance APPROVED → PAYABLE → Payout Settlement → Refund/Dispute/Attribution → Audit → Reporting → Mobile/Localization**

No Q1 or Gate 1 status is upgraded from code inspection alone.


## Q1 operational blocker closure status — 2026-09-26

The canonical implementation sequence is now explicitly controlled by the Q1 Operational Blocker Closure Program in docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md.

**Current step: Step 1 — Manual payment reconciliation workbench.**

Important correction from the prior audit: the current mainline already has payment/reconciliation controls in app/dashboard/orders/OrdersWorkspace.tsx and evidence/verifier enforcement in app/api/payments/[id]/route.ts. The remaining blocker is that the UI still attempts direct CONFIRMED payment creation while the hardened API correctly requires PENDING first, and the Finance page does not yet provide the dedicated payment review queue.

No GitHub Actions workflow is to be restored. Validation remains manual/local with npm run typecheck and npm run lint when code changes are made.

Q1 remains **NOT ACCEPTED** until all blocker steps and the controlled behavioral evidence gate are complete.


## Step 1 implementation progress — 2026-09-26

**Current step:** Step 1 — Manual payment reconciliation workbench.

Implementation is now in `main`: PENDING-first capture, Finance review queue, receipt/evidence matching, authorized confirmation, evidence-gated reconciliation and exception handling. **Acceptance is still pending** until local typecheck/lint and controlled end-to-end evidence are retained.


## Step 2 implementation progress — 2026-09-26

**Current blocker-closure step:** Step 2 — Sales SLA scheduler and notification safety.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Mainline changes for this step:

- protected sales SLA scheduler remains available at `/api/cron/sales-automation` and now runs only the internal workflow scheduler;
- customer-facing Telegram follow-ups are isolated at `/api/cron/telegram-followups` with separate authorization support;
- WorkflowExecution claiming is atomic for PENDING executions;
- WorkflowActionExecution claiming is atomic for due PENDING actions;
- existing workspace-scoped owner selection, trigger idempotency, overdue-deadline deduplication, bounded retries, stale-running recovery, inbound-reply cancellation and WON/LOST cancellation are preserved;
- no GitHub Actions scheduler is restored.

### Step 2 exit evidence still required

Protected scheduler response, high-intent execution, repeated-trigger idempotency, overdue deduplication, retry/stale recovery, reply cancellation, WON/LOST cancellation, workspace-scoped ownership, operator visibility, customer-messaging safety and local typecheck/lint evidence.

No Q1 or Gate 2 acceptance status is upgraded from code existence alone.


## Step 3 implementation progress — 2026-09-26

**Current blocker-closure step:** Step 3 — Three-anchor workspace/client boundary.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Mainline changes:

- dedicated `/dashboard/client` surface for CLIENT users;
- workspace authorization occurs before client CRM data access;
- client-visible leads, customers, orders, tasks and commission totals are explicitly filtered by the authorized workspace;
- CLIENT role no longer has generic `commerce.view`; this prevents accidental exposure of the broad Orders workspace;
- generic dashboard redirects CLIENT to the dedicated client CRM surface;
- existing workspace membership and server-side workspace authorization remain mandatory.

### Step 3 evidence still required

Three anchor workspaces A/B/C; Finance/Sales/Auditor/Client role provisioning; client-only scoped reads; cross-workspace negative route/API tests; operational-surface denial; retained request/response/database evidence; and local typecheck/lint evidence.

No Q1 acceptance status is upgraded from code existence alone.


## Step 4 implementation progress — 2026-09-26

**Current blocker-closure step:** Step 4 — 100-agent provisioning and identity.  
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

The Partner workspace now exposes an administrator-only deterministic Q1 fixture provisioner. The backend provisions up to 100 pending AGENT records as `ASL-P-0001` through `ASL-P-0100`, creates deterministic referral codes, binds both records to the authorized workspace and executes the batch transactionally.

The operation is idempotent for matching fixture records and fails closed for workspace collisions or existing non-fixture identities. It creates no credentials or financial activity.

Step 4 is not behaviorally accepted until the fixture is executed with retained count, uniqueness, workspace-boundary, repeat-run and unauthorized-access evidence. This fixture does not substitute for recruiting or vetting 100 real agents.


## Step 5 execution state — 2026-09-26

**Step 5 — Attribution policy and 30-day retention**  
**Status: IMPLEMENTED FOUNDATION — ACCEPTANCE PENDING**

Mainline now has an explicit first-touch/last-touch policy and a 30-day referral retention boundary. First-touch visitor acquisition fields remain immutable; the latest valid workspace-scoped referral click is selected as last-touch partner attribution at lead capture; the lead stores an attribution expiry timestamp; the referral cookie expires after 30 days; expired or cross-workspace referral attribution is rejected.

Existing attribution-lock, audited override and competing-partner dispute controls remain authoritative.

**Required evidence:** first/last-touch fixture, 30-day expiry fixture, cross-workspace rejection, locked-edit denial, authorized override reason/audit, competing-agent dispute reassignment, and failed-transaction atomicity proof.

Q1 remains **NOT ACCEPTED**.

## Local application validation repair — 2026-09-28

**Starting commit:** `b967a1f`

The local repair corrected committed TypeScript parser defects, missing search-profile imports and page loads, product/catalog data-shape guards, Telegram keyboard shadowing, MySQL query row typing, and lint issues in the insights, brand-logo, and Website Studio surfaces. No deployment workflow or database was changed.

**Validation evidence:** `npm run typecheck` PASS; `npm run lint` PASS; `npm run build` PASS; `npm run q1:test-boundary` BLOCKED because `Q1_BASE_URL` is not configured in this Codespace. The production build prepared `.next/standalone/server.js` and the PDFKit Helvetica runtime asset. Q1 behavioral acceptance remains pending.
\n\n## Step 6 execution state — 2026-09-26\n\n**Step 6 — Client audit/reporting and campaign distribution**  \n**Status: IMPLEMENTED FOUNDATION — ACCEPTANCE PENDING**\n\nA workspace-scoped weekly pipeline audit/export is now implemented. The endpoint requires dashboard.view, defaults to seven days, accepts explicit bounds, returns JSON, and supports CSV export. The client CRM links the seven-day export. The audit joins first-touch data, current attribution, partner/campaign lineage, published asset count, opportunity evidence and confirmed-order evidence within the authorized workspace.\n\nExisting partner-facing campaign delivery continues to select only published assets from the partner's workspace.\n\n**Required evidence:** anchor-workspace audit exports, same-range repeatability, cross-workspace denial, campaign/asset/referral/visitor/lead lineage reconstruction, and unpublished-asset visibility denial.\n\nQ1 remains **NOT ACCEPTED**.\n

## Step 7 execution state — 2026-09-26

**Step 7 — Operational SOP and evidence pack**  
**Status: IMPLEMENTED FOUNDATION — ACCEPTANCE PENDING**

Added docs/ops/Q1-OPERATOR-SOP-EVIDENCE.md. It maps the required Q1 operator procedures to system controls, actors, evidence records and recovery paths. It explicitly records the known partial payout-batch capability rather than treating preparation as settlement.

**Required evidence:** one controlled execution per SOP, authorization/state-transition evidence, failed-transaction rollback proof, receipt-exception proof and payout settlement evidence.

Q1 remains **NOT ACCEPTED**.


## Main Commercial Engine — CE-1 implementation update

**Increment:** CE-1 — Commercial Listing Foundation  
**Status:** IMPLEMENTED — VERIFICATION PENDING

The first commercial-engine increment is now implemented on the PR #99 branch as an extension of the existing Product/Service catalog.

Implemented:
- `CommercialListing` Prisma model and lifecycle/type enums;
- checked-in Prisma migration;
- workspace-scoped listing create/read/update API;
- existing `products.manage` authorization boundary reused for CE-1;
- listing manager under Dashboard → Commercial Listings;
- public `/marketplace` discovery surface;
- public `/marketplace/listings/[slug]` detail surface;
- optional linkage from a listing to an existing workspace Product/Service;
- support for standalone asset/property listings without creating a second product catalog.

Not implemented by CE-1:
- partner authorization;
- partner eligibility;
- deal registration;
- attribution protection;
- inspection scheduling;
- wanted requests;
- supply-demand matching;
- provider/RFP workflows;
- external payment evidence;
- leakage/dispute automation.

CE-1 is **not accepted** from code existence alone. Required evidence includes Prisma migration/application validation, local typecheck/lint/build, workspace A/B authorization tests, public visibility/status tests, product-to-listing workspace mismatch rejection, and controlled create/edit/publish behavior.
## Main Commercial Engine — CE-2 implementation update

**Increment:** CE-2 — Owner/Supplier Authorization  
**Status:** IMPLEMENTED — VERIFICATION PENDING

CE-2 extends CE-1 without replacing the existing Product/Service catalog or workspace authorization boundary.

Implemented:
- commercial party registry for business, supplier, asset-owner, service-provider and external-owner relationships;
- explicit owner and supplier references on CommercialListing;
- listing publication guard requiring an identified commercial owner;
- listing distribution authorization records for staff users, partners and commercial parties;
- authorization lifecycle: REQUESTED, APPROVED, ACTIVE, SUSPENDED, EXPIRED, REVOKED;
- authorization scope fields for effective/expiry dates, territory, channel, partner types, quantity limit, commission rule, protection days and exclusions;
- workspace-scoped owner/supplier/authorization APIs using existing `products.manage` permission;
- workspace membership/partner validation before authorization can be attached;
- dashboard owner/supplier selection and CE-2 authorization workbench;
- historical authorization is retained when an authorization is revoked; revocation does not delete listing, attribution or commercial history.

Not implemented by CE-2:
- partner eligibility evaluation;
- automatic promotion-asset blocking based on eligibility;
- deal registration/protection;
- commission-contract creation or automatic commission calculation;
- inspection/appointment;
- demand requests/matching;
- external payment evidence;
- leakage/dispute automation.

CE-2 is **not accepted** from code existence alone. Required evidence includes Prisma migration/application validation, local typecheck/lint/build, Workspace A/B authorization isolation tests, owner/supplier mismatch rejection, staff/partner workspace membership rejection, publication-without-owner rejection, authorization lifecycle transitions, and revoked-history preservation.

## Main Commercial Engine — CE-3 implementation update

**Increment:** CE-3 — Partner Eligibility  
**Status:** IMPLEMENTED — VERIFICATION PENDING

Implemented:
- explicit eligibility decision record with ELIGIBLE, INELIGIBLE and REVIEW_REQUIRED outcomes;
- auditable reason codes and criteria snapshots rather than an opaque boolean;
- checks for partner status, account restrictions, verification suspension and onboarding completion;
- authorization status and listing publication/availability checks;
- optional partner-program checks for published program, allowed partner types, active commission contract and accepted terms;
- authorization-level partner type, territory and channel restrictions;
- program association on commercial listing authorizations;
- workspace-scoped eligibility evaluation API and dashboard evaluation control;
- ACTIVE/APPROVED partner authorization is held in SUSPENDED state when current eligibility is not proven, preserving the authorization history rather than silently granting distribution rights.

Not implemented by CE-3:
- automatic deal registration;
- attribution protection;
- inspection/appointment;
- demand matching;
- commission calculation;
- leakage/dispute automation.

Required acceptance evidence remains: Prisma migration/application validation, typecheck/lint/build, Workspace A/B eligibility isolation, eligible/ineligible partner fixtures, program/contract/terms cases, partner-type/territory/channel cases, expired/unpublished listing cases, and proof that ineligible partners cannot receive an ACTIVE commercial authorization.


## Main Commercial Engine — CE-4 Deal Registration — 2026-10-02

**Status:** IMPLEMENTED — VERIFICATION PENDING

Implemented on PR #99:
- CommercialDealRegistration schema and Prisma migration;
- workspace/listing/partner/lead/authorization/opportunity relationships;
- eligibility re-check at registration and approval;
- active registration conflict detection by lead and buyer contact identifiers;
- explicit approval/rejection/protection/conversion/dispute/expiry lifecycle;
- authorization-configured protection period with 90-day fallback;
- explicit lead attribution lock integration on approval;
- protection against silently overwriting another active attribution lock;
- dashboard registration/review workbench.

Not yet accepted:
- Prisma migration application against a real database;
- typecheck/lint/build;
- workspace A/B behavioral isolation;
- duplicate/conflict scenarios with real fixtures;
- approval/rejection/protection/expiry/conversion/dispute behavioral evidence;
- reconciliation against actual partner attribution and downstream commission/order workflows.

CE-4 does not yet implement inspection, commission calculation, payment evidence, leakage automation, or dispute resolution beyond recording the commercial registration as DISPUTED.
