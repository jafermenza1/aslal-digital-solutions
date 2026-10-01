# Aslal UI & Role Governance — Roadmap Alignment

## Canonical UI areas
- Command: Dashboard, Journey, Insights — commercial monitoring and priorities.
- Revenue: Leads, Customers, Quotes, Orders, Conversations, Email Operations, Telegram Sales — customer/revenue execution.
- Partner Network: Partner Network, Partner Programs, Partner Applications, Trust & Risk Review — business-side partner administration.
- Commerce: Products & Services, Catalog & Offers, Operations, Partner Finance — commercial and financial operations.
- Administration: Users & Access, Workspaces, Email Templates, Website Content & Brand, Resources, Team, Social Profiles, Trust Audit.
- Partner Workspace: partner identity, referral links, activity, earnings and self-service.
- Partner Marketplace: cross-business program discovery and participation.

## Duplicate elimination
- Partner Network is the business-side partner record/relationship surface.
- Partner Programs is the business-side program configuration surface.
- Partner Applications is the business-side admission/review surface.
- Partner Marketplace is partner-side cross-business discovery only.
- Partner Workspace is partner-side performance and self-service only.
- The old duplicate `/dashboard/partners?tab=engine` marketplace navigation must not return.
- Products & Services remains the canonical product/resource source.
- Catalog & Offers is the single commercial presentation layer for Website, Partner Marketplace and Telegram.
- Partner Finance is the single business-side commission/payout operations surface.
- Trust & Risk Review is the review queue; Trust Audit is the historical audit record.

## Role purpose
| Role | Purpose | Primary responsibility |
|---|---|---|
| SUPER_ADMIN | Platform-wide administration and emergency control | Security, system administration, cross-workspace control |
| ADMIN | Business/platform administration within assigned authority | Users, workspaces, commerce, partners, finance |
| BUSINESS_OWNER | Owns business commercial outcome | Revenue, products, partners, offers, finance and business configuration |
| SALES_MANAGER | Manages sales execution | Pipeline, customers, conversations, team execution and insights |
| SALES_OPERATOR | Frontline sales execution | Leads, customers and conversations |
| MARKETING_OPERATOR | Demand and channel execution | Products/content, email, Telegram and insights |
| PARTNER_MANAGER | Partner-network lifecycle owner | Programs, applications, partner relationships, trust/risk |
| PARTNER | Authorized external seller/promoter | Partner Workspace, Marketplace, referral activity and earnings |
| FINANCE | Financial control owner | Commission ledger, reconciliation and payouts |
| AUDITOR | Read-oriented oversight | Operational/commercial review and audit evidence |
| CLIENT | Limited external/client access | Client dashboard and permitted customer/insight views |

## Roadmap ownership
- P1 Identity & Self-Service: Partner Manager + Partner.
- P2 Programs: Partner Manager + Business Owner.
- P3 Affiliate Engine: Partner Manager; Partner consumes links and earnings.
- P4 Referral Agent Engine: Partner Manager/business reviewer; AGENT submits claims/evidence.
- P5 Reseller & Supplier Commerce: Business/Commerce owner; reseller terms are not affiliate commissions.
- P6 Commission & Financial Ledger: Finance.
- P7 Automated Payout Engine: Finance; manual verification remains available until provider APIs are configured.
- P8 Multi-Business Marketplace: Partner Manager for business participation; Partner for discovery.
- P8.1–P8.3 Telegram/Catalog/Attribution: Marketing/Commerce + Partner Manager; Telegram remains a channel, not a second partner identity.
- P9 Trust/Fraud/Disputes: Partner Manager/reviewer; Auditor gets read-oriented oversight. Risk signals never silently destroy earnings.

## Rules for future UI
1. One capability has one canonical UI home.
2. Do not add a top-level page if an existing canonical surface can host the capability.
3. Business administration and partner discovery must never share the same navigation label.
4. Workspace ownership remains the security boundary for programs, applications, attribution, orders, commissions and settlements.
5. Finance mutations remain separate from partner relationship and attribution decisions.
6. Trust review remains separate from financial punishment.
7. Telegram uses the same attribution and financial chain as Website and Partner Marketplace.
8. Product/Resource is the source of truth; CatalogOffer is the commercial presentation.
9. Dashboard quick links may repeat destinations for convenience, but must not introduce duplicate business logic.
10. Every new page requires a roadmap milestone, responsible role, canonical parent area and explicit reason it cannot be a subview of an existing page.

## P10 review result
The current UI consolidation establishes the canonical separation:

Business: Partner Network → Partner Programs → Partner Applications → Trust & Risk Review → Trust Audit.

Partner: Partner Workspace → Partner Marketplace.

Commerce: Products & Services → Catalog & Offers → Operations → Partner Finance.

Future roadmap work should extend these surfaces rather than creating parallel control centers.