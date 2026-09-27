ALTER TABLE `users`
  ADD COLUMN `telegram_username` VARCHAR(190) NULL AFTER `telegram_chat_id`;

CREATE INDEX `idx_users_telegram_username` ON `users` (`telegram_username`);
