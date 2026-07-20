-- ================================================================
-- Admin-editable email templates (subject + slot texts)
-- The `data` column holds JSON: {"subject": "...", "slots": {...}}
-- Rows are optional — missing rows fall back to hard-coded defaults
-- in server/services/emailTemplateDefaults.js.
-- ================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  `key`       VARCHAR(64)  NOT NULL PRIMARY KEY,
  `data`      LONGTEXT     NOT NULL,
  `updated_by` VARCHAR(128) NULL,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
