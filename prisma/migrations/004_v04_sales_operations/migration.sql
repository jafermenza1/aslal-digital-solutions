-- v0.4 sales operations. Existing core tables (visitors/leads/events/partners/referral_links/
-- referral_clicks/products/commissions) are intentionally not recreated here.
-- This migration only adds new operational tables and lead deal fields.

ALTER TABLE `leads`
  ADD COLUMN `deal_value` DECIMAL(15,2) NULL,
  ADD COLUMN `won_at` DATETIME NULL;

CREATE TABLE `lead_notes` (
  `id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NOT NULL,
  `body` TEXT NOT NULL,
  `author` VARCHAR(190) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lead_notes_lead_created` (`lead_id`, `created_at`),
  CONSTRAINT `fk_lead_notes_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_tasks` (
  `id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('OPEN','IN_PROGRESS','DONE','CANCELLED') NOT NULL DEFAULT 'OPEN',
  `priority` ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
  `due_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `assigned_to` VARCHAR(190) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lead_tasks_lead_status` (`lead_id`, `status`),
  INDEX `idx_lead_tasks_due_status` (`due_at`, `status`),
  CONSTRAINT `fk_lead_tasks_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_stage_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` CHAR(36) NOT NULL,
  `from_stage` ENUM('NEW','CONTACTED','QUALIFIED','DEMO','PROPOSAL','NEGOTIATION','WON','LOST') NULL,
  `to_stage` ENUM('NEW','CONTACTED','QUALIFIED','DEMO','PROPOSAL','NEGOTIATION','WON','LOST') NOT NULL,
  `note` VARCHAR(500) NULL,
  `changed_by` VARCHAR(190) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lead_stage_history_lead_created` (`lead_id`, `created_at`),
  CONSTRAINT `fk_lead_stage_history_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_product_interest` (
  `id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `source` VARCHAR(100) NULL,
  `interest_score` INT NOT NULL DEFAULT 1,
  `first_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_lead_product_interest` (`lead_id`, `product_id`),
  INDEX `idx_product_interest_score` (`product_id`, `interest_score`),
  CONSTRAINT `fk_lead_product_interest_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lead_product_interest_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
