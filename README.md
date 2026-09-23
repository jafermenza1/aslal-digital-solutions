# Aslal Digital Solutions — Growth OS

**Product:** Aslal Growth OS  
**Organization:** Aslal Digital Solutions  
**Primary market:** Ethiopia, with diaspora/international use where commercially relevant  
**Repository:** `jafermenza1/aslal-digital-solutions`  
**Production:** `https://aslaldigital.com`

Aslal Growth OS is being developed as an Ethiopia-first demand-to-revenue commercial operating system. The repository contains both the implementation and the documents that define the intended product, the current verified state, and the controlled sequence for reaching the target state.

## Start here

Do not treat this README as the complete product specification. Use the documents below together.

### 1. Target-state product definition

**[Aslal Growth OS master plan](docs/Aslal%20Growth%20OS%20master%20plan.md)**

This is the expanded **target-state system definition** and should be read to understand the whole product.

It explains:

- the commercial model and product vision;
- the actors and workspaces;
- demand, identity, visitor intelligence and lead management;
- sales execution and conversations;
- quotes, negotiation, orders and payments;
- revenue and attribution;
- campaigns and traditional/digital acquisition;
- partners, agents, influencers and commissions;
- trust, retention and customer referrals;
- localization, mobile/low-bandwidth requirements and privacy;
- RBAC and multi-tenancy;
- automation and AI boundaries;
- the complete end-to-end Growth OS journey.

This document describes **what the system is intended to become**, not what the current code necessarily implements.

### 2. Current implementation reconciliation

**[Reconciliation Guideline](docs/reconciliation/README.md)**

This is the authoritative engineering control for reconciling the target product with the actual repository and production environment.

It answers:

- what is implemented;
- what is partial;
- what is unverified;
- what is blocked;
- what evidence exists;
- what production/data risks remain;
- what may safely scale;
- what must not yet be claimed.

Use this document before making major architectural or business-domain changes.

### 3. Current execution state

**[Execution State](docs/reconciliation/EXECUTION-STATE.md)**

This is the current implementation truth.

It records:

- the accepted and unverified phases;
- production/deployment evidence;
- historical integrity findings;
- hard scaling stops;
- the exact immediate next action.

Do not infer completion from an open branch or an unmerged pull request. Merged `main` is the repository source of truth.

### 4. Canonical development roadmap

**[Next Development Plan](docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md)**

This is the **single canonical development roadmap**.

It defines the controlled implementation order:

**Production Integrity → Sales Follow-up → Quote/Negotiation → Order/Payment → Revenue Attribution → Campaign Attribution → Partner/Influencer Commerce → Trust/Retention → End-to-End Verification → RBAC/Multi-Tenancy → Capacity Scaling → AI**

The roadmap is gate-based. Code existing in a branch does not move the product to the next phase; acceptance evidence does.

### 5. Traceability and domain rules

**[Traceability](docs/reconciliation/TRACEABILITY.md)** maps target requirements to implementation status.

**[Domain Contract](docs/reconciliation/DOMAIN-CONTRACT.md)** defines the meaning and relationships of core business entities.

**[Phase Control](docs/reconciliation/PHASE-CONTROL.md)** contains anti-drift rules for development, acceptance and handoff.

### 6. Historical phase implementation records

The `docs/reconciliation/PHASE-*.md` files retain implementation notes and acceptance evidence for earlier phases.

They are historical/phase-specific records. They do not override newer merged mainline state, the current execution state, or the canonical development plan.

---

## Document authority model

The repository intentionally separates **what we are building** from **where we are now** and **what we build next**:

