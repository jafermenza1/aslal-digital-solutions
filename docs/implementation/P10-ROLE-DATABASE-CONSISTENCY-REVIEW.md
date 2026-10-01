# P10 Role, Database Relation & Consistency Review

## Review scope
Reviewed UserRole, WorkspaceRole, User, WorkspaceUser, Workspace, Partner, permission resolution, workspace authorization, user administration UI/API, and multi-business partner boundaries.

## Database relationship model

```text
User
 ├── UserRole              account-level role
 ├── permissions           account-level overrides
 ├── partnerId ─────────── optional Partner identity
 └── WorkspaceUser[]
       └── WorkspaceRole   membership-level role
             └── Workspace

Partner
 └── currently has workspaceId (legacy/home workspace relationship)

PartnerProgram / Order / Commission / Payout
 └── workspaceId           business ownership boundary
```

## Finding 1 — confirmed: two role layers exist, but authorization is account-role driven

`User.role` is used by `resolvePermissions()` and `authorizePermission()`. `WorkspaceUser.role` is stored and displayed, but `authorizeWorkspacePermission()` currently checks only the user's account permissions and whether the user belongs to the requested workspace.

Therefore a user can have, for example, account role `FINANCE` and workspace membership role `SALES`, while still receiving the FINANCE permission set inside that workspace.

This is a consistency/security concern because the database says the user has a workspace-specific role while authorization does not use that role as a permission boundary.

### Required target behavior
`UserRole` should define the user's maximum account capability; `WorkspaceRole` should define the capability allowed inside each workspace. Effective workspace permissions should be the intersection/cap of both layers.

Conceptually:
`effective workspace permissions = account-role permissions ∩ workspace-role permissions`, plus explicitly approved overrides that never exceed the account/workspace safety ceiling.

Do not silently delete WorkspaceRole. It is valuable for multi-business access control. It should become authoritative for workspace-scoped authorization.

## Finding 2 — confirmed: P8 global partner identity is still contradicted by legacy workspace checks

The Partner model still contains mandatory `workspaceId`, which can be retained as a home/registration workspace if needed. However, commerce code still calls `requireSameWorkspace(access.workspace.id, referral.workspaceId, referral.partner.workspaceId)` and equivalent payment checks.

This contradicts the P8 architecture in which a partner is a network identity that may participate in programs from multiple businesses.

The correct boundary is:
- referral link belongs to Business A;
- program/contract belongs to Business A;
- order/revenue/commission belongs to Business A;
- partner identity may originate from another/home workspace;
- partner must not be required to have the same home workspace as Business A.

Therefore `partner.workspaceId` must not be used as the authorization boundary for cross-business partner participation. ReferralLink/Program/Contract/Order workspace ownership remains the boundary.

## Finding 3 — confirmed: User Management UI exposes a workspace role during account editing even though the account PATCH endpoint does not change membership

The account-role API updates `User.role` and permissions. Workspace membership is managed separately through Workspace Administration. The edit form nevertheless displays an editable Workspace role while editing an existing user.

This creates a misleading control: the user can change a value that is not applied by the account PATCH operation.

Required UX:
- account edit: account role + account permissions only;
- workspace administration: workspace membership + WorkspaceRole only;
- creation may select the initial workspace and initial membership role because creation creates both records.

## Finding 4 — role naming is duplicated but not inherently wrong

`ADMIN` exists in both UserRole and WorkspaceRole; `PARTNER` also exists in both. This is acceptable because they describe different scopes.

The problem is not the duplicate enum values. The problem is failing to clearly enforce their scopes.

Recommended naming in code/docs:
- Account Role / UserRole
- Workspace Role / WorkspaceRole

## Finding 5 — role-to-workspace mapping is currently opinionated and should be treated as a default, not equality

The UI maps account roles to initial workspace roles, for example BUSINESS_OWNER → MANAGER and PARTNER → PARTNER.

This is useful as a creation default, but it must not imply that every account role has exactly one workspace role. A person may be a Finance user in Business A and an Auditor in Business B.

Therefore workspace role must remain independently assignable after membership creation.

## Role matrix target

| Account role | Typical maximum capability | Valid workspace roles |
|---|---|---|
| SUPER_ADMIN | Platform administration | ADMIN/OWNER |
| ADMIN | Administration | ADMIN/OWNER/MANAGER |
| BUSINESS_OWNER | Business ownership | OWNER/MANAGER |
| SALES_MANAGER | Sales management | MANAGER/SALES |
| SALES_OPERATOR | Sales execution | SALES |
| MARKETING_OPERATOR | Marketing/channel operations | MANAGER/MEMBER |
| PARTNER_MANAGER | Partner network operations | MANAGER |
| PARTNER | External partner participation | PARTNER |
| FINANCE | Financial operations | FINANCE |
| AUDITOR | Read-oriented oversight | AUDITOR |
| CLIENT | Client-facing access | CLIENT |

`MEMBER` should be the low-privilege fallback, not a role that accidentally grants internal management capabilities.

## Recommended implementation sequence

1. Introduce a single workspace-role permission map.
2. Make `authorizeWorkspacePermission()` enforce both account role and WorkspaceRole.
3. Audit direct `authorizePermission()` calls that subsequently operate on workspace-owned records; convert them to workspace-aware authorization where appropriate.
4. Separate account-role editing from workspace-membership editing in the UI.
5. Preserve independent membership roles per workspace.
6. Remove `partner.workspaceId` from cross-business authorization decisions while retaining it only as home/registration metadata if the product needs it.
7. Add controlled tests for one user belonging to two businesses with different WorkspaceRoles.
8. Add controlled tests proving a partner from Business A can participate in Business B without Business B gaining access to A's private records.

## Current assessment

**Database model:** structurally capable of supporting the roadmap, but the two role layers are not yet consistently enforced.

**Authorization model:** account-role permissions are currently stronger than WorkspaceRole membership, which should be corrected before broad multi-business rollout.

**Partner model:** still contains legacy home-workspace coupling that conflicts with the P8 network identity design.

**UI:** mostly communicates the two concepts, but existing-user editing should stop presenting workspace-role changes as account-role changes.

**Roadmap impact:** these are foundational P10/P8.4 security/identity concerns and should be corrected before adding more roles or duplicating permission concepts.