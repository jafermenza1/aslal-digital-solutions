ALTER TABLE products
  ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General',
  ADD COLUMN stock_quantity INT NULL,
  ADD INDEX idx_products_category_active (category, active);

