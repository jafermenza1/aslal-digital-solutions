-- Website Studio P1-P6 foundation: structured pages/media/navigation, publishing revisions,
-- translation workflow history, commercial presentation media, and growth-funnel attribution.
CREATE TABLE IF NOT EXISTS website_pages (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  title VARCHAR(250) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  draft_json LONGTEXT NULL,
  published_json LONGTEXT NULL,
  draft_version INT NOT NULL DEFAULT 1,
  published_version INT NULL,
  lock_version INT NOT NULL DEFAULT 1,
  scheduled_at DATETIME(0) NULL,
  published_at DATETIME(0) NULL,
  published_by VARCHAR(190) NULL,
  created_by VARCHAR(190) NULL,
  updated_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_website_pages_workspace_slug(workspace_id,slug),
  KEY idx_website_pages_workspace_status(workspace_id,status),
  CONSTRAINT fk_website_pages_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_page_revisions (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  page_id CHAR(36) NOT NULL,
  version INT NOT NULL,
  state VARCHAR(30) NOT NULL,
  content_json LONGTEXT NOT NULL,
  change_summary VARCHAR(500) NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_website_page_revision(page_id,version),
  KEY idx_website_page_revision_workspace(workspace_id,page_id,created_at),
  CONSTRAINT fk_website_page_revision_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_website_page_revision_page FOREIGN KEY(page_id) REFERENCES website_pages(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_media (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  media_type VARCHAR(30) NOT NULL,
  provider VARCHAR(30) NULL,
  url VARCHAR(1000) NOT NULL,
  thumbnail_url VARCHAR(1000) NULL,
  title VARCHAR(250) NULL,
  alt_text VARCHAR(500) NULL,
  metadata_json LONGTEXT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(190) NULL,
  updated_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  KEY idx_website_media_workspace(workspace_id,media_type,active),
  CONSTRAINT fk_website_media_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_navigation (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  location VARCHAR(40) NOT NULL,
  items_json LONGTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_by VARCHAR(190) NULL,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_website_navigation_workspace_location(workspace_id,location),
  CONSTRAINT fk_website_navigation_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS translation_history (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  translation_id CHAR(36) NOT NULL,
  locale VARCHAR(20) NOT NULL,
  translation_key VARCHAR(250) NOT NULL,
  previous_text TEXT NULL,
  new_text TEXT NULL,
  action VARCHAR(30) NOT NULL,
  actor_email VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  KEY idx_translation_history_workspace(workspace_id,translation_id,created_at),
  CONSTRAINT fk_translation_history_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE translation_entries
  ADD COLUMN review_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN reviewed_by VARCHAR(190) NULL,
  ADD COLUMN reviewed_at DATETIME(0) NULL;

CREATE TABLE IF NOT EXISTS commercial_web_presentations (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  target_type VARCHAR(30) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  presentation_json LONGTEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_by VARCHAR(190) NULL,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_commercial_web_presentation(workspace_id,target_type,target_id),
  KEY idx_commercial_web_presentation_workspace(workspace_id,target_type,active),
  CONSTRAINT fk_commercial_web_presentation_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_growth_events (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  visitor_id CHAR(36) NULL,
  content_key VARCHAR(250) NULL,
  page_path VARCHAR(250) NULL,
  cta_key VARCHAR(190) NULL,
  stage VARCHAR(40) NOT NULL,
  lead_id CHAR(36) NULL,
  commercial_request_id CHAR(36) NULL,
  quote_id CHAR(36) NULL,
  order_id CHAR(36) NULL,
  revenue_amount DECIMAL(15,2) NULL,
  currency VARCHAR(10) NULL,
  metadata_json LONGTEXT NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  KEY idx_website_growth_workspace_stage(workspace_id,stage,created_at),
  KEY idx_website_growth_content(workspace_id,content_key,created_at),
  KEY idx_website_growth_lead(workspace_id,lead_id),
  KEY idx_website_growth_request(workspace_id,commercial_request_id),
  CONSTRAINT fk_website_growth_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE search_profiles
  ADD COLUMN social_title VARCHAR(180) NULL,
  ADD COLUMN social_description VARCHAR(320) NULL,
  ADD COLUMN social_image_url VARCHAR(1000) NULL,
  ADD COLUMN social_type VARCHAR(40) NULL;

-- Existing live content remains live after migration; future edits can use the publishing layer.
INSERT INTO website_pages
(id,workspace_id,slug,title,status,draft_json,published_json,draft_version,published_version,lock_version)
SELECT UUID(),'00000000-0000-0000-0000-000000000001','/','Aslal Digital Solutions','PUBLISHED',
       JSON_OBJECT('blocks',JSON_ARRAY()),
       JSON_OBJECT('blocks',JSON_ARRAY()),
       1,1,1
WHERE NOT EXISTS (
  SELECT 1 FROM website_pages WHERE workspace_id='00000000-0000-0000-0000-000000000001' AND slug='/'
);
