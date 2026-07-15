-- Add view/read counter to blog posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS views INT UNSIGNED NOT NULL DEFAULT 0;
