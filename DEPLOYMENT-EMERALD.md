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

## D. Build

From the project root:

```bash
npm install --no-audit --no-fund
npm run build
```

The build creates `.next/standalone` and prepares `public` and `.next/static` for the standalone server.

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
