-- Add profile avatar for dashboard users
ALTER TABLE users
  ADD COLUMN avatar LONGTEXT NULL AFTER email;
