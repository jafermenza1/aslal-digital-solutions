CREATE TABLE campaign_assets (
  id CHAR(36) NOT NULL,
  campaign_id CHAR(36) NOT NULL,
  name VARCHAR(190) NOT NULL,
  type ENUM('CREATIVE','COPY','PRICE_SHEET','QR','POSTER','LINK') NOT NULL,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  description TEXT NULL,
  content TEXT NULL,
  asset_url VARCHAR(1000) NULL,
  placement VARCHAR(190) NULL,
  tracking_code VARCHAR(190) NULL,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_campaign_assets_campaign_status_type (campaign_id,status,type),
  KEY idx_campaign_assets_tracking_code (tracking_code),
  CONSTRAINT fk_campaign_assets_campaign FOREIGN KEY (campaign_id) REFERENCES partner_campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB;
