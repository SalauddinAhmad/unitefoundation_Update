-- ============================================================
-- 007_activity_logs.sql
-- Audit / activity log for the admin dashboard.
-- Super Admin can view who did what, when, from where.
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     CHAR(36) NULL,
  user_email  VARCHAR(191) NULL,
  user_name   VARCHAR(191) NULL,
  user_role   VARCHAR(32)  NULL,
  action      VARCHAR(64)  NOT NULL,          -- create | update | delete | login | logout | password_change | role_change | export | other
  entity      VARCHAR(64)  NOT NULL,          -- posts | projects | donations | settings | admins | messages | ...
  entity_id   VARCHAR(64)  NULL,
  method      VARCHAR(8)   NULL,              -- HTTP verb
  path        VARCHAR(255) NULL,
  status      SMALLINT     NULL,              -- HTTP status
  ip          VARCHAR(64)  NULL,
  user_agent  VARCHAR(255) NULL,
  summary     VARCHAR(500) NULL,              -- short human message (Bangla or English)
  meta        JSON         NULL,              -- extra structured details
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_created (created_at),
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_entity (entity, entity_id),
  INDEX idx_activity_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
