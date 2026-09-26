# Aslal OS — Q1 End-to-End Acceptance Test Plan

**Repository:** jafermenza1/aslal-digital-solutions  
**Acceptance baseline:** current main implementation and its generated deploy build  
**Primary workspace:** Aslal / aslaldigital.com  
**Purpose:** prove the implemented system works as a connected business workflow, not merely as isolated pages, APIs, or database models.

## 1. Acceptance objective

The primary business journey is:

~~~text
Campaign → Asset/Referral → Visitor → Person → Lead → Conversation/Follow-up
→ Opportunity → Quote → Negotiation → Accepted Quote → Order
→ Payment PENDING → Finance confirmation/reconciliation
→ Recognized Revenue → Partner Attribution → Commission
→ Payout/Dispute → Reporting/Audit
~~~

The direct-sales journey is the same without partner attribution.

Acceptance requires actual controlled evidence. An implemented model or endpoint is not PASS until its intended behavior is demonstrated.

## 2. Non-negotiable invariants

### Workspace boundary

For every workspace-owned record:

~~~text
record.workspaceId === currentWorkspace.id
~~~

Workspace A users must not read, mutate, export, or create financial records against Workspace B.

### Commercial separation

Keep these distinct:

- pipeline value
- quoted value
- accepted order value
- collected payment
- recognized revenue
- commissionable revenue
- partner commission
- payout

An accepted quote does not automatically create an order. An order does not automatically mean money was collected.

### Financial evidence

A reconciled payment must retain the relevant provider/reference/evidence, verifier and timestamps required by the current API contract. Never use direct database edits as acceptance evidence.

### No regression

Acceptance must preserve existing public acquisition, lead/customer, sales, quote, order, payment, partner, campaign, reporting, workspace and Telegram foundations.

---

# 3. Test actors

Create controlled accounts representing the roles available in the current user-management foundation:

| Actor | Use |
|---|---|
| System/Super Administrator | System setup and controlled administration |
| Administrator | Workspace/user administration |
| Business Owner | Business-level commercial visibility |
| Sales Manager | Pipeline and assignment |
| Sales Operator | Lead → opportunity → quote → order execution |
| Marketing Operator | Campaign and acquisition |
| Partner Manager | Partner/referral/campaign operations |
| Finance user | Payment/reconciliation/revenue/commission controls |
| Auditor/restricted user | Read-only or limited verification |
| Partner/agent | Partner-facing attribution |
| Anonymous visitor | Public acquisition |
| Telegram user | Inbound conversation/sales |

Do not grant extra permissions simply to make a scenario pass.

---

# 4. Controlled test data

Create two workspaces:

- Workspace A — Aslal Acceptance
- Workspace B — Boundary Test

Create deterministic commercial data:

- Quote: ETB 100,000
- Order: ETB 100,000
- Full payment: ETB 100,000
- Partial payment test: ETB 60,000
- Commission rule: 10%
- Expected full-payment commissionable basis: ETB 100,000
- Expected commission: ETB 10,000

Use test references:

- TEST-TELEBIRR-001
- TEST-CBE-001
- TEST-MPESA-001

These are test records only; do not claim real provider verification.

Create:

- Acceptance Buyer
- Acceptance Partner
- Q1 Acceptance Campaign
- one campaign asset
- one referral link
- objective/target
- total and partner budgets
- reward rule

---

# 5. Preflight

## P0. Repository/build

~~~bash
git branch --show-current
git rev-parse HEAD
git status --short
npm install
npx prisma generate
npm run typecheck
npm run lint
npm run build
~~~

Expected:

- intended release is being tested;
- typecheck passes;
- lint has no errors;
- production build succeeds.

## P1. Database

~~~bash
node scripts/db-check.mjs
npx prisma migrate status
~~~

Expected:

~~~text
{"ok":true,"database":true}
Database schema is up to date
~~~

Never use prisma migrate reset against production.

## P2. Production health

~~~bash
curl -i --max-time 15 https://aslaldigital.com/api/health
~~~

Expected:

