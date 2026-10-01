# P1-R — Partner Identity & Self-Service Completion

## Purpose

P1-R completes the missing Partner Identity and Self-Service Foundation before the roadmap proceeds deeper into P2.

The target vertical slice is:

`Register → Verify email → Activate BASIC account → Complete profile → Configure basic payout profile → View eligible program → Accept active terms → Create CommissionContract → Receive referral identity → Use partner portal`

## 1. Partner Account state model

### Account status

- `REGISTERED`: account created but email verification is incomplete. Discovery is limited; commercial joining is blocked.
- `EMAIL_VERIFIED`: reserved transitional state for explicit verification workflows.
- `ACTIVE`: partner may use capabilities allowed by verification level and partner type.
- `RESTRICTED`: account remains visible to the partner but commercial actions are limited.
- `SUSPENDED`: commercial activity is blocked.
- `CLOSED`: account is permanently closed and cannot resume normal partner activity.

### Verification level

- `BASIC`: email-verified individual; intended baseline for low-risk affiliate/influencer participation.
- `TRUSTED`: additional trust evidence accepted.
- `VERIFIED`: stronger identity/business evidence accepted.
- `BUSINESS_VERIFIED`: business evidence accepted; required for reseller privileges.

### Onboarding

`NOT_STARTED → IN_PROGRESS → COMPLETE`

Steps:

`PROFILE → PARTNER_TYPE → PAYOUT → TERMS → COMPLETE`

## 2. Capability rules

Capabilities are derived from state rather than granted blindly.

BASIC active affiliates/influencers can:

- maintain profile;
- discover programs;
- join eligible OPEN/VERIFICATION_REQUIRED programs;
- receive/use referral identity;
- view eligible earnings information.

Agents require TRUSTED/VERIFIED/BUSINESS_VERIFIED for deal-registration capabilities.

Resellers require BUSINESS_VERIFIED for reseller pricing/customer-management capabilities.

RESTRICTED/SUSPENDED/CLOSED accounts cannot create new commercial relationships.

## 3. Self-service registration

`POST /api/partner/register`

Registration requires:

- name;
- email;
- password;
- phone;
- country;
- partner type;
- published program context.

The program context establishes the workspace without allowing the registrant to choose an arbitrary workspace.

Registration creates:

- `Partner`;
- `User` with `PARTNER` role;
- `WorkspaceUser` with `PARTNER` role;
- email verification challenge.

No administrator data entry is required.

## 4. Email verification and automation

Email verification uses the existing durable email infrastructure in `lib/email-queue.ts`.

The registration flow:

1. generates a random verification token;
2. stores only its SHA-256 hash;
3. expires the challenge after 24 hours;
4. queues the verification message in `email_outbox`;
5. uses template key `partner.account.verify`;
6. lets the existing email dispatcher/provider workflow deliver the message;
7. consumes the challenge exactly once;
8. changes the account to `ACTIVE`.

This deliberately does not introduce a second SMTP/send mechanism.

## 5. Phone verification

Phone verification is implemented as an optional SMS-backed capability.

The flow requires `SMS_PROVIDER_URL`. If no provider is configured, the endpoint returns a controlled configuration response rather than pretending verification occurred.

OTP values are stored only as SHA-256 hashes and expire after ten minutes.

Endpoints:

- `POST /api/partner/phone/request`
- `POST /api/partner/phone/verify`

## 6. Profile and payout

Partner profile endpoint:

- `GET /api/partner/me`
- `PATCH /api/partner/me`

Basic payout profile:

- `PUT /api/partner/payout-profile`

The program-join gate requires a basic payout profile so a partner cannot enter a commercial relationship while having no declared payout destination.

## 7. P2 program admission

Program admission is evaluated against:

- program status;
- active terms;
- allowed partner type;
- account state;
- verification level;
- admission mode;
- payout profile;
- explicit terms acceptance.

For an OPEN program, an ACTIVE BASIC affiliate is eligible.

For `VERIFICATION_REQUIRED`, an ACTIVE verified-level account is eligible.

`BUSINESS_APPROVAL` and `INVITATION_ONLY` remain blocked from automatic joining.

## 8. Contract and terms audit

Joining a program creates a `CommissionContract` using the currently active `ProgramTerms`.

