# Aslal Growth OS — Product Requirements Document

**Document:** PRD-GROWTH-OS-001  
**Version:** 1.0  
**Status:** Product definition  
**Owner:** Aslal Digital Solutions  
**Repository:** `Jafermenza/aslal-digital-solutions`  
**Primary market:** Ethiopia, with support for Ethiopian diaspora and international customers where commercially relevant.

---

## 1. Product definition

**Aslal Growth OS** is the internal sales and marketing operating system behind the Aslal Digital Solutions website.

Its job is simple:

> **Capture legitimate customer interest → understand intent → qualify → communicate through the right channel → follow up automatically → move the opportunity through sales → record revenue → attribute partners/campaigns → retain the customer.**

The system connects:

**Visitor → Interest → Lead → Conversation → Opportunity → Customer → Revenue**

and, where applicable:

**Campaign/Partner → Visitor → Lead → Sale → Commission**

The product must remain understandable to a sales team. It is not an analytics experiment or a generic CRM.

---

## 2. Business problems to solve

### P1 — Interested people are lost
A visitor can read several pages, view a product, watch a demo, click WhatsApp, or start a quote without becoming a form lead.

**Requirement:** meaningful behavior must create an identifiable sales signal without pretending to know the identity of an anonymous visitor.

### P2 — Follow-up is inconsistent
Sales staff may contact prospects manually and forget the next action.

**Requirement:** every active lead/opportunity has a clear owner, stage, next action, due date, and communication history.

### P3 — Marketing and sales data are disconnected
Campaigns, content, referrals, conversations and sales can currently become separate activities.

**Requirement:** campaign/source/product/partner information must remain attached to the customer journey.

### P4 — Multiple channels are difficult to manage
Email, SMS, Telegram, WhatsApp and Messenger can create fragmented conversations.

**Requirement:** the OS provides one customer timeline while respecting each channel's rules and permissions.

### P5 — Partner activity is difficult to measure
An influencer or agent may generate clicks but the business needs to know whether those clicks become qualified leads and revenue.

**Requirement:** campaign/post/referral → lead → opportunity → customer → revenue must be attributable.

---

## 3. Product goals

1. Give sales staff one clear pipeline.
2. Capture first-party website behavior and meaningful engagement.
3. Convert appropriate signals into sales opportunities.
4. Automate routine follow-up without uncontrolled spam.
5. Support Email, SMS, Telegram, WhatsApp and Messenger as channel adapters.
6. Record inbound social interactions where the platform/API permits it.
7. Support Ethiopian business realities: mobile-first usage, variable connectivity, local languages, ETB, local payment methods and human-assisted sales.
8. Attribute campaigns, content, partners and referrals to revenue.
9. Make every automated action auditable.
10. Keep the system compatible with the existing Next.js + Node.js + MySQL + Emerald deployment model.

---

## 4. Non-goals

The first versions will **not**:

- scrape private social-media activity;
- secretly identify anonymous people;
- send unsolicited bulk messages;
- bypass WhatsApp, Meta, Telegram, email or SMS platform rules;
- treat a page visit as permission to send a personal message;
- build a full advertising platform;
- replace human sales staff for complex or high-value deals;
- require PostgreSQL, Kubernetes, Docker or a permanent Redis/BullMQ dependency on Emerald;
- build every AI feature before the core CRM workflow is reliable.

---

## 5. Target users

### 5.1 Owner / Admin
Needs revenue, pipeline, campaign, partner and system visibility.

### 5.2 Sales Manager
Needs team performance, lead assignment, overdue work and pipeline control.

### 5.3 Sales Agent
Needs today's work, lead context, conversation history and next actions.

### 5.4 Marketing Manager
Needs campaign, content, audience and conversion performance.

### 5.5 Partner Manager
Needs agent/influencer campaigns, referral links, conversions and commissions.

### 5.6 Partner / Influencer
Needs approved campaign assets, tracking links, clicks, leads, sales and commission status.

---

## 6. Core funnel

The canonical funnel is:

1. **Audience**
2. **Engagement**
3. **Identified Lead**
4. **Qualified Lead**
5. **Conversation**
6. **Opportunity**
7. **Proposal / Quote**
8. **Negotiation**
9. **Won / Lost**
10. **Customer**
11. **Retention / Upsell / Referral**

Not every person must pass through every stage.

### Required distinction