~~~text
HTTP 200
status=ok
application=ok
database=ok
~~~

---

# 6. Acceptance scenario matrix

| ID | Scenario | Expected result |
|---|---|---|
| A01 | Public website/service discovery | Public conversion paths work |
| A02 | Visitor attribution | Visitor/events remain attributable |
| A03 | Contact/resource lead capture | Canonical Lead is created |
| A04 | Growth Builder | Demand context reaches lead capture |
| A05 | Unified customer identity | Repeated interactions use canonical identity |
| A06 | Sales assignment/follow-up | Owner, task, activity and stage are retained |
| A07 | Opportunity | Distinct commercial pursuit exists |
| A08 | Quote/revision/negotiation | Versions and negotiation history are preserved |
| A09 | Accepted quote → order | Explicit order transition creates Order |
| A10 | Payment lifecycle | Payment starts PENDING and transitions are controlled |
| A11 | Reconciliation | Evidence/verifier is required |
| A12 | Revenue | Recognized revenue is distinct from order value |
| A13 | Partner attribution → commission | Attribution survives and commission follows financial basis |
| A14 | Payout/dispute | Workspace-owned settlement records are traceable |
| A15 | Campaign → asset → referral | Acquisition lineage is preserved |
| A16 | Workspace isolation | A/B negative tests pass |
| A17 | RBAC | UI and API enforce permissions |
| A18 | Reporting/export | Data is accurate and workspace-scoped |
| A19 | Telegram inbound sales | Message → conversation → lead/sales workflow works when configured |
| A20 | Mini App contract | Future catalog layer uses canonical commerce records |
| A21 | Duplicate/fraud-risk controls | Duplicate identities are blocked/flagged appropriately |
| A22 | Refund/cancel/dispute | Original history remains reconstructable |
| A23 | Mobile workflow | Critical actions remain usable |
| A24 | Audit reconstruction | Final transaction can be traced end to end |

---

# 7. Detailed procedures

## A01 — Public website and service discovery

1. Open the public homepage.
2. Navigate to Services and Products.
3. Open a service/product detail page.
4. Verify CTA, slug, navigation, responsive layout and readable text.
5. Follow the CTA to contact/growth capture.
6. Confirm selected business/goal/channel context survives navigation.

**Expected:** the public site is an acquisition surface connected to the same lead engine.

---

## A02 — Visitor attribution

1. Open a public URL containing controlled UTM/referral parameters.
2. Visit multiple pages.
3. Trigger a meaningful high-intent event.
4. Inspect authorized visitor/event evidence.
5. Confirm the same visitor identity is retained.
6. Submit a lead.
7. Confirm applicable attribution fields survive into the lead.

**Expected:** page views, accepted events, visitor identity and lead attribution remain connected. A page view alone must not be treated as a qualified lead.

---

## A03 — Contact/resource lead capture

1. Submit Contact using a unique test email and phone.
2. Include business type and demand.
3. Confirm success response.
4. Open the Leads workspace.
5. Locate the new Lead.
6. Verify normalized phone, workspace, source/attribution, visitor linkage where applicable, timestamp and status.
7. Submit the same identity again.
8. Verify duplicate handling rather than creating unrelated customer identities.

**Expected:** a real interaction becomes a canonical Lead.

---

## A04 — Growth Builder

1. Open Growth Builder.
2. Select business type.
3. Select growth goal.
4. Select channels.
5. Generate the plan.
6. Use the conversion CTA.
7. Verify business/goal/channel context reaches Contact.
8. Submit the demand.
9. Locate the Lead.

**Expected:** Growth Builder is a qualified acquisition entry point, not a disconnected calculator.

---

## A05 — Unified customer identity

1. Open the Lead from A03.
2. Use the implemented lead → Person/Customer conversion.
3. Open the resulting Person/Customer.
4. Add or inspect Activity.
5. Add another interaction for the same person.
6. Verify both interactions attach to the same canonical identity.
7. Attempt a second customer using the same email/phone.

**Expected:** one canonical identity is maintained within the workspace and duplicate-customer rules are enforced.

