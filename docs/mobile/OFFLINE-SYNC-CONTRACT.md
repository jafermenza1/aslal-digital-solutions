# Aslal Mobile Offline and Synchronization Contract

Status: Foundation contract
Scope: mobile local persistence, queued mutations and server synchronization

## 1. Purpose

The mobile client must remain useful during poor or intermittent connectivity without creating a second source of truth.

Local storage is a working cache and an outbox. The Aslal API remains authoritative.

## 2. Data classes

### A. Offline-first operational data
May be created or edited locally and synchronized:
- lead drafts/capture
- lead notes
- non-financial lead metadata
- follow-up tasks
- task completion requests
- field visit notes
- conversation drafts
- selected partner/campaign notes

### B. Cached read data
May be viewed offline after a successful sync:
- assigned leads
- recent customers
- recent conversations
- tasks
- products/services
- campaigns available to the user
- partner/referral summaries
- recent orders and server payment status

### C. Server-authoritative data
Never becomes confirmed locally:
- payment confirmation
- reconciliation
- recognized revenue
- commission eligibility/approval
- payout settlement
- workspace membership
- permissions
- role changes
- destructive administrative changes
- external message delivery

## 3. Local record state

Every local mutation has:
- operationId: globally unique UUID
- deviceId
- workspaceId
- entity
- action
- payload
- clientCreatedAt
- attemptCount
- localStatus

Allowed localStatus values:
- QUEUED
- SYNCING
- ACCEPTED
- FAILED
- CONFLICT

A queued operation remains retryable unless it is explicitly rejected as invalid.

## 4. Idempotency

The server must treat operationId as an idempotency key.

Retrying the same operation after:
- timeout
- app restart
- network loss
- duplicate submit
must not create duplicate business records.

This is mandatory for lead capture and required before extending the pattern to financial mutations.

## 5. Pull/push model

Conceptual API:

POST /api/mobile/sync/push
GET /api/mobile/sync/pull?cursor=<cursor>

Push request:

{
  "deviceId": "...",
  "workspaceId": "...",
  "operations": [
    {
      "operationId": "...",
      "entity": "lead",
      "action": "create",
      "clientCreatedAt": "...",
      "payload": {}
    }
  ]
}

Push response:

{
  "accepted": [],
  "rejected": [],
  "conflicts": [],
  "serverChanges": [],
  "nextCursor": "..."
}

The exact endpoint schema is an implementation target, not permission to bypass existing domain APIs.

## 6. Authorization

The server evaluates each operation using the current authenticated user and workspace.

Required checks:
1. valid session
2. active user
3. authorized workspace membership/administrative access
4. required permission
5. target record belongs to the workspace
6. state transition is allowed
7. operationId has not already been consumed

A stale locally stored permission must never grant access.

## 7. Conflict policy

Do not use unconditional last-write-wins.

Low-risk additive data such as notes may be merged/appended where safe.

Critical fields require server authority and explicit conflict handling:
- lead stage
- lead owner
- deal value
- attribution
- order status
- payment status
- financial state
- workspace ownership

Conflict response should preserve the local attempt for review rather than silently discard it.

## 8. Connectivity states

The app exposes:
- LIVE — server reachable and last sync recent
- LIMITED — server reachable intermittently; queue may grow
- OFFLINE — no usable connection
- SYNCING — queued work is being transmitted
- ATTENTION — one or more operations failed/conflicted

The UI must not imply that a queued operation is completed.

## 9. Retry policy

Use bounded exponential retry for transient failures.

Do not retry indefinitely for:
- authorization failure
- validation failure
- workspace mismatch
- invalid state transition

Those become FAILED/CONFLICT and require user/server resolution.

## 10. Local cache rules

Cache only data needed for the mobile role and active workspace.

Do not download the entire database.

The cache must be cleared or re-scoped when:
- the user signs out;
- workspace access changes;
- the active workspace changes where isolation requires it.

Financial data should be minimized in local persistence.

## 11. Sync order

Recommended order:
1. authenticate
2. establish active workspace
3. pull server changes
4. push safe queued mutations
5. resolve accepted/rejected/conflicted operations
6. pull again for authoritative state
7. update local cursor

A financial or sensitive server-authoritative operation must not be simulated locally while waiting for step 4.

## 12. Acceptance criteria

Offline foundation is accepted when:
- a lead can be captured without connectivity;
- the lead visibly shows QUEUED;
- app restart does not lose it;
- reconnection pushes it once;
- duplicate retry does not create a second lead;
- workspace mismatch is rejected;
- permission changes on the server take effect;
- conflicts are visible;
- payment confirmation cannot be faked offline;
- the user can inspect sync state.
