# Aslal Growth OS — Unified, User-Aware Workspace UX Implementation Plan

**Status:** Proposed implementation plan; not an implementation-completion claim  
**Target branch:** `main`  
**Scope:** Internal Aslal Digital Solutions operating system  
**Primary objective:** Replace the current collection-of-cards experience with a simple, understandable, role-aware workspace that helps each person know what to do next, why it matters, and where to do it.

## 1. Executive decision

The current interface is not accepted as the target UX. A shared dashboard shell, responsive navigation, role-filtered navigation and several workflow pages are useful foundations, but the experience still presents too many competing cards, sections, entry points and generic action links. Users are expected to understand the system's internal module structure and infer their next step.

The redesign must be **task-first, not card-first; user-aware, not module-first; progressive, not overwhelming; and record-centred, not link-centred**.

The default signed-in experience should answer, in plain language:

1. **What is the most important thing I should do now?**
2. **Why is it mine, and what happens if I complete it?**
3. **What information or approval is missing?**
4. **What is the next step after this one?**
5. **Where can I resume the exact work I last touched?**

The primary workspace must have one visually dominant **Continue where you left off** action, resolved from current server-side business state and permissions. It must point to the exact canonical record and permitted step—not simply to a generic leads, quotes, orders or finance page. A small, ordered list of secondary tasks may follow. Cards may still be used where comparison or summary genuinely benefits the user, but they must not be the default navigation model.

This document is an implementation plan. It does not assert that the redesign, resolver, persistence, tests or end-to-end acceptance already exist.

## 2. Product outcomes and non-goals

### 2.1 Outcomes

- A new or returning user can identify their next action without training in the module structure.
- Each role sees relevant work in its workspace and does not see actions it cannot perform.
- The system explains blockers in business language and identifies who or what is needed to clear them.
- Users resume a saved task safely after navigation, refresh, logout/login or device change.
- The full commercial journey is understandable from offer setup through lead capture, qualification, quotation, order, payment verification, delivery, reconciliation and revenue review.
- Cross-role handoffs retain the same canonical business record and clearly identify the receiving role's next responsibility.
- The experience works at phone widths and on slower connections without depending on large dashboard payloads.
- Existing records, APIs, permissions and business invariants are reused; no parallel CRM, duplicate lifecycle or shadow financial ledger is introduced.

### 2.2 Non-goals

- Do not replace the existing commercial data model simply to make the UI easier.
- Do not create a second dashboard, duplicate tasks, duplicate leads or duplicate financial records.
- Do not weaken workspace boundaries, server-side authorization, payment verification, approval rules, audit history, idempotency or financial reconciliation.
- Do not turn all users into administrators to make actions visible.
- Do not claim that a payment is verified, revenue is recognized or commission is payable merely because a user clicked a button.
- Do not force every user through a rigid wizard when they have legitimate permission to open a record directly.
- Do not hide advanced capabilities from authorized users permanently; progressively reveal them where they are relevant.
- Do not perform a visual-only reskin while leaving action selection and workflow state disconnected.

## 3. Existing foundation and required first audit

The repository already has useful foundations to reuse, including the shared dashboard shell and navigation, My Workbench, Cross-role Journeys, Business Cockpit, sales pipeline and lead follow-up concepts, quote and order workspaces, finance surfaces, and commercial reporting. Existing journeys describe paths such as Demand → Sale, Listing → Customer, and Partner → Commission → Payout.

However, the inspected interface has multiple competing starting points (Dashboard, Workbench, Journeys, Business Cockpit, Operations and domain-specific pages), multiple generic “Continue” links, and summary cards that lead to broad workspaces rather than the exact record and step. A static journey diagram is not proof that the system knows an individual user's actual progress. The phrase and behavior “Continue where you left off” were not found as a demonstrated, persisted, record-aware primary action in the inspected code.

Before implementation, perform a source-first inventory at the current `main` HEAD. Re-check the live branch before changing files because this plan may be implemented later than its creation date.

### 3.1 Audit existing code before adding code

For each capability, record its canonical source, existing API/service, permission check, lifecycle transitions, current UI, test coverage and known gaps:

- Authentication, session, active workspace and membership resolution.
- Role and permission definitions, including workspace-specific roles.
- Lead capture, deduplication, assignment, ownership and pipeline stages.
- Follow-up tasks, due dates, reminders and task completion.
- Offers/catalogue, public pages, campaigns, source attribution and referrals.
- Quote creation, versioning, approval, negotiation and acceptance.
- Order creation, delivery state and customer acceptance.
- Payment evidence, provider verification, finance review and reconciliation.
- Revenue recognition/attribution, commissions, payout and disputes.
- Audit events, notifications, integration failures and retry state.
- Workspace membership/management and role handoffs.
- Current dashboard, Workbench, Journey, Cockpit and navigation components.
- Existing schemas, migrations, API contracts and tests for each item.

