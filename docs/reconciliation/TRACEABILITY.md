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
| R26 | Revenue attribution | IMPLEMENTED-UNVERIFIED | Confirmed/reconciled payment creates workspace-scoped recognized/commissionable revenue; controlled financial journey and correction evidence remain required. |

## Campaign and partner ecosystem

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R27 | Campaign | IMPLEMENTED-UNVERIFIED | First-class PartnerCampaign lifecycle, budgets, partner budget, reward model, dates, status and product linkage now exist; production campaign acceptance remains. |
| R28 | Campaign asset/content | IMPLEMENTED-UNVERIFIED | First-class CampaignAsset domain, tracking code, asset URL/content, placement and campaign linkage exist; controlled campaign-asset attribution evidence remains. |
| R29 | Partner/referral journey | IMPLEMENTED-UNVERIFIED | Partner identity → campaign → application/invitation → referral attribution → order → payment → reconciled revenue is now traceable; controlled production reconstruction remains. |
| R30 | Commission lifecycle | IMPLEMENTED-UNVERIFIED | Confirmed/reconciled payment derives commission, dedicated commission approval permission exists, payout settlement controls PAID; behavioral approval/payout evidence remains. |
| R31 | Influencer/agent workspace | IMPLEMENTED-UNVERIFIED | Partner portal now exposes profile, campaign opportunities, application, earnings/payout history and disputes; controlled partner acceptance and mobile evidence remain. |
| R32 | Supplier/product partner model | PARTIAL | Product provider/relationship exists and campaigns can link to products; explicit product eligibility, supplier workspace and commercial relationship controls remain. |

## Trust, customer lifecycle and platform

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R33 | Trust profile | MISSING | Need legitimate business identity/policy/support/verification presentation. |
| R34 | Reviews/testimonials | MISSING | Need permissioned request, provenance and publication controls. |
| R35 | Retention | MISSING | Need onboarding, repeat purchase, renewal, cross-sell and reactivation. |
| R36 | Customer referral | PARTIAL | Referral foundation exists; customer advocacy must be distinct from partner attribution. |
| R37 | RBAC | PARTIAL | Explicit Finance/Auditor/Client roles, editable permissions and workspace roles exist; full legacy-route enforcement and behavioral isolation evidence remain. |
| R38 | Multi-tenancy | PARTIAL / SCALE GATED | Workspace model, membership and many workspace-scoped commercial queries exist; shared SaaS tenant acceptance and trusted public workspace routing remain open. |
| R39 | Privacy lifecycle | PARTIAL | Communication preferences exist; retention/export/deletion/anonymization remains. |
| R40 | Audit | PARTIAL | Lead/admin/automation and dispute audit exist; payment/revenue/commission/payout and attribution override coverage is being closed and still requires evidence. |
| R41 | Mobile/low-bandwidth | PARTIAL | Shared permission-aware shell, mobile navigation, compact cards and responsive template/catalog surfaces are implemented; controlled critical-path/device/network testing remains. |
| R42 | Production integrity | IMPLEMENTED-UNVERIFIED | Endpoint/workflow exists; configure secrets and record a successful run. |

## End-to-end and intelligence

| ID | Requirement | Current status | Evidence/remaining proof |
|---|---|---|---|
| R43 | Complete demand-to-revenue journey | IMPLEMENTED-UNVERIFIED | Connected lead → customer → quote → order → payment → reconciliation → revenue → commission/payout chain exists; full behavioral reconstruction and retention remain unverified. |
| R44 | Business ROI reporting | PARTIAL | Revenue records now provide a confirmed paid-revenue source; reporting still needs campaign-asset attribution and production acceptance. |
| R45 | AI-assisted intelligence | MISSING / DEFERRED | Begin only after reliable transaction/attribution data and human-control gates exist. |
| R46 | Product/service catalog | IMPLEMENTED-UNVERIFIED | Admin catalog manager, database-backed public /products, rich detail pages, optional imagery, product-ID contact attribution and gold-hover catalog links are implemented; CI/deployment and production acceptance remain. |
| R47 | Offline/manual lead capture | IMPLEMENTED-UNVERIFIED | Admin-authorized offline lead form captures source/category, campaign/location/reference and optional product interest, then enters the normal Lead/Person/StageHistory/scoring/Phase 5 workflow. |
| R48 | Transactional contact auto-reply | IMPLEMENTED-UNVERIFIED | Consent-gated rich HTML email template, product/service-aware request summary, canonical Email conversation/message, provider result persistence and multi-template admin UI are implemented; provider/deployment/controlled acceptance remains. |
| R49 | User roles and editable permissions | PARTIAL | Database User/UserAudit models, role defaults, editable grants/revokes, managed login, user-management UI and permission-filtered dashboard navigation are implemented; legacy routes still need full permission enforcement and shared tenant isolation remains a separate gate. |

