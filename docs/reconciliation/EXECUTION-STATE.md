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
| 4 | Conversations and Channel Adapters | MISSING | Must not begin until earlier phase gates are satisfied and the pointer advances. |
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

## Single next action

Do not start Phase 4.

Finish and verify Phase 2 and Phase 3 in their existing PRs, in phase order, then merge only after their documented acceptance gates pass.

The phase pointer advances only after the earlier phase is merged and its exit condition is evidenced.

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
