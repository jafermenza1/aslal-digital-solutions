# Phase 5 — Sales Follow-up Automation

**Status:** IMPLEMENTED-UNVERIFIED  
**Scope:** Internal-only sales execution automation  
**Date:** 2026-09-23  
**Implementation baseline:** `e2c1e24a5f2f30b6383f1bf6d63d156f4131ecc5`  
**Latest UI refinement:** `b03eae1e354a80b92e36a9e2af82d6874f4c3b3f`

## Purpose

Phase 5 converts the existing LeadTask and Conversation foundations into a durable workflow/execution engine without enabling uncontrolled customer messaging.

The initial production scope is deliberately narrow:

**detect meaningful demand → create internal work → retry safely → stop eligible automation when the customer replies or the lead reaches a terminal state.**

## Implemented

### Durable workflow model

The schema contains Workflow, WorkflowVersion, WorkflowExecution and WorkflowActionExecution.

Workflow configuration is versioned. Executions have idempotency keys, target references, status, attempts, payload/result data and timestamps. Each action has its own execution status, retry count, scheduling timestamp and result/error context.

Migration:

`20260923050000_sales_followup_automation`

### Core internal workflows

- **High-intent lead triage** — `LEAD_CREATED`, active lead score >= 60, creates high-priority internal follow-up task/activity.
- **Overdue sales action reminder** — `LEAD_OVERDUE`, creates an urgent internal reminder task/activity.

### Safety behavior

Implemented:

- idempotent trigger keys;
- workflow enable/disable handling;
- condition checks;
- delayed action scheduling;
- bounded retries and retry backoff;
- stale-running execution recovery;
- customer-reply cancellation for eligible pending/running lead automation;
- WON/LOST cancellation;
- action-level execution history;
- operator visibility.

No workflow action currently sends customer-facing promotional messages.

### Scheduler

Protected endpoint:

`/api/cron/sales-automation`

GitHub Actions workflow:

`.github/workflows/sales-automation.yml`

Schedule:

`*/5 * * * *`

Production activation requires:

- application environment secret `AUTOMATION_CRON_SECRET`;
- GitHub secret `AUTOMATION_CRON_TOKEN`;
- optional `AUTOMATION_CRON_URL`.

The workflow intentionally exits without executing when `AUTOMATION_CRON_TOKEN` is absent, so an unconfigured scheduler cannot silently perform partial automation.

### Operator UI

The Sales Operations dashboard has been simplified into separate tabs:

- **Overview / Health** — production integrity and readiness;
- **Follow-up / Tasks** — create, assign, schedule and complete LeadTask work;
- **Automation** — workflows, execution counters and recent execution history;
- **Admin Audit** — administrative corrections, export and test-data controls.

The tab navigation is responsive and horizontally scrollable on small screens. Large execution/task/audit tables are replaced by stacked mobile cards on smaller screens.

Only the selected operations tab loads its corresponding heavy data set, reducing the amount of information shown in one page.

## Deliberately not enabled

Phase 5 does **not** automatically send promotional or sales messages to customers.

No workflow action currently sends customer-facing email/SMS/Telegram/WhatsApp/Messenger messages.

That capability remains gated until consent, opt-out, handoff, reply, terminal-state, expiry, provider, idempotency and production acceptance requirements are demonstrated.

## Verification already recorded

The Phase 5 implementation reached mainline and the enum typecheck correction was verified by CI:

- CI run `35888225371` — SUCCESS;
- deploy run `35888546958` — SUCCESS;
- production health check — SUCCESS.

The deployment workflow installs the release and runs Prisma `migrate deploy` before restart, so the Phase 5 migration is part of the deployed release path.

This establishes implementation, CI and deployment evidence. It does **not** yet establish completed production scheduler execution or business acceptance.

## Acceptance gate

Before Phase 5 can be marked SATISFIED, demonstrate in a controlled production journey:

**lead capture → score/high-intent evaluation → workflow execution → assigned internal task/activity → retry/idempotency behavior → customer reply or terminal-state cancellation**

Evidence must include:

- migration success;
- successful scheduler invocation;
- at least one completed workflow execution;
- zero duplicate executions for the same trigger key;
- verified cancellation on inbound reply;
- verified cancellation on WON/LOST;
- no recent failed/stuck executions;
- operator visibility.

## Remaining gap / exact next action

1. Configure the production scheduler secret `AUTOMATION_CRON_SECRET`.
2. Configure GitHub secret `AUTOMATION_CRON_TOKEN`.
3. Trigger or observe a scheduler invocation and retain the JSON result as evidence.
4. Run the controlled acceptance journey.
5. Verify idempotency, delayed execution, reply cancellation and WON/LOST cancellation.
6. Reconcile R20/R21 and change Phase 5 to SATISFIED only when the acceptance evidence exists.

Customer-facing automated messaging remains outside this Phase 5 acceptance until its separate safety/provider gates are satisfied.
