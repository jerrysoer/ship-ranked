-- Add is_mcp_server boolean flag for non-exclusive MCP server classification.
-- A project can be both "built with Claude Code" AND "an MCP server."

ALTER TABLE ranked_projects
  ADD COLUMN is_mcp_server BOOLEAN NOT NULL DEFAULT false;

-- Partial index: only index rows where is_mcp_server = true (sparse)
CREATE INDEX idx_projects_mcp ON ranked_projects(is_mcp_server)
  WHERE is_mcp_server = true;
