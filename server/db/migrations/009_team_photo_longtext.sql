-- Team member photos are stored as base64 data URIs which can exceed the
-- 65 KB TEXT limit, causing MySQL to silently truncate the image (visible
-- as the bottom half rendering as solid green in the browser). Widen to
-- LONGTEXT so uploaded team photos are stored intact.
ALTER TABLE team_members MODIFY COLUMN photo LONGTEXT;
