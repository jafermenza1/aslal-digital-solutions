# Aslal Growth OS — Main Commercial Engine PRD

**Document:** PRD-COMMERCIAL-ENGINE-001  
**Version:** 1.0  
**Status:** Target-state domain specification / reconciliation and gap-filling authority  
**Date:** 2026-10-02  
**Product:** Aslal Growth OS  
**Organization:** Aslal Digital Solutions  
**Primary market:** Ethiopia, with international/diaspora use where commercially relevant  
**Repository:** `Jafermenza1/aslal-digital-solutions`

---

## 1. Purpose

This document defines the **Main Commercial Engine** of Aslal Growth OS.

It fills a specific gap between the broad Growth OS product definition and the existing reconciliation/domain documents: the repository already has leads, opportunities, products, partners, campaigns, quotes, orders, payments, revenue and commissions, but the target commercial model now needs one explicit contract connecting:

**supply + demand + providers + partners + attribution + physical-world sales + proposals + negotiation + orders + payment evidence + revenue + commission + after-sales.**

This document does not replace:

- `docs/PRD-ASLAL-GROWTH-OS-v1.0.md`;
- `docs/Aslal Growth OS master plan.md`;
- `docs/reconciliation/README.md`;
- `docs/reconciliation/DOMAIN-CONTRACT.md`;
- `docs/reconciliation/TRACEABILITY.md`;
- `docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`;
- `docs/reconciliation/EXECUTION-STATE.md`.

Instead, it **reconciles and fills the commercial gaps** left between those documents.

The Main Commercial Engine is the reusable commercial core. Product categories, industries, channels and business types must plug into this engine rather than create separate transaction systems.

---

# 2. Executive Product Definition

Aslal is not only a catalog, CRM, affiliate system, ecommerce checkout, or marketplace.

The Main Commercial Engine is the operating layer that connects:

> **Someone wants something → someone can provide it → the right people are matched → the opportunity is attributed → the parties communicate/negotiate → the commercial outcome is recorded → payment/revenue is reconciled → commissions are calculated → fulfillment/service is completed → the relationship can continue.**

The engine must support both sides of the market.

### Supply side

A business, supplier, reseller, professional, agent, service provider or asset owner can publish or authorize something commercially available.

### Demand side

A person or organization can:

- browse what is available;
- ask to buy something;
- request a specific asset;
- request a professional service;
- publish an RFP/request for proposals;
- ask for a quote;
- request an inspection;
- initiate a sales conversation.

### Commercial network

Partners can introduce demand, promote listings, register deals, conduct permitted sales activity, earn attributable commissions and receive protected commercial credit where the rules allow it.

### Core principle

**The engine records commercial contribution, not merely clicks.**

A partner should not earn merely because a URL was clicked if the partner did not contribute according to the applicable attribution rule.

Likewise, a business must not lose the ability to sell directly simply because a partner introduced a prospect. Direct negotiation remains allowed; bypassing a protected attributable commercial relationship is handled through evidence, contract rules and dispute controls.

---

# 3. Relationship to Existing Product Documents

## 3.1 Authority hierarchy

For product intent:

1. `docs/PRD-ASLAL-GROWTH-OS-v1.0.md`
2. `docs/Aslal Growth OS master plan.md`
3. This document: Main Commercial Engine detailed domain specification

For implementation truth:

1. `docs/reconciliation/README.md`
2. `docs/reconciliation/EXECUTION-STATE.md`
3. `docs/reconciliation/TRACEABILITY.md`
4. `docs/reconciliation/DOMAIN-CONTRACT.md`
5. Current phase implementation records

For implementation order:

1. `docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md`
2. Current phase gate in `EXECUTION-STATE.md`

This document must not create a competing development sequence.

## 3.2 What this document adds

The existing product documents establish the overall Growth OS.

This document adds detailed definitions for:

- commercial listings;
- controlled supply authorization;
- supplier/owner relationships;
- partner eligibility;
- deal registration;
- attribution protection;
- physical inspection/appointments;
- wanted/demand requests;
- provider/professional profiles;
- service requests and RFPs;
- proposals and proposal comparison;
- commercial agreements;
- direct/off-platform payment evidence;
- commercial leakage controls;
- matching;
- marketplace behavior;
- commercial evidence and dispute reconstruction;
- commercial analytics;
- role-specific self-service.

---

# 4. Commercial Engine Goals

The engine must:

1. Give businesses a simple way to publish things they sell.
2. Give customers a simple way to state what they need.
3. Allow products, assets and services to share one commercial workflow.
4. Preserve lead and partner attribution through the commercial journey.
5. Support high-value physical/B2B sales without requiring platform checkout.
6. Support professional services and RFP-style procurement.
7. Allow partners to contribute without allowing arbitrary commission claims.
8. Protect legitimate partner-originated opportunities against deliberate circumvention.
9. Record physical-world commercial events such as inspections and appointments.
10. Make direct seller/customer communication compatible with attribution.
11. Preserve evidence for disputes and commission decisions.
12. Provide business owners with self-service commercial operations.
13. Keep business/workspace boundaries explicit.
14. Avoid creating separate systems for each industry.
15. Keep the user experience simple despite sophisticated underlying data.

---

# 5. Non-Goals

The first implementation must not assume that Aslal is:

- a universal payment escrow service;
- a bank;
- a legal authority;
- a property registry;
- a medical-device certification authority;
- a government procurement authority;
- a replacement for professional licensing bodies;
- a guaranteed fraud-prevention system;
- a surveillance system;
- a social-media platform.

Aslal may record evidence and workflow state, but it must not claim external verification that it has not actually performed.

---

# 6. Commercial Principles

## 6.1 One commercial core

The same engine must support:

- products;
- services;
- used/new equipment;
- medical equipment;
- laboratory equipment;
- machinery;
- vehicles;
- properties;
- professional services;
- bulk procurement;
- custom work;
- maintenance;
- consulting;
- implementation;
- other commercial assets.

The system should use category-specific fields without duplicating the complete sales engine.

## 6.2 Demand and supply are first-class

The system must not be supply-only.

