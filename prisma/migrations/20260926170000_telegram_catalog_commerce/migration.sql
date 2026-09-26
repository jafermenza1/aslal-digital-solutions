ALTER TABLE products
  ADD COLUMN media_urls TEXT NULL,
  ADD COLUMN specifications JSON NULL;

ALTER TABLE resources
  ADD COLUMN media_urls TEXT NULL,
  ADD COLUMN specifications JSON NULL;
