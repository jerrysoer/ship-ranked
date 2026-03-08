/**
 * Client-side project filtering, sorting, and re-ranking.
 *
 * Extracted from App.jsx useMemo so it can be unit-tested independently.
 * Always re-ranks results 1..N to close gaps left by server-side exclusions
 * (flagged/pending projects occupy global ranks but are filtered out in the UI).
 */
export function filterProjects(projects, { platform, sortBy, showNewOnly, smallOnly, search }) {
  let result = projects
  if (platform !== 'all') {
    result = result.filter(p => (p.agent_platform || 'claude-code') === platform)
  }
  if (showNewOnly) result = result.filter(p => p.is_new)
  if (smallOnly) result = result.filter(p => p.stars_total < 1000)
  if (sortBy === 'movers') {
    result = [...result].sort((a, b) => (b.rank_delta || 0) - (a.rank_delta || 0))
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    )
  }
  // Always re-rank to close gaps from server-side exclusions
  return result.map((p, i) => ({ ...p, rank: i + 1 }))
}
