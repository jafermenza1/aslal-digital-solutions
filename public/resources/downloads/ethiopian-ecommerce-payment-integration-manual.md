# Ethiopian E-Commerce & Payment Integration Manual

## Scope
Plan local payment integration for custom websites, Shopify and web applications.

## Gateway checklist
1. Confirm the merchant onboarding requirements of the selected gateway.
2. Define the order state machine before connecting callbacks.
3. Keep payment initiation separate from payment confirmation.
4. Verify callback authenticity and make confirmation idempotent.
5. Store provider reference, amount, currency, status and timestamps.
6. Reconcile confirmed payments against orders before recognizing revenue.

## Telebirr / Chapa / CBE Birr
Treat each provider as an adapter behind one internal payment interface. Keep provider-specific credentials and callback verification outside the storefront UI.

## Shopify
Use an approved payment integration or application extension where supported. Do not place secret credentials in theme JavaScript.

## Custom applications
Recommended flow:
Checkout -> Payment initiated -> Provider callback -> Signature/status verification -> Payment confirmed -> Reconciliation -> Revenue.

## Production checklist
- HTTPS everywhere
- server-side secrets only
- idempotent callbacks
- duplicate-event protection
- failed/reversed/refunded states
- reconciliation report
- customer confirmation
- audit trail

This is an implementation planning guide, not provider-specific legal or contractual advice.