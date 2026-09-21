# Aslal Growth OS — Product Requirements Document

**Document:** PRD-GROWTH-OS-001  
**Version:** 1.0  
**Status:** Product definition  
**Owner:** Aslal Digital Solutions  
**Repository:** `Jafermenza/aslal-digital-solutions`  
**Primary market:** Ethiopia, with support for Ethiopian diaspora and international customers where commercially relevant.

---

## Problems. Business problems to solve

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

## Product. Product goals

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


# Product Requirements Document — Aslal Digital Solutions Growth OS

**Document version:** 1.0
**Product:** Aslal Digital Solutions Growth OS
**Organization:** Aslal Digital Solutions
**Primary market:** Ethiopia, with support for Ethiopian diaspora-facing and international customers
**Document purpose:** Authoritative product definition for developers, architects, designers, QA engineers, automation engineers, and AI coding agents
**Implementation status:** This document defines the system from first principles and is independent of any existing implementation.

---

## 1. Product Definition

Aslal Digital Solutions Growth OS is a business growth, customer intelligence, sales execution, marketing automation, partner attribution, and revenue management system designed for Aslal Digital Solutions.

The system exists to turn digital attention into measurable business outcomes.

The system must connect what happens before a customer identifies themselves with what happens after the customer becomes a lead, enters a sales conversation, becomes an opportunity, purchases a service or product, and generates revenue.

The fundamental business flow is:

**Traffic → Engagement → Interest → Identification → Conversation → Lead → Qualification → Opportunity → Proposal → Negotiation → Customer → Revenue → Retention → Referral**

The system must preserve the relationship between every stage.

A developer or AI agent implementing any feature must understand that the Growth OS is not simply a website analytics system, CRM, chatbot platform, marketing platform, partner platform, or dashboard. It is the operational system that connects these functions into one measurable growth process.

The central question of the product is:

> **Who is interested, what are they interested in, what should happen next, who is responsible for that action, what communication should occur, and did the activity produce revenue?**

Every major subsystem must contribute data toward answering those questions.

---

# 2. Business Context

Aslal Digital Solutions operates in the Ethiopian market and provides digital services and technology solutions to businesses and organizations.

The commercial offering may include website development, customized software, digital marketing, search engine optimization, e-commerce functionality, payment integration, CRM and lead-management systems, Telegram sales bots, WhatsApp-based customer communication, branding and rebranding, content creation, and other digital or software solutions.

Aslal may sell its own products, implement third-party products, resell products, operate affiliate relationships, customize existing software, or deliver implementation services around partner products.

The Growth OS therefore cannot assume that every sale represents the same commercial model.

A transaction may represent a direct Aslal service sale, a software implementation, an affiliate sale, a reseller sale, a partner-generated opportunity, an agent-generated lead, an influencer-generated customer, or a combination of these relationships.

The system must represent these relationships without requiring separate disconnected systems.

---

# 3. Product Objective

The objective of Growth OS is to create a reliable commercial operating layer around Aslal's digital presence.

A person may discover Aslal through Google, Facebook, Instagram, Messenger, Telegram, WhatsApp, a referral partner, an influencer, an advertisement, a campaign, a shared URL, a direct visit, or another channel.

The system must be capable of recording the commercially useful parts of that journey.

A visitor may initially remain anonymous.

The system must not require identification before collecting legitimate anonymous behavioral information.

When the visitor later submits a form, starts a conversation, requests a quote, registers, books a consultation, communicates through an integrated channel, or otherwise identifies themselves, the system should be able to connect permitted historical activity to the newly identified customer record.

The resulting customer history must become useful to sales rather than merely becoming an analytics report.

---

# 4. Product Philosophy

The product must be operationally simple even when its underlying data model is sophisticated.

The Growth OS must not become a complicated enterprise CRM containing unnecessary modules that do not directly improve sales execution.

The system must favor clear states, explicit ownership, understandable workflows, reliable attribution, and measurable outcomes.

A developer should never implement a feature merely because the feature is technically interesting.

Every feature must have an identifiable business purpose.

The system should allow a sales operator to open a customer record and understand the customer's journey without searching through multiple unrelated systems.

The system should allow a manager to understand where demand is coming from, what customers are interested in, what sales activity is pending, what partners are producing results, which campaigns are generating opportunities, and which activities are generating revenue.

The system should allow automation to perform repetitive work while preserving human control over important customer interactions.

---

# 5. System Boundaries

Growth OS consists of a unified digital growth environment.

The public website is the acquisition and conversion surface.

The visitor intelligence system records permitted digital interactions.

The identity layer connects anonymous activity with known customer records when legitimate identification occurs.

The CRM manages leads, opportunities, conversations, activities, tasks, proposals, deals, customers, and outcomes.

