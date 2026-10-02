# ASLAL GROWTH OS

## Full Product Requirements Document

**Product:** Aslal Growth OS
**Organization:** Aslal Digital Solutions
**Primary Market:** Ethiopia
**Extended Market:** Ethiopian diaspora and international customers where commercially relevant
**Document Type:** Authoritative Target-State Product Requirements Document
**Version:** 2.0
**Status:** Vision and functional specification
**Audience:** Product owners, developers, architects, UX/UI designers, QA engineers, DevOps engineers, automation engineers, data engineers, integration engineers, sales operators, marketing operators, partner managers, and AI coding agents

---

# 1. Purpose of This Document

Aslal Growth OS is a business growth and commercial operating system designed to help businesses turn market attention into measurable commercial outcomes.

This document defines the complete system that Aslal Digital Solutions intends to provide. It is intentionally independent of the current implementation. A developer reading this document must be able to understand what the product is supposed to become even when that developer has never seen the current repository, database, deployment environment, or previous development work.

The system described here is not simply a website, CRM, analytics dashboard, marketing automation tool, customer-support inbox, influencer platform, affiliate system, payment interface, ecommerce application, or AI assistant. Each of those capabilities may exist inside the system, but none of them individually defines the product.

The product is defined by the connection between them.

The fundamental commercial model is:

**Market Attention → Discovery → Engagement → Identification → Trust → Demand → Lead → Qualification → Conversation → Follow-up → Quote → Negotiation → Order → Payment → Customer → Retention → Referral → Revenue Attribution → Partner Compensation → Business Intelligence**

The system must preserve the relationship between those stages.

A developer must never implement a feature merely because it is technologically interesting. Every feature must exist because it supports an identifiable customer, seller, partner, operational, financial, or growth problem.

The primary business question the system exists to answer is:

> **Where did demand come from, what does the person want, what should happen next, who is responsible, did the customer buy, how much money was generated, who influenced the sale, and what should the business do next?**

---

# 2. Market Context

The system is designed specifically around the realities of the Ethiopian market rather than assuming that Ethiopia behaves like a high-connectivity Western ecommerce market.

Ethiopia has a very large mobile base but a substantially smaller internet-using population. DataReportal's 2026 Ethiopia report estimates 93.2 million cellular connections at the end of 2025, compared with 29.5 million internet users and approximately 9.8 million social-media user identities. The figures also need to be interpreted carefully because mobile connections are not equivalent to unique people and broadband-capable connections do not necessarily imply mobile-data usage.

This means the product must be mobile-first without assuming universal high-speed internet access.

It must support a commercial environment in which people may encounter a business through Google, Facebook, Telegram, WhatsApp, referrals, influencers, physical marketing, radio, direct sales, agents, events, word of mouth, or a website. Digital and traditional acquisition cannot be treated as mutually exclusive systems.

The growth of digital payment infrastructure makes a revenue-connected growth platform increasingly practical. The National Bank of Ethiopia reported that Ethiopia recorded approximately 9.7 trillion birr in digital transactions during FY 2023/24 and that mobile-money accounts had grown dramatically. The National Digital Payments Strategy also emphasizes interoperability, merchant acceptance, trust, resilience, and broader digital-payment usage.

At the same time, ecommerce growth continues to face trust, fulfilment, logistics, consumer-protection, and last-mile challenges. Recent Ethiopian reporting on the sector identified logistics and consumer trust as important constraints even as payment infrastructure improves.

The system therefore must not assume that:

> more traffic = more sales.

It must instead recognize that:

> traffic without trust, capture, follow-up, fulfilment, payment and measurement can still produce little commercial value.

The Personal Data Protection Proclamation No. 1321/2024 is in force in Ethiopia. Personal-data handling therefore needs to be designed into the system rather than treated as an optional compliance layer added after development.

---

# 3. Product Vision

Aslal Growth OS shall become the operating layer that connects demand generation, customer interaction, sales execution, commerce, partner distribution and revenue intelligence for Ethiopian businesses.

A business should be able to connect its website, social channels, campaigns, referral partners, salespeople, agents, influencers, customer communications, products, services, orders, payments and customer relationships to one coherent operating environment.

A manager should be able to open one record and understand a customer's commercial journey without reconstructing it from Facebook, WhatsApp, email, spreadsheets, notebooks, payment screenshots and separate sales reports.

A seller should know who needs attention today.

A marketer should know which activities create commercially meaningful demand.

A partner should know which products they are authorized to promote and what their activities have generated.

An influencer or sales agent should know which links to use, which products to promote, which customers resulted from their promotion, and what commission is attributable to those customers.

A business owner should be able to distinguish between attention, demand, pipeline, sales, cash received and actual revenue.

A customer should experience a clear and trustworthy journey rather than being repeatedly asked for information that the business already possesses.

---

# 4. Product Mission

The mission of Aslal Growth OS is:

> **Turn fragmented business attention into an organized, measurable and repeatable path from demand to revenue.**

The system must accomplish this while respecting customer privacy, communication permissions, platform rules, local business practices, Ethiopian connectivity constraints and the need for human involvement in commercial decisions.

The platform should help businesses become more disciplined without forcing them to adopt complicated enterprise software practices that do not fit their operations.

---

# 5. The Core Problem

The system exists because businesses commonly suffer from several connected failures.

A potential customer may see an advertisement but never become identifiable.

A customer may inquire through WhatsApp and never receive follow-up.

A salesperson may receive a lead but forget to call.

A lead may be marked as “interested” without a defined next action.

A marketing campaign may produce many clicks but no understanding of whether those clicks produced revenue.

An influencer may generate leads but the business cannot prove which customers came through the influencer.

A partner may sell a product but the supplier cannot independently reconstruct the result.

A seller may quote a price through chat but the quote is never recorded as a commercial object.

A customer may pay by one payment method while the salesperson records the transaction manually somewhere else.

A business may have several customer conversations across email, WhatsApp, Telegram, Messenger and telephone but no single customer timeline.

An organization may have customers in Amharic, Afaan Oromoo and English but communicate without preserving language preference.

A customer may hesitate because the business lacks visible proof of legitimacy, reviews, delivery expectations, return information, payment clarity or human support.

These are not independent problems.

They form one broken commercial chain.

Aslal Growth OS must therefore solve the chain rather than one isolated link.

---

# 6. The Fundamental Product Model

The system shall treat the commercial journey as a connected graph rather than a collection of independent records.

The canonical journey is:

**Source → Campaign → Content/Placement → Visitor/Contact → Engagement → Intent → Lead → Qualification → Conversation → Opportunity → Quote → Order → Payment → Customer → Retention → Referral**

A partner or influencer may enter the journey at the acquisition stage.

A salesperson may enter at the qualification stage.

A payment provider may enter at the payment stage.

A customer-support operator may enter after purchase.

The system must preserve all applicable relationships.

For example:

**Facebook campaign → influencer referral → visitor → product view → WhatsApp inquiry → lead → qualification → quotation → negotiation → order → payment → customer → repeat purchase**

must remain reconstructable as one journey.

---

# 7. Product Principles

The system shall favor understandable business states over abstract technical states.

The system shall distinguish measured facts from inferred intelligence.

The system shall distinguish anonymous activity from identified customer information.

The system shall distinguish interest from actual demand.

The system shall distinguish pipeline value from received revenue.

The system shall distinguish attribution from causation.

The system shall distinguish partner clicks from partner-generated customers.

The system shall distinguish automated actions from human actions.

The system shall preserve an audit history for financially or operationally important changes.

The system shall never invent customer data merely to make dashboards look complete.

The system shall never allow a technical failure in an external integration to silently destroy a valid business record.

The system shall prioritize mobile usability, low bandwidth, reliability and human-assisted sales.

The system shall not make the product dependent on one external provider.

---

# 8. System Actors

The platform shall support several categories of participants.

## 8.1 System Administrator

The system administrator controls system configuration, users, roles, integrations, security policies, product catalog, partner policies, automation policies and administrative functions.

The administrator must be able to diagnose technical and operational problems without directly modifying production database records.

Sensitive administrative actions must be authenticated and audited.

---

## 8.2 Business Owner

The business owner needs a management-level view.

The owner must be able to understand acquisition, demand, pipeline, sales activity, customers, orders, payments, revenue, partner performance, commissions, customer retention, operational problems and marketing performance.

The owner should not need to understand the technical architecture.

---

## 8.3 Sales Manager

The sales manager owns sales-team performance.

The manager must be able to assign leads, inspect overdue work, review pipeline movement, monitor conversion, inspect stalled leads, review conversations, review quotations, review opportunities and understand expected and actual commercial value.

---

## 8.4 Sales Operator

The sales operator is responsible for moving demand toward commercial completion.

The primary seller experience must revolve around:

**Who needs attention?**

**What do they want?**

**What happened previously?**

**What should I do now?**

**What did I offer?**

**Did the customer accept?**

**Did they pay?**

The system must not require the salesperson to navigate unnecessarily through analytics modules.

---

## 8.5 Marketing Operator

The marketing operator manages campaigns, content, acquisition channels, landing pages, source attribution, audience activity and performance.

The marketing workspace must connect attention to commercial outcomes.

The marketer should be able to understand not only impressions, reach and clicks but also leads, opportunities, customers and attributed revenue.

---

## 8.6 Partner Manager

The partner manager controls relationships with agents, affiliates, influencers, resellers and implementation partners.

This includes partner onboarding, product eligibility, referral links, campaigns, commission rules, attribution disputes, partner performance and payout records.

---

## 8.7 Partner

A partner can represent a supplier, software company, service provider, affiliate, reseller, implementation provider or another commercial relationship.

The platform must distinguish between different commercial relationships because revenue sharing, responsibility and attribution can differ.

---

## 8.8 Influencer

An influencer is a distribution participant who promotes eligible products or services to an audience.

The system must allow influencers to use trackable campaign and referral assets without requiring them to understand the underlying CRM.

---

## 8.9 Agent

An agent is an individual or business representative who generates or assists with customer acquisition or sales.

Agents may operate through personal relationships, field sales, telephone sales, messaging applications or digital links.

The system must support hybrid offline-and-online sales journeys.

---

## 8.10 Customer

Customers interact with the public website, forms, products, services, messaging channels, quotation flows, order flows, payment systems, support workflows, referrals and retention campaigns.

Customers must not be treated merely as lead records after conversion.

---

## 8.11 AI and Automation Actors

Automation workers and AI agents are system actors.

They must have explicit permissions.

Their actions must be attributable.

They must not silently overwrite human decisions or invent facts.

---

# 9. Organization and Workspace Model

The platform must support the concept of a business workspace.

A workspace represents the operational environment of a business.

The system should support Aslal's own internal operation and should also be capable of supporting managed-client businesses without requiring a fundamentally different product architecture.

A workspace should contain its own:

customers, people, leads, opportunities, products, services, campaigns, conversations, orders, payments, partners, commissions, automation, activities, users, permissions, settings and reports.

A user may belong to one or more workspaces depending on authorization.

No workspace must be able to access another workspace's customer or financial records without explicit authorization.

---

# 10. Business and Customer Identity

The system must represent people and organizations separately.

A customer can be an individual.

A customer can be associated with a business.

A business may have multiple people.

One person may have multiple commercial relationships over time.

The system must avoid forcing every lead into an assumed formal company structure because Ethiopian commerce includes individuals, informal businesses, sole operators, organizations, associations and formal companies.

A person's identity may contain:

name, phone, email, preferred language, role, consent state, communication preferences, notes and relevant customer history.

An organization may contain:

business name, business type, industry, location, website, contact persons, commercial profile, tax information where legitimately required, products purchased, opportunities, orders and relationship history.

Identity information must be distinguishable from behavioral observations.

---

# 11. Visitor Intelligence

The system must be capable of creating an anonymous visitor context when a person interacts with an Aslal-controlled digital property, subject to applicable privacy requirements.

Anonymous visitor activity must not be treated as confirmed human identity.

The system may record commercially useful events such as:

page views, product views, service views, content views, pricing interactions, calculator use, form starts, form submissions, CTA interactions, referral visits, campaign interactions, chat launches, quote requests and other approved events.

Every business event must contain enough context to explain what happened.

A visitor event should include, where appropriate:

timestamp, page, product/service, campaign, source, medium, referral code, visitor context and non-sensitive metadata.

The system must avoid collecting arbitrary data merely because collection is technically possible.

---

# 12. Identity Resolution

The system must provide a controlled process for moving from anonymous activity to known identity.

Identity becomes known through legitimate actions such as:

form submission, account creation, authenticated activity, verified communication, customer-provided phone number or email, order information, payment information, or authorized external integration data.

The system must never claim to know the identity of an anonymous person simply because behavioral patterns appear similar.

Identity resolution should preserve the original anonymous history where appropriate.

The customer should therefore be able to become identifiable without losing the commercial context that preceded identification.

---

# 13. Demand Detection

The system must distinguish between:

**attention**

**interest**

**commercial intent**

**lead**

**qualified opportunity**

A person viewing a page once is not automatically a lead.

A person requesting a quotation is a stronger signal.

A person asking for a price through WhatsApp is a different signal.

A person accepting a quote is another level.

The platform must maintain these distinctions so that marketing data does not become inflated with false leads.

The system should support a concept of a **Growth Opportunity** or equivalent high-intent signal for anonymous people.

A Growth Opportunity should identify the observed commercial interest without falsely identifying the visitor.

---

# 14. Lead Management

A lead represents identifiable commercial demand that deserves sales attention.

A lead must have an understandable lifecycle.

At minimum, the system must support:

**New → Contacted → Qualified → Demonstration/Consultation → Proposal → Negotiation → Won/Lost**

The exact terminology should be configurable by workspace.

A lead must have an explicit status.

An active lead must have an owner or an explicit unassigned state.

An active lead must have a next action.

A next action must have enough information for a human or automation worker to know what needs to happen.

A next-action due date should be available where timing matters.

A lead must maintain source attribution.

A lead must preserve relevant campaign and referral information.

A lead must support one or more product or service interests.

A lead must support notes, tasks, conversations, activities, quotations and opportunities.

---

# 15. Lead Capture

Lead capture must support multiple entry points.

A lead may be generated from:

website contact form, consultation request, quotation request, product inquiry, booking request, chatbot qualification, WhatsApp inquiry, Telegram conversation, Messenger conversation, email inquiry, agent entry, influencer referral, partner referral, salesperson entry, campaign landing page, ecommerce activity or another defined commercial event.

The capture system must normalize contact information where appropriate.

Ethiopian phone numbers should support canonical normalization while preserving the originally submitted representation when necessary for audit or troubleshooting.

The system must handle:

`0911xxxxxx`

`+251911xxxxxx`

`251911xxxxxx`

and other supported forms consistently.

Invalid phone numbers must produce understandable validation errors rather than generic technical failure messages.

---

# 16. Product and Service Interest

Every relevant lead must be capable of expressing what they are interested in.

Interest may refer to:

an Aslal service, a third-party product, software, hosting, marketing service, SEO service, website development, ecommerce implementation, payment integration, CRM, automation, branding, content creation, consulting, technology product, partner product or another configured offering.

The system must support multiple interests for a single customer.

A customer may want:

website development + SEO + payment integration.

The system must not force those into one ambiguous text field.

Interest may originate from:

website behavior, explicit inquiry, salesperson entry, campaign, conversation, partner referral or customer selection.

Behavioral interest and explicit commercial interest must remain distinguishable.

---

# 17. Lead Scoring

Lead scoring must be transparent and explainable.

Scores should come from defined signals rather than an opaque number.

Examples of signals include:

high-intent form submission, quotation request, repeated product interaction, pricing interaction, consultation request, positive conversation response, referral activity, return visit, order initiation and other approved commercial events.

A score must be explainable to a salesperson.

The interface should be able to communicate:

> “This lead has a high score because they requested a quote, visited the pricing page three times, and replied to your previous message.”

The system must not pretend that scoring is a certainty about human intent.

AI may later improve recommendations, but the underlying scoring foundation must remain auditable.

---

# 18. Sales Workspace

The sales workspace shall be action-oriented.

A salesperson should be able to open the system in the morning and immediately see:

which customers need a response, which leads have overdue actions, which opportunities have moved, which quotes require attention, which customers have replied, which deals are waiting for payment and which prospects are approaching inactivity.

