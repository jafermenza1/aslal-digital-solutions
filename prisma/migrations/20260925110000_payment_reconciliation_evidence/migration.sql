ALTER TABLE payments
  ADD COLUMN reconciliation_evidence_ref VARCHAR(1000) NULL AFTER refund_reason,
  ADD COLUMN reconciliation_notes TEXT NULL AFTER reconciliation_evidence_ref,
  ADD COLUMN reconciled_by VARCHAR(190) NULL AFTER reconciliation_notes;