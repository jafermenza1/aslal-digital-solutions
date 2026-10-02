# Aslal Digital Solutions — Engineering / AI Operating Contract

## Read this before changing code

This repository is governed by the Aslal Growth OS PRD and reconciliation controls.

Required reading order:
1. docs/PRD-ASLAL-GROWTH-OS-v1.0.md — product authority.
2. docs/MAIN-COMMERCIAL-ENGINE.md — detailed commercial-domain contract and gap reconciliation.
3. docs/reconciliation/README.md — phase boundaries and integrity rules.
4. docs/reconciliation/TRACEABILITY.md — requirement IDs and evidence.
5. docs/reconciliation/EXECUTION-STATE.md — current phase, completed work, active work, and the single next action.
6. docs/reconciliation/DOMAIN-CONTRACT.md — canonical entities and relationships.
7. The implementation document for the phase being changed.

Do not infer project state from filenames, routes, database tables, dashboards, comments, or memory.

## Non-negotiable execution rules

- The PRD is the product authority.
- The reconciliation phase plan is the execution authority.
- EXECUTION-STATE.md is the repository handoff for every developer and AI agent.
- Never skip, reorder, or silently merge phases.
- A correction, bug fix, CI failure, migration fix, review comment, or deployment repair is work inside the current phase, not a new phase and not permission to jump ahead.
- Corrections preserve the phase scope, R-IDs, acceptance gates, and next-action pointer.
- Code existence is not acceptance. SATISFIED requires documented acceptance evidence.
- Do not introduce later-phase capabilities unless the dependency is explicitly recorded and the phase boundary is preserved.
- Every implementation change maps to one or more R-IDs.
- Every implementation PR states business outcome, data/API/UI/workflow changes, acceptance evidence, migration/rollback risk, and handoff.
- Before starting work, check whether an open PR already owns the current phase. Fix/extend that work instead of creating a competing path.
- After implementation, correction, CI verification, migration verification, or deployment verification, update the relevant reconciliation record in the same change set.
- EXECUTION-STATE.md describes mainline truth. Open PRs are proposed work, not completed mainline work.
- Never use Emerald as a development database.
- Never run Prisma CLI development/reset commands on Emerald.
- Build Next.js production artifacts in GitHub Actions and deploy the standalone artifact.
- Do not introduce AI features before the reconciliation plan permits them and the underlying facts/events/conversations/revenue are reliable.

## Completion sequence

1. Implement only the phase scope.
2. Run required checks.
3. Verify migration safety/rollback where applicable.
4. Verify acceptance gates.
5. Update traceability only when evidence supports the status.
6. Update the phase implementation record.
7. Update EXECUTION-STATE.md with evidence and the next action.
8. Merge through the normal branch + PR workflow.
9. Reconcile EXECUTION-STATE.md against main after merge.

## When something goes wrong

Do not invent a new roadmap. Record the problem under the owning phase as correction, dependency/blocker, missing acceptance evidence, migration/deployment issue, or regression. Fix/document it, then return to the same phase gate.

The only valid source for "what next?" is docs/reconciliation/EXECUTION-STATE.md, backed by the PRD, traceability matrix, and phase documents.
