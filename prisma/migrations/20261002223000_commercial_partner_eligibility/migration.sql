ALTER TABLE `commercial_listing_authorizations`
  ADD COLUMN `program_id` CHAR(36) NULL,
  ADD INDEX `idx_commercial_auth_program_status` (`program_id`, `status`),
  ADD CONSTRAINT `fk_commercial_auth_program` FOREIGN KEY (`program_id`) REFERENCES `partner_programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `commercial_eligibility_decisions` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `listing_id` CHAR(36) NOT NULL,
  `partner_id` CHAR(36) NOT NULL,
  `authorization_id` CHAR(36) NULL,
  `decision` ENUM('ELIGIBLE','INELIGIBLE','REVIEW_REQUIRED') NOT NULL,
  `reasons` JSON NOT NULL,
  `criteria_snapshot` JSON NOT NULL,
  `evaluated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `evaluated_by` CHAR(36) NULL,
  `expires_at` DATETIME(0) NULL,
  `override_reason` TEXT NULL,
  `overridden_by` CHAR(36) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `idx_commercial_eligibility_workspace_partner` (`workspace_id`, `partner_id`, `decision`),
  INDEX `idx_commercial_eligibility_listing_partner` (`listing_id`, `partner_id`, `evaluated_at`),
  INDEX `idx_commercial_eligibility_authorization` (`authorization_id`),
  CONSTRAINT `fk_commercial_eligibility_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_eligibility_listing` FOREIGN KEY (`listing_id`) REFERENCES `commercial_listings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_eligibility_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_commercial_eligibility_authorization` FOREIGN KEY (`authorization_id`) REFERENCES `commercial_listing_authorizations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;