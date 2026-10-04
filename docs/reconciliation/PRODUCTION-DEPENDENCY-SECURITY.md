# Production Dependency Security Baseline

Updated 2026-10-04.

The production dependency gate must pass without `npm audit fix --force`.

## Remediation

- Next.js upgraded to 16.3.8 to clear the critical `next/og` advisory affecting 16.2.x–16.3.5.
- Prisma remains on the maintained 6.x line and is aligned at 6.19.3 for both `@prisma/client` and the CLI.
- Prisma transitive dependency `deepmerge-ts` is overridden to 8.0.2 because Prisma's older config dependency pins a vulnerable 7.x release.
- Prisma's `effect` dependency is overridden to 3.21.0.
- Nodemailer upgraded to 10.0.14; the project already requires Node.js 20+.
- `mailparser` upgraded to 3.9.33.
- `imapflow` upgraded to 2.2.1.
- The obsolete `@types/nodemailer` package was removed because Nodemailer 10 ships its own TypeScript declarations.
- Brand compliance remains enforced separately by `npm run brand:check`.

## Policy

Do not resolve security findings by downgrading Prisma with `npm audit fix --force`. Dependency remediation must preserve the existing Prisma migration/client architecture and be validated by the complete parallel pre-deployment CI gate.