---

## A06 — Sales assignment and follow-up

1. Sales Manager opens the new Lead.
2. Assign it to Sales Operator.
3. Set next action and due date.
4. Sales Operator opens assigned work.
5. Create follow-up task/activity.
6. Complete it.
7. Record the resulting conversation/note.
8. Inspect stage/history.

**Expected:** a salesperson can take ownership and execute follow-up from the sales workspace.

---

## A07 — Opportunity

1. Create Opportunity from the canonical Lead/Customer workflow.
2. Link it to the Person/Customer.
3. Enter ETB 100,000 commercial value.
4. Set the implemented stage and sales owner.
5. Verify pipeline visibility.
6. Verify workspace ownership.

**Expected:** Opportunity is a distinct commercial pursuit, not merely a Lead status.

---

## A08 — Quote, revision and negotiation

1. Create Quote for ETB 100,000.
2. Save version 1.
3. Change a price/term.
4. Save a revision.
5. Record negotiation activity.
6. Inspect revision history.
7. Accept the final quote.

**Expected:**

- revisions are preserved;
- previous versions are not silently overwritten;
- negotiation actor/time/context is reconstructable;
- acceptance does not itself create an Order.

---

## A09 — Accepted quote → explicit Order

1. Start from the accepted Quote.
2. Use the supported order-creation transition.
3. Create Order.
4. Verify order number/items/value.
5. Verify links to workspace, customer, opportunity and quote.
6. Verify source/campaign/referral/partner/sales-owner attribution where applicable.
7. Inspect Order state.

**Expected:** Order is first-class and exists only through an explicit supported transition.

---

## A10 — Payment lifecycle

1. Open Order.
2. Create payment with provider-neutral test data.
3. Use TEST-TELEBIRR-001 and ETB 100,000.
4. Verify initial state is PENDING.
5. Attempt direct creation as CONFIRMED.
6. Verify the hardened API rejects that invalid creation.
7. Transition the existing payment through the supported confirmation/review path.
8. Verify Order payment state.
9. Repeat the same idempotent request.

**Expected:**

- PENDING is the controlled entry state;
- invalid direct confirmation is rejected;
- duplicate idempotent requests do not create duplicate payments;
- Order remains intact if provider integration is unavailable.

---

## A11 — Payment reconciliation/evidence

1. Start with PENDING payment.
2. Open the current Finance/reconciliation workflow.
3. Supply provider, transaction reference, evidence reference, notes and verifier as required.
4. Attempt RECONCILED without required evidence.
5. Verify rejection.
6. Supply valid controlled evidence.
7. Perform the authorized reconciliation transition.
8. Re-open payment and verify verifier/timestamp/evidence.

**Expected:** a status change alone cannot manufacture reconciled money.

**Important current-state check:** repository reconciliation documentation identifies a UI/Finance-workbench mismatch in some current implementation notes. Test the actual current UI. If the API enforces the contract but the intended operator queue is missing, record BLOCKED rather than bypassing the UI with database edits.

---

## A12 — Revenue recognition

1. Start with successfully confirmed/reconciled payment.
2. Inspect Revenue.
3. Verify order, payment, workspace, recognized amount, commissionable amount and recognition status/date.
4. Compare quote, order, collected payment and recognized revenue.
5. Repeat with the ETB 60,000 partial-payment test.

**Expected:** order value, collected amount and recognized revenue remain distinct.

---

## A13 — Partner attribution → commission

1. Create/activate Acceptance Partner.
2. Verify human-facing partner ID.
3. Create Q1 Acceptance Campaign.
4. Create campaign asset/referral.
5. Visit referral URL.
6. Submit Lead.
7. Verify campaign/asset/partner attribution.
8. Continue through Person/Customer → Opportunity → Quote → Order.
9. Complete payment and reconciliation.
10. Inspect Commission.
11. Verify commission basis uses the appropriate reconciled/commissionable financial amount.
12. Verify Commission workspace equals commercial workspace.

**Expected:** attribution survives the full commercial journey and commission is not earned merely because a lead or quote exists.