It must support:

**SELL** — I have something to sell.

**NEED** — I want something.

**OFFER SERVICE** — I can provide a service.

**FIND SERVICE** — I need someone to provide a service.

## 6.3 Attribution is commercial evidence

Attribution must answer:

- Who introduced the opportunity?
- Through what channel?
- For which listing/service?
- When?
- Under what program/contract?
- What commercial activity followed?
- Which events prove the relationship?
- Which commission rule applies?

## 6.4 Physical-world activity belongs in the system

If a digital introduction leads to:

- phone call;
- physical meeting;
- demonstration;
- inspection;
- site visit;
- quotation;
- negotiation;
- offline bank transfer;
- delivery;
- service completion;

the commercial timeline must be able to record those events.

## 6.5 Direct payment is allowed

A seller may receive money outside Aslal when the transaction legitimately requires:

- bank transfer;
- cash;
- external payment provider;
- invoice settlement;
- institutional procurement process.

The commercial record must still be able to capture payment evidence and reconcile the commercial outcome.

Aslal must not pretend that an external payment was processed by Aslal.

---

# 7. Core Commercial Journey

The canonical commercial chain is:

**Visitor / Public Request**
→ **Lead**
→ **Commercial Request or Listing Interest**
→ **Opportunity**
→ **Matching**
→ **Quote / Proposal**
→ **Inspection / Appointment when required**
→ **Negotiation**
→ **Order / Contract**
→ **Payment / Payment Evidence**
→ **Revenue**
→ **Commission**
→ **Fulfillment / Service Completion**
→ **Customer**
→ **Retention / Repeat Business / Referral**

Not every journey uses every step.

For example:

### Simple product

Listing → Lead → Order → Payment → Revenue

### High-value equipment

Listing → Partner referral → Lead → Deal Registration → Inspection → Quote → Negotiation → Order → Bank Transfer Evidence → Revenue → Commission

### Professional service

Service Request → Lead → Provider Match → Proposal → Comparison → Selection → Negotiation → Contract/Order → Payment → Work → Completion → Review

### Buyer request

Wanted Request → Lead → Supplier Matching → Supplier Response → Quote → Negotiation → Order → Payment

---

# 8. Commercial Listing

## 8.1 Definition

A **Commercial Listing** is a controlled public or partner-facing representation of something that a business, supplier, provider or authorized owner can offer.

A listing may represent:

- product;
- service;
- asset;
- property;
- equipment;
- vehicle;
- machinery;
- professional service;
- package;
- bundle;
- bulk offer.

The existing Product/Service catalog remains reusable. A Listing is the commercial publishing and distribution layer around the underlying commercial offering.

## 8.2 Listing lifecycle

Minimum lifecycle:

- DRAFT
- PENDING_REVIEW
- APPROVED
- PUBLISHED
- PAUSED
- SOLD_OUT / UNAVAILABLE
- EXPIRED
- ARCHIVED
- REJECTED

Only authorized users may move a listing into published state.

## 8.3 Listing ownership

Every listing must identify:

- owning workspace/business;
- responsible owner;
- underlying offering/product/service where applicable;
- seller/provider;
- publication actor;
- publication timestamp;
- current status.

A listing must never become ownerless.

## 8.4 Listing distribution

A business can choose:

- Direct Aslal public;
- Partner network;
- Resellers;
- Agents;
- Influencers;
- Private/qualified buyers;
- Marketplace discovery;
- Specific territory/channel.

Distribution rules must be explicit.

---

# 9. Listing Types

## 9.1 Product Listing

For repeatable products with defined commercial attributes.

Examples:

- packaged goods;
- software package;
- standard equipment;
- consumer product.

Fields may include:

- SKU;
- quantity;
- unit;
- price;
- currency;
- stock;
- variants;
- warranty;
- delivery;
- specifications.

## 9.2 Asset Listing

For individual or limited physical assets.

Examples:

- used laboratory equipment;
- machinery;
- vehicle;
- property;
- used medical equipment.

Important fields:

- condition;
- age;
- location;
- quantity;
- manufacturer;
- model;
- serial/reference;
- ownership statement;
- asking price;
- negotiability;
- inspection availability;
- documents;
- warranty status;
- photos;
- attachments.

The platform must not claim legal ownership verification unless actually performed.

## 9.3 Service Listing

For repeatable or packaged services.

Examples:

- equipment maintenance;
- accounting;
- marketing;
- software development;
- training;
- consulting;
- environmental assessment.

Fields may include:

- scope;
- service area;
- target customer;
- starting price;
- pricing model;
- response time;
- delivery duration;
- included work;
- exclusions;
- qualifications;
- documents;
- portfolio;
- availability.

## 9.4 Property Listing

Property is a specialized asset category.

It must support:

- property type;
- sale/rent;
- location;
- approximate/public location;
- size;
- rooms where applicable;
- condition;
- asking price;
- inspection;
- documents;
- owner/provider information.

Sensitive ownership/legal documents must not be publicly exposed.

---

# 10. Supplier / Owner Model

A commercial offering must identify who controls it.

Possible relationships include:

- OWNED;
- SUPPLIED;
- RESELLER_AUTHORIZED;
- IMPLEMENTATION_PARTNER;
- AFFILIATE_PROMOTION;
- SERVICE_PROVIDER;
- CUSTOM.

The existing `ProductRelationship` concept remains useful but must not be treated as sufficient by itself for commercial authorization.

The engine must distinguish:

**catalog relationship** from **active commercial authorization**.

---

# 11. Commercial Authorization

A business may authorize a partner or staff member to distribute a listing.

An authorization should include:

- listing;
- authorized party;
- authorization type;
- effective date;
- expiry date;
- territory;
- channel;
- partner type;
- quantity/stock constraints where applicable;
- commission rule;
- protection period;
- exclusions;
- approval actor;
- status.

Authorization states:

- REQUESTED;
- APPROVED;
- ACTIVE;
- SUSPENDED;
- EXPIRED;
- REVOKED.

Revocation must not silently erase historical attribution.

---

# 12. Partner Eligibility

