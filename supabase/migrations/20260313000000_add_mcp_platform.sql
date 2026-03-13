-- Add 'mcp' to the agent_platform CHECK constraint for MCP server tracking

ALTER TABLE ranked_projects DROP CONSTRAINT ranked_projects_agent_platform_check;

ALTER TABLE ranked_projects ADD CONSTRAINT ranked_projects_agent_platform_check
  CHECK (agent_platform IN ('claude-code', 'openclaw', 'codex', 'gemini', 'mcp', 'other'));
