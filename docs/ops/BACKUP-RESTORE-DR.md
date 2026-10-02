# Backup, Restore and Disaster Recovery

## Backup

Run scripts/backup-mysql.sh with a least-privilege database credential. Keep encrypted copies outside the web root and, where possible, outside the production host.

## Restore drill

At least monthly:
1. Restore to an isolated database.
2. Preserve the restored copy before applying changes.
3. Run schema validation and migration status.
4. Compare counts and totals for orders, payments, refunds, revenue, commissions and payouts.
5. Run health and commercial smoke tests.
6. Record the drill evidence.

## Disaster recovery

If the application host is lost:
1. Provision a supported Node.js runtime.
2. Restore the latest trusted database backup.
3. Deploy the exact certified Git commit.
4. Restore secrets from the controlled secret inventory.
5. Run Prisma migration status; never reset a production database.
6. Verify health and authentication.
7. Verify workspace isolation.
8. Run commercial acceptance.
9. Reconcile financial records before reopening sales and payouts.

## Baseline objectives

RPO: 24 hours. RTO: 4 hours. These are baseline shared-host targets and should be improved when provider capabilities permit.

## Evidence

Record backup timestamp, checksum, migration version, restore start/end, operator, validation result and discrepancies.
