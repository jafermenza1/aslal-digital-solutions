# Telegram Catalog & Commerce Foundation

## Status

**Implemented / unverified.** This is the first deterministic foundation for a Telegram Mini App catalog. Live Telegram webhook, Mini App launch, payment-provider callback, and production acceptance still require controlled verification.

## Architecture

The Telegram catalog does not create a second commerce system. It reads the workspace-scoped Aslal product/resource catalog and enters the existing commercial chain:

`Telegram → workspace/campaign/partner attribution → product/resource → lead/order → payment PENDING → Finance reconciliation → revenue → commission/payout`

### Catalog

- Products and resources are exposed through `/api/telegram/catalog`.
- Catalog queries require a workspace context.
- Products can expose:
  - media
  - specifications
  - starting price
  - CTA
  - provider/relationship
- Resources can expose:
  - media
  - specifications
  - CTA
  - download/resource context
  - provider/relationship
- Campaign context can narrow the catalog.

### Mini App

The first TMA-ready page is:

`/telegram/catalog?workspaceId=<workspace>&campaignId=<optional>`

It loads Telegram WebApp context when opened inside Telegram and provides:

1. catalog browsing;
2. detail/specification view;
3. media preview;
4. order/request CTA;
5. checkout handoff.

### Attribution

Checkout never treats browser-supplied partner/campaign identifiers as authoritative.

The order endpoint resolves Telegram destination context by:

- workspace;
- Telegram chat ID;
- partner;
- referral code;
- campaign.

A valid workspace/campaign/referral relationship is retained on the order.

### Payment boundary

Telegram checkout creates an Aslal order and a **PENDING** payment record for priced products.

It does **not** mark payment as confirmed.

Provider-specific Chapa, Telebirr, CBE Birr, or Telegram Payments integration must enter through the existing payment boundary and webhook verification/reconciliation controls. Finance remains the source of truth for confirmation and reconciliation.

Products without a reliable fixed price are routed to the sales/request path instead of inventing a payable amount.

## Next implementation stages

1. Generate signed Telegram deep links carrying workspace/campaign/partner context.
2. Add Telegram inline buttons and Mini App launch keyboard.
3. Add deterministic public state-machine qualification.
4. Add provider adapters for Chapa/Telebirr/CBE Birr behind the existing payment contract.
5. Add verified payment webhooks and idempotency.
6. Add admin live-chat/order/payment alerts.
7. Add partner analytics and commission visibility inside Telegram.
8. Add AI only behind the deterministic fallback boundary.

## Acceptance evidence required

A real controlled pilot must prove:

- Mini App opens from Telegram.
- Workspace is preserved.
- Partner/campaign referral is preserved.
- Product/resource media and specifications render.
- CTA creates the correct lead/order context.
- Payment starts as PENDING.
- Provider callback cannot bypass reconciliation.
- Confirmed/reconciled payment reaches revenue and commission qualification.
- Cross-workspace access is rejected.
- No manual copying is required.
