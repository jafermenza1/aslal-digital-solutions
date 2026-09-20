# Aslal Growth OS Reconciliation

## Purpose

This directory is the engineering control point for reconciling the implementation of Aslal Growth OS with PRD-GROWTH-OS-001 v1.0.

The PRD defines business outcomes. Existing modules, routes, database tables, dashboards, or descriptive comments are not evidence that an outcome is complete. An outcome is considered satisfied only when the required behavior is implemented, integrated, tested, and observable through an agreed acceptance check.

The reconciliation process therefore works from the PRD toward the implementation, never from the existing implementation toward an assumed requirement.

## Repository handoff

For a new developer or AI agent, start with:

1. docs/reconciliation/EXECUTION-STATE.md — current phase, active PRs, blockers, completed evidence, and exact next action.
2. docs/reconciliation/PHASE-CONTROL.md — anti-drift and correction rules.
3. docs/PRD-ASLAL-GROWTH-OS-v1.0.md — product authority.
4. docs/reconciliation/TRACEABILITY.md — requirement evidence.
5. docs/reconciliation/DOMAIN-CONTRACT.md — canonical domain relationships.

AGENTS.md is the repository-level engineering/AI operating contract.

## Authority

The authoritative product definition is:

docs/PRD-ASLAL-GROWTH-OS-v1.0.md

PRD version: 1.0.

This directory contains engineering controls derived from that PRD. They do not replace it.

## Status vocabulary

Every requirement uses exactly one status:
- MISSING
- PARTIAL
- IMPLEMENTED-UNVERIFIED
- SATISFIED
- BLOCKED

No requirement may be marked SATISFIED merely because a file, route, database model, UI, or API exists.

## Reconciliation principles

The system must preserve data integrity before feature breadth.

Existing production data and migrations must not be rewritten casually. New domain concepts are introduced only after their relationship to existing records is defined.

A phase must leave the repository buildable and deployable. Database changes must have explicit migration plans. Production migrations must never depend on running Prisma CLI on Emerald.

Each phase must have a small boundary, a measurable exit condition, and a rollback path.

Channel integrations must remain provider/API compliant. Anonymous behavior must not be converted into a claimed identity without a legitimate identification event.

Automation must always have explicit stop conditions.

## Reconciliation phases

### Phase 1 — Baseline and domain contract
Freeze the PRD as authority, reconcile the repository, define canonical entities and relationships, establish traceability, and define release gates.

Exit condition: every PRD requirement is mapped to a target outcome, current evidence, implementation gap, acceptance evidence, and planned phase.

### Phase 2 — Sales execution integrity
Make the existing lead workflow conform to the PRD without introducing messaging complexity.

Exit condition: a lead can be created, assigned, advanced, followed up, won/lost, and audited without orphaned active work.

### Phase 3 — Identity, engagement, and customer journey foundation
Separate Visitor, Lead, Opportunity, and Customer concepts and define the first-party event/timeline contract.

Exit condition: one verified first-party journey can be reconstructed from acquisition through customer creation.

### Phase 4 — Conversations and channel adapters
Introduce Conversation and Message first, then implement channel adapters incrementally: Telegram and Email, followed by WhatsApp and Messenger, with SMS as a first-class provider adapter.

Exit condition: inbound/outbound messages are recorded against the correct known context, human handoff works, and channel permissions are respected.

### Phase 5 — Automation engine
Introduce workflows only after lead, opportunity, customer, conversation, and activity models are stable.

Exit condition: defined MVP recipes execute safely without uncontrolled messaging or duplicate commercial records.

### Phase 6 — Campaign, partner, revenue, and payment attribution
Connect campaign/content/referral/partner activity to opportunities, customers, revenue, and commissions. Introduce payment/order abstractions using provider adapters.

Exit condition: an attributed sale can be traced from campaign/partner source to customer, revenue, and commission.

### Phase 7 — Growth OS verification and intelligence
Verify the complete end-to-end journey and operational dashboards before introducing AI-assisted features.

Exit condition: the PRD Definition of Done is demonstrated with a real or controlled test journey and critical metrics are observable.

## Phase discipline

No phase may silently absorb work from a later phase.

Corrections, CI failures, schema fixes, migration fixes, review changes, deployment repairs, and regressions stay within the owning phase. If a prerequisite is discovered, record the dependency and keep the phase boundary intact unless the reconciliation plan is formally revised.

The current execution pointer is maintained in docs/reconciliation/EXECUTION-STATE.md.
