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

// ─── Safety scanning (Tier 1 — metadata only) ──────────────────────────────

function runSafetyScan(entry) {
  const flags = []
  const repo = entry.repo
  const createdAt = repo.owner?.created_at || repo.created_at
  const accountAge = createdAt
    ? Math.floor((Date.now() - new Date(createdAt)) / 86400000)
    : 999

  // Hard block: suspicious repo name
  if (/keylog|rat|payload|stealer|trojan/i.test(repo.name)) {
    flags.push({ type: 'suspicious-name', severity: 'hard' })
  }

  // Soft flag: possible star bomb (very new account, very high stars)
  if (accountAge < 14 && repo.stargazers_count > 500) {
    flags.push({ type: 'possible-star-bomb', severity: 'soft' })
  }

  // Soft flag: new account going viral quickly
  if (accountAge < 14 && entry.starsGained7d > 200) {
    flags.push({ type: 'new-account-viral', severity: 'soft' })
  }

  // Informational: fork with low stars
  if (repo.fork && repo.stargazers_count < 50) {
    flags.push({ type: 'fork-low-stars', severity: 'info' })
  }

  const hasHard = flags.some(f => f.severity === 'hard')
  const hasSoft = flags.some(f => f.severity === 'soft')
  const status = hasHard ? 'rejected' : hasSoft ? 'flagged' : 'approved'

  return { flags, status, accountAge }
}

// ─── README parsing ─────────────────────────────────────────────────────────

async function fetchReadmeSummary(fullName, token) {
  try {
    const res = await fetch(
      `${GH_API}/repos/${fullName}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )
    if (!res.ok) return null

    const { content, encoding } = await res.json()
    if (encoding !== 'base64') return null

    const text = Buffer.from(content, 'base64').toString('utf-8')
    const lines = text
      .split('\n')
      .map((l) => l.replace(/^#+\s*/, '').trim())
      .filter(
        (l) =>
          l.length > 40 &&
          !l.startsWith('http') &&
          !l.startsWith('[!') &&
          !l.startsWith('<img') &&
          !l.startsWith('<a') &&
          !l.startsWith('<p align') &&
          !/shields\.io|img\.shields|badge/.test(l) &&
          !/^[A-Z\s]+$/.test(l) &&
          !/^(npm|pip|brew|cargo|yarn|pnpm)\s/.test(l)
      )

    return lines[0]?.slice(0, 200) || null
  } catch (e) {
    console.error(`README fetch failed for ${fullName}:`, e.message)
    return null
  }
}

// ─── X handle extraction ─────────────────────────────────────────────────────

// Validate extracted handle matches X/Twitter format (1-15 alphanumeric + underscore)
function isValidXHandle(handle) {
  return handle && /^[a-zA-Z0-9_]{1,15}$/.test(handle)
}

async function extractXHandle(repo, readmeText, token) {
  // Tier 1: GitHub user profile (separate API call — includes twitter_username + blog)
  try {
    const res = await fetch(`${GH_API}/users/${repo.owner?.login}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    })
    if (res.ok) {
      const user = await res.json()
      if (isValidXHandle(user.twitter_username)) return user.twitter_username
      // Tier 2: blog URL may contain x.com or twitter.com handle
      const blog = user.blog || ''
      const blogMatch = blog.match(/(?:x\.com|twitter\.com)\/(\w+)/)
      if (blogMatch && isValidXHandle(blogMatch[1])) return blogMatch[1]
    }
  } catch (e) {
    console.error(`User fetch failed for ${repo.owner?.login}:`, e.message)
  }

  // Tier 3: README text
  if (readmeText) {
    const match = readmeText.match(/(?:x\.com|twitter\.com)\/(\w+)/)
    if (match && match[1] !== 'intent' && match[1] !== 'share' && isValidXHandle(match[1])) return match[1]
  }

  return null
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

// ─── Star new projects ──────────────────────────────────────────────────────

