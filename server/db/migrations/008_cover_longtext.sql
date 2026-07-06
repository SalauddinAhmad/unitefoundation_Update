-- Cover image URLs are stored as base64 data URIs which can easily exceed
-- the 65 KB TEXT limit. Widen to LONGTEXT so uploads don't get truncated.
ALTER TABLE posts    MODIFY COLUMN cover_image_url LONGTEXT;
ALTER TABLE projects MODIFY COLUMN cover_image_url LONGTEXT;
