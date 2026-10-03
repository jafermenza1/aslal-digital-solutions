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
- Dispute commercial reassignment: implemented; transaction-failure atomicity evidence remains.
- Trusted public workspace routing: implemented with host mapping; three-anchor configuration/evidence remains.
- Duplicate-customer guard: implemented; duplicate identity behavioral evidence remains.
- Financial/attribution/permission audit completeness: still requires coverage closure and evidence.
- 100-partner fixture: remaining acceptance gap.

## Commercial Engine reconciliation note

The detailed commercial domain is now specified in docs/MAIN-COMMERCIAL-ENGINE.md.

The commercial engine is **not a replacement roadmap**. Its CE-1 through CE-13 increments are domain slices that must be assigned to the existing roadmap phases according to dependencies and acceptance gates.

The commercial gap-closure requirements are tracked as R50-R65 in TRACEABILITY.md. In particular, commercial listing, demand requests, deal registration, inspection, professional services, matching, external payment evidence and leakage/dispute controls must be implemented as extensions of the existing Lead → Opportunity → Quote/Proposal → Order → Payment → Revenue → Commission chain.

No CE increment is considered accepted merely because its schema or UI exists.

## 2B. Public Commerce & Conversation Experience — Increment Plan

**Increment:** PCCE-1 through PCCE-10  
**Status:** PCCE-1 IMPLEMENTED — ACCEPTANCE PENDING; PCCE-2 through PCCE-10 planned  
**Purpose:** turn the existing public website, Growth Builder, catalog, attribution, Telegram, WhatsApp and Email foundations into one simple customer-facing commerce and conversation experience without creating a second CRM, order ledger, attribution ledger or communication system.

### 2B.1 Product principle

The customer should experience one simple journey while the platform performs the complex work underneath:

**Discover → Understand → Ask/Order → Talk → Qualify → Match → Offer → Agree → Pay → Deliver → Follow Up → Refer**

Public language must not expose internal implementation terms such as CommercialRequest, CommercialMatch, CommercialEligibility or CommercialDealRegistration. Use simple language: Tell us what you need; Find a solution; Request a product or service; Talk to a specialist; Order; Share.

The existing canonical records remain authoritative. The experience layer must reuse them.

### 2B.2 Channel responsibilities

| Surface | Primary responsibility | Boundary |
|---|---|---|
| Public website | discovery, education, trust, catalog and demand capture | not a second CRM |
| Growth Builder | guided qualification and structured demand intake | not a separate lead database |
| Telegram | conversational commerce, ordering, status and handoff | not a duplicate CRM |
| Email | formal/persistent lifecycle communication and documents | not a second conversation ledger |
| WhatsApp | familiar direct conversation and human handoff where enabled | not a separate customer record |
| Partner links/assets | attributable acquisition and sharing | not an isolated campaign system |
| Dashboard | internal execution and reporting | not a public workflow |
| Partner Portal | partner self-service, sharing, attribution and earnings | not an admin console |

All channels must resolve to the same person/customer, lead, commercial demand, conversation and commercial records where applicable.

### 2B.3 PCCE-1 — Experience Contract & Terminology

**Status:** IMPLEMENTED — ACCEPTANCE PENDING

**Goal:** establish one user-facing vocabulary before changing screens.

**Implementation:**
- define primary public intents: Get more customers; Sell online; Automate conversations; Build a digital system;
- map each intent to existing products, services, Growth Builder questions and commercial demand creation;
- define public labels for product, service, custom requirement, quote, order, payment and support;
- define channel handoff rules and attribution requirements;
- keep internal entity names in code/admin diagnostics rather than public UI;
- add terminology/route tests for critical public journeys.

**Acceptance:** a new visitor can understand what to do without knowing Aslal's internal commercial-domain terminology.

**Implemented on main:** `lib/public-commerce-contract.ts` centralizes public intents, CTA vocabulary, public route semantics and internal-to-public terminology mapping. `components/GrowthBuilder.tsx` now consumes the public intent contract instead of exposing legacy workflow-stage labels. `scripts/pcce-1-contract-check.mjs` validates the four supported locale vocabularies, contract exports and removal of the legacy Growth Builder terms.

