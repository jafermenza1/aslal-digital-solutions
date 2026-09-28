CREATE TABLE website_settings (
  id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL,
  site_name VARCHAR(190) NOT NULL DEFAULT 'Aslal Digital Solutions',
  logo_light_url VARCHAR(500) NULL, logo_dark_url VARCHAR(500) NULL,
  favicon_light_url VARCHAR(500) NULL, favicon_dark_url VARCHAR(500) NULL,
  header_enabled TINYINT(1) NOT NULL DEFAULT 1, footer_enabled TINYINT(1) NOT NULL DEFAULT 1,
  header_json LONGTEXT NULL, footer_json LONGTEXT NULL, theme_json LONGTEXT NULL,
  updated_by VARCHAR(190) NULL, created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_website_settings_workspace (workspace_id), KEY idx_website_settings_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE translation_entries (
  id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, surface VARCHAR(20) NOT NULL, locale VARCHAR(20) NOT NULL,
  translation_key VARCHAR(250) NOT NULL, label VARCHAR(250) NOT NULL, original_text TEXT NOT NULL, translated_text TEXT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1, updated_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_translation_workspace_surface_locale_key (workspace_id,surface,locale,translation_key),
  KEY idx_translation_workspace_locale (workspace_id,locale,surface)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;