| Document | Purpose | Authority |
|---|---|---|
| `docs/Aslal Growth OS master plan.md` | Complete target-state product definition | Target product |
| `docs/reconciliation/README.md` | Reconciliation rules and verified implementation/production interpretation | Engineering control |
| `docs/reconciliation/EXECUTION-STATE.md` | Current implementation and acceptance state | Current execution truth |
| `docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md` | Controlled next development and scaling sequence | Canonical roadmap |
| `docs/reconciliation/TRACEABILITY.md` | Requirement-to-implementation mapping | Traceability |
| `docs/reconciliation/DOMAIN-CONTRACT.md` | Core business-domain semantics | Domain contract |
| `docs/reconciliation/PHASE-CONTROL.md` | Anti-drift and phase-control rules | Development control |

**Important:** `NEXT-DEVELOPMENT-PLAN.md` is the only canonical development roadmap. A second file with the same roadmap intent must not be introduced.

---

## Current product state

The current system is beyond the original prototype stage and already provides a production-oriented commercial foundation, including:

- public website and growth pages;
- visitor/event tracking and Growth Opportunity signals;
- lead capture, normalization, scoring, ownership and next-action controls;
- opportunities and customer foundations;
- customer activities/timeline;
- unified conversation/message records;
- communication preferences and human handoff;
- partner/referral/commission foundations;
- database-backed product/service catalog with rich public detail pages and attributed CTAs;
- offline/manual lead capture with normal sales workflow entry;
- configurable branded transactional contact auto-reply email;
- single-workspace users, roles and editable permissions;
- administrative lead correction, deletion, test-data controls and audit;
- operational and production-integrity reporting;
- CI/CD and production Prisma migration execution.

The current system is **not yet the complete target-state Growth OS**.

The newest catalog, offline-lead, transactional-email and user-access extensions are implemented on mainline and deployed through Emerald; controlled behavioral acceptance remains the next evidence gate.

The missing or incomplete commercial chain includes the full customer-facing automation capability (the initial internal-only engine is implemented but not yet accepted), first-class quote/negotiation/order/payment domains, payment-backed revenue attribution, complete campaign/asset attribution, revenue-confirmed partner commissions, trust/review lifecycle, retention/referral workflows, full RBAC and tenant isolation, and complete end-to-end acceptance.

Do not use the feature count as the definition of product maturity. The commercial journey and its evidence are the maturity test.

---

## Architecture and stack

- Next.js 16.3.5
- React 19.3.0
- TypeScript 5.9.3
- Tailwind CSS 4.3
- Prisma 6.19.0
- MySQL via `mysql2`
- Node.js >= 20.9.0
- GitHub Actions
- Next.js standalone output
- Emerald shared hosting / Node runtime for production

The production build uses:

`npm run check`

which runs lint, typecheck and the production build.

The deployment architecture builds the production artifact in GitHub Actions, packages the standalone runtime, runs Prisma migrations through the dedicated Prisma CLI bundle, installs the release on Emerald, restarts the application and performs a production health check.

---

## Local development

1. Install Node.js 20.9+ (Node 22 is recommended to match the production environment).
2. Copy `.env.example` to `.env.local`.
3. Configure a local MySQL database.
4. Run `npm install`.
5. Generate Prisma Client with `npm run prisma:generate`.
6. Use the checked-in Prisma migration history for schema changes.
7. Run `npm run dev`.

Before opening or merging a significant change, run:

`npm run check`

Never use the production Emerald database as a development/reset database.

---

## Database and migrations

Prisma migrations are the authoritative schema-change mechanism.

Useful commands:

`npm run prisma:generate`

`npm run prisma:deploy`

`npm run db:check`

`npm run db:seed`

Production must not be repaired by silently editing tables or manipulating `_prisma_migrations`. Historical business values must never be fabricated merely to satisfy an integrity check.

---

## Production deployment

The intended production flow is:

**Git push → CI → artifact → deployment workflow → Prisma migration → release swap/restart → health check**

Production deployment should use the repository's GitHub Actions workflows rather than ad-hoc server changes.

The current release pipeline is designed around the Emerald shared-hosting environment and standalone Next.js output.

Production health is necessary but not sufficient. A successful deployment does not prove business-data integrity, customer workflow acceptance, provider-specific messaging acceptance, or completion of the target-state product.

