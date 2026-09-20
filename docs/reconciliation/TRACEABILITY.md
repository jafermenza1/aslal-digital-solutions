# PRD Traceability Baseline

## Purpose

This matrix is the minimum reconciliation record for PRD-GROWTH-OS-001 v1.0.

The current state describes repository evidence only. It does not claim that the corresponding business outcome works in production.

The acceptance evidence column defines what must be demonstrated before the requirement can become SATISFIED.

| ID | PRD outcome | Current repository evidence | Current status | Required reconciliation evidence | Planned phase |
|---|---|---|---|---|---|
| R01 | First-party visitor tracking | Visitor/Event/tracking foundation exists | PARTIAL | Verified page, product, referral and meaningful-event journeys persist correctly | 3 |
| R02 | Anonymous identity protection | Anonymous visitor identifier exists | PARTIAL | Verified anonymous activity never becomes a claimed person without legitimate identification | 3 |
| R03 | Controlled business event taxonomy | Generic Event model/tracking exists | PARTIAL | Canonical event constants plus instrumentation and tests cover required events | 3 |
| R04 | Growth Opportunity | No dedicated commercial opportunity for anonymous high-intent activity | MISSING | High-intent anonymous signal can be reviewed without false identity assignment | 3 |
| R05 | Lead capture | Lead API and Lead model exist | PARTIAL | Persistence, response, attribution, duplicate behavior and failure paths verified | 2 |
| R06 | Transparent lead scoring | Lead scoring utility exists | PARTIAL | Required PRD scoring semantics are reconciled and tested against actual events | 2/3 |
| R07 | Lead ownership | Task assignment exists; no canonical lead owner | MISSING | Active lead has one explicit owner and ownership changes are audited | 2 |
| R08 | Required next action | LeadTask exists | PARTIAL | Active lead cannot remain operationally orphaned without a next action or explicit terminal reason | 2 |
| R09 | Sales stages | LeadStatus and stage history exist | PARTIAL | Stage transitions, reasons, ownership and next actions satisfy PRD acceptance rules | 2 |
| R10 | Opportunity entity | Lead currently carries commercial state | MISSING | Opportunity supports one or more commercial pursuits independently of Lead identity | 3 |
| R11 | Customer entity | WON is represented on Lead | MISSING | Customer record is created from a verified sale and linked to the originating journey | 3 |
| R12 | Unified customer timeline | Events, notes and stage history are separate | PARTIAL | Chronological activity timeline combines all relevant activity without duplicate semantics | 3 |
| R13 | Email channel | No unified messaging subsystem | MISSING | Inbound/outbound email is stored, attributable, permission-aware and human-readable in timeline | 4 |
| R14 | SMS channel | No SMS adapter | MISSING | Provider adapter supports Ethiopian numbers, delivery state and opt-out | 4 |
| R15 | Telegram sales channel | Telegram entry point exists | PARTIAL | Bot qualification, lead update, attribution, history and handoff are verified | 4 |
| R16 | WhatsApp sales channel | WhatsApp CTA exists | PARTIAL | Official provider integration, inbound capture, templates, history and handoff are verified | 4 |
| R17 | Messenger sales channel | No demonstrated integration | MISSING | Supported Meta business messaging flow is verified end-to-end | 4 |
| R18 | Human handoff | No unified conversation state | MISSING | Human ownership stops/reroutes configured automation and preserves history | 4/5 |
| R19 | Automation engine | Manual LeadTask workflow only | MISSING | Trigger/condition/action/delay/execution/retry/stop model is operational | 5 |
| R20 | Automation safety | No workflow execution model | MISSING | WON, LOST, opt-out, reply, handoff, expiry and disable states terminate applicable automation | 5 |
| R21 | Campaign entity | Campaign strings exist on attribution records | PARTIAL | Campaign and asset records connect acquisition to downstream commercial outcomes | 6 |
| R22 | Content/post attribution | Referral link/campaign data exist | PARTIAL | Partner post/creative/channel attribution survives to customer and revenue | 6 |
| R23 | Partner/referral journey | Partner/referral/click models exist | PARTIAL | Partner → campaign → referral → visitor → sale chain is demonstrably reconstructable | 6 |
| R24 | Commission lifecycle | Commission statuses and operations exist | PARTIAL | All transitions are auditable and linked to the actual commercial outcome | 6 |
| R25 | Revenue model | Deal value/WON fields exist | PARTIAL | Revenue is separated from pipeline value and can link to payment/order evidence | 6 |
| R26 | Payment abstraction | No payment/order model | MISSING | ETB payment provider adapter and reconciliation flow are verified | 6 |
| R27 | Ethiopian phone normalization | Phone is stored as free text | MISSING | Canonical Ethiopian phone representation is applied consistently | 2/4 |
| R28 | English/Amharic/Afaan Oromoo | Current locale support is incomplete | PARTIAL | All three languages can be selected and customer preference is stored | 2/4 |
| R29 | Communication preferences | No canonical preference model | MISSING | Channel consent/opt-out/preferences are stored and enforced | 4/5 |
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