Partner eligibility must be evaluated using:

- partner status;
- verification state;
- partner type;
- contract status;
- listing eligibility;
- territory;
- channel;
- program status;
- applicable commission terms;
- business restrictions.

A partner must not receive a promotion asset for an unauthorized listing merely because a URL exists.

---

# 13. Deal Registration

## 13.1 Purpose

Deal Registration is the main commercial protection mechanism for partner-originated high-value opportunities.

It converts a claimed introduction into an explicit commercial record.

A partner may submit:

- buyer/person;
- organization;
- listing/service;
- estimated quantity;
- estimated value;
- territory;
- description;
- expected close date;
- evidence/source.

## 13.2 Seller response

The seller/business may:

- APPROVE;
- REJECT;
- REQUEST_INFORMATION;
- DUPLICATE_EXISTING_DEAL.

The system must require a reason for rejection where configured.

## 13.3 Protection

An approved registration may create an attribution protection period.

Example configurable terms:

- 30 days;
- 60 days;
- 90 days;
- 180 days.

The value is a commercial policy, not a hard-coded universal rule.

## 13.4 Duplicate handling

If the customer already exists or another active opportunity exists, the system must show the conflict.

It must not automatically award duplicate commission.

The system should preserve the evidence for human resolution.

---

# 14. Attribution Protection

Attribution protection must record:

- protected party;
- protected opportunity;
- source partner;
- source campaign;
- source asset/link;
- protected listing/service;
- start time;
- expiry time;
- protection basis;
- attribution rule;
- override reason;
- override actor.

Existing Lead attribution lock fields should be reused or extended where appropriate rather than creating duplicate attribution concepts.

Protection does not prohibit direct communication.

It determines commercial credit where the applicable terms require it.

---

# 15. Anti-Bypass / Commercial Leakage Controls

## 15.1 Principle

No software can guarantee that two people will not transact privately.

Aslal therefore uses:

**evidence + contract + attribution + workflow value + audit + dispute controls.**

## 15.2 Required evidence

The commercial timeline should be able to reconstruct:

- original referral;
- lead creation;
- partner;
- campaign;
- listing;
- customer identity;
- communication;
- appointment;
- inspection;
- quote;
- quote revisions;
- negotiation;
- deal registration;
- order;
- payment evidence;
- delivery/service completion;
- commission.

## 15.3 Physical inspection

A physical inspection must be a first-class event when required.

It should record:

- opportunity/listing;
- buyer;
- seller/provider;
- partner;
- scheduled time;
- location;
- attendees;
- check-in status;
- outcome;
- notes;
- attachments;
- next action.

Existing QR/check-in capability may be reused for controlled attendance confirmation.

## 15.4 External sale reporting

If the seller closes outside Aslal, the seller must have an operational way to record:

- external order/reference;
- buyer;
- listing;
- amount;
- currency;
- date;
- payment method;
- evidence;
- attribution source.

The system must distinguish:

**payment processed by Aslal**

from

**payment reported/reconciled as external evidence.**

## 15.5 Leakage signals

The engine may flag patterns such as:

- repeated partner introductions followed by unexplained direct closures;
- repeated inspections with no recorded outcome;
- attribution removed after quotation;
- multiple buyers sharing suspicious commercial identity;
- seller reporting external sale for an active protected opportunity;
- repeated disputes for the same seller/partner relationship.

Signals are not proof.

They should trigger review, not automatic punishment.

## 15.6 Enforcement

Where a contractual rule is breached and evidence supports it, the system may:

- preserve commission payable;
- open a dispute;
- restrict listing distribution;
- suspend partner authorization;
- suspend seller participation in a program;
- require administrator review.

The system must avoid silently invalidating legitimate earnings.

---

# 16. Wanted Request / Demand Engine

## 16.1 Purpose

A public user must be able to say:

> “I am looking for this.”

This is a first-class commercial demand object, not merely a free-text contact form.

## 16.2 Request types

Use one extensible demand concept with typed request categories:

- BUY_REQUEST;
- ASSET_REQUEST;
- SERVICE_REQUEST;
- RFP.

The implementation should avoid creating separate disconnected CRM pipelines for each.

## 16.3 Required fields

A request may include:

- request type;
- category;
- item/service;
- description;
- quantity;
- condition preference;
- required specifications;
- budget minimum/maximum;
- currency;
- location;
- service area;
- deadline;
- organization;
- contact person;
- contact preference;
- attachments;
- privacy visibility;
- source channel;
- campaign;
- partner attribution where applicable.

## 16.4 Public privacy

Public demand pages must not expose private contact information.

Providers respond through Aslal unless the requester explicitly permits direct contact.

The system should show only the information needed to evaluate fit.

## 16.5 Request lifecycle

Minimum:

- DRAFT;
- SUBMITTED;
- QUALIFYING;
- PUBLISHED;
- MATCHING;
- RESPONSES_OPEN;
- NEGOTIATING;
- FULFILLED;
- CANCELLED;
- EXPIRED;
- CLOSED.

---

# 17. Demand-to-Lead Reconciliation

A valid public request must enter the existing CRM chain.

Canonical relationship:

**Commercial Request → Lead → Opportunity**

The request should retain its own identity and structured demand data.

The Lead remains the CRM identity/qualification record.

The Opportunity remains the specific commercial pursuit.

Do not duplicate the request into an unrelated CRM object.

---

# 18. Matching Engine

The matching engine connects demand with supply.

It may consider:

- category;
- product/service type;
- specifications;
- location;
- service area;
- availability;
- price/budget;
- partner authorization;
- provider eligibility;
- territory;
- response time;
- condition;
- quantity;
- business status.

Matching must be explainable.

A provider should be able to understand why a request was presented.

AI may later improve matching, but deterministic rules remain the initial source of truth.

---

# 19. Supplier Response

A supplier/provider responding to a request should be able to submit:

- capability confirmation;
- available quantity;
- price;
- currency;
- delivery time;
- condition;
- service scope;
- validity;
- attachments;
- notes.

A response should create or connect to an Opportunity rather than remaining an isolated message.

---

