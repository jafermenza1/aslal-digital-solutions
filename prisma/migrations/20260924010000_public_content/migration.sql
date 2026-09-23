CREATE TABLE `public_content` (
  `id` CHAR(36) NOT NULL,
  `page_path` VARCHAR(190) NOT NULL,
  `content_key` VARCHAR(190) NOT NULL,
  `label` VARCHAR(250) NOT NULL,
  `value` TEXT NOT NULL,
  `font_family` VARCHAR(120) NOT NULL DEFAULT 'inherit',
  `font_size` DECIMAL(5,2) NOT NULL DEFAULT 16,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_by` VARCHAR(190) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_public_content_page_key` (`page_path`,`content_key`),
  KEY `idx_public_content_page` (`page_path`,`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;