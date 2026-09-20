# Growth OS Canonical Domain Contract

## Purpose

This document defines the minimum business concepts that later implementation phases must preserve.

It intentionally does not prescribe a final Prisma schema. The objective is to prevent the current schema from dictating the product architecture before reconciliation is complete.

## Visitor

A Visitor represents first-party web activity.

A Visitor may remain anonymous.

A Visitor is not automatically a Lead and is never automatically a Customer.

A Visitor may have many Events and may later become associated with a legitimate Lead identity.

## Person

A Person represents a known individual who has voluntarily or legitimately supplied identifying information.

The system must not create a Person merely because an anonymous browser exhibited behavior.

A Person may participate in multiple commercial journeys.

## Organization

An Organization represents the business or institution associated with a person or commercial opportunity.

The system must not force every lead into a company model because some Ethiopian customers may be individuals or informal businesses.

## Lead

A Lead represents an identified person/business with a legitimate sales signal.

A Lead must retain acquisition context, relevant interests, ownership, qualification state, communication preferences where applicable, and the relationship to the original Visitor where known.

A Lead is not the same thing as an Opportunity.

## Opportunity

An Opportunity represents a specific commercial pursuit.

One Lead may have more than one Opportunity over time.

An Opportunity contains commercial state such as product/service, expected value, currency, probability, expected close date, owner, stage, source and partner attribution.

The Opportunity is the object that moves through proposal, negotiation and commercial outcome.

## Customer

A Customer represents a person or organization with a completed sale or an active customer relationship.

A Customer may have multiple Opportunities and multiple orders over time.

A WON Lead must not remain the only representation of a customer.

## Order

An Order represents a committed commercial transaction.

The first implementation may keep this small, but it must be distinct from an Opportunity so that pipeline value and realized revenue are not confused.

## Payment

A Payment represents money received or a verified payment event.

Payment status and payment reference must remain separate from Opportunity stage.

Currency must support ETB from the beginning.

## Event

An Event is an immutable business activity signal with a canonical event name, timestamp, actor/subject context, source/channel, and relevant structured metadata.

Events must not be used as a substitute for transactional entities.

## Conversation

A Conversation is a channel interaction between the business and a person/customer.

A Conversation contains ordered Messages.

A Conversation may be human-owned, automation-owned, or awaiting handoff.

## Message

A Message is an inbound or outbound communication.

It must preserve channel, direction, sender/recipient context, timestamp, delivery state where available, template/reference information where applicable, and provider identifiers where needed for reconciliation.

## Activity

An Activity is a CRM-visible action or observation that belongs in the customer journey timeline.

Examples include assignment, stage change, note, task, message, demo booking, proposal sent, payment verified, or automation execution.

Events and Activities may originate differently but must have a coherent chronological presentation.

## Campaign

A Campaign represents an acquisition or promotional initiative.

A Campaign may contain multiple assets and channels.

Campaign identity must survive into downstream attribution where technically possible.

## Campaign Asset

A Campaign Asset represents a specific content/post/creative/referral placement associated with a campaign.

This is required for partner and content-level attribution.

## Partner

A Partner represents an agent, influencer, affiliate, reseller, or referral partner.

Partner identity must remain separate from customer identity.

## Referral

A Referral connects partner/campaign activity to a first-party visitor or commercial journey.

Referral attribution must survive through the funnel when technically possible.

## Commission

A Commission is a financial obligation created by an attributable commercial outcome.

It must reference the commercial source, partner, applicable rule, calculated amount, currency and lifecycle status.

Every status transition must be auditable.

## Workflow

A Workflow is an automation definition.

It has a trigger, conditions, actions, delays, stop conditions, retry policy, owner and active state.

## Workflow Execution

A Workflow Execution records one actual workflow run.

It must record start state, actions attempted, completion/failure state, timing and relevant error information.

## Consent / Communication Preference

Communication preference records what channels and purposes the customer has permitted or rejected.

They must be evaluated before automated outreach.

A social engagement event alone is not equivalent to permission for private marketing communication.

## Audit Log

An Audit Log records sensitive administrative, financial, permission, integration and automation changes.

Audit records must identify actor, action, target, timestamp and relevant before/after context where appropriate.

## Required relationships

The conceptual relationships are:

Visitor → Event

Visitor → Lead when legitimate identification occurs

Lead → Opportunity

Opportunity → Customer when the commercial outcome creates the customer relationship

Customer → Order

Order → Payment

Person → Lead / Customer

Organization → Lead / Opportunity / Customer

Campaign → Campaign Asset

Campaign Asset → Referral

Partner → Campaign / Referral

Referral → Visitor

Opportunity → Campaign / Partner / Referral

Opportunity → Revenue/Order

Commission → Partner + commercial outcome

Lead/Opportunity/Customer → Conversation

Conversation → Message

Any operational object → Activity timeline

Workflow → Workflow Execution

This contract is intentionally small. New entities must justify themselves against the five product questions:

1. Who is interested?
2. What do they want?
3. Who should act next?
4. What communication should happen?
5. Did it produce revenue?

If an entity does not improve the ability to answer one of those questions, it should not be introduced into the core domain without explicit justification.