# 20. Professional Services Engine

Professional services require a different commercial pattern from fixed products.

The engine must support:

**Need → Qualification → Matching → Provider Response → Proposal → Comparison → Selection → Negotiation → Contract/Order → Payment → Work → Completion → Review**

---

# 21. Professional Profile

A professional/service provider profile may contain:

- individual or business name;
- profession;
- specialties;
- service categories;
- sectors served;
- qualifications;
- certifications;
- experience;
- languages;
- service areas;
- availability;
- pricing model;
- starting price;
- response time;
- portfolio;
- references;
- verification status.

The platform must never imply that a credential has been verified unless the evidence has been reviewed and recorded.

---

# 22. Provider Verification

Suggested verification levels:

1. UNVERIFIED
2. IDENTITY_VERIFIED
3. BUSINESS_VERIFIED
4. DOCUMENTS_REVIEWED
5. AUTHORIZED_PROVIDER

Verification must have:

- evidence;
- reviewer;
- timestamp;
- status;
- expiry where relevant.

Verification must be revocable and auditable.

---

# 23. Service Request

A service request must capture:

- service needed;
- problem/goal;
- location;
- required date;
- budget;
- scope;
- qualifications;
- documents;
- preferred provider characteristics;
- response deadline;
- contact preference.

Examples:

- medical equipment maintenance;
- laboratory assessment;
- business-plan development;
- accounting;
- environmental assessment;
- software development;
- training;
- installation.

---

# 24. RFP / Proposal

For complex services or high-value procurement, the requester may issue an RFP.

Providers can respond with proposals containing:

- scope;
- methodology;
- deliverables;
- timeline;
- assumptions;
- exclusions;
- price;
- taxes/fees where applicable;
- validity;
- team;
- qualifications;
- attachments.

The requester must be able to compare proposals without losing the original versions.

---

# 25. Proposal Versioning

Every material proposal change must create a new version.

A version must preserve:

- provider;
- request;
- scope;
- amount;
- currency;
- terms;
- validity;
- timestamp;
- actor;
- superseded version.

No accepted proposal may be silently edited.

---

# 26. Quote and Negotiation Integration

The existing Quote/QuoteItem and NegotiationEvent concepts remain the canonical commercial negotiation layer.

The Main Commercial Engine does not replace them.

Instead:

- listing interest may create an opportunity;
- opportunity may produce a quote;
- service request may produce a proposal;
- accepted proposal/quote may create an order;
- revisions remain reconstructable.

---

# 27. Order Integration

The existing Order/OrderItem domain remains the commitment record.

The engine must ensure that orders can retain:

- workspace;
- seller/provider;
- customer;
- listing/product/service;
- opportunity;
- quote/proposal;
- partner;
- campaign;
- referral;
- source;
- commercial amount;
- currency;
- order state.

Order state must remain distinct from payment state.

---

# 28. Payment and External Payment Evidence

## 28.1 Internal payment

Where supported, Aslal may record a provider-backed payment.

The existing Payment lifecycle remains authoritative.

## 28.2 External payment

For bank transfer, cash, institutional procurement or external gateways, the system may record:

**Payment Evidence**

including:

- amount;
- currency;
- date;
- payer;
- recipient;
- external reference;
- payment method;
- evidence attachment;
- recorded by;
- verification status;
- verification actor;
- verification timestamp.

External payment evidence must not be represented as provider-confirmed payment until verified.

---

# 29. Revenue

Revenue is created only according to defined accounting/business rules.

The engine must distinguish:

- quoted value;
- order value;
- payment received;
- recognized revenue;
- commissionable revenue;
- refunded/reversed revenue.

A pipeline amount is never presented as realized revenue.

---

# 30. Commission Engine

Commission is calculated from an attributable commercial outcome and an active rule.

Rules may include:

- fixed per lead;
- fixed per appointment;
- fixed per inspection;
- fixed per sale;
- percentage of sale;
- margin share;
- hybrid;
- per qualified opportunity.

The applicable rule must be identifiable after the transaction.

---

# 31. Commission Contract

The existing `CommissionContract` concept should remain the primary contract record.

A contract may define:

- partner;
- supplier/business;
- listing/product/service;
- program;
- commission model;
- rate/amount;
- qualifying event;
- attribution method;
- attribution window;
- protection period;
- territory;
- exclusions;
- refund treatment;
- payment basis;
- effective dates;
- acceptance/terms version.

Do not create a second competing commission contract model.

---

# 32. Commission Qualification

A commission must pass through controlled states.

At minimum:

**PENDING → QUALIFIED → APPROVED → PAYABLE → PAID**

Exceptional state:

**VOID**

A commission must not become payable merely because a click or lead exists if the contract requires a sale or payment.

---

# 33. Disputes

Commercial disputes must preserve both sides' evidence.

A dispute may concern:

- attribution;
- duplicate lead;
- duplicate customer;
- deal registration;
- commission rate;
- refund;
- payment evidence;
- order value;
- partner contribution;
- seller bypass/circumvention;
- provider performance.

The system must support:

- opened by;
- reason;
- evidence;
- disputed amount;
- affected entities;
- status;
- resolution;
- resolver;
- timestamp;
- audit trail.

Dispute resolution must not destroy the original evidence.

---

# 34. Customer and Partner Separation

A customer is not automatically a partner.

A partner is not automatically a customer.

A professional may be:

- provider only;
- partner only;
- customer only;
- both provider and partner;
- both customer and partner.

The identity model must support these roles without duplicating the underlying person/business identity.

---

# 35. Business Owner Self-Service

A business owner must be able to manage the commercial side without administrator intervention for ordinary operations.

Minimum owner workspace:

### Business

- profile;
- locations;
- staff;
- permissions;
- business settings.

### Catalog & Listings

- products;
- services;
- assets;
- equipment;
- properties;
- offers;
- availability;
- listing status.

### Demand

- incoming leads;
- wanted requests;
- service requests;
- RFPs.

### Sales

- opportunities;
- inspections;
- quotes;
- proposals;
- negotiations;
- orders;
- payment evidence.

### Partners

