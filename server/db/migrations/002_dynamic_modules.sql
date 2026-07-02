-- ================================================================
-- Migration 002: Dynamic Modules (Partners, Projects extensions, Impact)
-- Run via phpMyAdmin → SQL tab → paste → Go
-- Safe to run once. If a column/table already exists, skip that error.
-- No existing data will be deleted.
-- ================================================================
SET NAMES utf8mb4;

-- ----------------------------------------------------------------
-- 1) Partners (নতুন টেবিল)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partners (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  tagline VARCHAR(500),
  description TEXT,
  content LONGTEXT,               -- Full rich content (JSON: activities, programs, gallery, etc.)
  website VARCHAR(500),
  category VARCHAR(100),
  theme VARCHAR(30) DEFAULT 'green',
  established VARCHAR(50),
  address TEXT,
  phone VARCHAR(50),
  sort_order INT DEFAULT 0,
  status ENUM('active','draft') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_sort (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- 2) Projects — extra fields for UI parity
-- If a column already exists, MySQL will return an error for that line only;
-- just skip that line and continue with the rest.
-- ----------------------------------------------------------------
ALTER TABLE projects ADD COLUMN target DECIMAL(14,2) DEFAULT 0 AFTER budget;
ALTER TABLE projects ADD COLUMN donors INT DEFAULT 0 AFTER beneficiaries;
ALTER TABLE projects ADD COLUMN location VARCHAR(200) AFTER donors;
ALTER TABLE projects ADD COLUMN urgent TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
ALTER TABLE projects ADD COLUMN gallery JSON NULL AFTER cover_image_url;
ALTER TABLE projects ADD COLUMN short_description TEXT AFTER description;

-- Backfill target from budget if target is 0
UPDATE projects SET target = budget WHERE (target IS NULL OR target = 0) AND budget > 0;

-- ----------------------------------------------------------------
-- 3) Gallery — YouTube/video URL support (kind already ENUM('image','video'))
-- No schema change needed; just document.
-- ----------------------------------------------------------------

-- ----------------------------------------------------------------
-- 4) Impact Stats — stored inside settings.data JSON as `impact_stats`
-- Seed default value if not present.
-- ----------------------------------------------------------------
UPDATE settings
SET data = JSON_SET(
  data,
  '$.impact_stats',
  JSON_ARRAY(
    JSON_OBJECT('value', 248000, 'label', 'মানুষকে সাহায্য', 'suffix', '+'),
    JSON_OBJECT('value', 1280,   'label', 'প্রকল্প সম্পন্ন', 'suffix', '+'),
    JSON_OBJECT('value', 3450,   'label', 'স্বেচ্ছাসেবক', 'suffix', ''),
    JSON_OBJECT('value', 14,     'label', 'দেশে কার্যক্রম', 'suffix', '')
  )
)
WHERE id = 1 AND JSON_EXTRACT(data, '$.impact_stats') IS NULL;
