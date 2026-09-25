ALTER TABLE partners
  ADD COLUMN telegram_chat_id VARCHAR(80) NULL,
  ADD COLUMN telegram_link_token VARCHAR(100) NULL,
  ADD COLUMN telegram_linked_at DATETIME NULL;

CREATE UNIQUE INDEX uq_partners_telegram_chat_id ON partners (telegram_chat_id);
CREATE UNIQUE INDEX uq_partners_telegram_link_token ON partners (telegram_link_token);
