# Aslal Digital Solutions — Growth OS

Production-oriented starter for the Aslal Digital Solutions public website and growth platform.

## Stack

- Next.js 16.3.4
- React 19.2.8
- TypeScript 5.9.3
- Tailwind CSS 4.3
- MySQL via mysql2
- Node.js >= 22.8.0
- GitHub Actions CI
- Next standalone output for shared-hosting deployment

Next.js 16.3.4 is the current stable package used in this starter, and Next.js requires Node 20.9+; Emerald's Node 22.8.0 environment therefore satisfies the framework minimum. Tailwind's current Next.js setup uses the PostCSS plugin and `@import "tailwindcss"`. MySQL2 provides a promise API and connection pooling suitable for this architecture.

## Important

The real Aslal logo SVG/PNG has not yet been supplied separately. The header currently uses a temporary text/icon mark. Replace it with the official asset before launch. Do not redraw or alter the official logo.

## Local setup

1. Install Node.js 22.
2. Copy `.env.example` to `.env.local`.
3. Create a MySQL database.
4. Import `db/schema.sql` into that database.
5. Run `npm install`.
6. Run `npm run dev`.

## Database

Import `db/schema.sql` first. Then optionally run:

`npm run db:check`

`npm run db:seed`

## Production build

`npm run check`

Then:

`npm run start`

## Emerald/cPanel deployment

The project uses `output: "standalone"` in `next.config.ts` so the production build can be deployed as a Node application. The exact Emerald startup-file/root configuration must be confirmed in the hosting panel before we finalize the deployment adapter.

Recommended production sequence:

1. Push `main` to GitHub.
2. GitHub Actions runs typecheck and production build.
3. Pull the approved `main` commit into Emerald.
4. Install production dependencies.
5. Build on the server if the hosting environment supports it, or upload the generated standalone bundle.
6. Configure the Node application startup and environment variables in Emerald/cPanel.
7. Verify `/api/health`.

## Current release scope

- Premium Aslal homepage
- Solutions page
- Software marketplace foundation
- Product detail pages
- Automation Lab
- Contact/lead capture
- Anonymous visitor event tracking
- Referral link redirect and click capture foundation
- MySQL schema for visitors, leads, products, partners, referrals and commissions
- Basic admin login/dashboard foundation
- GitHub CI
- Health endpoint

## Next build releases

1. Full CRM: lead inbox, pipeline, assignments, activities.
2. Partner portal: agents/influencers, referral links, campaign assets.
3. Attribution: first/last/assisted touch and revenue attribution.
4. Commission engine and payout records.
5. WhatsApp Business Platform integration.
6. Telegram Bot API integration.
7. Product interest scoring and sales recommendations.
8. Content/SEO management and analytics.
9. Full multilingual content management (English, Amharic, Afaan Oromoo).

## Security notes

- Never commit `.env` files.
- Replace the default admin password immediately.
- Use a long random `SESSION_SECRET`.
- Use HTTPS in production.
- Add rate limiting before public launch.
- Add a proper transactional email provider before relying on email notifications.
- Add provider webhook signature validation for WhatsApp/Telegram integrations.
