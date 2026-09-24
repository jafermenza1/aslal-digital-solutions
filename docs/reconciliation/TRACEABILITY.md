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
| R22 | Quote/proposal | IMPLEMENTED-UNVERIFIED | Versioned Quote/QuoteItem domain, lifecycle API and dashboard workspace deployed; controlled send/revision/acceptance evidence remains. |
| R23 | Negotiation | IMPLEMENTED-UNVERIFIED | NegotiationEvent history and immutable quote revisions preserve offer changes, actors and snapshots; controlled reconstruction evidence remains. |
| R24 | Order | IMPLEMENTED-UNVERIFIED | First-class Order/OrderItem domain, accepted-quote conversion, committed order status, payment state, source/campaign/referral/partner/sales-owner attribution, and sales workspace now exist; production migration and controlled acceptance remain. |
| R25 | Payment | IMPLEMENTED-UNVERIFIED | Provider-neutral Payment domain, idempotency key, explicit payment states, reconciliation states, failure/reversal/refund context, order payment-state propagation, and operator workspace now exist; provider/webhook and production reconciliation acceptance remain. |
| R26 | Revenue attribution | PARTIAL | Deal values exist; collected/recognized revenue must be linked to payment/order evidence. |

## Campaign and partner ecosystem

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R27 | Campaign | IMPLEMENTED-UNVERIFIED | First-class PartnerCampaign lifecycle, budgets, partner budget, reward model, dates, status and product linkage now exist; production campaign acceptance remains. |
| R28 | Campaign asset/content | PARTIAL | Campaign partner matching and referral distribution exist, but a first-class creative/asset/post/QR/offline-placement entity remains incomplete. |
| R29 | Partner/referral journey | PARTIAL | Partner identity → campaign → application/invitation → referral attribution and partner performance now exist; order/payment/revenue reconstruction remains open. |
| R30 | Commission lifecycle | PARTIAL | Existing commission status operations plus Phase F payout ledger/dispute controls exist; confirmed-payment-derived calculation remains gated on Order/Payment. |
| R31 | Influencer/agent workspace | IMPLEMENTED-UNVERIFIED | Partner portal now exposes profile, campaign opportunities, application, earnings/payout history and disputes; controlled partner acceptance and mobile evidence remain. |
| R32 | Supplier/product partner model | PARTIAL | Product provider/relationship exists and campaigns can link to products; explicit product eligibility, supplier workspace and commercial relationship controls remain. |

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
| R41 | Mobile/low-bandwidth | PARTIAL | Shared permission-aware shell, mobile navigation, compact cards and responsive template/catalog surfaces are implemented; controlled critical-path/device/network testing remains. |
| R42 | Production integrity | IMPLEMENTED-UNVERIFIED | Endpoint/workflow exists; configure secrets and record a successful run. |

## End-to-end and intelligence

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R43 | Complete demand-to-revenue journey | MISSING | Need acquisition → engagement → lead → quote → order → payment → customer → revenue → attribution → retention proof. |
| R44 | Business ROI reporting | PARTIAL | Existing insights use deal values; needs confirmed paid-revenue source and campaign assets. |
| R45 | AI-assisted intelligence | MISSING / DEFERRED | Begin only after reliable transaction/attribution data and human-control gates exist. |
| R46 | Product/service catalog | IMPLEMENTED-UNVERIFIED | Admin catalog manager, database-backed public /products, rich detail pages, optional imagery, product-ID contact attribution and gold-hover catalog links are implemented; CI/deployment and production acceptance remain. |
| R47 | Offline/manual lead capture | IMPLEMENTED-UNVERIFIED | Admin-authorized offline lead form captures source/category, campaign/location/reference and optional product interest, then enters the normal Lead/Person/StageHistory/scoring/Phase 5 workflow. |
| R48 | Transactional contact auto-reply | IMPLEMENTED-UNVERIFIED | Consent-gated rich HTML email template, product/service-aware request summary, canonical Email conversation/message, provider result persistence and multi-template admin UI are implemented; provider/deployment/controlled acceptance remains. |
| R49 | User roles and editable permissions | PARTIAL | Database User/UserAudit models, role defaults, editable grants/revokes, managed login, user-management UI and permission-filtered dashboard navigation are implemented; legacy routes still need full permission enforcement and shared tenant isolation remains a separate gate. |

## Reconciliation rules

A future PR must identify affected R-IDs and provide business outcome, data/API/UI effect, migration/rollback risk and acceptance evidence.

Phase 5 implementation is now on mainline. Status remains IMPLEMENTED-UNVERIFIED/PARTIAL until scheduled production execution and acceptance evidence are retained.\n\nPhase 6A implementation is now on mainline and deployed through Emerald. R22/R23 remain IMPLEMENTED-UNVERIFIED until a controlled quote is sent, revised, accepted/rejected and reconstructed from production history.

Statuses can move only when the evidence required by the row is present.

No requirement may be upgraded because of marketing pressure, feature availability, or a successful build alone.
