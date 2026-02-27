-- ShipRanked — Supabase Schema
-- Run this in the Supabase SQL Editor after creating a new project.

-- Core projects table
CREATE TABLE ranked_projects (
  id              TEXT PRIMARY KEY,        -- "github:owner/repo"
  name            TEXT NOT NULL,
  full_name       TEXT NOT NULL,           -- "owner/repo"
  description     TEXT,
  url             TEXT NOT NULL,           -- https://github.com/owner/repo
  builder_handle  TEXT,                    -- GitHub username
  avatar_url      TEXT,
  category        TEXT DEFAULT 'tools',    -- tools|games|ai-apps|dev-utilities|fun
  stars_total     INTEGER DEFAULT 0,
  stars_gained_7d INTEGER DEFAULT 0,
  rank            INTEGER,
  rank_delta      INTEGER DEFAULT 0,       -- positive = moved up
  is_new          BOOLEAN DEFAULT false,   -- first time on chart
  claude_signal   TEXT,                    -- 'claude-md' | 'topic-claude-code' | 'topic-vibe-coding'
  last_fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Daily snapshots for delta calculation
CREATE TABLE ranked_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT REFERENCES ranked_projects(id),
  stars_total INTEGER NOT NULL,
  rank        INTEGER,
  captured_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX idx_ranked_projects_rank ON ranked_projects(rank ASC);
CREATE INDEX idx_ranked_snapshots_project_date ON ranked_snapshots(project_id, captured_at DESC);

-- Row-level security: public anon key can only SELECT from projects
ALTER TABLE ranked_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON ranked_projects FOR SELECT TO anon USING (true);

ALTER TABLE ranked_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read snapshots" ON ranked_snapshots FOR SELECT TO anon USING (true);
