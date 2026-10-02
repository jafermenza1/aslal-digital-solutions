CREATE TABLE partner_registration_settings (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  self_service_enabled TINYINT(1) NOT NULL DEFAULT 1,
  email_verification_required TINYINT(1) NOT NULL DEFAULT 1,
  admin_approval_required TINYINT(1) NOT NULL DEFAULT 1,
  updated_by VARCHAR(190) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_partner_registration_settings_workspace (workspace_id),
  KEY idx_partner_registration_settings_updated (updated_at),
  CONSTRAINT fk_partner_registration_settings_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO partner_registration_settings (id,workspace_id,self_service_enabled,email_verification_required,admin_approval_required,updated_by)
VALUES ('00000000-0000-0000-0000-000000000099','00000000-0000-0000-0000-000000000001',1,1,1,'migration');
