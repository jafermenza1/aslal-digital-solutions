import type { CommunicationChannel } from "@prisma/client";

export type OutboundMessage = {
  channel: CommunicationChannel;
  recipient: string;
  body: string;
  externalThreadId?: string | null;
};

type CommunicationPreference = {
  emailAllowed: boolean;
  smsAllowed: boolean;
  telegramAllowed: boolean;
  whatsappAllowed: boolean;
  messengerAllowed: boolean;
  globalOptOut: boolean;
};

const preferenceKeys: Record<CommunicationChannel, keyof CommunicationPreference> = {
  EMAIL: "emailAllowed",
  SMS: "smsAllowed",
  TELEGRAM: "telegramAllowed",
  WHATSAPP: "whatsappAllowed",
  MESSENGER: "messengerAllowed",
};

function preferenceKey(channel: CommunicationChannel): keyof CommunicationPreference {
  return preferenceKeys[channel];
}

export function isOutboundAllowed(
  channel: CommunicationChannel,
  preference: CommunicationPreference | null | undefined,
) {
  if (!preference || preference.globalOptOut) return false;
  return Boolean(preference[preferenceKey(channel)]);
}

async function postJson(url: string, body: unknown, headers?: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Messaging provider returned ${response.status}`);
  return response.json().catch(() => ({}));
}

export async function sendThroughAdapter(message: OutboundMessage) {
  switch (message.channel) {
    case "TELEGRAM": {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
      return postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: message.externalThreadId || message.recipient,
        text: message.body,
      });
    }
    case "WHATSAPP": {
      const token = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (!token || !phoneNumberId) throw new Error("WhatsApp provider is not configured");
      return postJson(
        `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
        { messaging_product: "whatsapp", to: message.recipient, type: "text", text: { body: message.body } },
        { authorization: `Bearer ${token}` },
      );
    }
    case "MESSENGER": {
      const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
      if (!token) throw new Error("MESSENGER_PAGE_ACCESS_TOKEN is not configured");
      return postJson(
        "https://graph.facebook.com/v23.0/me/messages",
        { recipient: { id: message.recipient }, message: { text: message.body } },
        { authorization: `Bearer ${token}` },
      );
    }
    case "SMS": {
      const url = process.env.SMS_PROVIDER_URL;
      const token = process.env.SMS_PROVIDER_TOKEN;
      if (!url || !token) throw new Error("SMS provider is not configured");
      return postJson(url, { to: message.recipient, body: message.body }, { authorization: `Bearer ${token}` });
    }
    case "EMAIL": {
      const url = process.env.EMAIL_PROVIDER_URL;
      const token = process.env.EMAIL_PROVIDER_TOKEN;
      if (!url || !token) throw new Error("Email provider is not configured");
      return postJson(url, { to: message.recipient, text: message.body }, { authorization: `Bearer ${token}` });
    }
  }
}
