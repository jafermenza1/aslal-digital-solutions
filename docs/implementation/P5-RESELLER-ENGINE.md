# P5 — Reseller Engine

## Purpose

P5 makes reseller commerce a distinct commercial model rather than treating a reseller as an affiliate with a different label.

The universal Partner record remains the identity and authentication anchor. A reseller receives a separate `resellers` entity containing business, approval, pricing and credit information. This prevents reseller-only fields from contaminating affiliate and referral-agent records.

## Partner identity

Every partner has:
- an internal UUID database identifier;
- a system-generated human-facing `partnerNumber`;
- a partner type;
- a registration source.

New human-facing identifiers use type-specific prefixes:
- Agent: `ASL-AG-YYYY-XXXXXXXX`
- Affiliate: `ASL-AF-YYYY-XXXXXXXX`
- Influencer: `ASL-IN-YYYY-XXXXXXXX`
- Reseller: `ASL-RS-YYYY-XXXXXXXX`

The same generator is used for self-service and internally-created partners. Existing identifiers are never rewritten.

Registration source is recorded as `SELF_SERVICE` or `INTERNAL` so reporting can distinguish how the identity entered the platform.

## Separate reseller entity

`resellers` is one-to-one with `partners`.

It contains:
- business name and registration/tax identifiers;
- business type and address;
- approval status;
- pricing mode;
- default currency;
- credit limit;
- approval actor/date.

Only a Partner with type `RESELLER` may have an active Reseller record.

## Reseller offers

A reseller offer belongs to one reseller and may reference a Product and Campaign. It stores:
- list price;
- reseller price;
- quantity constraints;
- validity window;
- currency;
- terms snapshot.

The reseller's commercial advantage is represented by the difference between list amount and reseller amount. This is not silently converted into an affiliate commission.

## Reseller order trace

`reseller_orders` provides a separate commercial trace from the ordinary Partner attribution chain:
Reseller → Reseller Offer → Customer Order → Reseller Order → Margin.

The order remains the business's authoritative sale record. The reseller trace records the reseller-specific commercial terms that applied to that order.

## Registration

### Self-service
A self-registered AGENT/AFFILIATE/INFLUENCER/RESELLER receives a system-generated type-specific ID. Reseller self-registration additionally creates the separate reseller entity in PENDING status.

### Internal
The admin partner-creation path uses the same system generator and records INTERNAL registration source. Creating a RESELLER also creates its reseller entity.

## Boundaries

- Affiliate: attribution through referral link/campaign terms.
- Referral Agent: accepted deal registration plus verified work.
- Reseller: explicit reseller offer/pricing and reseller order trace.
- Influencer: referral/content attribution unless a program explicitly provides another commercial rule.
- A reseller does not receive affiliate commission merely because it has a referral link.
- An affiliate/agent does not receive reseller pricing merely because its Partner type is changed.

## Acceptance tests

1. Self-register AGENT → `ASL-AG-...`, no reseller row.
2. Self-register AFFILIATE → `ASL-AF-...`, no reseller row.
3. Self-register RESELLER → `ASL-RS-...` plus exactly one PENDING reseller row.
4. Internal AGENT → type-specific ID and INTERNAL source.
5. Internal RESELLER → type-specific ID plus reseller row.
6. Reseller offer cannot be read through another workspace.
7. Inactive/unapproved reseller cannot create reseller commerce.
8. Reseller price is never used without an explicit reseller offer.
9. Order trace preserves list price, reseller price and margin snapshot.
10. Existing legacy partner IDs remain unchanged.

## Runtime validation

    npx prisma generate
    npx prisma migrate deploy
    npm run typecheck
    npm run lint
    npm test

P5 implementation is complete at source level only until controlled MySQL validation passes.


## P5 Commercial Ecosystem Completion

### Supplier relationship
A supplier is a distinct commercial counterparty. `suppliers` records supplier identity and default fulfillment, return and settlement responsibilities. `supplier_relationships` connects a supplier to products/resources and snapshots territory, fulfillment, return and settlement terms.

### Reseller agreement
`reseller_agreements` is the contractual boundary between a business/supplier relationship and a reseller. It explicitly records pricing model, margin, permitted discount, territory scope, customer ownership, fulfillment responsibility, return responsibility, settlement rule and settlement schedule. Agreement terms are snapshotted so historical orders do not silently change when an agreement is edited.

### Territories
`reseller_territories` provides explicit country/region/city/district allow/deny records. Territory enforcement must occur before offer/order acceptance whenever an order supplies customer location.

### Customer ownership
Supported values are represented as explicit commercial terms rather than inferred from partner type. The order snapshot records the rule that applied. This is important because an affiliate/agent relationship must not accidentally transfer customer ownership.

### Fulfillment and returns
Every reseller offer/order records who is responsible for fulfillment and returns. These values are inherited from the agreement/offer and frozen into the order trace.

### Settlement
`reseller_settlements` is a separate settlement ledger from affiliate commissions. It records gross, discount, reseller amount, supplier amount, margin, currency, due date, payment status and agreement terms. Settlement does not itself move external money; a confirmed financial transaction remains required before marking it paid.

### Reseller order lifecycle
`OFFER_AVAILABLE → ORDER_REGISTERED → PAYMENT_PENDING → PAYMENT_CONFIRMED → FULFILLMENT_PENDING → FULFILLED → RETURN_WINDOW → SETTLEMENT_DUE → SETTLED`

Returns/chargebacks must move the order and settlement through the applicable reversal/adjustment workflow rather than silently changing historical margin.

## Partner marketplace sharing

An ACTIVE partner can generate an attribution link from the authenticated marketplace portal for an eligible Product or Resource.

The endpoint creates:
1. a system-generated referral code;
2. a referral link scoped to the partner/workspace;
3. a persistent `partner_share_links` record;
4. a destination URL;
5. prebuilt sharing URLs for WhatsApp, Telegram, Facebook, X, LinkedIn and email.

The generated link always enters the existing P3 attribution pipeline, so clicks can become visitor attribution, leads, opportunities and orders according to the program's published attribution policy.

This is not equivalent to granting the partner permission to post directly into another person's social-media account. Direct account posting requires a separately authorized social integration. The marketplace provides ready-to-share links and Web Share-compatible payloads.

## P5 acceptance matrix

| Scenario | Required result |
|---|---|
| Self-register Agent | system-generated AGENT ID; no reseller entity |
| Self-register Affiliate | system-generated AFFILIATE ID; no reseller entity |
| Self-register Reseller | system-generated RESELLER ID + PENDING reseller entity |
| Internal Reseller | system-generated RESELLER ID + PENDING reseller entity |
| Active reseller without agreement | cannot receive reseller offer/order pricing |
| Reseller discount above agreement | rejected |
| Offer outside territory | rejected when customer location is available |
| Customer ownership | explicitly recorded in agreement/offer/order |
| Fulfillment responsibility | explicitly recorded in agreement/offer/order |
| Return responsibility | explicitly recorded in agreement/offer/order |
| Settlement | separate ledger; not affiliate commission |
| Active Agent/Affiliate marketplace sharing | system-generated product/resource attribution link |
| Inactive/restricted partner sharing | rejected |
| Product/resource attribution click | enters existing P3 referral pipeline |
| Legacy partner ID | unchanged |

## Runtime certification

P5 is source-complete but must be certified against the target MySQL database with:

```bash
npx prisma generate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm test
```

Because P5 uses both Prisma schema/migrations and the existing raw MySQL `db` layer, certification must include migration execution and endpoint smoke tests, not only unit tests.
