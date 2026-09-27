ALTER TABLE `leads`
  ADD COLUMN `telegram_username` VARCHAR(190) NULL AFTER `phone`,
  ADD COLUMN `telegram_chat_id` VARCHAR(80) NULL AFTER `telegram_username`;

CREATE INDEX `idx_leads_telegram_username` ON `leads` (`telegram_username`);
