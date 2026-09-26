ALTER TABLE `telegram_destinations`
  ADD COLUMN `sales_owner_email` VARCHAR(190) NULL AFTER `lead_id`;

CREATE INDEX `idx_telegram_dest_sales_owner` ON `telegram_destinations` (`workspace_id`, `sales_owner_email`);