-- Align the users.role MySQL enum with the current Prisma UserRole enum.
-- This is a forward-only schema correction; existing role values remain valid.
ALTER TABLE users
  MODIFY COLUMN role ENUM(
    'SUPER_ADMIN',
    'ADMIN',
    'BUSINESS_OWNER',
    'SALES_MANAGER',
    'SALES_OPERATOR',
    'MARKETING_OPERATOR',
    'PARTNER_MANAGER',
    'PARTNER'
  ) NOT NULL DEFAULT 'SALES_OPERATOR';
