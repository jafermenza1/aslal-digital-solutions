-- P6: immutable commission financial ledger and historical commercial basis
-- Apply only after P5 migrations. Never edit an applied migration.

ALTER TABLE commissions
  ADD COLUMN contract_id CHAR(36) NULL,
  ADD COLUMN terms_id CHAR(36) NULL,
  ADD COLUMN contract_snapshot JSON NULL,
  ADD COLUMN qualifying_event VARCHAR(190) NULL,
  ADD COLUMN attribution_policy VARCHAR(40) NULL,
  ADD COLUMN attribution_window_days INT NULL,
  ADD COLUMN refund_hold_days INT NULL,
  ADD COLUMN reward_type VARCHAR(40) NULL,
  ADD COLUMN reward_amount DECIMAL(15,2) NULL,
  ADD COLUMN reward_rate DECIMAL(15,6) NULL,
  ADD COLUMN commissionable_basis DECIMAL(15,2) NULL;

CREATE INDEX idx_commissions_contract ON commissions(contract_id);
CREATE INDEX idx_commissions_terms ON commissions(terms_id);

CREATE TABLE commission_ledger_events (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  commission_id CHAR(36) NOT NULL,
  event_type ENUM('EARNED','ADJUSTED','REVERSED','APPROVED','PAYABLE','PAID','REFUNDED','CHARGEBACK','VOID') NOT NULL,
  amount_delta DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance_after DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  reason TEXT NULL,
  reference_type VARCHAR(60) NULL,
  reference_id CHAR(36) NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  actor VARCHAR(190) NULL,
  metadata JSON NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_commission_ledger_idempotency (idempotency_key),
  KEY idx_commission_ledger_commission_created (commission_id,created_at),
  KEY idx_commission_ledger_workspace_type_created (workspace_id,event_type,created_at),
  CONSTRAINT fk_commission_ledger_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_commission_ledger_commission FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Preserve the commercial basis of legacy commission rows where it can be
-- reconstructed from their linked campaign/program. Rows that cannot be
-- reconstructed remain valid legacy commissions and are marked by the
-- absence of a contract snapshot.
UPDATE commissions c
LEFT JOIN partner_campaigns pc ON pc.id = (
  SELECT COALESCE(rl.campaign_id, adr.campaign_id)
  FROM orders o
  LEFT JOIN referral_links rl ON rl.id=o.referral_link_id
  LEFT JOIN agent_deal_registrations adr ON adr.id=o.agent_deal_registration_id
  WHERE o.id=c.order_id
  LIMIT 1
)
LEFT JOIN program_terms pt ON pt.program_id=pc.program_id AND pt.active=1
LEFT JOIN commission_contracts cc ON cc.program_id=pc.program_id AND cc.partner_id=c.partner_id AND cc.status='ACTIVE'
SET c.contract_id=cc.id,
    c.terms_id=pt.id,
    c.contract_snapshot=cc.terms_snapshot,
    c.qualifying_event=pt.qualifying_event,
    c.attribution_policy=pt.attribution_policy,
    c.attribution_window_days=pt.attribution_window_days,
    c.refund_hold_days=pt.refund_hold_days,
    c.reward_type=pc.reward_type,
    c.reward_amount=pc.reward_amount,
    c.reward_rate=pc.reward_rate,
    c.commissionable_basis=CASE WHEN c.amount IS NOT NULL THEN c.amount ELSE 0 END
WHERE c.contract_id IS NULL;

-- Seed one immutable EARNED event for every existing non-zero commission.
-- The deterministic idempotency key prevents duplicate seed events if this
-- migration is inspected/replayed in a controlled copy.
INSERT INTO commission_ledger_events
(id,workspace_id,commission_id,event_type,amount_delta,balance_after,currency,reason,reference_type,reference_id,idempotency_key,actor,created_at)
SELECT UUID(), c.workspace_id, c.id, 'EARNED', c.amount, c.amount, c.currency,
       'P6 opening balance migrated from the existing commission record',
       'COMMISSION', c.id, CONCAT('p6-seed-earned:',c.id), 'SYSTEM', c.created_at
FROM commissions c
WHERE c.amount <> 0
  AND NOT EXISTS (
    SELECT 1 FROM commission_ledger_events e
    WHERE e.commission_id=c.id
      AND e.idempotency_key=CONCAT('p6-seed-earned:',c.id)
  );
