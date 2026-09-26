ALTER TABLE leads
  ADD COLUMN attribution_expires_at DATETIME(0) NULL;

CREATE INDEX idx_leads_attribution_expires
  ON leads (attribution_expires_at);
