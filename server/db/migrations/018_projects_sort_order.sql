-- Add sort_order for manual project ordering
ALTER TABLE projects ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
CREATE INDEX idx_projects_sort ON projects (sort_order);
