CREATE TABLE partner_identities (
  id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(40) NULL,
  created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partner_identity_email (email),
  KEY idx_partner_identity_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE partners ADD COLUMN identity_id CHAR(36) NULL AFTER id, ADD KEY idx_partners_identity (identity_id);
INSERT INTO partner_identities (id,name,email,phone,created_at,updated_at)
SELECT id,name,email,phone,created_at,created_at FROM partners;
UPDATE partners p SET identity_id=p.id;
ALTER TABLE partners ADD CONSTRAINT fk_partner_identity FOREIGN KEY (identity_id) REFERENCES partner_identities(id) ON DELETE SET NULL;