The communication layer manages email, SMS, Telegram, WhatsApp, and Messenger integrations.

The automation engine decides when an action should happen and executes eligible actions.

The social engagement layer records permitted business-level engagement signals from supported platforms.

The partner system manages agents, influencers, affiliates, resellers, referral links, campaigns, attribution, and commissions.

The product intelligence system measures demand for Aslal products and services.

The revenue layer records commercial outcomes and attribution.

The reporting layer converts operational data into management information.

The integration layer provides controlled connections to external services.

The security and privacy layer governs authentication, authorization, consent, retention, auditability, and data access.

---

# 6. Primary Users

The system is designed around several operational roles.

The system administrator controls configuration, users, integrations, automation, security settings, products, services, partner programs, and system policies.

The sales operator works with leads, conversations, opportunities, follow-up activities, proposals, negotiations, and customers.

The sales manager monitors pipeline performance, team activity, conversion, revenue, attribution, overdue work, and commercial performance.

The marketing operator manages campaigns, content, audience activity, acquisition sources, social engagement, and campaign attribution.

The partner manager manages agents, influencers, affiliates, referral links, partner activity, commissions, and partner-generated revenue.

The customer is not an internal system operator but is a participant in the system through forms, conversations, purchases, bookings, referrals, and communication channels.

AI agents and automation workers are system actors rather than human users. They must operate under explicitly defined permissions and workflow rules.

---

# 7. Canonical Customer Journey

The system must model customer progression as a continuous commercial journey.

A person first exists as a visitor or engagement participant.

The person may generate activity such as visiting a page, viewing a product, reading content, interacting with a CTA, viewing pricing information, opening a contact channel, starting a conversation, clicking a referral link, or interacting with a campaign.

The system records relevant events while respecting privacy and platform restrictions.

When sufficient information becomes available, the person may become an identified contact.

An identified contact may become a lead.

A lead may be qualified.

A qualified lead may become a sales opportunity.

An opportunity may proceed through consultation, demonstration, proposal, negotiation, and commercial agreement.

A successful opportunity becomes a customer and produces revenue.

After conversion, the system continues to track customer activity relevant to retention, additional purchases, referrals, support, and future opportunities.

The system must preserve historical information across these transitions.

A lead must never lose the activity that occurred before qualification.

A customer must never lose the attribution that explains where the customer originally came from.

---

# 8. Visitor Intelligence

The visitor intelligence subsystem records useful interactions occurring on Aslal-controlled digital properties.

The system should create an anonymous visitor identifier when a visitor arrives, subject to applicable privacy requirements.

The anonymous visitor identifier must not be treated as a person's identity.

It represents a browser or permitted visitor context until legitimate identification becomes available.

The system should record events such as page views, product views, service views, content views, pricing interactions, demo interactions, form starts, form submissions, CTA interactions, WhatsApp launches, Telegram launches, referral visits, campaign interactions, and other explicitly defined business events.

Events must contain a timestamp and sufficient contextual information to understand what occurred.

Events must be associated with the relevant visitor context and, when available, campaign, referral, product, service, or page information.

The system must not collect arbitrary sensitive information simply because it can technically be collected.

Tracking must be purpose-driven.

---

# 9. Identity Resolution

Identity resolution is the process of connecting permitted anonymous activity to a known person.

The system must not attempt to identify anonymous people through prohibited inference, private scraping, unauthorized platform data, or hidden identity mechanisms.

Identity can become known through legitimate actions such as submitting a form, creating an account, starting an authenticated session, providing a phone number, providing an email address, or using an integration that legally and technically provides an identity.

Once identity is established, historical anonymous activity may be associated with the known customer record when the relationship can be established reliably.

The system must maintain an auditable distinction between observed anonymous activity and verified customer information.

An AI agent must never claim that an anonymous visitor is a particular person merely because the behavior appears similar.

---

# 10. Customer Profile

A customer profile represents the commercially relevant identity and history of a person or organization.

The profile should contain contact information, organization information, business type, language preference, communication preferences, source information, campaign information, partner attribution, interests, lead status, opportunity information, sales activities, conversations, proposals, purchases, revenue, tasks, notes, and relevant event history.

The system must support both individual and business contexts.

A contact may represent a business owner, manager, employee, procurement person, organization representative, or another commercial stakeholder.

Multiple contacts may belong to the same organization.

The system should therefore distinguish between a person and an organization rather than forcing all commercial relationships into one record.

---

# 11. Lead Management

A lead represents an identifiable person or organization that has demonstrated sufficient commercial interest to warrant sales attention.

Lead creation must be based on defined business events rather than arbitrary visitor activity.

A simple page visit must not automatically become a lead.