Do not infer that a capability is complete from a page, card, type or documentation label alone. Trace the UI action through the server operation and persistence boundary. Reconcile contradictory documentation where one file describes a domain as missing while another describes it as implemented-but-unverified. Mark findings as **verified**, **partially verified**, **unverified**, or **missing**, with source paths and evidence.

### 3.2 Output of the audit

Create or update a concise traceability matrix that links each user task to its canonical record, existing service/API, authorization boundary, UI destination, lifecycle transition, tests and known blocker. The implementation should extend the existing design rather than introduce duplicate abstractions.

## 4. Target user experience

### 4.1 One primary workspace

Make the existing **My Workbench** the primary signed-in operating home, reusing the existing dashboard shell and shared design components. Avoid creating another competing home page.

The default page should have this hierarchy:

1. **Workspace and role context** — the active business/workspace and the user's responsibility, plainly labelled.
2. **One primary next action** — a single prominent action with a concrete verb and record identity.
3. **Reason and readiness** — why this task is next, due date or urgency, and any blocker.
4. **Next few tasks** — a compact, ordered queue of additional relevant actions, not a grid of equivalent cards.
5. **Progress through the current business journey** — a simple stepper or timeline for the selected record, when a journey is relevant.
6. **Recent work** — a short, useful list for reopening records, not a replacement for task prioritization.
7. **Secondary navigation** — access to all authorized areas without competing visually with the primary task.

Example primary-action copy:

- “Finish setting up **Website Growth Package**” — “2 required details remain before it can be published.”
- “Follow up with **Mekdes Trading**” — “The lead is assigned to you and the follow-up is due today.”
- “Review quote **Q-1042** for **Mekdes Trading**” — “Manager approval is required before it can be sent.”
- “Verify payment for **Order O-2081**” — “Evidence was submitted; finance verification is still pending.”
- “Resolve delivery blocker for **Order O-2081**” — “The customer cannot confirm delivery until the delivery evidence is recorded.”

The copy must reflect real data. Never fabricate customer names, due dates, readiness or business outcomes.

### 4.2 Primary action contract

The page must render exactly one **primary** next-action CTA at a time. This does not mean the whole application has only one button: record forms and legitimate secondary actions still need controls. It means the home workspace must not present several equal-weight “Continue” buttons and make the user choose a workflow.

The primary action should include:

- A short action label beginning with a clear verb.
- The business object and human-readable identifier/name.
- A one-sentence reason it is next.
- A due/urgency indicator only when supported by persisted data.
- A concise blocker/readiness message when relevant.
- A destination that opens the exact canonical record and task context.
- A clear fallback if the task is no longer valid or the user's permission changed.

Below it, show at most a small prioritized list of secondary actions. Use a plain list/table on desktop and stacked compact rows on mobile. Do not reproduce every module as a card.

### 4.3 Reduce navigation ambiguity

Group navigation by users' work rather than internal implementation domains. Use plain labels, for example:

- **My Work** — the task queue and resume action.
- **Customers** — leads, follow-ups and opportunities.
- **Offers & Campaigns** — offer readiness, pages and acquisition.
- **Quotes & Orders** — commercial commitments and delivery.
- **Payments & Finance** — payment verification, reconciliation and finance reporting.
- **Partners** — partner onboarding, referrals, attribution and payout workflow.
- **Reports** — authorized summaries and analysis.
- **Workspace settings** — membership, roles and configuration for authorized users.

Only expose a group when the user has relevant permission. Avoid two labels that lead to the same place without explaining the difference. Preserve direct routes and deep links for legitimate use, but provide clear breadcrumbs and contextual “Back to My Work” navigation. Admin and diagnostic tools should remain accessible to authorized administrators without becoming the default for ordinary operators.

### 4.4 Plain language and helpful system feedback

Use business terms in the UI; keep internal model names and technical error codes out of ordinary user-facing copy. When an action is blocked, explain:

- What cannot happen yet.
- Why it is blocked.
- What is missing or needs review.
- Who can resolve it, if known and authorized to disclose.
- A safe link to the relevant record or request.

Do not swallow backend errors or replace actionable error details with a generic success message. Translate known domain errors into helpful copy while preserving correlation/reference IDs and secure diagnostics for support. Unknown errors must fail visibly and safely.

