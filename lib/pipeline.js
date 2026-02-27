// ShipRanked data pipeline — uses direct Supabase REST API (no SDK)
// to avoid bundling issues in Vercel serverless functions.

const GH_API = 'https://api.github.com'
const DELAY_MS = 2000
const MAX_PAGES = 3
const PER_PAGE = 100

// Signal strength: stronger signals take priority
const SIGNAL_PRIORITY = {
  'claude-md': 3,
  'topic-claude-code': 2,
  'topic-vibe-coding': 1,
}

const SEARCH_QUERIES = [
  {
    endpoint: '/search/code',
    q: 'filename:CLAUDE.md pushed:>2024-06-01 stars:>3',
    signal: 'claude-md',
    extractRepo: (item) => item.repository,
  },
  {
    endpoint: '/search/repositories',
    q: 'topic:claude-code pushed:>2024-06-01 stars:>3',
    signal: 'topic-claude-code',
    extractRepo: (item) => item,
  },
  {
    endpoint: '/search/repositories',
    q: 'topic:vibe-coding pushed:>2025-01-01 stars:>5',
    signal: 'topic-vibe-coding',
    extractRepo: (item) => item,
  },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Supabase REST helpers ──────────────────────────────────────────────────

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url, key }
}

async function supabaseSelect(table, select, filters = {}) {
  const cfg = getSupabaseConfig()
  if (!cfg) throw new Error('Supabase not configured')

  const params = new URLSearchParams({ select })
  for (const [col, val] of Object.entries(filters)) {
    params.append(col, val)
  }

  const res = await fetch(`${cfg.url}/rest/v1/${table}?${params}`, {
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase SELECT ${table} failed (${res.status}): ${body}`)
  }
  return res.json()
}

async function supabaseUpsert(table, rows) {
  const cfg = getSupabaseConfig()
  if (!cfg) throw new Error('Supabase not configured')

  const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase UPSERT ${table} failed (${res.status}): ${body}`)
  }
}