---

## A14 — Commission approval → payout/dispute

1. Start with eligible Commission.
2. Verify initial state.
3. Use authorized approval transition.
4. Verify payable/approved state where implemented.
5. Prepare payout through the supported workflow.
6. Verify partner, workspace, commission, amount, status and audit references.
7. Create a controlled dispute.
8. Resolve it using the supported path.

**Expected:** settlement records remain traceable and workspace-scoped.

**Boundary:** an internal payout record is not proof that external money was actually transferred. Full external settlement must be separately demonstrated.

---

## A15 — Campaign → asset → referral

1. Marketing Operator creates campaign.
2. Enter objective/target, total budget, partner budget and location.
3. Select reward model.
4. Move through supported lifecycle: Draft → Open → Active → Paused → Completed/Cancelled as applicable.
5. Create Campaign Asset.
6. Attach partner/referral attribution.
7. Visit asset/referral.
8. Create Lead.
9. Verify full lineage.

**Expected:** campaign records feed the canonical acquisition/commercial journey.

---

## A16 — Workspace isolation — mandatory security test

### Positive

1. Log in as Workspace A user.
2. Open A Lead, Quote, Order, Payment, Revenue and Commission.
3. Verify access.

### Negative

Create equivalent records in B. As A user attempt:

- read B Lead;
- read B Quote;
- update B Lead;
- update B Payment;
- update B Commission;
- create payment against B Order;
- access B Partner/Campaign/Revenue;
- export B Leads.

Then run:

~~~bash
npm run q1:test-boundary
~~~

**Expected:** all cross-workspace operations are rejected or safely appear not found.

---

## A17 — RBAC and permission enforcement

For each controlled role:

1. Log in.
2. Verify permitted navigation.
3. Directly open a restricted URL.
4. Directly call the restricted API.
5. Attempt a mutation without permission.
6. Attempt privilege escalation:
   - non-admin creates ADMIN/SUPER_ADMIN;
   - non-admin assigns OWNER/ADMIN workspace role;
   - non-admin escalates an existing user's account role.

**Expected:** server-side authorization prevents unauthorized access and escalation. Hiding a button is not sufficient evidence.

---

## A18 — Reporting/export

1. Create controlled A records.
2. Open dashboard/reporting.
3. Compare lead/customer/order/payment/revenue/commission counts.
4. Filter by workspace/date/source/partner where supported.
5. Export Leads.
6. Compare export to source records.
7. Repeat as B user.

**Expected:** reports and exports are accurate and workspace-scoped.

---

## A19 — Telegram inbound sales

### Preconditions

Configure real controlled Telegram bot credentials and webhook secret.

1. Configure/verify webhook.
2. Send inbound message.
3. Verify signed/secret boundary.
4. Replay the same event.
5. Verify idempotent handling.
6. Verify Conversation/Message creation.
7. Identify sender where supported.
8. Create/link Lead.
9. Assign/handoff to salesperson.
10. Continue conversation.
11. Verify consent/opt-out behavior where implemented.
12. Verify conversation connects to canonical Lead/Customer workflow.

**Expected:** Telegram is another sales entry point, not a parallel CRM.

Live delivery must be marked BLOCKED if credentials or controlled bot testing are unavailable.

---

## A20 — Telegram Mini App/catalog contract

The intended future contract is:

~~~text
Telegram Mini App
→ Product/Resource
→ Media/Specifications
→ CTA
→ Customer/Lead
→ Opportunity/Quote
→ Order
→ Payment
→ Reconciliation
→ Revenue
→ Commission
~~~

Acceptance rule: do not mark future Mini App UI as implemented merely because architecture documentation describes it.

Where current catalog/product/resource features exist, verify they use canonical records and that CTA/attribution enters the same Lead/Opportunity/Order/Payment domains rather than creating Telegram-only commerce records.

---

## A21 — Duplicate and lead-risk controls

Test separately:

1. Same email in same workspace.
2. Same normalized phone in same workspace.
3. Same email across A/B.
4. Same phone across A/B.
5. Same visitor submitting multiple forms.
6. Same IP/device signal where the current implementation exposes it.

