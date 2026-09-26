# Emerald Production Runtime and Deployment

## Production runtime contract

Aslal runs the Next.js standalone build behind LiteSpeed/Passenger on Emerald.

- Repository source of truth: `main`
- Production build branch: `deploy`
- Emerald application path: `/home/aslaldzn/aslal-digital-solutions`
- Standalone entrypoint: `.next/standalone/server.js`
- Emerald adapter: `server.js`
- Production environment file: `.env` on Emerald only; it is not committed to Git
- Health endpoint: `/api/health`

### Required server adapter

LiteSpeed/Passenger does not reliably provide the project `.env` variables to the standalone Node process. Therefore `server.js` must load `dotenv/config` before requiring the standalone Next server.

Do not replace this with the historical `next-server.js` launcher.

### Database environment

The application expects:

- `DB_HOST`
- `DB_PORT` (defaults to 3306 when omitted)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Prisma also uses the production `DATABASE_URL` where applicable.

Never commit or print the password.

## Normal deployment procedure

The GitHub Actions workflow `.github/workflows/ci.yml` is the authoritative build/publish path.

1. Push changes to `main`.
2. GitHub Actions runs:
   - npm install
   - Prisma generate
   - typecheck
   - lint
   - Next production build
3. The workflow publishes the generated `.next` output to `deploy`.
4. On Emerald:

```bash
cd /home/aslaldzn/aslal-digital-solutions
git fetch origin
git checkout -B deploy origin/deploy
git reset --hard origin/deploy
mkdir -p tmp
touch tmp/restart.txt
sleep 5
```

5. If dependencies changed, refresh production dependencies and Prisma client:

```bash
source /home/aslaldzn/nodevenv/aslal-digital-solutions/22/bin/activate
npm install --omit=dev --package-lock=false
npx prisma generate
```

Do not run this on every deployment when dependencies have not changed.

6. Verify application and database health:

```bash
curl -i --max-time 15 https://aslaldigital.com/api/health
```

Expected response:

```json
{"status":"ok","application":"ok","database":"ok"}
```

## Database safety

A healthy deployment does **not** require resetting or resolving migrations.

Before changing Prisma state, check:

```bash
npx prisma migrate status
```

Do not run `prisma migrate reset` in production.

Do not run `prisma migrate resolve` unless a specific failed migration has been diagnosed and the correct resolution is known.

## Database diagnostic

The repository's `scripts/db-check.mjs` now loads `.env` itself, so this is sufficient:

```bash
node scripts/db-check.mjs
```

Expected:

```json
{"ok":true,"database":true}
```

The previous workaround:

```bash
node --import dotenv/config scripts/db-check.mjs
```

is no longer required.

## Incident learned on 2026-09-26

The application initially returned:

```json
{"status":"degraded","application":"ok","database":"error"}
```

while a manually dotenv-loaded database check succeeded.

The decisive LiteSpeed error was:

```
Access denied for user ''@'localhost' (using password: NO)
```

This showed that the Passenger-managed Node process had no database environment variables.

The durable fix is to load `.env` in `server.js` before Next initializes. After the fix, production returned:

```json
{"status":"ok","application":"ok","database":"ok"}
```

This was an environment/runtime issue, not a Prisma migration or MySQL credential problem.

## Important operating rule

**GitHub is the application source of truth. Emerald is the runtime.**

Do not manually edit application source files on Emerald except for temporary emergency diagnosis. If an emergency server edit is made, immediately reproduce it in `main` and allow the normal GitHub Actions workflow to publish the authoritative `deploy` build.

Never delete `.env` during a deployment.

Never rebuild the Next application manually on Emerald when the correct `deploy` build is already available.

## First checks when production fails

Run these in order:

```bash
cd /home/aslaldzn/aslal-digital-solutions

git branch --show-current
git rev-parse --short HEAD
test -f .env && echo ".env present"
test -f .next/standalone/server.js && echo "standalone build present"

node scripts/db-check.mjs
npx prisma migrate status

mkdir -p tmp
touch tmp/restart.txt
sleep 5

curl -i --max-time 15 https://aslaldigital.com/api/health
```

Interpretation:

- `db-check` fails: investigate environment/MySQL credentials.
- Prisma reports pending/failed migrations: stop and diagnose migration state; do not reset production.
- `db-check` succeeds but health reports database error: inspect the Passenger runtime environment and `server.js`.
- Health is 200/OK: database and application runtime are connected.

## Current architecture

```
GitHub main
   |
   | CI: install -> Prisma generate -> typecheck -> lint -> build
   v
GitHub deploy
   |
   | .next/standalone
   v
Emerald LiteSpeed/Passenger
   |
   | server.js -> dotenv/config -> .next/standalone/server.js
   v
Next.js application
   |
   +--> MySQL / Prisma
   |
   +--> Q1 workspace boundary
   |
   +--> Lead -> Opportunity -> Quote -> Order -> Payment
   |                         -> Reconciliation -> Revenue -> Commission
   |
   +--> Telegram / partner / campaign systems
```