- **Visitor:** anonymous or known web activity.
- **Engagement:** a measurable interaction.
- **Lead:** an identified person/business with a legitimate sales signal.
- **Opportunity:** a qualified commercial opportunity.
- **Customer:** a person/business with a completed sale or active customer relationship.

---

## 7. Visitor and engagement intelligence

### 7.1 Website events

Track business-relevant events such as:

- PAGE_VIEW
- PRODUCT_VIEW
- SERVICE_VIEW
- CONTENT_VIEW
- VIDEO_PLAY
- VIDEO_COMPLETE
- FEATURE_VIEW
- PRICING_VIEW
- DEMO_START
- DEMO_COMPLETE
- QUOTE_START
- QUOTE_COMPLETE
- DOWNLOAD
- WHATSAPP_CLICK
- TELEGRAM_CLICK
- MESSENGER_CLICK
- EMAIL_CLICK
- PHONE_CLICK
- CONTACT_SUBMIT
- REFERRAL_CLICK
- LANGUAGE_SELECTED
- PAYMENT_STARTED
- PAYMENT_COMPLETED

### 7.2 Visitor profile

For known visitors, show:

- source
- campaign
- partner/referral
- pages viewed
- products/services viewed
- recent meaningful events
- lead score
- current lead/opportunity
- assigned sales agent
- conversations
- next action

### 7.3 Anonymous visitors

Anonymous activity may be used for aggregate analytics and anonymous journey scoring.

The system must not claim to know a person's identity unless the person becomes known through an appropriate interaction such as a form, login, quote request, or messaging channel.

---

## 8. Lead scoring

Start with a transparent rules engine.

Example signals:

| Signal | Example points |
|---|---:|
| Service page | +3 |
| Product page | +5 |
| Pricing | +8 |
| Demo | +10 |
| Quote started | +15 |
| WhatsApp/Telegram/Messenger contact | +15 |
| Contact/quote completed | +25 |
| Referral visit | +5 |
| Repeat meaningful engagement | +5 |

Score bands:

- **0–20:** Cold
- **21–40:** Warm
- **41–60:** Interested
- **61–80:** Hot
- **81+:** Very Hot

Scores are signals, not automatic proof of buying intent.

---

## 9. Lead and opportunity management

Every active lead must have:

- lead ID
- person/company
- phone
- email
- preferred channel
- preferred language
- business type
- source
- campaign
- partner
- interested product/service
- score
- owner
- stage
- next action
- due date
- last activity
- consent/preferences where applicable

### Standard sales stages

**NEW → CONTACTED → QUALIFIED → DEMO → PROPOSAL → NEGOTIATION → WON / LOST**

Stage changes must:

- be explicit;
- record who changed the stage;
- record when it changed;
- optionally record a reason;
- create/update the next action;
- appear in the activity timeline.

### Opportunity fields

- expected value
- currency
- probability
- expected close date
- product/service
- sales owner
- source/campaign
- partner/referral
- proposal/quote status
- next action

---

## 10. Unified customer timeline

Every known customer/lead should have one chronological timeline.

Example:

**10:14** Product viewed  
**10:18** Pricing viewed  
**10:21** WhatsApp conversation started  
**10:23** Lead created  
**10:30** Assigned to Sales Agent 02  
**10:42** Sales reply sent  
**11:05** Qualified  
**14:20** Demo booked  
**Next day** Proposal sent  
**Day 4** Won — 85,000 ETB

Timeline events must identify:

- channel
- actor/system
- event
- timestamp
- message/activity
- campaign/source where relevant

---

# 11. Sales automation engine

Automation is based on **events + conditions + actions**.

### Workflow structure

**Trigger → Conditions → Action → Wait → Re-check → Next action**

Example:

**Trigger:** quote completed  
**Condition:** no existing opportunity  
**Action:** create lead  
**Action:** assign sales agent  
**Action:** send confirmation email  
**Wait:** 30 minutes  
**Condition:** no human contact recorded  
**Action:** create overdue-priority task  
**Action:** send approved channel follow-up if consent exists

### Required workflow controls

Every workflow must support:

- active/inactive
- trigger
- conditions
- actions
- delay
- retry policy
- owner
- execution log
- failure state
- stop conditions
- audit history

---

# 12. Channel automation

The OS uses a common internal messaging interface with channel-specific adapters.

## 12.1 Email

Use for:

- lead confirmation
- quote/proposal delivery
- appointment reminders
- educational sequences
- follow-up
- customer onboarding
- receipts/notifications

Requirements:

- templates
- variables
- delivery status
- bounce/failure status
- unsubscribe/preferences
- campaign attribution