A product inquiry, consultation request, contact submission, qualified conversation, demo request, quote request, or another defined high-intent action may create or update a lead.

The lead record must preserve its source and attribution.

The lead must have a current stage.

The lead must have an owner or explicitly indicate that it is unassigned.

The lead must be capable of having a next action.

The next action must have a responsible person or automation worker and, where appropriate, a due date.

A lead without a next action should be visible as operationally incomplete.

---

# 12. Sales Pipeline

The system must provide a consistent sales lifecycle.

The lifecycle should represent new demand, initial contact, qualification, consultation, demonstration where relevant, proposal, negotiation, successful conversion, and loss.

Exact stages may be configured, but the system must preserve a controlled progression model.

A stage change must be recorded as an event in the lead or opportunity history.

The system must record when the change occurred and who or what caused it.

An automation must never silently change a sales stage without an audit record.

Moving a lead to a successful state must require sufficient commercial information to support revenue reporting.

Moving a lead to a lost state should support a loss reason.

A reopened opportunity must retain its previous history.

---

# 13. Opportunity Management

An opportunity represents a genuine commercial possibility with defined potential value.

An opportunity should be associated with a customer or lead, an owner, a product or service interest, a commercial value where known, a stage, and relevant activities.

An opportunity may contain multiple products or services.

The system must support the possibility that a customer is interested in more than one Aslal offering.

The opportunity must have a clear next action.

The system should provide visibility into the amount of business currently in the pipeline and the amount that has converted.

---

# 14. Product and Service Interest

Aslal offers multiple services and products.

The system must treat customer interest as structured information.

If a visitor repeatedly interacts with a particular product, service, or solution, the system should be able to record that interest.

Interest should have a source.

Interest may originate from a website interaction, campaign, conversation, partner referral, salesperson entry, or another supported source.

The system should distinguish between weak behavioral interest and explicit commercial interest.

A person reading a service page once should not automatically be treated the same as someone requesting a quote for that service.

---

# 15. Lead Scoring

Lead scoring must help sales prioritize work without pretending to predict human intent perfectly.

Scores should be generated from transparent business rules.

Relevant signals may include explicit inquiries, product views, repeated engagement, pricing interactions, demo requests, referral activity, consultation requests, response behavior, and other approved signals.

The score must remain explainable.

A salesperson should be able to understand why a lead received its current score.

AI may eventually recommend scoring adjustments, but AI must not silently replace the deterministic foundation.

---

# 16. Customer Timeline

Every known customer should have a unified chronological timeline.

The timeline should show meaningful interactions across the customer journey.

Website activity, form submissions, conversations, emails, SMS messages, Telegram conversations, WhatsApp conversations, Messenger interactions, sales activities, notes, tasks, proposals, stage changes, partner attribution, purchases, payments, and other relevant events should appear as distinct event types.

The timeline must distinguish between events generated by the customer, the sales team, automation, and external integrations.

The timeline should make it possible for a salesperson to understand what happened without opening five different systems.

---

# 17. Communication Architecture

Communication must be implemented through a common channel abstraction.

Email, SMS, Telegram, WhatsApp, and Messenger are different channels but must share a consistent internal communication model.

A communication should have a customer or conversation context, channel, direction, sender, recipient, message content or template reference, timestamp, delivery status where available, provider reference where available, and automation context where applicable.

The system must distinguish between outbound automated messages, outbound human messages, inbound customer messages, and system-generated events.

Channel-specific implementation must remain behind adapters.

The core CRM must not become tightly coupled to one messaging provider.

---

# 18. Email Automation

Email must support transactional and marketing communication where legally and operationally appropriate.

The system must support templates, variables, campaigns, delivery tracking where available, unsubscribe handling, and message history.

Automated email should be triggered by defined customer events.

Examples include a new inquiry acknowledgement, consultation confirmation, follow-up after an unanswered inquiry, proposal follow-up, abandoned commercial action, customer onboarding, and post-purchase communication.

The system must prevent repetitive or conflicting automation.

If a customer replies to an automated email, the conversation should become visible to the responsible sales operator.

---

# 19. SMS Automation

SMS is especially important for customers who may have limited internet access or prefer mobile communication.

The system must support SMS through a provider abstraction.

The system should support transactional notifications, lead follow-up, appointment reminders, sales follow-up, and other approved messages.

SMS automation must respect opt-out and communication preferences.

The system must track provider delivery status when available.

The system must not send uncontrolled bulk messages.

---

# 20. Telegram Automation

Telegram must be treated as a conversational sales channel.

The system should support a Telegram bot capable of answering defined questions, collecting lead information, identifying product or service interest, qualifying basic demand, handing the conversation to a salesperson, and recording the conversation in the customer timeline.

The bot must not pretend to be a human.

