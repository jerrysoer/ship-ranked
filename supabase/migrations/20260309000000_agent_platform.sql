-- PRD3: Add agent_platform column for multi-platform support

ALTER TABLE ranked_projects
  ADD COLUMN agent_platform TEXT NOT NULL DEFAULT 'claude-code'
  CHECK (agent_platform IN ('claude-code', 'openclaw', 'codex', 'gemini', 'other'));

UPDATE ranked_projects SET agent_platform = 'claude-code';

CREATE INDEX idx_projects_platform
  ON ranked_projects(agent_platform, review_status, stars_gained_7d DESC);
