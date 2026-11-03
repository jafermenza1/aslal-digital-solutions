ALTER TABLE public_content
  ADD COLUMN draft_value TEXT NULL,
  ADD COLUMN draft_rich_html LONGTEXT NULL,
  ADD COLUMN published_value TEXT NULL,
  ADD COLUMN published_rich_html LONGTEXT NULL,
  ADD COLUMN publication_status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN draft_version INT NOT NULL DEFAULT 1,
  ADD COLUMN published_version INT NOT NULL DEFAULT 1,
  ADD COLUMN lock_version INT NOT NULL DEFAULT 1,
  ADD COLUMN scheduled_at DATETIME(0) NULL,
  ADD COLUMN published_at DATETIME(0) NULL,
  ADD COLUMN published_by VARCHAR(190) NULL;

UPDATE public_content
SET draft_value=value,
    draft_rich_html=rich_html,
    published_value=value,
    published_rich_html=rich_html,
    publication_status=CASE WHEN active=1 THEN 'PUBLISHED' ELSE 'DRAFT' END,
    draft_version=1,
    published_version=1,
    lock_version=1,
    published_at=CASE WHEN active=1 THEN CURRENT_TIMESTAMP ELSE NULL END
WHERE draft_value IS NULL;

CREATE TABLE public_content_revisions (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  content_id CHAR(36) NOT NULL,
  version INT NOT NULL,
  state VARCHAR(30) NOT NULL,
  value TEXT NOT NULL,
  rich_html LONGTEXT NULL,
  format VARCHAR(20) NOT NULL,
  font_family VARCHAR(120) NOT NULL,
  font_size DECIMAL(6,2) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  change_summary VARCHAR(500) NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_public_content_revision(content_id,version),
  KEY idx_public_content_revision_workspace(workspace_id,content_id,created_at),
  CONSTRAINT fk_public_content_revision_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_public_content_revision_content FOREIGN KEY(content_id) REFERENCES public_content(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO public_content_revisions
(id,workspace_id,content_id,version,state,value,rich_html,format,font_family,font_size,active,change_summary,created_by)
SELECT UUID(),workspace_id,id,1,'PUBLISHED',published_value,published_rich_html,format,font_family,font_size,active,'Initial published snapshot',updated_by
FROM public_content
WHERE NOT EXISTS (SELECT 1 FROM public_content_revisions r WHERE r.content_id=public_content.id);