**Remaining acceptance evidence:** run `npm run pcce-1:check`, `npm run lint`, `npm run typecheck` and the relevant public-route/browser checks on the current mainline.

### 2B.4 PCCE-2 — Public Homepage & Intent Gateway

**Goal:** make the website the first decision point rather than a feature directory.

**Implementation:**
- simplify the homepage around 3–4 primary intents;
- prominent Tell us what you need CTA;
- Browse products and Explore services paths;
- Talk to us on Telegram where enabled;
- preserve multilingual/locale behavior;
- instrument intent selection and CTA attribution with existing event/lead infrastructure;
- ensure every CTA enters an existing tracked journey rather than a parallel intake.

**Acceptance:** every primary CTA produces a measurable continuation to catalog, demand capture or conversation.

### 2B.5 PCCE-3 — Public Catalog & Offer Experience

**Goal:** make products and services commercially understandable and actionable.

**Implementation:**
- improve product discovery with category/search/filter appropriate to catalog size;
- product pages show clear value, price/starting price when available, availability/context and legitimate trust information;
- Product → Order; Service → Request service; Custom → Tell us what you need;
- offer Telegram continuation where supported;
- preserve partner/referral attribution on supported CTAs;
- never imply inventory, price or provider availability unsupported by canonical data.

**Acceptance:** a visitor can move from discovery to a tracked request/order/conversation without losing attribution.

### 2B.6 PCCE-4 — Growth Builder as Guided Demand Gateway

**Goal:** turn uncertainty into structured demand without exposing commercial complexity.

**Implementation:**
- ask only useful questions: need/outcome, business type, budget range when appropriate, preferred channel and urgency;
- progressively ask additional questions only when routing requires them;
- create/update canonical Person, Lead and CommercialRequest records;
- preserve source/campaign/partner attribution;
- route demand to the correct internal workflow;
- offer Telegram continuation when the visitor prefers conversation.

**Acceptance:** an uncertain visitor can reach structured demand with contact, source and attribution context intact.

### 2B.7 PCCE-5 — Telegram Conversational Commerce

**Goal:** make Telegram the fastest low-friction path from discovery to human-assisted commerce.

**Telegram home:** Browse products; Explore services; Tell us what you need; My orders; Talk to a person; Partner with Aslal.

**Implementation:**
- reuse existing Telegram identity, catalog, ordering, service-request, attribution, follow-up and handoff foundations;
- connect Telegram to canonical Person/customer and Conversation records;
- support product/service discovery and order/request continuation;
- preserve partner/referral source through handoff;
- show recent order/request context;
- stop automated follow-up when the customer replies or human handoff occurs;
- make repeated Telegram events/callbacks idempotent;
- provide controlled operator handoff.

**Acceptance:** a Telegram user can discover/request/order, reply to automation and reach a human without duplicate customer/conversation records.

### 2B.8 PCCE-6 — Email as Formal Lifecycle Communication

**Goal:** use Email for durable business communication rather than competing with Telegram/WhatsApp for chat.

**Implementation:**
- reuse EmailOutbox, inbound email, conversation/message records, retries and identity matching;
- define lifecycle templates for acknowledgement, qualification follow-up where appropriate, proposal/quote, agreement, order, payment, fulfillment, partner commission and payout;
- preserve threading/reference information;
- honor communication preferences and opt-out;
- distinguish transactional/service messages from promotional messages;
- expose delivery/failure state to operators.

**Acceptance:** important commercial milestones are reconstructable from persistent messages and email failure does not destroy the underlying transaction.

### 2B.9 PCCE-7 — Cross-Channel Identity, Handoff & Attribution

**Goal:** make Website → Telegram → Email → human support feel like one relationship.

**Implementation:**
- define deterministic identity matching and safe merge rules;
- prevent duplicate Person/Customer/Conversation records during channel transitions;
- carry source, campaign and partner attribution through handoff;
- preserve original demand and commercial context;
- expose authorized channel history to internal users;
- audit identity merges/handoff decisions when they affect attribution;
- test anonymous-to-known and known-to-known transitions.

