# Aslal Growth OS — Next Development Roadmap

**Document:** ROADMAP-GROWTH-OS-001  
**Status:** Active and canonical development roadmap  
**Date:** 2026-09-23  
**Repository baseline:** main @ 04b16c65912b5846c453c6118d13ae4ba4589a0b  
**Production deployment:** Emerald run 35869894355 — SUCCESS  
**Roadmap principle:** demand-first, revenue-connected, integrity-gated, capacity-aware

---

## 1. Purpose

This roadmap translates the target-state Growth OS into controlled implementation boundaries.

The system already has meaningful foundations. The correct next move is not to add disconnected features. The correct next move is to complete the commercial chain in dependency order.

The sequence is:

**Production Integrity → Sales Follow-up → Quote/Negotiation → Order/Payment → Campaign Attribution → Partner/Influencer Commerce → Trust/Retention → End-to-End Verification → RBAC/Multi-Tenancy → Capacity Scaling → AI**

The roadmap is intentionally gate-based. A later phase does not begin merely because the previous phase has code. It begins only when the previous phase's acceptance gate is proven.

---

## 2. Current starting point

The production application is a Next.js/Prisma/MySQL system deployed through GitHub Actions to Emerald.

The current mainline provides:

visitor/event tracking;

anonymous visitor boundaries;

Growth Opportunity signals;

lead capture;

Ethiopian phone normalization;

transparent lead scoring;

lead ownership;

next-action and due-date controls;

lead stage history;

lead notes and tasks;

Opportunity and Customer foundations;

customer activity/timeline foundation;

products/solutions;

partners;

referral links/clicks;

commission states and manual operations;

Conversation/Message records;

communication preferences and global opt-out;

human handoff;

Email/SMS/Telegram/WhatsApp/Messenger adapter boundaries;

admin lead correction/deletion/test-data controls;

administrative audit;

lead export;

operations and production-integrity reporting;

CI/CD and production Prisma migration execution.

The latest deployment applied the sixth migration, `20260923010000_lead_admin_controls`, successfully.

The current platform is therefore beyond prototype stage.

It is not yet the complete target-state Growth OS.

---

## 2A. Q1 E2E Gap Reconciliation

Before the Q1 acceptance matrix is executed, the current mainline must pass a code-level gap reconciliation against the complete commercial chain.

The reconciliation record is `docs/qa/Q1-E2E-GAP-RECONCILIATION.md`.

The required order is:

**Financial state controls → attribution integrity → trusted workspace routing → duplicate-customer rules → audit coverage → representative partner fixture → manual typecheck/lint → behavioral Q1 acceptance evidence**

No later gate is treated as accepted merely because these code changes exist.

Current status on 2026-09-26:

- Finance payment/commission/payout permissions: implemented.
- Payment submission state control: implemented.
- Lead attribution lock and audited override: implemented.
- Arabic locale/RTL foundation: implemented.
- Dispute commercial reassignment: remaining implementation gap.
- Trusted public workspace routing: remaining implementation gap.
- Duplicate-customer acceptance rules: remaining acceptance gap.
- Financial/attribution/permission audit completeness: remaining implementation/evidence gap.
- 100-partner fixture: remaining acceptance gap.

## 3. Immediate Gate — Production Integrity Closure

This is the first task before meaningful automation or scale.

The latest deployment proves:

- code builds;
- release artifact is uploaded;
- release artifact is installed;
- Prisma migration runtime works;
- migrations apply;
- application restarts;
- production health passes.

It does not prove that historical business data is complete.

The last known integrity snapshot before the lead-admin migration reported:

18 active leads;

6 missing owners;

6 missing next actions;

6 missing due dates;

12 overdue lead actions;

2 WON leads missing positive deal value;

2 WON leads without customer relationship;

1 open task previously overdue.

The lead-admin migration was additive and did not invent historical business facts.

Therefore the next implementation operation is to run the production-integrity workflow after configuring its GitHub Actions secrets.

Required secrets:

`PRODUCTION_INTEGRITY_URL`

`PRODUCTION_INTEGRITY_TOKEN`

The result must be retained as evidence.

Known real data gaps must be corrected through the admin workspace with reasons. No artificial values may be inserted simply to make the checker pass.

### Gate to exit

The following must be true:

