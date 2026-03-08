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
  // gemini: reserved, not rendered in Phase 1
}

export const PLATFORM_ORDER = ['all', 'claude-code', 'openclaw', 'codex']
