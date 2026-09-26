# Gate 2 — Sales Follow-up and SLA Contract

**Status:** IMPLEMENTED — ACCEPTANCE PENDING  
**Canonical branch:** `main`  
**Scope:** Internal sales execution automation only  
**Prerequisite:** Gate 1 workspace administration/access contract remains acceptance-pending; Gate 2 must not weaken its workspace boundary.

## Purpose

Gate 2 proves that a newly captured high-intent lead can become owned internal work, that overdue work produces a controlled internal reminder, and that eligible automation stops when the customer replies or the lead reaches WON/LOST.

The accepted chain is:

**Lead capture → owner → next action → due date → high-intent automation → internal task/activity → overdue reminder → customer reply or terminal-state cancellation**

No Gate 2 workflow may send promotional customer messages.

## Contract

1. A lead belongs to a workspace.
2. Automated owner selection must select an active sales-capable user who is a member of that same workspace.
3. High-intent `LEAD_CREATED` processing is idempotent by trigger key.
4. The high-intent workflow creates internal follow-up work only when its active/status and score conditions are satisfied.
5. An overdue active lead creates at most one reminder for the same next-action deadline.
6. Retries are bounded and recorded at execution/action level.
7. Customer inbound reply cancels eligible pending/running lead automation.
8. WON/LOST transition cancels eligible pending/running prospecting automation.
9. Disabled, expired, or invalid-condition executions cannot continue.
10. Automation execution history remains reconstructable by operator.
11. Automation reads and writes must not assign Workspace A work to a Workspace B salesperson.
12. Customer-facing promotional automation remains disabled for this gate.

## Acceptance matrix

| ID | Scenario | Expected evidence | Status |
|---|---|---|---|
| G2-01 | Create high-intent lead in Workspace A | Lead has Workspace A, valid owner, next action and due date | PENDING |
| G2-02 | High-intent trigger | One completed workflow execution and internal task/activity | PENDING |
| G2-03 | Repeat same trigger | No second execution for the same idempotency key | PENDING |
| G2-04 | Overdue lead | Internal reminder execution is created | PENDING |
| G2-05 | Repeat scheduler after same due date | No duplicate overdue execution/task | PENDING |
| G2-06 | Action failure | Retry is bounded and execution history records failure/retry | PENDING |
| G2-07 | Customer reply | Pending/running eligible automation is cancelled | PENDING |
| G2-08 | Lead becomes WON | Pending/running prospecting automation is cancelled | PENDING |
| G2-09 | Lead becomes LOST | Pending/running prospecting automation is cancelled | PENDING |
| G2-10 | Expired execution | Execution is cancelled and remaining actions skipped | PENDING |
| G2-11 | Disabled workflow | Execution is cancelled without executing actions | PENDING |
| G2-12 | Workspace isolation | Workspace A lead is never auto-assigned to a Workspace B member | IMPLEMENTED — BEHAVIORAL PROOF PENDING |
| G2-13 | Operator visibility | Workspace-scoped automation dashboard shows executions and failures | PENDING |
| G2-14 | Customer messaging safety | Gate 2 produces no promotional customer message | IMPLEMENTED — BEHAVIORAL PROOF PENDING |
| G2-15 | Manual scheduler invocation | Protected scheduler returns successful execution JSON when valid secret is supplied | PENDING |

## Current implementation

The durable model already contains:

- Workflow
- WorkflowVersion
- WorkflowExecution
- WorkflowActionExecution

Core workflows:

- `lead_high_intent_triage`
- `lead_overdue_internal_reminder`

The scheduler endpoint is:

`/api/cron/sales-automation`

The current development policy intentionally has **no GitHub Actions workflows**. Gate 2 therefore does not restore CI, deployment, or scheduled GitHub Actions. Scheduler acceptance must use the protected application endpoint/manual execution in the controlled environment.

## Gate 2 safety rules

- Do not fabricate leads, replies, payments, customers or other business facts to make the gate pass.
- Do not convert pipeline/deal value into revenue.
- Do not enable promotional customer messaging as part of this gate.
- Do not bypass workspace authorization to create acceptance fixtures.
- Do not mark the gate SATISFIED from code existence, typecheck/lint, deployment health, or an acceptance endpoint alone.
- Keep all changes on `main`; no feature branch is required for this gate.

## Required evidence before SATISFIED

1. Gate 1 workspace fixtures and authorization remain valid.
2. A controlled high-intent lead journey is executed.
3. Scheduler/manual execution evidence is retained.
4. Idempotency is proven with the same trigger key.
5. Overdue reminder deduplication is proven.
6. Reply cancellation is proven.
7. WON and LOST cancellation are proven.
8. Retry/stale recovery behavior is proven.
9. No recent failed/stuck executions remain.
10. Workspace-scoped ownership is proven.
11. `npm run typecheck` and `npm run lint` pass locally.
12. Documentation is reconciled with exact evidence.

## Current implementation correction

Gate 2 automation previously selected a sales owner globally. That could assign a workspace-scoped lead to a salesperson who belonged to another workspace. The owner-selection path is now constrained to active sales-capable users who are members of the lead's workspace.

Offline/manual lead creation is likewise constrained to a sales-capable member of the selected workspace.

This is a correctness hardening change, not acceptance evidence.


## Step 2 safety hardening — 2026-09-26

The protected SLA scheduler now runs only the internal sales workflow engine. Customer-facing Telegram follow-ups are isolated behind `/api/cron/telegram-followups`, so invoking the Gate 2 scheduler cannot implicitly send customer messages.

Workflow and action execution claims are also atomic at the PENDING boundary. A concurrent scheduler call can no longer claim the same workflow execution or due action after another worker has claimed it. Existing unique trigger idempotency, overdue-deadline deduplication, bounded retry, stale recovery and cancellation hooks remain active.

Acceptance is still pending. This hardening does not itself satisfy the behavioral matrix.
