-- Q1 E2E: preserve acquisition attribution and require audited override.
ALTER TABLE leads
  ADD COLUMN attribution_locked_at DATETIME(0) NULL,
  ADD COLUMN attribution_locked_by VARCHAR(190) NULL,
  ADD COLUMN attribution_override_reason TEXT NULL;

CREATE INDEX idx_leads_attribution_locked ON leads (attribution_locked_at);