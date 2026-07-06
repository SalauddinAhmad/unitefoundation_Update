-- Dynamic public-form schemas managed from the admin dashboard.
CREATE TABLE IF NOT EXISTS form_schemas (
  form_key VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NULL,
  subtitle TEXT NULL,
  fields LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
