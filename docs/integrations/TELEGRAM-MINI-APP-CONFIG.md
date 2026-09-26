# Telegram Mini App / Catalog Configuration

## Purpose

The Telegram Mini App is a presentation/channel layer over the existing Aslal commercial domains. It does not create Telegram-specific Product, Order, Payment, Revenue, or Commission records.

Workspace administrators configure the Telegram channel through `/dashboard/telegram`.

## Configuration groups

- Channel: enabled state, Mini App URL, menu button, default page, locale and workspace/auth requirements.
- Catalog: products, resources, categories, search, featured items, specifications, gallery/media, related items, availability, price and stock visibility.
- Commerce: inquiry, add-to-order, direct order, checkout, customer identity, phone/delivery requirements, sales approval and order confirmation mode.
- Payment: enablement, allowed methods, default method, currency, payment-before-confirmation, pay-later, expiry and receipt behavior.
- Attribution: Telegram start parameters plus campaign, partner and referral attribution preservation and expiry.
- Customer/lead creation: create/resolve customer on commerce actions and create a lead for inquiries.
- Appearance: title, logo, theme and workspace branding.

## Runtime contract

Telegram resolves the workspace first and then reads `TelegramChannelConfig`.

When the Mini App is disabled, `/start` and `/catalog` do not open a broken or unconfigured Mini App. An unscoped `/start` no longer falls back to a fabricated workspace ID; it requires either a linked partner/workspace or the optional `TELEGRAM_DEFAULT_WORKSPACE_ID` environment setting.

When enabled, the bot uses `miniAppUrl` when configured, otherwise the standard `/telegram/catalog` path, and passes workspace/campaign context according to the attribution settings.

## Canonical commercial path

The future Mini App must use the existing canonical records:

Telegram Mini App → Product/Resource → CTA → Customer/Lead → Opportunity/Quote → Order → Payment → Reconciliation → Revenue → Commission.

Partner/referral/campaign attribution must remain attached to the same canonical journey.

## Migration

Migration:

`prisma/migrations/20260926150000_telegram_mini_app_config/migration.sql`

Apply it normally through the repository's existing Prisma migration process. Do not reset production data.

## Validation

Per the current repository validation policy, run:

- `npm run typecheck`
- `npm run lint`

Build/deployment validation remains separate from this increment.
