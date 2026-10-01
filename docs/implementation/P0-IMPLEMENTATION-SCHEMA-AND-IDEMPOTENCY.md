# P0 Implementation — Schema Order, Foreign Keys and Idempotency

## Purpose
P0 is the correctness gate for Aslal Partner Commerce. It must make the existing sales/payment/campaign foundation internally consistent before new partner-commerce features are added.

## Current P0 changes
1. Partner campaign creation now writes resource_id to the same column that already exists in the Prisma model and production migration.
2. Campaign product/resource selection is workspace-scoped.
3. Payment creation locks the parent order before calculating the remaining balance.
4. Payment creation validates that the submitted currency matches the order currency.
5. Existing Payment.idempotency_key remains the database-level duplicate protection.
6. A concurrent duplicate payment request is handled by returning the already-created payment rather than creating a second payment.
7. Existing unique Commission.payment_id and Commission.revenue_id constraints remain the final database protection against duplicate commission creation.

## Important conclusion: no new P0 Prisma migration is required
The repository already contains the required payment idempotency column and uniqueness constraint: payments.idempotency_key is unique; commissions.payment_id is unique; commissions.revenue_id is unique.
The campaign resource_id column also already exists in the production migration 20260926150000_unified_attribution_social and in prisma/schema.prisma.
Therefore P0 does not add another migration merely to recreate these structures. Recreating an existing column or foreign key would create avoidable production risk.

## Foreign-key deployment order
When a future migration introduces a new table relationship, use this order:

### 1. Parent tables first
Create or verify the table that owns the referenced primary key.
Example dependency: workspaces → partners → partner_campaigns.

### 2. Child tables next
Create the child table and its columns/indexes only after required parents exist.

### 3. Foreign keys after all required tables exist
For complex migrations, create tables first and add foreign-key constraints after the complete set of parent/child tables exists.

### 4. Data backfill before enforcing a new required relationship
Add a new relationship as nullable; deploy; backfill valid IDs; identify invalid rows; correct or quarantine them; then enforce the required constraint.

## Recommended Partner Commerce dependency order
Workspace → Partner → Partner Program/Campaign → Program Terms/Contract → Referral Link/Deal Registration → Lead/Opportunity → Order → Payment → Revenue → Commission → Payout → Payout Item → Dispute/Audit.
This is a conceptual dependency order. Existing Aslal tables may already exist in earlier migrations, so new migrations should only add missing pieces.

## Idempotency rule
Idempotency means that if Aslal receives the same business request twice, the second request must not create a second financial result.

For payment requests: idempotency_key identifies one intended payment operation. An application pre-check is useful, but it is not sufficient because two requests can arrive simultaneously. The database unique constraint is the final protection.

Safe pattern: receive request → validate key → check existing payment → lock order → calculate remaining balance → create payment → let unique constraint reject a concurrent duplicate → fetch and return the committed payment when the duplicate constraint fires.

## Financial idempotency
One payment must produce at most one revenue record because Revenue.payment_id is unique.
One payment must produce at most one commission because Commission.payment_id is unique.
One revenue record must produce at most one commission because Commission.revenue_id is unique.

## Migration safety rules for Emerald production
Production must use the repository's checked-in Prisma migration history.
Use npx prisma migrate status to inspect migration state and npx prisma migrate deploy to apply pending migrations through the controlled deployment path.
Do not use prisma migrate reset against production. Do not edit an already-applied migration. Do not create a second migration that recreates a column or foreign key that already exists.

## P0 acceptance checklist
### Campaign
- [x] resource_id exists in the Prisma model.
- [x] resource_id exists in the relevant production migration.
- [x] campaign INSERT includes resource_id.
- [x] product/resource selection is workspace-aware.
- [ ] TypeScript/build verification.
- [ ] Controlled production campaign creation test.

### Payment
- [x] idempotency key is required.
- [x] idempotency key is unique in the database.
- [x] existing idempotent request returns the original payment.
- [x] parent order is locked during balance calculation.
- [x] payment currency must match order currency.
- [x] concurrent duplicate creation is caught through the unique constraint.
- [ ] TypeScript/build verification.
- [ ] concurrent duplicate-payment integration test.
- [ ] controlled production payment test.

### Commission/revenue
- [x] payment uniqueness is represented in Prisma.
- [x] revenue uniqueness is represented in Prisma.
- [x] commission uniqueness by payment is represented in Prisma.
- [x] commission uniqueness by revenue is represented in Prisma.
- [ ] controlled end-to-end duplicate-payment → revenue → commission test.

## Why this order matters
The safe sequence is: Parent identity → child records → relationships → business transactions → financial records → payout records.
Do not start with payout or commission tables and then try to repair their parent relationships later.

> P0 rule: no new commercial feature should bypass the database's identity, relationship, transaction and idempotency controls.

Prisma's current production guidance uses migrate deploy for applying pending migrations; migrate dev is for development and migrate reset is destructive. See the official Prisma migration documentation.