The system must not force the operator to construct this information manually.

The salesperson should be able to open a lead and see:

identity, business, source, campaign, referral, interests, score, stage, owner, next action, conversations, activities, tasks, quotations, opportunities, orders, payments and relevant customer history.

---

# 19. The “Today's Revenue Work” Experience

The system should provide a task-oriented operational view called something equivalent to **Today's Revenue Work**.

This view is more important than a generic dashboard.

It should answer:

> “What actions today can move real business forward?”

An item may say:

> Follow up with customer because proposal was delivered two days ago.

Another may say:

> Reply to WhatsApp inquiry concerning ecommerce implementation.

Another may say:

> Confirm payment because order is accepted but payment is pending.

Another may say:

> Contact referred prospect because this partner lead has not yet received first contact.

Each action must connect to the underlying customer and commercial record.

---

# 20. Opportunity Management

An opportunity represents a genuine commercial possibility.

A lead may produce more than one opportunity.

For example, a company may initially request website development and later pursue CRM implementation separately.

An opportunity must contain:

customer/lead relationship, product/service interest, owner, stage, expected value, currency, probability where used, expected close date, source, campaign and referral attribution.

An opportunity must have a next action.

The system must distinguish opportunity value from received revenue.

---

# 21. Quotation and Proposal Management

The system must support a dedicated quotation or proposal entity.

A quote is not simply a message.

It represents an actual commercial offer.

A quotation should contain:

customer, opportunity, products/services, quantities, prices, discounts, tax treatment where applicable, currency, terms, expiration date, created by, status and version history.

The quote lifecycle should support states such as:

draft, sent, viewed where measurable, negotiating, accepted, rejected, expired, cancelled and superseded.

The system must preserve quote history.

If the salesperson changes an amount after sending an offer, the system should create a new version rather than silently overwriting the previous one.

This is essential for commercial accountability.

---

# 22. Negotiation Management

The system should reflect real Ethiopian commercial behavior rather than assuming every transaction is “price displayed → checkout.”

A customer may ask for a discount.

A seller may offer a revised price.

A customer may request different quantities.

A supplier may alter delivery terms.

The platform must allow negotiated offers to be recorded.

A negotiation record should connect:

original quote, proposed change, actor, timestamp, resulting offer, customer response and final commercial state.

The system should make it possible to see how the final price was reached without interpreting negotiation as suspicious behavior.

---

# 23. Orders and Commerce

The system must support both service commerce and product commerce.

An order can represent:

a software product, physical product, subscription, digital service, implementation service, project, training package, consulting engagement or combination.

An order must contain:

customer, items, quantities, price, discount, tax where applicable, shipping/fulfilment information where relevant, currency, order status, payment status, fulfillment status and commercial source.

The order must be independent of the lead lifecycle.

A customer who purchased something should remain a customer even after the original lead is closed.

---

# 24. Payment Management

Payment must become a first-class entity.

The system must not treat “paid” as merely a text field on a customer.

A payment record should represent:

amount, currency, provider, transaction/reference identifier, order, customer, date, status, payment method, received/expected state and reconciliation information.

The system must support multiple payment methods.

Depending on provider availability and business configuration, this may include:

mobile money, bank transfer, card payments, payment gateway transactions, interoperable QR payments, cash records and other approved methods.

Payment infrastructure in Ethiopia is becoming increasingly interoperable, including national QR efforts, while merchant acceptance remains an explicit strategic priority.

The architecture therefore must be provider-neutral.

The system should not be designed around one payment company.

---

# 25. Payment Reconciliation

The platform must distinguish:

payment initiated

payment reported

payment verified

payment failed

payment reversed

payment refunded

payment reconciled

A transaction reference must be stored where the provider supplies one.

Webhook and API events must be idempotent.

A duplicated payment-provider event must not create duplicated revenue.

A provider outage must not delete an order.

A payment mismatch must be visible to an authorized operator.

The system must support manual reconciliation with reasons and audit records.

---

# 26. Revenue Model

The platform must clearly distinguish:

lead value

opportunity value

quoted value

order value

paid amount

recognized revenue

commissionable amount

partner commission

refund amount

net commercial result

A business owner must never see “ETB 500,000 pipeline” mislabeled as revenue.

Attribution reports must explicitly state whether revenue is based on:

first touch, last touch, campaign attribution, referral attribution, assisted attribution, direct attribution or a configured multi-touch method.

---

# 27. Customer Lifecycle

Conversion to customer is not the end of the system.

After a sale, the customer should enter an ongoing lifecycle.

The system should support:

onboarding, delivery, implementation, support, satisfaction, repeat purchase, upsell, cross-sell, renewal, review request, referral request and reactivation.

The customer record must preserve the original source of acquisition.

A business should know:

> “This customer originally came from this campaign and later purchased this second service.”

The system must therefore treat acquisition attribution as persistent historical information.

---

# 28. Customer Success and Support

The system should support post-sale operational communication.

Customer problems should not be mixed ambiguously into the sales pipeline.

The platform should be capable of representing:

support request, issue, question, implementation request, delivery issue, refund request and customer feedback.

The support record should connect to the customer, order and conversation.

A customer who reports a problem must not automatically continue receiving promotional automation without considering their state.

---

# 29. Trust Layer

Trust must be treated as a product capability.

Ecommerce growth in Ethiopia continues to face consumer trust and fulfilment challenges even as payments improve.

The system should therefore support a **Business Trust Profile**.

A trust profile may contain:

verified business identity where applicable, business name, contact methods, business location, website, support channels, payment methods, delivery information, return/refund policy, customer reviews, service guarantees, response expectations, certificates where relevant and evidence of completed transactions where legitimately publishable.

The system must not create fake “verified” claims.

Verification status must have a source and date.

A business should be able to expose trustworthy information to customers before they buy.

---

# 30. Reviews and Social Proof

The system should support post-purchase review requests.

A review must be associated with a real customer relationship where practical.

The system should distinguish:

verified purchase review

customer feedback

testimonial

case study

public social mention

unverified external review

The system must not manipulate or fabricate reviews.

Customers may be asked for permission to publish testimonials.

A business may use legitimate reviews as part of trust-building campaigns.

---

# 31. Marketing Campaign Management

Campaign must be a first-class entity.

A campaign is more than a string attached to a URL.

A campaign should represent a defined marketing initiative.

It should contain:

name, objective, target audience, start date, end date, owner, channel, budget, associated products/services, content assets, landing pages, partners, referral links and outcome metrics.

The system must make campaign performance measurable against downstream business results.

A campaign dashboard should be able to show:

attention → engagement → leads → qualified leads → opportunities → customers → payment → revenue.

---

# 32. Content and Creative Attribution

The system should support individual marketing assets.

An asset may be:

Facebook post, Instagram post, Telegram post, TikTok content, advertisement, landing page, email campaign, video, article, image, influencer publication, referral placement, QR code, poster, radio campaign or offline campaign identifier.

The important requirement is that content must be capable of connecting to the campaign and downstream results.

The system should therefore support attribution at the asset level where data is available.

---

# 33. Traditional Marketing Integration

The system must not require every campaign to be digital.

A business may run:

radio advertising, outdoor advertising, event campaigns, flyers, printed QR codes, field-agent campaigns or direct sales initiatives.

Each campaign should be capable of having an acquisition identifier.

For example, a radio campaign might direct customers to:

`aslaldigital.com/radio-august`

A printed campaign may use a QR code.

An agent may use a referral code.

A field-sales campaign may use a manually assigned source.

The system can then connect offline demand to digital or manually captured leads.

The goal is not to pretend that traditional marketing is digitally measurable in every circumstance.

The goal is to improve measurability wherever an appropriate mechanism exists.

---

# 34. Marketing Channel Management

The system should represent acquisition channels independently from campaigns.

Channels may include:

search, social, paid advertising, email, messaging, partner, referral, influencer, agent, direct, event, radio, television, outdoor, physical store, organic traffic and other configurable sources.

The system should support custom channels without requiring database redesign.

---

# 35. Partner Management

Partner management must be a core subsystem.

A partner may be an:

agent, influencer, affiliate, reseller, technology provider, implementation partner, supplier, strategic partner or another approved type.

Each partner should have:

identity, contact information, type, status, agreements, permitted products, referral links, campaigns, lead volume, opportunities, customers, revenue, commission state and payout history.

Partner performance must be based on reconstructable commercial data rather than manually submitted claims.

---

# 36. Partner Product Access

Partners must not automatically receive access to every product.

A product may be:

available to all partners

restricted to selected partners

available only for implementation partners

available only for affiliates

available only under reseller agreements

or not partner-distributable.

The platform must therefore support partner-product eligibility.

A partner should know exactly what they are authorized to promote.

---

# 37. Partner Referral Links

A partner should receive trackable links and codes.

A referral link should preserve:

partner, campaign, product, destination, creation date and status.

Clicks should be tracked where legally and technically appropriate.

A click should connect to a visitor context when available.

The visitor may later become a lead.

The lead may become an opportunity.

The opportunity may become a customer.

The customer may generate revenue.

That entire chain must remain reconstructable.

---

# 38. Influencer Platform

The influencer experience should be deliberately simpler than the internal CRM.

An influencer should be able to:

view eligible products, understand product positioning, obtain promotional links, access approved creative material, see clicks, see leads, see qualified opportunities, see customers, see attributed revenue and see commission status.

The influencer should not need to understand database entities.

The interface should communicate commercial outcomes in simple terms.

---

# 39. Agent Platform

Agents may operate differently from influencers.

An agent may manually create a lead from a phone call or physical meeting.

The system should allow authorized agents to capture:

customer name, phone, business, interest, source, notes, promised follow-up and relevant context.

The agent should be able to see the status of their submitted opportunities without being granted access to unrelated customer data.

---

# 40. Partner Commission System

Commission must be connected to an actual commercial outcome.

The platform should support commission rules such as:

fixed amount, percentage of order value, percentage of collected revenue, per-lead commission, per-qualified-lead commission, tiered commission and custom agreements.

Commission calculations must be auditable.

The platform must distinguish:

pending commission

qualified commission

approved commission

payable commission

paid commission

voided commission.

A commission should not become payable merely because somebody generated a click.

The exact trigger must be defined by the partner agreement and recorded.

---

# 41. Commission Disputes

Partners must be able to submit an attribution or commission question.

The system should preserve:

the original attribution evidence, partner claim, internal review, decision, reason and final state.

An administrator must not silently edit a historical commission amount without creating an audit record.

---

# 42. Partner Payouts

The system must support payout records.

A payout should connect:

partner, amount, currency, payment method, reference, date, included commissions and status.

The payout must be separable from commission calculation.

Paying a partner must not alter the historical commission calculation.

---

# 43. Product Marketplace

Aslal may sell products owned by Aslal as well as third-party products.

The product model must therefore support commercial relationship types.

Examples include:

Aslal-owned product

affiliate product

reseller product

implementation partner product

custom commercial product.

A product should contain:

name, description, provider, relationship type, target audience, pricing model, sales material, eligibility, implementation requirements, support model and status.

The supplier relationship must remain visible internally.

---

# 44. Supplier / Partner Portal

A supplier should eventually be able to access a partner portal showing:

their approved products, product activity, leads, opportunities, customers, attributed revenue, commissions, implementation status and relevant performance.

The supplier should not automatically see confidential customer information beyond what the agreement permits.

The system must support data-access policies.

---

# 45. Lead-to-Product Matching

The system should help sellers match customers to products and services.

The first implementation should use explicit structured rules.

For example:

customer business type + stated problem + budget + requested feature + industry

can produce candidate products.

AI may later provide recommendations, but the recommendation should remain explainable.

A seller should be able to see:

> “Recommended because the customer requested ecommerce payment integration and operates a retail business.”

---

# 46. Conversation Center

The platform must provide a unified customer communication center.

The architecture must allow email, SMS, Telegram, WhatsApp, Messenger and future communication channels to feed into a common conversation model.

The user should see:

who the customer is, what they want, where they came from, which opportunity they belong to, what has already been said, who currently owns the conversation, and what should happen next.

The salesperson must not need to reconstruct customer history from separate provider interfaces.

---

# 47. Communication Channel Abstraction

Every message should have:

conversation, customer/person, channel, direction, sender, recipient, body or template reference, timestamp, status, provider reference where applicable and actor information.

The internal system must not become tightly coupled to one provider.

An external provider should be treated as an adapter.

This makes it possible to change providers without rebuilding the CRM.

---

# 48. Email

Email must support:

inbound capture, outbound replies, sender identities, threading where possible, attachments where supported, delivery state where available, authentication diagnostics, communication history and human handoff.

Failed email delivery must not erase the lead.

A failed email must appear as a communication failure connected to the conversation.

---

# 49. SMS

SMS must support:

Ethiopian number normalization, outbound message, inbound message where supported, delivery status, opt-out behavior, provider identifiers and communication history.

The system must not automatically message customers who have opted out.

---

# 50. Telegram

Telegram must support:

bot or approved business interaction, inbound conversation capture, lead qualification, message history, attribution and human handoff.

Telegram interactions must enter the canonical customer timeline.

---

# 51. WhatsApp

WhatsApp support must use authorized business APIs and provider rules.

The system must account for:

template requirements, messaging windows, inbound webhooks, outbound messages, message status, permissions, human handoff and platform restrictions.

The system must not use unofficial scraping or unauthorized automation.

---

# 52. Messenger

Messenger integration must use supported business APIs.

The system should support inbound interactions, outbound responses where permitted, message history, customer association, attribution and handoff.

---

# 53. Communication Permissions

Communication preferences must be explicit.

A person may permit email but not SMS.

They may allow WhatsApp but not promotional messaging.

They may globally opt out.

The system must enforce preferences before sending.

A communication failure must not automatically be interpreted as permission to switch channels.

Channel selection should consider:

customer preference, channel availability, communication purpose, consent, business policy and automation rules.

---

# 54. Human Handoff

Any automation or AI-assisted conversation must have a clear human handoff mechanism.

A conversation may be:

automated

awaiting human handling

human-owned

closed.

Once a human takes ownership, configured automation must respect the handoff state.

The system must make ownership visible.

A salesperson should not accidentally send an automated message while manually handling a customer.

---

# 55. Marketing Automation

The platform must contain a real workflow automation engine.

Automation must not simply mean “create a task.”

A workflow should contain:

trigger, conditions, actions, delays, execution state, retry behavior, cancellation conditions, owner and audit information.

Examples include:

new lead acknowledgement

salesperson notification

follow-up reminder

unanswered-lead sequence

quote follow-up

payment reminder

customer onboarding

review request

repeat-purchase campaign

inactive-customer reactivation

partner commission notification.

---

# 56. Automation Safety

Automation must respect customer state.

A customer who becomes a customer should normally exit lead-acquisition workflows.

A customer who opts out must exit promotional communication.

A customer who replies should become eligible for human handling.

A closed or lost opportunity should not continue receiving messages intended for active prospects.

A human handoff should stop or modify configured automation.

Automation should have expiration rules.

The system must prevent infinite messaging loops.

---

# 57. Automation Execution

Each automation execution should record:

workflow, trigger event, entity, actor, start time, completion time, status, action, result, error and retry state.

This allows an operator to answer:

> “Why did this customer receive this message?”

The answer must be reconstructable.

---

# 58. Notifications

Notifications should be useful rather than overwhelming.

Important operational events should generate notifications.

Examples include:

new high-intent lead, overdue lead, customer reply, quote accepted, payment failed, payment received, new partner lead, new opportunity, automation failure, webhook failure and integration failure.

Notifications should have severity and destination.

A critical payment failure should not be presented exactly like a minor analytics warning.

---

# 59. Customer Journey Automation

The system should support automated journeys such as:

A visitor requests a quote.

The system creates or updates a lead.

A sales task is assigned.

The customer receives confirmation.

The salesperson receives notification.

A quote is prepared.

The quote is sent.

If there is no response after an approved interval, the system creates a follow-up action.

If the customer replies, human ownership becomes available.

If the customer accepts, the system creates or updates an order.

If payment is received, the customer enters onboarding.

After onboarding, the customer becomes eligible for retention and review workflows.

This complete journey should be observable.

---

# 60. Reporting and Analytics

Reporting must focus on business outcomes.

The system should show:

