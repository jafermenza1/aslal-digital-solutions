CREATE TABLE IF NOT EXISTS partner_risk_signals (
 id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, partner_id CHAR(36) NULL, lead_id CHAR(36) NULL, order_id CHAR(36) NULL,
 signal_code VARCHAR(80) NOT NULL, severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW', status ENUM('OPEN','UNDER_REVIEW','CONFIRMED','DISMISSED','RESOLVED') NOT NULL DEFAULT 'OPEN',
 score INT NOT NULL DEFAULT 0, summary VARCHAR(500) NOT NULL, explanation TEXT NULL, evidence JSON NULL, detected_by VARCHAR(80) NOT NULL DEFAULT 'SYSTEM', reviewed_by VARCHAR(190) NULL, reviewed_at DATETIME NULL, review_note TEXT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id), INDEX idx_risk_workspace_status(workspace_id,status,created_at), INDEX idx_risk_partner_status(partner_id,status,created_at), INDEX idx_risk_lead(lead_id), INDEX idx_risk_order(order_id),
 CONSTRAINT fk_risk_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT, CONSTRAINT fk_risk_partner FOREIGN KEY(partner_id) REFERENCES partners(id) ON DELETE SET NULL, CONSTRAINT fk_risk_lead FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE SET NULL, CONSTRAINT fk_risk_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS partner_risk_evidence (
 id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, risk_signal_id CHAR(36) NOT NULL, partner_id CHAR(36) NULL, evidence_type VARCHAR(80) NOT NULL, reference VARCHAR(1000) NULL, description TEXT NOT NULL, submitted_by VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), INDEX idx_risk_evidence_signal(risk_signal_id,created_at), INDEX idx_risk_evidence_partner(partner_id,created_at),
 CONSTRAINT fk_risk_evidence_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT, CONSTRAINT fk_risk_evidence_signal FOREIGN KEY(risk_signal_id) REFERENCES partner_risk_signals(id) ON DELETE CASCADE, CONSTRAINT fk_risk_evidence_partner FOREIGN KEY(partner_id) REFERENCES partners(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS partner_risk_reviews (
 id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, risk_signal_id CHAR(36) NOT NULL, action VARCHAR(40) NOT NULL, decision VARCHAR(40) NOT NULL, reason TEXT NOT NULL, reviewer VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), INDEX idx_risk_review_signal(risk_signal_id,created_at),
 CONSTRAINT fk_risk_review_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT, CONSTRAINT fk_risk_review_signal FOREIGN KEY(risk_signal_id) REFERENCES partner_risk_signals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS partner_restrictions (
 id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, partner_id CHAR(36) NOT NULL, status ENUM('ACTIVE','LIFTED') NOT NULL DEFAULT 'ACTIVE', level ENUM('RESTRICTED','SUSPENDED') NOT NULL, reason TEXT NOT NULL, risk_signal_id CHAR(36) NULL, imposed_by VARCHAR(190) NOT NULL, imposed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, lifted_by VARCHAR(190) NULL, lifted_at DATETIME NULL,
 PRIMARY KEY(id), INDEX idx_restriction_partner(partner_id,status,imposed_at), INDEX idx_restriction_workspace(workspace_id,status),
 CONSTRAINT fk_restriction_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT, CONSTRAINT fk_restriction_partner FOREIGN KEY(partner_id) REFERENCES partners(id) ON DELETE RESTRICT, CONSTRAINT fk_restriction_signal FOREIGN KEY(risk_signal_id) REFERENCES partner_risk_signals(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trust_audit_events (
 id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, actor VARCHAR(190) NOT NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(80) NOT NULL, entity_id CHAR(36) NULL, before_state JSON NULL, after_state JSON NULL, reason TEXT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), INDEX idx_trust_audit_workspace(workspace_id,created_at), INDEX idx_trust_audit_entity(entity_type,entity_id,created_at),
 CONSTRAINT fk_trust_audit_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT
) ENGINE=InnoDB;