The bot must clearly transition to human assistance when necessary.

The bot must be capable of collecting structured information without making the customer complete unnecessarily long forms.

---

# 21. WhatsApp Automation

WhatsApp should be treated as a major customer communication channel for the Ethiopian market.

The system must use supported WhatsApp business APIs and approved provider mechanisms.

The system must not use unauthorized automation methods or mechanisms that bypass platform restrictions.

WhatsApp conversations must be linked to customer records where identity can legitimately be established.

The system should support inbound conversations, outbound approved templates, sales follow-up, lead qualification, customer notifications, and human handoff.

The system must preserve conversation history and communication state.

---

# 22. Messenger Automation

Messenger integration should allow supported Facebook/Meta business messaging interactions to become part of the sales workflow.

The system should record eligible interactions, incoming messages, conversation state, customer information provided through the platform, and relevant business events.

A public comment, reaction, page visit, or similar engagement must not automatically be treated as permission to privately message a person.

The system must operate according to the capabilities and policies of the applicable platform APIs.

---

# 23. Social Engagement Intelligence

Social platforms can generate valuable commercial signals.

The system should capture permitted business-level engagement information such as comments, messages, campaign interactions, reactions where available, post performance, and other platform-provided metrics.

The purpose of social capture is to identify opportunities for legitimate follow-up.

The system must never rely on unauthorized scraping of private profiles.

The system must not secretly infer sensitive personal attributes.

The system must not convert a public social interaction into consent for unrestricted marketing communication.

Where a platform permits an approved follow-up workflow, the system may initiate that workflow.

Where the platform does not permit such action, the system should record the opportunity for human follow-up through an allowed channel.

---

# 24. Growth Opportunity

The system must distinguish between a known lead and a commercially valuable but unidentified engagement.

A person may interact with a product, campaign, post, or website without providing identifying information.

Such activity may be represented as a Growth Opportunity.

A Growth Opportunity is not a fake lead.

It is a signal that commercially relevant interest exists but identity or permission may not yet be sufficient for direct outreach.

This allows the marketing and sales team to understand demand without violating the distinction between anonymous interest and identified customer information.

---

# 25. Automation Engine

The automation engine is responsible for turning events into controlled actions.

An automation begins with a trigger.

The trigger may be a new lead, product interest, score threshold, stage change, unanswered inquiry, customer response, partner referral, purchase, payment confirmation, or another defined event.

The system evaluates conditions.

The system determines whether the workflow is eligible.

The system performs the configured action.

The system records the result.

The system schedules subsequent actions where necessary.

The system must support delays, conditions, branching, retries, cancellation, expiration, and human handoff.

Every automation execution must be auditable.

---

# 26. Automation Safety

Automation must never operate without boundaries.

Automation must stop when a customer opts out of the relevant communication.

Automation should stop when a customer becomes WON or otherwise reaches a terminal state for the workflow.

Automation should stop or pause when a salesperson takes ownership where the workflow requires human control.

Automation should stop when the customer replies if continuing automation would create an inappropriate customer experience.

Automation must stop when the channel becomes unavailable.

Automation must stop when the workflow expires.

Automation must be disableable by an administrator.

The system must prevent duplicate automation execution when the same event is delivered more than once.

---

# 27. Sales Follow-Up Automation

The system should automatically identify leads requiring action.

When a lead has no response after a configured period, the system may schedule an appropriate follow-up.

The follow-up channel should depend on the customer's available and permitted channels.

The system should prefer the customer's known communication preference.

The system should avoid sending the same message repeatedly across every channel.

A communication strategy should be coordinated rather than channel-blind.

For example, a lead may receive an email followed later by SMS, while a WhatsApp conversation may take priority over both.

---

# 28. Human Handoff

Human sales activity always takes priority over automation when a human takeover state is active.

A salesperson must be able to take ownership of a conversation.

Once human ownership is active, automated messages must not interfere with the conversation unless the workflow explicitly permits a limited operational action.

The system must show who currently owns the conversation.

The system must show whether automation is active, paused, or stopped.

---

# 29. Campaign Management

The system must support campaign attribution.

Campaigns may originate from paid advertising, organic content, email, social media, referral partners, influencers, direct campaigns, or other acquisition channels.

Campaign URLs should contain structured attribution information.

The system must preserve first-touch information.

The system should also record later campaign interactions.

Marketing operators must be able to distinguish acquisition from conversion.

---

# 30. Attribution Model

Attribution must connect:

**Campaign → Partner or Source → Visitor → Engagement → Lead → Opportunity → Customer → Revenue**

The system must preserve the original acquisition source while also recording relevant subsequent interactions.

First-touch attribution must not be overwritten simply because a later campaign generated another interaction.

