ALTER TABLE orders ADD COLUMN distribution_asset_id CHAR(36) NULL AFTER partner_id;
ALTER TABLE orders ADD KEY idx_orders_distribution_asset_created (distribution_asset_id,created_at);
ALTER TABLE orders ADD CONSTRAINT fk_orders_distribution_asset FOREIGN KEY (distribution_asset_id) REFERENCES commercial_distribution_items(id) ON DELETE SET NULL;
