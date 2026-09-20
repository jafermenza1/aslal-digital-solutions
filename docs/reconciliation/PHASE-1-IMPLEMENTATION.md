# Phase 1 Implementation — Baseline and Domain Contract

## Objective

Phase 1 establishes a safe implementation boundary before expanding the database or adding communication integrations.

The purpose is to make the PRD executable as an engineering contract while preserving the existing production data model.

## Included in this phase

The repository now adopts the standardized PRD as the product authority.

The repository now contains a reconciliation control point with:

- phase boundaries;
- conservative requirement statuses;
- PRD traceability IDs;
- canonical domain concepts;
- acceptance evidence expectations;
- migration and deployment integrity rules.

## Deliberately excluded

Phase 1 does not add:

- new CRM entities;
- new Prisma migrations;
- messaging providers;
- workflow execution;
- social integrations;
- payment integrations;
- AI features;
- speculative dashboard screens.

This prevents the reconciliation process from creating schema churn before the business relationships are agreed.

## Integrity checks for the next phase

Before Phase 2 implementation begins, the team must verify:

The standardized PRD exists on main.

The repository baseline and production deployment source are identified and aligned.

The existing Prisma schema is treated as a legacy implementation baseline rather than automatically as the target domain model.

Every current sales capability is mapped to an R-ID.

Every new implementation PR references the R-ID(s) it changes.

Any database change includes a migration plan, data-impact analysis and rollback consideration.

No production workflow requires Prisma CLI execution on Emerald.

## Phase 1 exit condition

Phase 1 is complete when this directory, the PRD, and the repository's current baseline agree on the same product definition and no implementation team member needs to infer a requirement from an existing module name.

The next engineering phase is Phase 2 — Sales Execution Integrity.