- no failed/unfinished migrations;
- all required core tables present;
- zero active-lead owner gaps;
- zero active-lead next-action gaps;
- zero active-lead due-date gaps;
- zero open tasks without owner;
- zero open tasks without due date;
- zero orphan opportunities;
- zero customer/origin relationship gaps covered by the integrity contract;
- zero required WON-value gaps;
- production health passes.

Overdue work may remain non-zero until the actual work is completed. The system should show overdue work instead of manipulating dates.

---

# 4. Phase 5 — Sales Follow-up Automation

## Objective

Turn the existing lead and conversation foundation into a disciplined sales-execution engine.

The first automation should reduce missed follow-up, not create mass marketing.

The system should introduce the canonical model:

**Workflow → Trigger → Condition → Action → Delay → Execution → Retry → Stop**

### 4.1 Workflow definition

A Workflow must include:

name;

description/purpose;

owner;

active state;

trigger definition;

conditions;

actions;

delay rules;

stop/cancellation rules;

retry policy;

maximum lifetime;

authorization level;

created/updated history.

Changing a workflow must produce a new configuration/version history rather than silently changing historical executions.

### 4.2 Execution model

Each Workflow Execution must record:

workflow version;

triggering event;

target entity;

execution state;

actions attempted;

action result;

retry count;

timestamps;

failure information;

cancellation reason;

actor/automation identity.

### 4.3 First production workflows

The first set should be deliberately small.

#### High-intent lead

A defined high-intent event creates or updates a lead.

The system assigns an owner.

The system creates the next action.

The system notifies the responsible operator.

An acknowledgement may be sent only where customer communication policy and consent allow it.

#### Overdue sales action

When a next action becomes overdue, the system creates an internal reminder or controlled escalation.

It must not automatically send the customer repeated messages merely because an internal deadline was missed.

#### Customer reply

A customer response should pause or terminate eligible outbound follow-up automation.

The conversation becomes available for human handling.

#### WON/LOST/closed

Prospecting automation must terminate when the corresponding commercial state becomes terminal.

#### Opt-out

Promotional automation must stop according to channel and global preference.

### 4.4 Automation safety

Before any workflow can send a real customer message, the system must demonstrate:

idempotent triggers;

stop conditions;

reply handling;

handoff handling;

opt-out handling;

WON/LOST handling;

expiry;

retry controls;

auditability;

operator visibility.

### Phase 5 exit gate

One controlled customer must be able to move through:

high-intent signal

→ lead

→ owner

→ next action

→ reminder

→ customer reply

→ automation stop

→ human handoff

without duplicate execution or unauthorized communication.

---

# 5. Phase 6A — Quote and Negotiation

Once follow-up is reliable, the next missing commercial object is the actual offer.

A quotation must be a first-class record.

It should contain:

customer;

opportunity;

items;

quantity;

unit price;

discount;

currency;

terms;

expiration;

version;

status;

creator;

timestamps.

Quote states should support:

draft;

sent;

viewed where technically measurable;

negotiating;

accepted;

rejected;

expired;

cancelled;

superseded.

A sent quote must not be silently overwritten.

A revised quote should have a new version or explicit negotiation event.

The system must be able to answer:

> What did we offer?

> What changed?

> Who changed it?

> What did the customer accept?

### Gate

A controlled quote must be sent, revised, accepted/rejected and reconstructed from history.

---

# 6. Phase 6B — Order and Payment

The system must distinguish commercial commitment from sales pipeline state.

Introduce:

**Order**

and:

**Payment**

as first-class entities.

### Order

An order should contain:

customer;

opportunity;

items;

price;

discount;

currency;

status;

payment state;

fulfillment state;

source;

campaign;

partner/referral attribution;

sales owner;

timestamps.

### Payment

A payment should contain:

order;

customer;

provider;

provider transaction/reference;

amount;

currency;

method;

state;

timestamps;

reconciliation state;

failure/reversal/refund context.

Payment states should distinguish:

initiated;

pending;

confirmed;

failed;

reversed;

refunded;

reconciled.

### Idempotency

Repeated provider events must not create duplicate payments.

A payment provider outage must not delete the order.

A failed payment must remain visible without changing the underlying customer journey.

### Ethiopian payment architecture

Payment adapters must be provider-neutral.