traffic, visitors, engagement, leads, qualified leads, opportunities, quotes, orders, paid amount, revenue, conversion, follow-up performance, customer retention, partner results, commissions and campaign performance.

Every report must clearly define the metric.

The interface must not call anonymous visitors “customers.”

It must not call pipeline “revenue.”

It must not call a social-media impression a “lead.”

It must not call attributed revenue proof of causation.

---

# 61. Revenue Attribution

Revenue attribution should be one of the platform's defining capabilities.

The system should be able to answer:

> Which marketing activity generated this customer?

> Which campaign generated the opportunity?

> Which partner referred the customer?

> Which influencer influenced the journey?

> Which salesperson converted the deal?

> What did the customer actually pay?

> What commission was generated?

> What revenue remains unpaid or unreconciled?

An example report could conceptually represent:

**Campaign A → 43 leads → 9 opportunities → 3 customers → ETB 240,000 collected**

and:

**Influencer B → 18 leads → 4 opportunities → 2 customers → ETB 90,000 collected → ETB 9,000 commission**

This is substantially more commercially meaningful than impressions or clicks alone.

---

# 62. Attribution Models

The platform should support configurable attribution models.

At minimum, the system should preserve:

first known source

first campaign

latest meaningful source

partner/referral source

direct source

assisted sources.

A business may later configure a multi-touch attribution method.

The system must never hide which attribution model produced a report.

Two reports using different attribution models must not be presented as though they measure exactly the same thing.

---

# 63. Marketing ROI

Where campaign-cost information exists, the platform should calculate:

spend

leads

qualified leads

opportunities

customers

revenue

cost per lead

cost per qualified lead

cost per acquisition

revenue attributed

return on advertising spend where measurement conditions support it.

The platform must communicate measurement limitations.

---

# 64. Sales Performance

The sales manager should be able to see:

lead response time, follow-up completion, overdue actions, stage movement, conversion, quote acceptance, lost opportunities, deal value, collected revenue and customer retention.

The platform should identify operational bottlenecks.

For example:

> many leads are generated but first contact is delayed.

This is more useful than simply reporting lead volume.

---

# 65. Funnel Diagnostics

The system should support a funnel analysis:

**Attention → Engagement → Lead → Qualification → Opportunity → Quote → Order → Payment**

The platform must identify where meaningful demand is being lost.

For example:

large number of leads → few quotes

may indicate a qualification or response problem.

Many accepted quotes → few payments

may indicate payment friction.

Many paid orders → low repeat purchase

may indicate retention problems.

---

# 66. Customer Retention

The system should support customer lifecycle analytics.

It should track:

first purchase, second purchase, renewal, repeat order, support interactions, satisfaction, review, referral and inactivity.

A customer should become a source of future growth, not merely a closed CRM record.

---

# 67. Referral and Customer Advocacy

A satisfied customer may be asked to refer another customer.

The system should support:

referral invitation, referral code, referral link, referral attribution, resulting lead, resulting sale and referral reward where applicable.

Customer referrals must not be confused with partner referrals.

The relationship source must remain explicit.

---

# 68. Localization

Localization must be a first-class system property.

The initial languages shall be:

English

Amharic

Afaan Oromoo

The system must be architected so that additional languages can be added without rewriting business logic.

Localization must cover:

navigation, forms, validation, notifications, workflow labels, email templates, SMS templates, messaging templates, customer preferences, reports, dates, numbers, currencies and customer-facing transactional messages.

Language preference should be stored as customer data where appropriate.

The system must not merely replace English strings with translated text.

Business terminology must be adapted so that the result is understandable to the intended Ethiopian audience.

---

# 69. Currency

ETB must be the primary Ethiopian operating currency.

The system must support currency as a data property rather than assuming every amount is ETB.

International or diaspora transactions may use supported foreign currencies.

Currency conversion must never alter the original transaction.

The original payment amount and currency must remain permanent.

---

# 70. Mobile-First Experience

The customer experience must be designed around mobile devices.

Forms must be short, clear and easy to complete.

Calls, WhatsApp, Telegram and Messenger actions should be immediately accessible where relevant.

The system should avoid excessive visual assets.

Pages should remain useful on constrained connections.

The platform must not assume that a customer will spend ten minutes filling out a desktop-style enterprise form.

---

# 71. Low-Bandwidth Design

The public system must be optimized for slower mobile networks.

Critical customer journeys should use:

server-side rendering where useful, optimized assets, lightweight JavaScript, minimal unnecessary network calls, efficient image handling, progressive loading, compact responses and graceful error handling.

The interface should not become unusable because an analytics request fails.

Tracking must never block a critical form submission.

---

# 72. Offline and Intermittent Connectivity

Where useful, selected agent and sales operations should eventually tolerate intermittent connectivity.

For example, an agent may capture a lead while temporarily offline.

The device may retain a pending action and submit it when connectivity returns.

The system must avoid creating duplicate leads during synchronization.

Offline functionality should therefore use idempotent identifiers and synchronization states.

---

# 73. Trust and Customer Experience

Customer-facing screens should communicate:

who the business is, what is being sold, what it costs where appropriate, how to pay, how delivery works, how to get support and what happens after purchase.

A customer should not have to guess:

> “Did my payment go through?”

or:

> “Will somebody respond?”

or:

> “Can I return this?”

where the business has a legitimate answer.

The system should therefore support transparent business information.

---

# 74. Ecommerce and Service Commerce

The product must support two major commercial patterns.

The first is direct product commerce.

The second is service/project commerce.

A product purchase may move:

**Product → Cart/Order → Payment → Fulfillment → Customer**

A service purchase may move:

**Service → Consultation → Proposal → Negotiation → Agreement → Payment → Implementation → Customer**

Both journeys must eventually feed the same customer and revenue model.

---

# 75. Fulfillment

For physical products, order status should be capable of representing:

accepted, processing, ready, dispatched, delivered, failed delivery, returned and refunded.

The Growth OS does not need to become a full logistics company.

Instead, it should provide the commercial state and integrate with delivery systems where necessary.

The platform must be able to tell the customer and seller where an order stands.

---

# 76. Delivery and Last-Mile Integration

Where the business uses delivery partners, the system should support provider adapters.

A delivery provider may expose:

tracking number, status, delivery event, recipient confirmation and failure reason.

The platform should connect that information to the order.

A delivery problem should become an operational issue rather than a silent technical failure.

---

# 77. Business Booking

The system should support appointments where relevant.

A booking may represent:

consultation, demonstration, training, meeting, installation visit, sales appointment or service appointment.

The booking must connect to the customer and opportunity.

A completed meeting may generate an activity.

A missed appointment may create a follow-up task.

---

# 78. Lead-to-Consultation Flow

A consultation request should be a structured commercial event.

The system should record:

customer, desired topic, preferred language, preferred time, source, campaign, partner attribution and assigned owner.

After consultation, the seller should be able to create a proposal or opportunity without re-entering the customer.

---

# 79. Business Types

The system must support different business models.

These may include:

retail, ecommerce, professional services, education, healthcare where appropriate and compliant, technology, software, hospitality, real estate, manufacturing, distribution, consulting, nonprofit/association and other configurable types.

Different business types may have different pipelines.

A real-estate business may require property interest.

An education business may require program interest.

A retailer may require product and quantity.

A software provider may require implementation scope.

The core architecture must remain common while allowing configurable business attributes.

---

# 80. B2B Support

The platform must support B2B sales.

B2B opportunities may involve:

multiple decision-makers, procurement, long sales cycles, quotations, approvals, negotiations, implementation and recurring purchases.

The system should support multiple people associated with one organization.

Activities must identify the relevant person when possible.

The opportunity belongs to the commercial relationship rather than only one contact.

---

# 81. B2C Support

The platform must support direct consumers.

The consumer model should remain simpler.

A consumer may have:

identity, product interest, order, payment, communication preferences, reviews and referral history.

The system must not impose unnecessary organization structures on consumers.

---

# 82. Diaspora and International Commerce

The system may support Ethiopian diaspora-facing businesses.

This may require:

international phone numbers, foreign currencies, time zones, international payment methods and international messaging.

The core product remains Ethiopian-first.

International support must not make the Ethiopian workflow unnecessarily complex.

---

# 83. AI Layer

AI is an assisting layer rather than the authority of the system.

AI may be used for:

conversation summaries, customer-intent extraction, structured information extraction, response suggestions, product recommendations, content assistance, customer-history summaries, sales-action recommendations and demand-pattern analysis.

AI must never invent facts.

AI must not silently change important commercial records.

AI-generated recommendations must be distinguishable from measured facts.

---

# 84. AI Sales Assistant

The system should eventually provide an AI sales assistant that can read authorized customer context and answer questions such as:

> What does this customer want?

> What happened last time?

> What was the quoted price?

> What should I follow up about?

> Which product is relevant?

> Has the customer paid?

The assistant must cite the underlying record internally or show where the information came from.

It must not invent a payment, customer request or commitment.

---

# 85. AI Conversation Assistant

The assistant should be able to draft messages.

For example:

> Customer has not responded to proposal for three days.

The system could suggest a message.

The human should be able to edit before sending unless a configured low-risk automation explicitly permits automatic sending.

High-impact communication requires stronger controls.

---

# 86. AI Demand Intelligence

Once enough reliable data exists, AI may identify patterns such as:

products receiving increasing demand, campaigns producing unusually strong qualified demand, customer segments showing changing behavior, leads becoming inactive, partner performance changes and sales bottlenecks.

AI insights must remain labeled as analysis or recommendation.

They must not be presented as directly measured facts.

---

# 87. AI Safety

AI must obey:

customer permissions, workflow state, human handoff, communication policies, business rules, attribution rules and access controls.

An AI agent must never:

fabricate customer identity, fabricate a payment, fabricate a quote, invent a partner attribution, bypass opt-out, expose private data, change a financial record without authorization or send uncontrolled spam.

---

# 88. Integration Architecture

External systems must be isolated behind adapters.

Examples include:

payment providers, messaging providers, email providers, analytics providers, ecommerce services, delivery services and other future systems.

An adapter should expose standardized internal behavior.

The core CRM must not depend on provider-specific field structures.

Provider-specific metadata should be stored separately.

Provider outages must not corrupt core customer records.

---

# 89. Webhooks

All inbound webhooks are untrusted external input.

The system must validate signatures where supported.

Webhook processing must be idempotent.

Provider event IDs should be stored.

Duplicate events must not create duplicate:

messages, leads, payments, orders, commissions or customer records.

Failed webhook processing must be observable.

The system should be capable of retrying appropriate failures.

---

# 90. External API Failures

External communication and payment failures must be isolated from core business state.

For example:

an email provider failure must not prevent lead storage.

a payment provider failure must not delete an order.

a social API outage must not erase campaign information.

a delivery provider outage must not erase order data.

The system should preserve the business transaction and record the technical failure separately.

---

# 91. API Design

The API layer must separate:

public customer-facing operations

authenticated customer operations

sales operations

partner operations

administrative operations

integration webhooks

internal automation operations.

Each API must enforce authorization appropriate to the action.

Financially sensitive routes must require stronger authorization and audit.

Input validation must occur at the API boundary.

Errors must be understandable to the user and useful for diagnostics.

---

# 92. Error Handling

The system must distinguish business errors from technical errors.

A user-facing error should say:

> “The phone number is not valid. Please use an Ethiopian mobile number such as 0911xxxxxx.”

rather than:

> “Unable to submit.”

A payment failure should explain that payment was not confirmed without exposing provider secrets.

A server error should have an internal correlation identifier.

The system must never expose credentials, tokens, database details or stack traces to customers.

---

# 93. Data Model Requirements

The database must represent, at minimum, the following logical domains:

people, organizations, visitors, events, growth opportunities, leads, lead history, lead tasks, product interests, products, services, opportunities, quotations, quotation versions, orders, order items, payments, customers, conversations, messages, communication preferences, campaigns, marketing assets, sources, partners, referral links, referral clicks, commissions, partner payouts, activities, automation workflows, automation executions, notifications, reviews, trust information, support records, audit logs and integration records.

The exact physical schema may evolve.

The business concepts must not be lost merely because implementation details change.

---

# 94. Lead Data Requirements

Lead records should support:

identity, contact information, organization, business type, source, medium, campaign, referral, product/service interest, score, stage, owner, next action, next-action deadline, notes, tasks, conversations, opportunity relationships and commercial history.

Lead history must preserve stage and important state changes.

---

# 95. Customer Data Requirements

Customer records should contain:

identity, organization relationship, communication preferences, language, acquisition source, campaign, partner attribution, orders, payments, conversations, support interactions, reviews, referrals and retention information.

The customer record must not erase lead history.

---

# 96. Order Data Requirements

Orders should contain:

customer, items, pricing, currency, discounts, status, payment state, fulfillment state, source, campaign, referral, salesperson, partner attribution and relevant timestamps.

An order must be traceable to its customer.

---

# 97. Payment Data Requirements

Payments should contain:

internal ID, provider, provider transaction ID, order, customer, amount, currency, payment method, state, timestamps, reconciliation state and audit history.

Original payment facts must remain immutable wherever practical.

Corrections should be represented as adjustments or reconciliation actions rather than destructive edits.

---

# 98. Partner Data Requirements

Partner data should represent:

partner identity, type, products permitted, campaigns, links, clicks, leads, opportunities, customers, revenue, commissions, disputes and payout history.

A partner should never receive more customer information than required for its role.

---

# 99. Campaign Data Requirements

Campaigns should represent:

objective, audience, channel, source, assets, dates, budget, owner, products/services, partners, links and outcome measurements.

Campaign performance should connect to leads, opportunities and revenue.

---

# 100. Audit System

Important system changes must be auditable.

This includes:

lead edits, lead deletion, stage changes, ownership changes, opportunity value changes, quote changes, payment reconciliation, commission changes, partner attribution changes, permission changes, automation changes and security-sensitive actions.

Audit records should contain:

actor, timestamp, action, affected entity, reason where applicable and relevant before/after context.

Administrative deletion should require a reason.

Test-data deletion should be distinguishable from real customer-data deletion.

---

# 101. Test Data Management

The system must provide safe handling of test records.

Test records should be explicitly marked.

Administrators should be able to remove test data without accidentally deleting legitimate customers.

A reset action must require deliberate confirmation.

Every administrative deletion must be audited.

Historical business data must never be classified as test data automatically based only on age or appearance.

---

# 102. Data Export

Administrators should be able to export authorized business data.

Exports should support:

leads, customers, campaigns, partners, commissions, orders, payments and relevant activity.

The export format should be machine-readable and human-readable where appropriate.

Exports must respect authorization.

Sensitive exports should be audited.

---

# 103. Data Deletion and Anonymization

The system must support privacy-aware deletion or anonymization.

Deletion must consider:

financial records, legal retention, attribution requirements, communication history and operational requirements.

Where deletion cannot legally or operationally remove a financial record, personal information should be minimized or anonymized where appropriate.

The Personal Data Protection Proclamation requires privacy to be considered as part of legitimate data processing, so data lifecycle controls must be designed into the platform.

---

# 104. Consent

Consent must be represented separately from general customer identity.

The platform should record:

what permission was given, for which purpose, through which channel, when it was given, when it changed and when it was withdrawn.

The system must distinguish:

transactional communication

support communication

marketing communication.

The presence of a phone number does not automatically mean that all marketing channels are authorized.

---

# 105. Privacy by Design

The system must collect only information needed for defined purposes.

It must minimize unnecessary tracking.

It must not secretly identify anonymous people.

It must not scrape private social information without authorization.

It must not bypass platform permissions.

It must not expose customer data to partners simply because the partner generated the lead.

Privacy must be part of the architecture.

---

# 106. Role-Based Access Control

The system must support explicit roles and permissions.

Roles should control access to:

CRM data, financial data, customer communications, partner information, campaigns, automation, integrations, system configuration and audit logs.

A salesperson should not automatically access partner financial information.

An influencer should not access unrelated customer records.

A marketing operator should not automatically edit payment reconciliation.

An administrator should have broad access but remain auditable.

---

# 107. Security

The system must use:

secure authentication, protected sessions, authorization checks, input validation, CSRF protection where applicable, secure headers, secret management and encrypted transport.

Credentials must never be stored in source code.

Production secrets must never be logged.

Webhook tokens and provider credentials must be protected.

---

