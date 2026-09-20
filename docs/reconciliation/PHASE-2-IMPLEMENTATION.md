# Phase 2 — Sales Execution Integrity

## Scope

This phase turns the PRD sales-control requirements into an enforceable operating contract for active leads.

Relevant PRD traceability IDs:
- R07 — lead ownership
- R08 — required next action
- R09 — sales stages
- R06 — lead scoring
- R05 — lead capture
- R21/R22/R23 — attribution foundations
- R24/R25 — commission/revenue foundations

## Changes

- Added nullable lead owner email, next action, and next-action due date fields.
- Added production-safe MySQL migration for those fields and indexes.
- Active lead updates now require owner, next action, and due date.
- Lead inbox surfaces active leads that still violate the execution contract.
- Existing source, medium, campaign, referral code, product-interest, score, and stage-history data remain unchanged.
- Existing leads are not silently reassigned or given invented next actions.

## Integrity rule

An active sales record is a lead whose status is neither WON nor LOST.

An active sales record must have:
1. owner
2. stage
3. next action
4. next-action due date
5. source/attribution fields where available
6. product/service interest where available
7. auditable stage history

This phase enforces items 1–4 for future active-state saves and keeps the existing implementation for items 2, 5–7.

## Migration safety

The migration is additive and nullable. It does not rewrite or delete existing lead data.

Production application must run the checked-in migration through a controlled deployment step before the new Prisma fields are used. Do not run `prisma migrate dev` or `prisma migrate reset` against production.

## Acceptance evidence

Phase 2 is not marked SATISFIED merely because these files exist.

Before closing the phase, verify:
- CI typecheck/lint/build passes.
- Migration applies successfully in the intended deployment environment.
- Existing lead rows remain readable.
- An active lead cannot be saved without owner, next action, and due date.
- A completed/closed lead can still be viewed.
- Stage changes continue to create `LeadStageHistory`.
- Lead inbox reports the count of active execution gaps.
- No existing source/referral/product-interest values are lost.
- Production health endpoint remains healthy after deployment.

## Remaining reconciliation work

Existing active leads may have null values in the new fields. Those rows are intentionally surfaced as execution gaps rather than being auto-filled with fabricated ownership or actions.

A later controlled backfill/assignment operation must use real business ownership and real next actions.