The core business model must not depend on a single Ethiopian provider.

ETB is the primary local operating currency.

International currencies may exist where commercially necessary.

### Gate

A controlled journey must show:

lead → opportunity → quote → accepted order → payment confirmation → customer → revenue.

The original attribution must survive.

---

# 7. Phase 6C — Revenue and Financial Attribution

Once orders and payments exist, financial reporting must separate:

pipeline value;

quoted value;

accepted order value;

paid amount;

refunds;

recognized revenue;

commissionable amount.

The system must never present pipeline as collected revenue.

The report must identify the basis of revenue attribution.

Payment reconciliation corrections must be audited.

---

# 8. Phase 6D — Campaign and Asset Attribution

Campaign becomes a first-class object.

A campaign must contain:

objective;

audience;

owner;

channel;

budget where relevant;

start/end dates;

products/services;

assets;

partners;

destination;

measurement configuration.

A Campaign Asset represents:

post;

advertisement;

video;

article;

landing page;

email;

QR placement;

influencer content;

offline promotion;

other measurable placement.

The system should preserve:

**Campaign → Asset → Source/Partner → Visitor → Lead → Opportunity → Customer → Order → Payment**

where the platform has sufficient information to do so.

### Traditional acquisition

The same model must allow:

radio;

outdoor;

flyer;

event;

field agent;

printed QR;

physical promotion;

direct sales

to be represented as acquisition campaigns.

The goal is not to pretend every traditional channel is perfectly measurable. The goal is to introduce a legitimate measurement mechanism whenever practical.

### Gate

At least one controlled acquisition campaign must be traced to a confirmed paid customer and revenue value.

---

# 9. Phase 6E — Partner, Agent and Influencer Commerce

The existing partner foundation is now extended with the **Phase F Partner Engine** implementation on mainline. The current implementation covers partner identity/profile, verification and tiers, campaign opportunities and budgets, partner applications/invitations, matching, self-service campaign discovery, performance visibility, disputes and payout ledger history.

The commercial gate is intentionally still open: payout records are operational ledger records only. Order/payment-backed revenue and commission settlement, first-class campaign assets/content, product eligibility, supplier workspace and production acceptance remain separate requirements.

Partners must support:

identity;

type;

verification;

tier;

approved products;

campaigns;

promotion assets;

links;

leads;

opportunities;

customers;

attributed revenue;

commission rules;

commission lifecycle;

payouts;

disputes.

## 9.1 Product eligibility

Partners must see only products they are allowed to promote.

Eligibility should support:

partner type;

contract/status;

product;

market;

channel;

commission policy.

## 9.2 Influencer workspace

Influencers need a simple experience:

products to promote;

creative assets;

trackable links;

clicks;

leads;

qualified leads;

customers;

attributed revenue;

commission state.

## 9.3 Agent workspace

Agents need:

lead capture;

call/meeting notes;

next action;

opportunity status;

attributed customers;

commission status.

The agent interface should be mobile-first.

## 9.4 Supplier view

A supplier should eventually be able to see:

their approved products;

sales generated;

customers;

revenue;

commission;

implementation performance;

support state.

Supplier access must be limited to the data permitted by the commercial relationship.

### Partner gate

A controlled transaction must demonstrate:

partner link → visitor → lead → opportunity → order → payment → revenue → commission → payout record.

---

# 10. Phase 6F — Trust Layer

The platform should add a Business Trust Profile.

The profile may include:

business identity;

contact information;

support channels;

location;

payment methods;

delivery expectations;

return/refund policy;

service commitments;

legitimate verification information;

reviews/testimonials with provenance.

The system must not manufacture verification or reviews.

### Gate

A customer should be able to understand who they are dealing with, how to pay, how delivery/support works, and what evidence the business legitimately provides.

---

# 11. Phase 6G — Customer Retention and Advocacy

Customer conversion is not the end of the journey.

The system should support:

onboarding;

delivery/implementation;

support;

satisfaction;

review request;

repeat purchase;

renewal;

cross-sell;

upsell;

reactivation;

referral.

Customer referrals must be distinct from partner referrals.

A customer-generated referral must preserve its original relationship to the referring customer.

### Gate

A paid customer can proceed through onboarding, review request and referral invitation, and a valid referral can create a new attributable lead without losing the original customer relationship.