# 108. Authentication

The system must support secure authentication for internal users.

Authentication must be separated from authorization.

A user may successfully authenticate but still lack permission to perform a particular action.

Authentication events should be available for security auditing.

---

# 109. Integration Health

Every major external integration should have health information.

For example:

email connected

IMAP available

payment provider available

WhatsApp configured

Telegram configured

automation worker running.

A business user should be able to understand whether a channel is ready.

Technical diagnostics should not reveal secrets.

---

# 110. Production Health

The system must expose operational health for authorized monitoring.

Health should distinguish:

application health

database reachability

migration state

integration health

automation health

queue health.

Production integrity should detect data problems rather than hiding them.

A healthy server is not necessarily a healthy business system.

---

# 111. Data Integrity

Core relationships must remain valid.

A customer should not reference a nonexistent opportunity.

A payment should not reference a nonexistent order.

A commission should not reference an invalid partner.

A conversation should not silently disappear after a lead becomes a customer.

A referral should remain attributable after conversion.

The system must detect broken relationships.

---

# 112. Idempotency

Critical operations must be safe against retries.

This applies to:

webhooks, payments, lead creation, commission calculations, automation triggers and external provider callbacks.

A request repeated due to a timeout should not create a duplicate commercial record.

---

# 113. Reliability

The system must prioritize preservation of business data.

A failed external service must not erase successful internal writes.

A network timeout must not cause duplicate order creation on retry.

A message provider outage must not cause a valid customer record to disappear.

The system should use transactional writes where business consistency requires them.

---

# 114. Search

Users must be able to search customers, leads, organizations, products, conversations, orders and opportunities.

Search should support common business identifiers:

name, phone, email, company, order number, lead ID, referral code and transaction reference.

The system should support fuzzy or normalized matching where safe.

---

# 115. Customer Timeline

The timeline is one of the central user experiences.

It should display:

first acquisition, visits, meaningful events, form submission, lead creation, lead stage changes, salesperson actions, messages, notes, quotes, order creation, payment events, support events, reviews, referrals and retention activity.

The timeline must distinguish:

customer-generated events

human actions

automation actions

AI-generated recommendations

external provider events.

---

# 116. Customer 360

A customer page should make it possible to understand the customer without opening many unrelated screens.

The page should contain:

identity, organization, language, communication preferences, source, campaigns, referral, interests, stage, opportunities, conversations, quotes, orders, payments, support, reviews, tasks and timeline.

The goal is not to display every field.

The goal is to explain the commercial relationship.

---

# 117. Dashboard Design

The main dashboard should not become a wall of numbers.

Its hierarchy should be:

**what needs attention**

then:

**what is happening**

then:

**why it is happening**

then:

**what produced money**

A manager should quickly see:

new demand, urgent sales work, pipeline changes, payment issues, customers requiring attention, campaign outcomes and partner outcomes.

---

# 118. Operations Center

The platform should contain an operations workspace where administrators can inspect:

system integrity, migrations, failed integrations, failed automations, overdue tasks, incomplete lead execution, payment mismatches, partner issues, communication failures and audit activity.

This workspace must separate technical health from business health.

---

# 119. Sales Conversation to Revenue

The ideal user experience is:

customer arrives

customer expresses interest

customer is captured

lead is assigned

seller sees the conversation

seller responds

seller qualifies

seller creates quote

customer negotiates

seller updates quote

customer accepts

order is created

payment is initiated

payment is confirmed

customer is activated

partner attribution is preserved

commission becomes calculable

revenue becomes reportable.

The system must preserve this chain.

---

# 120. Customer-to-Referral Loop

The ideal retention journey is:

customer purchases

customer receives successful onboarding

customer receives support

customer is satisfied

customer receives review request

customer is invited to refer

referral link is generated

new visitor arrives

new lead is captured

new opportunity is generated.

This creates a measurable growth loop.

---

# 121. Partner-to-Revenue Loop

The partner journey is:

partner approved

partner receives product eligibility

partner receives referral assets

partner promotes product

visitor clicks

visitor becomes lead

lead becomes opportunity

opportunity becomes customer

customer pays

revenue is attributed

commission is calculated

commission is approved

partner is paid.

This loop must be reconstructable.

---

# 122. Influencer-to-Revenue Loop

The influencer journey is:

influencer joins program

eligible products are displayed

creative material is provided

influencer creates promotion

trackable link is shared

audience clicks

lead is created

salesperson follows up

customer purchases

revenue is attributed

commission is generated.

The platform must not treat views as sales.

---

# 123. Seller Operating Loop

The seller journey is:

new demand appears

system assigns ownership

seller receives task

seller opens customer timeline

seller understands intent

seller communicates

seller qualifies

seller creates quote

seller negotiates

seller closes

seller records commercial outcome.

The system should reduce manual administrative work around this loop.

---

# 124. Owner Operating Loop

The owner journey is:

see demand

see sales work

see pipeline

see revenue

see marketing source

see partner source

see payment status

see customer retention

see operational problems.

The owner should not need to inspect individual records to understand basic business performance.

---

# 125. Marketing Operator Loop

The marketing operator journey is:

define campaign

define audience

create content

publish

track traffic

observe engagement

identify meaningful demand

inspect leads

inspect opportunities

inspect customers

measure revenue.

The system should therefore connect marketing activity to sales and finance.

---

# 126. Product Intelligence

The system should eventually identify:

which products attract attention, which receive inquiries, which convert, which produce the highest revenue, which partners sell them, which customer segments buy them and which products produce support problems or refunds.

Product intelligence must distinguish:

views

interest

requests

orders

payments.

---

# 127. Demand Intelligence

The platform should identify patterns such as:

rising product interest, demand by location, demand by business type, demand by language, demand by source, demand by campaign, demand by partner and changes in conversion.

The system must be careful not to overstate statistical conclusions.

A small sample should be labeled accordingly.

---

# 128. Recommendation Engine

The system should eventually provide recommendations such as:

follow up with this lead

review this stalled quote

contact this inactive customer

consider this product for this customer

review this campaign

investigate this payment failure

review this partner attribution.

Recommendations must be based on available evidence.

---

# 129. Customer Experience Templates

The system should provide configurable templates for:

lead acknowledgement, appointment confirmation, quote delivery, quote follow-up, payment confirmation, order confirmation, onboarding, support responses, review requests and referral requests.

Templates must be localized.

Templates must respect channel rules.

A template should be versioned.

---

# 130. Content Management

Marketing and customer content should be reusable.

The system may contain:

product descriptions, service descriptions, campaign messages, social captions, email templates, SMS templates, FAQ responses, sales scripts and partner promotional material.

The content system should distinguish:

internal-only content

customer-facing content

partner-facing content.

---

# 131. Knowledge Base

The platform should support a knowledge base that can answer common customer questions.

Examples include:

pricing model, support process, delivery, payment methods, refund rules, implementation process and business policies.

AI may use this knowledge base when generating responses.

Knowledge used by AI must be controlled and versioned.

---

# 132. Customer Portal

A customer portal should eventually allow customers to see:

their profile, quotations, orders, payments, appointments, support requests and relevant documents.

Customers must only see their own information.

A customer should not have to contact a salesperson for basic transaction status when the information is safely available.

---

# 133. Partner Portal

A partner portal should allow partners to see:

profile, eligible products, referral links, campaign materials, leads they generated where permitted, opportunities, conversions, commission status and payout history.

The portal should make the partner relationship transparent.

---

# 134. Agent Mobile Experience

Agents should be able to use a lightweight mobile interface.

An agent may:

create lead, update status, record meeting, attach note, schedule follow-up, call customer and inspect their submitted opportunities.

The agent should not need access to all internal analytics.

---

# 135. Multi-Channel Customer Identity

When the same person communicates through email and WhatsApp, the system should attempt to associate those conversations with the correct known customer using reliable identifiers.

The system must not merge people simply because names look similar.

Identity merging should be controlled and auditable where ambiguity exists.

---

# 136. Duplicate Management

The system must detect potential duplicate people and leads.

Possible matches may include:

normalized phone, verified email, customer-provided identifiers and other approved matching methods.

A duplicate suggestion is not the same as an automatic merge.

Merging records must preserve historical activity.

---

# 137. Data Import

The system should support controlled migration of customer or lead data from:

CSV, spreadsheets, supported CRM exports or other approved sources.

Imports must validate records before creation.

The import should report:

created, skipped, duplicate, invalid and updated records.

Import operations should be auditable.

---

# 138. Reporting Exports

Reports should be exportable in formats appropriate to the business.

Typical exports include:

CSV and spreadsheet-compatible data.

Financial and customer exports should contain clear column definitions.

The system should not export hidden internal credentials or technical metadata.

---

# 139. Billing the Aslal Customer

If Aslal operates Growth OS as a service, the platform should eventually support subscription or service-plan information.

A workspace may have:

plan, status, billing cycle, feature access, limits and payment status.

This should be separated from the customer's operational sales records.

---

# 140. Commercial Models for Aslal

The product must support Aslal's ability to make money through more than one relationship.

Aslal may sell:

its own services

third-party products

implementation projects

reseller products

affiliate offers

software subscriptions

managed marketing

managed automation

consulting

technology implementation.

The platform must preserve the commercial relationship associated with each sale.

---

# 141. Service Delivery

For service projects, the system should support a post-sale delivery state.

A service order may generate:

implementation tasks, project owner, milestones, appointments, documentation, support interactions and delivery completion.

The customer should remain connected to the commercial record.

---

# 142. Recurring Revenue

Where services are recurring, the platform should support:

subscription, renewal date, recurring amount, payment state and cancellation.

A renewal opportunity may be automatically generated.

The system should distinguish new acquisition from retention revenue.

---

# 143. Upsell and Cross-Sell

After purchase, the system may identify relevant additional products or services.

For example:

website customer → SEO opportunity

hosting customer → website opportunity

CRM customer → automation opportunity

ecommerce customer → payment integration opportunity.

Recommendations must use customer context and approved product relationships.

---

# 144. Customer Segmentation

Customers should be segmentable using structured attributes.

Examples include:

business type, industry, location, language, product purchased, lifecycle state, revenue tier, engagement level, source and partner relationship.

Segmentation must not rely on sensitive profiling unless there is a valid purpose and lawful basis.

---

# 145. Campaign Audience Management

The system should allow marketers to define audiences based on business-relevant information.

Examples:

existing customers

new leads

inactive leads

customers of product X

customers who purchased but have not reviewed

partner-generated leads.

Audience generation must respect communication permissions.

---

# 146. Frequency Controls

Automation must provide frequency protection.

The system should prevent a customer from receiving excessive messages across multiple workflows.

The platform should be able to determine:

recent message count, recent campaign participation, channel and communication purpose.

A customer enrolled in multiple campaigns must not become subject to unlimited overlapping messages.

---

# 147. Suppression Rules

The system should support suppression conditions.

Examples include:

global opt-out, channel opt-out, customer status, active support issue, human handoff, recent communication, active negotiation and other configured conditions.

Suppression must be evaluated before an automated communication is sent.

---

# 148. Business Rules Engine

The system should support configurable rules.

A rule might say:

> If a lead requests a quotation and has a valid phone number, assign it to the sales queue and create a follow-up task due within one business day.

Rules should be explicit and versioned.

---

# 149. Automation Permissions

Each automation workflow must have a declared permission level.

A workflow may:

create an internal task

notify a user

update a non-sensitive field

send an approved low-risk acknowledgement

recommend an action

or perform a higher-impact action requiring additional authorization.

This prevents AI or automation from becoming an unrestricted actor.

---

# 150. Business Hours

Workflows should support business hours.

An immediate notification may happen immediately.

A marketing message intended for the next morning should be scheduled accordingly.

Time zones should be workspace-aware.

For Ethiopia-focused workspaces, Africa/Addis_Ababa should be supported.

---

# 151. Localization of Dates and Numbers

Customer-facing dates and numbers must be formatted according to locale.

The raw database value must remain standardized.

Reports must clearly state the period.

Financial values must show currency.

---

# 152. Accessibility

The system must use semantic HTML.

Forms must have labels.

Validation errors must be understandable.

Keyboard interaction must work.

Color alone must not convey state.

Tables must have mobile-safe alternatives.

Important actions must not depend on tiny controls.

---

# 153. Performance

Public pages must remain responsive on mobile networks.

The system must avoid unnecessary client-side JavaScript.

Large CRM datasets must paginate.

Large customer timelines must load incrementally.

Heavy reports should not block customer-facing requests.

Background jobs should handle expensive automation.

---

# 154. Observability

The system must expose meaningful technical information.

Each important request should have a correlation identifier where appropriate.

Logs must distinguish:

application errors

database errors

integration errors

automation errors

business validation errors.

Logs must never expose passwords, tokens or sensitive data unnecessarily.

---

# 155. Backup and Recovery

Customer, order, payment and commission data must be protected by appropriate backup procedures.

Recovery objectives should be defined at the operational level.

A restore must preserve referential integrity.

Production migrations must be auditable.

---

# 156. Migration Safety

Database migrations must be versioned.

Schema changes must not rely on manually editing production tables.

A migration must be applied through a controlled deployment process.

Production should not be considered healthy simply because the web server starts.

The deployed schema, application and migrations must correspond to a known release.

---

# 157. Testing Requirements

Testing must validate business outcomes.

The system should test:

lead capture, phone normalization, attribution, identity resolution, stage transitions, next-action enforcement, quote creation, negotiation, order creation, payment state transitions, communication preferences, automation triggers, automation cancellation, duplicate webhooks, partner attribution, commission calculation, customer conversion, review requests and authorization.

The system must contain critical end-to-end tests.

---

# 158. End-to-End Test Journey

A canonical automated test should simulate:

a visitor arriving from a campaign

then viewing a product

then submitting a request

then becoming a lead

then being assigned

then receiving a follow-up

then creating an opportunity

then receiving a quote

then accepting

then creating an order

then receiving a payment event

then becoming a customer

then generating a partner commission

then entering a retention workflow.

The test should verify the complete chain.

---

# 159. Data Accuracy Rules

The system must not fabricate missing values.

When an amount is unknown, it should remain unknown.

When attribution is uncertain, it should be marked uncertain.

When payment is not confirmed, it should not be shown as paid.

When a partner relationship is unclear, the system should not assign commission automatically.

When a lead has no owner, it should be visible as an execution gap.

---

# 160. Business Health vs Technical Health

The platform must distinguish:

**Technical health**

from:

**Commercial health**

The server can be healthy while six leads have no follow-up.

The database can be reachable while payments remain unreconciled.

The application can return HTTP 200 while a campaign produces no sales.

Therefore production reporting must include business-integrity information as well as infrastructure health.

---

# 161. Operational Integrity

The system should be able to report:

active leads without owners, active leads without next actions, overdue actions, open tasks without owners, open tasks without due dates, won transactions without commercial value, opportunities without valid relationships, customers without appropriate commercial origins, payment mismatches and unprocessed integration events.

The purpose is not to force the numbers to zero artificially.

The purpose is to make operational problems visible.

---

# 162. Test Data and Production Data

Development, acceptance and production environments must maintain appropriate separation.

Production data must never be used casually for testing.

Test-data markers should allow safe cleanup.

Acceptance tests should use controlled records.

Production commercial history should remain protected.

---

# 163. Partner Financial Integrity

Partner attribution must be considered financially sensitive.

A partner's commission may depend on attribution.

Attribution changes must therefore be auditable.

The system must not silently reassign a customer from one partner to another.

When attribution rules change, the historical record must remain explainable.

---

# 164. Customer Communication Integrity

Every message sent by automation or a human should be associated with the customer conversation.

The system should know whether a message was:

human-created

automation-created

AI-drafted and human-approved

AI-generated automatically under approved policy

received from customer

received from external provider.

This provides transparency.

---

# 165. Security of Partner Links

Referral links should use non-sensitive identifiers.

The public code must not reveal internal customer identifiers.

Referral links should not expose confidential commercial data.

A partner should be able to attribute activity without receiving access to the customer database.

---

# 166. QR and Offline Acquisition

The system should support QR-based acquisition for:

posters, events, stores, flyers, product packaging, business cards and offline campaigns.

A QR code should resolve to a campaign-aware destination.

Scanning it should preserve campaign context.

Where the customer later identifies themselves, that attribution should remain available.

