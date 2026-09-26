# Telegram Public Experience — Telegram-side setup

The application now supports a public, no-login/no-registration Telegram experience. Telegram configuration is still required outside the repository.

## 1. BotFather

In @BotFather for the production bot:

1. Keep the bot username in `TELEGRAM_BOT_USERNAME`.
2. Keep the bot token in `TELEGRAM_BOT_TOKEN`; never place it in the dashboard or frontend.
3. Set the bot name, profile photo, short description and description to match the public Aslal catalog.
4. Configure the public commands:
   - `/start` — open the public menu
   - `/help` — public help
   - `/catalog` — open catalog
   - `/pricing` — show pricing
   - `/support` — request human support
5. Configure the Mini App/menu button with the deployed HTTPS Mini App URL. The repository can also set the menu button through the Bot API, but BotFather is the simplest initial setup.
6. If Inline Mode is enabled, run `/setinline` and set a useful placeholder such as `Search Aslal products and services…`.
7. If the bot is added to an admin group, add it with permission to send messages. Record the group/supergroup chat ID in the dashboard Human Handoff tab.
8. Set the webhook to the deployed route:
   `https://<production-domain>/api/telegram/webhook`
   using the same secret value as `TELEGRAM_WEBHOOK_SECRET`.
9. Configure webhook allowed updates to include at least:
   `message`, `callback_query`, and `inline_query`.
   If Telegram Payments are enabled later, also include the payment update types required by the selected payment flow.

## 2. Mini App

The deployed Mini App must be HTTPS and reachable publicly without an Aslal login.

Current application URL:

`/telegram/catalog?workspaceId=<workspaceId>&campaignId=<optional>`

The bot's public default workspace is selected by:

`TELEGRAM_DEFAULT_WORKSPACE_ID`

The Mini App must not rely on a dashboard session.

Telegram Mini Apps support launching directly from the bot menu and inline buttons. Use the same production origin configured in the Telegram dashboard. citeturn1search1turn0search0

## 3. Inline Mode

Inline Mode is disabled by default in the application.

If enabled in the Telegram dashboard:

- enable Inline Mode with @BotFather using `/setinline`;
- use `@YourBot <product/service search>` in any supported chat;
- the application returns catalog results and a link back to the Mini App.

Telegram documents that Inline Mode is enabled through @BotFather's `/setinline` command. citeturn0search8

## 4. Payments

Do not paste payment provider secrets into the Telegram dashboard.

For Telegram Payments, connect the selected provider through BotFather's Bot Settings → Payments and store the resulting provider token only in the server-side deployment secrets. Telegram's documented flow uses BotFather to connect a payment provider and then the provider token with the Bot API. citeturn0search1turn0search3

For Chapa, Telebirr and CBE Birr, keep provider credentials and webhook verification in the server-side payment adapter layer. The Telegram UI only selects which configured adapter may be offered.

For digital goods/services sold through Telegram's native payment flow, Telegram documents Telegram Stars (XTR) as the payment currency. citeturn0search4

## 5. Webhook

Use the application's existing signed webhook boundary. Telegram supports a webhook `secret_token` and sends it as `X-Telegram-Bot-Api-Secret-Token`; the application already validates this header. citeturn1search0

After deployment, verify the webhook with Bot API `getWebhookInfo`. Confirm:

- URL is the production webhook;
- pending updates are not continuously increasing;
- there is no recent webhook error;
- callback queries and inline queries arrive after their respective features are enabled.

## 6. Public experience rule

Do not enable Telegram Login for this public bot experience. The intended path is:

Telegram user → /start → public menu → catalog / qualification / pricing / support

No Aslal account registration is required.

Telegram identity is used only as channel context; the application creates/updates canonical Person/Lead records when a commercial action requires it.