The system may maintain multi-touch attribution separately.

Revenue attribution must clearly state which attribution method produced the reported number.

The system must never present an attribution calculation as objective truth when the model is only one selected attribution methodology.

---

# 31. Partner and Agent System

Aslal may work with agents, influencers, affiliates, resellers, and other referral partners.

Each partner must have a structured profile.

The profile should contain partner type, status, contact information, commercial terms, referral information, assigned owner, and relevant performance data.

Each partner should be able to receive one or more referral links.

A referral link must identify the partner and, where appropriate, campaign or product context.

---

# 32. Referral Tracking

When a visitor arrives through a partner referral URL, the system should record the referral event.

The system should preserve the referral association for an appropriate attribution period.

When the visitor becomes a lead, the referral should be associated with the lead.

When the lead becomes an opportunity and eventually a customer, the referral relationship must remain available for commission calculation.

The system must prevent duplicate referral attribution from producing incorrect commissions.

---

# 33. Commission Management

A commission represents an amount potentially owed to a partner based on defined commercial rules.

Commission calculation must be deterministic and auditable.

The system must show the originating customer or transaction, partner, attribution source, commission basis, calculated amount, current commission state, and relevant dates.

The commission lifecycle must support qualification, approval, payable state, payment, and controlled voiding.

A paid commission must not be silently modified.

Changes must be auditable.

---

# 34. Revenue Management

Revenue must be represented separately from pipeline value.

Pipeline value represents potential business.

Won value represents confirmed commercial outcomes.

Revenue reporting should distinguish between estimated deal value, confirmed deal value, collected payment, outstanding payment, and partner-attributed revenue where applicable.

The system must not confuse a proposal amount with collected revenue.

Payment provider information must be stored separately from the commercial transaction itself.

---

# 35. Ethiopian Market Requirements

The product must be designed for the realities of the Ethiopian market.

The system must be mobile-first because a substantial portion of customers will interact primarily through mobile devices.

The system must work under limited bandwidth.

Pages should avoid unnecessary assets and excessive JavaScript.

Important customer journeys must remain functional under slow network conditions.

Communication through SMS and messaging channels must be treated as first-class commercial capabilities rather than secondary features.

The system should support English, Amharic, and Afaan Oromoo as initial languages.

The architecture must allow additional languages later.

---

# 36. Ethiopian Business Segmentation

The system must support businesses across Ethiopian commercial sectors.

The customer segmentation model should support retail, wholesale and distribution, professional services, manufacturing, hospitality, education, healthcare, real estate, logistics, agriculture and agri-business, NGOs and non-profits, startups, diaspora-facing businesses, and other business categories.

The system must not hard-code business logic around one sector.

Business type must remain configurable.

---

# 37. Ethiopian Phone Numbers

Phone numbers must be normalized into a consistent internal representation.

The system should support Ethiopian numbers using the +251 country code.

Different customer-entered formats should resolve to the same normalized representation where they represent the same number.

The original submitted value may be retained for display or audit purposes.

Duplicate customer detection should use normalized contact information where appropriate.

---

# 38. Payments

The system must support Ethiopian Birr as a primary commercial currency.

Payment integrations must be implemented through an abstraction layer.

The core system must not become dependent on one payment provider.

A payment record should include amount, currency, provider, provider reference, status, customer or transaction relationship, timestamps, and reconciliation state.

The system must support manual payment verification where automatic verification is unavailable.

The system must distinguish initiated, pending, successful, failed, refunded, cancelled, and manually verified states as appropriate to the integration.

---

# 39. Trust and Conversion

The system must recognize that trust is a major factor in Ethiopian digital commerce.

Customer-facing journeys should provide understandable company information, contact information, clear service descriptions, transparent expectations, and reliable communication.

The CRM should make response speed measurable.

A lead that receives no response is an operational failure regardless of how sophisticated the marketing system is.

The Growth OS should therefore measure response time and follow-up completion.

---

# 40. Privacy and Personal Data

Personal information must be handled according to applicable Ethiopian personal-data protection requirements and other applicable laws.

The system must collect only information required for legitimate business purposes.

Sensitive information must not be collected merely because it could improve targeting.

The system must maintain communication preferences and opt-out information.

The system must provide appropriate retention and deletion mechanisms.

Access to customer data must be role-controlled.

Sensitive customer information must not be exposed through logs, URLs, analytics events, or unrestricted API responses.

---

# 41. Security

Authentication must protect internal system access.

Authorization must ensure that users only access functions and data appropriate to their role.

API endpoints must validate authentication and authorization independently.

The system must protect secrets through environment configuration.

API credentials must never be stored in source code.

Webhook endpoints must validate signatures where supported.

Rate limiting must protect publicly accessible endpoints.