async function starNewProjects(ghToken) {
  // Use dedicated @shipranked token if available, otherwise fall back to data token
  const starToken = process.env.SHIPRANKED_GH_TOKEN || ghToken

  // Gate: only unstarred projects, max 20 per run
  const unstarred = await supabaseSelect(
    'ranked_projects',
    'id,full_name',
    { starred_by_shipranked: 'eq.false', order: 'rank.asc', limit: '20' }
  )

  let count = 0
  for (const project of unstarred || []) {
    try {
      const res = await fetch(`${GH_API}/user/starred/${project.full_name}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${starToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Length': '0',
        },
      })
      if (res.ok || res.status === 204) {
        await supabaseUpsert('ranked_projects', [{ id: project.id, starred_by_shipranked: true }])
        count++
      }
    } catch (e) {
      console.error(`Star failed for ${project.full_name}:`, e.message)
    }
    await sleep(500)
  }
  return count
}

// ─── Weekly draft generation ────────────────────────────────────────────────

function generateRedditDraft(topProjects) {
  const weekNum = Math.ceil((Date.now() - new Date('2026-01-05')) / (7 * 86400000))
  const subs = ['ClaudeAI', 'vibecoding', 'SideProject', 'programming']
  const sub = subs[(weekNum - 1) % subs.length]

  const lines = topProjects.slice(0, 10).map((p, i) => {
    const stars = p.stars_gained_7d >= 1000
      ? `${(p.stars_gained_7d / 1000).toFixed(1)}k` : p.stars_gained_7d
    return `${i + 1}. **[${p.name}](${p.url})** — ${p.description?.slice(0, 80)} (+${stars} ★)`
  })

  const title = `ShipRanked Weekly: Top Claude-built projects this week`
  const body = [
    `Here's this week's top Claude Code-built open source projects, ranked by GitHub star momentum:\n`,
    ...lines,
    `\nFull rankings: https://jerrysoer.github.io/ship-ranked/`,
    `\n---\n*ShipRanked tracks open source projects built with Claude Code, ranked by weekly star gains.*`,
  ].join('\n')

  return { platform: 'reddit', subreddit: sub, suggested_title: title, content: body }
}

function generateXDraft(topProjects) {
  const top5 = topProjects.slice(0, 5)
  const lines = top5.map((p, i) => {
    const stars = p.stars_gained_7d >= 1000
      ? `${(p.stars_gained_7d / 1000).toFixed(1)}k` : p.stars_gained_7d
    const handle = p.builder_x_handle ? ` by @${p.builder_x_handle}` : ''
    return `${i + 1}. ${p.name}${handle} — +${stars} ★`
  })

  const tweet1 = `This week's top Claude Code-built projects by ★ momentum:\n\n${lines.join('\n')}\n\nFull rankings ↓`
  const spotlight = top5[0]
  const spotHandle = spotlight?.builder_x_handle ? `@${spotlight.builder_x_handle}` : spotlight?.name
  const tweet2 = `Spotlight: ${spotHandle}\n\n${spotlight?.readme_summary || spotlight?.description || ''}\n\n${spotlight?.url}`
  const tweet3 = `Full rankings → https://jerrysoer.github.io/ship-ranked/\n\nBuilt with Claude Code? Add the "claude-code" topic to your repo to get ranked.`

  return {
    platform: 'x',
    subreddit: null,
    suggested_title: null,
    content: JSON.stringify({ tweet1, tweet2, tweet3 }),
  }
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

  // --- 1. Fetch oldest available snapshots (up to 7 days back) for delta calculation ---
  const today = new Date().toISOString().slice(0, 10)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)

  // Find the oldest snapshot date we have within the 7-day window
  const dateProbe = await supabaseSelect(
    'ranked_snapshots',
    'captured_at',
    { captured_at: `gte.${sevenDaysAgo}`, order: 'captured_at.asc', limit: '1' }
  )
  const oldestDate = dateProbe?.[0]?.captured_at
  const compareDate = (oldestDate && oldestDate < today) ? oldestDate : sevenDaysAgo

  const oldSnapshots = await supabaseSelect(
    'ranked_snapshots',
    'project_id,stars_total',
    { captured_at: `eq.${compareDate}` }
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

  // --- 3. Filter (skip featured projects so pipeline doesn't overwrite them) ---
  const existingFeatured = await supabaseSelect('ranked_projects', 'id', { category: 'eq.featured' })
  const featuredIds = new Set((existingFeatured || []).map(p => p.id))

  const filtered = []
  for (const [name, repo] of repoMap) {
    if (featuredIds.has(`github:${name}`)) continue
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
      : 0  // new project with no prior snapshot — show 0 until we have history
  }

  // --- 4b. Run Tier 1 safety scan (needs momentum data) ---
  for (const entry of filtered) {
    const scan = runSafetyScan(entry)
    entry.safetyFlags = scan.flags
    entry.reviewStatus = scan.status
    entry.accountAge = scan.accountAge
  }

  const flaggedCount = filtered.filter(e => e.reviewStatus !== 'approved').length
  if (flaggedCount > 0) {
    console.log(`Safety scan: ${flaggedCount} projects flagged/rejected`)
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
      review_status: entry.reviewStatus,
      safety_flags: entry.safetyFlags,
      account_age_days: entry.accountAge,
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

  // --- 11. Fetch README summaries for top 50 (only where missing) ---
  const needReadme = await supabaseSelect(
    'ranked_projects',
    'id,full_name',
    { readme_summary: 'is.null', order: 'rank.asc', limit: '50' }
  )

  let readmeCount = 0
  for (const project of needReadme || []) {
    const summary = await fetchReadmeSummary(project.full_name, ghToken)
    if (summary) {
      await supabaseUpsert('ranked_projects', [{ id: project.id, readme_summary: summary }])
      readmeCount++
    }
    await sleep(200) // rate limit courtesy
  }

  if (readmeCount > 0) {
    console.log(`README summaries: ${readmeCount} new summaries extracted`)
  }

  // --- 12. Extract X handles for top 50 (only where missing) ---
  const needXHandle = await supabaseSelect(
    'ranked_projects',
    'id,full_name,owner:builder_handle',
    { builder_x_handle: 'is.null', order: 'rank.asc', limit: '50' }
  )

  let xHandleCount = 0
  for (const project of needXHandle || []) {
    // Build a minimal repo-like object for extractXHandle
    const repoStub = { owner: { login: project.owner } }
    // Fetch the README text for Tier 3 fallback (reuse if already fetched)
    const readmeText = await fetchReadmeSummary(project.full_name, ghToken)
    const handle = await extractXHandle(repoStub, readmeText, ghToken)
    if (handle) {
      await supabaseUpsert('ranked_projects', [{ id: project.id, builder_x_handle: handle }])
      xHandleCount++
    }
    await sleep(300) // rate limit courtesy — 50 extra /users/ calls per run
  }

  if (xHandleCount > 0) {
    console.log(`X handles: ${xHandleCount} new handles extracted`)
  }

  // --- 13. Star newly discovered projects ---
  const starCount = await starNewProjects(ghToken)
  if (starCount > 0) {
    console.log(`Stars: ${starCount} new projects starred`)
  }

  // --- 14. Monday-only: generate weekly content drafts ---
  const isMonday = new Date().getUTCDay() === 1
  let draftsGenerated = false
  if (isMonday) {
    const approvedTop = await supabaseSelect(
      'ranked_projects', '*',
      { review_status: 'eq.approved', order: 'rank.asc', limit: '10' }
    )
    if (approvedTop && approvedTop.length >= 10) {
      const reddit = generateRedditDraft(approvedTop)
      const xDraft = generateXDraft(approvedTop)
      const weekStart = new Date().toISOString().slice(0, 10)
      await supabaseInsert('weekly_drafts', [
        { ...reddit, week_start: weekStart },
        { ...xDraft, week_start: weekStart },
      ])
      console.log(`Weekly drafts generated for ${weekStart}`)
      draftsGenerated = true
    }
  }

  const summary = {
    fetched: totalFetched,
    filtered: filtered.length,
    ranked: filtered.length,
    newEntries: newCount,
    readmeSummaries: readmeCount,
    xHandles: xHandleCount,
    starred: starCount,
    draftsGenerated,
    flagged: filtered.filter(e => e.reviewStatus !== 'approved').length,
  }

  console.log(`Pipeline complete: ${summary.fetched} repos fetched, ${summary.filtered} passed filter, ${summary.ranked} ranked, ${summary.newEntries} new entries, ${summary.readmeSummaries} READMEs parsed, ${summary.xHandles} X handles, ${summary.starred} starred, ${summary.flagged} flagged`)

  return summary
}
