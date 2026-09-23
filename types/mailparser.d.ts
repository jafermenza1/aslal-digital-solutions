declare module "mailparser" {
  export interface MailAddress {
    value: Array<{ address?: string | null }>;
  }

  export interface ParsedMail {
    from?: MailAddress;
    to?: MailAddress;
    messageId?: string;
    inReplyTo?: string;
    references?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
  }

  export function simpleParser(
    source: Buffer | string | Uint8Array,
  ): Promise<ParsedMail>;
}
