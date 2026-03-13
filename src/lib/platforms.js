export const PLATFORMS = {
  all: {
    label: 'All',
    emoji: '\u{1F3C6}',
    color: '#FFB830',
    description: 'All AI-assisted projects',
  },
  'claude-code': {
    label: 'Claude Code',
    emoji: '\u{1F916}',
    color: '#FF8C42',
    description: 'Built with Anthropic Claude Code',
  },
  openclaw: {
    label: 'OpenClaw',
    emoji: '\u{1F99E}',
    color: '#E84545',
    description: 'Built with OpenClaw',
  },
  codex: {
    label: 'Codex',
    emoji: '\u26A1',
    color: '#10A37F',
    description: 'Built with OpenAI Codex CLI',
  },
  mcp: {
    label: 'MCP Servers',
    emoji: '\u{1F50C}',
    color: '#8B5CF6',
    description: 'Model Context Protocol servers',
  },
}

export const AGENT_TABS = ['all', 'claude-code', 'openclaw', 'codex']
export const EXTRA_TABS = ['mcp']
export const PLATFORM_ORDER = [...AGENT_TABS, ...EXTRA_TABS]
