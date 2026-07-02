-- 005 — RBAC: add super_admin & moderator roles, promote first admin
-- Safe to run repeatedly.

ALTER TABLE users
  MODIFY COLUMN role ENUM('super_admin','admin','editor','moderator','viewer')
  NOT NULL DEFAULT 'viewer';

-- Promote the primary admin account to super_admin (only if still 'admin').
UPDATE users
   SET role = 'super_admin'
 WHERE email = 'admin@unitefoundation.bd'
   AND role = 'admin';

-- Fallback: if no super_admin exists yet, promote the oldest admin user.
UPDATE users u
  JOIN (
    SELECT id FROM users
     WHERE role = 'admin'
       AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin')
     ORDER BY created_at ASC
     LIMIT 1
  ) t ON t.id = u.id
   SET u.role = 'super_admin';