### 4.5 Progressive disclosure

Show the minimum information required to complete the current step. Expand optional and advanced fields only when relevant. Keep a persistent summary of the current record and step so the user knows where they are. Explain why sensitive fields or evidence are requested. Preserve form values on recoverable validation errors and support draft/retry behavior only where the underlying domain safely supports it.

Avoid a giant all-in-one wizard. Use a clear, step-by-step guided flow for genuinely sequential setup, with a visible step count, save status, prerequisites and a way to return without losing valid work. Experienced users with appropriate permissions may still navigate directly to a record.

## 5. Role-aware workspace behavior

Role-aware must be calculated from the authenticated user, active workspace membership, server-enforced permissions and the current record state—not from a role name stored in the browser alone. A user may hold different responsibilities in different workspaces.

| User responsibility | Typical primary work | Important safeguards |
|---|---|---|
| Owner / director | Decisions requiring owner approval, high-impact exceptions and overall business health | No bypass of approval history or segregation-of-duties controls |
| Marketing / growth | Offer readiness, landing pages, campaign setup, tracking and lead-quality review | Publishing and budget actions require their real permissions |
| Sales representative | Assigned lead, next contact, qualification, opportunity update and customer follow-up | Enforce ownership/assignment rules server-side |
| Sales manager | Overdue follow-ups, reassignment, discount/quote approvals and pipeline risks | Approval permissions and thresholds remain explicit |
| Partner manager | Partner onboarding, referral quality, attribution exceptions and partner disputes | No direct mutation of verified financial outcomes without proper controls |
| Finance | Submitted payment evidence, provider verification, reconciliation exceptions and eligible payout review | Payment status, reconciliation and payout are separate authoritative states |
| Operations / delivery | Accepted orders, delivery checklist, evidence, customer acceptance and blockers | Cannot mark financial states complete as a substitute for delivery evidence |
| Auditor / read-only reviewer | Evidence, histories, reports and exceptions | Read-only by default; no mutation affordances or hidden write APIs |

This table is an intended behavior map, not a claim that all these roles or permissions already exist. The initial audit must map the repository's actual roles to these responsibilities and identify missing permission boundaries. Do not invent role enum values or create new roles without tracing current authorization design.

If a user has no actionable work, show a calm empty state: explain that there is no current task, show the next useful permitted area or a safe way to request work, and do not manufacture a task. If the user lacks workspace membership or workspace context, explain the issue and direct them to the existing authorized onboarding/selection flow; do not silently grant access.

## 6. Business journey and progress model

### 6.1 Journey follows canonical records

The main commercial journey should be understandable end to end:

**Offer configured → offer approved/published → campaign or public page attracts interest → lead captured → lead assigned and qualified → opportunity advanced → quote prepared and approved → quote accepted → order fulfilled → payment evidence verified → reconciliation completed → revenue/attribution reviewed → commission/payout processed when eligible.**

This is a conceptual path, not a promise that every transaction uses every stage. Existing domain rules determine which transitions apply. Partner referral and service-delivery paths may branch where the actual model requires it.

### 6.2 Step states

For the current canonical record, show only states supported by authoritative server data:

- **Completed** — the authoritative transition/evidence exists.
- **Current** — the user can perform the next permitted action now.
- **Waiting** — another person, provider or external event must act.
- **Blocked** — a prerequisite, validation or exception prevents progress.
- **Not applicable** — the actual workflow does not require this step.
- **Unavailable** — the user cannot view or perform the step under current permissions.

Every blocked or waiting step should explain the cause and, when possible, identify the responsible role or next expected event. Do not mark a step complete because a page was visited or a client-side flag was set. A journey must link to the same lead, quote, order, payment or partner record throughout the flow; it must not create shadow copies for progress tracking.

### 6.3 Progress is derived, not manually guessed

Prefer deriving progress from canonical domain records and audit events. Persist user navigation/resume metadata separately from the business lifecycle. A user may have last visited a record, but that does not mean the record's business stage changed.

If a step depends on a different role (for example, sales sends a quote and finance later verifies payment), preserve the canonical record and make the handoff visible. The sending user should see that work is waiting on another role rather than being told to repeat their own action.

## 7. Next-action resolver architecture

Implement a server-side resolver using existing services and domain records. Do not build a second business workflow engine just for the dashboard.

### 7.1 Candidate action shape

Define a typed, validated internal representation similar to the following, adapting to existing conventions:

