CREATE TABLE intelligence_sources (
 id CHAR(36) NOT NULL,
 workspace_id CHAR(36) NOT NULL,
 source_key VARCHAR(60) NOT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 status VARCHAR(30) NOT NULL DEFAULT 'NOT_CONNECTED',
 config_json LONGTEXT NULL,
 last_synced_at DATETIME NULL,
 last_error TEXT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id),
 UNIQUE KEY uq_intelligence_source(workspace_id,source_key),
 CONSTRAINT fk_intelligence_source_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE intelligence_terms (
 id CHAR(36) NOT NULL,
 workspace_id CHAR(36) NOT NULL,
 source_key VARCHAR(60) NOT NULL,
 term VARCHAR(500) NOT NULL,
 country_code CHAR(3) NULL,
 language_code VARCHAR(12) NULL,
 metric_value DECIMAL(18,4) NULL,
 metric_name VARCHAR(80) NULL,
 source_url VARCHAR(1000) NULL,
 observed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id),
 KEY idx_intelligence_terms_workspace_source(workspace_id,source_key,observed_at),
 KEY idx_intelligence_terms_term(workspace_id,term(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;