# Telegram Partner Agent Workbench

## Purpose

The Telegram workbench gives an authenticated Aslal partner a lightweight campaign operating surface without replacing the web partner portal.

It supports:

- campaign discovery;
- campaign detail and published campaign materials;
- campaign application;
- referral-link access;
- commission and payout status;
- partner identity/status.

## Configuration

Set these production environment variables:

- TELEGRAM_BOT_USERNAME
- TELEGRAM_BOT_TOKEN
- TELEGRAM_WEBHOOK_SECRET
- NEXT_PUBLIC_SITE_URL

The webhook endpoint is:

/api/telegram/webhook

The webhook requires Telegram's X-Telegram-Bot-Api-Secret-Token header to match TELEGRAM_WEBHOOK_SECRET.

## Register the webhook

After deployment, register the bot webhook against the deployed HTTPS origin:

curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR_DOMAIN>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["message"]'

Do not commit the bot token or webhook secret.

## Partner connection

A verified partner signs into the web partner portal and selects **Connect Telegram agent workbench**.

The server generates a one-time random connection token and returns a Telegram deep link:

https://t.me/<BOT_USERNAME>?start=<ONE_TIME_TOKEN>

The partner opens the link in Telegram. The webhook consumes the token, binds the private Telegram chat to that partner record, and clears the token.

Only ACTIVE + VERIFIED partners can generate a connection token or complete the link.

## Commands

- /help
- /me
- /campaigns
- /campaign <campaign-id>
- /apply <campaign-id>
- /links
- /earnings

Campaign, referral, commission and payout queries are constrained by the partner workspace. Published campaign materials are constrained by campaign and workspace.

## Security boundary

The bot does not accept a partner ID or workspace ID from Telegram commands.

Identity comes from the server-side Telegram chat binding. Campaign operations then use the bound partner's workspace and partner ID.

The bot only accepts private-chat messages. Webhook requests without the configured Telegram secret are rejected.

## Pilot acceptance

This feature is **IMPLEMENTED / UNVERIFIED** until all of the following are proven with a real pilot account:

1. Telegram webhook registration succeeds.
2. Partner portal generates a connection link.
3. Partner successfully links Telegram.
4. /campaigns shows only that partner's workspace campaigns.
5. /campaign shows only published assets from that workspace.
6. /apply creates exactly one campaign application.
7. /links exposes only that partner's referral links.
8. /earnings exposes only that partner's commissions and payouts.
9. A second workspace's campaign/partner data cannot be returned through the bot.
