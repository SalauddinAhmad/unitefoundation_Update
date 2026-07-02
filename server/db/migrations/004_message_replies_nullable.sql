-- Allow message_replies.message_id to be NULL (for admin-composed outbound emails
-- that are not tied to an incoming contact-form message).
ALTER TABLE message_replies MODIFY message_id CHAR(36) NULL;

-- Rebuild FK to SET NULL on delete instead of CASCADE
SET @fk := (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='message_replies'
              AND COLUMN_NAME='message_id' AND REFERENCED_TABLE_NAME='messages' LIMIT 1);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE message_replies DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE message_replies
  ADD CONSTRAINT fk_message_replies_message
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL;