---

# 167. Physical Store and Field Sales

The system should not assume every sale starts online.

A salesperson at a store may create a customer.

An agent may meet someone physically.

A phone call may produce demand.

A customer may see a poster and later send WhatsApp.

The system must support these hybrid journeys.

---

# 168. Telephone Sales

Phone calls should be recordable as activities even when actual call audio is not integrated.

A seller should be able to record:

call attempt, connected, customer response, outcome, next action and notes.

Where telephony integrations become available, call records may later enter the same timeline.

---

# 169. Human Notes

Notes remain important.

A seller should be able to record useful context.

Notes must identify author and timestamp.

Important structured information should eventually be promoted into structured fields rather than remaining permanently buried in free text.

---

# 170. Activity System

Activities should represent meaningful business actions.

Examples include:

call, meeting, note, email, SMS, WhatsApp interaction, quote sent, quote accepted, payment confirmed, order created, support action, review request and referral.

Technical logs should remain distinct from business activities.

---

# 171. Task System

Tasks should contain:

title, description, status, priority, due date, assigned user, lead/customer/opportunity relationship and completion information.

Tasks should be generated automatically by approved workflows.

Completed tasks should remain in history.

---

# 172. Calendar Integration

Where useful, the system should eventually support calendar integration.

Appointments should be linked to customers and opportunities.

Calendar conflicts should be visible when provider APIs allow.

An appointment does not automatically imply a sale.

---

# 173. Document Management

The platform should eventually support commercial documents such as:

quotes, invoices where appropriate, receipts, agreements, proposals and customer documents.

Documents should have:

owner, entity relationship, version, timestamp and access policy.

---

# 174. Invoice Support

Where appropriate, an invoice should be a separate financial object.

An invoice may contain:

customer, order, items, amount, tax, currency, issue date, due date, status and payment relationships.

The platform must not call an unpaid invoice “revenue received.”

---

# 175. Refunds and Adjustments

The system should support:

refund, partial refund, cancellation, adjustment and charge reversal.

The original transaction must remain visible.

Financial reporting must account for refunds explicitly.

Partner commissions affected by refunds must follow configurable rules and preserve an audit trail.

---

# 176. Customer Complaints

A complaint should become a distinct customer-service state.

A customer with an unresolved complaint may require suppression from promotional automation.

The system should allow management to monitor complaint status and resolution.

---

# 177. Customer Satisfaction

The platform may use:

ratings, reviews, surveys and support outcomes.

These should not be presented as scientific measurements when the sample is small.

The system may identify themes from customer feedback using AI, but the underlying feedback should remain accessible.

---

# 178. Retention Automation

Retention workflows may include:

onboarding reminders, usage guidance, renewal reminders, review requests, repeat-purchase offers, cross-sell recommendations and referral invitations.

These workflows must respect customer state and communication permissions.

---

# 179. Product Availability

Products should contain an active/inactive state.

An inactive product must not accidentally appear in new offers.

Historical purchases must remain visible.

A product can become unavailable while its historical orders remain intact.

---

# 180. Product Pricing

The product model must support:

fixed price, starting price, quote required, subscription, usage-based price or custom commercial price.

The customer-facing presentation must make pricing expectations clear.

The system must not imply a fixed price where the final price is negotiated.

---

# 181. Partner Pricing

Partners may have different commercial terms.

The system should support approved partner pricing where necessary.

Internal cost and partner margin should not automatically be visible to customers.

---

# 182. Agent Compensation

Agents may be compensated under different rules from influencers.

The system should therefore use configurable commission models rather than assuming one universal rule.

---

# 183. Reseller Model

A reseller may buy or sell products under an agreed margin.

The system should represent:

supplier price, reseller price where applicable, customer price and commercial relationship.

The specific financial visibility must be controlled by role.

---

# 184. Affiliate Model

Affiliate relationships may use revenue share or action-based compensation.

Affiliate attribution must remain connected to the customer journey.

---

# 185. Implementation Partner Model

An implementation partner may provide delivery while Aslal owns the customer relationship.

The system should distinguish:

lead source

sales owner

implementation owner

product provider

revenue recipient

commission recipient.

This is important because the party generating the lead may not be the party delivering the service.

---

# 186. Customer Ownership

Customer ownership and partner attribution are not the same thing.

A customer may belong to Aslal's sales team while being attributed to an external partner.

The system must represent these relationships separately.

---

# 187. Channel Ownership

Marketing can generate a customer while sales closes the deal.

Partner may generate demand while Aslal manages the customer.

Supplier provides the product while Aslal provides implementation.

These relationships must remain distinguishable.

---

# 188. Business Workflow Configuration

Workspaces should eventually be able to configure:

lead stages, sales stages, lead scoring rules, task defaults, communication templates, payment methods, partner commission rules, automation conditions, product availability and business hours.

Configuration must be versioned when it affects financial outcomes.

---

# 189. System Settings

Administrative settings should include:

business identity, supported languages, currency, communication providers, payment providers, notification settings, users, roles, automation settings, partner policy, privacy policy, retention settings and tracking configuration.

---

# 190. Configuration Audit

Changes to:

commission rules, payment configuration, automation logic, communication templates, roles, attribution logic and critical integration settings

must be logged.

The system should be able to answer:

> “Who changed this rule and when?”

---

# 191. Public Website Integration

Aslal Growth OS should integrate directly with the business website.

The website should be capable of providing:

event tracking, forms, product interest, source attribution, referral attribution, campaign context, customer identification and conversion events.

Tracking scripts must be lightweight.

A tracking failure must not block the website.

---

# 192. Conversion-Optimized Forms

Forms should capture only information necessary for the requested purpose.

Different forms may have different objectives.

A quick consultation form should not demand a dozen fields.

A business quote form may require more structured information.

The system should support progressive data collection.

---

# 193. Form Context

Forms must preserve:

source, medium, campaign, referral code, product/service interest and page context where applicable.

If a person arrives through:

`/contact?business=Retail&goal=Attract+demand&channels=Website,SEO`

the resulting lead should preserve the relevant customer intent rather than throwing that context away.

The information should appear in the salesperson's view.

---

# 194. Customer Intent

Intent should be structured.

The system should distinguish:

business type

goal

channel interest

product interest

budget where voluntarily provided

timeline where voluntarily provided

current problem

desired outcome.

This makes sales follow-up more useful.

---

# 195. Lead Qualification

The system should provide a qualification framework.

Qualification may consider:

need, authority, urgency, fit, budget and commercial readiness.

The system should not assume a particular sales methodology.

Businesses should be able to configure qualification questions.

---

# 196. Sales Guidance

For qualified leads, the system may show a next-best-action suggestion.

For example:

> Ask about expected launch date.

or:

> Prepare a proposal for ecommerce implementation.

This guidance should be evidence-based and editable.

---

# 197. Sales Scripts

The system may provide approved sales scripts.

Scripts can be localized.

The salesperson should be able to adapt them.

AI may create a customized draft based on customer context, but the original business-approved framework must remain available.

---

# 198. Proposal Follow-Up

A proposal should trigger a follow-up mechanism.

The system should track:

proposal sent, customer response, viewing where available, deadline, follow-up date, negotiation and final decision.

The purpose is to prevent high-value demand from disappearing after proposal delivery.

---

# 199. Lost Opportunity Reasons

A lost sale should support structured reasons.

Examples may include:

price, timing, product mismatch, competitor, no response, budget, internal decision, unavailable product, trust issue or other configured reason.

This creates actionable sales intelligence.

---

# 200. Win Reasons

Won deals should also capture useful structured information.

Examples include:

price fit, product fit, referral trust, salesperson responsiveness, implementation capability, payment convenience or other configured reason.

This helps the business understand what actually contributes to conversion.

---

# 201. Trust-to-Conversion Analytics

The system should eventually compare trust signals against commercial behavior.

Examples may include:

business verification, reviews, response time, payment options, delivery clarity and support visibility.

The platform must avoid claiming that any individual factor caused a sale without appropriate evidence.

---

# 202. Communication Performance

The system should measure:

messages sent, delivered where available, responses, response time, failed messages and handoffs.

It should not measure communication volume as success by itself.

The meaningful outcome is customer progress.

---

# 203. Response Time

The system should report:

time from lead creation to first human action

time from customer message to response

time from quote to follow-up

time from accepted quote to payment.

These metrics can identify sales friction.

---

# 204. Lead Leakage

The platform should detect demand leakage.

A lead may be considered operationally at risk when:

no owner, no next action, overdue action, no first contact, unanswered conversation or stalled opportunity exists.

The system should make these visible before revenue is lost.

---

# 205. Revenue Leakage

The platform should detect commercial leakage.

Examples include:

accepted quotes with no payment, delivered service with unresolved payment, payment received but order not fulfilled, orders with missing source attribution and commissions that cannot be reconciled.

---

# 206. Partner Leakage

Partner-related leakage may include:

unattributed referral, duplicate partner claims, missing commission, disputed customer ownership or incomplete conversion data.

---

# 207. Data Quality Center

The operations system should provide a data-quality workspace.

It should identify:

missing fields, duplicate identities, invalid attribution, incomplete lead execution, invalid financial relationships and orphaned records.

It should never “fix” commercial facts automatically without authorization.

---

# 208. Business Intelligence Hierarchy

Reports should follow this order:

**What happened?**

**Where did it come from?**

**What did customers do?**

**What did sales do?**

**What converted?**

**What money was received?**

**What should happen next?**

The platform must favor business decisions over decorative dashboards.

---

# 209. Core Management Metrics

The system should support:

qualified demand, response time, conversion rate, pipeline value, quoted value, order value, paid amount, revenue, repeat revenue, campaign revenue, partner revenue and commission.

Every metric must have a clear definition.

---

# 210. Developer Contract

Any developer working on the product must first identify:

the business entity involved

the customer or operator problem

the event that initiates the workflow

the data that must be created or changed

the authorized actor

the destination state

the downstream commercial effect

the attribution effect

the privacy/security effect

the audit requirement

the failure behavior

the acceptance evidence.

A feature is not complete simply because TypeScript compiles or a page renders.

---

# 211. AI Coding Agent Contract

An AI coding agent working on the system must understand the business workflow before modifying implementation.

An AI agent must not create duplicate business logic.

An AI agent must not bypass authorization.

An AI agent must not modify production data to make a dashboard appear healthy.

An AI agent must not fabricate customer or payment records.

An AI agent must not treat technical success as business success.

An AI agent must preserve attribution.

An AI agent must preserve historical information.

An AI agent must identify migration impact.

An AI agent must keep external integrations behind adapters.

---

# 212. Feature Acceptance Standard

A feature is considered complete only when:

the business behavior is correct

the data model is correct

the UI is usable

the API is validated

authorization is correct

errors are understandable

audit behavior exists where needed

attribution is preserved

customer preferences are respected

mobile behavior works

production deployment works

and the resulting business outcome can be demonstrated.

---

# 213. Complete Commercial Acceptance Journey

The platform must eventually be demonstrably capable of the following scenario.

A customer sees an acquisition campaign.

The campaign contains a trackable source.

The customer opens the campaign link.

The system records anonymous engagement.

The customer views a relevant product or service.

The customer asks for information.

The platform captures the appropriate commercial context.

A lead is created when the interaction meets the configured lead criteria.

The lead receives an owner and next action.

The salesperson receives notification.

The salesperson opens the customer record and sees the journey.

The salesperson starts a conversation.

The customer receives a response.

The salesperson qualifies the lead.

An opportunity is created.

A quotation is created.

The customer negotiates.

The seller records a revised quote.

The customer accepts.

An order is generated.

A payment is initiated.

The payment provider reports confirmation.

The order becomes paid.

The customer becomes active.

The partner attribution remains preserved.

The commission becomes calculable.

The salesperson receives credit for the opportunity.

The revenue report includes the transaction.

The customer receives onboarding communication.

Later, the customer receives a legitimate review request.

The customer refers another customer.

The new customer enters through the referral.

The referral is attributable to the original customer.

This is the full-system experience.

---

# 214. What Makes the Product Different

The product must not be positioned internally as merely a collection of common SaaS modules.

Its distinctive value comes from connecting fragmented commercial activities.

The product's conceptual differentiator is:

> **Demand-to-revenue continuity.**

The system should allow the business to connect:

marketing attention

customer intent

sales execution

communication

commerce

payment

partner distribution

commission

retention.

Individual competitors may provide some of these capabilities.

Aslal Growth OS is designed around the connected journey.

---

# 215. Ethiopian-First Design Requirements

The platform must account for:

mobile-first behavior, low and variable connectivity, mixed digital and traditional acquisition, messaging-based commerce, human-assisted sales, Ethiopian phone-number formats, ETB, multiple local communication channels, multilingual customers, local payment methods, partner-driven acquisition, trust requirements and informal/formal business variation.

The system must not assume that:

every customer owns a credit card

every customer has constant broadband

every sale occurs through an ecommerce checkout

every business has a formal corporate structure

every salesperson works exclusively from a desktop

every marketing campaign is digital.

---

# 216. Traditional + Digital Unified Acquisition

The platform must treat traditional and digital acquisition as members of one measurement framework.

A customer may come from:

radio

television

outdoor

event

agent

referral

search

social

website

email

messaging

direct.

The system should normalize these into a common acquisition structure.

This is essential for businesses whose marketing reality is hybrid.

---

# 217. Full Service Offering Enabled by the System

Aslal should be able to use the platform to provide a connected set of services.

A business can receive a website.

The website connects to analytics.

The website creates leads.

Leads enter the sales pipeline.

The business receives CRM.

Customer conversations become unified.

Marketing campaigns become measurable.

SEO traffic becomes attributable.

Partners and influencers receive trackable distribution links.

Products can be resold.

Quotes become structured commercial records.

Orders become structured transactions.

Payments become reconcilable.

Revenue becomes reportable.

Customers enter retention.

Referrals create new demand.

AI eventually provides intelligence across this data.

The business therefore does not need to purchase a completely disconnected tool for every stage.

---

# 218. Service Delivery Model

Aslal may provide Growth OS as:

a managed service

an implementation service

a customized business system

a software subscription

a hybrid service plus software offering.

The product architecture must support these commercial models.

---

# 219. Customer Onboarding

A new business should go through a structured setup.

The setup should establish:

business profile, products/services, users, roles, channels, contact information, payment methods, communication rules, campaign structure, partner policies, templates and basic workflows.

The system should then verify readiness.

An onboarding checklist should identify incomplete critical configuration.

---

# 220. Go-Live Readiness

Before a workspace is considered ready for real customers, it should verify:

business identity configured

authorized users configured

communication channels configured

payment methods configured where applicable

lead ownership rules configured

next-action behavior configured

customer consent policy configured

product catalog configured

sales pipeline configured

test journey completed

backup/monitoring configured.

---

# 221. Customer Education

The platform should contain contextual guidance.

A sales operator should understand what a status means.

A partner should understand commission status.

A business owner should understand revenue attribution.

The product must not rely entirely on external training.

---

# 222. Reporting Clarity

Every report should explain:

what population it represents

what period it covers

what attribution rule it uses

what is directly measured

what is inferred

what information may be missing.

This is particularly important when reporting marketing and partner results.

---

# 223. Data Retention

Different data categories may require different retention rules.

The system should support configurable retention policies.

Technical logs may have shorter retention.

Financial records may require longer retention.

Customer marketing data may require controlled lifecycle.

The system must not retain everything forever merely because storage is available.

---

# 224. Portability

The platform must avoid trapping a business's core data in proprietary formats.

Customers should be able to export their legitimate business data.

The system should use stable internal identifiers.

External provider identifiers must remain separate.

---

# 225. Extensibility

The system must be designed so that future capabilities can be added without redesigning the entire commercial model.

Potential future extensions include:

new payment providers

new messaging channels

new social channels

new delivery partners

new analytics systems

new AI models

new partner types

new business verticals.

---

# 226. What the System Must Never Become

The system must not become:

a surveillance platform

a spam engine

a fake-review system

an unauthorized social-data scraper

an uncontrolled AI salesperson

a financial ledger without auditability

a dashboard designed only to make the business look successful

a complicated enterprise application that salespeople refuse to use.

The platform exists to produce reliable commercial operations.

---

# 227. Definition of Success

The system succeeds when a business can answer, with evidence:

