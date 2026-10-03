-- S02: canonical campaign delivery/service-area configuration.
-- Replace free-text campaign location with controlled online/offline/hybrid
-- delivery plus workspace-scoped city/event options.

ALTER TABLE partner_campaigns
  ADD COLUMN delivery_mode ENUM('ONLINE','OFFLINE','HYBRID') NOT NULL DEFAULT 'ONLINE' AFTER target_description,
  ADD INDEX idx_partner_campaign_delivery_mode (delivery_mode);

CREATE TABLE campaign_service_area_options (
  id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  area_type ENUM('CITY','EVENT') NOT NULL,
  name VARCHAR(190) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(190) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campaign_service_area_option (workspace_id, area_type, name),
  KEY idx_campaign_service_area_option_workspace_active (workspace_id, active, area_type),
  CONSTRAINT fk_campaign_service_area_option_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partner_campaign_service_areas (
  campaign_id CHAR(36) NOT NULL,
  service_area_id CHAR(36) NOT NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (campaign_id, service_area_id),
  KEY idx_campaign_service_area_campaign (campaign_id),
  KEY idx_campaign_service_area_option (service_area_id),
  CONSTRAINT fk_partner_campaign_service_area_campaign
    FOREIGN KEY (campaign_id) REFERENCES partner_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_partner_campaign_service_area_option
    FOREIGN KEY (service_area_id) REFERENCES campaign_service_area_options(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
