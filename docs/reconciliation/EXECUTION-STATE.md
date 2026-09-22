# Growth OS Execution State

This is the single repository handoff for developers and AI agents. It records what is complete on main, what is proposed, what is blocked, and the exact next action.

## Authority chain
1. docs/PRD-ASLAL-GROWTH-OS-v1.0.md — product requirements.
2. docs/reconciliation/README.md — phase boundaries and integrity rules.
3. docs/reconciliation/TRACEABILITY.md — requirement/evidence matrix.
4. This file — current execution state and next action.
5. Phase implementation documents — detailed evidence and acceptance gates.

## Allowed statuses
- MISSING
- PARTIAL
- IMPLEMENTED-UNVERIFIED
- SATISFIED
- BLOCKED

## Phase ledger

| Phase | Scope | Main status | Current truth |
|---|---|---|---|
| 1 | Baseline and Domain Contract | SATISFIED | PRD, domain contract, traceability, execution control, and phase governance are on main. |
| 2 | Sales Execution Integrity | IMPLEMENTED-UNVERIFIED | Phase 2 implementation and gap-closure PR #22 are merged into main. CI verification is blocked by GitHub runner availability; production migration/backfill evidence is still required. |
| 3 | Identity, Engagement, Customer Journey | SATISFIED | Golden-path acceptance completed with persisted visitor, canonical PAGE_VIEW, business/high-intent taxonomy, Growth Opportunity, Lead, Opportunity, Customer, Activity, and Visitor→Lead linkage evidence. |
| 4 | Conversations and Channel Adapters | IMPLEMENTED-UNVERIFIED | Phase 4 acceptance dashboard is now available. Conversation/message persistence, consent, handoff, signed webhook behavior, provider delivery, retry safety, and production health still require controlled evidence. |
| 5 | Automation Engine | MISSING | Future phase; do not start now. |
| 6 | Campaign, Partner, Revenue, Payment | PARTIAL | Existing foundations exist but are not reconciled/accepted. |
| 7 | End-to-End Verification and Intelligence | MISSING | Final verification/intelligence phase; AI remains deferred. |

## Phase 2 mainline record

Merged:
- original Phase 2 implementation PR #18
- Phase 2 gap closure PR #22
- mainline merge SHA for gap closure: db5127d160a3f876d75132eb8677764a020e1acb

Implemented controls:
- explicit owner, next action, due date
- new website leads receive configured sales-queue owner and 30-minute triage deadline
- Ethiopian phone normalization
- active-state enforcement
- stage history and execution-gap reporting
- attribution/product-interest preservation

Verification blocker:
GitHub Actions run #114 and its rerun attempt failed before any workflow step started. The job reported runner_id=0 and an empty step list, so this is an execution-infrastructure blocker rather than a reported application test failure.

Remaining Phase 2 evidence:
1. successful CI;
2. controlled migration application;
3. legacy execution-gap backfill using real business ownership/actions;
4. production health after migration;
5. final acceptance update.

## Phase 3 mainline record

Merged:
- Phase 3 gap-closure PR #25
- mainline merge SHA: 97e74460a3f6420ec363e699f99eff925688c556

Implemented:
- Person identity boundary
- Opportunity and Customer separation
- idempotent WON conversion
- Activity foundation
- unified chronological customer timeline
- canonical business-event taxonomy
- anonymous Growth Opportunity
- Afaan Oromoo locale contract

Remaining Phase 3 evidence:
1. successful CI;
2. controlled additive migration;
3. anonymous/known identity behavioral checks;
4. Growth Opportunity behavior;
5. customer conversion/timeline checks;
6. production health;
7. final acceptance update.

## Phase 4 mainline record

Merged:
- Phase 4 implementation PR #26
- merge SHA: 0d50761da3491f21b31b53e3aa3f9d2657e386be

Related mainline UI/runtime records:
- PR #15 merged: Emerald Prisma OpenSSL 1.0 runtime support (c14e59b54f352f700387bebf85c4223bdbd4d24d)
- PR #28 merged: Aslal showcase and command center UI (b7d5acaaa99d7717299cacb65b20be894fe985a2)

Prepared scope originally delivered by PR #26:

Prepared scope:
- Conversation and Message canonical records
- ChannelAccount
- communication preferences and global opt-out
- signed inbound messaging webhooks
- consent-aware outbound messaging
- human handoff ownership/state
- Email, SMS, Telegram, WhatsApp, Messenger adapter boundary
- unified timeline message entries

Phase 4 foundation and controlled acceptance tooling are on main. Phase 4 remains IMPLEMENTED-UNVERIFIED until the controlled suite and configured provider E2E evidence pass.

Phase 4 external dependencies:
- provider credentials
- sender identities
- webhook registration
- provider templates/permissions
- real inbound/outbound callback verification

## Phase 3 acceptance record

Phase 3 golden-path acceptance was completed successfully. The production acceptance dashboard evidenced:
- 48 visitors;
- 135 canonical PAGE_VIEW events;
- 23 accepted business-event types;
- 10 high-intent event types;
- 4 Growth Opportunity signals;
- 23 leads;
- 4 separate Opportunities;
- 2 Customers;
- 2 customer timeline Activity records;
- 23 identified leads retaining visitor linkage.

The dedicated Phase 3 acceptance route has been retired and replaced by `/dashboard/acceptance/phase-4`.

## Current production verification state

The application is live, but the dashboard reports that one or more Growth OS tables are unavailable. The repository contains the additive Prisma migrations for the sales, identity/customer, and conversation foundations, including `20260920020000_identity_customer_foundation` and `20260920030000_conversation_foundation`.

Production migration application is therefore the immediate blocking evidence for Phase 2–4 acceptance. Do not mark any phase SATISFIED from the live application alone.

## Consolidated verification blocker

GitHub Actions is currently unable to start the repository CI job on the affected Phase 2–4 branches. Observed failed jobs have:
- runner_id=0
- empty steps
- failure within seconds of run creation

This must be treated as a verification-infrastructure blocker. It does not prove application failure, and it does not permit marking a phase SATISFIED.

## Exact next action

1. Apply the pending Phase 4 conversation migration through the controlled Emerald deployment procedure; never use `prisma migrate reset`.
2. Set `PHASE4_ACCEPTANCE_MODE=true` only in the controlled acceptance environment, then open `/dashboard/acceptance/phase-4` and run the safety + webhook suite.
3. Configure provider credentials only for channels intended for production and confirm configuration presence in the acceptance dashboard.
4. Execute the live provider test for each configured channel, then verify inbound/outbound, consent, opt-out, human-handoff, retry/idempotency, and timeline evidence.
5. Restore/verify GitHub Actions runner availability and run repository CI verification when available.
6. Record Phase 4 evidence and update the phase status only when every acceptance gate is actually proven.
7. Keep Phase 5 out of scope.

## Documentation invariant

Growth OS changes must keep:

PRD → Traceability → Phase Record → Execution State → PR/CI Evidence

Corrections remain owned by their phase. Verification failures do not create a new phase.