**Expected:** same-workspace duplicate customer creation is blocked/flagged according to the implemented rule; cross-workspace data remains isolated. Risk signals are alerts/evidence, not proof of fraud.

---

## A22 — Cancellation/refund/dispute

1. Create confirmed test Order/Payment.
2. Execute supported cancellation/refund/reversal.
3. Verify Order and Payment propagation.
4. Verify Revenue/Commission consequences.
5. Open partner attribution dispute where applicable.
6. Verify underlying transaction remains linked.
7. Verify actor and timestamp audit.

**Expected:** exceptions do not erase the original transaction history.

---

## A23 — Mobile/responsive

At narrow mobile width test:

- public site;
- contact;
- login;
- dashboard;
- lead;
- customer;
- quote;
- order;
- payment/reconciliation;
- partner;
- campaign.

Verify:

- navigation is usable;
- buttons are readable;
- forms fit;
- tables have a usable mobile strategy;
- dialogs remain reachable;
- no critical action is clipped;
- light/dark text remains readable.

---

## A24 — Audit reconstruction

Start with only the final Order ID.

The tester must reconstruct:

1. source/campaign;
2. visitor;
3. person;
4. lead;
5. opportunity;
6. quote/revisions;
7. negotiation;
8. order;
9. payment;
10. reconciliation;
11. revenue;
12. partner attribution;
13. commission;
14. payout/dispute;
15. actors and timestamps.

**Expected:** the transaction is reconstructable from system evidence without manually rebuilding it from disconnected external records.

---

# 8. Failure-path matrix

| ID | Attempt | Expected |
|---|---|---|
| F01 | Create payment directly as CONFIRMED | Reject |
| F02 | Reconcile without evidence | Reject |
| F03 | Read another workspace Lead | Reject/not found |
| F04 | Update another workspace Payment | Reject |
| F05 | Create payment against another workspace Order | Reject |
| F06 | Non-admin creates ADMIN user | Reject |
| F07 | Duplicate same-workspace Customer | Block/flag |
| F08 | Accepted Quote without order transition | No Order |
| F09 | Provider failure | Order remains |
| F10 | Same payment idempotency key | No duplicate |
| F11 | Invalid Telegram webhook secret | Reject |
| F12 | Replayed Telegram event | Idempotent |
| F13 | Unauthorized export | Reject |
| F14 | Wrong-workspace parent/child mutation | Reject |
| F15 | Attempt to overwrite immutable commercial history | Reject/preserve revision |

---

# 9. Golden-path business demonstrations

## G01 — Partner-attributed sale

A real salesperson must be able to demonstrate:

1. Campaign created.
2. Partner and asset/referral attached.
3. Visitor arrives.
4. Lead captured.
5. Attribution retained.
6. Salesperson receives lead.
7. Follow-up occurs.
8. Person/Customer is linked.
9. Opportunity created.
10. Quote created.
11. Quote revised.
12. Negotiation recorded.
13. Quote accepted.
14. Order explicitly created.
15. Payment created as PENDING.
16. Finance confirmation/reconciliation performed.
17. Revenue recognized.
18. Partner attribution remains attached.
19. Commission becomes eligible on the appropriate financial basis.
20. Commission approved.
21. Payout/dispute state is recorded where supported.
22. Reporting shows the transaction.
23. Audit evidence reconstructs the journey.

Capture every canonical ID.

## G02 — Direct sale

Repeat G01 without partner attribution.

Expected:

- same canonical commercial journey;
- no artificial partner commission;
- direct-source attribution remains reportable.

## G03 — Two-tenant security

Run G01 in A and an unrelated journey in B, then execute all A→B negative tests plus the existing Q1 boundary harness.

Expected: no cross-workspace disclosure or mutation.

## G04 — Financial integrity

