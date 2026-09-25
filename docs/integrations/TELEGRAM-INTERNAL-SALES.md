# Internal Telegram Sales Foundation

This layer extends the Telegram partner workbench into an internal sales and client-conversation channel.

## Supported foundation

- Internal SALES_OPERATOR, SALES_MANAGER, BUSINESS_OWNER, ADMIN, and SUPER_ADMIN users can connect a Telegram chat through a one-time dashboard-generated link.
- Aslal can register Telegram destinations per workspace as PRIVATE client chats, GROUP audiences, or CHANNEL audiences.
- Admins can send an Aslal Product or Service, or custom text, to one or many registered destinations.
- Private client links are opt-in deep links. A client must open/start the bot before Aslal can send direct bot messages.
- Group/channel destinations must be registered and the bot must have permission to post.
- Incoming private client replies are persisted as Telegram conversation messages, linked to a workspace lead, and attributed with source/medium plus optional product/campaign/referral context.
- If a destination is configured with a product, inbound interest creates LeadProductInterest.
- Client reply stops Telegram follow-up automation and changes the conversation to HUMAN_HANDOFF.
- The assigned lead owner is alerted by Telegram when possible; otherwise a workspace manager/admin with Telegram linked is used as the escalation recipient.
- Follow-up automation runs from the existing sales automation cron and stops when an inbound reply is detected.
- Follow-up is bounded by followUpMaxAttempts; when the final attempt is reached no further automated messages are sent.

## API foundation

### Internal staff connection

GET /api/admin/telegram/connect?workspaceId=<workspace>

Returns a one-time staff deep link.

### Destination registration

POST /api/admin/telegram/destinations

Example private client invite:

    {
      "workspaceId": "<workspace>",
      "type": "PRIVATE",
      "label": "ABC client",
      "productId": "<product>",
      "followUpEnabled": true,
      "followUpMessage": "Just following up on the information we sent. Reply here and our sales team will continue with you.",
      "followUpIntervalMinutes": 1440,
      "followUpMaxAttempts": 3
    }

The response contains a client deep link. Do not send a direct private bot message until the client has opened/started the bot.

For a group/channel, supply its Telegram chatId and use GROUP or CHANNEL.

### Broadcast/send

POST /api/admin/telegram/broadcast

Supply workspaceId, destinationIds, and either text or productId.

All destination IDs are re-queried with the active workspace before sending.

## Lead lifecycle

    Product/Service sent
           |
           v
    Client starts/replies
           |
           v
    Telegram conversation
           |
           +--> product/campaign/referral attributes
           |
           v
    Lead created or matched
           |
           v
    Follow-up timer
           |
           +--> no reply --> bounded follow-up
           |
           +--> reply --> stop automation
                                |
                                v
                           HUMAN_HANDOFF
                                |
                                v
                         assigned sales rep
                                |
                                +--> manager/admin Telegram reminder if rep cannot be reached

## Important Telegram constraints

Telegram does not allow a bot to initiate an arbitrary private conversation with a user just because the application knows a username. A user must first interact with/start the bot. Group and channel posting requires the bot to be present and have the required permissions. The implementation therefore treats a private client deep link as the opt-in/connection step.

## Current status

Code foundation: IMPLEMENTED.

Still required for operational acceptance:

1. configure the Telegram bot credentials;
2. register the webhook;
3. connect at least one internal sales user;
4. register a controlled client/private destination;
5. test product/service broadcast;
6. test inbound reply -> lead -> follow-up stop -> human handoff -> staff Telegram alert;
7. test group and channel posting;
8. prove two workspaces cannot access or message each other's destinations.

Production build/deployment remains intentionally deferred.