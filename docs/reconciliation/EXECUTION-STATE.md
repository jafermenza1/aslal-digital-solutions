# Growth OS Execution State

This is the single repository handoff for developers and AI agents. It records what is complete on main, what is proposed, what is blocked, and the exact next action.

## Authority chain

1. docs/PRD-ASLAL-GROWTH-OS-v1.0.md — product requirements.
2. docs/reconciliation/README.md — phase boundaries and integrity rules.
3. docs/reconciliation/TRACEABILITY.md — requirement/evidence matrix.
4. This file — current execution state and next action.
5. Phase implementation documents — detailed evidence and acceptance gates.

If records disagree, reconcile the documentation before treating implementation as complete.

## Allowed requirement statuses

Only:
- MISSING
- PARTIAL
- IMPLEMENTED-UNVERIFIED
- SATISFIED
- BLOCKED

Do not invent status synonyms.

## Phase ledger

| Phase | Scope | Main status | Meaning |
|---|---|---|---|
| 1 | Baseline and Domain Contract | SATISFIED | Reconciliation framework, PRD authority, domain contract and traceability controls are on main. |
| 2 | Sales Execution Integrity | IMPLEMENTED-UNVERIFIED | Implementation exists in open PR #18; not merged/accepted on main. |
| 3 | Identity, Engagement, Customer Journey | IMPLEMENTED-UNVERIFIED | Implementation exists in open PR #19; not merged/accepted on main. |
| 4 | Conversations and Channel Adapters | MISSING | Roadmap phase is explicitly queued. Implementation starts only after the Phase 4 entry gate is reached. Current build/verification issues are deferred to the consolidated verification record rather than changing the roadmap. |
| 5 | Automation Engine | MISSING | Future phase; no implementation should be introduced now. |
| 6 | Campaign, Partner, Revenue, Payment | PARTIAL | Existing foundations exist, but this reconciliation phase has not been accepted. |
| 7 | End-to-End Verification and Intelligence | MISSING | Final verification/intelligence phase; AI remains deferred until foundations are reliable. |

Open PRs are proposed work. They do not change mainline status until merged and accepted.

## Current controlled work

### Phase 2 — Sales Execution Integrity
PR #18
Branch: reconcile/growth-os-phase-2-sales-integrity
R-IDs: R07, R08, R09, with preservation of related R05/R06/R21/R22/R23/R24/R25.

Required gate sequence:
1. CI passes on final PR head.
2. Migration is reviewed and applied through the controlled deployment path.
3. Existing leads remain readable.
4. Active-lead enforcement is verified.
5. Stage history and execution-gap reporting are verified.
6. Existing attribution/product/scoring behavior is preserved.
7. Production health remains healthy.
8. PR is merged.
9. Mainline ledger and traceability are updated.

### Phase 3 — Identity, Engagement, Customer Journey
PR #19
Branch: reconcile/growth-os-phase-3-identity-customer
R-IDs: R01, R02, R03, R10, R11, R12.

Required gate sequence:
1. CI passes on the corrected PR head.
2. Schema/client generation succeeds.
3. Additive migration is reviewed and safely applied.
4. Anonymous visitors do not create Person records.
5. Legitimate lead capture creates/reuses the correct Person.
6. Lead remains distinct from Opportunity and Customer.
7. Non-WON leads cannot convert.
8. WON conversion requires positive value.
9. Conversion is transactional and idempotent.
10. Customer timeline is reconstructable and chronological.
11. Production health remains healthy.
12. PR is merged.
13. Mainline ledger and traceability are updated.

## Phase 4 — Queued scope

Phase 4 is now explicitly part of the active roadmap and must not be forgotten.

Scope:
- Conversation and Message as canonical communication records.
- Channel adapters in controlled order: Telegram and Email first, followed by WhatsApp and Messenger, with SMS as a first-class provider adapter.
- Correct linkage of inbound/outbound messages to known customer/lead/opportunity context.
- Human handoff and ownership state.
- Channel permissions and communication preferences.
- Preserve the Growth OS identity boundary: channel activity must not fabricate identity.
- Low-bandwidth/mobile considerations for critical communication workflows.

Primary R-IDs:
- R13 Email
- R14 SMS
- R15 Telegram
- R16 WhatsApp
- R17 Messenger
- R18 Human handoff
- related R29 communication preferences
- related R12 unified customer timeline

Phase 4 entry gate:
1. Phase 2 is accepted/merged.
2. Phase 3 is accepted/merged.
3. Required identity/customer foundations are evidenced.
4. Any outstanding build/CI/deployment verification is recorded and consolidated before Phase 4 acceptance; verification work must not silently change the roadmap.

Phase 4 exit condition:
Inbound/outbound messages are recorded against the correct context, human handoff works, permissions/opt-outs are respected, and the customer/lead journey remains reconstructable.

## Deferred consolidated verification

Current GitHub repository build/verification is not yet reliable enough to use as phase-completion evidence.

Do not treat this as a roadmap change.

When verification is resumed, consolidate the relevant:
- GitHub Actions build/CI results;
- lint/typecheck/build results;
- migration verification;
- deployment/runtime verification;
- regressions and corrections;
- Phase 2 and Phase 3 acceptance evidence;
- Phase 4 evidence once Phase 4 implementation begins.

Record the evidence against the owning phase and update this file only from verified results.

## Single next action

Continue the existing Phase 2 and Phase 3 tracks in phase order. Phase 4 is now formally queued and documented, but do not claim Phase 4 implementation has started or that its acceptance gates have passed.

The roadmap pointer advances only when the previous phase is accepted and its exit condition is evidenced.

## Correction-control rule

Corrections do not change the roadmap.

When a correction is discovered:
1. Identify the owning phase and R-ID(s).
2. Add it to that phase's implementation record.
3. Fix it on the owning branch/PR.
4. Re-run affected acceptance gates.
5. Record evidence.
6. Keep the same phase pointer.
7. Do not create a "correction phase" unless the PRD/reconciliation plan itself is formally revised.

CI failure, schema correction, review request, deployment failure, or regression cannot silently redirect development to another feature.

## Mandatory handoff

When a phase is accepted and merged, update this file in the same governance change with:
- phase status;
- merged PR;
- final commit;
- evidence summary;
- traceability statuses;
- residual gaps;
- explicit next phase;
- exact first action for that phase.

The repository must always be sufficient for a new developer or AI agent to resume work without conversation history.

## Documentation invariant

Growth OS changes must keep this chain consistent:

PRD → Traceability → Phase Record → Execution State → PR/CI Evidence

If implementation and documentation diverge, documentation reconciliation is part of the current work.
