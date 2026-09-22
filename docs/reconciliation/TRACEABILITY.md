# PRD Traceability Baseline

## Purpose

This matrix is the minimum reconciliation record for PRD-GROWTH-OS-001 v1.0.

The current state describes repository evidence only. It does not claim that the corresponding business outcome works in production.

The acceptance evidence column defines what must be demonstrated before the requirement can become SATISFIED.

| ID | PRD outcome | Current repository evidence | Current status | Required reconciliation evidence | Planned phase |
|---|---|---|---|---|---|
| R01 | First-party visitor tracking | Visitor/Event/tracking foundation plus canonical taxonomy and journey linkage | IMPLEMENTED-UNVERIFIED | Verified page, product, referral and meaningful-event journeys persist correctly | 3 |
| R02 | Anonymous identity protection | Anonymous visitor plus explicit Growth Opportunity boundary | IMPLEMENTED-UNVERIFIED | Verified anonymous activity never becomes a claimed person without legitimate identification | 3 |
| R03 | Controlled business event taxonomy | Canonical business-event taxonomy enforced at tracking boundary | IMPLEMENTED-UNVERIFIED | Canonical event constants plus instrumentation and tests cover required events | 3 |
| R04 | Growth Opportunity | GrowthOpportunity records high-intent anonymous signals without Person identity | IMPLEMENTED-UNVERIFIED | High-intent anonymous signal can be reviewed without false identity assignment | 3 |
| R05 | Lead capture | Lead API persists attribution, phone normalization, Person identity, and sales triage fields | IMPLEMENTED-UNVERIFIED | Persistence, response, attribution, duplicate behavior and failure paths verified | 2 |
| R06 | Transparent lead scoring | Existing transparent scoring preserved and recalculated on tracked lead activity | IMPLEMENTED-UNVERIFIED | Required PRD scoring semantics are reconciled and tested against actual events | 2/3 |
| R07 | Lead ownership | Canonical owner plus configured sales-queue owner on new capture | IMPLEMENTED-UNVERIFIED | Active lead has one explicit owner and ownership changes are audited | 2 |
| R08 | Required next action | Active-state enforcement plus capture-time triage action/deadline | IMPLEMENTED-UNVERIFIED | Active lead cannot remain operationally orphaned without a next action or explicit terminal reason | 2 |
| R09 | Sales stages | Stage changes remain explicit and auditable with execution controls | IMPLEMENTED-UNVERIFIED | Stage transitions, reasons, ownership and next actions satisfy PRD acceptance rules | 2 |
| R10 | Opportunity entity | Distinct Opportunity model linked to Lead | IMPLEMENTED-UNVERIFIED | Opportunity supports one or more commercial pursuits independently of Lead identity | 3 |
| R11 | Customer entity | Distinct Customer created through controlled WON conversion | IMPLEMENTED-UNVERIFIED | Customer record is created from a verified sale and linked to the originating journey | 3 |
| R12 | Unified customer timeline | Chronological timeline combines visitor events, activities, stage history, notes, tasks, and message activities | IMPLEMENTED-UNVERIFIED | Chronological activity timeline combines all relevant activity without duplicate semantics | 3 |
| R13 | Email channel | Canonical Conversation/Message model plus configurable Email adapter and controlled acceptance path | IMPLEMENTED-UNVERIFIED | Inbound/outbound email is stored, attributable, permission-aware and human-readable in timeline | 4 |
| R14 | SMS channel | Canonical Conversation/Message model plus configurable SMS adapter, Ethiopian phone normalization, opt-out enforcement, and controlled acceptance path | IMPLEMENTED-UNVERIFIED | Provider adapter supports Ethiopian numbers, delivery state and opt-out | 4 |
| R15 | Telegram sales channel | Telegram adapter, canonical Conversation/Message records, signed inbound boundary, consent gate, handoff, and controlled acceptance path | IMPLEMENTED-UNVERIFIED | Bot qualification, lead update, attribution, history and handoff are verified | 4 |
| R16 | WhatsApp sales channel | Official Graph API adapter, canonical Conversation/Message records, consent gate, handoff, and controlled acceptance path | IMPLEMENTED-UNVERIFIED | Official provider integration, inbound capture, templates, history and handoff are verified | 4 |
| R17 | Messenger sales channel | Official Graph API adapter, canonical Conversation/Message records, consent gate, handoff, and controlled acceptance path | IMPLEMENTED-UNVERIFIED | Supported Meta business messaging flow is verified end-to-end | 4 |
| R18 | Human handoff | Conversation HUMAN_HANDOFF state, operator assignment, ownership enforcement, and acceptance controls | IMPLEMENTED-UNVERIFIED | Human ownership stops/reroutes configured automation and preserves history | 4/5 |
| R19 | Automation engine | Manual LeadTask workflow only | MISSING | Trigger/condition/action/delay/execution/retry/stop model is operational | 5 |
| R20 | Automation safety | No workflow execution model | MISSING | WON, LOST, opt-out, reply, handoff, expiry and disable states terminate applicable automation | 5 |
| R21 | Campaign entity | Campaign strings exist on attribution records | PARTIAL | Campaign and asset records connect acquisition to downstream commercial outcomes | 6 |
| R22 | Content/post attribution | Referral link/campaign data exist | PARTIAL | Partner post/creative/channel attribution survives to customer and revenue | 6 |
| R23 | Partner/referral journey | Partner/referral/click models exist | PARTIAL | Partner → campaign → referral → visitor → sale chain is demonstrably reconstructable | 6 |
| R24 | Commission lifecycle | Commission statuses and operations exist | PARTIAL | All transitions are auditable and linked to the actual commercial outcome | 6 |
| R25 | Revenue model | Deal value/WON fields exist | PARTIAL | Revenue is separated from pipeline value and can link to payment/order evidence | 6 |
| R26 | Payment abstraction | No payment/order model | MISSING | ETB payment provider adapter and reconciliation flow are verified | 6 |
| R27 | Ethiopian phone normalization | Capture normalizes valid Ethiopian 09 and 07 numbers to canonical +251 form | IMPLEMENTED-UNVERIFIED | Canonical Ethiopian phone representation is applied consistently | 2/4 |
| R28 | English/Amharic/Afaan Oromoo | Shared locale contract includes English, Amharic, and Afaan Oromoo | IMPLEMENTED-UNVERIFIED | All three languages can be selected and customer preference is stored | 2/4 |
| R29 | Communication preferences | Canonical CommunicationPreference model with per-channel permission and global opt-out enforcement | IMPLEMENTED-UNVERIFIED | Channel consent/opt-out/preferences are stored and enforced | 4/5 |
| R30 | Privacy lifecycle | Basic security/tracking boundaries exist | PARTIAL | Retention, export, deletion/anonymization and purpose controls are demonstrated | 6/7 |
| R31 | RBAC | Single-admin authentication exists | PARTIAL | Users, roles and permissions enforce access to CRM, partner, finance and system data | 2/7 |
| R32 | Audit log | Stage history is present | PARTIAL | Sensitive administrative and automation actions have immutable audit evidence | 5/7 |
| R33 | CRM workspace | Lead/dashboard/partner/insights screens exist | PARTIAL | Required Overview, Leads, Pipeline, Customers, Activities, Conversations, Automation, Analytics, Audit and Settings workflows exist and work | 2–7 |
| R34 | Low-bandwidth/mobile operation | Existing web application and SSR architecture | PARTIAL | Controlled mobile/slow-network tests demonstrate critical journey completion | 2–7 |
| R35 | Deployment integrity | GitHub CI and standalone packaging exist | PARTIAL | main source, production artifact, Prisma engines and Emerald runtime remain aligned | 1/2 |
| R36 | End-to-end Growth OS journey | Current system has only portions of the chain | MISSING | Controlled journey reaches customer/revenue/commission and is reconstructable from one connected record | 7 |

## Status rule

Statuses are deliberately conservative. A repository module is evidence that code exists, not evidence that a PRD outcome is satisfied.

Allowed statuses are exactly: MISSING, PARTIAL, IMPLEMENTED-UNVERIFIED, SATISFIED, BLOCKED.

The next reconciliation work must replace repository-level guesses with explicit acceptance tests and, where applicable, production-safe verification.

## Required traceability invariant

Every future implementation PR must reference the relevant R-ID(s).

Every R-ID changed by a PR must state:
- what business outcome changes;
- what data changes;
- what API/workflow changes;
- what UI changes;
- what acceptance evidence proves the outcome;
- what migration or rollback risk exists.

No implementation PR should introduce an untracked Growth OS capability.

The execution handoff is maintained in docs/reconciliation/EXECUTION-STATE.md. Corrections remain owned by their current phase and must not change the roadmap pointer.
