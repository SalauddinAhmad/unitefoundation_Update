-- Extra editable copy + banner for each dynamic public form
-- (intro text, bullet list, quote, stats, banner image/video).
ALTER TABLE form_schemas ADD COLUMN IF NOT EXISTS extras LONGTEXT NULL;