```ts
type NextActionCandidate = {
  actionKey: string;            // stable domain action, not a random UI key
  recordType: string;            // existing canonical entity type
  recordId: string;              // canonical record identifier
  workspaceId: string;
  title: string;                  // user-facing verb phrase
  reason: string;                 // grounded in persisted state
  destination: string;            // internal allowlisted route
  dueAt?: string;
  priority: "urgent" | "high" | "normal" | "low";
  state: "ready" | "waiting" | "blocked";
  blockerCode?: string;           // mapped to safe explanatory copy
  ownerId?: string;
  requiredPermission: string;
  sourceVersion?: string;         // if the domain has a version/concurrency token
};
```

This is illustrative, not a request to introduce a duplicate generic task table or to copy fields that already exist in existing types. Reuse current task, follow-up, approval, quote, order, payment, delivery, integration and exception records wherever possible. If a shared contract is necessary, make it a read model assembled from authoritative services.

### 7.2 Resolver inputs

The resolver must use:

- Authenticated user identity and session.
- Explicit active workspace resolved and validated on the server.
- Workspace membership and effective permissions.
- Current record state and valid transitions.
- Existing assignments, due dates, approvals and task ownership.
- Prerequisite and exception status.
- Existing last-resume metadata, if valid.
- Freshness/version information where stale records could change the available action.

Never accept the client-supplied role, permission list, task completion state, or arbitrary destination as authority.

### 7.3 Candidate selection and ranking

Build a candidate set only from work the user is authorized and expected to perform. Filter out completed, cancelled, archived, duplicate, inaccessible, stale or otherwise non-actionable candidates. A waiting item may appear in the secondary queue with its reason, but should not outrank a ready task the user can actually perform unless a legitimate deadline or owner-level exception rule says otherwise.

Use a documented deterministic ranking policy, for example:

1. Security or operational exceptions that the user is authorized and responsible to resolve.
2. Overdue, assigned, actionable work.
3. Due-today actionable work.
4. High-impact approval or customer commitment awaiting this user.
5. Other ready tasks ranked by due date and business priority.
6. Relevant resumable draft/current task, when still valid and not superseded by a higher-priority obligation.

The precise order must be confirmed against existing business priorities and should be configurable/testable rather than scattered through components. Do not use arbitrary weights that cannot be explained. The selected action must include a machine-readable selection reason for debugging and tests.

If the saved resume task is stale, completed, unauthorized or no longer valid, ignore it and recalculate. Never redirect a user into a route merely because it was saved previously.

### 7.4 Server-side validation and route safety

Every destination must be derived from known route builders or an allowlist, with canonical IDs encoded safely. Re-check authorization when the destination loads and again in the mutation/API. The resolver is a UX convenience, not an authorization boundary. Do not rely on hidden buttons or client-side route guards.

### 7.5 Performance

Avoid a single unbounded query that loads every lead, quote, order and event into the dashboard. Use existing SQL/database-level filtering, scoped queries, indexes and pagination. Fetch a small number of top candidates and their minimal display fields. Use bounded parallel reads only when safe for the current database/services. Add explicit timeouts or graceful partial handling only if it does not mask failures or return misleading task priority. Cache only where permission and workspace scoping are correct; invalidate/recompute after relevant domain transitions.

## 8. Persisted resume behavior

### 8.1 What to persist

Persist lightweight navigation state keyed to the authenticated user and workspace, and optionally the canonical record:

- User ID and workspace ID.
- Canonical record type and ID.
- Stable action/step key.
- Last visited/started timestamp.
- Optional safe draft pointer or existing draft ID.
- Version/timestamp needed to detect stale state.

Do not persist secrets, payment evidence, private form payloads or sensitive customer data in a resume record. Reuse an existing suitable preference/progress table if it has the correct semantics; otherwise propose the smallest migration after confirming schema conventions and retention requirements.

### 8.2 When to update

Update resume state when the user intentionally opens or starts a meaningful task, not on every render or incidental navigation. Clear or supersede it when the task completes, is cancelled, becomes invalid or the user chooses another task. Retain enough history only if a product requirement exists; do not accumulate unbounded visit logs.

### 8.3 On return

On each workspace load:

1. Authenticate and resolve active workspace.
2. Read the saved resume pointer.
3. Re-fetch the canonical record and its current state.
4. Re-evaluate permission and valid next transition.
5. Resume at the exact current step if still valid.
6. Otherwise discard/supersede the stale pointer and run the next-action resolver.
7. Explain when a task moved or was completed by someone else, where appropriate.

