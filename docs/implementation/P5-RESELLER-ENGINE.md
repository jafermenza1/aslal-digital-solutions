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
