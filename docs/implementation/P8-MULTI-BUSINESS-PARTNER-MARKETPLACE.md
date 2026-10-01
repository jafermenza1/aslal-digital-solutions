# P8 — Multi-Business Partner Marketplace

## Objective
Turn the partner engine into a two-sided network where one partner identity can discover, apply to, join, promote, and track programs owned by multiple independent business workspaces.

## Existing foundation reused
P8 builds on PartnerProgram/ProgramTerms/CommissionContract, P1 partner identity and verification, P3 attribution, P4 agent deal registration, P5 reseller commerce and share links, and P6/P7 financial/payout ledgers.

## Core boundary
A Partner is a global network identity. A PartnerProgram belongs to exactly one Workspace. A CommissionContract represents the partner's participation in that business's program and stores the business workspace ID. ReferralLink is also workspace-owned. Leads, orders, revenue, commissions, payouts, reseller agreements, and applications remain workspace-scoped.

The partner's legacy/home Partner.workspaceId is not used as a restriction on cross-business program participation or referral attribution.

## Marketplace discovery
GET /api/partner/marketplace supports search and category filters and returns only:
- PUBLISHED programs;
- programs belonging to active workspaces;
- standardized marketplace profile fields;
- active program terms;
- safe business identity;
- participant count;
- partner eligibility;
- whether the current partner already participates;
- standardized trust indicators.

No business leads, customers, orders, commissions, payouts, internal campaign data, or private application notes are exposed.

## Standardized offer
MarketplaceProgramProfile provides category, headline, offer summary, partner benefits, eligibility summary, support description, logo, featured flag, and display order. Program terms remain the authoritative commercial terms.

## Applications
PartnerProgramApplication is workspace-owned and unique per program/partner. It captures a partner snapshot at application time. OPEN programs may auto-approve through the application endpoint. BUSINESS_APPROVAL, VERIFICATION_REQUIRED, and INVITATION_ONLY remain review-controlled according to the program's admission policy.

Business review:
- GET /api/admin/partner-engine/applications
- PATCH /api/admin/partner-engine/applications/:id with APPROVE or REJECT

Approval creates the CommissionContract using the currently active published terms and the program's workspace.

## Cross-business dashboard
GET /api/partner/marketplace/dashboard returns only the authenticated partner's own:
- program participations;
- applications;
- commission summary;
- payout summary;
- business/program groupings.

It does not return another partner's information and does not expose private business records.

## Attribution continuity
P8 removes the incorrect assumption that Partner.workspaceId must equal ReferralLink.workspaceId. P3 referral resolution continues to require:
- referral link workspace;
- published program;
- active partner;
- active contract for the program;
- workspace-scoped campaign/program relationships.

This allows one partner to have separate attribution links for multiple businesses.

## Trust indicators
Marketplace trust indicators are descriptive platform facts, not subjective ratings:
- Active business workspace;
- Published program;
- Active commercial terms;
- Platform-listed offer.

P8 does not invent customer ratings or claim external verification.

## Acceptance / exit condition
1. Business A publishes a program.
2. Business B publishes a separate program.
3. One active partner can discover both.
4. The partner can join/apply to each according to each program's admission rules.
5. Each participation creates a contract owned by that program's workspace.
6. Referral links created for Business A cannot be used to read Business B's private data.
7. Attribution for Business A remains inside Business A's workspace.
8. The partner dashboard aggregates the partner's own participation across both businesses.
9. Business A administrators cannot read Business B applications or financial records.
10. No endpoint uses the partner's home workspace as a substitute for the program's workspace.

## Runtime certification
Run:
```bash
npx prisma generate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm test
```

Then manually verify two-workspace scenarios: discovery, application, approval, join, referral redirect, attribution, dashboard isolation, and unauthorized cross-workspace admin access.