The behavior must work across logout/login and different devices because the authoritative pointer is server-side. Browser-local draft support may complement this for existing offline-capable forms, but must not replace authorization or server persistence.

## 9. UI composition and interaction patterns

### 9.1 Workspace page structure

Use a restrained hierarchy and existing design system:

- Compact workspace header with active workspace and role context.
- One primary “Continue where you left off” panel/row.
- Short explanation, blocker and due date.
- One primary button with a concrete action label.
- “Other work to handle” compact task list.
- “Your current journey” stepper when there is a selected workflow.
- Recent items and reports as lower-priority links.
- Search and filters only where they help users find records.
- Secondary navigation in the established shell.

Do not create a grid of six to twelve cards just to represent modules. Avoid multiple competing primary-color buttons. Use consistent text hierarchy, whitespace, concise labels, visible focus states and meaningful empty/loading/error states. Decorative charts must not push urgent tasks below the fold.

### 9.2 Record workspace

Every record page should make these things obvious near the top:

- What is this record and what is its current status?
- What is the next permitted action?
- What must be completed before that action?
- Who owns the next step?
- What has already happened?
- What will happen if the user confirms this action?

Use one dominant action per record state; other actions should be secondary or placed in an overflow menu only if discoverability and accessibility remain good. Dangerous or irreversible actions need clear consequences and confirmation. Confirmation must not be used to excuse vague labels.

### 9.3 Forms

- Group required fields by purpose and keep optional fields visibly optional.
- State why information is required where it may be unfamiliar.
- Validate server-side; use client validation only as helpful early feedback.
- Put field errors next to fields and a summary at the top for long forms.
- Preserve safe entered data on validation failure.
- Clearly distinguish save draft, submit for review, approve, publish, accept, reject and complete.
- Use explicit save/pending/success/failure states and prevent duplicate submission with idempotency at the server boundary where applicable.
- Do not report success until the server confirms the authoritative change.

### 9.4 Search, lists and detail pages

Lists should support the common user question, not expose every database field. Default filters should reflect the user's scope and assigned work. Provide stable sorting, pagination, meaningful empty states, and a clear path from list to record and back. On mobile, use compact list rows with record name, status, next action and due date; avoid dense wide tables where they make the critical path unusable.

## 10. Accessibility, mobile-first and low-bandwidth requirements

Responsive styling alone is not sufficient evidence of mobile-first UX. Test real user journeys at narrow viewport sizes, touch input, keyboard-only navigation and slower connections.

- Support a 320–375 CSS-pixel viewport without horizontal page scrolling for core tasks.
- Ensure the primary action and current record are visible early without forcing users through a long decorative dashboard.
- Use semantic headings, landmarks, buttons and links; do not make clickable non-semantic containers.
- Provide visible keyboard focus and logical focus order.
- Meet WCAG 2.2 AA contrast targets and use text/icon plus color rather than color alone for status.
- Provide accessible names for icons and controls; decorative icons should not be announced.
- Respect reduced-motion preferences and avoid animation as the only state cue.
- Keep touch targets comfortably sized and spaced.
- Ensure forms, dialogs, menus and validation errors work with screen readers and keyboard navigation.
- Use skeletons or compact loading states only where useful; distinguish loading, no data, error and partial data.
- Minimize dashboard payload and avoid eagerly loading full charts or every workflow domain.
- Preserve retryable user input and show connection/save status where offline or flaky-network behavior is supported.
- Do not claim offline completion for financial or approval mutations that require server confirmation.

## 11. Implementation phases

Each phase must be independently reviewable, reuse existing foundations, and include tests. Do not begin with a large redesign that changes every page at once.

### Phase 0 — Source audit and UX baseline

**Work**
- Reconfirm current `main` HEAD and inspect current route/component structure.
- Trace existing roles, workspace context, services, domain transitions and current tests.
- Inventory all current dashboard entry points, cards and action links.
- Map actual business journeys and identify unsupported/static-only journey steps.
- Reconcile documentation that disagrees on whether commercial domains are missing or merely unverified.
- Capture screenshots and task walkthroughs at desktop and phone sizes; document current friction.
- Establish a baseline for task completion time, misnavigation, duplicate submission, errors and mobile usability.

**Exit criteria**
- A source-linked traceability matrix exists.
- Every critical path is classified verified/partial/unverified/missing.
- No duplicate task/record/workflow model is proposed without an explicit gap.
- The first implementation slice and rollback approach are agreed.

### Phase 1 — UX information architecture and shared patterns