> Who is interested?

> What are they interested in?

> Where did they come from?

> Who owns the relationship?

> What happened previously?

> What should happen next?

> Did the customer receive a response?

> What was offered?

> Did the customer accept?

> Did they pay?

> How much was received?

> Which campaign generated them?

> Which partner or influencer contributed?

> What commission is owed?

> What should we do with the customer next?

And when the system can answer those questions without forcing staff to reconstruct the story manually from unrelated systems.

---

# 228. Final Product Definition

Aslal Growth OS is a localized commercial operating system for businesses that need to connect market attention to measurable revenue.

Its public side attracts and informs customers.

Its intelligence layer observes permitted business-relevant interactions.

Its identity layer connects legitimate customer information.

Its demand layer recognizes meaningful commercial intent.

Its CRM layer organizes leads and opportunities.

Its sales layer manages ownership, next actions, conversations, quotes and negotiations.

Its commerce layer manages orders.

Its payment layer records and reconciles transactions.

Its customer layer manages ongoing relationships.

Its marketing layer measures campaigns and content.

Its partner layer manages agents, influencers, affiliates, resellers and suppliers.

Its commission layer manages financially accountable partner compensation.

Its automation layer performs repetitive work safely.

Its communication layer unifies supported channels.

Its trust layer helps customers understand who they are buying from and what happens after purchase.

Its analytics layer connects acquisition to commercial outcomes.

Its AI layer assists people using reliable system data.

Its security, privacy and audit layers protect the integrity of the entire system.

The system's central loop is:

**Acquire → Understand → Capture → Qualify → Communicate → Follow Up → Quote → Negotiate → Sell → Collect → Deliver → Retain → Refer → Attribute → Improve**

The final objective is not more software.

The objective is a business that can operate a repeatable and measurable growth process.

---

# 229. Authoritative Product Statement

The following statement defines the product at the highest level:

> **Aslal Growth OS is an Ethiopia-first demand-to-revenue commercial operating system that connects marketing, customer intelligence, sales execution, communication, commerce, payments, customer relationships, partner distribution, influencer and agent attribution, automation, retention and business intelligence in one auditable environment.**
>
> **The system exists to prevent demand from becoming invisible, prevent sales opportunities from becoming operationally orphaned, prevent marketing activity from becoming disconnected from revenue, prevent partner contribution from becoming unmeasurable, and prevent customer relationships from becoming fragmented across channels.**
>
> **Every important commercial journey must remain traceable from its origin through customer interaction, sales activity, transaction, payment, attribution and future customer value.**
>
> **The system must remain understandable to the humans responsible for operating the business, even when the underlying technology is sophisticated.**

---

# 230. Relationship to Implementation

This document defines the target product, not the current repository state.

A developer must not assume that a capability exists because it is described here.

A developer must also not assume that a capability does not matter because it is absent from the current codebase.

The current implementation, existing database, deployed services, completed work, incomplete work, technical debt and verification evidence belong in a separate reconciliation document.

Implementation order, phases, priorities, migrations and release sequencing belong in a separate development roadmap.

This document therefore remains stable as the authoritative description of the **system that Aslal Growth OS is intended to become**.

Any implementation decision should be judged against this product definition.

A future reconciliation document will identify where the current implementation satisfies, partially satisfies, or does not yet satisfy these requirements.

A future development roadmap will determine how and when the system reaches this target state.

**This separation is intentional. The PRD defines what the business is building. Reconciliation defines where implementation currently stands. The roadmap defines how the implementation moves from its current state toward the product defined here.**


---

# 231. ASLAL PARTNER COMMERCE NETWORK — REDESIGNED TARGET MODEL

## 231.1 Purpose

The Partner Commerce Network is the part of Aslal Growth OS that allows a business to work with people and organizations outside its own staff to generate customers and sales.

The network supports influencers, affiliates, sales agents, referral agents, resellers, implementation partners and suppliers.

The simple idea is:

> **A business provides something valuable. A partner helps the business reach or serve customers. Aslal records what happened and calculates what the partner is entitled to receive according to clearly published rules.**

The platform must make joining and selling easy while making attribution and money movement strict and auditable.

The design principle is:

> **Easy to participate. Hard to misunderstand. Hard to manipulate. Easy to verify.**

---

# 232. Plain-Language Terms

The following definitions are mandatory product terminology. The interface should use the simple explanation first and the technical term only where useful.

| Term | Plain-language meaning |
|---|---|
| Partner | A person or organization that helps a business find, influence, sell to, or serve customers. |
| Influencer | A person with an audience who promotes a business product or service. |
| Affiliate | A partner who promotes a product or service using a unique link, code, QR code, or similar identifier and earns when a qualifying result occurs. |
| Agent | A person who actively helps find or close customers, often through direct relationships, field work, phone calls, messaging, or referrals. |
| Referral | A customer or potential customer introduced by a partner. |
| Referral link | A special web link that identifies which partner sent a visitor. |
| Referral code | A short code associated with a partner, campaign, or promotion. |
| QR code | A scannable square code that can open a partner's tracked link. |
| Attribution | The method used to decide which partner or source receives credit for a result. Attribution is credit for a defined business event; it does not automatically prove that the partner caused every part of the sale. |
| Campaign | A business promotion with a defined objective, audience, product/service, period, and rules. |
| Partner Program | The public commercial offer that explains how a partner can participate in selling or promoting something. |
| Program Terms | The written rules that explain what the partner must do and what the partner earns. |
| Commission | Money a partner may earn when the program's qualifying conditions are satisfied. |
| Commissionable amount | The portion of a transaction that the program says can be used to calculate commission. |
| Qualifying event | The event that must happen before a commission can be earned, such as a confirmed payment or completed sale. |
| Refund hold | A waiting period after a sale during which the commission is not yet payable because the customer may still receive a refund or cancellation. |
| Payable | A commission that has satisfied all conditions and is ready to be included in a payout. |
| Payout | The process of sending or recording money owed to a partner. |
| Payout ledger | The system's financial record showing what is owed, approved, paid, reversed, or failed. |
| Reseller | A partner who buys or sells a product/service under reseller terms and may earn through a reseller price or margin rather than a simple referral commission. |
| Supplier | A business or provider whose product/service is offered through another business or partner relationship. |
| Margin | The difference between the partner's permitted selling price and the partner's agreed purchase/reseller price, subject to the contract. |
| Deal registration | An agent or partner records a potential customer/deal so the business can recognize and manage the partner's commercial claim under defined rules. |
| Verification | Checking information about a partner before allowing higher-risk activities. |
| Verification level | The level of trust or evidence established for a partner. It is different from whether the partner's account is currently active. |
| Partner status | Whether the partner account is currently usable, restricted, suspended, or closed. |
| Program admission | The rule determining whether anyone can join, whether basic verification is required, whether the business must approve the partner, or whether participation is invitation-only. |
| Attribution window | The period during which a partner's qualifying interaction can receive credit. |
| Self-referral | A partner attempting to receive commission from their own purchase or another prohibited related transaction. |
| Dispute | A formal request to review a decision about attribution, commission, payout, order status, or another partner matter. |
| Immutable ledger | A financial history where important events are recorded as new entries rather than silently overwritten. |
| Idempotency | A safety mechanism that prevents the same payment, webhook, or event from being processed twice. |
| Webhook | An automatic message from another system telling Aslal that something happened, such as a payment confirmation. |
| Reconciliation | Comparing Aslal's records with another system, such as a payment provider, to identify and resolve differences. |

The user interface should avoid unexplained technical language. For example, instead of displaying only COMMISSION_LOCKED, the interface should say:

> **Commission on hold — waiting for the refund period to finish.**

---

# 233. Aslal's Distinctive Value for Influencers and Agents

Aslal must not treat influencers and agents as merely sources of advertising traffic.

The distinctive value offered to them should be:

> **Aslal gives influencers and agents a simple, transparent way to turn trusted audience relationships and real-world sales relationships into measurable commercial opportunities without requiring them to build their own ecommerce, CRM, tracking, commission, quotation, or reporting systems.**

## 233.1 The Aslal Partner Opportunity

An influencer or agent should be able to discover legitimate products and services, understand the earning rules before promoting them, receive ready-to-use selling materials, obtain a unique link/code/QR, share or present the offer, see resulting customer activity, understand which sales qualify, and track earnings from one place.

The partner should not have to ask the business:

> “Did that customer come from me?”

The system should answer that question whenever the evidence and attribution rules allow it.

The partner should not have to ask:

> “How did you calculate my commission?”

The system should show the calculation.

The partner should not have to maintain spreadsheets to remember customers referred, links shared, sales made, commission earned, commission waiting, commission approved, and money already paid.

Aslal should provide this record.

## 233.2 What Makes This Valuable to Influencers

For influencers, Aslal should provide a **Creator-to-Commerce Bridge**.

An influencer can move from:

**Audience → Trusted recommendation → Trackable offer → Customer → Sale → Transparent earning**

without becoming a full-time salesperson.

The system should provide:

1. A searchable catalog of eligible offers.
2. Clear earning terms before joining.
3. Ready-made product information and approved marketing assets.
4. Personal referral links.
5. Personal QR codes for offline audiences.
6. Optional promotional codes.
7. Mobile-friendly performance information.
8. Customer/sale attribution where the evidence supports it.
9. A visible explanation of each commission.
10. A clear expected payment date or condition.
11. A dispute process.
12. A reputation/trust history based on actual program participation, without exposing private customer information.

## 233.3 What Makes This Valuable to Agents

For agents, Aslal should provide a **Sales Opportunity-to-Earning Bridge**.

An agent can find or receive an opportunity, register the customer/deal where required, continue the sale, record important actions, use approved quotations or offers, and see the commercial outcome.

The agent should be able to work both online and offline.

The system should therefore support:

**Person met in the field → Customer captured → Opportunity registered → Follow-up → Quote → Negotiation → Order → Payment → Commission**

This is important because an agent may create value even when the customer never clicks a digital referral link.

## 233.4 The Combined Advantage

The strongest Aslal partner experience is not simply:

> “Here is a link. Go advertise.”

It is:

> **“Here is a legitimate offer, here are the exact earning rules, here are the materials you can use, here is your unique identity, here is what happened after you introduced the customer, here is how your earnings were calculated, and here is what remains before you are paid.”**

That creates value for both the partner and the business.

---

# 234. Four Commercial Partner Models

Aslal must not force every partner relationship into one affiliate model.

## 234.1 Affiliate

The affiliate promotes an eligible product or service.

Typical tools:

- referral link;
- QR code;
- promotional code;
- campaign assets.

Typical earning:

- percentage of qualifying sale;
- fixed amount per qualifying sale;
- fixed amount per qualified lead;
- hybrid reward.

The affiliate normally does not own the customer relationship, set the product price, or fulfill the order.

## 234.2 Influencer

The influencer is an audience-based promoter.

An influencer may use the same tracking mechanisms as an affiliate but can also receive campaign-specific content requirements, publication requirements, audience criteria, fixed campaign fees, sales commissions, or combinations of these.

The system must clearly distinguish:

- payment for publishing/content work;
- payment for qualified leads;
- payment for sales;
- bonuses.

These are different earning reasons and must not be mixed into one unexplained amount.

## 234.3 Agent

The agent actively assists with acquisition or sales.

An agent may:

- introduce a customer;
- register a deal;
- arrange a meeting;
- communicate with the customer;
- prepare or request a quote;
- assist negotiation;
- support closing.

Agent compensation may be based on lead, opportunity, sale, fixed fee, percentage, or another agreed rule.

The system must preserve the exact basis for payment.

## 234.4 Reseller

A reseller is commercially different.

A reseller may receive a reseller price and sell to the customer at an allowed price.

The system must therefore support:

- reseller price;
- recommended/public price where applicable;
- permitted discount;
- partner margin;
- customer ownership rules;
- territory rules;
- stock/fulfillment responsibility where applicable;
- order responsibility;
- return responsibility;
- payment responsibility;
- settlement rules.

A reseller must not be implemented merely by changing an affiliate commission percentage.

---

# 235. Supplier and Reseller Relationship Model

The future system must support a formal commercial relationship between a business and a supplier/reseller.

A relationship should define:

1. Who provides the product or service.
2. Who is allowed to sell it.
3. Where it can be sold.
4. At what price or price range it can be sold.
5. Who receives customer payment.
6. Who fulfills the order.
7. Who handles returns or cancellations.
8. Who provides customer support.
9. Who owns the customer relationship.
10. How the parties settle money.
11. What happens when an order is refunded.
12. What happens when one party ends the relationship.

The system should represent these rules as a commercial agreement rather than scattered fields.

Historical transactions must preserve the agreement terms that applied when the transaction occurred.

---

# 236. Partner Programs and Commercial Terms

A **Partner Program** is the public offer through which a business invites partners to promote or sell a product/service.

Every Partner Program must have clear terms.

Before joining, a partner must be able to understand:

- what is being sold;
- who can participate;
- whether approval is required;
- what the partner must do;
- how the partner is tracked;
- what event creates an earning;
- how much the partner earns;
- what amount is commissionable;
- how attribution is decided;
- how long attribution lasts;
- how refunds affect earnings;
- when earnings become payable;
- minimum payout amount;
- payout method;
- prohibited behavior;
- dispute process;
- termination rules.

A partner must not be required to discover these rules after making a sale.

## 236.1 Terms Snapshot

When a partner joins a program, Aslal must store a version of the terms that applied at that time.

If the business changes the commission from 10% to 12%, a previously qualifying transaction must not silently change from 10% to 12%.

The transaction must use the historical terms that governed it.

This is essential for fairness and auditability.

---

# 237. Simple Business Owner Setup

Creating a partner program should use a short wizard.

### Step 1 — What are you selling?

Select:

- product;
- service;
- package;
- subscription;
- other eligible offer.

### Step 2 — Who can sell it?

Choose:

- affiliates;
- influencers;
- agents;
- resellers;
- invitation-only partners;
- selected partner groups.

### Step 3 — How do they earn?

Choose a simple reward method:

- fixed amount;
- percentage of sale;
- amount per qualified lead;
- hybrid;
- reseller margin;
- campaign fee plus performance reward.

### Step 4 — When do they earn?

Define:

- qualifying event;
- attribution rule;
- attribution window;
- refund/cancellation hold;
- payout timing;
- minimum payout.

### Step 5 — Publish

The system displays a plain-language summary:

> **Earn 10% of eligible sales. A sale must be successfully paid. Commission remains on hold for 14 days for refunds. Approved earnings are paid monthly when your balance reaches ETB 500.**

The owner can publish only after the required terms are complete.

---

# 238. Simple Partner Experience

The partner portal should be organized around five simple areas:

**Discover** — find products and programs.

**My Programs** — see programs joined and their rules.

**My Links** — get links, codes, QR codes and approved materials.

**My Sales** — see leads, orders and attributed sales.

**My Earnings** — see pending, approved, payable and paid earnings.

The partner should not need to understand database tables, attribution engines, webhooks, ledger entries, or reconciliation processes.

Those are system responsibilities.

---

# 239. Self-Service Partner Onboarding Without Removing Controls

Aslal should separate two concepts that are currently too closely connected:

**Account status** and **verification level**.

A person should be able to create an account and become an eligible basic affiliate without waiting for a manual administrator to create the partner record.

Higher-risk activities should require stronger verification.

## 239.1 Recommended Partner Account Status

- **REGISTERED** — account created but not yet verified.
- **EMAIL_VERIFIED** — email verification completed.
- **ACTIVE** — allowed to participate in programs permitted at the current verification level.
- **RESTRICTED** — account remains usable but some activities are limited while a review is completed.
- **SUSPENDED** — participation is temporarily blocked.
- **CLOSED** — account is permanently closed for future participation.

## 239.2 Recommended Verification Levels

- **BASIC** — minimum information and verified contact.
- **TRUSTED** — established through clean activity and/or additional evidence.
- **VERIFIED** — stronger identity and payout verification.
- **BUSINESS_VERIFIED** — business-level verification for reseller/supplier/high-risk commercial relationships.

Verification level is not the same as account status.

A BASIC partner can be ACTIVE.

A VERIFIED partner can be SUSPENDED.

This separation makes the rules understandable and flexible.

---

# 240. Register and Immediately Start Selling — Safely

For programs that allow instant participation, the flow should be:

