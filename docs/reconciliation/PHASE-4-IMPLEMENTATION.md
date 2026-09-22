# Phase 4 — Conversations and Channel Adapters

## Scope

Relevant traceability IDs: R13, R14, R15, R16, R17, R18, R29, R12.

## Implemented foundation

- Conversation is the canonical channel-level thread.
- Message is the canonical inbound/outbound communication record.
- Supported channels are Email, SMS, Telegram, WhatsApp, and Messenger.
- ChannelAccount separates provider/account identity from CRM records.
- CommunicationPreference stores explicit channel permission and global opt-out state.
- Human handoff is a first-class Conversation state with an owner.
- Signed inbound webhook boundary records provider messages without fabricating a Person identity.
- Outbound messaging is consent-gated and records provider success/failure.
- Customer/lead journey linkage can be attached to a conversation without making channel identity the source of truth.
- Channel adapter dispatch is isolated in lib/messaging.ts rather than spread across CRM routes.
- Telegram, WhatsApp, Messenger, SMS, and Email adapters use environment-configured provider credentials/endpoints.

## Identity and safety

Inbound activity may be recorded against a known Person/Lead/Customer when a trusted provider mapping supplies that relationship. Otherwise the conversation remains unclaimed and does not create a Person.

Outbound messaging is denied when no explicit channel permission exists or global opt-out is active.

Human handoff changes the conversation state to HUMAN_HANDOFF and assigns the current authenticated operator. The outbound route refuses messages from other operators while the handoff is active.

## Provider boundary

The implementation deliberately keeps provider credentials out of the database. Provider/API credentials are environment configuration.

The Email and SMS adapters use configurable HTTP provider endpoints. Telegram, WhatsApp, and Messenger use their official API boundaries. Provider-specific webhook payloads must be normalized into the canonical webhook contract before reaching the CRM webhook route.

## Controlled acceptance UI

The authenticated dashboard page `/dashboard/acceptance/phase-4` is the Phase 4 control room. It is intentionally split into two paths:

- **Controlled simulation suite:** requires `PHASE4_ACCEPTANCE_MODE=true`; exercises consent gating, simulated outbound persistence, channel revocation, global opt-out, human handoff, signed inbound, invalid signatures, unknown-sender identity protection, webhook retry idempotency, and CRM message activity without contacting an external provider.
- **Live provider test:** explicitly sends through the selected configured provider using the same channel adapter boundary. Run only against an address/chat controlled by the operator.

The test runner creates records tagged with `acceptanceTest` metadata so acceptance evidence can be distinguished from ordinary customer traffic. It also exposes the Conversation ID, Message IDs, channel, status and timestamp through the dashboard/API response rather than presenting provider secrets.

## Controlled acceptance workflow

1. Migrate the Phase 4 conversation schema in the target environment.
2. Confirm CI typecheck, lint and production build are green.
3. Set `PHASE4_ACCEPTANCE_MODE=true` only in the controlled acceptance environment.
4. Open `/dashboard/acceptance/phase-4` as an authenticated operator.
5. Select a Lead already linked to a trusted Person and choose one channel.
6. Run the **safety + webhook suite** and require every result to PASS.
7. For each provider whose credentials/sender identity/callbacks are configured, run one explicit live test against an operator-controlled recipient.
8. Confirm the resulting Message is `SENT` or `FAILED`, the Conversation has the expected channel/status, and the Customer/Lead timeline contains message activity.
9. Verify production health after deployment and retain the acceptance evidence (Conversation ID, Message ID, channel, status, timestamp, provider response).
10. Disable `PHASE4_ACCEPTANCE_MODE` outside the controlled acceptance environment.

## Acceptance gates

Phase 4 remains IMPLEMENTED-UNVERIFIED until:
1. CI typecheck/lint/build succeeds;
2. the conversation migration applies safely;
3. inbound webhook signature verification is proven;
4. inbound messages are persisted without identity fabrication;
5. known identity mapping links to the correct CRM record;
6. outbound messages are consent-gated;
7. provider success/failure states are persisted;
8. human handoff prevents competing automated/human ownership;
9. customer/lead timeline includes message activity;
10. Telegram and Email provider configuration is exercised end-to-end;
11. WhatsApp, Messenger, and SMS provider configurations are exercised end-to-end;
12. opt-out blocks outbound delivery;
13. low-bandwidth/retry-safe behavior is verified;
14. production health remains healthy after deployment.

## External dependency status

Actual provider credentials, webhook registration, templates, sender identities, and provider-side permissions are environment/platform dependencies. The repository now has the adapter boundary and canonical storage; provider verification cannot be claimed until those external credentials and callbacks are configured and tested.

## Non-goals

Workflow automation engine, payment/order abstraction, campaign/post attribution expansion, and AI remain outside Phase 4.