## 12.2 SMS

Use primarily for:

- high-priority lead alerts
- appointment reminders
- short follow-ups
- payment/order notifications
- fallback notifications when appropriate

Requirements:

- Ethiopian phone-number normalization
- delivery status where provider supports it
- message length/cost awareness
- opt-out/preferences
- provider abstraction

SMS must not become the default channel for every marketing action.

## 12.3 Telegram

Telegram is a first-class sales channel.

Capabilities:

- bot welcome flow
- product/service selection
- qualification questions
- product details
- demo links
- quote request
- human handoff
- lead creation
- notifications
- campaign/referral attribution

The bot should be useful even without AI.

Example:

**What are you looking for?**

[Website] [Software] [CRM]  
[E-commerce] [Marketing] [Automation]  
[Talk to Sales]

Then:

**What type of business?**

[Retail] [Wholesale] [Services]  
[Manufacturing] [Education] [Other]

Then:

[Demo] [Pricing] [Request Quote] [Human]

## 12.4 WhatsApp

WhatsApp should use the **official business platform/provider**.

Capabilities:

- inbound conversation capture
- approved template messages
- lead qualification
- product/service selection
- quote request
- human handoff
- appointment reminders
- follow-up
- conversation history
- campaign attribution

The system must respect WhatsApp's messaging, consent and template rules.

## 12.5 Messenger

Messenger integration should use Meta-supported business messaging capabilities.

Capabilities:

- inbound message capture
- automated first response
- qualification
- human handoff
- lead creation
- campaign attribution
- conversation history

Messenger is an additional channel, not the central identity system.

---

# 13. Social engagement capture

The requirement is:

> Capture legitimate customer-interest signals from social channels and use them to continue the sales journey.

This is implemented in three ways.

### A. Inbound interaction

Capture permitted events such as:

- message received
- comment received where the platform/API provides access
- reaction/engagement event where supported
- ad lead form submission
- click from a campaign
- referral link visit

### B. Campaign audience

Use platform-supported campaign audiences and retargeting rather than attempting to identify private users.

### C. First-party conversion

Drive users to:

- website
- quote builder
- WhatsApp
- Telegram
- Messenger
- email
- phone

Once a user voluntarily identifies themselves, connect permitted first-party activity to their CRM record.

### Important rule

A **like, comment or page visit does not automatically grant permission for private marketing messages**.

The OS should distinguish:

**Observed engagement → eligible audience → consent/interaction → lead → automated follow-up**

---

# 14. Follow-up automation

The system must make follow-up systematic.

### Example sequence

**Lead created**

→ immediate confirmation

→ sales task created

→ if untouched, reminder

→ if contacted, wait for response

→ if no response, approved follow-up

→ if engaged, increase priority

→ if qualified, move to opportunity

→ if proposal sent, schedule follow-up

→ if won, stop prospecting workflows

→ enter onboarding/customer workflow

### Stop conditions

Automation must stop or change when:

- lead becomes WON
- lead becomes LOST
- customer opts out
- channel becomes unavailable
- human agent takes ownership where configured
- customer replies
- workflow expires
- administrator disables workflow

---

# 15. Ethiopia market requirements

The product must be designed for actual Ethiopian usage rather than assuming a Western SaaS environment.

### 15.1 Mobile-first

As of the Digital 2026 Ethiopia report, based on data available around October 2025, Ethiopia had about **93.2 million cellular connections**, **29.5 million internet users**, and **9.8 million social-media user identities**. Internet penetration was about **21.7%**, so the product must work well for mobile users and must not assume continuous high-bandwidth connectivity. citeturn1search0

### 15.2 Facebook and Meta ecosystem

The system should support Facebook/Meta campaign attribution and business messaging where permitted. DataReportal reports Facebook ad reach of about **9.8 million** in Ethiopia in late 2025, while Instagram reach was about **1.55 million**. These are advertising-reach estimates, not equivalent to verified active-user counts. citeturn1search0

### 15.3 Messenger

Messenger should be supported, but its late-2025 reported ad reach in Ethiopia was about **648,000**, so it should remain one channel among several rather than the only messaging strategy. citeturn1search0

### 15.4 SMS remains important

Because mobile connections substantially exceed internet users, the system must support SMS as a practical notification/follow-up channel where appropriate. Mobile connection counts are not unique people and should not be treated as customer counts. citeturn1search0

### 15.5 Payments

The product must support a payment abstraction that can accommodate Ethiopian payment methods and future providers.

