-- ================================================================
-- Newsletter subscribers (footer subscribe box)
-- ================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY,
  email        VARCHAR(255) NOT NULL,
  source       VARCHAR(64)  NULL,
  status       VARCHAR(16)  NOT NULL DEFAULT 'active',
  ip           VARCHAR(64)  NULL,
  user_agent   VARCHAR(512) NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
