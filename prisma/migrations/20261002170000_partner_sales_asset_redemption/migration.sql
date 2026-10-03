-- P3: append-only redemption history for Partner Sales Assets.
CREATE TABLE issued_sales_asset_redemptions (
  id CHAR(36) NOT NULL, workspace_id CHAR(36) NOT NULL, issued_asset_id CHAR(36) NOT NULL,
  serial_number VARCHAR(50) NOT NULL, asset_id CHAR(36) NOT NULL, allocation_id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL, order_id CHAR(36) NULL, redeemed_by VARCHAR(190) NOT NULL,
  redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, redemption_method ENUM('QR','SERIAL') NOT NULL,
  verification_payload VARCHAR(500) NULL, holder_name VARCHAR(190) NULL, holder_phone VARCHAR(40) NULL,
  asset_status_before VARCHAR(20) NOT NULL, valid_from DATETIME NULL, valid_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id),
  UNIQUE KEY uq_asset_redemption_once (issued_asset_id),
  KEY idx_asset_redemption_workspace_date (workspace_id, redeemed_at),
  KEY idx_asset_redemption_serial (workspace_id, serial_number),
  KEY idx_asset_redemption_partner_date (workspace_id, partner_id, redeemed_at),
  CONSTRAINT fk_asset_redemption_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asset_redemption_asset FOREIGN KEY (issued_asset_id) REFERENCES issued_sales_assets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TRIGGER trg_issued_asset_redemption_no_update
BEFORE UPDATE ON issued_sales_asset_redemptions
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Redemption history is immutable';

CREATE TRIGGER trg_issued_asset_redemption_no_delete
BEFORE DELETE ON issued_sales_asset_redemptions
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Redemption history is immutable';
