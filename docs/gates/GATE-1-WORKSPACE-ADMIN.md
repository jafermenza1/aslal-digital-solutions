# Gate 1 — Workspace Administration and Access Contract

**Task:** Gate 1 continuation from the Q1 API-gap audit  
**Mainline:** `main`  
**Status:** IMPLEMENTED — VERIFICATION PENDING

**Canonical branch:** `main` (the implementation branch was merged; the feature branch has been deleted).  
**Contract rule:** implementation must satisfy the documented contract; code/UI existence is not acceptance evidence.

## Contract

Gate 1 must allow an authorized administrator to establish a real two-workspace operating setup without bypassing the existing authorization or commercial domain rules.

### Workspace administration

1. Create a workspace with name, slug and client type.
2. Workspace creation is atomic: workspace and creator OWNER membership are created together or neither is persisted.
3. List only workspaces the current user is authorized to see.
4. Edit workspace name, slug, client type and active state.
5. The protected Aslal Internal workspace cannot be renamed or deactivated through the client-workspace lifecycle API.
6. Select an authorized active workspace and persist that context for subsequent workspace-aware operations.
7. View the members and their workspace roles.
8. Assign an active user to an authorized workspace with an explicit workspace role.

### Users and roles

The account role contract now includes:

- SUPER_ADMIN
- ADMIN
- BUSINESS_OWNER
- SALES_MANAGER
- SALES_OPERATOR
- MARKETING_OPERATOR
- PARTNER_MANAGER
- PARTNER
- FINANCE
- AUDITOR
- CLIENT

Every newly created user must be assigned to an authorized workspace in the same transaction as the user record. The workspace role is stored separately from the account role so workspace responsibility is explicit and auditable.

The initial least-privilege defaults are:

- FINANCE: dashboard, customer, insight and commerce read access.
- AUDITOR: dashboard, lead/customer read, insight and operations read access.
- CLIENT: dashboard, customer and insight read access.

Permissions remain editable through the existing user-management contract.

### Partner / agent / influencer setup

Partner creation must resolve the active/selected authorized workspace before writing data.

The Partner and ReferralLink records created by the registration flow must both carry that workspace ownership. A failure must return a specific authorization/validation error rather than a generic database failure.

## Acceptance matrix

| ID | Scenario | Required evidence | Status |
|---|---|---|---|
| G1-01 | Admin creates Workspace B | HTTP 201 + workspace visible + OWNER membership | PENDING |
| G1-02 | Non-authorized user cannot access Workspace B | 403/404 and no member/data leak | PENDING |
| G1-03 | Admin edits Workspace B | persisted name/slug/client type | PENDING |
| G1-04 | Admin activates/deactivates eligible workspace | state changes persist | PENDING |
| G1-05 | Aslal Internal cannot be deactivated | 409 and unchanged state | PENDING |
| G1-06 | Admin creates Finance user for Workspace B | user + membership committed together | PENDING |
| G1-07 | Admin creates Auditor user for Workspace B | user + membership committed together | PENDING |
| G1-08 | Admin creates Client user for Workspace B | user + membership committed together | PENDING |
| G1-09 | Sales B is assigned to Workspace B with SALES workspace role | membership visible and correct | PENDING |
| G1-10 | User creation failure leaves no partial user/membership | database transaction evidence | PENDING |
| G1-11 | Agent creation in Workspace B | Partner.workspace_id + ReferralLink.workspace_id = B | PENDING |
| G1-12 | Influencer creation in Workspace B | Partner.workspace_id + ReferralLink.workspace_id = B | PENDING |
| G1-13 | Agent/influencer creation with unauthorized workspace is rejected | 403 and no record | PENDING |
| G1-14 | Workspace A cannot read/update Workspace B commercial records | existing Q1 negative harness | PENDING |
| G1-15 | Existing lead/quote/order/payment/invoice/revenue/commission behavior remains unchanged | typecheck + lint + regression evidence | PENDING |

## Non-goals

Gate 1 does not claim:

- full RBAC acceptance;
- full shared-SaaS acceptance;
- payment/revenue acceptance;
- automated commission acceptance;
- production deployment acceptance;
- browser/device acceptance;
- that a successful build alone proves the contract.

Those remain governed by their existing phase gates.

## Preservation rule

No existing commercial state machine, migration history, reconciliation logic, Q1 workspace boundary, CI-only policy, or previously accepted behavior may be removed or weakened to satisfy Gate 1.

## Verification command policy

For this increment, repository validation is limited to the currently authorized code-quality checks:

- npm run typecheck
- npm run lint

The existing Q1 two-workspace negative harness remains the behavioral security test and requires an isolated authenticated test environment. It must not be pointed at production.