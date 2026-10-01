-- P8 multi-business partner marketplace
CREATE TABLE marketplace_program_profiles (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  program_id CHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  headline VARCHAR(250) NULL,
  offer_summary TEXT NULL,
  partner_benefits TEXT NULL,
  eligibility_summary TEXT NULL,
  support_description TEXT NULL,
  logo_url VARCHAR(1000) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_marketplace_program_profile_program (program_id),
  KEY idx_marketplace_program_profile (workspace_id, category, featured, display_order),
  CONSTRAINT fk_marketplace_program_profile_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_marketplace_program_profile_program FOREIGN KEY (program_id) REFERENCES partner_programs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE partner_program_applications (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  program_id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  status ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','WITHDRAWN') NOT NULL DEFAULT 'PENDING',
  message TEXT NULL,
  partner_snapshot JSON NULL,
  reviewed_by VARCHAR(190) NULL,
  reviewed_at DATETIME(0) NULL,
  review_reason TEXT NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_partner_program_application (program_id, partner_id),
  KEY idx_program_application_workspace_status (workspace_id, status, created_at),
  KEY idx_program_application_partner_status (partner_id, status, created_at),
  CONSTRAINT fk_program_application_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_program_application_program FOREIGN KEY (program_id) REFERENCES partner_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_program_application_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
