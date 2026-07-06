-- ================================================================
-- Migration 010: সব ইমেজ কলাম LONGTEXT-এ কনভার্ট (base64 truncation ফিক্স)
-- phpMyAdmin → SQL ট্যাবে এই পুরো ফাইলটি রান করুন
-- ================================================================

-- Gallery
ALTER TABLE gallery_albums MODIFY COLUMN cover_url LONGTEXT;
ALTER TABLE gallery_items  MODIFY COLUMN url LONGTEXT NOT NULL;
ALTER TABLE gallery_items  MODIFY COLUMN thumb_url LONGTEXT;

-- Partners
ALTER TABLE partners MODIFY COLUMN logo_url LONGTEXT;
ALTER TABLE partners MODIFY COLUMN cover_url LONGTEXT;

-- আগের মাইগ্রেশন মিস হয়ে থাকলে (নিরাপদ — আবার চালালেও সমস্যা নেই)
ALTER TABLE posts        MODIFY COLUMN cover_image_url LONGTEXT;
ALTER TABLE projects     MODIFY COLUMN cover_image_url LONGTEXT;
ALTER TABLE team_members MODIFY COLUMN photo LONGTEXT;
