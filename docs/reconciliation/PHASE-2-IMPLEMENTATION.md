# Phase 2 — Sales Execution Integrity

## Scope

This phase turns the PRD sales-control requirements into an enforceable operating contract for active leads.

Relevant PRD traceability IDs:
- R05 — lead capture
- R06 — transparent lead scoring
- R07 — lead ownership
- R08 — required next action
- R09 — sales stages
- R21/R22/R23 — attribution foundations
- R24/R25 — commission/revenue foundations
- R27 — Ethiopian phone normalization

## Implemented controls

- Lead owner, next action, and next-action due date are stored on the canonical Lead record.
- Active-state updates reject missing owner, next action, or due date.
- Lead stage changes remain auditable through LeadStageHistory.
- Website lead capture now creates an explicit sales-queue owner, a concrete triage next action, and a 30-minute review deadline so newly-created active leads cannot be born operationally orphaned.
- The default sales owner is configurable through ASLAL_DEFAULT_LEAD_OWNER_EMAIL; the repository falls back to the company sales inbox until a deployment-specific owner is configured.
- Ethiopian phone input is normalized to canonical +2519... / +2517... representation at lead capture and invalid local Ethiopian numbers are rejected.
- Existing attribution, product-interest, score, referral, commission, and stage-history behavior is preserved.
- Existing leads with legacy execution gaps are still surfaced for controlled business backfill; no historical owner/action is fabricated.

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

The system now enforces items 1–4 for new website-created leads and all active-state saves. Items 5–7 remain preserved from the existing sales foundation.

## Migration safety

The Phase 2 schema migration is additive and nullable. It does not rewrite or delete existing lead data.

Production application must run the checked-in migration through the controlled deployment path before the new Prisma fields are used. Do not run prisma migrate dev or prisma migrate reset against production.

Phone normalization is application-level and does not rewrite historical phone values automatically.

## Acceptance evidence

Phase 2 remains IMPLEMENTED-UNVERIFIED until:
- CI typecheck/lint/build passes on the final correction head;
- migration applies successfully in the intended deployment environment;
- existing lead rows remain readable;
- a new website lead receives a configured sales-queue owner, next action, and due date;
- an active lead cannot be saved without owner, next action, and due date;
- invalid Ethiopian phone input is rejected and valid local/country-form numbers normalize consistently;
- completed/closed leads remain viewable;
- stage changes continue to create LeadStageHistory;
- lead inbox reports execution gaps for legacy rows;
- source/referral/product-interest values are preserved;
- production health endpoint remains healthy after deployment.

## Residual controlled work

Historical active leads may still have null execution fields. Those rows require a real business owner and real next action before they can be operationally considered complete. This is a controlled backfill, not an automated data fabrication step.
