ALTER TABLE `orders` ADD COLUMN `agent_deal_registration_id` CHAR(36) NULL AFTER `partner_id`;
ALTER TABLE `orders` ADD UNIQUE KEY `uq_orders_agent_deal_registration` (`agent_deal_registration_id`);
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_agent_deal_registration` FOREIGN KEY (`agent_deal_registration_id`) REFERENCES `agent_deal_registrations`(`id`) ON DELETE SET NULL;