# Phase Control and Anti-Drift Rules

## Canonical phase order

1. Phase 1 — Baseline and Domain Contract
2. Phase 2 — Sales Execution Integrity
3. Phase 3 — Identity, Engagement, and Customer Journey Foundation
4. Phase 4 — Conversations and Channel Adapters
5. Phase 5 — Automation Engine
6. Phase 6 — Campaign, Partner, Revenue, and Payment Attribution
7. Phase 7 — Growth OS Verification and Intelligence

No phase may be skipped.

## Correction is not a new phase

These remain inside the owning phase:
- bug fixes;
- type fixes;
- schema relationship corrections;
- migration corrections;
- CI failures;
- review changes;
- deployment packaging corrections;
- production regressions caused by the phase;
- documentation corrections;
- acceptance-test fixes.

Quality/control work must not move the roadmap.

## Blocker rule

If an external dependency prevents completion:
- mark the affected requirement BLOCKED;
- name the dependency;
- record evidence;
- define the unblock condition;
- keep the phase pointer unchanged unless the reconciliation plan is formally revised.

## Anti-distraction rule

Do not use an available module, route, dashboard, provider, library, or AI capability as a reason to change the next phase.

The next phase comes from EXECUTION-STATE.md and the phase exit conditions.

## AI/developer resume protocol

A new agent must:
1. Read AGENTS.md.
2. Read EXECUTION-STATE.md.
3. Read the PRD.
4. Read TRACEABILITY.md.
5. Read the current phase record.
6. Inspect open PRs for that phase.
7. Continue the existing phase rather than restarting analysis.
8. Update phase evidence and execution state before finishing.

## No silent state transitions

Never change a requirement or phase status based only on:
- code existence;
- schema existence;
- route/UI existence;
- successful compilation;
- an open PR;
- a local test;
- a deployment without acceptance evidence.

## Required PR evidence

Every phase PR must contain:
1. Business outcome.
2. Exact R-ID(s).
3. Data/API/UI/workflow/integration changes.
4. Existing-data impact, migration strategy, rollback strategy.
5. CI/tests/migration/behavioral/production evidence as applicable.
6. Handoff: status, remaining work, and exact next action.

## Release gate

A phase is accepted only when:
implementation + CI + migration safety + behavioral evidence + production/deployment evidence where applicable + documentation reconciliation
are all present.

## Source of truth after merge

Merged main is authoritative. Open branches are proposed work and must not be described as completed repository state until merged and accepted.
