ALTER TABLE `referral_links`
  ADD COLUMN `campaign_id` CHAR(36) NULL,
  ADD INDEX `idx_referral_campaign` (`campaign_id`),
  ADD CONSTRAINT `fk_referral_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `partner_campaigns` (`id`) ON DELETE SET NULL;