- partner applications;
- authorizations;
- deal registrations;
- commission terms;
- disputes.

### Analytics

- demand;
- source;
- partner;
- listing;
- opportunity;
- order;
- revenue;
- commission;
- conversion.

---

# 36. Staff Delegation

Owners should be able to delegate defined capabilities.

Examples:

### Marketing Manager

- listings;
- campaigns;
- campaign assets;
- public publishing;
- partner promotion assets.

### Sales Manager

- leads;
- opportunities;
- inspections;
- quotes;
- negotiation;
- order preparation.

### Salesperson

- assigned leads;
- customer conversations;
- activities;
- appointments;
- quotes within permission.

### Catalog Manager

- products;
- services;
- listings;
- specifications;
- availability.

### Finance

- payment verification;
- reconciliation;
- revenue;
- commissions;
- payouts.

### Partner Manager

- partner relationships;
- eligibility;
- authorizations;
- deal registrations;
- partner disputes.

Authorization must be enforced server-side, not only through hidden UI controls.

---

# 37. Partner Self-Service

A partner should be able to:

- complete profile;
- see eligible listings/programs;
- request authorization;
- receive promotion assets;
- generate attribution links;
- register deals;
- submit leads;
- request inspections;
- see protected opportunities;
- see quotes/orders where authorized;
- see commission status;
- submit disputes;
- see payout history.

The partner must not see unrelated business/customer data.

---

# 38. Professional Self-Service

A professional provider should be able to:

- create/update professional profile;
- publish services;
- manage service areas;
- upload qualifications;
- respond to requests;
- create proposals;
- manage customers;
- track active work;
- record completion;
- issue invoices/payment requests where supported;
- view revenue;
- view repeat business;
- receive reviews subject to policy.

---

# 39. Marketplace

The marketplace is a discovery surface over the commercial engine.

It must not become a second transaction system.

Marketplace functions:

- search;
- category;
- filters;
- location;
- price/budget;
- condition;
- service area;
- provider verification;
- availability;
- listing details;
- request quote;
- request inspection;
- contact;
- wanted requests;
- provider responses.

The marketplace must hand commercial activity into the same Lead → Opportunity → Quote/Proposal → Order → Payment → Revenue chain.

---

# 40. Public Entry Points

The public experience should make four actions obvious:

### SELL

“List something to sell.”

### NEED

“Tell us what you are looking for.”

### OFFER SERVICE

“Offer your professional service.”

### FIND SERVICE

“Find someone who can help.”

These entry points should create structured records and not merely send email.

---

# 41. Social Commerce Integration

The engine must support customers arriving from:

- TikTok;
- Telegram;
- Facebook;
- Instagram;
- WhatsApp;
- Messenger;
- website;
- QR codes;
- physical marketing;
- partner links;
- direct referrals.

Social traffic must enter the same commercial attribution model.

A Telegram conversation, for example, should be capable of becoming a Lead/Opportunity without creating a disconnected Telegram-only sales pipeline.

---

# 42. QR and Physical Commerce

QR codes may represent:

- listing;
- product;
- campaign asset;
- partner attribution;
- event;
- inspection appointment;
- printable ticket;
- coupon;
- redemption token.

QR interactions must be attributable and auditable.

Existing partner sales asset/redemption work should be reused rather than creating another QR subsystem.

---

# 43. Tickets, Coupons and Redeemable Commercial Assets

The commercial engine may support partner-distributed:

- printable tickets;
- coupons;
- vouchers;
- attendance passes;
- redemption codes;
- promotional offers.

These are not separate commercial systems.

They are **commercial assets/offers** with:

- issuer;
- campaign;
- partner;
- recipient;
- code/QR;
- validity;
- redemption rules;
- redemption status;
- attribution;
- audit history.

The existing redemption/attendance implementation should be reconciled into this model.

---

# 44. Evidence Timeline

Every commercial journey should have a reconstructable timeline.

Example:

1. Partner link clicked.
2. Buyer submitted request.
3. Lead created.
4. Deal registered.
5. Seller approved.
6. Appointment requested.
7. Inspection attended.
8. Quote issued.
9. Quote revised.
10. Customer accepted.
11. Order created.
12. External bank transfer reported.
13. Finance verified payment evidence.
14. Revenue recognized.
15. Commission qualified.
16. Commission approved.
17. Payout recorded.
18. Delivery/service completed.
19. Customer follow-up scheduled.

The exact events vary by journey.

---

# 45. Audit Requirements

Audit records are mandatory for:

- attribution changes;
- deal registration decisions;
- listing authorization;
- commission rule changes;
- commission overrides;
- payment verification;
- revenue correction;
- dispute decisions;
- provider verification;
- listing publication/rejection;
- order cancellation;
- refund;
- partner suspension.

The original actor and timestamp must remain available.

---

# 46. Workspace and Tenant Isolation

Every commercial record must have an explicit workspace/business relationship where applicable.

Cross-business data access must be determined by authorization, not by arbitrary user identity or partner ownership.

A network-level partner identity may span businesses, but:

- partner-business relationship;
- listing authorization;
- commission contract;
- customer access;
- opportunity access;

remain business-scoped.

Public routing must resolve the correct business/workspace before exposing commercial data.

---

# 47. Privacy

Public pages must not expose:

- private phone numbers;
- private email addresses;
- internal notes;
- payment evidence;
- commission amounts;
- protected buyer identity;
- private business documents.

Public demand should be generalized until the requester chooses an authorized provider relationship.

---

# 48. Security

All commercial mutations require:

- authentication where appropriate;
- authorization;
- input validation;
- workspace checks;
- audit where financially/operationally significant.

Public submissions require:

- validation;
- abuse controls;
- rate limiting;
- spam protection;
- consent handling;
- safe attachment handling.

---

# 49. Idempotency

The commercial engine must prevent duplicate processing for:

- webhooks;
- payments;
- order conversion;
- commission creation;
- coupon redemption;
- ticket redemption;
- request submission retries;
- partner attribution events.

External event IDs and internal idempotency keys should be used where appropriate.

---

# 50. Failure Handling

