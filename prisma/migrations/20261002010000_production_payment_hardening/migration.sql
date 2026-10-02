-- Production hardening: durable payment webhook idempotency and partial refunds.
ALTER TABLE `payments`
  MODIFY `status` ENUM('INITIATED','PENDING','CONFIRMED','FAILED','REVERSED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'INITIATED';

CREATE TABLE `payment_refunds` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `payment_id` CHAR(36) NOT NULL,
  `idempotency_key` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL,
  `reason` TEXT NULL,
  `provider_refund_ref` VARCHAR(190) NULL,
  `created_by` VARCHAR(190) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_refunds_idempotency` (`idempotency_key`),
  KEY `idx_payment_refunds_payment_created` (`payment_id`,`created_at`),
  KEY `idx_payment_refunds_workspace_created` (`workspace_id`,`created_at`),
  CONSTRAINT `fk_payment_refunds_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payment_refunds_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_webhook_events` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NULL,
  `provider` VARCHAR(80) NOT NULL,
  `event_id` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(120) NOT NULL,
  `payment_id` CHAR(36) NULL,
  `payload` JSON NULL,
  `processed_at` DATETIME(0) NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_webhook_provider_event` (`provider`,`event_id`),
  KEY `idx_payment_webhook_payment_created` (`payment_id`,`created_at`),
  KEY `idx_payment_webhook_workspace_created` (`workspace_id`,`created_at`),
  CONSTRAINT `fk_payment_webhook_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payment_webhook_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
