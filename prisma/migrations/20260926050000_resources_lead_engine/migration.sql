CREATE TABLE `resources` (
  `id` CHAR(36) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `title` VARCHAR(250) NOT NULL,
  `description` TEXT NOT NULL,
  `preview` TEXT NOT NULL,
  `cta` VARCHAR(190) NOT NULL,
  `intent` VARCHAR(190) NOT NULL,
  `download_url` VARCHAR(500) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resources_slug` (`slug`),
  KEY `idx_resources_category_published` (`category`,`published_at`),
  KEY `idx_resources_active_published` (`active`,`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `resource_requests` (
  `id` CHAR(36) NOT NULL,
  `resource_id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NULL,
  `visitor_id` CHAR(36) NULL,
  `channel` VARCHAR(30) NOT NULL DEFAULT 'WEB',
  `contact_value` VARCHAR(190) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
  `score_points` INT NOT NULL DEFAULT 0,
  `follow_up_due_at` DATETIME(0) NULL,
  `follow_up_sent_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resource_requests_resource_created` (`resource_id`,`created_at`),
  KEY `idx_resource_requests_lead_created` (`lead_id`,`created_at`),
  KEY `idx_resource_requests_followup` (`follow_up_due_at`,`follow_up_sent_at`),
  CONSTRAINT `fk_resource_requests_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;