import { Prisma, PrismaClient, LeadStatus, CommunicationChannel, EmailMessageType, EmailOutboxStatus, EmailAttemptStatus, EmailEventType, TelegramDeliveryEventType, TelegramOutboxStatus, TelegramMessageType, TelegramSendMode } from "@prisma/client";

export { Prisma, LeadStatus, CommunicationChannel, EmailMessageType, EmailOutboxStatus, EmailAttemptStatus, EmailEventType, TelegramDeliveryEventType, TelegramOutboxStatus, TelegramMessageType, TelegramSendMode };

const globalForPrisma = globalThis as unknown as { aslalPrisma?: PrismaClient };

export const prisma = globalForPrisma.aslalPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.aslalPrisma = prisma;
