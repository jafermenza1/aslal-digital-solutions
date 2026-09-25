# Aslal Growth OS — OS Extension / Commercial Completion Phase

**Document:** OS-EXT-COMMERCIAL-001  
**Status:** Proposed next implementation phase  
**Date:** 2026-09-25  
**Repository:** `jafermenza1/aslal-digital-solutions`

## 1. Purpose

The current Growth OS has a substantial acquisition, CRM, conversation, quote, order/payment, partner and campaign foundation. The remaining work is to harden the commercial chain with evidence, payout controls, attribution controls and production acceptance.

The next phase must close the highest-value gap:

**Customer → Opportunity → Quote → Order → Payment → Reconciliation → Confirmed Revenue → Commission**

At the same time, Aslal must stop treating every form submission as an isolated lead. Existing Person/Opportunity/Customer foundations should be hardened into a connected customer record and a single salesperson workflow.

This phase is intentionally transaction-first. It must not add AI or additional acquisition complexity before commercial truth is reliable.

## 2. Current progress snapshot

| Area | Current state | What remains |
|---|---|---|
| Visitor/event foundation | SATISFIED / IMPLEMENTED-UNVERIFIED by requirement | Fresh production journey proof |
| Lead capture/scoring/ownership | IMPLEMENTED-UNVERIFIED | Production integrity and end-to-end proof |
| Person / Opportunity / Customer | SATISFIED foundation; customer requirement remains IMPLEMENTED-UNVERIFIED in traceability | Customer 360 identity resolution, deduplication, linked history and production proof |
| Unified timeline | IMPLEMENTED-UNVERIFIED | Demonstrate one reconstructable record across events, activities, conversations, opportunity and customer |
| Sales follow-up automation | IMPLEMENTED-UNVERIFIED | Scheduler/production acceptance and safety proof |
| Quote / negotiation | IMPLEMENTED-UNVERIFIED | Controlled create → send → view/negotiation → revision → accept/reject reconstruction |
| Order | IMPLEMENTED-UNVERIFIED | First-class committed purchase domain exists; controlled production reconstruction remains |
| Payment | IMPLEMENTED-UNVERIFIED | Provider-neutral payment domain, idempotency, state transitions and reconciliation exist; manual evidence/verification controls are being hardened |
| Revenue attribution | IMPLEMENTED-UNVERIFIED | Reconciled payments create recognized revenue; controlled production evidence remains |
| Campaign / asset attribution | PARTIAL | First-class Campaign Asset and placement/content lineage |
| Partner commerce | PARTIAL | Reconciled payment → revenue → commission lineage exists; payout linkage, product eligibility and controlled production acceptance remain |
| Trust / reviews | MISSING | Permission, provenance, moderation and publication lifecycle |
| Retention / customer referral | MISSING / PARTIAL | Post-sale lifecycle and customer advocacy |
| RBAC | PARTIAL | Full permission enforcement across legacy routes |
| Multi-tenancy | MISSING | Tenant model and isolation tests |
| Privacy lifecycle | PARTIAL | Retention, export, deletion/anonymization |
| Mobile / low bandwidth | PARTIAL | Critical-path device/network evidence |
| Production integrity | IMPLEMENTED-UNVERIFIED | Successful configured production-integrity run |
| Complete E2E Growth OS | MISSING | One controlled journey from campaign through paid revenue and future value |

## 3. Immediate priority order

### Gate 0 — Production integrity closure

Before commercial expansion:

1. Run the production-integrity checker against the deployed release.
2. Correct real data gaps with audit reasons.
3. Do not fabricate historical values to satisfy the checker.
4. Preserve the result as acceptance evidence.

### Phase 1 — Customer 360 / unified customer record

Harden the existing Person → Lead → Opportunity → Customer foundation.

The target is not to delete the Lead concept. A lead remains an acquisition/sales-state record. The customer record becomes the durable commercial identity.

Required behavior:

**Visitor/form submission → Person resolution → Lead → Opportunity → Customer**

A repeat submission from the same legitimate person should attach to the existing person/customer context rather than creating an unrelated identity.

The customer record should expose:

- canonical identity;
- contact methods;
- consent/preferences;
- source/acquisition context;
- all related leads;
- active and historical opportunities;
- quotes and negotiation history;
- orders;
- payments;
- confirmed revenue;
- conversations;
- activities;
- referrals;
- campaign/partner attribution;
- retention/customer-success events.

Identity resolution must be deterministic and auditable. It must not merge two people merely because weak fields happen to match.

Acceptance:

- repeated form submissions can resolve to the same person/customer when the matching evidence is valid;
- distinct people remain distinct;
- every merge/link decision is auditable;
- the salesperson can open one customer record and reconstruct the commercial history.

### Phase 2 — Salesperson end-to-end proof

Prove that a real salesperson can operate the commercial journey without manually jumping between disconnected systems.

Required path:

**New lead → owner → next action → qualification → opportunity → quote → send → customer view/negotiation → revision → accept/reject → order → payment → confirmed revenue**

The salesperson workspace should make the next action obvious at every stage.

Acceptance requires a controlled test customer and evidence of each transition.

### Phase 3 — First-class Order (implemented; acceptance gate remains)

Introduce a first-class Order independent of Lead/Opportunity stage.

Minimum concepts:

- order ID/number;
- customer;
- opportunity;
- accepted quote;
- order items;
- quantity;
- price;
- discount;
- currency;
- total;
- status;
- payment state;
- fulfillment state;
- source/campaign;
- partner/referral attribution;
- sales owner;
- timestamps;
- audit history.

