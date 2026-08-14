-- Persistent, single-worker newsletter queue for shared hosting.
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY,
  subject      VARCHAR(200) NOT NULL,
  html         LONGTEXT     NOT NULL,
  status       VARCHAR(16)  NOT NULL DEFAULT 'queued',
  total_count  INT UNSIGNED NOT NULL DEFAULT 0,
  sent_count   INT UNSIGNED NOT NULL DEFAULT 0,
  failed_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP    NULL,
  INDEX idx_campaign_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_queue (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  campaign_id  VARCHAR(36)     NOT NULL,
  email        VARCHAR(255)    NOT NULL,
  status       VARCHAR(16)     NOT NULL DEFAULT 'pending',
  attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error   VARCHAR(500)    NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP       NULL,
  UNIQUE KEY uniq_campaign_email (campaign_id, email),
  INDEX idx_queue_next (status, id),
  CONSTRAINT fk_newsletter_queue_campaign
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;