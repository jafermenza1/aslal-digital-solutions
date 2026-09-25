ALTER TABLE partner_disputes
  ADD COLUMN competing_partner_id CHAR(36) NULL AFTER partner_id,
  ADD COLUMN awarded_partner_id CHAR(36) NULL AFTER competing_partner_id,
  ADD COLUMN lead_id CHAR(36) NULL AFTER awarded_partner_id,
  ADD COLUMN evidence_ref VARCHAR(1000) NULL AFTER description,
  ADD COLUMN decision_notes TEXT NULL AFTER evidence_ref;

CREATE INDEX idx_partner_disputes_competing_status ON partner_disputes (competing_partner_id, status);
CREATE INDEX idx_partner_disputes_awarded_status ON partner_disputes (awarded_partner_id, status);
CREATE INDEX idx_partner_disputes_lead_status ON partner_disputes (lead_id, status);

ALTER TABLE partner_disputes
  ADD CONSTRAINT fk_partner_disputes_competing_partner
    FOREIGN KEY (competing_partner_id) REFERENCES partners(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_partner_disputes_awarded_partner
    FOREIGN KEY (awarded_partner_id) REFERENCES partners(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_partner_disputes_lead
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
