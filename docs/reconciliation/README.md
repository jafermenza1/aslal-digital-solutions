# Aslal Growth OS — Reconciliation Guideline

**Document:** RECONCILIATION-GUIDE-001  
**Status:** Authoritative engineering control  
**Date:** 2026-09-23  
**Repository baseline:** main @ 04b16c65912b5846c453c6118d13ae4ba4589a0b  
**Deployment baseline:** Emerald deployment run 35869894355, successful  
**Product authority:** `docs/PRD-ASLAL-GROWTH-OS-v1.0.md` plus the expanded target-state product definition agreed on 2026-09-23  
**Roadmap:** `docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`

---

## 1. Purpose

This document is the operating contract for reconciling the Aslal Growth OS implementation with the complete product vision.

It is intentionally different from a development roadmap. The purpose of reconciliation is to answer a stricter question:

> What is actually true in the repository and production environment, what evidence proves it, what remains unverified, and what must never be claimed as complete?

The Growth OS is a business system rather than a collection of pages. Therefore a route, database table, API, component, dashboard, migration, or integration adapter is evidence of implementation effort, not evidence that the intended business outcome has been achieved.

A requirement becomes accepted only when the relevant behavior exists, the data relationships are correct, authorization is correct, failure behavior is understood, the behavior is tested, production implications are verified, and the evidence is recorded.

This document must be read before any developer or AI coding agent changes a major Growth OS domain.

---

## 2. Authority and document separation

The checked-in PRD remains the product authority until the expanded target-state PRD is committed into the repository as its own versioned document.

The reconciliation documents answer:

- what the product requires;
- what the repository currently contains;
- what production evidence exists;
- what is incomplete or unverified;
- what evidence is required before acceptance;
- what data or migration risks exist.

The development roadmap answers:

- what should be built next;
- why it should be built next;
- what prerequisites are mandatory;
- what scaling gate must be passed before moving onward.

The domain contract answers:

- what business entities mean;
- how those entities relate;
- which distinctions must never be collapsed.

The execution state answers:

- where the implementation currently stands;
- what has been accepted;
- what is blocked;
- what the immediate next action is.

There is one canonical development roadmap in this repository:

`docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`

No second roadmap/plan document should be created for the same implementation sequence.

No developer should use an old phase note, dashboard label, open branch, or historical acceptance record as evidence against newer merged mainline behavior.

Merged main is authoritative.

---

## 3. Current verified repository state

The current mainline contains a materially larger system than the original Phase 1/2 handoff described.

The application currently exposes dashboard workspaces for command center, leads, customers, partners, insights, visitor journeys, conversations, operations, and solutions/products. The API surface is organized around tracking, authentication, leads, customers, conversations, communication preferences, administration, webhooks, health, cron and acceptance tooling.

The current Prisma domain includes Visitors, Events, Leads, Lead Tasks, Lead Stage History, Lead Product Interest, Products, Partners, Referral Links, Referral Clicks, Commissions, Persons, Opportunities, Customers, Activities, Growth Opportunities, Communication Preferences, Conversations, Messages, Channel Accounts and Lead Administrative Audits.

Six migrations are present in main:

`0000_baseline`

`004_v04_sales_operations`

`20260920010000_sales_execution_integrity`

`20260920020000_identity_customer_foundation`

`20260920030000_conversation_foundation`

`20260923010000_lead_admin_controls`

The latest deployment successfully applied the sixth migration, including the `lead_admin_audits` table and `leads.is_test` controls.

The production deployment pipeline is now capable of shipping a dedicated Prisma migration runtime rather than relying on the Next.js standalone dependency tracer. The successful deployment also demonstrated that the release artifact can be transferred, installed, migrated and restarted on Emerald.

CI run `35869566378` completed successfully.

Emerald deployment run `35869894355` completed successfully and its production health check passed.

The deployment log explicitly recorded:

- Prisma schema loaded successfully;
- six migrations found;
- `20260923010000_lead_admin_controls` applied;
- all migrations successfully applied;
- release installed;
- production health check passed.

This proves deployment and schema migration execution. It does not by itself prove business-data integrity or completion of the Growth OS.

---

## 4. Current product-stage truth

### Foundation

The domain and deployment foundations are sufficiently mature to continue development without redesigning the product around isolated features.

Visitor/event tracking exists.

Identity/customer separation exists.

Lead, opportunity and customer concepts exist.

A chronological customer-activity foundation exists.

Canonical conversation/message records exist.

