-- Phase 5/operations extension: public catalog, offline lead capture, users/permissions, email templates
ALTER TABLE leads
  ADD COLUMN capture_mode ENUM('WEB','OFFLINE','MANUAL') NOT NULL DEFAULT 'WEB',
  ADD COLUMN lead_category VARCHAR(100) NULL,
  ADD INDEX idx_leads_capture_mode_created (capture_mode, created_at),
  ADD INDEX idx_leads_category_created (lead_category, created_at);

ALTER TABLE products
  ADD COLUMN kind ENUM('PRODUCT','SERVICE') NOT NULL DEFAULT 'PRODUCT',
  ADD COLUMN tagline VARCHAR(250) NULL,
  ADD COLUMN features TEXT NULL,
  ADD COLUMN benefits TEXT NULL,
  ADD COLUMN ideal_for TEXT NULL,
  ADD COLUMN deliverables TEXT NULL,
  ADD COLUMN image_url VARCHAR(1000) NULL,
  ADD COLUMN gallery_urls TEXT NULL,
  ADD COLUMN cta_label VARCHAR(80) NULL,
  ADD COLUMN cta_note VARCHAR(250) NULL,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX idx_products_kind_active_sort (kind, active, sort_order);

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','ADMIN','SALES_MANAGER','SALES_OPERATOR','MARKETING_OPERATOR','PARTNER_MANAGER') NOT NULL DEFAULT 'SALES_OPERATOR',
  permissions JSON NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME(0) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email),
  KEY idx_users_active_role (active, role)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE user_audits (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  actor VARCHAR(190) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  details JSON NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_audit_user_created (user_id, created_at),
  KEY idx_user_audit_action_created (action, created_at),
  CONSTRAINT fk_user_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE email_templates (
  id CHAR(36) NOT NULL,
  template_key VARCHAR(120) NOT NULL,
  name VARCHAR(190) NOT NULL,
  subject_template VARCHAR(250) NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  transactional BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email_templates_key_key (template_key),
  KEY idx_email_templates_active_transactional (active, transactional)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