**Work**
- Design the My Work primary-home hierarchy and navigation labels.
- Define action/priority/blocker/status copy patterns.
- Define shared components for primary action, compact task row, record status, blocker explanation, journey stepper, empty/loading/error states and breadcrumbs.
- Remove competing duplicate navigation entry points only after confirming routes and permissions.
- Keep all existing authorized domain routes reachable.
- Add a design review using real Aslal tasks and representative user roles before broad rollout.

**Exit criteria**
- One obvious primary action on the home workspace.
- Navigation labels are user-oriented and unambiguous.
- No feature is made inaccessible accidentally.
- Design review confirms the hierarchy is understandable without prior knowledge of internal modules.

### Phase 2 — Next-action read model/resolver

**Work**
- Implement a server-side service that queries existing domain sources.
- Define a typed candidate contract and deterministic, documented prioritization.
- Filter by current workspace, permission, assignment, status, prerequisites and freshness.
- Return one primary action plus a bounded secondary queue and selection rationale.
- Add safe route builders and user-facing blocker mapping.
- Add instrumentation for resolver outcomes without logging sensitive data.
- Implement explicit empty state when no actionable item exists.

**Exit criteria**
- Resolver is covered for each actual supported role/workspace type.
- No client-supplied role or destination is trusted.
- A candidate cannot be selected if it is complete, unauthorized, stale or not actionable.
- Performance is bounded and measured on realistic data volume.
- Failure is visible and diagnosable; it is not silently converted to a misleading “no work” result.

### Phase 3 — Server-side resume pointer

**Work**
- Reuse an existing suitable persistence model or add the smallest justified schema migration.
- Store user/workspace/canonical record/action step, with validation and retention.
- Update resume state on meaningful task entry and lifecycle completion.
- Revalidate state on every resume and recalculate if invalid.
- Handle workspace switching, logout/login, record deletion/archive, reassignment and permission changes.
- Keep local form drafts separate from authoritative workflow status.

**Exit criteria**
- Resume works after refresh and new session/device.
- Stale or unauthorized pointers never bypass permission checks.
- Completed work is not offered as if it remains actionable.
- Concurrent changes by another user result in a safe recalculation and clear message.

### Phase 4 — Convert the existing Workbench to task-first UX

**Work**
- Replace the current equal-weight card grid with the single primary action, compact secondary queue and relevant journey progress.
- Make My Workbench the default operational home using the existing shell.
- Remove or demote competing home-like dashboards and duplicated “Continue” links.
- Add record identity, plain-language reason, owner, due date and blocker where the source data supports it.
- Preserve relevant reporting and navigation below the primary work area.
- Ensure the mobile first viewport communicates the next action immediately.

**Exit criteria**
- One primary action per home state.
- The action opens the exact record and step.
- No duplicate card/link sends users to a generic destination when a canonical record route exists.
- Empty, loading, error, blocked and waiting states are distinct and understandable.

### Phase 5 — Connect business journeys and role handoffs

**Work**
- Replace static-only journey progress with state derived from canonical records.
- Link all steps to the same record lineage and real authorized action.
- Represent completed/current/waiting/blocked/not-applicable/unavailable states.
- Make handoffs visible: current owner, receiving responsibility and expected next event.
- Cover offer → campaign → lead → quote → order → payment → reconciliation → revenue and relevant partner/referral paths.
- Do not imply unsupported transitions; mark domain gaps as unverified or unavailable until implemented.

**Exit criteria**
- Progress changes only when authoritative business state changes.
- A handoff does not duplicate the underlying record.
- Users can identify why the process is waiting and which role is expected to act.
- Finance/revenue/commission stages retain their independent controls and evidence requirements.

### Phase 6 — Record pages, forms and feedback consistency

**Work**
- Apply the same status/action/blocker hierarchy to leads, opportunities, quotes, orders, payments, partner and campaign records.
- Simplify forms with progressive disclosure and clear required/optional labels.
- Improve validation and actionable error presentation without leaking sensitive details.
- Distinguish draft, submit, approve, publish, accept, verify, reconcile, deliver and pay.
- Confirm mutation endpoints remain idempotent where required and enforce permissions server-side.

**Exit criteria**
- A user can identify the current state and next permitted action on each critical record.
- No success state appears before server confirmation.
- Rejected, failed, stale and unauthorized actions explain next steps without masking root causes.
- Financial and approval transitions cannot be bypassed from UI or direct API calls.

### Phase 7 — Mobile, accessibility, performance and user testing

