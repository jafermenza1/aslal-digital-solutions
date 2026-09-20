ALTER TABLE `leads`
  ADD COLUMN `owner_email` VARCHAR(190) NULL,
  ADD COLUMN `next_action` VARCHAR(190) NULL,
  ADD COLUMN `next_action_due_at` DATETIME(0) NULL;

CREATE INDEX `idx_leads_owner_status` ON `leads`(`owner_email`, `status`);
CREATE INDEX `idx_leads_next_action_due_status` ON `leads`(`next_action_due_at`, `status`);
