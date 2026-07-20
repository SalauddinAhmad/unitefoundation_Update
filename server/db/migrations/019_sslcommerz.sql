-- SSLCommerz payment fields on donations
ALTER TABLE donations
  MODIFY COLUMN status ENUM('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending';

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS val_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS bank_tran_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS card_type VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NULL DEFAULT 'BDT',
  ADD COLUMN IF NOT EXISTS raw_response LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(190) NULL;

CREATE INDEX IF NOT EXISTS idx_donations_val_id ON donations (val_id);
