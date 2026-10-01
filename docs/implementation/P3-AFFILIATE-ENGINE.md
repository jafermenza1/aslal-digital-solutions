# P3 — Affiliate Engine

## Objective

P3 turns the P1/P2 referral identity into a controlled affiliate acquisition engine. A referral link is a measurable partner identity, every click is recorded, the browser retains the referral identity, and attribution is resolved using the Partner Program's published policy and attribution window.

## Implemented

- Public referral endpoint: `/go/[code]`.
- Workspace-scoped referral-link lookup.
- Partner account validation before accepting a program-linked referral.
- Published-program validation for P2-linked referral links.
- Click event recording with hashed forwarded IP and bounded user-agent storage.
- Safe internal destination handling; external redirect injection is rejected.
- 30-day browser referral cookie for subsequent lead/order attribution.
- Browser attribution now exposes `referralCode` to existing lead/resource capture workflows.
- Deterministic attribution resolver in `lib/affiliate-engine.ts`.
- FIRST_CLICK and LAST_CLICK use recorded clicks inside the published attribution window.
- LEAD_REGISTRATION, DEAL_REGISTRATION and PROMO_CODE are explicit policy outcomes rather than silently being treated as last-click.
- Program-linked attribution requires an active CommissionContract, preserving the P2 commercial admission boundary.
- P3 unit coverage for attribution policy handling.

## Attribution truth

The resolver does not select a partner merely because a referral code exists. It verifies workspace ownership, active partner status, published program state, active contract state, and the applicable attribution window.

Payment commission calculation remains downstream of the existing financial reconciliation path. P3 does not bypass payment confirmation or create an early payable state.

## Acceptance flow

1. Partner has an active P2 CommissionContract.
2. Partner referral link resolves through `/go/{code}`.
3. Click is recorded.
4. Browser receives the referral identity cookie.
5. Visitor submits a lead or proceeds to commerce.
6. Attribution resolver evaluates the program's policy and window.
7. The resulting partner/link/campaign/program/terms identity is available for the downstream attribution and commission chain.

## Next P3 work

The remaining P3 hardening is controlled runtime certification: verify real clicks, cross-page cookie persistence, lead capture, order attribution, duplicate payment webhook behavior, refund handling, two-partner attribution determinism, and self-referral controls against the deployed database.