-- Visitor counter (daily aggregate, no PII)
CREATE TABLE IF NOT EXISTS visitor_stats (
  day DATE PRIMARY KEY,
  visits INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
