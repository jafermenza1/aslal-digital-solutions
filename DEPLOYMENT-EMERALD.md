# Emerald deployment checklist — v0.4

This guide is intentionally written for a non-developer operator.

## Existing production database

**Do not import `db/schema.sql` again if the Aslal production database already contains the current application tables.** v0.4 uses a Prisma baseline so the existing `visitors`, `leads`, `events`, `partners`, `referral_links`, `referral_clicks`, `products`, and `commissions` data is preserved.

For a brand-new database, initialize the base schema first with `db/schema.sql`, then use the Prisma baseline procedure before applying v0.4 migrations.

## Node.js application

Use Emerald's available Node 22 runtime. The known working cPanel environment is Node `22.23.2`.

- Application root: the deployed project directory.
- Startup file: `server.js`.
- Application URL: your Aslal domain.
- Production mode: enabled.

## Environment variables

In the Node.js application's environment-variable section, keep the existing `DB_*` variables and additionally configure:

`DATABASE_URL=mysql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME`

Use the real values, not the literal names above. Percent-encode special characters in the database password when putting it into the URL.

Never put real passwords into GitHub.

Required application variables include:

- `NEXT_PUBLIC_SITE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

## v0.4 Prisma migration

Prisma is now used for the sales operations layer. The repository contains:

- `prisma/schema.prisma`
- `prisma/migrations/0000_baseline/` — existing production schema baseline
- `prisma/migrations/004_v04_sales_operations/` — v0.4 operational tables and deal fields

The first production rollout must mark the baseline as already applied, then deploy the real v0.4 migration. Do **not** run `prisma migrate reset` on production.

## Emerald build compatibility

The production build uses Webpack explicitly because Emerald's older system libraries can reject the native Turbopack/SWC binaries.

Verify the application environment first:

```bash
source ~/nodevenv/aslal-digital-solutions/22/bin/activate
node -v
which node
```

Expected Node version: `v22.23.2` (or another supported Emerald Node 22.x version).

## One-time v0.4 deployment sequence

After v0.4 is merged into `main`, from the Emerald terminal:

```bash
cd ~/aslal-digital-solutions && \
git fetch origin && \
git checkout main && \
git pull --ff-only origin main && \
source ~/nodevenv/aslal-digital-solutions/22/bin/activate && \
node -v && \
export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" && \
npm install --include=dev --no-audit --no-fund && \
npx prisma generate && \
npx prisma migrate resolve --applied 0000_baseline && \
npx prisma migrate deploy && \
rm -rf .next && \
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PRIVATE_BUILD_WORKER=1 \
RAYON_NUM_THREADS=1 \
JOBS=1 \
MAKEFLAGS="-j1" \
NODE_OPTIONS="--max-old-space-size=4096" \
taskset -c 0 npm run build
```

**Important:** the `export DATABASE_URL=...` line is convenient when the existing `DB_*` environment variables are available to the shell. If the database password contains URL-special characters, configure the correctly percent-encoded `DATABASE_URL` in cPanel and omit that export line.

The baseline command is intended to be run once for the existing production database. After it has been recorded, future deployments only need `prisma generate` and `prisma migrate deploy`.

## Restart

After the build completes successfully, restart the Node.js application from Emerald/cPanel using its application restart control. Do not restart until the build finishes successfully.

Then verify:

```text
https://aslaldigital.com/api/health
```

Expected response contains:

```json
{"status":"ok","application":"ok","database":"ok"}
```

## Git deployment workflow

```text
Feature branch
     ↓
Pull Request
     ↓
GitHub Actions
     ↓
Typecheck + Prisma Generate + Build
     ↓
Merge to main
     ↓
Emerald pulls approved main
     ↓
Prisma baseline/migrations
     ↓
Production build
     ↓
Restart Node app
     ↓
Health check
```