**Create account → Verify email/phone → Accept program terms → Join eligible program → Receive link/code/QR → Start promoting → Track activity**

The basic affiliate should not need manual approval for every program.

However, instant access should be capability-limited.

A BASIC partner may be allowed to:

- browse eligible programs;
- join instant-join programs;
- receive referral links;
- receive QR codes;
- use approved promotional assets;
- generate attributed sales;
- view commissions;
- request payout when eligible.

A BASIC partner should normally not be allowed to:

- change product prices;
- access another customer's private information;
- create reseller inventory;
- transfer customer ownership;
- receive high-value customer data;
- enter high-risk commercial agreements;
- perform restricted payout actions;
- represent themselves as an authorized employee of the business.

Higher-risk privileges require higher verification.

This provides the desired experience:

> **Register and start selling immediately where the business permits it, without removing sensible financial and security controls.**

---

# 241. Program Admission Controls

Every Partner Program should choose one admission policy:

### Open Join

Anyone meeting the program's minimum conditions can join immediately.

### Basic Verification Required

The partner must verify a contact method before joining.

### Business Approval Required

The partner applies and the business approves the application.

### Invitation Only

Only invited partners can participate.

The system must show the admission rule before the partner joins.

---

# 242. Capability-Based Controls

Access should be based on what the partner is trying to do rather than one global “approved/not approved” switch.

| Capability | Basic | Trusted | Verified | Business Verified |
|---|---:|---:|---:|---:|
| View programs | Yes | Yes | Yes | Yes |
| Join instant affiliate programs | Yes | Yes | Yes | Yes |
| Get referral link | Yes | Yes | Yes | Yes |
| Get QR code | Yes | Yes | Yes | Yes |
| Earn commissions | Yes | Yes | Yes | Yes |
| Request payout | Limited | Yes | Yes | Yes |
| Deal registration | Selected | Yes | Yes | Yes |
| Access restricted customer details | No | Limited | By permission | By permission |
| Reseller pricing | No | No | Limited | Yes |
| Reseller agreements | No | No | Limited | Yes |
| Supplier relationships | No | No | No | Yes |

The exact thresholds must be configurable by program and risk level.

---

# 243. Partner Offer Transparency

Every offer card must answer the partner's basic questions before the partner clicks “Join.”

Example:

**Digital Marketing Package**

**You can earn:** 10% of eligible sales.

**How you earn:** Customer completes a qualifying paid order.

**Tracking:** Your unique link, QR code, or approved promo code.

**Attribution:** Last eligible partner interaction within 30 days.

**Refund hold:** 14 days.

**Payment:** Monthly after approval.

**Minimum payout:** ETB 500.

**Join:** Instant after email verification.

**Important:** Refunds, chargebacks, self-referrals and prohibited transactions do not qualify.

This is the minimum standard for an honest partner marketplace.

---

# 244. End-to-End Affiliate Sale Reliability

The affiliate sale process must be treated as a financial workflow, not merely a URL-tracking feature.

The target state is:

**CLICKED → ATTRIBUTED → LEAD → OPPORTUNITY → ORDER CREATED → PAYMENT PENDING → PAYMENT CONFIRMED → ORDER FULFILLED → REFUND HOLD → COMMISSION LOCKED → COMMISSION PAYABLE → PAYOUT CREATED → PAYOUT PROCESSING → PAYOUT CONFIRMED**

Not every sale will contain every stage, but the system must preserve the applicable sequence.

## 244.1 Clicked

The partner's link is opened.

The system records:

- partner;
- referral link;
- program/campaign;
- timestamp;
- destination;
- permitted technical context.

## 244.2 Attributed

The system applies the program's attribution rule.

Possible rules include:

- last eligible click;
- first eligible click;
- lead registration;
- deal registration;
- promo code;
- manual approval.

The rule must be visible in the program terms.

## 244.3 Lead

A person becomes a lead only when the configured lead criteria are met.

A click alone is not automatically a lead.

## 244.4 Order Created

The commercial order is created.

The order must preserve partner attribution where applicable.

## 244.5 Payment Confirmed

The payment provider or authorized operator confirms payment.

A payment confirmation must be idempotent so that receiving the same provider notification twice does not create two payments or two commissions.

## 244.6 Fulfillment

Where the business model requires delivery or service completion, the order must reach the configured fulfillment condition.

## 244.7 Refund Hold

The system waits for the program's defined refund/cancellation period.

The commission remains visible to the partner but is clearly marked as not yet payable.

## 244.8 Commission Payable

Only after all required conditions are satisfied does the commission become payable.

## 244.9 Payout

The system creates a payout record containing the eligible commissions.

Where an external payout provider is connected, the payout process must record:

- provider;
- provider transaction/reference;
- request time;
- processing state;
- confirmation;
- failure;
- retry;
- reconciliation result.

An internal payout record must never be described as proof that money was actually transferred unless external transfer confirmation exists.

---

# 245. Commission Ledger

Every financially important commission event must create a ledger entry.

Supported event types should include:

- EARNED;
- ADJUSTED;
- REVERSED;
- APPROVED;
- PAYABLE;
- PAID;
- REFUNDED;
- CHARGEBACK.

The system must not silently overwrite the financial history.

The partner should be able to see a human-readable explanation.

Example:

> **ETB 1,000 earned**
>
> Customer order: #ASL-1048
>
> Eligible sale: ETB 10,000
>
> Commission rate: 10%
>
> Attribution: Your referral link
>
> Status: On hold until 15 October
>
> Reason for hold: Refund period

---

# 246. Attribution Reliability Rules

Attribution must be deterministic.

The system must know which rule it is applying.

It must not allow two different services to independently invent different attribution outcomes.

A single authoritative attribution service should determine:

- eligible partner;
- eligible referral;
- program;
- campaign;
- attribution window;
- qualifying event;
- attribution result.

Attribution changes must be auditable.

Where two partners appear to claim the same sale, the system must apply the published rule and expose a dispute path rather than silently changing the result.

---

# 247. Promo Codes as a Secondary Tracking Method

Aslal should support promotional codes in addition to referral links.

This is especially important for influencers and agents because many customers do not click a link.

Examples:

- an influencer mentions a code in a video;
- an agent tells a customer the code in person;
- a customer types the code during checkout;
- the sale is attributed according to the program's published rules.

Promo codes must not automatically override every other attribution method.

The program must define how code-based attribution interacts with link-based and deal-registration attribution.

---

# 248. Fraud and Abuse Controls

The system should detect risk signals such as:

- self-referrals;
- repeated use of the same payment/customer identity;
- suspicious click patterns;
- unusually high conversion from automated traffic;
- duplicated orders;
- coupon abuse;
- unusual refund patterns;
- payout-account inconsistencies;
- attempts to manipulate attribution.

Risk detection should normally produce:

**Normal → Review → Restricted/Suspended**

The system must not automatically declare a partner dishonest based solely on a statistical signal.

The partner should have a path to provide evidence or dispute a decision.

---

# 249. Multi-Business Partner Marketplace

The target marketplace model is:

**Business publishes program → Partner discovers program → Partner joins → Partner receives selling tools → Customer is acquired → Sale is attributed → Commission is calculated → Earnings become payable → Payout is processed → Both sides see the same commercial truth**

Each business must remain isolated by workspace.

A partner may participate in programs from multiple businesses.

The partner must see each business relationship separately.

A commission from Business A must never appear as a financial obligation of Business B.

The same customer may have relationships with multiple businesses, subject to privacy and authorization rules.

---

# 250. Business Marketplace Trust Rules

The marketplace must protect both sides.

Businesses must publish meaningful terms.

Partners must follow program rules.

Customers must not be exposed to misleading claims.

Aslal should provide:

- verified business identity where available;
- program terms;
- partner authorization status where appropriate;
- dispute mechanisms;
- audit history;
- payout status;
- fraud controls;
- clear customer communication;
- privacy controls.

Aslal should not promise that every listed business, partner, or offer is risk-free.

The platform's role is to provide structure, evidence and controls.

---

# 251. Campaign Creation Consistency Fix

The current campaign creation implementation must be reconciled before further partner-engine expansion.

The campaign API currently has a mismatch between the fields being inserted and the declared database columns.

In particular, the implementation must decide whether a campaign owns a resource_id relationship.

If yes:

1. Add the field consistently to the database model.
2. Add migration.
3. Add validation.
4. Add API support.
5. Add query/read support.
6. Add update support.
7. Add UI support.
8. Add indexes/constraints where required.
9. Add tests.
10. Document the meaning.

If no:

1. Remove resourceId from the create operation.
2. Remove unused validation.
3. Remove unused UI/API assumptions.
4. Ensure all campaign queries use the same model.

No field should exist only in one layer.

The rule is:

> **One business concept must have one consistent definition across database, API, service logic, UI and documentation.**

---

# 252. Partner Data Model Evolution

The existing Partner entity should evolve rather than be discarded.

The target conceptual model is:

**Partner Account**
→ **Verification**
→ **Partner Program Membership**
→ **Partner Capabilities**
→ **Referral Identity**
→ **Commercial Activity**
→ **Commission Ledger**
→ **Payout Ledger**
→ **Disputes**

A Partner Program should be separated from a Campaign.

A campaign describes a marketing activity.

A Partner Program describes the commercial relationship and earning rules.

A campaign may use a partner program.

A partner may participate in several campaigns under the same program terms.

This separation prevents marketing scheduling data from becoming responsible for financial contract rules.

---

# 253. Commission Contract

Each commercial partner relationship must have a versioned commission contract.

The contract should contain:

- program;
- partner;
- partner type;
- reward type;
- reward rate/amount;
- commissionable basis;
- qualifying event;
- attribution rule;
- attribution window;
- refund hold;
- exclusions;
- payout schedule;
- minimum payout;
- currency;
- effective date;
- expiry date where applicable;
- acceptance timestamp.

When a transaction is created, the applicable contract version must be identifiable.

---

# 254. Business-to-Partner Truth and Partner-to-Business Truth

Aslal should provide one shared commercial truth.

The business sees:

- who referred the customer;
- what happened;
- what was sold;
- what was paid;
- what commission was calculated;
- what is payable;
- what was paid;
- what was reversed.

The partner sees the same underlying commercial result, limited to information they are authorized to view.

The system should not create a private unexplained calculation on one side and a different calculation on the other.

---

# 255. Reliability Requirements

Partner commerce must use strong consistency controls for financial events.

Required controls include:

- database transactions for multi-record financial changes;
- unique identifiers for provider events;
- idempotency keys;
- unique constraints preventing duplicate commission creation;
- workspace isolation;
- authorization checks;
- immutable financial event history;
- reconciliation jobs;
- retry handling;
- failed-event queues;
- monitoring and alerting;
- audit logs.

External integrations must be isolated behind adapters.

A payment provider outage must not destroy the underlying order.

A payout provider outage must not erase a payable commission.

A duplicate webhook must not duplicate money.

---

# 256. Partner Dispute Workflow

A partner should be able to open a dispute for a defined reason.

Examples:

- missing attribution;
- wrong attribution;
- incorrect commission;
- missing sale;
- refund disagreement;
- payout failure;
- program-term disagreement.

The dispute should record:

- claimant;
- transaction/program;
- reason;
- evidence;
- submitted date;
- current status;
- assigned reviewer;
- decision;
- decision reason;
- timestamps.

The system must preserve the original financial record while recording the dispute outcome.

---

# 257. Recommended Implementation Roadmap — P0 to P10

The roadmap below is the recommended implementation sequence. It is intentionally ordered around commercial correctness rather than visual feature count.

## P0 — Correctness and Foundation

**Goal:** Make the existing engine internally consistent before adding more capabilities.

Deliver:

- fix campaign creation field mismatch;
- reconcile schema/API/UI field names;
- remove duplicate business logic;
- confirm workspace isolation;
- add database constraints;
- add transactions for financial changes;
- add idempotency;
- add webhook event uniqueness;
- define authoritative attribution service;
- define financial ledger rules;
- document current-versus-target gaps.

**Exit condition:** Existing partner, order, payment, revenue and commission flows can be tested without ambiguous data relationships.

## P1 — Partner Identity and Self-Service Foundation

**Goal:** Allow partners to register themselves safely.

Deliver:

- Partner Account;
- account status;
- verification level;
- email/phone verification;
- self-service profile;
- partner type selection;
- capability rules;
- basic payout profile;
- terms acceptance;
- onboarding state;
- restricted-mode handling.

**Exit condition:** A BASIC affiliate can register, verify, join an instant-join program, and receive a referral identity without administrator data entry.

## P2 — Partner Programs and Commercial Terms

**Goal:** Replace informal campaign-only partner rules with explicit commercial programs.

Deliver:

- Partner Program;
- Program Terms;
- program admission policy;
- commission contract;
- terms versioning;
- partner offer cards;
- program discovery;
- join/apply/approve flow;
- historical terms snapshots.

**Exit condition:** A partner can understand exactly what they will earn before joining.

## P3 — Reliable Affiliate Engine

**Goal:** Make digital referral sales reliable from click to commission.

**Implementation status:** P3 foundation and hardening implementation complete; controlled runtime certification remains.

Implemented in the P3 hardening layer:

- deterministic visitor → lead attribution using stored referral-click history;
- actual program attribution-window enforcement;
- competing-partner FIRST_CLICK/LAST_CLICK selection within a program;
- LEAD_REGISTRATION and DEAL_REGISTRATION continuity from locked lead attribution;
- order attribution re-resolution before order persistence;
- optional commerce promoCode support using authorized referral codes;
- self-referral prevention at order attribution;
- duplicate customer reuse during quote → order conversion;
- commission lead linkage;
- published refund-hold calculation persisted as commission eligibleAt;
- refund-hold enforcement at commission approval and payout boundaries;
- partner-facing **Why you earned this** explanation;
- existing payment idempotency/reconciliation safeguards retained;
- P3 hardening implementation document and acceptance matrix.

**Exit condition:** A complete test sale can be traced from partner promotion to paid order, reconciled revenue, explainable commission, refund hold and payout eligibility. This exit condition is not yet declared complete until the deployed runtime passes the controlled acceptance suite.

## P4 — Referral Agent Engine

**Goal:** Support sales agents who create value without relying on a digital click.

Deliver:

- deal registration;
- lead ownership;
- agent customer introduction;
- opportunity attribution;
- agent-specific commission contracts;
- approval rules;
- duplicate-deal handling;
- offline/online workflow;
- agent activity timeline.

**Exit condition:** An agent can register a legitimate opportunity and receive attributable credit even when the customer never uses a referral link.

## P5 — Reseller and Supplier Commerce

**Goal:** Implement genuine reseller/supplier relationships instead of treating resellers as affiliates.

Deliver:

- supplier relationship;
- reseller agreement;
- reseller pricing;
- margin;
- permitted discounts;
- territories;
- customer ownership rules;
- fulfillment responsibility;
- return responsibility;
- settlement rules;
- reseller order flow.

**Exit condition:** A reseller transaction can be completed and settled using explicit commercial terms.

## P6 — Commission and Financial Ledger

**Goal:** Make partner earnings financially auditable.

Deliver:

- immutable commission ledger;
- commission event types;
- historical contract reference;
- adjustment/reversal;
- refund/chargeback handling;
- payable calculation;
- partner statement;
- business statement;
- financial reconciliation.

**Exit condition:** Every partner balance can be reconstructed from recorded events.

## P7 — Automated Payout Engine

**Goal:** Move from internal payout records to reliable payout execution.

Deliver:

- payout batching;
- payout approval;
- external provider adapters;
- provider references;
- processing state;
- success confirmation;
- failure and retry;
- payout reconciliation;
- minimum payout rules;
- partner payout notifications.

**Exit condition:** A payable commission can be transferred through a supported provider and the system can prove whether the transfer succeeded.

## P8 — Multi-Business Partner Marketplace

**Goal:** Turn the partner engine into a real two-sided network.

Deliver:

- business program publishing;
- partner marketplace discovery;
- category/search/filter;
- partner applications;
- business approval;
- program eligibility;
- cross-business partner dashboard;
- business isolation;
- standardized offer pages;
- marketplace trust indicators.

**Exit condition:** A partner can discover and participate in programs from multiple businesses without cross-business data leakage.

## P9 — Trust, Fraud, Disputes and Reputation

