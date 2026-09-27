# Telegram identity, login, and conversation continuity

## Purpose

Telegram should be treated as a durable identity and communication channel, not only as a message transport.

The identity layer now separates:

- Telegram identity: verified Telegram user/chat identity.
- Anonymous/public status: a person can browse without registering.
- CRM identity: Person/Lead/Customer when enough commercial context exists.
- Internal identity: User/Partner when an existing Aslal account is linked.
- Activity continuity: catalog views, order starts, orders, and inbound conversation events can be associated with the same Telegram identity.

## User journey

```
Telegram user
   |
   +-- /start ------------------------------+
   |                                        |
   +-- Catalog / Mini App ------------------+--> TelegramIdentity
   |                                        |       |
   +-- Product view ------------------------+       +--> Visitor
   |                                                +--> Lead (when created)
   +-- Order / restock ----------------------        +--> Customer (when created)
   |                                                +--> Partner/User (when already linked)
   +-- Reply to bot -------------------------        |
   |                                                +--> Conversation
   |
   +-- Log in with Telegram -----------------------> existing Aslal User session
```

A public Telegram visitor does **not** become an Aslal portal user merely by browsing. The system can remember the verified Telegram identity and activity without granting dashboard access.

## Security

Mini App identity uses Telegram's server-side `initData` HMAC validation. Never trust `initDataUnsafe` for authorization.

The website LoginUrl bridge validates Telegram's signed login parameters before creating an Aslal session. It only creates a dashboard session when the Telegram identity already belongs to an active Aslal User.

The system does not automatically create an internal staff/admin account from a Telegram account.

## Required configuration

Existing bot configuration remains required:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_DEFAULT_WORKSPACE_ID`
- `NEXT_PUBLIC_SITE_URL`

Optional website/bot login configuration:

- `TELEGRAM_LOGIN_ENABLED=true`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=<bot username>`

For Telegram LoginUrl to work, the production domain must be linked/configured for the bot in BotFather.

## Continuity behavior

### Anonymous/public visitor

A Telegram user can:

1. Open the bot.
2. Browse the catalog.
3. View products/services.
4. Start an order.
5. Leave a restock request.
6. Return later with `/start`.
7. Continue the same context without registering first.

Catalog product views are recorded against a Visitor through the workspace-scoped TelegramIdentity.

### Lead

When an order, inquiry, qualification, or other configured commercial action creates a Lead, the TelegramIdentity stores the Lead and Person references.

Subsequent bot replies resolve the existing Lead instead of creating an unrelated conversation.

### Customer/order

When the catalog order workflow creates a Customer and Order, the identity is synchronized again. Returning to Telegram can therefore surface recent order context.

Order creation still does **not** mean payment is confirmed. Payment/reconciliation/revenue remain separate Q1 stages.

### Conversation

Inbound Telegram messages continue to create/update the Telegram Conversation and activate human handoff. Marketing follow-ups remain suppressed after customer reply/handoff.

## Website login

The bot can expose a Telegram LoginUrl button. A user who is already linked to an active Aslal User can authenticate into the existing Aslal dashboard session.

A public Telegram visitor who is not an Aslal User is identified and returned to the public Telegram catalog instead of receiving dashboard privileges.

This preserves the distinction between:

- Telegram identity
- public customer identity
- authenticated Aslal workspace user

## Future extensions

The identity layer is intentionally designed to support:

- Telegram OIDC login for the website.
- Customer/partner portal sessions separate from staff dashboard sessions.
- Mini App `startapp` attribution and campaign continuity.
- Verified Telegram phone sharing where the user explicitly consents.
- Callback/button event attribution.
- Rich-message engagement analytics.
- Telegram-native payment and invoice flows.
- Cross-channel identity resolution (email/phone/Telegram) with explicit matching rules.
