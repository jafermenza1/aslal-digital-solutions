# Aslal Growth OS Reconciliation

## Purpose

This directory is the engineering control point for reconciling the implementation of Aslal Growth OS with PRD-GROWTH-OS-001 v1.0.

The PRD defines business outcomes. Existing modules, routes, database tables, dashboards, or descriptive comments are not evidence that an outcome is complete. An outcome is considered satisfied only when the required behavior is implemented, integrated, tested, and observable through an agreed acceptance check.

The reconciliation process therefore works from the PRD toward the implementation, never from the existing implementation toward an assumed requirement.

## Authority

The authoritative product definition is:

`docs/PRD-ASLAL-GROWTH-OS-v1.0.md`

PRD version: 1.0.

This document and the traceability records below are engineering controls derived from that PRD. They do not replace it.

## Status vocabulary

Every requirement uses exactly one status:

- **MISSING** means the current repository does not provide the required capability.
- **PARTIAL** means some supporting capability exists, but the complete PRD outcome cannot yet be demonstrated.
- **IMPLEMENTED-UNVERIFIED** means code appears to implement the outcome, but behavioral evidence is still required.
- **SATISFIED** means the outcome has passed its defined acceptance evidence.
- **BLOCKED** means implementation cannot proceed because an external dependency, provider capability, environment, or product decision is unresolved.

No requirement may be marked SATISFIED merely because a file, route, database model, UI, or API exists.

## Reconciliation principles

The system must preserve data integrity before feature breadth.

Existing production data and migrations must not be rewritten casually. New domain concepts are introduced only after their relationship to the existing Visitor, Lead, Event, Partner, Referral, Product, Task, StageHistory, and Commission records is defined.

A phase must leave the repository buildable and deployable. Database changes must have explicit migration plans. Production migrations must never depend on running Prisma CLI on Emerald.

Each phase must have a small boundary, a measurable exit condition, and a rollback path.

Channel integrations must remain provider/API compliant. Anonymous behavior must not be converted into a claimed identity without a legitimate identification event.

Automation must always have explicit stop conditions.

## Reconciliation phases

### Phase 1 — Baseline and domain contract

Freeze the PRD as the product authority, reconcile the existing repository against the PRD, define canonical business entities and relationships, establish traceability, and define release gates.

This phase deliberately avoids speculative database expansion. Its output is the contract that later schema and application changes must follow.

Exit condition: every PRD requirement is mapped to a target outcome, current evidence, implementation gap, acceptance evidence, and planned phase.

### Phase 2 — Sales execution integrity

Make the existing lead workflow conform to the PRD without introducing messaging complexity.

The system must establish a reliable active-lead operating rule: owner, stage, next action, due date, source/attribution, product/service interest, and auditable stage history.

The existing referral and commission workflows are reconciled with the same commercial journey.

Exit condition: a lead can be created, assigned, advanced, followed up, won/lost, and audited without orphaned active work.

### Phase 3 — Identity, engagement, and customer journey foundation

Separate Visitor, Lead, Opportunity, and Customer concepts and define the first-party event/timeline contract.

The phase connects anonymous engagement to legitimate identification and then to a commercial journey without pretending that anonymous behavior identifies a person.

Exit condition: one verified first-party journey can be reconstructed from acquisition through customer creation.

### Phase 4 — Conversations and channel adapters

Introduce the unified Conversation and Message model first, then implement channel adapters incrementally.

The initial channel order is Telegram and Email, followed by WhatsApp and Messenger, with SMS treated as a first-class provider adapter.

Exit condition: inbound/outbound messages are recorded against the correct known customer/lead context, human handoff works, and channel-specific permissions are respected.

### Phase 5 — Automation engine

Introduce workflows only after the underlying lead, opportunity, customer, conversation, and activity models are stable.

The engine implements trigger, condition, action, delay, retry, execution history, failure state, and stop conditions.

Exit condition: the defined MVP recipes execute safely without uncontrolled messaging or duplicate commercial records.

### Phase 6 — Campaign, partner, revenue, and payment attribution

Connect campaign/content/referral/partner activity to opportunities, customers, revenue, and commissions.

Introduce payment/order abstractions only where required by the commercial workflow, using provider adapters rather than provider-specific core models.

Exit condition: an attributed sale can be traced from campaign/partner source to customer, revenue, and commission.

### Phase 7 — Growth OS verification and intelligence

Verify the complete end-to-end customer journey and operational dashboards before introducing AI-assisted features.

AI is added only after the underlying facts, events, conversations, ownership, and revenue records are reliable.

Exit condition: the PRD Definition of Done can be demonstrated with a real or controlled test journey and the critical success metrics are observable.

## Phase discipline

No phase may silently absorb work from a later phase.

If implementation discovers a prerequisite from a later phase, record the dependency and keep the current phase boundary intact unless the dependency is necessary for integrity.

A phase is complete only when its exit condition and acceptance evidence are satisfied.

## Immediate implementation rule

The first engineering work after this document is not another feature.

It is reconciliation of the current implementation against the traceability matrix and canonical domain contract in this directory.
