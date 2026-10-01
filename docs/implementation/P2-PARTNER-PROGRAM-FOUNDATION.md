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