**Acceptance:** the same customer can start on the website, continue on Telegram and receive formal Email communication without losing identity, demand context or valid attribution.

### 2B.10 PCCE-8 — Partner Sharing & Attributed Commerce Assets

**Goal:** make partner participation a simple share-and-earn workflow while protecting attribution integrity.

**Partner actions:** Share a product; Share a service; Find an opportunity; My referrals; My earnings; My agreements; My profile.

**Implementation:**
- generate attributed web links and Telegram continuation links where supported;
- generate QR codes for supported offers;
- support printable tickets, coupons or related sales assets only where the underlying product/program permits;
- reuse PartnerSalesAssetAllocation and IssuedSalesAsset rather than creating another asset ledger;
- preserve partner identity from asset → visit → demand → order → payment → revenue → commission;
- prevent a partner from claiming credit for work they did not contribute;
- explain earning/attribution status clearly to partners.

**Acceptance:** a partner can share an approved offer and reconstruct legitimate attributable activity through the canonical commercial and financial chain.

### 2B.11 PCCE-9 — Internal Commerce Workspace Simplification

**Goal:** hide domain complexity from staff while preserving operational control.

**Primary navigation:** My Work; Sales; Commerce; Partners; Finance; Communications; Reports.

**Implementation:**
- present CommercialRequest as Demand;
- present CommercialMatch as Matches with human-readable reasons;
- show eligibility separately from relevance/matching;
- provide one customer timeline containing demand, conversation, offer, agreement, order, payment and attribution context;
- provide role-specific actions and reports;
- expose edit/amend controls only where the user's role permits;
- audit financially or operationally meaningful changes.

**Acceptance:** sales, partner operations and finance users can complete assigned work without navigating internal entity names or unrelated modules.

### 2B.12 PCCE-10 — Public Commerce & Conversation Certification

**Goal:** certify the complete channel experience before calling it production-ready.

**Required E2E scenarios:**
1. Website visitor → product → request/order → Telegram continuation → human handoff.
2. Website visitor → Growth Builder → structured demand → internal routing → response.
3. Partner link → website → demand → opportunity → order → payment → attributable revenue/commission path.
4. Telegram product discovery → order → payment state → Email confirmation.
5. Service request → qualification → proposal/quote → agreement → order/payment path.
6. Customer reply during automated follow-up → automation stops → human takes over.
7. Email delivery failure → transaction remains intact → retry/visible failure state.
8. Duplicate channel event/webhook → no duplicate person, conversation, order or payment.
9. Printable/QR sales asset → attributed visit/request/order where supported.
10. Customer opt-out → promotional automation stops while permitted transactional communication remains correctly classified.

**Certification evidence:** browser/mobile acceptance; Telegram evidence; Email delivery/threading evidence; attribution reconstruction; duplicate-event/idempotency evidence; authorization/isolation evidence; audit evidence; production smoke test.

**Gate:** PCCE is accepted only when the user journey and canonical records can be reconstructed from discovery through commercial outcome without duplicate ledgers or broken attribution.

### 2B.13 Implementation dependency order

**PCCE-1 Experience Contract → PCCE-2 Homepage/Intent → PCCE-3 Catalog/Offers → PCCE-4 Growth Builder → PCCE-5 Telegram → PCCE-6 Email → PCCE-7 Identity/Handoff/Attribution → PCCE-8 Partner Sharing/Assets → PCCE-9 Internal Workspace → PCCE-10 Certification**

PCCE-5 and PCCE-6 may be developed in parallel after PCCE-1. PCCE-7 is the integration gate before channels are declared one experience.

### 2B.14 Relationship to the canonical commercial roadmap

PCCE is a cross-cutting experience increment, not a replacement roadmap. It consumes the canonical chain:

**Demand → Qualification → Conversation → Match → Eligibility → Proposal/Quote → Agreement → Order → Payment → Revenue → Attribution → Commission → Payout → Retention/Referral**

