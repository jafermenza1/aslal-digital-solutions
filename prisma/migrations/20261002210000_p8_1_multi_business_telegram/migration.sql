-- P8.1 Multi-business Telegram Commerce
-- Workspace is the ownership boundary. Secrets remain outside the database.
CREATE TABLE telegram_business_connections (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  connection_type ENUM('BOT','BUSINESS') NOT NULL DEFAULT 'BOT',
  status ENUM('PENDING','ACTIVE','DISABLED','ERROR') NOT NULL DEFAULT 'PENDING',
  display_name VARCHAR(190) NOT NULL,
  bot_username VARCHAR(190) NULL,
  bot_id VARCHAR(80) NULL,
  telegram_business_connection_id VARCHAR(190) NULL,
  bot_token_env_key VARCHAR(190) NULL,
  permissions JSON NULL,
  webhook_status VARCHAR(40) NULL,
  webhook_url VARCHAR(1000) NULL,
  last_connected_at DATETIME(0) NULL,
  last_error TEXT NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_telegram_business_connection_id (telegram_business_connection_id),
  KEY idx_telegram_connection_workspace_status (workspace_id,status),
  KEY idx_telegram_connection_workspace_type (workspace_id,connection_type),
  CONSTRAINT fk_telegram_connection_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
