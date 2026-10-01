# P4 Referral Agent Engine

## Principle

A referral agent is not paid for merely naming a customer, adding a referral code, or appearing on an order.

An agent earns only when:
1. the agent is an active AGENT partner;
2. the lead belongs to the same workspace;
3. the lead is still open when the claim is registered;
4. the agent records what work they actually performed;
5. the work has a real occurrence date;
6. the business verifies at least one work-evidence record;
7. the business accepts the deal registration;
8. the accepted registration is linked to the resulting order;
9. the order reaches the existing payment/reconciliation qualifying boundary;
10. the published campaign/program reward rules calculate the commission.

## Claim protection

Agents may register only NEW, CONTACTED, QUALIFIED, or DEMO leads. They cannot newly claim leads already in PROPOSAL, NEGOTIATION, WON, or LOST.

Every registration requires:
- a specific claim reason of at least 20 characters;
- the actual customer introduction date;
- an introduction date that is not future-dated or earlier than the lead;
- workspace ownership;
- a unique active registration per agent/lead;
- rejection of competing active registrations for the same lead.

## Verified work

An agent submits dated work evidence such as customer introduction, needs discovery, meeting, site visit, demo, negotiation, proposal support, or follow-up.

Evidence remains PENDING until a business user with partner-management authority verifies it. The agent cannot self-verify.

A deal registration cannot become ACCEPTED unless at least one evidence record is VERIFIED.

## Order boundary

An accepted agent registration is resolved from the opportunity's lead during quote to order conversion.

The order stores the agent deal registration identifier, providing an auditable chain: Agent → Deal Registration → Verified Work → Opportunity → Order.

If a digital affiliate attribution exists and the program policy is DEAL_REGISTRATION, the accepted agent registration takes precedence. Otherwise, the existing affiliate attribution remains intact.

## Financial boundary

At payment reconciliation, an order carrying an agent deal registration is checked again.

The commission path rejects the commission if the registration is missing, not ACCEPTED, has no VERIFIED work, belongs to another partner, or is outside the workspace.

Agent campaigns support FIXED and PER_LEAD rewards at the reconciled-sale boundary, in addition to the existing percentage/hybrid rules.

Refund-hold enforcement from P3 remains in force.

## What agents cannot claim

An agent must not receive commission merely because they copied a referral link, discovered a public lead after proposal/negotiation, added a referral code after the sale, entered a claim without documented work, or attempted to replace another agent's accepted claim.

The platform does not silently punish disputed claims. Competing claims should be reviewed with evidence.

## Acceptance scenarios

1. New lead + customer introduction + verified work + accepted registration + paid sale → eligible commission.
2. Lead already in negotiation → rejected.
3. Claim without work evidence → cannot be accepted.
4. Evidence rejected → registration cannot be accepted.
5. Two agents claim same lead → second active claim rejected.
6. Accepted registration without verified work → payment commission blocked.
7. Affiliate and agent compete → DEAL_REGISTRATION policy can select the accepted agent.
8. Refund before hold expiry → not payable and voided on refund.
9. Duplicate payment/reconciliation → P3 idempotency controls remain effective.
10. Cross-workspace claim → rejected.

## Runtime validation

Run:

    npx prisma generate
    npx prisma migrate deploy
    npm run typecheck
    npm run lint
    npm test

P4 is implementation-complete but is not runtime-certified until these checks and the controlled MySQL acceptance scenarios pass.