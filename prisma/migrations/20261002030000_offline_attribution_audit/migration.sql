ALTER TABLE lead_attributions
  ADD COLUMN attribution_method VARCHAR(40) NULL,
  ADD COLUMN created_by VARCHAR(190) NULL,
  ADD COLUMN reason_notes TEXT NULL,
  ADD COLUMN is_amended BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN amended_at DATETIME(0) NULL,
  ADD COLUMN amended_by VARCHAR(190) NULL,
  ADD COLUMN amendment_count INT NOT NULL DEFAULT 0;

CREATE TABLE lead_attribution_audits (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  attribution_id CHAR(36) NOT NULL,
  lead_id CHAR(36) NOT NULL,
  action VARCHAR(30) NOT NULL,
  actor VARCHAR(190) NULL,
  reason TEXT NULL,
  before_state JSON NULL,
  after_state JSON NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lead_attr_audit_attr_created (attribution_id, created_at),
  INDEX idx_lead_attr_audit_lead_created (lead_id, created_at),
  INDEX idx_lead_attr_audit_workspace_created (workspace_id, created_at),
  CONSTRAINT fk_lead_attr_audit_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_lead_attr_audit_attribution FOREIGN KEY (attribution_id) REFERENCES lead_attributions(id) ON DELETE CASCADE,
  CONSTRAINT fk_lead_attr_audit_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
