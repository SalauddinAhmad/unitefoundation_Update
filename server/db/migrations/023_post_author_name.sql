-- Add editable author display name to blog posts
ALTER TABLE posts
  ADD COLUMN author_name VARCHAR(150) NULL AFTER author_id;