## Commercial Engine gap-closure traceability

The following requirements extend the existing baseline without invalidating earlier R-IDs. They identify the detailed commercial gaps that must be reconciled against existing entities and workflows.

| ID | Requirement | Target behavior | Initial status |
|---|---|---|---|
| R50 | Commercial listing | Publish controlled products/assets/properties/services with owner, status and distribution controls. | IMPLEMENTED-UNVERIFIED | CE-1 schema, migration, workspace-scoped owner API/UI and public listing surface are implemented; migration, typecheck/build and controlled behavioral evidence remain required. |
| R51 | Listing authorization | Explicit supplier/owner/staff/partner authorization with dates, territory, channel and terms. | IMPLEMENTED-UNVERIFIED | CE-2 commercial parties, listing owner/supplier references, workspace-scoped authorization records, lifecycle controls and dashboard workbench are implemented; migration, typecheck/build and controlled isolation/lifecycle evidence remain required. |
| R52 | Partner eligibility | Determine whether a partner may promote a listing/program under current status and contract. | IMPLEMENTED-UNVERIFIED | CE-3 adds explicit eligibility decisions, auditable criteria snapshots/reasons, authorization/program checks, partner account/verification/onboarding checks, partner-type/territory/channel controls, and blocks ACTIVE partner authorization when eligibility is not proven. Runtime migration/build and behavioral evidence remain required. |
| R53 | Deal registration | Partner can register an opportunity; seller can approve/reject/request information; approved registration can create protection. | TARGET / GAP-CLOSURE |
| R54 | Attribution protection | Preserve protected partner contribution through inspection, quote, order and external payment evidence where terms apply. | TARGET / GAP-CLOSURE |
| R55 | Inspection/appointment | Record physical inspection/site visit/check-in/outcome as commercial evidence. | TARGET / GAP-CLOSURE |
| R56 | Demand requests | Public users can submit buy, asset, service and RFP requests that enter the Lead/Opportunity chain. | TARGET / GAP-CLOSURE |
| R57 | Supply-demand matching | Match structured demand to eligible listings/providers and preserve match provenance. | IMPLEMENTED-UNVERIFIED | CE-7 implements deterministic matching, persisted scores/reasons, duplicate prevention, expiry, review controls and CE-6 response handoff. A migration-seeded demo dataset provides five demand scenarios and eight match examples; runtime migration/E2E verification remains required. |
| R58 | Professional provider | Provider profile, qualifications/verification evidence, services, service area and availability. | IMPLEMENTED-UNVERIFIED | CE-8 adds ProfessionalProfile and ProfessionalCredential domains, provider self-service/operator review, public published profiles, service-listing linkage and CE-7 matching integration. Runtime migration/typecheck/build/E2E evidence remains required. |
| R59 | Proposal/RFP | Providers can respond with versioned proposals that can be compared and accepted. | IMPLEMENTED-UNVERIFIED | CE-9 adds versioned ProfessionalProposal/ProfessionalProposalVersion records, factual comparison, acceptance/supersession, immutable revision protection and canonical Quote/NegotiationEvent handoff. Runtime Prisma/typecheck/build and controlled acceptance remain required. |
| R60 | External payment evidence | Record and verify bank/cash/external settlement evidence without misrepresenting it as provider-processed payment. | TARGET / GAP-CLOSURE |
| R61 | Commercial leakage/dispute controls | Detect review signals, preserve evidence and resolve attribution/commission disputes without silent invalidation. | TARGET / GAP-CLOSURE |
| R62 | Commercial self-service | Business owners, staff, partners and providers have role-appropriate interfaces for the commercial lifecycle. | TARGET / GAP-CLOSURE |
| R63 | Commercial marketplace | Discovery is a surface over the canonical commercial chain, not a parallel transaction system. | TARGET / GAP-CLOSURE |
| R64 | QR/ticket/coupon continuity | Existing redemption assets can participate in the commercial attribution and audit model. | PARTIAL / RECONCILE |
| R65 | Commercial reporting | Supply, demand, matching, conversion, revenue and commission reports reconcile to source records. | IMPLEMENTED-UNVERIFIED | CE-13 adds workspace-scoped read-only analytics, conversion metrics, recognized/partner-attributed revenue, commission/payout reporting, operational breakdowns and CSV export derived from canonical records; source reconciliation and runtime acceptance remain required. |

