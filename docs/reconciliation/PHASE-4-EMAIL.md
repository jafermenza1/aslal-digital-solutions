# Production Email Channel

The first real messaging channel uses the existing `support@aslaldigital.com` mailbox.

## Provider

- SMTP host: `mail.aslaldigital.com`
- SMTP port: `587`
- SMTP security: STARTTLS
- IMAP host: `mail.aslaldigital.com`
- IMAP port: `993`
- IMAP security: TLS
- Mailbox: `INBOX`

## Environment

Configure these values in the production application environment. Never commit mailbox passwords or the cron secret.

```env
SMTP_HOST=mail.aslaldigital.com
SMTP_PORT=587
SMTP_USER=support@aslaldigital.com
SMTP_PASSWORD=<mailbox password>
SMTP_FROM=support@aslaldigital.com
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true

IMAP_HOST=mail.aslaldigital.com
IMAP_PORT=993
IMAP_USER=support@aslaldigital.com
IMAP_PASSWORD=<mailbox password>
IMAP_SECURE=true
IMAP_MAILBOX=INBOX

EMAIL_INBOX_CRON_SECRET=<long random secret>
```

## Outbound

The existing conversation message route sends `EMAIL` through the SMTP adapter. The existing consent, global opt-out, closed-conversation, and human-handoff ownership gates remain authoritative.

Successful SMTP delivery is persisted as `SENT` with the SMTP Message-ID. Provider errors are persisted as `FAILED`.

## Inbound

The application polls IMAP through:

`GET /api/cron/email-inbox`

The endpoint requires:

`Authorization: Bearer <EMAIL_INBOX_CRON_SECRET>`

It reads unseen messages from `INBOX`, parses the sender, subject, body, Message-ID, In-Reply-To and References headers, then:

1. rejects duplicate Message-IDs already stored;
2. follows email reply references into the existing Conversation;
3. avoids reopening a CLOSED conversation and creates a new OPEN conversation instead;
4. matches known Persons by email;
5. attaches the latest Lead and Customer for that Person;
6. creates an unclaimed conversation for an unknown sender;
7. persists the inbound Message and activity timeline entry;
8. marks successfully processed messages as Seen.

## cPanel/shared-hosting scheduling

Because the application uses a Next.js standalone deployment, the IMAP reader is intentionally invoked by an external scheduler rather than a permanent Node worker.

Create a cPanel Cron Job that runs every 5 minutes and calls:

```text
curl -fsS -H "Authorization: Bearer <EMAIL_INBOX_CRON_SECRET>" https://aslaldigital.com/api/cron/email-inbox >/dev/null
```

Do not put the real secret in the repository. Use the cPanel cron command configured on the server.

## Acceptance test

After deployment:

1. Enable `emailAllowed` for a test Person.
2. Send a test outbound message from the Conversation Center.
3. Confirm the recipient receives it.
4. Confirm the Message is `SENT` and has an external SMTP Message-ID.
5. Reply to the email from an external mailbox.
6. Run the cron endpoint.
7. Confirm the reply appears in the same Conversation.
8. Re-run polling and confirm no duplicate Message is created.
9. Test an unknown sender and confirm an unclaimed Email Conversation is created.
10. Test revoked email consent and global opt-out; outbound must remain blocked.
11. Test a closed conversation reply; it must create a new OPEN conversation.

This integration is implemented as the first real Phase 4B provider. Production credentials, DNS authentication, cron scheduling, and live mailbox tests remain deployment/verification steps.
