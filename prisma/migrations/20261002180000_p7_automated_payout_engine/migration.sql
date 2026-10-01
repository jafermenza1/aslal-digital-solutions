ALTER TABLE partner_payouts
  ADD COLUMN provider ENUM('MANUAL','TELEBIRR','MPESA') NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN execution_status ENUM('QUEUED','PROCESSING','SUBMITTED','CONFIRMED','FAILED','CANCELLED','REQUIRES_MANUAL_REVIEW') NOT NULL DEFAULT 'QUEUED',
  ADD COLUMN provider_transaction_id VARCHAR(190) NULL,
  ADD COLUMN failure_reason TEXT NULL,
  ADD COLUMN verified_at DATETIME(0) NULL,
  ADD COLUMN verified_by VARCHAR(190) NULL;

CREATE TABLE payout_executions (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  payout_id CHAR(36) NOT NULL,
  provider ENUM('MANUAL','TELEBIRR','MPESA') NOT NULL,
  status ENUM('QUEUED','PROCESSING','SUBMITTED','CONFIRMED','FAILED','CANCELLED','REQUIRES_MANUAL_REVIEW') NOT NULL DEFAULT 'QUEUED',
  attempt INT NOT NULL DEFAULT 0,
  idempotency_key VARCHAR(255) NOT NULL,
  provider_transaction_id VARCHAR(190) NULL,
  provider_request JSON NULL,
  provider_response JSON NULL,
  failure_code VARCHAR(80) NULL,
  failure_reason TEXT NULL,
  submitted_at DATETIME(0) NULL,
  confirmed_at DATETIME(0) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_payout_execution_idempotency(idempotency_key),
  KEY idx_payout_execution_workspace_status(workspace_id,status,created_at),
  KEY idx_payout_execution_payout(payout_id,created_at),
  CONSTRAINT fk_payout_execution_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payout_execution_payout FOREIGN KEY(payout_id) REFERENCES partner_payouts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payout_verifications (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  payout_id CHAR(36) NOT NULL,
  status ENUM('UNVERIFIED','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
  method VARCHAR(40) NOT NULL DEFAULT 'MANUAL',
  reference VARCHAR(190) NULL,
  evidence_url VARCHAR(1000) NULL,
  notes TEXT NULL,
  verified_by VARCHAR(190) NULL,
  verified_at DATETIME(0) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_payout_verification_payout(payout_id),
  KEY idx_payout_verification_workspace_status(workspace_id,status),
  CONSTRAINT fk_payout_verification_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payout_verification_payout FOREIGN KEY(payout_id) REFERENCES partner_payouts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_partner_payouts_provider_status ON partner_payouts(provider,execution_status,created_at);