An accepted quote does not itself equal an order unless an explicit order-creation transition occurs.

### Phase 4 — First-class Payment (implemented; evidence hardening remains)

Introduce a provider-neutral Payment domain.

Minimum fields:

- payment ID;
- order ID;
- customer;
- provider;
- provider transaction/reference ID;
- amount;
- currency;
- payment method;
- status;
- idempotency key;
- initiated/confirmed timestamps;
- failure reason;
- reversal/refund information;
- reconciliation status;
- audit metadata.

Required states:

**INITIATED → PENDING → CONFIRMED**

with explicit terminal/exception states:

**FAILED / REVERSED / REFUNDED / RECONCILED**

Provider callbacks must be idempotent. Replayed callbacks must not create duplicate payments.

Payment failure must not delete or corrupt the order.

### Phase 5 — Reconciliation and confirmed revenue (implemented; controlled acceptance remains)

Separate these values:

- pipeline value;
- quote value;
- accepted order value;
- payment amount;
- confirmed collected amount;
- refunds/reversals;
- recognized/attributed revenue;
- commissionable amount.

The reporting rule is:

**deal value ≠ collected revenue**

Only reconciled payment evidence can feed the confirmed-collection/revenue ledger.

Required chain:

**Order → Payment → confirmed collection → revenue attribution**

Every financial correction must be auditable.

### Phase 6 — Commission connection (implemented; payout control remains)

Only after payment/revenue evidence exists:

**Order → Payment → Reconciliation → Confirmed Revenue → Commission**

Commission calculation must reference commercial evidence rather than merely a lead, opportunity or quoted value.

The existing partner payout ledger remains useful, but it must not be represented as payment-backed commission until this chain is accepted.

### Phase 7 — Campaign and asset ROI

Complete:

**Campaign → Campaign Asset → placement/content → visitor → lead → opportunity → order → payment → revenue**

Campaign Asset must support measurable placements such as:

- social post;
- advertisement;
- video;
- article;
- landing page;
- email;
- QR placement;
- influencer content;
- offline promotion.

The attribution system should preserve what is actually known without inventing precision for channels that cannot be measured exactly.

Acceptance:

At least one controlled campaign can be reconstructed through confirmed paid revenue.

### Phase 8 — Trust, retention and customer referral

After transaction truth is reliable:

**Customer → legitimate request → permission → review → provenance → moderation → publication**

and:

**Purchase → onboarding → customer success → repeat purchase → renewal → cross-sell → reactivation**

and:

**Existing customer → referral invitation → new customer → attribution → resulting value**

Customer referral must remain distinct from partner referral.

### Phase 9 — Platform controls

After the commercial chain is proven:

- complete RBAC across legacy routes;
- introduce tenant/workspace boundaries;
- enforce tenant-aware API queries, jobs, reports, exports, integrations, webhooks, caches and audit;
- add cross-tenant access tests;
- complete privacy retention/export/deletion/anonymization;
- complete critical-path mobile/low-bandwidth tests;
- establish production-integrity and recovery evidence.

Shared multi-business SaaS must remain blocked until tenant isolation is accepted.

## 4. Unified commercial model

The target architecture is:

**Visitor**
→ **Person**
→ **Lead**
→ **Opportunity**
→ **Quote**
→ **Order**
→ **Payment**
→ **Reconciliation**
→ **Confirmed Revenue**
→ **Commission**
→ **Payout**

With parallel context:

**Campaign → Campaign Asset → placement → Visitor**

and:

**Partner → referral/asset → Visitor → Lead → Opportunity → Order → Payment → Revenue → Commission**

and after purchase:

**Customer → Onboarding → Success → Repeat/Renewal/Cross-sell → Referral**

## 5. Critical business rules

1. A form submission is an event/acquisition entry, not automatically a new customer.
2. A Lead represents sales demand; Customer represents the durable commercial relationship.
3. Opportunity represents active commercial pursuit.
4. Quote represents an offer and must be versioned.
5. Order represents customer commitment independently of pipeline stage.
6. Payment represents an attempt/transaction independently of order state.
7. Confirmed revenue must be backed by reconciled collection evidence.
8. Commission must be calculated from accepted commercial/revenue evidence.
9. Payout records must not imply money movement unless actual payout execution is implemented.
10. Campaign attribution must survive through order/payment/revenue when the source information is available.
11. Customer referrals must not be conflated with partner referrals.
12. AI remains deferred until transaction and attribution data are reliable.

## 6. Definition of done for the next major phase

The phase is accepted only when a controlled test can reconstruct:

**Campaign → Asset → Visitor → Person → Lead → Opportunity → Quote → Negotiation → Accepted Order → Payment → Reconciliation → Confirmed Revenue → Partner Attribution → Commission → Customer Retention → Customer Referral**

and a salesperson can execute that journey from the Aslal workspace without manually reconstructing the transaction across disconnected systems.

The system must clearly distinguish:

**deal value**

from:

**collected revenue**.

No requirement should be marked SATISFIED from code/schema/UI/build evidence alone where behavioral, production, financial, provider, security or privacy evidence is required.

## 7. What should not be prioritized yet

Do not prioritize:

- additional AI autonomy;
- additional acquisition channels;
- sophisticated recommendation systems;
- broad shared SaaS tenancy;
- automated commission payouts;

until the commercial transaction chain is reliable.

The next measurable product milestone is not “more features.” It is:

**one trustworthy customer record + one uninterrupted salesperson journey + one payment-backed revenue chain.**