Ethiopia's National Bank reported that mobile-money accounts exceeded **128.5 million by December 2024** and that digital transactions reached **9.7 trillion Birr** during FY2023/24. The national digital-payments strategy also emphasizes interoperability and merchant acceptance. citeturn0search4

The system should therefore support:

- ETB
- payment provider abstraction
- payment status
- payment reference
- manual payment verification
- receipts
- order/deal reconciliation

Do not hard-code one payment provider into the CRM.

### 15.6 Languages

Initial product language support:

- English
- Amharic
- Afaan Oromoo

The CRM should store the customer's preferred language and use it when selecting templates.

### 15.7 Business segments

The qualification model should support at minimum:

- retail
- wholesale/distribution
- professional services
- manufacturing
- hospitality
- education
- healthcare
- real estate
- logistics
- agriculture/agri-business
- NGOs/non-profits
- startups
- diaspora-facing businesses
- other

### 15.8 Connectivity

The public website and forms must remain usable on slower connections.

Requirements:

- compressed assets
- limited client-side JavaScript
- mobile-first layouts
- graceful loading states
- retry-safe form submission
- no critical workflow depending only on WebSockets
- server-side rendering where appropriate

### 15.9 Trust

For Ethiopian customers, the sales system should expose useful trust information:

- real company identity
- physical/contact information where appropriate
- service terms
- privacy policy
- clear pricing/quote expectations
- human support option
- verifiable case studies
- payment/order confirmation

Automation must not make the business feel like an anonymous bot operation.

---

# 16. Privacy and data protection

Ethiopia's **Personal Data Protection Proclamation No. 1321/2024** is in force. The PRD therefore treats personal-data handling as a product requirement, not an optional later enhancement. citeturn0search3

Requirements:

- collect only data needed for the stated business purpose;
- distinguish anonymous analytics from identified customer data;
- record communication preferences;
- provide opt-out/unsubscribe mechanisms where applicable;
- protect authentication/session data;
- verify webhooks;
- restrict staff access by role;
- log sensitive administrative actions;
- define retention rules;
- provide data export;
- support deletion/anonymization processes where required;
- do not infer sensitive personal characteristics from behavior;
- do not sell or expose customer data through partner dashboards.

---

# 17. Partner and influencer system

Partners are separate from normal customers.

Partner types:

- Agent
- Influencer
- Affiliate
- Reseller
- Referral Partner

Each campaign may contain:

- product/service
- start/end date
- partner
- campaign
- post/creative
- channel
- referral URL
- commission rule

### Attribution chain

**Partner → Campaign → Post/Creative → Referral → Visitor → Lead → Opportunity → Customer → Revenue → Commission**

Post-level tracking is required so the team can measure which content actually produces sales.

---

# 18. Commission workflow

Commission rules are configurable.

Standard lifecycle:

**PENDING → QUALIFIED → APPROVED → PAYABLE → PAID**

Exceptional terminal state:

**VOID**

Every transition must be auditable.

Commission calculation must store:

- source deal
- customer
- partner
- product/service
- campaign
- commission rule
- percentage/fixed amount
- calculated amount
- currency
- status
- approval information
- payment information

---

# 19. Marketing and content intelligence

Every campaign/content asset should answer:

- How many people saw it?
- How many engaged?
- How many clicked?
- What did they investigate?
- How many became leads?
- How many became qualified?
- How many became customers?
- How much revenue resulted?
- Which partner/post/channel contributed?

Example:

**Content → Product interest → Lead → Opportunity → Customer → Revenue**

This is more important than reporting page views alone.

---

# 20. Growth Opportunity

A **Growth Opportunity** is a sales signal that does not yet meet the definition of a lead.

Example:

A visitor repeatedly views:

- CRM
- WhatsApp automation
- pricing

but does not submit a form.

The system may create:

**Growth Opportunity**

with:

- interest
- engagement level
- source
- campaign
- recommended next action

It must not automatically claim the visitor's identity.

---

# 21. Automation priority rules

Automations should follow this priority order:

1. **Human reply**
2. **Customer intent**
3. **Scheduled sales task**
4. **High-value opportunity**
5. **Qualified lead**
6. **Warm lead**
7. **General nurture**
8. **Marketing audience**

A real customer conversation must never be buried under automated messages.

---

# 22. Core dashboard

The executive dashboard should show:

### Sales

- new leads
- qualified leads
- opportunities
- overdue follow-ups
- proposal value
- pipeline value
- won revenue
- conversion rate

