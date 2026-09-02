# Emerald deployment checklist

This guide is intentionally written for a non-developer operator.

## A. Create the MySQL database

In Emerald/cPanel:

1. Open MySQL Databases.
2. Create a database for Aslal.
3. Create a database user.
4. Give that user full privileges to the Aslal database.
5. Open phpMyAdmin.
6. Select the new database.
7. Import `db/schema.sql`.

## B. Create the Node.js application

In the Node.js application manager:

- Node version: `22.8.0` (or the newest compatible 22.x version Emerald provides).
- Application root: the deployed project directory.
- Startup file: `server.js`.
- Application URL: your Aslal domain.
- Production mode: enabled.

The exact field names may differ in Emerald's control panel.

## C. Environment variables

Copy `.env.example` values into the Node application's environment-variable section.

Never put real passwords into GitHub.

Required:

- `NEXT_PUBLIC_SITE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

## D. Build compatibility on Emerald

The production build uses Webpack explicitly:

```bash
npm install --no-audit --no-fund
npm run build
```

This avoids the Turbopack/native-SWC problem on hosts whose glibc is too old for the native Next.js compiler binary. Next.js documents Webpack as the alternative when Turbopack is not supported on a platform.

The project still declares Node.js `>=22.8.0` as its supported runtime. If the Emerald terminal reports Node 20.x, do not treat that as the application environment being correct. Configure/activate the cPanel Node.js 22.8.0 environment before production startup and builds.

To verify the shell environment:

```bash
node -v
npm -v
which node
```

The exact cPanel activation path varies by account and is shown by the Node.js application manager.

## E. Start/restart

Restart the Node application using the Emerald/cPanel control panel after a successful build.

Then open:

`https://aslaldigital.com/api/health`

Expected response contains:

```json
{"status":"ok","application":"ok","database":"ok"}
```

## F. Git deployment

Preferred workflow:

```text
Local/GitHub
     ↓
Pull Request
     ↓
GitHub Actions
     ↓
Typecheck + Build
     ↓
Merge to main
     ↓
Emerald pulls approved main
     ↓
Build
     ↓
Restart Node app
     ↓
Health check
```

Until an official Emerald deployment API or webhook is confirmed, do not put SSH passwords/tokens into GitHub Actions. The CI workflow in this repository therefore acts as a deployment gate rather than pretending to know Emerald's private deployment interface.
