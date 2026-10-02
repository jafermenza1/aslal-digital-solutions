ALTER TABLE `orders`
  ADD COLUMN `promo_code` VARCHAR(100) NULL AFTER `referral_code`;

ALTER TABLE `commissions`
  ADD COLUMN `eligible_at` DATETIME NULL AFTER `status`;

CREATE INDEX `idx_orders_promo_code` ON `orders`(`promo_code`);
CREATE INDEX `idx_commissions_eligible_at` ON `commissions`(`eligible_at`);
