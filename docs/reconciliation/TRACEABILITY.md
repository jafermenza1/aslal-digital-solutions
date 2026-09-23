# Growth OS Traceability Baseline

This matrix reconciles the current implementation against the target-state product.

A capability is not accepted merely because code, schema, UI, API or an adapter exists.

## Acquisition, identity and sales

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R01 | First-party visitor tracking | IMPLEMENTED-UNVERIFIED | Visitor/Event foundation exists; controlled production journey proof required. |
| R02 | Anonymous identity protection | SATISFIED | Visitor/Person boundary and non-identity Growth Opportunity behavior accepted. |
| R03 | Canonical business-event taxonomy | IMPLEMENTED-UNVERIFIED | Taxonomy exists; complete coverage and repeatable test proof required. |
| R04 | Growth Opportunity | SATISFIED | Anonymous high-intent signal exists without identity fabrication. |
| R05 | Lead capture | IMPLEMENTED-UNVERIFIED | Capture, attribution, normalization and triage exist; fresh production behavioral verification required. |
| R06 | Transparent lead scoring | IMPLEMENTED-UNVERIFIED | Explainable scoring exists; semantics/test evidence still required. |
| R07 | Lead ownership | IMPLEMENTED-UNVERIFIED | Owner assignment and admin correction exist; post-migration integrity proof required. |
| R08 | Required next action | IMPLEMENTED-UNVERIFIED | Active-state enforcement exists; historical gaps require real business correction. |
| R09 | Sales stages | IMPLEMENTED-UNVERIFIED | Stage history exists; full acceptance evidence remains. |
| R10 | Opportunity | IMPLEMENTED-UNVERIFIED | Distinct model exists; independent commercial-pursuit acceptance remains. |
| R11 | Customer | IMPLEMENTED-UNVERIFIED | Controlled conversion exists; verified sale/customer linkage remains to be demonstrated end-to-end. |
| R12 | Unified timeline | IMPLEMENTED-UNVERIFIED | Events, activities, tasks, notes, stage and messages can feed the timeline; complete acceptance remains. |

## Communication

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R13 | Email | SATISFIED for current scope | SMTP/IMAP authentication and actual mailbox send/retrieval were verified previously. |
| R14 | SMS | IMPLEMENTED-UNVERIFIED | Adapter foundation exists; provider-specific live verification remains. |
| R15 | Telegram | IMPLEMENTED-UNVERIFIED | Adapter/simulation exists; live bot workflow remains. |
| R16 | WhatsApp | IMPLEMENTED-UNVERIFIED | Official adapter/simulation exists; business account, templates, webhooks and live proof remain. |
| R17 | Messenger | IMPLEMENTED-UNVERIFIED | Official adapter/simulation exists; provider configuration/live proof remains. |
| R18 | Human handoff | SATISFIED | HUMAN_HANDOFF ownership and outbound gate exist. |
| R19 | Communication preferences | SATISFIED | Per-channel permission and global opt-out are enforced. |

## Automation and commerce

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R20 | Automation engine | IMPLEMENTED-UNVERIFIED | Durable Workflow/Version/Execution/ActionExecution models, trigger conditions, delayed actions, retries, stale recovery, internal actions and scheduler exist; production scheduler/execution evidence remains. |
| R21 | Automation safety | PARTIAL | Reply and terminal-state cancellation, disable handling, retries, execution audit, operator visibility and internal-only action boundaries exist; production acceptance plus customer-message safety/consent gates remain open. |
| R22 | Quote/proposal | MISSING | Need first-class versioned commercial offer. |
| R23 | Negotiation | MISSING | Need reconstructable offer-change history. |
| R24 | Order | MISSING | Need first-class committed transaction independent of lead stage. |
| R25 | Payment | MISSING | Need provider-neutral transaction, idempotency and reconciliation. |
| R26 | Revenue attribution | PARTIAL | Deal values exist; collected/recognized revenue must be linked to payment/order evidence. |

## Campaign and partner ecosystem

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R27 | Campaign | PARTIAL | Campaign/source strings exist; first-class lifecycle is missing. |
| R28 | Campaign asset/content | PARTIAL | Referral/source context exists; asset/post/QR/offline placement entity is missing. |
| R29 | Partner/referral journey | PARTIAL | Partner/referral/click chain exists; complete sale/payment reconstruction remains. |
| R30 | Commission lifecycle | PARTIAL | Status operations exist; calculation must derive from confirmed commercial outcomes. |
| R31 | Influencer/agent workspace | PARTIAL | Partner dashboard and referral operations exist; self-service distribution needs completion. |
| R32 | Supplier/product partner model | PARTIAL | Product provider/relationship exists; product eligibility and supplier workflow need completion. |

## Trust, customer lifecycle and platform

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R33 | Trust profile | MISSING | Need legitimate business identity/policy/support/verification presentation. |
| R34 | Reviews/testimonials | MISSING | Need permissioned request, provenance and publication controls. |
| R35 | Retention | MISSING | Need onboarding, repeat purchase, renewal, cross-sell and reactivation. |
| R36 | Customer referral | PARTIAL | Referral foundation exists; customer advocacy must be distinct from partner attribution. |
| R37 | RBAC | PARTIAL | Authentication exists; full role matrix remains. |
| R38 | Multi-tenancy | MISSING | No accepted Workspace/Tenant isolation model. |
| R39 | Privacy lifecycle | PARTIAL | Communication preferences exist; retention/export/deletion/anonymization remains. |
| R40 | Audit | PARTIAL | Lead/stage/admin and automation execution history now exist; financial, attribution and permission coverage remains. |
| R41 | Mobile/low-bandwidth | PARTIAL | Responsive operations tabs and mobile cards now exist; controlled critical-path/device/network testing remains across the wider dashboard. |
| R42 | Production integrity | IMPLEMENTED-UNVERIFIED | Endpoint/workflow exists; configure secrets and record a successful run. |

## End-to-end and intelligence

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R43 | Complete demand-to-revenue journey | MISSING | Need acquisition → engagement → lead → quote → order → payment → customer → revenue → attribution → retention proof. |
| R44 | Business ROI reporting | PARTIAL | Existing insights use deal values; needs confirmed paid-revenue source and campaign assets. |
| R45 | AI-assisted intelligence | MISSING / DEFERRED | Begin only after reliable transaction/attribution data and human-control gates exist. |

## Reconciliation rules

A future PR must identify affected R-IDs and provide business outcome, data/API/UI effect, migration/rollback risk and acceptance evidence.

Phase 5 implementation is now on mainline. Status remains IMPLEMENTED-UNVERIFIED/PARTIAL until scheduled production execution and acceptance evidence are retained.

Statuses can move only when the evidence required by the row is present.

No requirement may be upgraded because of marketing pressure, feature availability, or a successful build alone.
