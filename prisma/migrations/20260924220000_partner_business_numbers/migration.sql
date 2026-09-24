ALTER TABLE partners ADD COLUMN partner_number VARCHAR(30) NULL;
UPDATE partners SET partner_number = CONCAT('ASL-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id) + 100, 3, '0'), '-', YEAR(created_at));
ALTER TABLE partners MODIFY partner_number VARCHAR(30) NOT NULL, ADD UNIQUE KEY uq_partners_partner_number (partner_number);
