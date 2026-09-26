-- Gate 1: workspace-bound roles and membership prerequisites.
-- Existing role values remain valid; new roles are additive.
ALTER TABLE users
  MODIFY COLUMN role ENUM(
    'SUPER_ADMIN',
    'ADMIN',
    'BUSINESS_OWNER',
    'SALES_MANAGER',
    'SALES_OPERATOR',
    'MARKETING_OPERATOR',
    'PARTNER_MANAGER',
    'PARTNER',
    'FINANCE',
    'AUDITOR',
    'CLIENT'
  ) NOT NULL DEFAULT 'SALES_OPERATOR';

-- Keep the membership role explicit so workspace assignment is auditable
-- independently of the user's global account role.
UPDATE workspace_users
SET role = CASE
  WHEN role IS NULL OR TRIM(role) = '' THEN 'MEMBER'
  ELSE role
END
WHERE role IS NULL OR TRIM(role) = '';
