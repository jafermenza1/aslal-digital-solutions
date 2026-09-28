# Aslal Mobile Product Contract

Status: Contract for the first mobile product architecture
Scope: Expo/React Native client of the existing Aslal Growth OS

## 1. Product identity

Aslal Mobile is an operational companion to the Aslal Growth OS. It is not a mobile copy of the public website and it is not a second backend.

The mobile client uses the existing Aslal APIs, authentication, workspace authorization, business rules and database. The mobile client never connects directly to MySQL.

Primary mobile promise:

> Show the user what needs attention, let them capture or execute the next safe action quickly, and keep working when connectivity is unreliable.

## 2. Mobile principles

1. Action-first: Today and Inbox are more important than navigation.
2. Role-aware: the app presents only workflows relevant to the user's permissions.
3. Journey-first: a person/customer journey is more useful than isolated database tables.
4. Low-bandwidth-first: cached operational information remains useful when connectivity is weak.
5. Offline-safe: local work is allowed only where server confirmation is not required.
6. Financially conservative: payment, reconciliation, revenue, commission and payout state remain server-authoritative.
7. Workspace-safe: every read and mutation is scoped to an authorized workspace on the server.
8. Human-assisted: automation can surface work, but mobile does not silently invent business outcomes.
9. Resumable: interrupted work should return to the user rather than disappear.
10. Observable: connection and synchronization state are visible.

## 3. Core mobile journeys

### Sales
Lead capture → qualification → conversation → follow-up → opportunity → quote → order → payment status → customer.

### Partner
Campaign → approved content/referral → lead → qualified lead → customer → eligible earnings → payout status.

### Client
Business overview → demand → leads → customers → orders → commercial performance.

### Finance
Order → payment evidence → server confirmation → reconciliation → revenue → commission/payout state.

### Manager/Admin
Today → exceptions → pipeline → workload → partner/campaign performance → controlled administration.

## 4. Mobile information hierarchy

Default:
- Today
- Inbox
- Leads
- Tasks
- More

Role substitutions:
- Partner: Home, Campaigns, Referrals, Earnings, More
- Client: Overview, Leads, Customers, Reports, More
- Finance: Today, Orders, Payments, Exceptions, More
- Admin/Manager: Command, Sales, Partners, Finance, More

The exact navigation is permission-derived. The client must not assume that role alone grants access.

## 5. Required first-release capabilities

Required:
- authentication/session refresh
- workspace selection
- Today/action center
- lead list and lead detail
- quick lead capture
- offline lead capture
- follow-up/task handling
- conversation context
- customer records
- customer journey
- product/service reference
- order status
- payment status
- partner/campaign surfaces for authorized users
- referral/earnings visibility for partners
- visible connectivity state
- sync center
- retryable offline outbox

Selective/server-authoritative:
- quote creation and revision
- payment evidence submission
- payment confirmation
- reconciliation
- revenue recognition
- commission/payout transitions
- permission/role changes
- destructive administration

Not a first-release target:
- full CMS
- full website navigation
- large desktop tables
- migration/production controls
- complex permission administration
- advanced template editors
- database-style bulk administration

## 6. UX contract

Every important record should answer:
- Who/what is this?
- Which workspace?
- What happened?
- What is the current state?
- What needs to happen next?
- Who owns it?
- When is it due?
- Can I act now?
- If offline, what will happen?

The primary screen should prioritize:
1. overdue/high-risk work
2. new human replies
3. new high-intent leads
4. payment/reconciliation exceptions for authorized finance users
5. assigned tasks
6. pipeline movement
7. compact performance context

## 7. Financial integrity

The mobile app may display server-confirmed financial state.

It must never locally declare:
- payment confirmed
- payment reconciled
- revenue recognized
- commission eligible/approved
- payout completed

A local action can be queued as a request or evidence draft. The server decides whether the transition is valid.

## 8. Security and tenancy

The mobile client stores only the minimum session material needed for the mobile session. Workspace authorization is performed server-side.

Every server mutation must re-check:
- authenticated user
- requested workspace
- permission
- target record ownership
- state transition rules

Client-supplied workspace IDs are hints, not authorization.

## 9. Definition of done for mobile foundation

The foundation is complete when:
- the product contract is documented;
- role-based information architecture is documented;
- offline/sync states are documented;
- mobile shell is role-aware;
- mobile has no direct database access;
- no mobile screen depends on an unscoped global overview endpoint;
- financial actions remain server-authoritative;
- synchronization can be added without redesigning every feature;
- the APK UX can be locked from these contracts rather than from the website layout.

## Current implementation status — 2026-09-28

The mobile foundation now includes authenticated workspace bootstrap, role-aware navigation, a real workspace-scoped lead inbox/journey, offline lead capture, persistent SQLite outbox/cache, and the first authenticated sync push/pull slice. APK visual UX remains intentionally unlocked until local typecheck/Expo Doctor and the first native preview build pass.