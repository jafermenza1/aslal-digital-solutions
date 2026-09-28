CREATE TABLE catalog_search_events (
 id CHAR(36) NOT NULL,
 workspace_id CHAR(36) NOT NULL,
 visitor_id CHAR(36) NULL,
 telegram_chat_id VARCHAR(80) NULL,
 query_text VARCHAR(500) NOT NULL,
 source VARCHAR(40) NOT NULL DEFAULT 'WEB',
 locale VARCHAR(12) NULL,
 results_count INT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id),
 KEY idx_catalog_search_workspace_created(workspace_id,created_at),
 KEY idx_catalog_search_query(workspace_id,query_text),
 CONSTRAINT fk_catalog_search_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;