### Marketing

- visitors
- engaged visitors
- top content
- top products
- campaigns
- channel conversion

### Partners

- active partners
- referral clicks
- referred leads
- qualified leads
- won deals
- commission liability

### Automation

- active workflows
- messages sent
- replies
- failures
- pending human handoffs

---

# 23. Required CRM screens

1. Overview
2. Leads
3. Lead detail
4. Pipeline
5. Customers
6. Activities
7. Follow-up queue
8. Products
9. Campaigns
10. Partners
11. Referral links
12. Commissions
13. Conversations
14. Automation workflows
15. Analytics
16. System status
17. Audit log
18. Settings

---

# 24. Required data model

The implementation should evolve the existing MySQL model toward these bounded entities:

### Identity
- users
- roles
- permissions

### Marketing
- campaigns
- campaign_assets
- content
- visitors
- sessions
- events

### Sales
- leads
- lead_activities
- lead_scores
- opportunities
- pipeline_stages
- customers
- quotes

### Products
- products
- product_categories
- product_providers
- product_interests

### Partners
- partners
- partner_campaigns
- referral_links
- referral_clicks
- referral_conversions
- commissions
- commission_rules
- payouts

### Conversations
- conversations
- conversation_messages
- channel_accounts
- bot_sessions

### Automation
- workflows
- workflow_steps
- workflow_executions
- notifications

### Commerce
- orders
- invoices
- payments

### Governance
- audit_logs
- consent/preferences
- integration_credentials

Do not add all entities at once. Add only the entities required by each release.

---

# 25. Integration architecture

External services must be behind adapters.

Example:

**CRM → MessagingService → WhatsAppProvider**

and:

**CRM → MessagingService → TelegramProvider**

Same principle for:

- Email
- SMS
- Messenger
- analytics
- payments
- AI

The CRM must not contain provider-specific logic everywhere.

This allows providers to be changed without rewriting the sales system.

---

# 26. AI requirements

AI is an assistant, not the source of truth.

Initial AI functions:

- lead summary
- conversation summary
- suggested next action
- suggested reply
- product recommendation
- sales-call preparation
- content recommendation

AI must never:

- invent customer facts;
- claim a lead consented when they did not;
- send high-risk commercial messages without configured approval rules;
- change commission/payment records without explicit system rules;
- expose private customer information to unauthorized users.

---

# 27. Release plan

## Release 0.6 — Sales Execution Foundation

Deliver:

- standardized pipeline
- explicit stage changes
- lead ownership
- next actions
- due dates
- overdue queue
- activity timeline
- reliable contact submission
- existing referral/commission workflow cleanup

**Success:** a salesperson can open the dashboard and know exactly who needs attention today.

## Release 0.7 — Conversations

Deliver:

- unified conversation model
- Telegram
- email
- provider abstraction
- inbound/outbound message history
- human handoff
- message templates

## Release 0.8 — WhatsApp + Messenger

Deliver:

- official WhatsApp integration
- Messenger integration
- inbound lead capture
- approved outbound templates
- conversation attribution
- opt-out/preferences

## Release 0.9 — Workflow Automation

Deliver:

- workflow builder
- triggers
- conditions
- delays
- actions
- stop conditions
- execution history
- retry/failure handling

## Release 1.0 — Growth OS

Connect:

**Campaign → Content → Visitor → Interest → Lead → Conversation → Opportunity → Customer → Revenue → Partner → Commission**

Deliver:

- multi-touch attribution
- campaign intelligence
- partner/post attribution
- revenue analytics
- customer lifecycle
- reporting/export
- automation monitoring

## Release 1.1+ — Intelligence

Only after the operational foundation is stable:

- AI lead summaries
- AI next-action suggestions
- AI-assisted replies
- predictive scoring
- campaign recommendations
- automated management reports

---

# 28. MVP automation recipes

The first production workflows should be these.

### Workflow A — New website lead

**Contact submitted**
→ validate
→ create/update lead
→ assign owner
→ record source/campaign/product
→ create sales task
→ send confirmation
→ notify sales

### Workflow B — High-intent visitor becomes known

**Known visitor**
→ repeated product/pricing/demo activity
→ increase score
→ create Growth Opportunity or Lead
→ assign owner
→ suggest next action

### Workflow C — Telegram qualification

**Telegram message**
→ identify campaign
→ ask goal
→ ask business type
→ ask team/scale
→ identify product interest
→ offer demo/quote/human
→ create/update lead
→ save conversation