**Goal:** Protect the network while keeping decisions explainable.

Deliver:

- risk signals;
- self-referral detection;
- duplicate customer detection;
- suspicious activity review;
- restriction/suspension;
- evidence workflow;
- disputes;
- partner history;
- business trust information;
- audit center.

**Exit condition:** The system can detect and review suspicious activity without silently destroying legitimate partner earnings.

## P10 — Production Hardening and Certification

**Goal:** Prove the complete system is reliable enough for real commercial operation.

Deliver:

- end-to-end test suite;
- load testing;
- payment failure testing;
- duplicate webhook testing;
- refund testing;
- partial refund testing;
- payout failure/retry testing;
- multi-workspace isolation testing;
- security testing;
- backup/restore testing;
- monitoring;
- alerting;
- disaster recovery;
- operational runbooks;
- partner/business support procedures;
- production certification checklist.

**Exit condition:** The complete commercial journey can be demonstrated repeatedly from partner registration through sale, commission and payout, including failure and recovery scenarios.

---

# 258. Mandatory End-to-End Test Scenarios

The following tests must exist before the partner system is considered production-ready:

1. Normal affiliate sale.
2. Affiliate sale with QR code.
3. Affiliate sale using promo code.
4. Agent deal registration without referral click.
5. Duplicate payment webhook.
6. Duplicate commission event.
7. Customer refund.
8. Partial refund.
9. Chargeback.
10. Cancelled order.
11. Failed payment.
12. Payout failure.
13. Payout retry.
14. Two partners attempting to claim one sale.
15. Self-referral.
16. Suspicious activity review.
17. Partner dispute.
18. Program-term change after an earlier sale.
19. Partner suspension with existing payable commissions.
20. Multi-business workspace isolation.
21. Partner participates in two different businesses.
22. Business closes a program while existing commissions remain.
23. Payment provider temporarily unavailable.
24. Payout provider temporarily unavailable.
25. Customer completes a sale after an attribution window expires.

The expected result for every scenario must be documented.

---

# 259. Honest Partner-Earning Rules

Aslal must never market the partner network using statements that imply guaranteed income.

The system may say:

> **Earn commissions on qualifying sales according to each program's published terms.**

It should not say:

> **Every click makes money.**

It should not say:

> **Guaranteed income.**

It should not say:

> **Instant payment for every sale.**

The platform should clearly distinguish:

**Activity** → something happened.

**Attributed** → the system assigned credit under a defined rule.

**Earned** → the qualifying conditions were met.

**On hold** → the earning exists but is waiting for a defined condition.

**Payable** → all conditions are satisfied and it can be included in payout.

**Paid** → the payout has been confirmed.

This vocabulary is central to partner trust.

---

# 260. Partner Value Proposition

The recommended Aslal partner proposition is:

> **Promote. Sell. Track. Understand. Earn.**

For influencers:

> **Turn trusted audience attention into measurable commercial opportunities with ready-to-use offers, unique links and codes, transparent attribution, and clear earnings.**

For agents:

> **Turn real customer relationships into organized sales opportunities with deal registration, follow-up tools, attributable sales and transparent commissions.**

For businesses:

> **Build a sales network beyond your internal team while keeping attribution, customer ownership, commissions and payments organized.**

For customers:

> **Discover legitimate offers through people and channels you trust, while the underlying business remains responsible for the product, service, order and customer relationship.**

---

# 261. Aslal Partner Network — Competitive Design Principle

The objective is not to copy one existing affiliate platform.

Aslal should combine useful ideas from mature partner-commerce models while adapting them to Ethiopian business realities.

The target combination is:

**Affiliate tracking**
+
**Influencer campaign management**
+
**Agent/deal registration**
+
**Reseller commerce**
+
**CRM**
+
**Quotation and order flow**
+
**Payment reconciliation**
+
**Transparent commission ledger**
+
**Multi-business marketplace**
+
**Ethiopian-first mobile and messaging workflows**

The unique Aslal contribution is the continuity between these models.

An influencer should be able to generate a lead.

An agent should be able to take over the opportunity where authorized.

A salesperson should be able to convert it.

The customer should receive a quote.

The customer should pay.

The payment should reconcile.

The original partner contribution should remain visible.

The commission should be calculated from the actual transaction.

The partner should see why they earned it.

The business should see the same commercial truth.

This is the **Partner-to-Revenue Continuity** that Aslal should own as a product principle.

---

# 262. Final Partner Commerce Definition

The Aslal Partner Commerce Network is:

> **A transparent commercial network that connects businesses with influencers, affiliates, agents, resellers and other partners, then carries the partner relationship from discovery and onboarding through promotion, customer acquisition, sales, payment, attribution, commission and payout.**

The system should make the easy things easy:

- register;
- verify;
- discover;
- join;
- get a link;
- share;
- sell;
- see results;
- understand earnings.

The system should make the risky things controlled:

- customer data;
- price changes;
- reseller privileges;
- attribution changes;
- financial adjustments;
- payout actions;
- business-to-business agreements.

The system should make the important things explainable:

- why a sale was attributed;
- why a commission was calculated;
- why an earning is on hold;
- why a payout is delayed;
- why an account is restricted;
- what terms governed a transaction.

The system should make the entire commercial chain auditable.

That is the standard to which all future Aslal partner-engine implementation should be compared.

---

# 263. Implementation Priority Rule

When implementation capacity is limited, Aslal must prioritize in this order:

**Financial correctness → attribution correctness → data integrity → partner transparency → security → self-service → automation → marketplace scale → advanced intelligence.**

A beautiful partner dashboard must never be prioritized above correct commission calculation.

A fast onboarding flow must never bypass required financial or security controls.

A marketplace with thousands of offers must never be launched before the system can reliably explain who earned what and why.

The system's credibility depends on the integrity of the commercial record.

---

# 264. Document Status After Partner Commerce Redesign

This document now defines the target-state partner commerce model in addition to the broader Aslal Growth OS.

The existing implementation must be treated as a partial implementation of this target.

The roadmap P0–P10 defines the recommended sequence for closing the gap.

The terms in Sections 232–264 are the preferred business language for product, UX, engineering, support and partner communications.

Where a technical term is unavoidable, the user-facing interface should provide a plain-language explanation.

The guiding principle remains:

> **Sophisticated technology underneath; simple, honest and understandable commerce on the surface.**


## P1-R implementation status — 2026-10-01

The roadmap P1 gate is now being recovered explicitly as **P1-R — Partner Identity & Self-Service Completion**. P1-R is the required gate before deeper P2 expansion is treated as the next roadmap milestone.

Implemented in the repository:

- explicit partner account status, verification level, onboarding status and onboarding step;
- legacy-partner backfill preserving previously active/verified partner access;
- self-service partner registration tied to published program context;
- User ↔ Partner authentication relationship through the existing `users.partner_id` model;
- email verification challenge and activation;
- verification email connected to the existing `email_templates` → `email_outbox` → dispatcher workflow;
- optional SMS-backed phone verification;
- self-service partner profile and partner-type selection;
- capability evaluation and restricted-mode rules;
- basic payout profile;
- program admission checks against `PartnerProgram.admissionMode`;
- active `ProgramTerms` acceptance audit;
- immutable `CommissionContract.termsSnapshot`;
- referral identity creation/reuse;
- partner onboarding portal;
- P1 unit acceptance tests and documented P1-R acceptance gate.

**P1-R status: implementation complete; controlled runtime acceptance remains the gate.**

The required demonstration is:

`new BASIC affiliate → self-register → email verify → ACTIVE → complete profile/payout → join OPEN program → accept active terms → CommissionContract → referral identity → partner portal`

P2 work already present remains preserved, but P2 should not be declared the next completed roadmap milestone until this P1-R demonstration is executed successfully.


---

# 265. Partner Sales Assets — Tickets, Coupons, Vouchers and Passes

## 265.1 Purpose

The Growth OS may allow an approved partner to distribute or sell controlled commercial assets such as printable tickets, coupons, vouchers, passes, gift certificates, or similar customer entitlements.

This capability is an extension of the existing Partner-to-Revenue Continuity model. It is **not** a general-purpose event-ticketing platform, standalone coupon marketplace, or replacement for a business's existing fulfillment system.

The feature exists to give partners a simple physical/digital sales instrument while preserving the same commercial chain already used by Aslal:

**Campaign → Commercial Distribution Item → Partner Allocation → Partner Sale → Order/Payment → Revenue → Commission → Redemption/Fulfillment**

A direct partner sale does not require a Lead record. Where customer acquisition information exists, attribution may additionally connect the sale to the originating campaign, partner, referral identity, or offline attribution record.

## 265.2 Supported asset types

Phase 1 supports these controlled asset types:

- **TICKET** — an entitlement to attend or access a defined event, activity, service, or appointment.
- **COUPON** — a discount or promotional entitlement.
- **VOUCHER** — a prepaid or value-bearing entitlement for a defined product/service.
- **PASS** — a reusable or time-bound access entitlement.

Future types may include gift certificates or other controlled commercial instruments only when their lifecycle can be represented by the same issuance, status, ownership, and audit controls.

## 265.3 Asset definition

A Commercial Distribution Item must have:

- workspace;
- name;
- type;
- description;
- linked Product/Service where applicable;
- linked Campaign where applicable;
- face value or selling price;
- currency;
- quantity/issuance limit where applicable;
- validity start and end;
- redemption instructions;
- printable/visual configuration;
- status;
- creator and creation timestamp.

The asset definition is a master record. Individual issued units must have their own immutable serial identity.

## 265.4 Partner allocation

An asset may be allocated to a specific active, verified partner.

The allocation must record:

- asset;
- partner;
- campaign where applicable;
- quantity allocated;
- quantity sold/issued;
- quantity remaining;
- allocation status;
- effective period;
- creator;
- timestamps.

Only partners that satisfy the applicable verification, account, campaign, and program rules may receive an allocation.

A partner must never be able to allocate assets to itself or another partner.

## 265.5 Individual issued asset

Every issued ticket, coupon, voucher, or pass must receive a unique human-readable serial number and a machine-readable QR representation.

The serial must be unique within the workspace and must not be reused after cancellation, redemption, expiration, or voiding.

The minimum lifecycle is:

**ISSUED → VALID → REDEEMED**

with controlled terminal alternatives:

**ISSUED → VOID**  
**ISSUED → EXPIRED**

The system must preserve the complete lifecycle history.

## 265.6 Printable asset

A printable asset should contain, as applicable:

- Aslal/business identity;
- asset name;
- asset type;
- unique serial number;
- customer/holder name where supplied;
- selling price or value;
- issue date;
- validity period;
- partner ID/name;
- campaign reference where applicable;
- redemption instructions;
- QR code;
- verification message or URL.

The printable representation must not expose internal database identifiers or private customer information unnecessarily.

## 265.7 Partner sales rules

A partner may sell or issue an asset only when:

1. the partner account is active;
2. the partner is verified according to the asset's required level;
3. the partner has an active allocation;
4. inventory remains available;
5. the asset is within its sale/validity window;
6. the sale price is within the authorized commercial rules;
7. the transaction is recorded against the correct workspace;
8. the issued unit receives a unique serial;
9. the commercial result is linked to the partner and campaign where applicable.

A partner must not be able to change the official asset price, validity, commission rule, or redemption state.

## 265.8 Relationship to Orders, Payments and Leads

Partner Sales Assets must reuse the existing commercial infrastructure.

A completed paid sale should use the existing Order and Payment lifecycle wherever a monetary transaction occurs.

The Order must be capable of identifying:

- partner;
- campaign;
- referral identity where applicable;
- commercial distribution item;
- issued serial/unit where applicable.

A sale may exist without a Lead.

A Lead should be created only when the customer-acquisition workflow actually requires a lead record.

This distinction prevents the Growth OS from forcing every physical transaction into a CRM lead model.

## 265.9 Commission

Commission must use the existing partner program and commission contract rules.

The system must not create a separate commission calculator for tickets or vouchers.

The commissionable basis may be:

- fixed amount;
- percentage of qualifying sale;
- margin;
- another published program rule.

The applicable historical contract must remain identifiable for every commission event.

## 265.10 Redemption and verification

Phase 1 establishes the data model and issuance controls.

A later phase may provide a dedicated redemption interface allowing an authorized operator to:

- scan QR;
- enter serial;
- verify status;
- confirm asset identity;
- see validity;
- redeem;
- record redemption actor and timestamp.

Redemption must be idempotent. A second redemption attempt must not create a second successful redemption.

## 265.11 Fraud and audit controls

The system must record:

- who defined the asset;
- who allocated inventory;
- who issued each unit;
- who amended controlled fields;
- who voided a unit;
- who redeemed a unit;
- timestamps;
- relevant before/after state for controlled amendments.

Serial numbers, QR payloads, allocation quantities, order references, and redemption records must be workspace-scoped.

## 265.12 Phase 1 implementation scope

Phase 1 — **Partner Sales Asset Foundation** — delivers:

1. asset definition for Ticket/Coupon/Voucher/Pass;
2. workspace-scoped asset records;
3. Product/Service and Campaign association;
4. price/value and validity;
5. inventory/issuance limit;
6. active/inactive lifecycle;
7. partner allocation;
8. unique serial generation;
9. QR generation;
10. printable PDF generation;
11. partner/admin visibility of allocated assets;
12. audit-ready issuance records.

Phase 1 does **not** attempt to deliver:

- general event management;
- seat maps;
- venue management;
- public ticket marketplace;
- complex coupon stacking;
- automated payment-provider settlement specific to tickets;
- offline synchronization;
- advanced redemption operations.

## 265.13 Roadmap

**P1 — Partner Sales Asset Foundation:** define, allocate, issue, serialise, QR and print.

**P2 — Partner Sales Capture:** partner sells/records asset sales through the existing Order/Payment flow and sees inventory and commission impact.

**P3 — Redemption:** authorized operators verify and redeem QR/serial assets with an immutable redemption history.

**P4 — Offline Commerce Extensions:** support controlled offline issuance/synchronization where connectivity is limited.

## 265.14 Product-value rule

This feature is aligned with Aslal's Growth OS because it strengthens an existing commercial network rather than creating an unrelated module.

It gives partners a concrete sales instrument, extends Aslal's offline-commerce capability, creates attributable commercial transactions even where no lead exists, increases partner utility and retention, and allows Aslal to measure distribution activity through the same order, payment, revenue, commission, and reporting infrastructure.

The implementation must remain deliberately narrow: **commercial distribution assets inside Growth OS**, not a separate ticketing company.

## 265.15 Phase 1 exit condition

Phase 1 is complete when an authorized administrator can define a commercial distribution asset, associate it with an existing Product/Service and/or Campaign, allocate controlled inventory to an eligible partner, issue a uniquely serialized unit, generate a QR code, and produce a printable representation without bypassing workspace isolation or partner authorization.


### 265.16 Phase 2 — Partner Sales Capture

Phase 2 extends Phase 1 issuance into the existing Aslal commercial transaction model.

When a partner sells/issues a paid commercial distribution asset, the platform creates the **IssuedSalesAsset and Order atomically in one transaction**. The issued asset remains the fulfillment instrument; the Order becomes the financial/commercial record.

The transaction must preserve workspace, partner, campaign where applicable, distribution asset, issued serial, quantity, price/value, currency, holder information where supplied, order number, payment state, and fulfillment state.

The feature must not create a second payment, revenue, or commission ledger.

**Phase 2 flow:**

**Partner allocation → Partner sells asset → Issued asset → Order → Payment → Revenue → Commission**

The initial sale creates an Order with payment state `PENDING`. Existing payment infrastructure is responsible for confirmation, reconciliation, refunds and webhook processing. Existing commission infrastructure remains responsible for commission qualification/calculation.

A sale may be recorded without creating a Lead. Lead creation remains optional and is reserved for acquisition workflows where the customer should enter the CRM pipeline.

Phase 2 acceptance requires:

1. an authorized partner can see only its own allocations;
2. a partner cannot sell beyond allocation quantity;
3. global asset inventory limits are enforced;
4. each sale receives a unique issued serial;
5. each sale creates exactly one Order;
6. the Order identifies partner and distribution asset;
7. issuance and Order creation succeed or fail together;
8. payment remains in the existing payment lifecycle;
9. workspace isolation is preserved;
10. the printable issued asset remains available after sale.