---

# 12. Phase 7 — End-to-End Growth OS Verification

The complete product must prove one end-to-end journey.

The target controlled journey is:

**Campaign → Visitor → Engagement → Identification → Lead → Qualification → Conversation → Opportunity → Quote → Negotiation → Order → Payment → Customer → Revenue → Partner Attribution → Commission → Retention → Referral**

Every important transition must be reconstructable.

The complete journey is the strongest product acceptance test.

---

# 13. RBAC and Multi-Tenancy Gate

The current implementation is not yet an accepted shared multi-business SaaS platform.

Before unrelated businesses share one database, implement:

Workspace/Tenant;

Users;

Roles;

Permissions;

tenant-aware records;

tenant-aware unique constraints;

tenant-aware API queries;

tenant-aware background jobs;

tenant-aware integrations;

tenant-aware webhooks;

tenant-aware reports;

tenant-aware exports;

tenant-aware caches;

tenant-aware audit.

### Security acceptance

A user in Tenant A must not be able to retrieve:

Tenant B customer;

Tenant B lead;

Tenant B conversation;

Tenant B order;

Tenant B payment;

Tenant B commission;

Tenant B campaign;

Tenant B report.

Cross-tenant access tests must be part of CI.

Until this gate passes, commercial external workspaces should be isolated by deployment/environment rather than sharing the current database.

---

# 14. Infrastructure scaling policy

No repository evidence currently establishes a safe maximum number of customers, messages or events for Emerald.

Therefore capacity must be measured.

The safe rule is:

**Operate below 50% of validated peak capacity during the initial commercial scale stage.**

When any important resource approaches 70% sustained utilization, capacity review becomes mandatory.

Engineering review triggers include:

public p95 > 2 seconds;

admin p95 > 3 seconds;

CPU > 70% sustained;

memory > 70% sustained;

database connection use > 70% sustained;

storage > 70%;

webhook/automation backlog > 5 minutes;

application error rate > 1%;

failed backup verification;

failed migration;

critical integrity failure.

These are conservative internal safety gates, not claims that the current infrastructure is already at those levels.

---

# 15. Scaling stages

## S0 — Internal production

The system is used for Aslal operations and controlled customer traffic.

The purpose is to stabilize the commercial workflow and gather real performance data.

Shared external tenancy is not enabled.

## S1 — Managed-service pilot

External customer implementations can operate as independently isolated deployments where necessary.

No unrelated client data is mixed into the current single-tenant database.

Maximum initial exposure should be deliberately small.

The team should measure:

lead volume;

events;

messages;

orders;

payments;

DB size;

response latency;

automation executions;

webhook volume;

error rate.

## S2 — Shared multi-tenant pilot

This stage is allowed only after tenant isolation and RBAC have passed acceptance.

Start with a small number of pilot workspaces, for example five.

Use explicit per-tenant quotas.

Operate at no more than 50% of validated aggregate capacity.

## S3 — Controlled commercial scale

Increase tenant count only after:

two consecutive clean release cycles;

verified backups and restore;

tenant-isolation regression;

payment reconciliation;

webhook replay safety;

automation stop-condition tests;

mobile/low-bandwidth critical-path tests;

capacity tests.

## S4 — Ecosystem scale

Only after the complete commercial system is accepted should the platform support large partner/influencer distribution.

At this stage infrastructure can be moved from shared hosting toward:

dedicated runtime;

dedicated/managed database;

background workers;

durable job queue;

central observability;

object/file storage;

cache where justified.

Infrastructure should be upgraded because measured traffic requires it, not because it looks more sophisticated.

---

# 16. Capacity calculation method

Because current capacity is unmeasured, the first load-test release must establish:

**Vpeak = maximum validated visitors/events/messages/orders per agreed test interval.**

The initial safe operating ceiling is:

**0.50 × Vpeak**

The warning threshold is:

**0.70 × Vpeak**

The infrastructure review threshold is reached when the measured production workload repeatedly approaches 0.70 × Vpeak or any independent resource trigger is hit.

Every scaling decision should use observed:

CPU;

memory;

database connections;

database query latency;

request p95;

storage;

queue delay;

webhook processing delay;

failed requests.

This avoids inventing a customer limit from theory.

---

