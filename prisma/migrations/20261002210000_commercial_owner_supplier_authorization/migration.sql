ALTER TABLE `commercial_listings`
  ADD COLUMN `owner_party_id` CHAR(36) NULL,
  ADD COLUMN `supplier_party_id` CHAR(36) NULL;

CREATE TABLE `commercial_parties` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `name` VARCHAR(190) NOT NULL,
  `type` ENUM('BUSINESS','SUPPLIER','ASSET_OWNER','SERVICE_PROVIDER','EXTERNAL_OWNER') NOT NULL DEFAULT 'BUSINESS',
  `status` ENUM('ACTIVE','SUSPENDED','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `contact_name` VARCHAR(160) NULL,
  `description` TEXT NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `idx_commercial_party_workspace_status_name` (`workspace_id`, `status`, `name`),
  CONSTRAINT `fk_commercial_party_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commercial_listing_authorizations` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `listing_id` CHAR(36) NOT NULL,
  `party_id` CHAR(36) NULL,
  `partner_id` CHAR(36) NULL,
  `user_id` CHAR(36) NULL,
  `authorization_type` ENUM('OWNED','SUPPLIED','RESELLER_AUTHORIZED','IMPLEMENTATION_PARTNER','AFFILIATE_PROMOTION','SERVICE_PROVIDER','CUSTOM') NOT NULL,
  `status` ENUM('REQUESTED','APPROVED','ACTIVE','SUSPENDED','EXPIRED','REVOKED') NOT NULL DEFAULT 'REQUESTED',
  `effective_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `expires_at` DATETIME(0) NULL,
  `territory` VARCHAR(190) NULL,
  `channel` VARCHAR(100) NULL,
  `partner_types` VARCHAR(250) NULL,
  `quantity_limit` DECIMAL(15,3) NULL,
  `commission_rule` VARCHAR(500) NULL,
  `protection_days` INT NULL,
  `exclusions` TEXT NULL,
  `approved_by` CHAR(36) NULL,
  `approved_at` DATETIME(0) NULL,
  `revoked_at` DATETIME(0) NULL,
  `revocation_reason` TEXT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `idx_commercial_auth_workspace_status` (`workspace_id`, `status`),
  INDEX `idx_commercial_auth_listing_status` (`listing_id`, `status`),
  INDEX `idx_commercial_auth_party_status` (`party_id`, `status`),
  INDEX `idx_commercial_auth_partner_status` (`partner_id`, `status`),
  INDEX `idx_commercial_auth_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_commercial_auth_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_auth_listing` FOREIGN KEY (`listing_id`) REFERENCES `commercial_listings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_auth_party` FOREIGN KEY (`party_id`) REFERENCES `commercial_parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_auth_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_auth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `commercial_listings`
  ADD INDEX `idx_commercial_listing_owner_party` (`owner_party_id`),
  ADD INDEX `idx_commercial_listing_supplier_party` (`supplier_party_id`),
  ADD CONSTRAINT `fk_commercial_listing_owner_party` FOREIGN KEY (`owner_party_id`) REFERENCES `commercial_parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_commercial_listing_supplier_party` FOREIGN KEY (`supplier_party_id`) REFERENCES `commercial_parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;