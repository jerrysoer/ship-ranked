-- Growth Layer: Phase 1-3 schema changes
-- Adds safety scanning, README parsing, and content draft support

-- New columns on ranked_projects
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'approved';
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS safety_flags JSONB DEFAULT '[]';
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS readme_summary TEXT;
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS claude_summary TEXT;
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS builder_x_handle TEXT;
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS starred_by_shipranked BOOLEAN DEFAULT false;
ALTER TABLE ranked_projects ADD COLUMN IF NOT EXISTS account_age_days INTEGER;

CREATE INDEX IF NOT EXISTS idx_ranked_projects_review ON ranked_projects(review_status);

-- Weekly content drafts table (X threads, Reddit posts)
CREATE TABLE IF NOT EXISTS weekly_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        TEXT NOT NULL,
  subreddit       TEXT,
  suggested_title TEXT,
  content         TEXT NOT NULL,
  week_start      DATE NOT NULL,
  posted          BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weekly_drafts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weekly_drafts' AND policyname = 'Service role only'
  ) THEN
    CREATE POLICY "Service role only" ON weekly_drafts FOR ALL TO authenticated USING (true);
  END IF;
END $$;