Failure must not destroy the commercial record.

Examples:

- email failure does not delete lead;
- payment-provider failure does not delete order;
- duplicate webhook does not create duplicate payment;
- provider API outage does not erase listing;
- failed payout does not erase commission;
- failed QR sync does not silently duplicate redemption.

Retry state must be explicit.

---

# 51. Reporting

The commercial engine must provide reports for:

### Business owner

- listings;
- demand;
- leads;
- opportunities;
- quotes;
- orders;
- payment status;
- revenue;
- partner contribution;
- commissions;
- disputes.

### Sales

- open opportunities;
- inspections;
- pending quotes;
- overdue follow-up;
- expected value;
- won/lost outcomes.

### Partner manager

- active partners;
- authorized listings;
- deal registrations;
- partner-originated opportunities;
- conversion;
- attributable revenue;
- commission.

### Finance

- payment verification;
- recognized revenue;
- commission payable;
- payout status;
- refunds/reversals.

### Provider

- requests;
- proposals;
- accepted work;
- active jobs;
- completed jobs;
- revenue;
- repeat customers.

---

# 52. Commercial Metrics

Core metrics:

- listings published;
- requests submitted;
- qualified demand;
- supply-demand matches;
- provider response rate;
- quote rate;
- proposal response rate;
- inspection rate;
- opportunity conversion;
- order conversion;
- paid conversion;
- recognized revenue;
- partner-attributed revenue;
- commission liability;
- commission paid;
- dispute rate;
- cancellation/refund rate;
- repeat customer rate.

Metrics must clearly identify their population, period and attribution method.

---

# 53. Acceptance Rules

The Main Commercial Engine is not accepted because database models exist.

A commercial capability becomes accepted only when:

1. intended actor can perform the workflow;
2. authorization is enforced;
3. data is persisted correctly;
4. relationships are correct;
5. attribution is preserved;
6. failure states are handled;
7. duplicate processing is prevented;
8. audit evidence exists where required;
9. reporting reflects the underlying records;
10. production behavior is verified where the reconciliation gate requires it.

---

# 54. Core Acceptance Scenarios

## Scenario A — Business lists a product

Owner creates product → creates listing → chooses distribution → publishes → public page works → buyer submits inquiry → Lead created → Opportunity created.

## Scenario B — Partner sells a high-value asset

Partner sees authorized listing → registers buyer/deal → seller approves → inspection scheduled → inspection attended → quote created → negotiation recorded → order created → external payment evidence verified → revenue recognized → commission calculated.

## Scenario C — Buyer publishes a wanted request

Buyer submits “I need 2 laboratory analyzers” → demand is qualified → Lead created → matching finds eligible suppliers → suppliers respond → quotes/proposals created → buyer compares → selects supplier → order/payment flow begins.

## Scenario D — Professional service RFP

Organization requests equipment maintenance → providers matched → qualified providers respond → proposals submitted → requester compares → proposal accepted → order/contract created → work scheduled → completion recorded → payment/revenue → review.

## Scenario E — Seller attempts to close externally

Partner-originated protected opportunity exists → seller records direct negotiation → external sale is reported → evidence is attached → commission eligibility is evaluated under contract → dispute is available if parties disagree.

## Scenario F — Duplicate webhook

Same payment/webhook delivered twice → first event creates/updates payment → second event is recognized as duplicate → no duplicate payment/order/revenue/commission.

## Scenario G — Unauthorized partner

Partner without authorization attempts to promote restricted listing → promotion/asset generation is denied → no unauthorized attribution is created.

## Scenario H — Privacy

Public buyer request → private contact information remains hidden → provider responds through controlled workflow → contact details become available only according to consent and authorization.

---

# 55. Implementation Reconciliation

The Main Commercial Engine should **extend existing domains before creating new competing domains**.

Prefer:

- existing Product/Service catalog;
- existing Partner;
- existing Lead;
- existing Opportunity;
- existing Quote/QuoteItem;
- existing NegotiationEvent;
- existing Order/OrderItem;
- existing Payment;
- existing Revenue;
- existing CommissionContract;
- existing Commission;
- existing Referral/attribution;
- existing Campaign/CampaignAsset;
- existing Resource/ResourceRequest where its semantics remain valid;
- existing QR/redemption/attendance implementation.

New domain entities are justified where the existing model cannot express a distinct business concept without ambiguity.

Likely new or explicitly extended concepts include:

- CommercialListing;
- ListingAuthorization;
- DealRegistration;
- InspectionAppointment;
- CommercialRequest / DemandRequest;
- RequestMatch;
- ProviderProfile;
- ProviderVerification;
- RequestProposal / Proposal response;
- PaymentEvidence;
- CommercialAgreement where existing contracts cannot express the required terms.

The exact Prisma schema must be determined after code inspection and must avoid duplicating existing concepts.

---

# 56. Reconciliation With Existing ResourceRequest

The existing Resource/ResourceRequest domain must be reviewed before implementing public demand.

If ResourceRequest can be safely generalized without breaking existing resource workflows, it should be extended.

If its semantics are materially different, introduce CommercialRequest and provide an explicit migration/relationship strategy.

Do not create two unrelated “request” concepts that both represent customer demand.

---

# 57. Reconciliation With Existing Partner Commerce

Existing partner commerce already provides:

- partner identity;
- referral links;
- campaigns;
- campaign assets;
- commission contracts;
- commissions;
- payouts;
- product relationships;
- sales assets;
- redemption.

The Main Commercial Engine adds the missing commercial control layer:

**authorization → eligibility → deal registration → protected attribution → physical inspection → external sale evidence → dispute reconstruction.**

It must not replace the existing partner domain.

---

# 58. Reconciliation With Existing Product Catalog

The existing Product model remains the canonical reusable catalog offering.

The engine adds a commercial listing layer when the offering needs:

- public/partner publication state;
- distribution control;
- territory;
- condition;
- inspection;
- marketplace visibility;
- partner authorization;
- deal registration;
- protection;
- commercial terms.

This avoids turning Product into an overloaded marketplace object.

---