Communication preferences and global opt-out exist.

Human handoff exists.

Partner/referral/commission foundations exist.

Admin lead editing, deletion, test-data marking and audit functionality exists.

Production integrity monitoring exists in code.

The system is therefore beyond prototype stage.

### Sales execution

The system currently has explicit owner, next action and next-action deadline fields on active leads. New web leads receive a configured sales owner and triage action. Active-state saves enforce the execution fields. Stage changes are recorded.

Administrative correction controls are present.

However, historical sales data has previously contained incomplete execution information. The last known production integrity snapshot before the lead-admin migration reported 18 active leads, with 6 missing owners, 6 missing next actions, 6 missing due dates, 12 overdue actions, 2 WON leads missing positive deal values, and 2 WON leads without a customer relationship.

That snapshot is historical evidence from 2026-09-23, not a claim about the current database after the latest migration. The migration was additive and did not backfill business facts. A new production integrity run is therefore mandatory before any scaling decision.

### Identity and customer journey

The Identity, Engagement and Customer Journey foundation is accepted based on the recorded golden-path evidence.

Historical acceptance demonstrated persisted visitor activity, canonical PAGE_VIEW events, business-event taxonomy, Growth Opportunity signals, leads, opportunities, customers, customer activities and Visitor→Lead linkage.

This does not mean every future target-state identity feature is complete. It means the foundation is accepted.

### Conversations

The provider-neutral Phase 4A foundation is accepted as a product capability.

The system has canonical Conversation and Message records, human handoff, communication preferences, signed inbound boundaries, idempotency controls, adapter boundaries and the unified Conversations workspace.

Real provider-specific expansion remains separately controlled. An adapter existing in code is not sufficient evidence that a provider's credentials, sender identity, webhook registration, delivery callbacks, templates, platform permissions and production behavior are accepted.

### Commerce

The target product still lacks the full commercial transaction layer.

There is no first-class Order model in the current schema.

There is no first-class Payment model in the current schema.

Quotation/proposal is not yet a dedicated commercial entity.

Negotiation history is not yet represented as a first-class transaction model.

Revenue exists principally through lead/opportunity deal values.

Therefore the current system cannot yet truthfully claim a complete demand → payment → revenue operating loop.

### Automation

The current task mechanism is useful operationally but is not a full automation engine.

A real automation engine still requires workflow definitions, triggers, conditions, actions, delays, executions, retries, stop conditions, cancellation, permissions and auditable execution history.

Therefore Phase 5 remains unbuilt.

### Campaigns and attribution

Campaign and referral data exist as fields and referral models, but Campaign and Campaign Asset are not yet first-class domains with complete lifecycle management.

The current reporting can show useful source/referral performance, but campaign → asset → partner → visitor → lead → opportunity → customer → payment → revenue is not yet a fully connected, accepted financial attribution chain.

### Partners and commissions

Partners, referral links and commission states exist.

The current partner workspace already reports clicks, referred leads, qualification, won deals, revenue and commission states.

However commission is not yet coupled to a first-class Order/Payment/reconciled-revenue model. The platform therefore cannot yet offer the final partner promise of fully auditable commission derived from confirmed collected revenue.

### Trust, retention and customer advocacy

Business trust profiles, verified review lifecycle, structured customer advocacy, repeat-purchase workflows and referral automation are not yet complete.

They belong to the target product but are not current production capabilities.

### RBAC and multi-tenancy

The current implementation is administrator-centric and does not yet implement the full workspace/user/role/permission model required by the target-state system.

There is no accepted shared multi-tenant architecture in the current schema.

This is a critical scaling constraint.

The system must not be exposed as a shared multi-business SaaS platform until tenant isolation and role-based access controls are implemented and tested.

---

## 5. Reconciliation status vocabulary

Use exactly these statuses:

**MISSING** means the required behavior is not implemented.

**PARTIAL** means meaningful foundations exist but the complete business outcome is not implemented or not accepted.

**IMPLEMENTED-UNVERIFIED** means implementation evidence exists but required behavioral, production or external evidence is missing.

**SATISFIED** means implementation and required acceptance evidence are complete for the stated scope.

**BLOCKED** means the implementation or acceptance cannot proceed because a named external or environmental dependency prevents it.

Never use "done", "complete", "production-ready", "fully supported", or "verified" as substitutes for the status vocabulary in reconciliation documents.

---

## 6. Evidence hierarchy

Evidence must be interpreted in the following order.

### Level 1 — Source definition