Input validation must occur at system boundaries.

Audit records must be protected from unauthorized modification.

---

# 42. Data Architecture

The underlying database must represent people, organizations, visitors, events, leads, opportunities, products, services, conversations, messages, campaigns, partners, referrals, commissions, payments, tasks, activities, automation workflows, automation executions, and audit records.

The model must avoid unnecessary duplication.

Business entities must have stable identifiers.

External provider identifiers must be stored separately from internal identifiers.

Provider-specific metadata should not contaminate the core business model.

The system should use an adapter architecture for external services.

---

# 43. Event Architecture

Important actions should generate internal events.

An event should identify what happened, when it happened, the relevant entity, the source, and useful contextual information.

Events must be idempotent where external systems may deliver duplicates.

Events should support downstream automation.

The event system must distinguish between business events and technical logs.

A customer viewing a product is a business event.

A database connection timeout is a technical log.

These must not be treated as the same type of data.

---

# 44. Integration Architecture

External integrations must be isolated behind adapters.

The system should be capable of replacing an email provider without redesigning the CRM.

The same principle applies to SMS, WhatsApp, Telegram, Messenger, payment providers, analytics providers, and future external services.

Each integration must have health status, credentials, configuration, provider identifiers, error handling, retry rules, and audit information.

External failures must not corrupt core CRM records.

A temporary messaging-provider outage must not delete a lead.

---

# 45. Webhooks

Inbound webhooks must be treated as untrusted external input.

Every supported provider webhook must validate its authenticity where the provider supports verification.

Webhook processing must be idempotent.

The system should record provider event IDs.

Duplicate events must not create duplicate leads, messages, payments, or commissions.

Failed webhook processing must be observable and retryable.

---

# 46. AI Agent Architecture

AI agents may assist the system but must not become an uncontrolled replacement for deterministic business logic.

AI can summarize conversations.

AI can classify customer intent.

AI can extract structured information from messages.

AI can suggest follow-up messages.

AI can suggest product or service matches.

AI can summarize customer history.

AI can recommend sales actions.

AI can assist content creation.

AI can identify patterns in demand.

AI must not invent customer facts.

AI must not claim that an anonymous person has been identified.

AI must not send high-impact customer communication without the permissions defined by the workflow.

AI-generated actions must remain auditable.

---

# 47. AI Agent Instructions

An AI coding agent working on Growth OS must first understand the business entity involved, the workflow being modified, the source event, the destination action, the permissions required, and the effect on attribution and reporting.

An AI agent must not modify the database schema merely to solve a local UI problem.

An AI agent must not introduce a new service when an existing abstraction can satisfy the requirement.

An AI agent must not duplicate business logic across multiple routes.

An AI agent must not bypass authentication or validation for convenience.

An AI agent must not create fake data to make a dashboard appear functional.

An AI agent must preserve existing historical records when changing workflows.

An AI agent must treat attribution as financial data because it can influence partner compensation.

---

# 48. Automation Recipes

A new website lead should immediately create or update the customer record, preserve acquisition attribution, create a sales task, notify the responsible sales operator, and send an appropriate acknowledgement through the configured channel.

A high-intent product inquiry should increase the customer's commercial priority, associate the relevant product or service interest, create a sales action, and begin the configured follow-up workflow.

A customer who does not respond should enter a controlled follow-up sequence rather than receiving unlimited messages.

A customer who replies should become eligible for human handling.

A customer who becomes a customer should exit lead-generation workflows and enter the appropriate customer lifecycle.

A referred customer should preserve partner attribution through the entire commercial journey.

A won transaction should trigger commission calculation where applicable.

A paid commission should become a permanent financial record.

---

# 49. Dashboard Requirements

The primary dashboard must provide a real operational view of the business.

It should show current visitors, meaningful engagement, new leads, qualified opportunities, active pipeline, won business, revenue, overdue follow-ups, partner-generated opportunities, commissions, communication activity, and automation health.

The dashboard must prioritize actionable information.

A manager should be able to identify what needs attention without interpreting complex analytics.

Marketing views should emphasize acquisition and engagement.

Sales views should emphasize people and actions.

Partner views should emphasize referrals and commercial results.

Management views should emphasize revenue and business performance.

---

# 50. Sales Workspace

The sales workspace should provide a searchable list of leads and opportunities.

The operator should be able to filter by stage, owner, score, source, campaign, partner, product interest, communication channel, age, and next action.

Opening a lead should reveal the customer profile, timeline, interests, attribution, conversations, sales history, tasks, opportunity information, and next action.

The operator should be able to update the stage, create a task, add a note, initiate a supported communication, assign ownership, update commercial information, and record the outcome.

---

# 51. Marketing Workspace

