-- ================================================================
-- Unite Foundation — MySQL Schema
-- Import via cPanel → phpMyAdmin → Database `unitefdn_main` → Import
-- ================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Users (admin/editor/viewer)
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','editor','moderator','viewer') NOT NULL DEFAULT 'viewer',
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets
CREATE TABLE IF NOT EXISTS password_resets (
  token VARCHAR(64) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2FA OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  code CHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(190),
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('bkash','nagad','rocket','bank','card','sslcommerz') NOT NULL,
  area VARCHAR(150),
  transaction_id VARCHAR(100),
  status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications (volunteer/member/career/donor)
CREATE TABLE IF NOT EXISTS applications (
  id CHAR(36) PRIMARY KEY,
  kind ENUM('volunteer','member','career','donor') NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(190),
  address TEXT,
  profession VARCHAR(150),
  message TEXT,
  extra JSON,
  status ENUM('new','reviewing','approved','rejected') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind_status (kind, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  content LONGTEXT,
  budget DECIMAL(14,2) DEFAULT 0,
  raised DECIMAL(14,2) DEFAULT 0,
  beneficiaries INT DEFAULT 0,
  status ENUM('active','completed','draft') NOT NULL DEFAULT 'draft',
  cover_image_url LONGTEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog posts
CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  cover_image_url LONGTEXT,
  category VARCHAR(100),
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  author_id CHAR(36),
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery
CREATE TABLE IF NOT EXISTS gallery_albums (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  cover_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_items (
  id CHAR(36) PRIMARY KEY,
  album_id CHAR(36),
  kind ENUM('image','video') NOT NULL DEFAULT 'image',
  title VARCHAR(200),
  url TEXT NOT NULL,
  thumb_url TEXT,
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages
CREATE TABLE IF NOT EXISTS messages (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30),
  subject VARCHAR(255),
  body TEXT NOT NULL,
  status ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_replies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  message_id CHAR(36) NULL,
  to_email VARCHAR(190) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team
CREATE TABLE IF NOT EXISTS team_members (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(150) NOT NULL,
  bio TEXT,
  photo TEXT,
  facebook VARCHAR(255),
  linkedin VARCHAR(255),
  email VARCHAR(190),
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings (single row: id=1)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default settings row
INSERT INTO settings (id, data) VALUES (1, JSON_OBJECT(
  'organization', JSON_OBJECT(
    'name','ইউনাইট ফাউন্ডেশন',
    'tagline','সুন্নাহর অনুসরণে, মানবতার কল্যাণে।',
    'email','info@unitefoundation.bd',
    'phone','+880 1759-754265',
    'website','https://unitefoundation.bd',
    'address','উত্তরখান, উত্তরা, ঢাকা ১২৩০।',
    'registration_no','S-12345/2024'
  ),
  'payments', JSON_OBJECT(
    'bkash','01759-754265','nagad','01759-754265','rocket','01759-754265-1',
    'bank_name','Islami Bank Bangladesh Ltd.','bank_account','20502070205708118',
    'sslcommerz_store_id','unitefoundation'
  ),
  'socials', JSON_OBJECT(
    'facebook','https://www.facebook.com/UniteFoundation.UniteTv',
    'youtube','https://youtube.com/@unite.foundation',
    'instagram','','twitter',''
  )
)) ON DUPLICATE KEY UPDATE id=id;

SET FOREIGN_KEY_CHECKS=1;
