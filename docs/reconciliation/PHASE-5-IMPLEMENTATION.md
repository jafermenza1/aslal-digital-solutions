# Phase 5 — Sales Follow-up Automation

**Status:** IMPLEMENTED-UNVERIFIED  
**Scope:** Internal-only sales execution automation  
**Date:** 2026-09-23

## Purpose

Phase 5 converts the existing LeadTask and Conversation foundations into a durable workflow/execution engine without enabling uncontrolled customer messaging.

The initial production scope is deliberately narrow:

**detect meaningful demand → create internal work → retry safely → stop eligible automation when the customer replies or the lead reaches a terminal state.**

## Implemented

### Durable workflow model

The schema contains Workflow, WorkflowVersion, WorkflowExecution and WorkflowActionExecution.

Workflow configuration is versioned. Executions have idempotency keys, target references, status, attempts, payload/result data and timestamps. Each action has its own execution status, retry count, scheduling timestamp and result/error context.

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

### Scheduler

Protected endpoint:

`/api/cron/sales-automation`

GitHub Actions runner:

`*/5 * * * *`

Production activation requires application environment secret `AUTOMATION_CRON_SECRET` and GitHub secret `AUTOMATION_CRON_TOKEN`. Optional `AUTOMATION_CRON_URL` can override the default URL.

## Deliberately not enabled

Phase 5 does **not** automatically send promotional or sales messages to customers.

No workflow action currently sends customer-facing email/SMS/Telegram/WhatsApp/Messenger messages.

That capability remains gated until consent, opt-out, handoff, reply, terminal-state, expiry, provider, idempotency and production acceptance requirements are demonstrated.

## Acceptance gate

Before Phase 5 can be marked SATISFIED, demonstrate in a controlled production journey:

**lead capture → score/high-intent evaluation → workflow execution → assigned internal task/activity → retry/idempotency behavior → customer reply or terminal-state cancellation**

Evidence must include migration success, successful scheduler invocation, at least one completed workflow execution, zero duplicate executions for the same trigger key, verified cancellation on inbound reply, verified cancellation on WON/LOST, no recent failed/stuck executions, and operator visibility.

## Next action

Configure the scheduler secrets, deploy the migration, run the controlled acceptance journey, capture evidence, then reconcile R20/R21 and Phase 5 execution state again.
