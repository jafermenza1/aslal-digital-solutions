# Aslal Mobile Role-Based Information Architecture

## Shared shell

All roles use:
- secure session
- active workspace
- connection indicator
- sync center
- notifications
- global search where authorized
- contextual quick action

The shell is permission-derived. Role names are not authorization.

## Sales / Operator

### Today
- new leads
- overdue follow-ups
- hot leads
- customer replies
- assigned tasks
- next best operational action

### Inbox
- conversations
- human handoff
- unread replies
- channel context
- linked lead/customer/opportunity

### Leads
- my leads
- unassigned permitted queue
- hot/new/overdue filters
- quick capture
- lead journey

### Tasks
- today
- overdue
- upcoming
- completed

### More
- customers
- products/services
- quotes
- orders
- sync
- profile/workspace

## Partner / Agent

### Home
- campaign opportunities
- personal performance
- current referrals
- eligible/pending earnings
- next actions

### Campaigns
- available campaigns
- joined campaigns
- campaign brief
- approved assets
- rules/rewards

### Referrals
- referral links
- referral activity
- attributed leads
- customer outcomes

### Earnings
- pending
- approved/eligible
- paid
- disputes

### More
- profile
- support
- sync
- workspace

Partner mobile must not expose internal admin/finance tooling merely because it exists in the web application.

## Client

### Overview
- leads
- customers
- opportunities
- orders
- compact commercial metrics

### Leads
- active pipeline
- owner/next action
- source/partner attribution where permitted

### Customers
- relationship history
- orders
- customer journey

### Reports
- weekly pipeline
- demand/source performance
- attributed outcomes

### More
- workspace
- profile
- support
- sync

## Finance

### Today
- pending payment evidence
- exceptions
- reconciliation queue
- orders needing attention

### Orders
- order state
- payment state
- customer
- evidence links

### Payments
- pending
- confirmed
- reconciled
- exceptions

### Exceptions
- duplicate/overpayment
- missing evidence
- conflict
- failed provider state

### More
- revenue
- commission/payout visibility
- audit evidence
- sync

Financial actions always use existing server-authoritative APIs.

## Manager / Admin

### Command
- operational exceptions
- pipeline movement
- SLA risk
- partner/campaign activity
- financial exceptions

### Sales
- team leads
- workload
- conversations
- opportunities
- quotes/orders

### Partners
- partner health
- campaigns
- attribution
- disputes

### Finance
- payment/reconciliation visibility
- revenue/commission state

### More
- controlled administration
- reports
- sync
- profile

The mobile admin surface intentionally omits deep schema/migration/configuration controls.

## Journey presentation

A lead/customer detail should expose a chronological journey rather than a desktop table:

Discover → Engage → Identify → Lead → Qualify → Conversation → Opportunity → Quote → Order → Payment → Customer → Retention → Referral

Only recorded events are shown. The UI must not infer a business outcome from a mere event.

## Mobile navigation rule

Use bottom navigation for the 4–5 most frequent role actions. Put rare/admin actions behind More. Do not reproduce the website header/footer or desktop sidebar.

## Quick actions

Contextual quick actions may include:
- capture lead
- call
- open conversation
- create follow-up
- open quote
- inspect order
- review payment
- share partner referral
- join campaign

The available action must be permission- and state-aware.
