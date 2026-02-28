-- Remove duplicate snapshots (keep latest per project+date)
DELETE FROM ranked_snapshots a
USING ranked_snapshots b
WHERE a.project_id = b.project_id
  AND a.captured_at = b.captured_at
  AND a.id < b.id;

-- Prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_ranked_snapshots_unique
  ON ranked_snapshots(project_id, captured_at);
