# PCCE-1 — Public Commerce & Conversation Experience Contract

**Status:** Implemented and contract-checked on mainline  
**Increment:** PCCE-1  
**Scope:** Public terminology, intent taxonomy, CTA semantics and channel boundaries  
**Source of truth:** `lib/i18n.ts`

## 1. Purpose

PCCE-1 establishes the vocabulary that the public experience uses before screen-by-screen redesign begins.

The public user should understand the next action without knowing internal Growth OS entities.

## 2. Public intent taxonomy

| Intent | Meaning | Primary next step |
|---|---|---|
| Get more customers | Demand generation, marketing and growth support | Explore solution / tell us what is needed |
| Sell online | Product/service commerce and digital selling | Browse products or request a commerce solution |
| Automate conversations | Telegram/WhatsApp/email/customer conversation workflows | Experience automation / talk to specialist |
| Build a digital system | Website, software, CRM, commerce or integrated system | Tell us what is needed / start a project |

## 3. Public vocabulary

| Internal concept | Public vocabulary |
|---|---|
| CommercialRequest | Demand / what you need |
| CommercialMatch | Matching / recommended solutions |
| CommercialEligibility | Eligibility / whether an offer can proceed |
| CommercialDealRegistration | Deal / protected commercial opportunity where relevant |
| CommercialAgreement | Agreement |
| CommercialDistributionItem | Sales asset / shareable asset |
| PartnerSalesAssetAllocation | Partner sales asset |
| IssuedSalesAsset | Issued ticket, coupon, QR or sales asset |
| Lead | Usually hidden; use enquiry, request or conversation context publicly |
| Opportunity | Usually hidden; use sales conversation or next step publicly |
| Person/Customer | Customer |
| Conversation | Conversation / chat |
| Quote | Quote / proposal depending on the customer context |
| Order | Order |
| Payment | Payment |
| Commission | Earnings for partners |

## 4. CTA semantics

- Product → **Order**
- Service → **Request a service**
- Custom requirement → **Tell us what you need**
- Uncertain visitor → **Find a solution**
- Human assistance → **Talk to a specialist**
- Product discovery → **Browse products**
- Service discovery → **Explore services**
- Telegram continuation → **Talk to us on Telegram**

## 5. Channel contract

### Public website
Discovery, education, trust, catalog and demand capture.

### Growth Builder
Guided qualification. It creates or updates canonical Person, Lead and CommercialRequest records; it is not a second intake database.

### Telegram
Conversational commerce, ordering/request continuation, status and human handoff.

### Email
Persistent/formal lifecycle communication, documents, confirmations and operational notices.

### WhatsApp
Direct conversation and human handoff where enabled.

### Partner links/assets
Attributable acquisition and sharing.

### Dashboard
Internal execution, authorization and reporting.

### Partner Portal
Partner self-service, sharing, attribution and earnings.

## 6. Non-duplication rules

PCCE must not create a parallel:

- customer/person ledger;
- lead ledger;
- demand/request ledger;
- conversation ledger;
- order ledger;
- payment ledger;
- attribution ledger;
- commission ledger.

Experience components must call existing domain services and canonical records.

## 7. Attribution rule

Where a visitor arrives through an approved partner or campaign source, the source must survive the channel transition whenever technically possible:

**source → visitor → demand → opportunity → order → payment → revenue → commission**

A partner must not receive credit merely because their link was present if the platform's contribution/attribution rules do not support that claim.

## 8. Implementation requirement

PCCE-2 and later increments must use the terminology in this contract. If a screen needs an internal term for operational accuracy, it should be explained in plain language rather than exposed as the primary customer-facing label.

## 9. Acceptance

PCCE-1 is accepted when:

- the public intent taxonomy is defined;
- the public/internal terminology boundary is documented;
- CTA semantics are defined;
- channel responsibilities are defined;
- all supported public locales have the core commerce vocabulary;
- the dictionary remains type-safe through the existing `as const` locale structure;
- later PCCE increments can consume the same keys without introducing competing terminology;
- `npm run pcce-1:check` verifies the required vocabulary exists for `en`, `am`, `ar` and `om`.