1. Order = ETB 100,000.
2. Payment 1 = ETB 60,000.
3. Verify Order remains 100,000.
4. Verify collected amount is 60,000.
5. Verify revenue/commissionable values follow the implemented reconciliation rules.
6. Payment 2 = ETB 40,000.
7. Reconcile both.
8. Verify final collected/reconciled amount = ETB 100,000.
9. Verify commission was not prematurely earned on unreconciled funds.

---

# 10. Current implementation-sensitive areas

These are explicit acceptance checks, not assumptions.

### Payment/reconciliation UI

The repository contains the payment domain, hardened transitions and evidence/verifier enforcement. Existing reconciliation documentation also identifies a UI/Finance-workbench mismatch in the current implementation notes. Therefore A10 and A11 must be tested through the real current UI/API path. If the API is correct but the intended operator queue is missing, record BLOCKED; do not bypass it with SQL.

### Telebirr/CBE/M-Pesa

Treat these as provider-neutral/manual evidence unless a real integration is configured and demonstrated. Do not claim automated provider verification from provider-name fields alone.

### Lead SLA automation

Workflow definitions and follow-up/task behavior exist, while repository reconciliation notes identify scheduler/invocation limitations. Do not claim SMS/Telegram SLA alert delivery without a controlled live test.

### Anchor-client onboarding

Workspace/trusted-host foundations exist, but production anchor clients are not accepted merely because workspace infrastructure exists. Demonstrate each client workspace, users and access separately.

### External payout settlement

A payout record proves internal state only. It does not prove external money movement.

### Telegram

Architecture, signed boundary and idempotency controls must be tested; live delivery requires configured credentials and a controlled bot test.

---

# 11. Evidence record

For every scenario retain:

~~~text
Scenario ID:
Tester:
Date/time:
Environment:
Workspace:
Actor:
Starting IDs:
Actions:
Expected:
Actual:
API response/status:
Final state:
Evidence references:
PASS / FAIL / BLOCKED:
Defect/reference:
~~~

Golden-path evidence must contain the complete canonical ID chain.

---

# 12. PASS / FAIL / BLOCKED

### PASS

Use only when the actual UI/API behavior matches the contract, state persists, workspace ownership is correct, authorization is enforced and required evidence exists.

### FAIL

Use when the feature is expected to be implemented, the test can execute it, and actual behavior contradicts the contract.

### BLOCKED

Use when a documented dependency is unavailable, required external credentials are missing, or the current UI cannot execute an otherwise implemented API contract.

Never turn BLOCKED into PASS by direct database edits.

---

# 13. Release gate

All mandatory boxes must pass:

- [ ] Production health OK
- [ ] Database connectivity OK
- [ ] Prisma migration state clean
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Production build passes
- [ ] Public acquisition works
- [ ] Lead capture works
- [ ] Unified customer identity works
- [ ] Follow-up works
- [ ] Opportunity works
- [ ] Quote/revision/negotiation works
- [ ] Accepted Quote → explicit Order works
- [ ] Payment starts PENDING
- [ ] Invalid direct confirmation rejected
- [ ] Reconciliation requires evidence
- [ ] Revenue distinguishes order value and collected/reconciled value
- [ ] Partner/campaign/referral lineage survives the journey
- [ ] Commission follows the appropriate reconciled financial basis
- [ ] Payout/dispute records are workspace-scoped
- [ ] Workspace A/B negative tests pass
- [ ] RBAC negative tests pass
- [ ] Reporting/export is workspace-safe
- [ ] Duplicate controls pass
- [ ] Refund/cancellation/dispute behavior is traceable
- [ ] Mobile critical paths pass
- [ ] Audit reconstruction passes
- [ ] Telegram is PASS or explicitly BLOCKED for external configuration
- [ ] No known blocker is hidden by database manipulation

# 14. Final business proof

The release is accepted when a real salesperson can take a newly captured prospect through the connected commercial journey from acquisition to financially controlled outcome, while the system preserves:

**identity + workspace ownership + attribution + evidence + revenue + partner economics + audit history.**

Future Mini App features, payment-provider integrations, automated SLA delivery and external payout settlement must extend this canonical journey rather than creating parallel records or bypassing its controls.