It must not create parallel customer, demand, order, payment, communication or attribution ledgers. If an underlying capability is not production-accepted, the public experience must show the correct request/handoff state instead of pretending the capability is available.

### 2B.15 PCCE release gates

| Gate | Required evidence |
|---|---|
| G1 Experience | public terminology and intent paths validated |
| G2 Discovery | catalog/product/service journeys tracked |
| G3 Demand | Growth Builder creates canonical demand with attribution |
| G4 Conversation | Telegram and Email operate against canonical identity/conversation records |
| G5 Commerce | request → offer → order/payment transitions reconstructable |
| G6 Attribution | partner/source attribution survives channel and commerce transitions |
| G7 Operations | staff operate journeys from role-appropriate workspaces |
| G8 Integrity | duplicate, failure, opt-out, handoff and authorization tests pass |
| G9 Production | deployment smoke tests and real-channel evidence pass |

PCCE is complete only after G9. Code presence alone does not advance the roadmap gate.


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


---

# Q1 Operational Blocker Closure Program — 2026-09-26

This section is the active implementation plan for closing the remaining Month 1–3 operational blockers before Q1 behavioral acceptance. It does not create a second roadmap; it is a controlled execution program inside this canonical roadmap.

## Closure order

### Step 1 — Manual payment reconciliation workbench
**Status: STARTING — code/UI reconciliation required**

Current evidence shows an Orders workspace already contains payment/reconciliation controls and the payment API now correctly rejects direct CONFIRMED submission. However, the UI still submits a CONFIRMED payment and therefore conflicts with the hardened API. The Finance page exposes commission/payout controls but not the payment review queue.

**Implementation sequence**
1. Make payment capture create PENDING only.
2. Move confirmation/reconciliation authority into a Finance-controlled review surface.
3. Expose order/payment queue filtered by active workspace.
4. Require provider, method, amount, provider transaction reference where available, evidence reference, verification notes and exception reason.
5. Confirm payment only through the authorized transition path.
6. Reconcile only a confirmed payment with evidence.
7. Preserve verifier, timestamp and activity/audit evidence.
8. Prevent duplicate/idempotent payment creation and overpayment.
9. Verify revenue and commission are created only after reconciliation.
10. Verify reversal/refund removes recognized revenue and voids commission without deleting history.

**Exit gate:** one controlled order can move PENDING → CONFIRMED → RECONCILED → REVENUE → COMMISSION through the Finance workbench, with retained evidence and no cross-workspace access.

### Step 2 — Sales SLA scheduler and notification safety
**Status: IMPLEMENTED FOUNDATION — ACCEPTANCE BLOCKED**

The protected /api/cron/sales-automation endpoint exists and calls the scheduler plus Telegram follow-up processing. No GitHub Actions scheduler will be restored.

**Implementation sequence**
1. Verify runScheduledAutomation() finds eligible overdue/high-intent executions.
2. Prove idempotency for repeated scheduler calls.
3. Prove bounded retry/stale recovery.
4. Prove reply/WON/LOST cancellation.
5. Keep internal reminder behavior distinct from customer messaging.
6. Add provider-backed SMS/Telegram SLA notification only if the pilot requires it; make delivery idempotent and auditable.
7. Retain scheduler request/response and execution records as evidence.

**Exit gate:** repeated protected scheduler runs produce no duplicate work and all stop conditions are proven.

### Step 3 — Three-anchor workspace/client boundary
**Status: FOUNDATION — IMPLEMENTATION/ACCEPTANCE REQUIRED**

1. Create three isolated pilot workspaces.
2. Create Finance/Sales/Auditor/Client users in each intended workspace.
3. Prove every client-visible lead/customer/order/payment/commission/report query is workspace-scoped.
4. Build/complete a client CRM surface showing only that client's pipeline, assigned leads and rep tasks.
5. Prove negative cross-workspace access for direct routes and APIs.
6. Keep shared SaaS exposure blocked until this gate passes.

**Exit gate:** three anchor fixtures can operate independently without cross-workspace data visibility.