A product requirement, domain contract, security policy or explicit business rule defines what the system is supposed to do.

### Level 2 — Implementation evidence

Merged mainline code, schema, API, UI and configuration demonstrate that the capability has been built.

### Level 3 — Automated verification

Tests, CI typecheck, lint, build, deterministic acceptance suites and integration tests demonstrate repeatable behavior.

### Level 4 — Environment evidence

Successful migrations, production health, provider authentication and deployment logs demonstrate that implementation can operate in the intended environment.

### Level 5 — Business acceptance evidence

A controlled or real end-to-end journey demonstrates that the business outcome actually works.

A lower level cannot substitute for a missing higher level.

A successful build does not prove a business workflow.

A successful migration does not prove data correctness.

A successful email authentication test does not prove complete multi-channel communication.

A dashboard displaying a number does not prove the number is correctly attributable.

---

## 7. Requirement reconciliation procedure

For every target requirement, the reconciliation record must answer seven questions.

**Business outcome:** What customer or business problem is being solved?

**Current evidence:** What merged implementation actually exists?

**Data contract:** Which records are created, changed or related?

**Behavioral proof:** What test demonstrates that the workflow works?

**Production proof:** What shows that the deployed environment supports it?

**Residual risk:** What is still uncertain?

**Acceptance rule:** What exact evidence permits changing the status to SATISFIED?

A developer must never mark a requirement satisfied because a page looks correct.

---

## 8. Required reconciliation checks by domain

### Demand and acquisition

Verify that visitors and events are recorded without false identity claims. Verify source, medium, campaign and referral context. Verify canonical event names. Verify meaningful engagement and Growth Opportunities.

### Leads

Verify creation, normalization, attribution, deduplication, ownership, score, status, next action, due date, stage history and failure behavior.

### Opportunities

Verify that opportunities are distinct commercial pursuits rather than merely lead statuses.

### Customers

Verify that customers arise from legitimate commercial conversion and retain their original journey and attribution.

### Conversations

Verify identity mapping, consent, opt-out, inbound signature, idempotency, human handoff and timeline integration.

### Campaigns

Verify that a campaign is a real object and that campaign identity survives to downstream outcomes.

### Partners

Verify partner identity, link generation, referral attribution, product eligibility, lead conversion and commission lineage.

### Revenue

Verify the separation of pipeline value, quoted value, order value, collected payment and recognized revenue.

### Payments

Verify provider reference, idempotency, status transitions, reconciliation and failure recovery.

### Automation

Verify trigger, action, delay, execution, retries, cancellation, stop conditions, permissions and audit.

### Trust

Verify business identity evidence, review provenance, customer permissions and customer-facing trust information.

### Retention

Verify onboarding, repeat purchase, review request, referral request and reactivation behavior.

### Security

Verify authentication, authorization, least privilege, secret protection, tenant isolation and audit.

### Mobile and low bandwidth

Verify that the critical acquisition and sales journeys work on constrained devices and unstable networks.

### Operations

Verify application health, database health, migration health, integration health, automation health and data-integrity health independently.

---

## 9. Migration discipline

Every schema change must use a checked-in migration.

Production must never be repaired by silently editing tables, marking a migration as applied without executing it, fabricating rows, or changing business facts solely to satisfy a health check.

Additive changes are preferred when possible.

Historical business data must be backfilled only when the correct value can be established from existing evidence.

Where the correct historical value is unknown, leave it unknown and make the gap visible.

A rollback strategy must be defined before applying a destructive migration.

---

## 10. Data correction discipline

Administrative correction is allowed for legitimate business reasons.

Every correction that changes commercially meaningful data must record:

actor, affected record, reason, timestamp, changed fields and relevant before/after context.

Deleting test data is different from deleting real business data.

Real customer data must not be classified as test data merely because it appears old, incomplete or unusual.

---

## 11. Production integrity gate

Before any new subsystem is allowed to increase customer or transaction volume, a fresh production integrity report must be available.

At minimum it must show:

database reachable;

all required tables present;

no failed or unfinished migrations;

zero active leads missing owner;

zero active leads missing next action;

zero active leads missing due date;

zero open tasks missing owner;

zero open tasks missing due date;

zero orphan opportunities;

zero WON leads without appropriate customer relationship;

zero customers without appropriate commercial relationship;

zero WON records missing positive commercial value where that field is required.

Overdue work may be non-zero because overdue tasks are business work, not schema corruption. The goal is not to hide overdue work; the goal is to give it an owner and a real next action.

