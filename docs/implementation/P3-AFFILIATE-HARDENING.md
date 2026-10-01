# P3 Affiliate Engine — Hardening Layer

## Scope

This hardening layer closes the attribution-to-money boundary for affiliate commerce.

Target chain: CLICK → VISITOR → LEAD → OPPORTUNITY → ORDER → PAYMENT → RECONCILIATION → REVENUE → COMMISSION → REFUND HOLD → PAYABLE → PAYOUT

## Deterministic attribution

Lead capture no longer treats the browser referral cookie as the final attribution decision. After the lead exists, the affiliate engine evaluates the visitor's stored referral-click history against the published program terms.
For program-linked referrals, competing partner clicks are evaluated within the same program. FIRST_CLICK selects the earliest eligible click; LAST_CLICK selects the latest eligible click. The configured attribution window is calculated from the qualifying event time.
LEAD_REGISTRATION and DEAL_REGISTRATION reuse the lead's locked partner attribution rather than silently replacing it with a later click.
PROMO_CODE is supported through the commerce order promoCode field when that value matches an authorized referral code used as a program promotion code. No commission is created merely because a code was supplied; payment reconciliation remains the financial qualifying boundary.

## Lead → order continuity

Order creation from an accepted quote resolves attribution from the opportunity's lead before the order is persisted. The order stores the resolved referralCode, partnerId, and referralLinkId, plus an optional promoCode.
This prevents a later browser cookie from changing the partner after a lead has already been registered.

## Self-referral and duplicate customer controls

Before an attributed order is created, the system compares the attributed partner's email/phone against the customer email/phone. A match blocks partner attribution for that order so the sale cannot generate a self-referral commission.
When converting a quote without an existing customer, the order flow first searches the workspace for an existing customer with the lead email or phone and reuses that record instead of creating a duplicate.

## Refund hold

A reconciled affiliate commission is created as QUALIFIED and receives eligibleAt calculated from the payment confirmation time plus the active program's published refundHoldDays.
Administrative approval and payout selection reject commissions whose eligibleAt is still in the future. Reversal/refund continues to void the linked commission and reverse recognized revenue.

## Why you earned this

Partner earnings now return an explanation containing: program name and terms version; referral code and attribution policy; attribution window; qualifying event; refund hold; payout schedule; reward type, fixed amount/rate; order number; payment and reconciliation status; and commission eligibility time.
The partner portal displays this as Why you earned this, so a partner can trace an earning to the published commercial rule rather than seeing an unexplained balance.

## Idempotency and competing partners

Payment creation continues to require the existing unique payment idempotency key. Reconciliation refuses a payment already reconciled. Commission creation remains unique by revenue and payment.

The deterministic attribution test matrix must cover:

1. one partner, one click, paid sale;
2. two partners, FIRST_CLICK;
3. two partners, LAST_CLICK;
4. click outside the configured window;
5. explicit promo code;
6. lead-registration attribution;
7. self-referral;
8. duplicate customer email/phone;
9. duplicate payment/webhook;
10. refund before eligibility;
11. refund after eligibility;
12. multi-workspace isolation.

## Runtime acceptance

The branch is implementation-complete for this hardening layer, but runtime acceptance requires the application's configured MySQL environment.
Run manually from the application environment:

    npx prisma generate
    npx prisma migrate deploy
    npm run typecheck
    npm run lint
    npm test

Then execute a controlled paid-sale fixture and retain evidence for each lifecycle state. CI remains intentionally disabled per project direction.