The contract stores an immutable `termsSnapshot`.

A separate `PartnerTermsAcceptance` audit record stores:

- partner;
- workspace;
- program;
- terms version;
- contract;
- accepted timestamp;
- accepting user;
- IP address/user-agent when supplied.

Historical contracts therefore do not change when a program publishes new terms.

## 9. Referral identity

The first successful program join creates or reuses a workspace-scoped, campaign-independent `ReferralLink`.

The partner receives:

- referral code;
- referral path `/go/{code}`;
- portal visibility of the referral identity.

Existing attribution code already resolves referral code → referral link → partner and can therefore consume the identity without a second attribution mechanism.

## 10. Authentication/session relationship

Partner authentication continues through the existing `User` authentication/session model.

The relationship is:

`User.email/session → User.id → User.partnerId → Partner`

Partner login is now additionally gated by `Partner.accountStatus`.

REGISTERED, SUSPENDED and CLOSED partner accounts cannot enter normal partner sessions.

## 11. Partner portal

The partner portal now exposes:

- account state;
- verification level;
- onboarding state;
- editable profile;
- partner type;
- basic payout profile;
- program discovery;
- program admission;
- referral identity;
- existing partner opportunities/performance.

The existing portal remains the operational surface; P1-R adds the missing self-service layer rather than creating a duplicate portal.

## 12. Acceptance tests

### P1-A1 — Registration

Given a published program, a new email and valid affiliate details:

- registration returns 201;
- Partner is created in the program workspace;
- User is created with PARTNER role;
- User.partnerId points to Partner;
- WorkspaceUser is created;
- account state is REGISTERED;
- verification challenge exists;
- email is queued in email_outbox.

### P1-A2 — Email verification

Given an unexpired verification token:

- token is accepted once;
- challenge becomes consumed;
- account becomes ACTIVE;
- emailVerifiedAt is populated;
- second use is rejected.

### P1-A3 — Login gating

- REGISTERED partner cannot log in normally.
- ACTIVE partner can log in.
- SUSPENDED/CLOSED partner cannot log in.

### P1-A4 — Profile

Partner can update name, phone, country and partner type while ACTIVE.

### P1-A5 — Payout

Partner can create/update a basic payout profile.

### P1-A6 — Capability restriction

- BASIC affiliate receives referral capabilities.
- unverified REGISTERED account cannot join.
- SUSPENDED account has only profile-view capability.
- reseller without BUSINESS_VERIFIED does not receive reseller privileges.

### P1-A7 — Instant program join

For an ACTIVE BASIC AFFILIATE, an OPEN published program with active terms:

- join is allowed;
- terms acceptance is required;
- CommissionContract is created;
- contract snapshot equals the active terms;
- PartnerTermsAcceptance is created;
- referral identity is created/reused;
- onboarding reaches COMPLETE.

### P1-A8 — Admission enforcement

- wrong partner type is rejected;
- unpublished program is rejected;
- missing active terms is rejected;
- missing payout profile is rejected;
- BUSINESS_APPROVAL cannot self-join;
- INVITATION_ONLY cannot self-join.

### P1-A9 — Workspace isolation

A partner cannot join a program outside the partner's workspace relationship or obtain another workspace's referral identity.

### P1-A10 — Email automation integration

Verification is queued through the existing email outbox/dispatcher. The partner registration code must not directly send SMTP mail.

## Production migration rule

P1-R adds new parent-independent partner state columns and then child tables. The migration history contains a separate legacy backfill migration so existing verified partners retain access.

Production must use the checked-in migration history and `prisma migrate deploy`; do not reset the production database. Prisma's production guidance confirms that `migrate deploy` applies pending migrations and does not generate artifacts or reset the database. citeturn0search7

## P1 exit gate

P1-R is complete only when a controlled test demonstrates:

**A new BASIC affiliate can register without administrator data entry, verify email through the existing email workflow, activate the account, complete profile/payout onboarding, join an OPEN eligible program, accept the current terms, receive a CommissionContract and referral identity, and see that identity in the partner portal.**

P2 work already present in the repository remains valid, but deeper P2 expansion should not be treated as the next roadmap gate until this P1 exit condition is demonstrated.