The marketing workspace should show campaigns, traffic sources, content performance, product interest, engagement, leads, opportunities, and revenue.

The system must make it possible to answer whether marketing activity produces commercial outcomes.

Vanity metrics must not replace conversion and revenue metrics.

A campaign with many clicks but no qualified opportunities must remain distinguishable from a campaign producing fewer visitors but meaningful commercial demand.

---

# 52. Partner Workspace

The partner workspace should show each partner's referral links, clicks, leads, opportunities, customers, revenue, commissions, and status.

Partner attribution must be traceable to underlying records.

The system must prevent partner performance reports from counting the same commercial outcome incorrectly.

---

# 53. Customer Communication Center

The communication center should provide a unified view of conversations across supported channels.

The operator must know which channel a message came from.

The operator must know whether the conversation is human-controlled or automated.

The operator must see customer identity and relevant commercial context.

The operator should not have to manually reconstruct customer history from different channel dashboards.

---

# 54. Notification System

The system should provide internal notifications for important operational events.

Examples include a new high-intent lead, overdue follow-up, customer reply, new opportunity, partner-generated lead, won opportunity, failed automation, failed payment, and integration failure.

Notifications must have severity and relevance.

The system must avoid notification overload.

---

# 55. Error Handling

Business operations and technical failures must be separated.

A failed email should not make the lead creation fail if the lead was successfully stored.

A failed SMS should be recorded as a communication failure while preserving the customer record.

A payment-provider outage should not erase an order.

A social API failure should not delete campaign data.

Every external failure should have enough information for an operator or developer to diagnose the problem.

---

# 56. Reliability Requirements

The system must prioritize data integrity over convenience.

A customer record must not be duplicated simply because an external webhook is delivered twice.

A lead must not be lost because an email provider is unavailable.

A commission must not be calculated twice because an event was processed twice.

An automation must not execute twice for one idempotent trigger.

Database writes associated with critical business transactions must be atomic where necessary.

---

# 57. Performance Requirements

The public website must remain usable on mobile networks.

Tracking must not significantly delay page rendering.

Analytics events should be processed efficiently.

CRM pages should paginate large datasets.

Dashboard queries must avoid unnecessary full-table operations.

Large customer timelines should load incrementally.

Automation workers must not block customer-facing requests.

---

# 58. Observability

The system must expose health information for critical components.

The application must expose application health.

The database must have a separate database health check.

External integrations should expose integration health.

Automation failures must be visible.

Webhook failures must be visible.

Background jobs must be observable.

Production errors must include correlation identifiers where appropriate.

Logs must not expose passwords, API secrets, authentication tokens, or unnecessary personal information.

---

# 59. Auditability

Important business changes must be auditable.

The system must record changes to lead stage, ownership, opportunity value, commission state, payment status, automation state, partner attribution, and other financially or operationally important information.

Audit records should identify the actor and timestamp.

Where the actor is an AI agent or automation worker, the system should identify the automation or agent.

---

# 60. Reporting Principles

Reports must always explain what the number represents.

Visitor count must not be presented as unique people unless the measurement actually represents unique people.

Social reach must not be presented as customers.

Ad-platform audience estimates must not be presented as confirmed customers.

Pipeline value must not be presented as revenue.

Attributed revenue must state its attribution method.

Partner-generated revenue must be based on defined attribution rules.

AI-generated insights must be distinguishable from directly measured facts.

---

# 61. Localization

Localization must not be implemented as simple word replacement.

Content should support English, Amharic, and Afaan Oromoo.

Dates, numbers, currencies, messages, form labels, validation messages, notifications, automated communication, and customer-facing templates should be localization-aware.

Customer language preference must influence communication where possible.

The system should allow future languages without rewriting business logic.

---

# 62. Mobile Experience

The primary customer experience must be responsive.

Forms must be easy to complete on phones.

WhatsApp, Telegram, Messenger, and phone contact actions must be immediately accessible where relevant.

Tables in internal dashboards must remain usable on small screens.

Large desktop dashboards must not simply be squeezed into mobile screens.

The mobile experience must preserve the operational hierarchy of information.

---

# 63. Accessibility

Customer-facing interfaces must use semantic HTML.

Interactive elements must be keyboard accessible.

Forms must have understandable labels and validation.

Color must not be the only mechanism for communicating state.

Automated messages must remain understandable without relying on visual formatting.

---

# 64. Deployment Model

The application must be deployable to the target hosting environment without requiring developers to manually reproduce a development environment on production.

Production builds should be created in GitHub Actions.

The deployment package must contain everything required by the configured production runtime.

Production must not depend on executing development-only build commands.

Database migration procedures must be separated from application deployment.

Production database operations must be designed around the limitations of the hosting environment.

---