### Workflow D — WhatsApp qualification

**Inbound WhatsApp**
→ identify campaign/referral if available
→ qualification flow
→ create/update lead
→ assign agent
→ human handoff when required

### Workflow E — No-response follow-up

**Lead contacted**
→ no response
→ wait configured period
→ check opt-out/status
→ send approved follow-up
→ create next task
→ stop after configured attempts

### Workflow F — Proposal follow-up

**Proposal sent**
→ schedule follow-up
→ notify owner
→ if reply: stop automation
→ if accepted: WON
→ if rejected: LOST
→ if no response: next configured action

### Workflow G — Won customer

**WON**
→ stop prospecting workflows
→ create customer
→ create onboarding tasks
→ record revenue
→ calculate commission where applicable
→ request referral/testimonial where appropriate

---

# 29. Acceptance criteria

A release is not complete unless:

### CRM
- Every active lead has an owner and next action.
- Every stage change is auditable.
- Overdue actions are visible.
- Lead and opportunity history is chronological.

### Tracking
- Important website events are recorded.
- Anonymous and identified users are distinguished.
- Referral/campaign attribution survives the journey.

### Messaging
- Inbound messages can create/update leads.
- Outbound messages are logged.
- Human handoff is available.
- Opt-out/status can stop automation.

### Automation
- Every workflow has a trigger and stop condition.
- Failed executions are visible.
- No workflow can endlessly message a customer.
- Won/lost/opt-out states can terminate prospecting automation.

### Partners
- Referral links are attributable.
- Campaign/post performance is measurable.
- Revenue can be connected to a partner.
- Commission transitions are auditable.

### Ethiopia
- Mobile UI works on low-bandwidth connections.
- ETB is supported.
- Ethiopian phone numbers are normalized.
- English/Amharic/Afaan Oromoo can be stored as customer preferences.
- SMS remains available as a channel.
- Local payment providers can be integrated through adapters.

### Security/privacy
- RBAC is enforced.
- Webhooks are verified.
- Sensitive actions are audited.
- Customer data is not exposed to partners.
- Communication preferences are respected.

### Deployment
- GitHub Actions runs lint, typecheck and production build.
- Standalone Emerald artifact is reproducible.
- No production build or Prisma CLI migration is required on Emerald.

---

# 30. Product success metrics

The OS should measure:

### Acquisition
- visitors
- engaged visitors
- campaign clicks
- referral clicks

### Qualification
- leads
- qualified leads
- qualification rate
- average lead score

### Sales
- contacted rate
- demo rate
- proposal rate
- win rate
- average deal value
- sales-cycle duration

### Automation
- response rate
- automation-to-human handoff rate
- workflow completion rate
- workflow failure rate
- opt-out rate

### Revenue
- won revenue
- revenue by product
- revenue by channel
- revenue by campaign
- revenue by partner
- commission liability

### Retention
- repeat purchases
- upsells
- referrals
- customer reactivation

---

# 31. Definition of done for Aslal Growth OS

The product is considered operational when a real customer journey can be demonstrated end-to-end:

**Facebook/Instagram/Google/Partner campaign**
→ tracked landing visit
→ product/service interest
→ lead or legitimate messaging interaction
→ automated qualification
→ human sales handoff
→ CRM opportunity
→ proposal
→ negotiation
→ payment/order
→ WON
→ revenue
→ partner attribution
→ commission
→ customer onboarding
→ follow-up/retention

The system must show this journey in one connected customer record.

---

## 32. Guiding principle

**Do not build a complicated CRM. Build a clear sales machine.**

Every feature must answer one of five questions:

1. **Who is interested?**
2. **What do they want?**
3. **Who should act next?**
4. **What communication should happen?**
5. **Did it produce revenue?**

If a feature does not improve one of those five questions, it should not block the core release.

---

## 33. Source and policy notes

The Ethiopia market assumptions in this PRD should be refreshed periodically because digital-platform audience estimates and platform capabilities change.

Primary references used for the Ethiopia-market baseline:

- DataReportal, Digital 2026: Ethiopia — latest published figures based largely on October 2025 data.
- National Bank of Ethiopia, National Digital Payments Strategy 2.0 announcement.
- Ethiopia Ministry of Justice, Personal Data Protection Proclamation No. 1321/2024.

This PRD deliberately treats platform integrations as **provider/API-dependent capabilities**. Availability, messaging permissions, template requirements, audience tools and API access must be verified during implementation for each channel.