### Step 4 — 100-agent provisioning and identity
**Status: PARTIAL — IMPLEMENTATION REQUIRED**

1. Add deterministic bulk onboarding for 100 vetted test/pilot partners.
2. Reconcile the requested display convention ASL-P-0001 through ASL-P-0100 without silently rewriting historical IDs.
3. Generate unique referral links and QR badges.
4. Verify workspace ownership and partner status.
5. Produce a retained cohort manifest.

**Exit gate:** 100 unique partners, IDs, links and badges are generated and workspace-safe.

### Step 5 — Attribution policy and retention
**Status: PARTIAL — POLICY + IMPLEMENTATION REQUIRED**

1. Document first-touch and last-touch semantics.
2. Define when attribution locks.
3. Define authorized override reasons and audit fields.
4. Define the 30-day referral click/cookie/link retention window.
5. Define expiry behavior and what happens after expiry.
6. Test competing-agent attribution and dispute reassignment.
7. Prove atomic rollback on failed dispute resolution.

**Exit gate:** attribution is deterministic, auditable and recoverable across the defined 30-day window.

### Step 6 — Client audit/reporting and campaign distribution
**Status: PARTIAL**

1. Add a repeatable weekly client pipeline audit view/export.
2. Complete campaign asset publishing/distribution acceptance.
3. Preserve campaign → asset → referral/visitor → lead lineage.
4. Verify partner-facing material visibility is limited to published assets in the correct workspace.

**Exit gate:** an operator can produce the same weekly pipeline/audit evidence without manual copying across systems.

### Step 7 — Operational SOP and evidence pack
**Status: OPEN**

Create and retain operator procedures for:
- disputed attribution;
- cancelled/refunded orders;
- merchant invoice issuance/allocation/payment collection;
- payout batch preparation and external money movement;
- receipt verification and exception handling.

**Exit gate:** each SOP maps to a system control, actor, evidence record and recovery path.

### Step 8 — Final Q1 behavioral acceptance
**Status: BLOCKED until Steps 1–7 exit**

Run the controlled two/three-workspace matrix:
Lead → Qualification → Follow-up → Customer → Quote → Order → PENDING Payment → Finance confirmation → Reconciliation → Revenue → Commission → Payout, plus partner attribution, dispute/refund, audit, mobile and localization checks.

Only retained behavioral evidence may move Q1 from NOT ACCEPTED to accepted.

## Working rule

After each step:
1. inspect current mainline;
2. implement only the gap for that step;
3. run the allowed local checks (npm run typecheck, npm run lint) when code changes are made;
4. update this plan, Q1-OPERATION-PLAN-RECONCILIATION.md, Q1-E2E-GAP-RECONCILIATION.md and execution state with exact evidence;
5. do not advance the next step merely because code exists.

GitHub Actions remain disabled during this program.


## Step 1 implementation progress — 2026-09-26

**Status: IMPLEMENTED — BEHAVIORAL ACCEPTANCE PENDING.**

Implemented on `main`: payment capture is now PENDING-only in the Orders UI; a workspace-scoped Finance reconciliation queue/API was added; Finance can match receipt evidence, confirm collection, reconcile to revenue, or flag an exception. Existing payment API controls remain authoritative. No GitHub Actions were restored.

**Validation limitation:** repository changes were inspected through the GitHub source; `npm run typecheck` and `npm run lint` have not yet been executed in this step. They are required before Step 1 can exit.


## Step 2 implementation progress — 2026-09-26

**Current step:** Step 2 — Sales SLA scheduler and notification safety.
**Status:** IMPLEMENTED FOUNDATION — ACCEPTANCE PENDING.

Step 2 hardening is now on `main` without restoring GitHub Actions:

- the protected `/api/cron/sales-automation` endpoint now invokes only the internal sales SLA scheduler;
- customer-facing Telegram follow-up processing was separated into its own protected `/api/cron/telegram-followups` endpoint so Gate 2 scheduler execution cannot unexpectedly send customer messages;
- Telegram follow-up scheduling accepts a dedicated `TELEGRAM_FOLLOWUP_CRON_SECRET` and falls back to `AUTOMATION_CRON_SECRET` for controlled migration of existing deployments;
- workflow execution claiming is now atomic: only a PENDING execution can be claimed by a worker;
- workflow action claiming is now atomic: only a due PENDING action can be claimed, preventing concurrent scheduler invocations from executing the same action twice;
- existing idempotency keys, overdue-deadline keys, bounded retries, stale-running recovery, reply cancellation and WON/LOST cancellation remain intact;
- Gate 2 remains internal-only: no promotional customer messaging is introduced by the SLA scheduler.

**Required exit evidence:** protected scheduler invocation, high-intent execution, repeated-trigger idempotency, overdue deduplication, retry/stale recovery, reply cancellation, WON/LOST cancellation, workspace-scoped ownership, operator visibility, no customer promotional message, and local typecheck/lint evidence.

Q1 remains **NOT ACCEPTED** until this behavioral evidence is retained.


## Step 3 implementation progress — 2026-09-26

**Current step:** Step 3 — Three-anchor workspace/client boundary.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Implemented on `main`:

- added a dedicated `/dashboard/client` CRM surface for the CLIENT role;
- the client surface resolves the active workspace through `authorizeWorkspacePermission("dashboard.view", workspaceId)` before every client-visible query;
- client-visible leads, customers, orders, sales tasks and commission totals are filtered by the authorized workspace ID;
- the client surface exposes active pipeline, assigned lead owner/next action, rep task list, recent orders/payment state and workspace commission totals without requiring broad operational mutation permissions;
- CLIENT no longer receives generic `commerce.view`, preventing the general Orders workspace from becoming an unintended client-facing surface;
- the generic dashboard redirects CLIENT users to the dedicated client CRM surface;
- existing workspace membership authorization remains the boundary for requested workspace IDs, including denial when the user is not a member;
- existing negative workspace tests remain available for direct lead/order/payment/customer/revenue/commission/payout access.

**Required exit evidence:** three isolated anchor workspaces, Finance/Sales/Auditor/Client users per intended workspace, client CRM queries confirmed workspace-scoped, direct cross-workspace route/API denial, and retained A/B/C behavioral evidence.

Q1 remains **NOT ACCEPTED** until the three-anchor fixture and negative tests are executed and retained.


## Step 4 implementation progress — 2026-09-26

**Step:** 100-agent provisioning and identity.  
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Mainline now provides a protected deterministic Q1 provisioning endpoint at `/api/admin/partners/bulk-provision` and an administrator-only provisioning control in the Partner workspace. The fixture creates up to 100 pending AGENT identities using the requested display convention `ASL-P-0001` through `ASL-P-0100`, with deterministic referral codes `q1-agent-001` through `q1-agent-100`.

Provisioning is transactional and workspace-bound. Re-running the same fixture in the same workspace reuses matching fixture identities and referral links instead of creating duplicates. Existing identifiers belonging to another workspace or non-fixture records cause a conflict and are never reassigned or rewritten. No portal credentials, payment, commission or financial activity is created by the fixture.

### Step 4 acceptance still required

1. Select each intended anchor workspace and provision the 100-agent fixture only where the fixture is authorized.
2. Verify exactly 100 unique partner identities and 100 unique referral links.
3. Verify `Partner.workspace_id` and `ReferralLink.workspace_id` match the target workspace.
4. Repeat the request and prove idempotent reuse with no duplicate partner/link rows.
5. Attempt provisioning against an unauthorized workspace and prove rejection/no records.
6. Verify ASL-P-0001…ASL-P-0100 are preserved as display identities and historical non-fixture partner numbers are not rewritten.
7. Verify credentials remain unissued until the separate approval/credential workflow.
8. Retain request/response and database evidence.

Q1 remains **NOT ACCEPTED**.


## Step 5 implementation progress — 2026-09-26

**Step:** Attribution policy and 30-day retention.  
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Mainline now defines and enforces the Q1 attribution window:

- **First touch:** the visitor's first recorded source/medium/campaign/referral is retained in the visitor record and is never replaced by later tracking events.
- **Last touch:** the most recent valid partner referral click for the visitor in the active public workspace is the referral attribution considered at lead capture.
- **Attribution selection:** a referral code is accepted only when the recorded referral click belongs to the same resolved workspace as the lead capture.
- **Retention:** partner referral cookies now expire after 30 days. Lead attribution also records the expiry timestamp derived from the qualifying referral click.
- **Expiry:** a referral attribution older than 30 days is not selected for a new lead, even if an obsolete cookie is still present.
- **Lock:** once a partner attribution is captured on a lead, existing attribution-lock controls prevent ordinary edits. Authorized corrections require the existing partner-management permission and an explicit reason/audit path.
- **Disputes:** the existing competing-partner dispute flow remains the controlled path for contested attribution and commercial reassignment.

### Step 5 acceptance still required

1. Capture a first-touch visitor and verify first source/medium/campaign/referral remain unchanged after later touches.
2. Generate two partner referral clicks within 30 days and verify the latest valid click is the lead's last-touch attribution.
3. Verify a referral from another workspace is rejected for attribution.
4. Verify an attribution older than 30 days is not selected.
5. Verify locked attribution rejects an ordinary edit and an authorized override requires a reason.
6. Resolve a competing-agent dispute and retain before/after attribution plus commission/revenue evidence.
7. Prove a failed dispute transaction leaves attribution, commission and revenue unchanged.
8. Retain request, database and audit evidence for the controlled run.

Q1 remains **NOT ACCEPTED** until these behavioral tests are executed and retained.


## Step 6 implementation progress — 2026-09-26

**Step:** Client audit/reporting and campaign distribution.
**Status:** IMPLEMENTED FOUNDATION — BEHAVIORAL ACCEPTANCE PENDING.

Mainline now provides a workspace-scoped weekly pipeline audit endpoint at /api/admin/reports/weekly-pipeline. It defaults to a rolling seven-day window, accepts explicit from/to bounds, returns JSON for an audit view, and supports format=csv for a repeatable export. The endpoint requires dashboard.view authorization for the requested workspace and joins lead first-touch data, current attribution, partner/campaign lineage, published campaign-asset count, opportunity state/value and order evidence without crossing workspace boundaries.

The CLIENT CRM now exposes the seven-day CSV export. Campaign distribution remains restricted to published assets in the existing Telegram partner workbench path; campaign assets and referral links remain workspace-bound.

### Step 6 acceptance still required

1. Run the weekly audit for each anchor workspace and retain the JSON/CSV output.
2. Verify repeated runs for the same date range produce the same source records absent intervening data changes.
3. Verify client users cannot export another workspace by changing workspaceId.
4. Verify campaign → published asset → referral link → visitor/lead lineage for a controlled campaign.
5. Verify draft/archived assets never appear in partner-facing campaign materials.
6. Retain audit/export and partner-material evidence.

Q1 remains NOT ACCEPTED until Step 6 behavioral evidence is retained.


## Step 7 implementation progress — 2026-09-26

**Step:** Operational SOP and evidence pack.
**Status:** IMPLEMENTED FOUNDATION — OPERATIONAL EXECUTION PENDING.

Added docs/ops/Q1-OPERATOR-SOP-EVIDENCE.md covering disputed attribution, cancelled/refunded orders, merchant invoice issuance/allocation/collection, payout batch preparation/external money movement, and receipt verification/exception handling. Each SOP maps the procedure to the relevant system control, authorized actor, retained evidence and recovery path. The payout section explicitly records that full batch-generation remains a known PARTIAL implementation gap and does not imply external settlement merely from platform state.

### Step 7 acceptance still required

1. Execute one controlled run of each SOP.
2. Retain request/action, authorization, database before/after and recovery evidence.
3. Prove failed financial/dispute transactions leave protected state unchanged.
4. Verify payout evidence distinguishes prepared batches from externally settled money.
5. Verify receipt exceptions remain non-reconciled until resolved.

Q1 remains **NOT ACCEPTED**.
