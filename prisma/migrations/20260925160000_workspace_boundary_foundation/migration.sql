CREATE TABLE workspaces (
  id CHAR(36) NOT NULL,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  client_type VARCHAR(100) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workspaces_slug (slug),
  KEY idx_workspaces_active_name (active,name)
) ENGINE=InnoDB;

CREATE TABLE workspace_users (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role VARCHAR(80) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workspace_user (workspace_id,user_id),
  KEY idx_workspace_user_user (user_id),
  CONSTRAINT fk_workspace_users_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_workspace_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO workspaces (id,name,slug,client_type)
VALUES ('00000000-0000-0000-0000-000000000001','Aslal Internal','aslal-internal','INTERNAL');

ALTER TABLE leads ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_leads_workspace_status (workspace_id,status), ADD CONSTRAINT fk_leads_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE opportunities ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_opportunities_workspace_stage (workspace_id,stage), ADD CONSTRAINT fk_opportunities_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_customers_workspace_status (workspace_id,status), ADD CONSTRAINT fk_customers_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_quotes_workspace_status (workspace_id,status), ADD CONSTRAINT fk_quotes_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_orders_workspace_status (workspace_id,status), ADD CONSTRAINT fk_orders_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_payments_workspace_status (workspace_id,status), ADD CONSTRAINT fk_payments_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_invoices_workspace_status (workspace_id,status), ADD CONSTRAINT fk_invoices_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE partner_campaigns ADD COLUMN workspace_id CHAR(36) NULL AFTER id, ADD KEY idx_campaigns_workspace_status (workspace_id,status), ADD CONSTRAINT fk_campaigns_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

UPDATE leads SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE opportunities SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE customers SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE quotes SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE orders SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE payments SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE invoices SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE partner_campaigns SET workspace_id='00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;

INSERT INTO workspace_users (id,workspace_id,user_id,role)
SELECT UUID(),'00000000-0000-0000-0000-000000000001',id,'INTERNAL'
FROM users
WHERE active=1;
