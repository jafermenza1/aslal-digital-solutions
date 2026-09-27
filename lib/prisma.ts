import { PrismaClient, LeadStatus, CommunicationChannel, EmailMessageType, EmailOutboxStatus, EmailAttemptStatus, EmailEventType } from "@prisma/client";

export { LeadStatus, CommunicationChannel, EmailMessageType, EmailOutboxStatus, EmailAttemptStatus, EmailEventType };

const globalForPrisma = globalThis as unknown as { aslalPrisma?: PrismaClient };

export const prisma = globalForPrisma.aslalPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.aslalPrisma = prisma;
