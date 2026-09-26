-- Align the workspace membership role column with the Gate 1 Prisma contract.
-- Legacy workspace-boundary migration used INTERNAL for the protected Aslal workspace.
-- Preserve those memberships without granting an elevated workspace role.
UPDATE workspace_users
SET role = 'MEMBER'
WHERE role IS NULL OR TRIM(role) = '' OR role = 'INTERNAL';

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
