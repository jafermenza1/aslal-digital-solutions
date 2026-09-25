ALTER TABLE users
  ADD COLUMN telegram_chat_id VARCHAR(80) NULL,
  ADD COLUMN telegram_link_token VARCHAR(100) NULL,
  ADD COLUMN telegram_linked_at DATETIME NULL;

CREATE UNIQUE INDEX uq_users_telegram_chat_id ON users (telegram_chat_id);
CREATE UNIQUE INDEX uq_users_telegram_link_token ON users (telegram_link_token);

ALTER TABLE conversations
  ADD COLUMN workspace_id CHAR(36) NULL;

UPDATE conversations c
LEFT JOIN leads l ON l.id=c.lead_id
LEFT JOIN customers cu ON cu.id=c.customer_id
LEFT JOIN opportunities o ON o.id=c.opportunity_id
SET c.workspace_id=COALESCE(l.workspace_id,cu.workspace_id,o.workspace_id,'00000000-0000-0000-0000-000000000001')
WHERE c.workspace_id IS NULL;

ALTER TABLE conversations
  MODIFY COLUMN workspace_id CHAR(36) NOT NULL;

CREATE INDEX idx_conversation_workspace_status ON conversations (workspace_id,status,last_message_at);
ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT;

CREATE TABLE telegram_destinations (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  chat_id VARCHAR(190) NOT NULL,
  type ENUM('PRIVATE','GROUP','CHANNEL') NOT NULL,
  label VARCHAR(190) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  opt_in TINYINT(1) NOT NULL DEFAULT 0,
  link_token VARCHAR(100) NULL,
  lead_id CHAR(36) NULL,
  person_id CHAR(36) NULL,
  product_id CHAR(36) NULL,
  campaign_id CHAR(36) NULL,
  partner_id CHAR(36) NULL,
  referral_code VARCHAR(100) NULL,
  source VARCHAR(100) NULL,
  medium VARCHAR(100) NULL,
  follow_up_enabled TINYINT(1) NOT NULL DEFAULT 0,
  follow_up_message TEXT NULL,
  follow_up_interval_minutes INT NOT NULL DEFAULT 1440,
  follow_up_max_attempts INT NOT NULL DEFAULT 3,
  follow_up_attempts INT NOT NULL DEFAULT 0,
  next_follow_up_at DATETIME NULL,
  last_inbound_at DATETIME NULL,
  handed_off_at DATETIME NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_telegram_dest_chat (chat_id),
  UNIQUE KEY uq_telegram_dest_token (link_token),
  KEY idx_telegram_dest_workspace_active (workspace_id,active,type),
  KEY idx_telegram_followup_due (workspace_id,follow_up_enabled,next_follow_up_at),
  KEY idx_telegram_dest_lead (lead_id),
  CONSTRAINT fk_telegram_dest_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_telegram_dest_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_telegram_dest_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE SET NULL,
  CONSTRAINT fk_telegram_dest_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_telegram_dest_campaign FOREIGN KEY (campaign_id) REFERENCES partner_campaigns(id) ON DELETE SET NULL,
  CONSTRAINT fk_telegram_dest_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;