# 59. Reconciliation With Existing Quote/Order/Payment

The engine does not create replacement quote, order or payment systems.

It provides the upstream commercial context needed by those systems.

The relationship should remain:

**Listing/Request → Lead → Opportunity → Quote/Proposal → Order → Payment → Revenue → Commission**

---

# 60. Reconciliation With Existing QR/Redemption Work

The existing QR reader, attendance/check-in, RSVP and redemption functionality becomes a reusable commercial-asset capability.

It may support:

- ticket;
- coupon;
- voucher;
- event attendance;
- partner promotion;
- inspection attendance;
- campaign redemption.

The current offline-sync implementation must preserve the same business rules as online redemption, including RSVP restrictions where applicable.

---

# 61. Reconciliation With Existing Roadmap

This document does not reorder the canonical roadmap.

It supplies the missing detailed commercial specification required to execute the existing commercial direction.

Implementation should be decomposed into controlled increments and placed into the owning roadmap phase.

The roadmap remains the only source for the actual next implementation action.

---

# 62. Suggested Commercial Engine Increments

These are **domain increments, not a replacement roadmap**.

### CE-1 — Listing Foundation

**Current implementation state: IMPLEMENTED — VERIFICATION PENDING.**

Implemented on PR #99: `CommercialListing`, lifecycle/type enums, checked-in migration, workspace-scoped owner API/UI, optional linkage to the existing Product/Service catalog, standalone asset/property listing support, and public marketplace/listing detail surfaces. This does not yet grant partner authorization or commission entitlement.

CommercialListing, lifecycle, ownership, publishing and public detail.

### CE-2 — Owner/Supplier Authorization

**Implementation state: IMPLEMENTED — VERIFICATION PENDING**

CE-2 adds the commercial party registry, explicit listing owner/supplier references, publication ownership guard, and workspace-scoped distribution authorizations for staff users, partners and commercial parties. Authorization lifecycle and scope fields are recorded without creating commission entitlement or partner eligibility automatically.

Listing authorization, staff ownership and distribution controls.

### CE-3 — Partner Eligibility

**IMPLEMENTED — VERIFICATION PENDING**

Listing/program eligibility by partner, contract, territory and channel.

### CE-4 — Deal Registration

**IMPLEMENTED — VERIFICATION PENDING**

Registration, approval/rejection, duplicate detection and protection period.

Implemented on the commercial-engine workstream:
- first-class CommercialDealRegistration linked to existing listing, partner, authorization, Lead and optional Opportunity records;
- workspace-scoped registration creation and review APIs;
- eligibility re-check before registration and again before approval;
- duplicate/conflict detection across active registrations for the same listing and buyer/lead;
- explicit REQUESTED -> PROTECTED / REJECTED, PROTECTED -> CONVERTED / DISPUTED and expiry/dispute lifecycle controls;
- configurable protection period from partner authorization with a 90-day fallback;
- approval writes an auditable protection window and updates the existing Lead attribution lock rather than creating a parallel attribution system;
- existing active attribution locks for another partner cannot be silently overwritten;
- dashboard workbench for registration and approval/rejection;
- registration evidence records actor/time/protection context.

CE-4 does not calculate commission, convert an external payment into revenue, or prove that an off-platform sale occurred. Those remain later commercial gates.

### CE-5 — Inspection & Appointment

Inspection scheduling, QR/check-in, outcomes and commercial timeline.

### CE-6 — Demand / Wanted Requests

BUY_REQUEST, ASSET_REQUEST, SERVICE_REQUEST and RFP intake.

### CE-7 — Matching

Supply-demand matching and provider responses.

### CE-8 — Professional Profiles

Provider/service profile and verification.

### CE-9 — RFP / Proposal

Provider proposals, versioning and comparison.

### CE-10 — Commercial Agreements

Protection, commission, territory, payment basis and attribution terms.

### CE-11 — External Payment Evidence

Bank/cash/external settlement evidence and finance verification.

### CE-12 — Leakage / Dispute Controls

Evidence-driven commercial leakage review and dispute resolution.

### CE-13 — Commercial Analytics

Supply, demand, conversion, attribution, revenue and commission reporting.

These increments must be assigned to the canonical roadmap rather than executed as an independent roadmap.

---

# 63. Migration Principles

Schema changes must:

- preserve existing product records;
- preserve partner identity;
- preserve attribution;
- preserve commissions;
- preserve orders/payments;
- avoid destructive renames where a compatibility path is possible;
- use Prisma migrations;
- provide rollback/forward-recovery reasoning;
- avoid fabricating historical commercial facts.

Existing data must not be retroactively assigned invented supplier, partner, inspection, deal-registration or payment-evidence facts.

---

# 64. API Principles

APIs should be organized around business operations.

Examples:

- create listing;
- publish listing;
- authorize partner;
- register deal;
- approve deal;
- schedule inspection;
- submit demand request;
- match request;
- respond to request;
- submit proposal;
- accept proposal;
- create quote;
- convert accepted quote to order;
- submit payment evidence;
- verify payment evidence;
- calculate commission;
- open dispute;
- resolve dispute.

APIs must enforce workspace and role authorization.

---

# 65. UI Principles

The engine should hide unnecessary complexity.

A business owner should see:

**What are you selling?**

**Who can sell it?**

**Where can it be sold?**

**How will customers contact you?**

**What happens after a customer is interested?**

A buyer should see:

**What do you need?**

**Who can supply it?**

**What are the offers?**

**Which proposal did you select?**

A partner should see:

**What can I promote?**

**Which customers/opportunities are mine?**

**What action should I take next?**

**What commission is protected/qualified/payable?**

A finance operator should see:

**What was paid?**

**What is verified?**

**What revenue is recognized?**

**What commission is owed?**

---

# 66. Low-Bandwidth / Ethiopia-First Requirements

The engine must work well for mobile-first Ethiopian commercial workflows.

Important considerations:

- small payloads;
- responsive forms;
- phone-number normalization;
- ETB support;
- bank-transfer evidence;
- Telegram/social entry points;
- printable QR/ticket/coupon assets;
- offline/manual capture where justified;
- clear English/Amharic/Afaan Oromoo terminology where supported;
- no requirement for continuous high-bandwidth connectivity for field operations.

