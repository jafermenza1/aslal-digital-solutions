CREATE TABLE `partner_programs` (
  `workspace_id` CHAR(36) NOT NULL,
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(190) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('DRAFT','PUBLISHED','PAUSED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `admission_mode` ENUM('OPEN','VERIFICATION_REQUIRED','BUSINESS_APPROVAL','INVITATION_ONLY') NOT NULL DEFAULT 'OPEN',
  `allowed_partner_types` TEXT NULL,
  `published_at` DATETIME(0) NULL,
  `created_by` VARCHAR(190) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partner_program_workspace_slug` (`workspace_id`, `slug`),
  KEY `idx_partner_program_workspace_status` (`workspace_id`, `status`),
  CONSTRAINT `fk_partner_program_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `program_terms` (
  `id` CHAR(36) NOT NULL,
  `program_id` CHAR(36) NOT NULL,
  `version` INT NOT NULL DEFAULT 1,
  `active` BOOLEAN NOT NULL DEFAULT FALSE,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'ETB',
  `earnings_description` TEXT NOT NULL,
  `qualifying_event` VARCHAR(190) NOT NULL,
  `attribution_policy` ENUM('LAST_CLICK','FIRST_CLICK','LEAD_REGISTRATION','DEAL_REGISTRATION','PROMO_CODE','MANUAL_APPROVAL') NOT NULL DEFAULT 'LAST_CLICK',
  `attribution_window_days` INT NOT NULL DEFAULT 30,
  `refund_hold_days` INT NOT NULL DEFAULT 0,
  `payout_schedule` VARCHAR(80) NOT NULL DEFAULT 'MANUAL',
  `minimum_payout` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `exclusions` TEXT NULL,
  `terms_snapshot` JSON NULL,
  `published_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_program_terms_version` (`program_id`, `version`),
  KEY `idx_program_terms_program_active` (`program_id`, `active`),
  CONSTRAINT `fk_program_terms_program` FOREIGN KEY (`program_id`) REFERENCES `partner_programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `commission_contracts` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `program_id` CHAR(36) NOT NULL,
  `terms_id` CHAR(36) NOT NULL,
  `partner_id` CHAR(36) NOT NULL,
  `status` ENUM('ACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `accepted_at` DATETIME(0) NULL,
  `accepted_by` VARCHAR(190) NULL,
  `terms_snapshot` JSON NOT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_program_contract_partner` (`program_id`, `partner_id`),
  KEY `idx_contract_workspace_partner_status` (`workspace_id`, `partner_id`, `status`),
  KEY `idx_contract_program_status` (`program_id`, `status`),
  CONSTRAINT `fk_contract_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_contract_program` FOREIGN KEY (`program_id`) REFERENCES `partner_programs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_contract_terms` FOREIGN KEY (`terms_id`) REFERENCES `program_terms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_contract_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE `partner_campaigns`
  ADD COLUMN `program_id` CHAR(36) NULL,
  ADD KEY `idx_partner_campaign_program` (`program_id`),
  ADD CONSTRAINT `fk_partner_campaign_program` FOREIGN KEY (`program_id`) REFERENCES `partner_programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
