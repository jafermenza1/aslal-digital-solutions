# Production Certification Checklist

## Release integrity
- [ ] Certified Git commit recorded
- [ ] CI lint passes
- [ ] CI typecheck passes
- [ ] Prisma validate passes
- [ ] Production build passes
- [ ] Hardening control tests pass
- [ ] Dependency audit passes

## Commercial journey
- [ ] Partner registration
- [ ] Partner verification
- [ ] Program/campaign admission
- [ ] Referral link generated
- [ ] Attributed lead/customer
- [ ] Sale/order created
- [ ] Pending payment created
- [ ] Provider confirmation
- [ ] Duplicate webhook replay
- [ ] Finance reconciliation
- [ ] Revenue recognized
- [ ] Commission qualified/eligible
- [ ] Payout approved
- [ ] Payout completed
- [ ] Payout failure
- [ ] Payout retry
- [ ] Partial refund
- [ ] Full refund
- [ ] Revenue/commission correction verified
- [ ] Repeat journey succeeds a second time

## Isolation and security
- [ ] Workspace A cannot read Workspace B records
- [ ] Workspace A cannot mutate Workspace B records
- [ ] Unauthenticated financial API calls rejected
- [ ] Login rate limiting verified
- [ ] Invalid webhook signature rejected
- [ ] Duplicate webhook is idempotent
- [ ] Payment idempotency conflict rejected
- [ ] Refund idempotency conflict rejected
- [ ] Security headers verified
- [ ] No secrets exposed in client responses

## Resilience
- [ ] Database backup created
- [ ] Backup integrity verified
- [ ] Restore drill completed
- [ ] Application health alarm verified
- [ ] Payment/webhook failure alert verified
- [ ] Payout failure alert verified
- [ ] Disaster recovery drill completed

## Performance
- [ ] k6 baseline completed
- [ ] HTTP error rate below agreed threshold
- [ ] p95 latency below agreed threshold
- [ ] Database resource utilization reviewed
- [ ] No critical slow query observed

## Final certification
- [ ] No open Sev-1 financial-integrity defect
- [ ] No known cross-workspace exposure
- [ ] Evidence bundle archived
- [ ] Operations owner signed off
- [ ] Finance owner signed off
- [ ] Production release approved