These IDs are domain-gap identifiers. They do not independently move the development roadmap. Status can change only when the owning phase provides evidence.

## Reconciliation rules

A future PR must identify affected R-IDs and provide business outcome, data/API/UI effect, migration/rollback risk and acceptance evidence.

Phase 5 implementation is now on mainline. Status remains IMPLEMENTED-UNVERIFIED/PARTIAL until scheduled production execution and acceptance evidence are retained.\nPhase 6A implementation is now on mainline and deployed through Emerald. R22/R23 remain IMPLEMENTED-UNVERIFIED until a controlled quote is sent, revised, accepted/rejected and reconstructed from production history.

Statuses can move only when the evidence required by the row is present.

No requirement may be upgraded because of marketing pressure, feature availability, or a successful build alone.


## Q1 E2E gap reconciliation — 2026-09-26

The current mainline was audited against the controlled Q1 journey before acceptance execution. Code-level financial controls were tightened: Finance has dedicated payment, commission and payout permissions; payment submission can no longer directly create CONFIRMED/REVERSED/REFUNDED records; lead acquisition attribution now has lock metadata and audited override controls; Arabic locale/RTL foundation was added.

Open reconciliation items remain: dispute-driven commercial attribution reassignment, trusted public workspace routing for multi-anchor public capture, duplicate-customer acceptance rules, complete financial/attribution/permission audit coverage, representative 100-partner fixture, and controlled mobile/localization/behavioral evidence.

See `docs/qa/Q1-E2E-GAP-RECONCILIATION.md`. Statuses remain evidence-gated.

| R55 | CE-6 Complete Demand Workflow | IMPLEMENTED-UNVERIFIED | CommercialRequest supports BUY_REQUEST/ASSET_REQUEST/SERVICE_REQUEST/RFP from public intake through Lead, qualification, supplier/provider response, Opportunity, Quote and Order handoff; runtime acceptance and workspace-isolation tests remain pending. |

| R56 | CE-7 Supply/Demand Matching | IMPLEMENTED-UNVERIFIED | Deterministic listing matching, score/reason persistence, duplicate prevention, partner eligibility evaluation, match review and CE-6 response creation are implemented; runtime verification remains pending. |
\n| R59 | CE-9 professional RFP/proposal versioning, comparison and Quote handoff | IMPLEMENTED-UNVERIFIED | Versioned ProfessionalProposal/ProfessionalProposalVersion domain, factual comparison, immutable revision guard, acceptance and canonical Quote/NegotiationEvent handoff are implemented; runtime Prisma/typecheck/build and controlled acceptance remain open. |\n
| R64 | Commercial agreements | Record versioned commercial relationships, attribution/protection terms, participant acknowledgment and auditable lifecycle without duplicating CommissionContract. | IMPLEMENTED-UNVERIFIED | CE-10 adds CommercialAgreement, participant/version/acceptance/event records, workspace authorization and deal-protection integration. Runtime migration/typecheck/build and controlled acceptance remain required. |

| R65 | CE-11 external payment evidence | Record bank transfer, cash, institutional procurement and external gateway evidence separately from provider-processed payments; allow verified evidence to reconcile to canonical Payment without fabricating Revenue. | IMPLEMENTED-UNVERIFIED | CE-11 adds ExternalPaymentEvidence, verification lifecycle, workspace-scoped finance operations, canonical Payment reconciliation and dashboard controls. Runtime migration/typecheck/build and controlled payment/revenue acceptance remain required. |

| R66 | CE-12 leakage and dispute controls | Detect reviewable commercial leakage patterns, preserve evidence, support structured disputes and explicit resolutions without silently invalidating legitimate attribution or earnings. | IMPLEMENTED-UNVERIFIED | Adds CommercialLeakageSignal, CommercialDispute, workspace-scoped APIs and operator workbench. Signals are not proof; commission changes require explicit resolution. Runtime validation remains required. |
