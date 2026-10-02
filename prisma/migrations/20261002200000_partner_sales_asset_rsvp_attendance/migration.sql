ALTER TABLE commercial_distribution_items
  ADD COLUMN rsvp_required TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN rsvp_opens_at DATETIME(0) NULL,
  ADD COLUMN rsvp_closes_at DATETIME(0) NULL;

CREATE TABLE sales_asset_rsvps (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  asset_id CHAR(36) NOT NULL,
  issued_asset_id CHAR(36) NULL,
  attendee_name VARCHAR(190) NOT NULL,
  attendee_phone VARCHAR(40) NULL,
  attendee_email VARCHAR(190) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
  reserved_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME(0) NULL,
  checked_in_at DATETIME(0) NULL,
  checked_in_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  UNIQUE KEY uq_sales_asset_rsvp_issued_asset (issued_asset_id),
  KEY idx_sales_asset_rsvp_asset_status (workspace_id,asset_id,status),
  KEY idx_sales_asset_rsvp_phone (workspace_id,attendee_phone),
  CONSTRAINT fk_sales_asset_rsvp_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_sales_asset_rsvp_asset FOREIGN KEY(asset_id) REFERENCES commercial_distribution_items(id) ON DELETE RESTRICT,
  CONSTRAINT fk_sales_asset_rsvp_issued_asset FOREIGN KEY(issued_asset_id) REFERENCES issued_sales_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;