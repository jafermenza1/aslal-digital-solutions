-- Align the workspace membership role column with the Gate 1 Prisma contract.
-- Gate 1 migration already normalizes NULL/blank roles to MEMBER.
ALTER TABLE workspace_users
  MODIFY COLUMN role ENUM(
    'OWNER',
    'ADMIN',
    'MANAGER',
    'SALES',
    'FINANCE',
    'AUDITOR',
    'CLIENT',
    'PARTNER',
    'MEMBER'
  ) NOT NULL DEFAULT 'MEMBER';
