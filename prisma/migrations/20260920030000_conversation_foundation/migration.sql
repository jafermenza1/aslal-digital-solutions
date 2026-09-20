CREATE TABLE `communication_preferences` (
  `id` CHAR(36) NOT NULL,
  `person_id` CHAR(36) NOT NULL,
  `email_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `sms_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `telegram_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `whatsapp_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `messenger_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `global_opt_out` BOOLEAN NOT NULL DEFAULT FALSE,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `communication_preferences_person_id_key` (`person_id`),
  CONSTRAINT `fk_communication_preferences_person` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `conversations` (
  `id` CHAR(36) NOT NULL,
  `person_id` CHAR(36) NULL,
  `lead_id` CHAR(36) NULL,
  `customer_id` CHAR(36) NULL,
  `opportunity_id` CHAR(36) NULL,
  `channel` ENUM('EMAIL','SMS','TELEGRAM','WHATSAPP','MESSENGER') NOT NULL,
  `external_thread_id` VARCHAR(190) NULL,
  `status` ENUM('OPEN','HUMAN_HANDOFF','CLOSED') NOT NULL DEFAULT 'OPEN',
  `assigned_to` VARCHAR(190) NULL,
  `human_handoff_at` DATETIME(0) NULL,
  `last_message_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_person_channel` (`person_id`,`channel`,`status`),
  INDEX `idx_conversation_external_thread` (`external_thread_id`,`channel`),
  INDEX `idx_conversation_status_last` (`status`,`last_message_at`),
  CONSTRAINT `fk_conversation_person` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_conversation_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_conversation_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_conversation_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `conversation_messages` (
  `id` CHAR(36) NOT NULL,
  `conversation_id` CHAR(36) NOT NULL,
  `direction` ENUM('INBOUND','OUTBOUND') NOT NULL,
  `status` ENUM('RECEIVED','QUEUED','SENT','DELIVERED','FAILED') NOT NULL DEFAULT 'QUEUED',
  `external_message_id` VARCHAR(190) NULL,
  `sender_address` VARCHAR(190) NULL,
  `recipient_address` VARCHAR(190) NULL,
  `body` TEXT NOT NULL,
  `metadata` JSON NULL,
  `sent_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_message_conversation_created` (`conversation_id`,`created_at`),
  INDEX `idx_message_external` (`external_message_id`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `channel_accounts` (
  `id` CHAR(36) NOT NULL,
  `channel` ENUM('EMAIL','SMS','TELEGRAM','WHATSAPP','MESSENGER') NOT NULL,
  `provider` VARCHAR(80) NOT NULL,
  `external_account_id` VARCHAR(190) NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_channel_account` (`channel`,`provider`,`external_account_id`),
  INDEX `idx_channel_account_active` (`channel`,`active`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