The production integrity workflow currently exists but the recorded run failed because GitHub Actions secrets were not configured. The repository must not describe automated integrity monitoring as operationally green until `PRODUCTION_INTEGRITY_URL` and `PRODUCTION_INTEGRITY_TOKEN` are configured and a successful run is recorded.

---

## 12. Safe scaling principle

The platform must scale by **verified capacity**, not by optimism.

Because current production infrastructure is Emerald shared hosting and no formal load benchmark is recorded in the repository, the system has no evidence-supported production capacity number today.

Therefore the initial scaling policy is:

**Do not run the platform above 50% of the peak load demonstrated by controlled load testing.**

When sustained resource use or latency approaches 70% of a validated operating limit, infrastructure review is mandatory.

The following are conservative internal triggers:

- public request p95 above 2 seconds for sustained business traffic;
- admin request p95 above 3 seconds for common workflows;
- background/webhook queue delay above 5 minutes;
- application error rate above 1%;
- database connection utilization sustained above 70%;
- CPU or memory sustained above 70%;
- storage above 70%;
- repeated migration or deployment failure;
- backup verification failure;
- any unresolved critical data-integrity gap.

These are guardrails for engineering decisions, not current measurements.

---

## 13. Multi-tenant scaling rule

The current schema does not contain an accepted Workspace/Tenant boundary.

Therefore:

**The current system must be treated as a single-business operational system.**

A managed-service deployment may be duplicated per customer when necessary, but customer data must not be mixed inside the current single-tenant database.

A shared SaaS release requires, at minimum:

workspace/tenant identifiers on all business-owned records;

tenant-aware unique constraints;

tenant-scoped queries;

tenant-aware caches;

tenant-scoped background jobs;

tenant-scoped webhooks;

tenant-aware exports;

role and permission enforcement;

cross-tenant isolation tests;

administrative break-glass controls;

tenant deletion/export policy;

audit evidence of tenant boundaries.

No sales promise of "one account for many businesses" should be made before these controls are accepted.

---

## 14. What can scale now

The current system can continue controlled development and internal production use.

It can support Aslal's own lead capture, sales operations, customer management, product management, referral foundations and controlled communications.

It can support operational experimentation with test data and acceptance workflows.

It can support carefully controlled partner experiments using explicit manual commission operations.

It can support managed implementations where customer environments are kept appropriately separated.

---

## 15. What must not scale yet

Do not scale high-volume marketing automation.

Do not promise a full payment-connected revenue platform.

Do not expose shared multi-company SaaS access.

Do not claim fully automated partner commissions from collected revenue.

Do not promise all-channel production messaging merely because adapters exist.

Do not expose AI-driven autonomous selling.

Do not build a large influencer marketplace on top of incomplete attribution and payment models.

---

## 16. Definition of Reconciled Readiness

A domain is reconciled when:

the target behavior is defined;

the domain relationship is defined;

implementation is merged;

migration is safe;

automated checks are green;

behavioral acceptance is demonstrated;

production behavior is verified where applicable;

external provider dependencies are verified where applicable;

failure behavior is understood;

security and privacy controls are verified;

documentation records the evidence.

This is the minimum standard for moving a capability from implementation to accepted product behavior.

---

## 17. Current immediate reconciliation state

The latest deployment proves that the database migration chain is now deployable and that the lead-admin schema has reached production.

The next reconciliation priority is not another feature.

It is to establish the current production-data baseline after the latest migration and close or explicitly disposition the known execution and commercial integrity gaps.

After that, the system should move into the sales-automation stage.

The next major product boundary should be:

**reliable demand → reliable follow-up → reliable commercial transaction → reliable attribution**

not another dashboard.

---

## 18. Required developer handoff

Every completed change must record:

what was changed;

why it was changed;

which business requirement it addresses;

which data was changed;

which migration was added;

how rollback works;

what tests were executed;

what production evidence exists;

what remains unverified;

what exact action comes next.

This rule is mandatory for human and AI development alike.

---

## 19. Final reconciliation invariant

The Growth OS is considered healthy when the system can tell the truth about its own commercial state.

It must be more acceptable to display:

"12 leads are overdue for follow-up"

than to change dates until the dashboard says zero.

It must be more acceptable to display:

"2 transactions have unverified payment state"

than to mark them paid without evidence.

It must be more acceptable to say:

"Partner attribution is incomplete"

than to invent a commission.

The purpose of reconciliation is therefore not to make the dashboard green.

The purpose is to make the business data trustworthy.
