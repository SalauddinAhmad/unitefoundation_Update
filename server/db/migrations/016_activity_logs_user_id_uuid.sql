-- ============================================================
-- 016_activity_logs_user_id_uuid.sql
-- Fix authenticated audit rows not saving when users.id is UUID.
-- Old activity_logs.user_id was INT, so non-login actions failed silently.
-- ============================================================

ALTER TABLE activity_logs
  MODIFY user_id CHAR(36) NULL;