async function supabaseInsert(table, rows) {
  const cfg = getSupabaseConfig()
  if (!cfg) throw new Error('Supabase not configured')

  const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase INSERT ${table} failed (${res.status}): ${body}`)
  }
}

// ─── Project filters ────────────────────────────────────────────────────────

function isClaudeCodeProject(repo) {
  const blocklist = [
    'anthropics/', 'anthropic/', 'claude-code',
    'awesome-claude', 'claude-skills', 'claude-prompts',
  ]
  if (blocklist.some((b) => repo.full_name.toLowerCase().includes(b))) return false
  const daysSincePush = (Date.now() - new Date(repo.pushed_at)) / 86400000
  if (daysSincePush > 90) return false
  if (!repo.description || repo.description.length < 10) return false
  return true
}

function detectCategory(repo) {
  const topics = (repo.topics || []).map((t) => t.toLowerCase())
  const desc = (repo.description || '').toLowerCase()

  if (topics.some((t) => ['game', 'puzzle', 'arcade'].includes(t)) ||
      /\b(game|play|puzzle)\b/.test(desc)) {
    return 'games'
  }
  if (topics.some((t) => ['ai', 'llm', 'chatbot'].includes(t)) ||
      /\b(ai assistant|chat with)\b/.test(desc)) {
    return 'ai-apps'
  }
  if (topics.some((t) => ['cli', 'developer-tools', 'productivity'].includes(t)) ||
      /\b(cli|utility)\b/i.test(desc)) {
    return 'dev-utilities'
  }
  if (/\b(fun|bingo|quiz|meme|joke)\b/.test(desc)) {
    return 'fun'
  }
  return 'tools'
}

// ─── GitHub fetch ───────────────────────────────────────────────────────────

async function fetchGitHubPages(endpoint, q, token) {
  const items = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${GH_API}${endpoint}?q=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`GitHub API error (${res.status}) for ${endpoint}: ${body}`)
      break
    }

    const data = await res.json()
    items.push(...(data.items || []))

    // Stop if we got all results
    if (!data.items || data.items.length < PER_PAGE || items.length >= data.total_count) {
      break
    }

    // Rate-limit courtesy delay between pages
    if (page < MAX_PAGES) await sleep(500)
  }
  return items
}

// ─── Main pipeline ──────────────────────────────────────────────────────────

/**
 * Run the full ShipRanked data pipeline.
 * Returns a summary object { fetched, filtered, ranked, newEntries }.
 */
export async function runPipeline() {
  const cfg = getSupabaseConfig()
  if (!cfg) {
    throw new Error('Supabase not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)')
  }

  const ghToken = process.env.GH_DATA_TOKEN
  if (!ghToken) {
    throw new Error('GH_DATA_TOKEN not set')
  }

  // --- 1. Fetch 7-day-old snapshots for delta calculation ---
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const oldSnapshots = await supabaseSelect(
    'ranked_snapshots',
    'project_id,stars_total',
    { captured_at: `eq.${sevenDaysAgo}` }
  )

  const oldStarsMap = new Map()
  for (const s of oldSnapshots || []) {
    oldStarsMap.set(s.project_id, s.stars_total)
  }

  // --- 2. Run GitHub searches sequentially ---
  const repoMap = new Map()       // full_name -> repo data
  const signalMap = new Map()     // full_name -> signal string

  let totalFetched = 0

  for (const query of SEARCH_QUERIES) {
    const items = await fetchGitHubPages(query.endpoint, query.q, ghToken)
    totalFetched += items.length

    for (const item of items) {
      const repo = query.extractRepo(item)
      if (!repo || !repo.full_name) continue

      const name = repo.full_name

      // Keep the repo with the most data (prefer direct repo objects)
      if (!repoMap.has(name) || !repoMap.get(name).stargazers_count) {
        repoMap.set(name, repo)
      }

      // Track strongest signal
      const existing = signalMap.get(name)
      if (!existing || SIGNAL_PRIORITY[query.signal] > SIGNAL_PRIORITY[existing]) {
        signalMap.set(name, query.signal)
      }
    }

    // Delay between queries to respect rate limits
    await sleep(DELAY_MS)
  }

  // --- 3. Filter ---
  const filtered = []
  for (const [name, repo] of repoMap) {
    if (isClaudeCodeProject(repo)) {
      filtered.push({ name, repo, signal: signalMap.get(name) })
    }
  }

  // --- 4. Calculate stars_gained_7d ---
  for (const entry of filtered) {
    const projectId = `github:${entry.name}`
    const oldStars = oldStarsMap.get(projectId)
    entry.starsGained7d = oldStars != null
      ? Math.max(0, entry.repo.stargazers_count - oldStars)
      : entry.repo.stargazers_count  // new project — count all stars as gain
  }

  // --- 5. Sort by momentum and assign rank ---
  filtered.sort((a, b) => b.starsGained7d - a.starsGained7d)
  for (let i = 0; i < filtered.length; i++) {
    filtered[i].rank = i + 1
  }

  // --- 6. Compute rank_delta ---
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const yesterdaySnapshots = await supabaseSelect(
    'ranked_snapshots',
    'project_id,rank',
    { captured_at: `eq.${yesterday}` }
  )

  const yesterdayRankMap = new Map()
  for (const s of yesterdaySnapshots || []) {
    yesterdayRankMap.set(s.project_id, s.rank)
  }

  // --- 7. Detect new entries ---
  const existingProjects = await supabaseSelect('ranked_projects', 'id')
  const existingIds = new Set((existingProjects || []).map((p) => p.id))

  // --- 8. Build upsert rows ---
  const projectRows = []
  const snapshotRows = []
  let newCount = 0

  for (const entry of filtered) {
    const projectId = `github:${entry.name}`
    const yesterdayRank = yesterdayRankMap.get(projectId)
    const rankDelta = yesterdayRank != null ? yesterdayRank - entry.rank : 0
    const isNew = !existingIds.has(projectId)
    if (isNew) newCount++

    projectRows.push({
      id: projectId,
      name: entry.repo.name,
      full_name: entry.repo.full_name,
      description: entry.repo.description,
      url: entry.repo.html_url,
      builder_handle: entry.repo.owner?.login,
      avatar_url: entry.repo.owner?.avatar_url,
      category: detectCategory(entry.repo),
      stars_total: entry.repo.stargazers_count,
      stars_gained_7d: entry.starsGained7d,
      rank: entry.rank,
      rank_delta: rankDelta,
      is_new: isNew,
      claude_signal: entry.signal,
      last_fetched_at: new Date().toISOString(),
    })

    snapshotRows.push({
      project_id: projectId,
      stars_total: entry.repo.stargazers_count,
      rank: entry.rank,
      captured_at: new Date().toISOString().slice(0, 10),
    })
  }

  // --- 9. Upsert projects ---
  if (projectRows.length > 0) {
    await supabaseUpsert('ranked_projects', projectRows)
  }

  // --- 10. Upsert snapshots ---
  if (snapshotRows.length > 0) {
    try {
      await supabaseUpsert('ranked_snapshots', snapshotRows)
    } catch (e) {
      // Fall back to insert if upsert on composite key isn't supported
      await supabaseInsert('ranked_snapshots', snapshotRows)
    }
  }

  const summary = {
    fetched: totalFetched,
    filtered: filtered.length,
    ranked: filtered.length,
    newEntries: newCount,
  }

  console.log(`Pipeline complete: ${summary.fetched} repos fetched, ${summary.filtered} passed filter, ${summary.ranked} ranked, ${summary.newEntries} new entries`)

  return summary
}
