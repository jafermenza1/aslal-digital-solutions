-- P1-R Partner Identity & Self-Service Completion
-- Parent order: partners -> verification/payout/terms audit tables.
-- Existing users.partner_id is reused; no duplicate auth relationship is introduced.

ALTER TABLE partners
  ADD COLUMN account_status ENUM('REGISTERED','EMAIL_VERIFIED','ACTIVE','RESTRICTED','SUSPENDED','CLOSED') NOT NULL DEFAULT 'REGISTERED' AFTER portal_requested,
  ADD COLUMN verification_level ENUM('BASIC','TRUSTED','VERIFIED','BUSINESS_VERIFIED') NOT NULL DEFAULT 'BASIC' AFTER account_status,
  ADD COLUMN onboarding_status ENUM('NOT_STARTED','IN_PROGRESS','COMPLETE') NOT NULL DEFAULT 'NOT_STARTED' AFTER verification_level,
  ADD COLUMN onboarding_step ENUM('PROFILE','PARTNER_TYPE','PAYOUT','TERMS','COMPLETE') NOT NULL DEFAULT 'PROFILE' AFTER onboarding_status,
  ADD COLUMN email_verified_at DATETIME NULL AFTER onboarding_step,
  ADD COLUMN phone_verified_at DATETIME NULL AFTER email_verified_at,
  ADD COLUMN country VARCHAR(100) NULL AFTER phone_verified_at,
  ADD COLUMN phone VARCHAR(40) NULL AFTER country,
  ADD COLUMN restricted_reason TEXT NULL AFTER phone,
  ADD INDEX idx_partners_account_status (account_status),
  ADD INDEX idx_partners_verification_level (verification_level);

CREATE TABLE partner_verification_challenges (
  id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  channel ENUM('EMAIL','PHONE') NOT NULL,
  destination VARCHAR(190) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partner_verification_challenge (partner_id, channel, consumed_at),
  KEY idx_partner_verification_token (token_hash),
  CONSTRAINT fk_partner_verification_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partner_payout_profiles (
  id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  method VARCHAR(40) NOT NULL DEFAULT 'BANK',
  account_name VARCHAR(190) NULL,
  account_number VARCHAR(190) NULL,
  bank_name VARCHAR(190) NULL,
  mobile_wallet VARCHAR(190) NULL,
  country VARCHAR(100) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_partner_payout_profile_partner (partner_id),
  KEY idx_partner_payout_profile_workspace (workspace_id, verified),
  CONSTRAINT fk_partner_payout_profile_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  CONSTRAINT fk_partner_payout_profile_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partner_terms_acceptances (
  id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  program_id CHAR(36) NOT NULL,
  terms_id CHAR(36) NOT NULL,
  contract_id CHAR(36) NULL,
  accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_by VARCHAR(190) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_partner_terms_acceptance (partner_id, program_id, accepted_at),
  KEY idx_partner_terms_acceptance_terms (terms_id),
  CONSTRAINT fk_partner_terms_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT,
  CONSTRAINT fk_partner_terms_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_partner_terms_program FOREIGN KEY (program_id) REFERENCES partner_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_partner_terms_terms FOREIGN KEY (terms_id) REFERENCES program_terms(id) ON DELETE RESTRICT,
  CONSTRAINT fk_partner_terms_contract FOREIGN KEY (contract_id) REFERENCES commission_contracts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
