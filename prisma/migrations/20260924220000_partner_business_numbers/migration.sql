ALTER TABLE partners ADD COLUMN partner_number VARCHAR(30) NULL;

UPDATE partners AS p
JOIN (
  SELECT
    id,
    CONCAT(
      'ASL-',
      LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id) + 100, 3, '0'),
      '-',
      YEAR(created_at)
    ) AS partner_number
  FROM partners
) AS numbered
  ON numbered.id = p.id
SET p.partner_number = numbered.partner_number;

ALTER TABLE partners MODIFY partner_number VARCHAR(30) NOT NULL, ADD UNIQUE KEY uq_partners_partner_number (partner_number);