# 65. Development Workflow

All meaningful development work must use version control.

Features should be developed through branches.

Changes should be reviewed through pull requests.

CI must validate the application before deployment.

The main branch must remain deployable.

A developer or AI agent should not directly modify production configuration without an auditable change.

---

# 66. Testing Strategy

The system must test business logic rather than only visual rendering.

Tests should verify lead creation.

Tests should verify attribution.

Tests should verify identity resolution.

Tests should verify stage transitions.

Tests should verify referral attribution.

Tests should verify commission calculations.

Tests should verify automation triggers.

Tests should verify automation cancellation.

Tests should verify duplicate webhook handling.

Tests should verify payment state transitions.

Tests should verify communication preference enforcement.

Tests should verify API authentication and authorization.

Tests should verify critical customer journeys.

---

# 67. Definition of Done

A feature is complete only when its business behavior, user interface, data persistence, security behavior, error handling, audit behavior, testing, and deployment implications have been addressed.

A feature that works in a developer browser but loses data in production is not complete.

A feature that creates records but cannot explain attribution is not complete.

A feature that sends automated messages without respecting customer state is not complete.

A feature that works for one channel but breaks the unified customer timeline is not complete.

A feature that cannot be operated by the intended business user is not complete.

---

# 68. Release Strategy

The system should be developed incrementally.

The first operational foundation must establish reliable customer records, sales stages, ownership, tasks, attribution, partner tracking, and revenue relationships.

The next stage should establish unified conversations.

The next stage should establish WhatsApp and Messenger integration.

The next stage should establish reusable automation workflows.

The Growth OS release should then connect acquisition, intelligence, sales execution, communication, partners, automation, and revenue.

Advanced AI intelligence should come after the underlying data and workflows are reliable.

---

# 69. Future Intelligence

Once sufficient reliable data exists, the system may provide predictive and analytical capabilities.

It may identify high-intent patterns.

It may identify products with growing demand.

It may identify campaigns producing unusually strong commercial outcomes.

It may recommend follow-up timing.

It may identify leads at risk of becoming inactive.

It may recommend suitable services.

It may detect partner performance changes.

It may summarize sales conversations.

It may identify operational bottlenecks.

These capabilities must be based on actual system data and clearly distinguish prediction from fact.

---

# 70. What the System Must Never Become

Growth OS must not become a surveillance platform.

It must not secretly identify people.

It must not scrape private social information.

It must not bypass platform restrictions.

It must not send spam.

It must not treat every visitor as a lead.

It must not treat every social interaction as consent.

It must not invent customer information.

It must not allow automation to continue indefinitely without state controls.

It must not hide attribution logic.

It must not create financial records that cannot be audited.

It must not become so complicated that a salesperson cannot understand what to do next.

---

# 71. Final System Model

The complete Growth OS can be understood as one connected system.

A person discovers Aslal.

The system understands where that person came from.

The person interacts with Aslal's digital properties.

The system understands what the person is interested in.

The person identifies themselves through an appropriate interaction.

The system connects the known identity with permitted historical activity.

The system determines whether the interaction represents a lead.

The lead enters the sales process.

The system assigns responsibility.

The system identifies the next action.

Communication begins through the appropriate channel.

Automation performs repetitive work.

Humans take control when judgment is required.

The opportunity progresses through the commercial process.

The customer purchases.

Revenue is recorded.

Partner attribution is preserved.

Commission is calculated where applicable.

Customer communication continues after conversion.

The resulting data becomes intelligence for future marketing and sales.

The system therefore creates a continuous loop:

**Acquire → Understand → Engage → Identify → Qualify → Follow Up → Convert → Attribute → Measure → Improve → Acquire**

That loop is the core product.

The implementation may change completely over time, but this business model must remain stable.

---

## 72. Developer and AI-Agent Contract

This PRD is the authoritative functional definition of the Growth OS.

When implementation details conflict with this document, the implementation must be reconsidered rather than silently redefining the product.

When a requirement is ambiguous, the developer or AI agent must identify the ambiguity in terms of business behavior, data ownership, permissions, or workflow state.

When a new feature is proposed, it must identify the customer problem it solves, the system event that initiates it, the data it creates or changes, the user or automation responsible for it, the resulting customer or business action, and how success will be measured.

No implementation should be considered correct merely because it compiles.

Correctness means that the software faithfully represents the commercial process described here, preserves data integrity, respects customer permissions, remains auditable, and gives the responsible human or automation worker a clear next action.

**The Growth OS is therefore not defined by its current codebase. The codebase is an implementation of this product definition.**


This PRD deliberately treats platform integrations as **provider/API-dependent capabilities**. Availability, messaging permissions, template requirements, audience tools and API access must be verified during implementation for each channel.