---

# 67. Commercial Trust Model

Trust should be represented through evidence, not decorative badges.

Potential signals:

- business profile completeness;
- provider verification level;
- completed transactions;
- completed services;
- response rate;
- cancellation rate;
- dispute history;
- customer-confirmed completion;
- verified payment history.

A trust indicator must explain its basis.

---

# 68. Business Value to Aslal

The Main Commercial Engine strengthens Aslal because it moves the product beyond:

- “marketing leads”;
- “affiliate links”;
- “product catalog”;
- “CRM records”.

It creates a reusable commercial network where Aslal can connect:

**demand + supply + partners + providers + businesses + sales evidence + revenue.**

This creates value for:

### Businesses

More structured demand, better sales control, partner distribution and commercial reporting.

### Customers

A way to find products/services or state what they need.

### Partners

Clear attribution, authorized offers and evidence-backed commissions.

### Professionals

A way to publish expertise and receive qualified service opportunities.

### Suppliers

A controlled channel for inventory/assets/services without requiring Aslal to own the inventory.

### Aslal

A network-level commercial operating layer whose value increases as legitimate supply, demand, partners and transaction evidence become connected.

---

# 69. What This Engine Must Not Do

It must not:

- guarantee that sellers cannot transact privately;
- fabricate verification;
- expose buyer contact data publicly;
- create commission from clicks alone when the contract requires a sale;
- allow unauthorized partner promotion;
- treat every public request as a qualified opportunity;
- treat pipeline value as revenue;
- treat reported external payment as verified payment;
- silently erase attribution;
- silently invalidate partner earnings;
- create separate CRM/order/payment systems for every category;
- let AI decide financial attribution without deterministic rules and human controls.

---

# 70. Final System Model

The Main Commercial Engine is the bridge between the Growth OS acquisition layer and the realized commercial outcome.

Its canonical model is:

**DISCOVER / REQUEST**
→ **CAPTURE**
→ **QUALIFY**
→ **MATCH**
→ **AUTHORIZE**
→ **REGISTER**
→ **INSPECT / COMMUNICATE**
→ **QUOTE / PROPOSE**
→ **NEGOTIATE**
→ **ORDER**
→ **PAY / VERIFY**
→ **RECOGNIZE REVENUE**
→ **CALCULATE COMMISSION**
→ **FULFILL**
→ **CONFIRM**
→ **RETAIN / REFER**

The system must support both:

**Supply-led commerce**

and

**Demand-led commerce.**

It must support both:

**digital transactions**

and

**physical/off-platform transactions with verifiable evidence.**

It must support both:

**products/assets**

and

**professional services.**

The commercial engine therefore becomes the shared transaction spine of Aslal Growth OS.

---

# 71. Definition of Commercial Completeness

The Main Commercial Engine is commercially complete only when Aslal can demonstrate, using real controlled workflows and evidence, that:

1. a business can publish an authorized offering;
2. a customer can discover or request something;
3. demand becomes a legitimate Lead;
4. the Lead can become an Opportunity;
5. a partner can legitimately contribute and receive protected attribution;
6. a physical inspection can be recorded when needed;
7. a quote/proposal can be issued and revised;
8. an order can be committed;
9. internal or external payment can be represented honestly;
10. revenue can be reconciled;
11. commission can be calculated from the applicable terms;
12. disputes can reconstruct the evidence;
13. fulfillment/service completion can be recorded;
14. the customer relationship can continue;
15. the business owner, sales operator, partner, provider and finance roles can each perform their permitted work;
16. workspace isolation and authorization are preserved;
17. duplicate events do not create duplicate commercial outcomes;
18. reports reconcile to the underlying commercial records.

Only then should the Main Commercial Engine be described as commercially complete.

---

# 72. Document Reconciliation Rule

When an older document describes only:

**Product → Lead → Partner → Commission**

the intended interpretation is now expanded to:

**Listing/Request → Lead → Opportunity → Quote/Proposal → Negotiation → Order → Payment/Payment Evidence → Revenue → Commission → Fulfillment/Service → Retention**

When an older document refers only to a “partner referral,” it should be interpreted together with:

- partner eligibility;
- deal registration;
- attribution protection;
- inspection evidence;
- commercial agreement;
- dispute controls.

When an older document refers to “products,” it may include the broader commercial offering categories defined here, while preserving the existing Product model where appropriate.

When an older document refers to “customer requests,” the implementation must determine whether the request is:

- a lead;
- a wanted request;
- a service request;
- an RFP;
- a quote request;

and preserve the correct relationship rather than flattening all demand into free text.

This reconciliation prevents historical documents from being interpreted as competing product architectures.

---

# 73. Engineering Directive

Future commercial implementation must begin by:

1. reading this document;
2. checking the existing Prisma/domain model;
3. identifying reusable entities;
4. identifying the exact gap;
5. mapping the gap to existing R-IDs or adding new traceability IDs;
6. checking the current roadmap/phase gate;
7. implementing the smallest coherent increment;
8. preserving existing data;
9. adding authorization and audit behavior;
10. adding acceptance scenarios;
11. updating reconciliation evidence.

**Do not create a new commercial subsystem when the existing Growth OS domain can be extended safely.**

**Do not extend an existing entity when doing so would collapse two materially different business concepts.**

The correct architecture is determined by the business relationship, not by convenience of the current database schema.

---

## 74. Summary

The Main Commercial Engine turns Aslal from a collection of acquisition, CRM, catalog, partner and payment capabilities into one coherent commercial operating model.

Its central promise is:

> **If someone wants something, Aslal can help structure the demand. If someone can supply it, Aslal can structure the offer. If a partner contributes, Aslal can preserve the evidence. If the parties negotiate in the physical world, Aslal can record the commercial journey. If money changes hands outside the platform, Aslal can represent that honestly. If the transaction succeeds, Aslal can connect revenue and commission.**

That is the commercial spine that the rest of Aslal Growth OS operates around.
