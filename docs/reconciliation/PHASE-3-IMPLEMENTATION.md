# Phase 3 — Identity, Engagement & Customer Journey Foundation

## Scope

This phase establishes the minimum distinct identity and commercial-journey objects required by the Growth OS domain contract.

Relevant traceability IDs: R01, R02, R03, R04, R10, R11, R12.

## Implemented foundation

- `Person` represents a legitimately identified individual.
- Lead capture creates or reuses a Person only when the submitted contact identity is legitimate.
- `Lead.personId` links the identified sales record to that Person.
- `Opportunity` is distinct from Lead and can represent a specific commercial pursuit.
- `Customer` is distinct from Lead and is created only through the controlled conversion endpoint for a verified WON lead with positive deal value.
- `Activity` provides the initial chronological timeline foundation for customer/opportunity/person records.
- Customer timeline API returns the customer, related opportunity/person, and recorded activities.

## Identity safety

Anonymous Visitor activity does not create a Person.
Person creation occurs from submitted lead identity, not behavioral inference.
Existing leads are not silently converted to people or customers by migration.

## Commercial separation

Lead remains the identified sales relationship.
Opportunity represents a specific commercial pursuit.
Customer represents the resulting customer relationship.
The implementation does not equate WON Lead with Customer automatically.

## Migration safety

All schema changes are additive.
Existing leads retain their existing identifiers and data.
The new Person link is nullable.
No automatic customer backfill is included.
Production migration must be applied through the controlled deployment path.

## Acceptance gates

Phase 3 must remain IMPLEMENTED-UNVERIFIED until CI and controlled verification demonstrate:

1. schema/client generation succeeds;
2. migration applies without destructive changes;
3. existing leads remain readable;
4. anonymous visitor activity does not create Person records;
5. legitimate lead submission creates/reuses the correct Person;
6. one Lead can have multiple Opportunities;
7. a non-WON Lead cannot be converted to Customer;
8. a WON lead without positive deal value cannot be converted;
9. successful conversion creates Person/Opportunity/Customer relationships atomically;
10. repeated conversion is idempotent;
11. customer timeline returns chronological Activity records;
12. production health remains healthy after deployment.

## Deliberate non-goals

This phase does not yet implement Conversation/Message, channel adapters, automation, payment/order processing, full campaign attribution, or AI.