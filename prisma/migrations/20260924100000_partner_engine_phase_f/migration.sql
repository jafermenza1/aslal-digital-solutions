ALTER TABLE `partners`
  ADD COLUMN `verification_status` ENUM('REGISTERED','VERIFIED','SUSPENDED') NOT NULL DEFAULT 'REGISTERED',
  ADD COLUMN `tier` ENUM('STARTER','VERIFIED','PRO','ELITE') NOT NULL DEFAULT 'STARTER',
  ADD COLUMN `bio` TEXT NULL,
  ADD COLUMN `specialties` TEXT NULL,
  ADD COLUMN `service_areas` TEXT NULL,
  ADD COLUMN `audience_size` INT NULL,
  ADD COLUMN `verification_notes` TEXT NULL,
  ADD COLUMN `verified_at` DATETIME(0) NULL,
  ADD COLUMN `verified_by` VARCHAR(190) NULL,
  ADD INDEX `idx_partners_verification` (`verification_status`),
  ADD INDEX `idx_partners_tier` (`tier`);

CREATE TABLE `partner_campaigns` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('DRAFT','OPEN','ACTIVE','PAUSED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `target_description` TEXT NULL,
  `location` VARCHAR(190) NULL,
  `budget` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `partner_budget` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'ETB',
  `reward_type` ENUM('FIXED','PER_LEAD','PERCENT_SALE','HYBRID','MARGIN') NOT NULL DEFAULT 'FIXED',
  `reward_amount` DECIMAL(15,2) NULL,
  `reward_rate` DECIMAL(7,4) NULL,
  `required_partner_types` TEXT NULL,
  `product_id` CHAR(36) NULL,
  `starts_at` DATETIME(0) NULL,
  `ends_at` DATETIME(0) NULL,
  `created_by` VARCHAR(190) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partner_campaign_status_dates` (`status`,`starts_at`,`ends_at`),
  KEY `idx_partner_campaign_location` (`location`),
  KEY `idx_partner_campaign_product` (`product_id`),
  CONSTRAINT `fk_partner_campaign_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `campaign_partners` (
  `id` CHAR(36) NOT NULL,
  `campaign_id` CHAR(36) NOT NULL,
  `partner_id` CHAR(36) NOT NULL,
  `status` ENUM('INVITED','APPLIED','APPROVED','ACTIVE','DECLINED','COMPLETED','REMOVED') NOT NULL DEFAULT 'APPLIED',
  `role` ENUM('AGENT','INFLUENCER','AFFILIATE','RESELLER') NULL,
  `applied_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME(0) NULL,
  `completed_at` DATETIME(0) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_campaign_partner` (`campaign_id`,`partner_id`),
  KEY `idx_campaign_partner_partner_status` (`partner_id`,`status`),
  KEY `idx_campaign_partner_campaign_status` (`campaign_id`,`status`),
  CONSTRAINT `fk_campaign_partner_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `partner_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_campaign_partner_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partner_disputes` (
  `id` CHAR(36) NOT NULL,
  `partner_id` CHAR(36) NOT NULL,
  `campaign_id` CHAR(36) NULL,
  `commission_id` CHAR(36) NULL,
  `subject` VARCHAR(190) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('OPEN','UNDER_REVIEW','RESOLVED','REJECTED') NOT NULL DEFAULT 'OPEN',
  `resolution` TEXT NULL,
  `resolved_by` VARCHAR(190) NULL,
  `resolved_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partner_disputes_partner_status` (`partner_id`,`status`,`created_at`),
  KEY `idx_partner_disputes_status_created` (`status`,`created_at`),
  KEY `idx_partner_disputes_campaign` (`campaign_id`),
  KEY `idx_partner_disputes_commission` (`commission_id`),
  CONSTRAINT `fk_partner_dispute_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_partner_dispute_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `partner_campaigns` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_partner_dispute_commission` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partner_payouts` (
  `id` CHAR(36) NOT NULL,
  `partner_id` CHAR(36) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'ETB',
  `status` ENUM('PENDING','APPROVED','PAID','FAILED','VOID') NOT NULL DEFAULT 'PENDING',
  `reference` VARCHAR(190) NULL,
  `notes` TEXT NULL,
  `paid_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partner_payouts_partner_status` (`partner_id`,`status`,`created_at`),
  KEY `idx_partner_payouts_status_created` (`status`,`created_at`),
  CONSTRAINT `fk_partner_payout_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partner_payout_items` (
  `id` CHAR(36) NOT NULL,
  `payout_id` CHAR(36) NOT NULL,
  `commission_id` CHAR(36) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payout_commission` (`payout_id`,`commission_id`),
  KEY `idx_payout_item_commission` (`commission_id`),
  CONSTRAINT `fk_payout_item_payout` FOREIGN KEY (`payout_id`) REFERENCES `partner_payouts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_item_commission` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
