# S02 — Partner Attributed Acquisition

## Purpose
A verified Aslal partner promotes an Aslal product/service through a campaign-specific referral link. A prospect clicks the link, enters the acquisition flow, and the system preserves partner, campaign, referral-link, and product/resource attribution through the commercial journey.

## Entity boundaries
- **Partner** — identity, type, verification, activation, onboarding, payout profile, and portal relationship.
- **Partner Program** — commercial program and terms.
- **Campaign** — promotion opportunity with objective, budget, dates, reward model, delivery mode, catalog association, and eligible partner types.
- **CampaignPartner** — relationship between campaign and partner, including invitation/application/approval/active state.
- **ReferralLink** — trackable promotion URL; a campaign-specific link is created when the partner is approved/active for that campaign.
- **Product/Service** — canonical catalog offering.
- **Resource** — canonical reusable resource.
- **Campaign Service Area** — controlled workspace option representing a city or event.

## Partner lifecycle
1. Register partner as **PENDING / REGISTERED**.
2. Complete profile and type-specific onboarding requirements.
3. Authorized partner manager verifies the profile, changing verification status to **VERIFIED**.
4. Authorized manager activates the partner; activation requires **VERIFIED**.
5. Activation synchronizes account/onboarding state to **ACTIVE / COMPLETE**.
6. Only then may an administrator issue portal credentials.
7. Only active + verified partners may be invited/matched to campaigns.

Portal credentials are never the mechanism used to verify or activate a partner.

## Partner types
Supported types are **AGENT**, **INFLUENCER**, **AFFILIATE**, and **RESELLER**.

The registration form shares common identity fields, while the selected type determines later verification, payout, terms, and campaign-eligibility requirements. Registration itself does not activate the partner.

## Campaign creation
Campaign creation is separate from partner registration and never uses a free-text campaign name on the partner form.

Required campaign controls:
- campaign name;
- objective/target;
- delivery mode: **ONLINE**, **OFFLINE**, or **HYBRID**;
- partner program when applicable;
- total budget and partner budget;
- canonical product/service **or** canonical resource;
- reward model and valid reward values;
- eligible partner types;
- campaign dates when applicable;
- description.

### Delivery mode
- **ONLINE**: no geographic service-area selection is required.
- **OFFLINE**: at least one configured city/event is required.
- **HYBRID**: at least one configured city/event is required.

Cities/events are workspace-scoped configuration records. Users select existing options from a dropdown; authorized managers can create a new option from the campaign workflow.

## Reward models
- **FIXED**: fixed ETB amount for each qualifying commercial outcome.
- **PER_LEAD**: fixed ETB amount for each qualifying lead.
- **PERCENT_SALE**: percentage of qualifying sale value.
- **HYBRID**: fixed amount plus percentage rate.
- **MARGIN**: rate calculated from qualifying commercial margin.

The API validates required amount/rate fields for the selected model.

## Product/service/resource association
Campaign forms load active canonical catalog records from the current workspace, while explicitly global records remain usable where supported.

Users must not type a product/service/resource name into an association field. A campaign may associate with a product/service or a resource, not both.

## Campaign matching
Partner and campaign may be created in either order because they are independent master records.

For the S02 operating journey:
**Campaign created → eligible verified partner selected → CampaignPartner invited/approved/active → campaign-specific referral link generated → partner promotes link**

## Attribution acceptance
A valid S02 journey preserves:
**Partner → CampaignPartner → ReferralLink → Visitor/Click → Lead → Attribution → Opportunity/Quote → Order → Payment → Revenue → Commission → Payout**

Invalid, inactive, unverified, expired, self-referral, duplicate, competing-attribution, and cross-workspace cases remain covered by the existing attribution acceptance tests.

## UI acceptance
The operator must be able to:
1. create a partner without typing a campaign name;
2. see that the partner is pending/registered;
3. open Partner Engine and use an explicit **Verify** action;
4. after verification, use an explicit **Activate** action;
5. see credentials blocked until activation;
6. create a campaign using canonical product/service/resource records;
7. select online/offline/hybrid delivery;
8. select configured cities/events for offline/hybrid campaigns;
9. create a new city/event option from the campaign workflow;
10. understand reward amount versus rate from field help;
11. receive a visible API/business-rule error if campaign creation fails;
12. receive a timeout message instead of an apparently frozen Create button;
13. match only active + verified partners;
14. obtain a campaign-specific referral link after association approval/activation.

## Failure conditions
S02 fails if:
- a pending/unverified partner can receive portal credentials;
- an unverified partner can be activated;
- a campaign is attached to a partner by free-text name;
- campaign location is stored only as arbitrary text;
- offline/hybrid campaigns can be created without a supported city/event;
- a typed product/resource name is accepted instead of a canonical record;
- an inactive/cross-workspace product or resource can be selected;
- reward fields do not match the selected reward model;
- a campaign-specific referral link is not created for an approved/active partner;
- partner/campaign/referral attribution is lost;
- campaign creation fails silently;
- one workspace can use another workspace's service-area options.

## Offline Attribution Evidence and Amendment Controls

Every offline lead attribution records the actor who created it, creation timestamp, attribution method, partner when applicable, campaign when applicable, source channel, and reason/evidence. Attribution creation writes a corresponding audit event. Attribution corrections are controlled through the workspace-protected attribution amendment endpoint and require a reason; the current attribution records whether it was amended, amendment timestamp, amending actor, and amendment count. Previous attribution state is retained in the immutable audit history so an amendment does not erase the prior state.

The supported offline attribution methods are DIRECT_OFFLINE, MANUAL_PARTNER, PARTNER_BROUGHT_CUSTOMER, OFFLINE_CODE, CAMPAIGN_EVENT, and STAFF_CAPTURE. Customers are not required to use the internet or submit a referral form. Sales staff can record the attribution from a verbal referral, partner-provided code, physical/event interaction, or direct offline interaction.
