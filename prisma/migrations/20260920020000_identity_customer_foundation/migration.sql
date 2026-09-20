CREATE TABLE `persons` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `language` VARCHAR(20) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_person_email` (`email`),
  INDEX `idx_person_phone` (`phone`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `leads` ADD COLUMN `person_id` CHAR(36) NULL;
CREATE INDEX `idx_leads_person` ON `leads`(`person_id`);
ALTER TABLE `leads` ADD CONSTRAINT `fk_leads_person` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `opportunities` (
  `id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NOT NULL,
  `name` VARCHAR(190) NOT NULL,
  `product_slug` VARCHAR(160) NULL,
  `expected_value` DECIMAL(15,2) NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'ETB',
  `probability` INT NOT NULL DEFAULT 0,
  `stage` ENUM('NEW','CONTACTED','QUALIFIED','DEMO','PROPOSAL','NEGOTIATION','WON','LOST') NOT NULL DEFAULT 'NEW',
  `expected_close_at` DATETIME(0) NULL,
  `owner_email` VARCHAR(190) NULL,
  `source` VARCHAR(100) NULL,
  `medium` VARCHAR(100) NULL,
  `campaign` VARCHAR(150) NULL,
  `referral_code` VARCHAR(100) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_opportunities_lead_stage` (`lead_id`,`stage`),
  INDEX `idx_opportunities_owner_stage` (`owner_email`,`stage`),
  CONSTRAINT `fk_opportunities_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customers` (
  `id` CHAR(36) NOT NULL,
  `person_id` CHAR(36) NULL,
  `opportunity_id` CHAR(36) NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `language` VARCHAR(20) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_customer_email` (`email`),
  INDEX `idx_customer_phone` (`phone`),
  INDEX `idx_customer_status` (`status`),
  UNIQUE INDEX `uq_customer_opportunity` (`opportunity_id`),
  CONSTRAINT `fk_customer_person` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(80) NOT NULL,
  `subject` VARCHAR(190) NULL,
  `details` JSON NULL,
  `person_id` CHAR(36) NULL,
  `customer_id` CHAR(36) NULL,
  `opportunity_id` CHAR(36) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_activity_person_created` (`person_id`,`created_at`),
  INDEX `idx_activity_customer_created` (`customer_id`,`created_at`),
  INDEX `idx_activity_opportunity_created` (`opportunity_id`,`created_at`),
  CONSTRAINT `fk_activity_person` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_activity_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_activity_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `growth_opportunities` (
  `id` CHAR(36) NOT NULL,
  `visitor_id` CHAR(36) NOT NULL,
  `interest` VARCHAR(190) NOT NULL,
  `engagement_level` VARCHAR(40) NOT NULL,
  `source` VARCHAR(100) NULL,
  `medium` VARCHAR(100) NULL,
  `campaign` VARCHAR(150) NULL,
  `recommended_next_action` VARCHAR(190) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_growth_opportunity_visitor_status` (`visitor_id`,`status`),
  INDEX `idx_growth_opportunity_status_created` (`status`,`created_at`),
  CONSTRAINT `fk_growth_opportunity_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
