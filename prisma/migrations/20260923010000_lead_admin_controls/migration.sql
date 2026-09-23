ALTER TABLE leads ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_leads_test_created ON leads(is_test, created_at);
CREATE TABLE lead_admin_audits (
  id CHAR(36) NOT NULL,
  lead_id CHAR(36) NULL,
  actor VARCHAR(190) NOT NULL,
  action VARCHAR(40) NOT NULL,
  reason TEXT NOT NULL,
  details JSON NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lead_admin_audit_lead_created (lead_id, created_at),
  INDEX idx_lead_admin_audit_action_created (action, created_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;