# Growth OS — Next Development Plan

## Current position

Phase 4A — Conversations and Channel Adapters — is accepted. The system now has a unified admin Conversations workspace, canonical Conversation/Message records, consent and global opt-out enforcement, human handoff, signed inbound webhook boundaries, replay protection, and controlled multi-channel simulation. Production email SMTP/IMAP authentication has also been verified.

Phase 4B is intentionally deferred. Real provider-specific expansion requires a separate requirements and configuration pass and must not be inferred from the existence of adapters.

## Development priority

The PRD's business loop is **Acquire → Understand → Engage → Identify → Qualify → Follow Up → Convert → Attribute → Measure → Improve**. Development should therefore prioritize the parts closest to measurable demand and revenue.

### Step 0 — Finish evidence for existing sales foundations
- Close Phase 2 migration/backfill and production acceptance.
- Close Phase 3 production journey evidence.
- Resolve remaining production schema/data availability issues.
- Preserve ownership, next action, attribution and timeline integrity.

**Exit:** an active lead has an owner, next action and due date; the journey can be reconstructed from visitor/engagement through customer.

### Step 1 — Phase 5: Sales Follow-up Automation
- Add workflow definitions and execution records.
- Add idempotent event triggers.
- Automate high-intent lead triage and operator notification.
- Automate overdue-task reminders/escalation.
- Stop automation on reply, handoff, opt-out, WON, LOST or closure.
- Add retry, failure, audit and execution-history controls.
- Expose automation controls in the admin UI.

**Business outcome:** fewer lost leads and more consistent follow-up without uncontrolled messaging.

### Step 2 — Phase 6: Revenue and Payment Attribution
- Connect campaign/referral/partner source to opportunities and customers.
- Add Order/Payment abstraction.
- Support ETB-aware payment state and reconciliation.
- Link realized revenue separately from pipeline value.
- Make partner attribution and commissions auditable.

**Business outcome:** determine which demand sources actually produce paid business.

### Step 3 — Phase 6: Partner/Referral Monetization
- Referral links and attribution chain.
- Partner performance: leads → opportunities → customers → revenue.
- Commission calculation and lifecycle.
- Partner payout/reconciliation records.

**Business outcome:** turn external agents, influencers and referral relationships into measurable acquisition channels.

### Step 4 — Phase 7: Operational Management and E2E Verification
- Complete RBAC, privacy, audit and notifications.
- Complete mobile/slow-network critical journeys.
- Verify end-to-end acquisition-to-revenue journey.
- Build management dashboards around actions, conversion, revenue, attribution and automation health.
- Add regression tests for critical commercial workflows.

**Business outcome:** management can run the business from the system and trust the numbers.

### Step 5 — AI and advanced intelligence
Only after reliable operational data exists:
- conversation summaries;
- intent classification;
- follow-up suggestions;
- product/service recommendations;
- demand-pattern analysis;
- lead inactivity/anomaly detection.

AI recommendations remain assistive and auditable; deterministic CRM and automation rules remain authoritative.

## Deferred channel work

Revisit Phase 4B separately for WhatsApp, Messenger, Telegram, SMS and additional email capabilities based on confirmed customer demand, provider eligibility, credentials, sender identity, templates, permissions, webhook support and operating cost.

## Definition of done for each step

A step is not complete because code compiles. It must have business behavior, persistence, UI, authorization, error handling, auditability, tests, migration/rollback planning where needed, CI evidence and production verification.