---

## Safe scaling policy

The repository currently has no validated benchmark establishing a maximum customer, message or event count for Emerald.

Therefore:

**Operate below 50% of validated peak capacity during initial commercial scale.**

The first load-test program must establish:

`Vpeak = maximum validated visitors/events/messages/orders per agreed test interval`

The initial safe operating ceiling is:

`0.50 × Vpeak`

Sustained approach to approximately 70% of the validated operating limit, or triggers such as elevated p95 latency, CPU/memory/database utilization, queue delay, error rate, storage pressure, failed backups/migrations or critical integrity failures, requires infrastructure review.

Shared multi-tenant SaaS is a separate gate. The current schema is not an accepted shared multi-tenant architecture.

---

## Security and operational rules

- Never commit `.env` or secrets.
- Use HTTPS in production.
- Protect admin authentication and session secrets.
- Preserve authorization boundaries.
- Keep external integrations behind provider adapters.
- Validate webhook signatures where applicable.
- Make external events idempotent.
- Audit financially or operationally meaningful administrative changes.
- Respect communication preferences and global opt-out.
- Do not invent customer, payment, commission or attribution data.
- Do not describe an integration as production-supported merely because an adapter exists.
- Do not add AI autonomy before the roadmap and reconciliation gates permit it.

---

## Development rule

Before implementing a major feature, a developer or AI coding agent should read, in this order:

1. `AGENTS.md`
2. **[Aslal Growth OS master plan](docs/Aslal%20Growth%20OS%20master%20plan.md)**
3. **[Reconciliation Guideline](docs/reconciliation/README.md)**
4. **[Execution State](docs/reconciliation/EXECUTION-STATE.md)**
5. **[Traceability](docs/reconciliation/TRACEABILITY.md)**
6. **[Domain Contract](docs/reconciliation/DOMAIN-CONTRACT.md)**
7. **[Next Development Plan](docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md)**
8. The specific phase/implementation record relevant to the task.

This order prevents a common failure mode: implementing a visible feature without understanding the business chain, current gaps, data contract, security implications or required acceptance evidence.

---

## The complete system in one line

**Acquire → Understand → Capture → Qualify → Communicate → Follow Up → Quote → Negotiate → Sell → Collect → Deliver → Retain → Refer → Attribute → Improve**

The target Growth OS connects these activities so a business can reconstruct where demand came from, what the customer wanted, what happened in sales, what was offered, what was ordered, what was paid, what revenue resulted, which partner/campaign contributed, what commission is attributable, and what should happen next.

---

## App UI foundation

The dashboard uses a shared permission-aware shell with icon navigation, mobile navigation, dark/light theme switching and website-language inheritance.

The public and app surfaces share the `aslal_locale` cookie. The public language selector is now a visible globe-style control, and the dashboard reads the same locale.

**[App UI translation guide](docs/UI-TRANSLATION.md)** documents the dictionary structure, the terminology table and the exact steps to edit a term or add another language.

The canonical system documents remain connected through:

- [Target-state master plan](docs/Aslal%20Growth%20OS%20master%20plan.md)
- [Reconciliation](docs/reconciliation/README.md)
- [Execution State](docs/reconciliation/EXECUTION-STATE.md)
- [Canonical development plan](docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md)

## Repository links

- [Target-state Growth OS master plan](docs/Aslal%20Growth%20OS%20master%20plan.md)
- [Reconciliation Guideline](docs/reconciliation/README.md)
- [Execution State](docs/reconciliation/EXECUTION-STATE.md)
- [Canonical Next Development Plan](docs/reconciliation/NEXT-DEVELOPMENT-PLAN.md)
- [Traceability](docs/reconciliation/TRACEABILITY.md)
- [Domain Contract](docs/reconciliation/DOMAIN-CONTRACT.md)
- [Phase Control](docs/reconciliation/PHASE-CONTROL.md)
