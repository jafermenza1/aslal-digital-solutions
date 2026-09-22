# Phase 4 — Conversations and Channel Adapters

## Scope

## Phase 4 staging decision

Phase 4 is explicitly split into two implementation/acceptance tracks:

- **Phase 4A — Provider-neutral messaging foundation and simulation acceptance:** the CRM conversation/message model, consent and opt-out enforcement, human handoff, signed inbound boundary, idempotency, activity/timeline integration, adapter boundary, and controlled simulations can be validated without configuring external providers.
- **Phase 4B — Provider integrations:** real provider credentials, sender identities, provider-specific webhook registration/normalization, templates/permissions, delivery callbacks, and controlled live end-to-end channel tests will be revised and implemented later, after a separate provider-requirements/configuration pass.

**Phase 4B is intentionally deferred for now.** This is a sequencing decision, not a claim that provider integrations are complete or accepted. The Phase 4 main status remains IMPLEMENTED-UNVERIFIED.

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

## PRD gap closure added

The repository now also includes `/dashboard/conversations`, a unified operator communication center backed by the canonical Conversation/Message records. It provides channel/status filtering by conversation selection, message history, human handoff/release controls, and consent-gated outbound sending through the existing adapter boundary. The dashboard navigation exposes this workspace.

This closes the Phase 4 CRM/operator workspace gap identified by PRD sections 16, 17, 28 and 53 at the UI/workflow layer. It does not claim provider-side API verification.

## Phase 4B deferred provider-integration record

Phase 4B will be revised after the current Phase 4A acceptance work is complete and after provider requirements are gathered. The revised Phase 4B record will cover, per provider: account/business setup and eligibility; sender identity and destination addressing; API credentials; provider-specific webhook verification and signatures; inbound normalization; outbound API behavior; delivery/read/failure callbacks; templates and approval rules; unsubscribe/opt-out; rate limits and retry/error semantics; controlled test recipients; production acceptance evidence; and rollback/disable procedures.

Provider-specific requirements must be verified against the selected provider documentation and account configuration before implementation. No provider is considered configured or accepted merely because an adapter exists in the repository.

## Remaining PRD-aligned gaps before Phase 4 can be accepted

- Provider-specific inbound webhook normalization/registration remains external-provider work; the canonical signed webhook contract is implemented, but real provider payload callbacks must still be mapped and verified.
- Email/SMS template storage, variables and unsubscribe workflows are not yet a full template subsystem.
- Telegram qualification/lead-capture bot behavior is not yet implemented as a complete bot workflow.
- WhatsApp approved-template handling and Meta provider callback verification remain external/provider-specific acceptance work.
- Messenger inbound business-messaging flow remains provider-specific acceptance work.
- Delivery-status callbacks are not yet normalized into `DELIVERED`/failure transitions for every provider.
- Coordinated automated follow-up, delays, branching and cancellation remain Phase 5 automation-engine scope and are intentionally not implemented here.
- Social engagement capture is outside the current canonical messaging implementation and remains a later reconciliation item where platform APIs permit it.

## Controlled acceptance UI

The authenticated dashboard page `/dashboard/acceptance/phase-4` is the Phase 4 control room. It is intentionally split into two paths:

- **Controlled simulation suite:** requires `PHASE4_ACCEPTANCE_MODE=true`; exercises consent gating, simulated outbound persistence, channel revocation, global opt-out, human handoff, signed inbound, invalid signatures, unknown-sender identity protection, webhook retry idempotency, and CRM message activity without contacting an external provider.
- **Live provider test:** explicitly sends through the selected configured provider using the same channel adapter boundary. Run only against an address/chat controlled by the operator.

The test runner creates records tagged with `acceptanceTest` metadata so acceptance evidence can be distinguished from ordinary customer traffic. It also exposes the Conversation ID, Message IDs, channel, status and timestamp through the dashboard/API response rather than presenting provider secrets.

## Phase 4A provider-neutral checklist coverage

The simulation suite now runs the canonical acceptance checklist across **all five channels** in one controlled run: Email, SMS, Telegram, WhatsApp, and Messenger. It does not call external providers.

The suite proves the following, with fresh database reads after each relevant operation:

| Checklist area | Automated evidence |
|---|---|
| Inbound channel simulations | One signed inbound simulation for each of the five channels |
| Webhook security | Valid signature accepted; invalid, missing, and tampered signatures rejected before persistence |
| Replay safety | Exact webhook replay returns duplicate and does not create a second Message or Activity |
| Identity | Explicit known Person, Lead, and Customer mappings are retained; unknown sender remains unclaimed |
| Conversation Center data | Conversation, message history, channel, status and timestamps are re-read from canonical tables |
| Timeline | Inbound, successful outbound, and failed outbound message activities are persisted |
| Consent | Selected channel can be enabled and revoked; all five channel permissions are checked independently |
| Global opt-out | Global opt-out blocks outbound permission for all five channels |
| Outbound success | Adapter boundary returns deterministic simulated success; Message persists as SENT with sentAt |
| Outbound failure | Adapter boundary returns deterministic failure; Message persists as FAILED with failure activity |
| Human handoff | HUMAN_HANDOFF and assignedTo persist; a different operator is rejected by the same shared outbound gate |
| Handoff release | Conversation returns to OPEN and assignedTo becomes null |
| Closed lifecycle | CLOSED state persists and the shared outbound gate rejects sending; inbound on the closed external thread creates a new OPEN conversation under the current policy |
| State integrity | Fresh reads confirm Conversation state, ownership, lastMessageAt, SENT/FAILED states and message activities |

The acceptance endpoint returns passed, failed, total, testId, conversationId, the five channels, and a named result for each scenario. The result is ok=true only when every scenario passes.

**Customer prerequisite:** the selected Lead must be linked to a Person, and that Person must have an existing Customer record for the Customer-attachment scenario to pass. This avoids silently creating or mutating a production Customer merely to make a test green.

**Persistence boundary:** browser refresh itself is not simulated by the server. The equivalent deterministic acceptance proof is a fresh database re-read of the canonical Conversation/Message/Activity records after writes; the Conversation Center then reads those same canonical records.

**Provider boundary:** simulated success/failure is implemented inside the shared adapter boundary using an explicit simulation flag. No provider credential or network call is used by the simulation suite. Real provider behavior remains Phase 4B.

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
