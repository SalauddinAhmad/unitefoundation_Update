-- ================================================================
-- Settings.data → LONGTEXT
-- The column was originally TEXT (65 KB), so large payloads such as
-- base64-encoded hero slide images were silently truncated at the
-- 65 535-byte boundary. That broke the "pick image from media
-- library → save settings" flow (image never persisted on the server).
-- LONGTEXT allows up to 4 GB and matches what the rest of the schema
-- already uses for image-bearing tables (see 010_all_images_longtext).
-- ================================================================
ALTER TABLE settings MODIFY COLUMN data LONGTEXT NOT NULL;