# 17. Mobile and low-bandwidth scale gate

Before external commercial scale, test:

public landing;

lead form;

lead confirmation;

conversation opening;

quote viewing;

payment initiation;

customer portal access.

The tests must include:

slow mobile network;

interrupted request;

retry;

refresh;

duplicate submission.

The expected result is graceful degradation without duplicate commercial records.

---

# 18. Data growth controls

As events and messages increase, the system must avoid indefinite unbounded growth in hot tables.

The design should eventually provide:

retention policies;

archival strategy;

summary tables where justified;

pagination;

incremental timeline loading;

index review;

query-cost monitoring.

Historical financial records must remain retrievable and auditable.

---

# 19. Privacy scale gate

Before broad customer scale, implement:

privacy notice;

purpose-aware tracking;

consent records;

communication preferences;

export;

deletion/anonymization;

retention;

data minimization;

partner data access controls;

audit.

No marketing or AI capability should be allowed to bypass these controls.

---

# 20. AI stage

AI begins after the transaction and attribution foundation is reliable.

The first AI functions should be low-risk:

conversation summaries;

lead summaries;

intent extraction;

follow-up suggestions;

product recommendations;

demand summaries;

anomaly suggestions.

AI must not automatically:

invent identity;

confirm unverified payment;

change attribution;

change financial values;

alter commission;

send uncontrolled promotional communication.

Every AI-generated action must have an actor identity and permission boundary.

---

# 21. Commercialization sequencing

The product promise must match verified capability.

Before automation acceptance, position the service around:

demand capture;

CRM;

sales follow-up discipline;

website-to-lead conversion;

managed digital growth.

After automation acceptance, add:

sales follow-up automation;

conversation workflows.

After order/payment/revenue acceptance, add:

demand-to-revenue attribution;

campaign ROI;

payment-connected sales reporting.

After partner commerce acceptance, add:

agent/influencer distribution;

trackable partner sales;

commission automation.

After tenant/RBAC acceptance, add:

shared SaaS/platform positioning.

The marketing message must never outrun the proven product capability.

---

# 22. Roadmap definition of done

The roadmap is complete when the system can:

capture demand;

identify customers legitimately;

preserve acquisition context;

assign ownership;

enforce next action;

manage conversations;

create and version quotes;

record negotiation;

create orders;

reconcile payments;

report collected revenue;

attribute campaign and partner activity;

calculate commissions from commercial evidence;

support retention;

support customer referral;

operate with role-based access;

isolate tenants where SaaS is offered;

remain observable and recoverable;

and produce one reconstructable customer journey from acquisition to revenue and future value.

---

# 23. Final development sequence

**0. Production integrity closure**

→ **5. Sales follow-up automation**

→ **6A. Quote + negotiation**

→ **6B. Order + payment**

→ **6C. Revenue attribution**

→ **6D. Campaign + asset attribution**

→ **6E. Partner + agent + influencer commerce**

→ **6F. Trust layer**

→ **6G. Retention + customer referral**

→ **7. End-to-end verification**

→ **RBAC + multi-tenancy**

→ **capacity-driven infrastructure scaling**

→ **AI intelligence**

The order is deliberate.

The platform should become more commercially complete at each stage without increasing the amount of unreliable complexity.

---

# 24. Non-negotiable roadmap rules

Do not add AI to compensate for unreliable data.

Do not add more acquisition channels while existing leads are being lost operationally.

Do not claim revenue attribution before payment evidence exists.

Do not automate partner commissions before attribution and payment are reliable.

Do not open shared SaaS tenancy before tenant isolation is tested.

Do not change historical commercial facts to satisfy a health dashboard.

Do not use the number of features as the definition of product maturity.

The product advances only when the business chain becomes more trustworthy.

---

# 25. Ultimate target

The final system must allow a business to answer, from one connected commercial record:

**Where did this customer come from?**

**What did the customer want?**

**Why did the system treat the interaction as demand?**

**Who owned it?**

**What happened in the conversation?**

**What was quoted?**

**What changed during negotiation?**

**What order was accepted?**

**What was paid?**

**How much revenue was actually received?**

**Which campaign or partner contributed?**

**What commission was earned?**

**What should happen next with the customer?**

**Did the customer later return or refer someone else?**

That is the complete Growth OS.
