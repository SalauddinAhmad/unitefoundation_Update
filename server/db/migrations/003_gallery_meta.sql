-- Extend gallery tables with metadata needed by dashboard
-- Safe to run multiple times: uses IF NOT EXISTS-style guards where possible.

ALTER TABLE gallery_albums
  ADD COLUMN description TEXT NULL,
  ADD COLUMN category VARCHAR(100) NULL,
  ADD COLUMN status ENUM('published','draft','archived') NOT NULL DEFAULT 'published',
  ADD COLUMN date DATE NULL,
  ADD COLUMN location VARCHAR(200) NULL,
  ADD COLUMN tags JSON NULL,
  ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE gallery_items
  ADD COLUMN caption VARCHAR(500) NULL,
  ADD COLUMN youtube_id VARCHAR(20) NULL,
  ADD COLUMN duration VARCHAR(20) NULL;
