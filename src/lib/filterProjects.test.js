import { describe, it, expect } from 'vitest'
import { filterProjects } from './filterProjects'

// ─── Test data factories ──────────────────────────────────────────────────────

const makeProject = (overrides = {}) => ({
  name: 'project',
  full_name: 'user/project',
  description: 'A test project',
  agent_platform: 'claude-code',
  stars_total: 500,
  stars_gained_7d: 10,
  rank: 99, // server-assigned rank (may have gaps)
  rank_delta: 0,
  is_new: false,
  ...overrides,
})

const defaults = { platform: 'all', sortBy: 'stars', showNewOnly: false, smallOnly: false, search: '' }

// ─── Rank gap fix (core regression) ───────────────────────────────────────────

describe('re-ranking (rank gap fix)', () => {
  it('assigns contiguous 1-based ranks on unfiltered "all" view', () => {
    const projects = [
      makeProject({ name: 'a', rank: 4 }),
      makeProject({ name: 'b', rank: 5 }),
      makeProject({ name: 'c', rank: 6 }),
    ]
    const result = filterProjects(projects, defaults)
    expect(result.map(p => p.rank)).toEqual([1, 2, 3])
  })

  it('re-ranks after platform filter (Claude Code #7 globally → #1 in tab)', () => {
    const projects = [
      makeProject({ name: 'a', rank: 3, agent_platform: 'claude-code' }),
      makeProject({ name: 'b', rank: 7, agent_platform: 'claude-code' }),
      makeProject({ name: 'c', rank: 12, agent_platform: 'claude-code' }),
    ]
    const result = filterProjects(projects, { ...defaults, platform: 'claude-code' })
    expect(result.map(p => p.rank)).toEqual([1, 2, 3])
  })

  it('re-ranks search results', () => {
    const projects = [
      makeProject({ name: 'alpha', rank: 1 }),
      makeProject({ name: 'beta', rank: 2 }),
      makeProject({ name: 'alpha-two', rank: 3 }),
    ]
    const result = filterProjects(projects, { ...defaults, search: 'alpha' })
    expect(result).toHaveLength(2)
    expect(result.map(p => p.rank)).toEqual([1, 2])
  })

  it('preserves rank_delta from the cron (not overwritten)', () => {
    const projects = [
      makeProject({ name: 'a', rank: 5, rank_delta: 3 }),
      makeProject({ name: 'b', rank: 8, rank_delta: -2 }),
    ]
    const result = filterProjects(projects, defaults)
    expect(result[0].rank_delta).toBe(3)
    expect(result[1].rank_delta).toBe(-2)
  })
})

// ─── Platform filtering ───────────────────────────────────────────────────────