**Work**
- Test the critical path at 320, 360, 375, 768 and desktop widths.
- Test keyboard-only and screen-reader navigation for key pages/forms.
- Test slower network and API failure behavior.
- Use representative users/tasks; observe whether they can complete without being coached through the navigation.
- Measure completion time, wrong-route rate, abandonment, blocker comprehension, task resumption and error rate.
- Fix usability defects before broad release rather than accepting responsive screenshots as sufficient.

**Exit criteria**
- No horizontal scrolling on core mobile paths.
- The primary action remains clear and accessible.
- Core workflows remain usable with delayed data and retryable failures.
- Usability findings have been resolved or explicitly tracked with owner and acceptance criteria.

### Phase 8 — Rollout, monitoring and documentation

**Work**
- Release behind a feature flag or staged rollout if the existing architecture supports it safely.
- Compare resolver results with existing task/workflow records.
- Monitor no-action rates, stale-resume rates, authorization denials, resolver latency and task completion.
- Provide a fast rollback to the previous home presentation without data loss.
- Update README, reconciliation docs and operator guidance to use consistent verified/partial/unverified terminology.
- Remove obsolete navigation only after usage and permission checks confirm it is safe.

**Exit criteria**
- Production behavior matches the approved task-selection rules.
- Rollback is tested and does not alter business records.
- Documentation matches verified implementation and CI evidence.
- No rollout decision is based solely on a successful build.

## 12. Critical path acceptance tests

Tests must exercise the server and UI together where feasible, using existing fixtures and realistic workspace boundaries.

### 12.1 Resolver selection

- Assigned lead follow-up due today outranks a low-priority future task.
- An overdue task the user cannot access is never returned.
- A completed, cancelled or archived record is never presented as actionable.
- An item waiting for another role is labelled waiting and does not masquerade as the user's ready action.
- Equal-priority candidates have deterministic tie-breaking.
- An explicit urgent exception follows documented policy and is still permission-filtered.
- A user with no work gets a real empty state, not a fabricated task.
- Resolver errors do not silently become “you have no work”.

### 12.2 Resume safety

- Resume exact record and step after refresh and logout/login.
- Resume works after switching devices when supported by the authenticated account.
- Reassignment, deletion, archive, completion or workflow change invalidates stale resume state safely.
- Workspace switching cannot expose another workspace's record.
- Permission revocation between home render and click blocks the operation server-side.
- A stale URL or tampered record ID cannot bypass authorization.
- Concurrent completion by another user triggers recalculation and a clear message.

### 12.3 Workflow integrity

- Offer publishing respects required fields and approvals.
- Lead ownership and assignment remain server-enforced.
- Quote version/approval/acceptance follows current domain rules.
- Quote acceptance and order creation cannot create duplicate orders on retries.
- Payment evidence submission is not treated as provider verification.
- Payment verification and reconciliation remain distinct.
- Revenue recognition/attribution is based on authoritative evidence and existing policy.
- Commission eligibility and payout are not collapsed into a single UI status.
- Delivery evidence and customer acceptance cannot be substituted with payment state.
- Audit history records meaningful state transitions.

### 12.4 UX and accessibility

- Home shows exactly one visually dominant primary next-action CTA.
- Primary action copy names a real task and its canonical record.
- The task opens the intended record/step rather than a generic module.
- Blocked, waiting, empty, loading, error and unavailable states are distinct.
- Keyboard focus is visible and follows logical order.
- Screen readers receive meaningful names and status information.
- At phone widths, core tasks are usable without horizontal page scrolling.
- Form validation preserves safe user input.
- Repeated submit does not create duplicate records or payments.

### 12.5 Regression and quality gates

Run the repository's established lint, typecheck, unit/integration tests, build and packaging checks. Add targeted tests for new logic. Report exact commands and outcomes against the exact commit under review. Do not disable tests, weaken assertions, skip failing checks, or claim success based only on compilation. Verify current CI status rather than assuming historical green checks still apply.

## 13. Instrumentation and success metrics

Capture privacy-conscious, non-sensitive events such as:

- Resolver selected action category and selection reason.
- User opened primary action / secondary task.
- Resume pointer reused, invalidated or recalculated.
- User encountered a blocker and whether it was resolved.
- Task completed or handed off.
- Resolver latency and error category.
- Wrong-route/backtrack behavior where measurable.

Do not log passwords, tokens, full payment evidence, private message bodies or unnecessary personal/customer data.

Proposed product metrics (establish baseline before setting numeric targets):

