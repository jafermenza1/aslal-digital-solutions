# Q1 Workspace Boundary Completion

## Increment covered

This increment hardens workspace isolation for partner-engine operations and the lead/customer commercial handoff.

### Contract

For an authenticated workspace context **W**:

1. Reads return only records owned by **W**.
2. Updates/deletes address records only when they belong to **W**.
3. New commercial records copy **W** explicitly.
4. Every cross-record reference is checked against **W** before it is accepted.
5. Revenue → Commission remains explicitly workspace-owned.
6. A workspace cannot use another workspace's partner, campaign, commission, referral link, lead, payment, invoice, payout, or dispute by identifier alone.

## Implemented

### Partner engine

- Partner campaigns: list/create/update are workspace-scoped.
- Campaign partners: campaign and partner must share the active workspace.
- Referral links generated from campaign approval now receive the active workspace.
- Campaign assets: reads, creates and updates are workspace-scoped.
- Attribution disputes: claimant, competing partner, lead, campaign and commission references must resolve inside the active workspace.
- Dispute reads/updates are workspace-scoped.
- Partner payouts: payout, partner and selected commissions are workspace-scoped.
- PAYABLE commission selection remains gated by recognized revenue and reconciled payment.

### Partner portal

- Campaign application verifies partner and campaign workspace alignment.
- Campaign QR generation only exposes referral links within the partner's workspace.
- Partner dispute reads/creates are workspace-scoped.
- Partner payout and commission views are workspace-scoped.

### Lead/customer handoff

- Admin lead mutation is workspace-scoped.
- Lead export is workspace-scoped.
- Lead → customer conversion requires a lead in the active workspace and propagates workspace ownership to the new opportunity/customer.
- Customer timeline reads require the customer to belong to the active workspace.

### Schema/migration

The Q1 boundary migration gives Partner, ReferralLink, Revenue, Commission, PartnerPayout, PartnerDispute and CampaignAsset explicit workspace ownership and backfills existing records. These new ownership columns are non-null and use restrictive workspace deletion semantics so owned records cannot silently lose their tenant boundary.

## Acceptance tests still required

Run against a database containing at least Workspace A and Workspace B:

- A cannot read B's lead/customer/campaign/partner/payout/dispute.
- A cannot update B's records.
- A cannot create a commercial record using a B opportunity/customer/order/payment/commission/referral link.
- A cannot attach a B commission to an A payout.
- A cannot create an attribution dispute referencing B records.
- Revenue and Commission for the same commercial chain have the same workspace.
- Existing records have no NULL workspace after migration.

CI remains intentionally limited to typecheck and lint; deployment/build verification is deferred until the quota/billing adjustment requested for the current phase.


## Increment 3 — workspace-scoped reporting

Step 8 reporting boundaries are now implemented on the management dashboards and lead export:

- Main dashboard pipeline, won revenue, customer, lead, opportunity, overdue and recent-demand metrics are filtered by the active workspace.
- Customers, quotes and orders dashboard reads require workspace authorization and filter their root records by workspace.
- Lead dashboard counts, grouped stage/value metrics, source filters, execution-gap counts and lead rows are workspace-scoped.
- Operations task queues and task create/update actions validate the task/lead against the active workspace.
- Insights acquisition, referral, product-attribution, activity and follow-up reporting are constrained through workspace-owned lead/referral relationships.
- Partner dashboard KPIs, partner performance, referral links, commission status totals and partner catalog are workspace-scoped.
- Lead CSV export now requires workspace authorization and exports only that workspace.
- Workspace authorization supports dashboard/operations/insights reporting permissions.
- No production build was added or run; CI remains typecheck/lint only as required.

### Step 8 verification status

The branch currently has **no GitHub Actions workflow run for the latest Step 8 head**, so typecheck/lint are not yet claimed as passed. Build/deployment remains intentionally deferred.

### Remaining Step 8 boundary note

Visitor/event records are currently global acquisition records rather than explicit workspace-owned records. Insights therefore scopes event-derived reporting through visitors that have a lead in the active workspace. A future explicit workspace ownership model for anonymous acquisition events can be added if independent pre-lead tenant attribution becomes a requirement.