describe('platform filtering', () => {
  const mixed = [
    makeProject({ name: 'a', agent_platform: 'claude-code' }),
    makeProject({ name: 'b', agent_platform: 'openclaw' }),
    makeProject({ name: 'c', agent_platform: 'codex' }),
    makeProject({ name: 'd', agent_platform: 'claude-code' }),
  ]

  it('"all" returns every project', () => {
    const result = filterProjects(mixed, defaults)
    expect(result).toHaveLength(4)
  })

  it('filters to specific platform', () => {
    const result = filterProjects(mixed, { ...defaults, platform: 'openclaw' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('b')
    expect(result[0].rank).toBe(1)
  })

  it('defaults missing agent_platform to claude-code', () => {
    const projects = [
      makeProject({ name: 'legacy', agent_platform: undefined }),
    ]
    const result = filterProjects(projects, { ...defaults, platform: 'claude-code' })
    expect(result).toHaveLength(1)
  })

  it('mcp-server filter matches is_mcp_server flag', () => {
    const projects = [
      makeProject({ name: 'mcp-tool', agent_platform: 'claude-code', is_mcp_server: true }),
      makeProject({ name: 'regular', agent_platform: 'claude-code', is_mcp_server: false }),
      makeProject({ name: 'standalone-mcp', agent_platform: 'other', is_mcp_server: true }),
    ]
    const result = filterProjects(projects, { ...defaults, platform: 'mcp-server' })
    expect(result).toHaveLength(2)
    expect(result.map(p => p.name)).toEqual(['mcp-tool', 'standalone-mcp'])
    expect(result.map(p => p.rank)).toEqual([1, 2])
  })

  it('mcp-server project also appears in its agent_platform tab', () => {
    const projects = [
      makeProject({ name: 'mcp-tool', agent_platform: 'claude-code', is_mcp_server: true }),
      makeProject({ name: 'regular', agent_platform: 'claude-code', is_mcp_server: false }),
    ]
    const result = filterProjects(projects, { ...defaults, platform: 'claude-code' })
    expect(result).toHaveLength(2)
  })
})

// ─── Toggle filters ───────────────────────────────────────────────────────────

describe('toggle filters', () => {
  it('showNewOnly filters to is_new projects', () => {
    const projects = [
      makeProject({ name: 'old', is_new: false }),
      makeProject({ name: 'new', is_new: true }),
    ]
    const result = filterProjects(projects, { ...defaults, showNewOnly: true })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('new')
    expect(result[0].rank).toBe(1)
  })

  it('smallOnly filters to projects under 1000 stars', () => {
    const projects = [
      makeProject({ name: 'big', stars_total: 5000 }),
      makeProject({ name: 'small', stars_total: 200 }),
    ]
    const result = filterProjects(projects, { ...defaults, smallOnly: true })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('small')
  })
})

// ─── Movers sort ──────────────────────────────────────────────────────────────

describe('movers sort', () => {
  it('sorts by rank_delta descending', () => {
    const projects = [
      makeProject({ name: 'flat', rank_delta: 0 }),
      makeProject({ name: 'riser', rank_delta: 10 }),
      makeProject({ name: 'faller', rank_delta: -5 }),
    ]
    const result = filterProjects(projects, { ...defaults, sortBy: 'movers' })
    expect(result.map(p => p.name)).toEqual(['riser', 'flat', 'faller'])
    expect(result.map(p => p.rank)).toEqual([1, 2, 3])
  })

  it('treats missing rank_delta as 0', () => {
    const projects = [
      makeProject({ name: 'a', rank_delta: undefined }),
      makeProject({ name: 'b', rank_delta: 5 }),
    ]
    const result = filterProjects(projects, { ...defaults, sortBy: 'movers' })
    expect(result[0].name).toBe('b')
  })
})

// ─── Search ───────────────────────────────────────────────────────────────────

describe('search', () => {
  const projects = [
    makeProject({ name: 'Claude CLI', full_name: 'anthropic/claude-cli', description: 'A terminal tool' }),
    makeProject({ name: 'Bolt', full_name: 'stackblitz/bolt', description: 'AI code editor' }),
  ]

  it('matches on name (case-insensitive)', () => {
    const result = filterProjects(projects, { ...defaults, search: 'claude' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Claude CLI')
  })

  it('matches on full_name', () => {
    const result = filterProjects(projects, { ...defaults, search: 'stackblitz' })
    expect(result).toHaveLength(1)
  })

  it('matches on description', () => {
    const result = filterProjects(projects, { ...defaults, search: 'terminal' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Claude CLI')
  })

  it('handles null description gracefully', () => {
    const p = [makeProject({ name: 'x', description: null })]
    const result = filterProjects(p, { ...defaults, search: 'anything' })
    expect(result).toHaveLength(0)
  })
})

// ─── Combined filters ─────────────────────────────────────────────────────────

describe('combined filters', () => {
  it('platform + search + re-rank all compose correctly', () => {
    const projects = [
      makeProject({ name: 'alpha', agent_platform: 'claude-code', rank: 1 }),
      makeProject({ name: 'beta', agent_platform: 'openclaw', rank: 2 }),
      makeProject({ name: 'alpha-two', agent_platform: 'claude-code', rank: 5 }),
      makeProject({ name: 'gamma', agent_platform: 'claude-code', rank: 8 }),
    ]
    const result = filterProjects(projects, { ...defaults, platform: 'claude-code', search: 'alpha' })
    expect(result).toHaveLength(2)
    expect(result.map(p => p.name)).toEqual(['alpha', 'alpha-two'])
    expect(result.map(p => p.rank)).toEqual([1, 2])
  })
})
