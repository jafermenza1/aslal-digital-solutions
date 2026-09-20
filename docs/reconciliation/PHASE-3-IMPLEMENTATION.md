# Phase 3 — Identity, Engagement & Customer Journey Foundation

## Scope

Relevant traceability IDs: R01, R02, R03, R04, R10, R11, R12, R28.

## Implemented foundation

- Person represents a legitimately identified individual.
- Lead capture creates/reuses Person only from submitted contact identity.
- Lead remains distinct from Person, Opportunity, and Customer.
- Opportunity represents a commercial pursuit independently of the Lead record.
- Customer is created only through controlled WON + positive-value conversion.
- Conversion is transactional and idempotent through the unique Opportunity → Customer relationship.
- Activity is the operational timeline foundation.
- Customer timeline now reconstructs visitor events, stage changes, notes, tasks, and activities in chronological order and serializes BigInt IDs safely.
- Growth Opportunity records high-intent anonymous signals without claiming visitor identity.
- Canonical business-event taxonomy is enforced at the tracking boundary.
- English, Amharic, and Afaan Oromoo are represented in the shared locale contract; customer language remains a stored Person/Customer preference.

## Identity safety

Anonymous Visitor activity never creates a Person or Customer by behavioral inference. Growth Opportunity is explicitly attached to the anonymous Visitor and is not an identity record.

## Commercial separation

Lead = identified sales relationship.
Opportunity = specific commercial pursuit.
Customer = resulting customer relationship.

A WON Lead is not automatically a Customer; conversion remains an explicit controlled operation.

## Migration safety

The Phase 3 migration is additive. It adds Person, Opportunity, Customer, Activity, Growth Opportunity, and the nullable Lead → Person relationship. No historical customer backfill is performed.

## Acceptance gates

Phase 3 remains IMPLEMENTED-UNVERIFIED until:
1. CI typecheck/lint/build succeeds on the final corrected head;
2. the additive migration applies successfully;
3. existing leads remain readable;
4. anonymous tracking produces Growth Opportunity only, not Person;
5. legitimate lead capture creates/reuses the correct Person;
6. canonical event taxonomy accepts PRD events and rejects unsupported event names;
7. one Lead can have multiple Opportunities;
8. non-WON conversion is rejected;
9. WON conversion without positive value is rejected;
10. conversion is atomic and repeated conversion is idempotent;
11. the unified customer timeline is chronological and serializable;
12. production health remains healthy after deployment;
13. English/Amharic/Afaan Oromoo preference support is observable in the application contract.

## Non-goals

Conversation/Message, channel adapters, automation, payment/order processing, full campaign attribution, and AI remain outside Phase 3.
