-- ================================================================
-- Media Library — WordPress-style central image repository.
-- All admin image uploads (blog covers, project covers, team photos,
-- partner logos, gallery, settings hero, inline editor images…)
-- can be picked from or added to this table.
-- ================================================================
CREATE TABLE IF NOT EXISTS media_library (
  id CHAR(36) PRIMARY KEY,
  url LONGTEXT NOT NULL,          -- full-size data URI (or absolute URL)
  thumb_url LONGTEXT,             -- ~320px thumbnail data URI for grid view
  filename VARCHAR(255),
  mime VARCHAR(60),
  size_bytes INT DEFAULT 0,
  width INT DEFAULT 0,
  height INT DEFAULT 0,
  uploaded_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