- Time from dashboard arrival to first meaningful task action.
- Successful completion rate for the core offer-to-revenue journey.
- Rate of primary-action clicks that reach the intended record.
- Resume success rate after a new session.
- Misnavigation/backtracking rate.
- Abandoned forms and validation-retry rate.
- Blocker resolution time and handoff delay.
- Duplicate submission/record rate.
- Mobile completion rate and task time.
- Resolver latency, failure rate and stale-action rate.

Set targets after the baseline is measured; do not invent performance improvements in advance.

## 14. Risks and controls

| Risk | Control |
|---|---|
| The resolver becomes a second workflow engine | Assemble a read model from existing services and canonical records; domain services own transitions |
| A saved pointer exposes stale or unauthorized data | Reauthorize and reload the record on every resume; use safe fallback |
| Priority rules are opaque or biased toward the wrong work | Document deterministic rules, include selection rationale and test role scenarios |
| A visually simpler UI hides important controls | Keep all authorized routes accessible and validate with role-based walkthroughs |
| Financial steps appear complete too early | Derive progress from authoritative states/evidence; keep verification, reconciliation, revenue and payout distinct |
| New dashboard makes too many expensive queries | Use scoped queries, indexes, bounded candidates and performance tests |
| Role names differ from assumed personas | Map actual permission model first; do not invent role enum values |
| UX errors hide backend failures | Translate known errors while retaining safe diagnostics; unknown errors remain visible |
| Direct-to-main documentation is mistaken for completed code | Keep this document clearly marked as a plan; use a separate reviewed implementation change and verified evidence |
| Static journey documentation contradicts code | Maintain one traceability source and label unverified gaps consistently |

## 15. Implementation rules

1. **Inspect before adding.** Search for existing types, services, APIs, components, tests and migrations before creating new ones.
2. **Canonical records only.** Resume pointers and UI read models reference existing records; they do not duplicate business entities.
3. **Server is authoritative.** Workspace membership, role, permission, valid transition, money state and ownership are checked server-side.
4. **No weakened controls.** Do not remove assertions, disable security checks, loosen tests or bypass approvals to make the UI appear smooth.
5. **No fake success.** The UI reflects persisted server outcomes and displays failures clearly.
6. **Small vertical slices.** Deliver resolver and one critical journey with tests before migrating all dashboard surfaces.
7. **Keep evidence.** Each phase links changed files, tests, screenshots/walkthroughs and unresolved gaps.
8. **Reconcile docs.** Update implementation-status documents only when code and tests support the new status.
9. **Respect existing branch state.** Recheck the target branch HEAD before any later implementation; never overwrite concurrent changes blindly.
10. **Do not treat this plan as authorization to deploy.** Production rollout requires its own acceptance and release checks.

## 16. Recommended first implementation slice

After completing Phase 0, implement a narrow vertical slice:

1. Use an existing assigned lead follow-up or task source that is confirmed authoritative.
2. Resolve the current user's highest-priority actionable item on the server.
3. Render it as the only primary action on the existing My Workbench.
4. Open the exact lead/task record with status, due date, reason and next permitted action.
5. Persist and revalidate the resume pointer.
6. Add resolver, authorization, stale-pointer, workspace-isolation and UI tests.
7. Validate on desktop and phone, then review the evidence before extending the resolver to quotes, orders, payment review and partner workflows.

Choose the first source only after verifying its schema, lifecycle and permissions. If the existing task/follow-up source cannot safely represent the work, document that gap and select the smallest appropriate domain-backed solution instead of creating a speculative generic task engine.

## 17. Definition of done

The redesign is acceptable only when all of the following are evidenced:

- The existing Workbench is the clear primary operating home.
- The user does not have to choose among a grid of competing workflow cards to discover what to do.
- Exactly one primary home action is selected from real, current, authorized business state.
- The action names the task and record, explains why it matters and opens the exact permitted step.
- Resume state survives a new session and is safely revalidated.
- Journey progress and handoffs reflect authoritative records rather than static labels.
- All existing critical business paths remain reachable and their permissions/invariants are preserved.
- Role/workspace isolation, stale state, errors, retries and duplicate submissions are tested.
- Phone-width, keyboard and assistive-technology checks pass for the critical path.
- Lint, typecheck, tests, build and required packaging checks pass on the exact reviewed commit.
- Documentation reflects the actual implementation and clearly separates verified from unverified behavior.
- A rollback path exists and does not mutate business records.

**Acceptance principle:** The interface should make the next correct action obvious without making the underlying system less safe. The goal is not fewer cards for their own sake; it is less uncertainty, fewer wrong turns, clear responsibility, safe resumption and a reliable path from offer setup to received and reconciled revenue.
