# P2 — Partner Program Foundation

Status: IMPLEMENTED FOUNDATION

## Scope

P2 introduces the commercial program layer above individual partner campaigns.

The rule is:

**Campaigns describe activation. Programs define the commercial relationship. Terms define what the partner is entitled to. Contracts preserve what was accepted.**

## Implemented

- `PartnerProgram`
  - workspace-scoped
  - slug uniqueness per workspace
  - lifecycle: DRAFT, PUBLISHED, PAUSED, ARCHIVED
  - admission: OPEN, VERIFICATION_REQUIRED, BUSINESS_APPROVAL, INVITATION_ONLY
  - allowed partner types
- `ProgramTerms`
  - immutable version numbers
  - active version
  - earnings description
  - qualifying event
  - attribution policy
  - attribution window
  - refund hold
  - payout schedule
  - minimum payout
  - exclusions
  - terms snapshot
- `CommissionContract`
  - partner/program agreement
  - accepted timestamp and actor
  - immutable terms snapshot
  - active/suspended/terminated lifecycle
- `PartnerCampaign.programId`
  - nullable during migration so existing campaigns remain valid
- Admin API:
  - GET/POST `/api/admin/partner-engine/programs`
  - POST `/api/admin/partner-engine/programs/[id]/terms`

## Data-safety rules

Existing partner campaigns remain valid because `program_id` is nullable.

The migration creates parent tables before child tables:

Workspace -> PartnerProgram -> ProgramTerms -> CommissionContract

The campaign foreign key is added only after PartnerProgram exists.

Historical contract records keep a JSON snapshot of the exact terms accepted by the partner. Future program-term versions therefore do not rewrite historical agreements.

## Next P2 work

1. Connect campaign creation/editing to a selected PartnerProgram.
2. Add partner discovery and program offer cards.
3. Implement admission/eligibility checks.
4. Implement partner join/application and CommissionContract creation.
5. Add program owner UI with the four-step wizard:
   What are you selling? -> Who can sell? -> How do they earn? -> When do they earn? -> Publish.
6. Add partner-facing Discover -> My Programs -> My Links navigation.
7. Add tests for workspace isolation, duplicate slugs, term versioning and contract snapshots.

## Production migration

Migration:
`prisma/migrations/20261001090000_partner_program_foundation/migration.sql`

Use `prisma migrate deploy` in production. Do not reset production databases.


## P2 continuation — implemented 2026-10-01

The remaining P2 application layer is now implemented on top of the existing foundation:

- Partner campaigns expose their linked PartnerProgram and validate program/workspace ownership on creation.
- Campaign PATCH editing supports changing the linked program while preserving workspace isolation and rejecting archived programs.
- Business-owner UI provides a five-step Partner Program builder: Offer → Audience → Earnings → Timing → Publish.
- Partner program management is available at /dashboard/partner-programs for users with partners.manage.
- Partner discovery API /api/partner/programs returns published workspace programs, active terms, and the current partner's contract state.
- P1-R admission rules now distinguish OPEN from VERIFICATION_REQUIRED: BASIC partners can instant-join OPEN programs; elevated verification is required for VERIFICATION_REQUIRED programs; BUSINESS_APPROVAL and INVITATION_ONLY remain admin-controlled.
- Campaign creation UI exposes program selection so campaigns can no longer be treated as the only commercial definition.
- P2 admission tests cover OPEN, elevated-verification, business-approval, and invitation-only behavior.

### Controlled acceptance sequence

1. Business owner creates a program through the five-step builder.
2. Initial ProgramTerms are created as the active commercial version.
3. Business owner creates a campaign and selects that program.
4. Partner discovers the published program through the partner portal/discovery API.
5. BASIC affiliate joins an OPEN program after completing the P1-R payout requirement and accepting the active terms.
6. The join transaction creates a CommissionContract using the active ProgramTerms snapshot and a PartnerTermsAcceptance audit record.
7. The resulting referral identity is available to the partner and can be used by campaign/referral flows.
8. A later terms version must not rewrite the contract's historical termsSnapshot.

CI remains intentionally disabled per project direction; runtime validation must be performed manually with Prisma generation/migration deployment, typecheck, lint, tests, and the controlled acceptance flow.