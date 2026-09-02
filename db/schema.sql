CREATE TABLE IF NOT EXISTS visitors (
  id CHAR(36) PRIMARY KEY,
  anonymous_id CHAR(36) NOT NULL UNIQUE,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  first_source VARCHAR(100) NULL,
  first_medium VARCHAR(100) NULL,
  first_campaign VARCHAR(150) NULL,
  first_referral_code VARCHAR(100) NULL,
  INDEX idx_visitors_last_seen (last_seen_at),
  INDEX idx_visitors_referral (first_referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id CHAR(36) PRIMARY KEY,
  visitor_id CHAR(36) NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(40) NULL,
  company VARCHAR(190) NULL,
  business_type VARCHAR(100) NULL,
  message TEXT NULL,
  status ENUM('NEW','CONTACTED','QUALIFIED','DEMO','PROPOSAL','NEGOTIATION','WON','LOST') NOT NULL DEFAULT 'NEW',
  score INT NOT NULL DEFAULT 0,
  source VARCHAR(100) NULL,
  medium VARCHAR(100) NULL,
  campaign VARCHAR(150) NULL,
  referral_code VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_status (status),
  INDEX idx_leads_score (score),
  INDEX idx_leads_created (created_at),
  INDEX idx_leads_referral (referral_code),
  CONSTRAINT fk_leads_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visitor_id CHAR(36) NULL,
  event_name VARCHAR(100) NOT NULL,
  page_path VARCHAR(500) NULL,
  product_slug VARCHAR(160) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_visitor (visitor_id),
  INDEX idx_events_name (event_name),
  INDEX idx_events_product (product_slug),
  INDEX idx_events_created (created_at),
  CONSTRAINT fk_events_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partners (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NULL,
  type ENUM('AGENT','INFLUENCER','AFFILIATE','RESELLER') NOT NULL DEFAULT 'AGENT',
  status ENUM('ACTIVE','PAUSED','PENDING') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_partners_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referral_links (
  id CHAR(36) PRIMARY KEY,
  partner_id CHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  campaign VARCHAR(150) NULL,
  product_slug VARCHAR(160) NULL,
  destination_path VARCHAR(500) NOT NULL DEFAULT '/',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referral_partner (partner_id),
  CONSTRAINT fk_referral_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referral_clicks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referral_link_id CHAR(36) NOT NULL,
  visitor_id CHAR(36) NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_click_link (referral_link_id),
  INDEX idx_click_visitor (visitor_id),
  CONSTRAINT fk_click_link FOREIGN KEY (referral_link_id) REFERENCES referral_links(id) ON DELETE CASCADE,
  CONSTRAINT fk_click_visitor FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  provider_name VARCHAR(190) NULL,
  relationship_type ENUM('OWNED','AFFILIATE','RESELLER','IMPLEMENTATION_PARTNER','CUSTOM') NOT NULL DEFAULT 'OWNED',
  short_description VARCHAR(500) NOT NULL,
  description TEXT NULL,
  starting_price VARCHAR(100) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_featured (featured),
  INDEX idx_products_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commissions (
  id CHAR(36) PRIMARY KEY,
  partner_id CHAR(36) NOT NULL,
  lead_id CHAR(36) NULL,
  referral_link_id CHAR(36) NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  status ENUM('PENDING','QUALIFIED','APPROVED','PAYABLE','PAID','VOID') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_commission_partner (partner_id),
  INDEX idx_commission_status (status),
  CONSTRAINT fk_commission_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  CONSTRAINT fk_commission_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_commission_link FOREIGN KEY (referral_link_id) REFERENCES referral_links(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
