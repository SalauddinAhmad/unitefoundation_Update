-- Track whether the auto donation receipt email has been sent
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS receipt_sent TINYINT(1) NOT NULL DEFAULT 0;
