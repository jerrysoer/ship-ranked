# CLAUDE.md — ShipRanked

## Step 1: Load These Skills Before Every Task

```
/frontend-design
/vibesec
/web-dev
/backend-architect
```

Load all four before writing any code. No exceptions.

---

## Step 2: Task-Triggered Skills

| Task | Load First |
|------|-----------|
| PlatformTabs.jsx component | /frontend-developer |
| detectPlatform() logic | /backend-architect |
| SQL migration + index | /backend-architect |
| Mobile tab scroll behavior | /mobile-ux-optimizer |
| Phase completion review | /code-reviewer |
| Launch prep / registry submission | /project-shipper |

---

## Step 3: Project Context

**Repo:** `jerrysoer/ship-ranked`  
**Live URL:** `https://jerrysoer.github.io/ship-ranked/`  
**Architecture:** React + Vite → GitHub Pages (static frontend). Vercel serverless (cron only). Supabase (data). Frontend fetches directly from Supabase public REST API.

---

## Step 4: Current Work — PRD3 (Multi-Platform Expansion)

### What We're Building

Adding OpenClaw and Codex CLI as tracked platforms alongside Claude Code. Three deliverables:

1. **Schema migration** — `agent_platform` column on `projects` table
2. **`detectPlatform()` function** — classifies each repo by which AI agent built it
3. **Platform tab UI** — `All | Claude Code 🤖 | OpenClaw 🦞 | Codex ⚡` tabs at top of chart

### Files to Create/Modify

```
api/cron/fetch-projects.js     ← UPDATE: multi-platform queries + detectPlatform()
src/App.jsx                    ← UPDATE: add PlatformTabs, URL param sync, filter logic
src/components/PlatformTabs.jsx ← NEW
src/lib/platforms.js           ← NEW
src/lib/supabase.js            ← UPDATE: add .neq('agent_platform', 'other') to main query
```

### Schema Migration (Run First)

```sql
ALTER TABLE projects 
  ADD COLUMN agent_platform TEXT 
  NOT NULL DEFAULT 'claude-code'
  CHECK (agent_platform IN ('claude-code', 'openclaw', 'codex', 'gemini', 'other'));

UPDATE projects SET agent_platform = 'claude-code';

CREATE INDEX idx_projects_platform 
  ON projects(agent_platform, review_status, stars_gained_7d DESC);
```

Verify after migration: `SELECT COUNT(*) FROM projects WHERE agent_platform IS NULL` must return 0.

### Platform Config (`src/lib/platforms.js`)

```javascript
export const PLATFORMS = {
  all: {
    label: 'All',
    emoji: '🏆',
    color: '#FFB830',
  },
  'claude-code': {
    label: 'Claude Code',
    emoji: '🤖',
    color: '#FF8C42',
  },
  'openclaw': {
    label: 'OpenClaw',
    emoji: '🦞',
    color: '#E84545',
  },
  'codex': {
    label: 'Codex',
    emoji: '⚡',
    color: '#10A37F',
  },
  // gemini: reserved, not rendered in Phase 1
};

export const PLATFORM_ORDER = ['all', 'claude-code', 'openclaw', 'codex'];
```

### Platform Detection Logic

The `detectPlatform()` function runs in the cron after fetching the file tree. Uses GitHub Contents API (already fetched for Tier 2 safety scan — reuse that fetch, do NOT add a new API call).

**Critical edge case:** Both OpenClaw and Codex CLI use `AGENTS.md`. Also, `openclaw/openclaw` itself has a `CLAUDE.md` (they use Claude Code to develop it) — it should classify as `claude-code`, not `openclaw`. Priority order is the disambiguation mechanism.

```javascript
function detectPlatform(repo, fileTree, readmeText) {
  const files = fileTree.map(f => f.path.toLowerCase());
  const topics = repo.topics || [];
  const readme = (readmeText || '').toLowerCase();

  // Priority 1: Claude Code — CLAUDE.md is unique to this ecosystem
  if (files.includes('claude.md')) return 'claude-code';

  // Priority 2: OpenClaw — openclaw.json is definitive
  if (files.includes('openclaw.json')) return 'openclaw';

  // OpenClaw via topics
  if (topics.includes('openclaw') || topics.includes('openclaw-ai')) return 'openclaw';

  // OpenClaw via README (AGENTS.md + openclaw CLI commands)
  if (files.includes('agents.md') && (
    readme.includes('openclaw onboard') ||
    readme.includes('openclaw agent') ||
    readme.includes('openclaw gateway') ||
    readme.includes('npm install -g openclaw')
  )) return 'openclaw';

  // Priority 3: Codex CLI
  if (files.includes('agents.md') && (
    topics.includes('codex-cli') ||
    topics.includes('openai-codex') ||
    readme.includes('npx @openai/codex') ||
    readme.includes('codex --approval-mode') ||
    files.includes('codex.md')
  )) return 'codex';

  if (topics.includes('codex-cli') || topics.includes('openai-codex')) return 'codex';

  return 'other'; // excluded from chart
}
```

### GitHub Search Queries by Platform (Cron)

```javascript
const PLATFORM_QUERIES = {
  'claude-code': [
    'filename:CLAUDE.md pushed:>2024-06-01 stars:>3',
    'topic:claude-code pushed:>2024-06-01 stars:>3',
    'topic:vibe-coding pushed:>2025-01-01 stars:>5',
  ],
  'openclaw': [
    'filename:openclaw.json pushed:>2024-01-01 stars:>3',
    'topic:openclaw pushed:>2024-01-01 stars:>2',
    'topic:openclaw-ai pushed:>2024-01-01 stars:>2',
  ],
  'codex': [
    'filename:AGENTS.md topic:codex-cli pushed:>2025-01-01 stars:>3',
    'topic:openai-codex pushed:>2025-01-01 stars:>2',
    'filename:codex.md pushed:>2025-01-01 stars:>3',
  ],
};
```

Loop over all platform queries. Deduplicate globally by `full_name`. Run `detectPlatform()` on each result — the query is a hint, detection is authoritative.

### Updated Cron Sequence

```
1.  Query 7-day-old snapshot
2.  Fetch GitHub: loop over PLATFORM_QUERIES (all 3 platforms, 2s delay between requests)
3.  Deduplicate globally by full_name
4.  Apply isValidProject() filter (description > 10 chars, pushed < 90d, stars > 2)
5.  Run detectPlatform(repo, fileTree, readmeText) → sets agent_platform
6.  Tier 1 safety scan (metadata flags)
7.  Tier 2 file pattern scan
8.  Set review_status
9.  Calculate stars_gained_7d (7-day snapshot delta, platform-agnostic)
10. Auto-detect category (skip if category = 'featured')
11. Rank by stars_gained_7d (approved only, all platforms combined, exclude 'featured')
12. Compute rank_delta
13. Flag is_new
14. Fetch builder X handle (3-tier fallback)
15. Fetch README for missing readme_summary
16. Star repo if is_new=true AND starred_by_shipranked=false
17. Upsert with agent_platform set (WHERE category != 'featured' guard unchanged)
18. Insert snapshot (exclude featured)
19. If Monday: post X thread from @ShipRanked, save Reddit draft to weekly_drafts
20. Log summary with per-platform counts: "Upserted: claude-code=45, openclaw=18, codex=9"
```

### Frontend: Tab Switcher + Filter

Tab component behavior:
- Default active tab: `all`
- URL param: `?platform=all|claude-code|openclaw|codex` — syncs on load and tab click
- Tab counts: derived from loaded data (client-side count per platform), not a separate query
- Only show a platform tab if it has ≥ 10 approved projects. Otherwise hide the tab. Check `tabCounts[platform] >= 10`.
- On "All" tab: show platform pill on each card (top-right, platform accent color at 15% opacity)
- On filtered tabs: hide platform pill (redundant info)

Supabase query update:
```javascript
// Add .neq('agent_platform', 'other') to exclude unclassified repos
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('review_status', 'approved')
  .neq('agent_platform', 'other')
  .order('stars_gained_7d', { ascending: false })
  .limit(100);
```

---

## Step 5: Project Conventions

### Table Prefix
All tables use no prefix in this project (static GitHub Pages + Vercel cron pattern). Tables: `projects`, `snapshots`, `weekly_drafts`, `ss_api_usage` is ShipSignal — not this project.

### Supabase Access Pattern
- Frontend: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (client-safe, RLS enforces read-only)
- Cron (Vercel): `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-side only, NEVER in frontend bundle)
- RLS on `projects` and `snapshots`: anon key = SELECT only. Service role = full access.

### Auth
No user auth in this project. Public read-only leaderboard.

### Analytics
Supabase `sr_analytics_events` table (if analytics is added — not in current phase).

### Environment Variables

| Variable | Where | Status | Phase |
|----------|-------|--------|-------|
| `VITE_SUPABASE_URL` | GitHub Secrets (build) | ✅ | 1 |
| `VITE_SUPABASE_ANON_KEY` | GitHub Secrets (build) | ✅ | 1 |
| `SUPABASE_URL` | Vercel env | ✅ | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env | ✅ | 1 — server only, NEVER client |
| `GH_DATA_TOKEN` | Vercel env | ✅ | 1 — NOT `GITHUB_TOKEN` (reserved) |
| `CRON_SECRET` | Vercel env | ✅ | 1 |
| `X_CLIENT_ID` | Vercel env | ✅ | 2 |
| `X_CLIENT_SECRET` | Vercel env | ✅ | 2 |
| `SHIPRANKED_X_ACCESS_TOKEN` | Vercel env | ✅ | 2 |
| `SHIPRANKED_X_ACCESS_TOKEN_SECRET` | Vercel env | ✅ | 2 |

**Env file rule:** `.env.local` only. Never `.env`.

### Safety Scanning (from PRD2)

Tier 1 flags (metadata only, always runs):
- `no-description`: description < 10 chars
- `new-account-viral`: account < 30 days + stars > 100
- `possible-star-bomb`: stars_gained_7d > 300 + account < 60 days
- `no-license`: no license on tool repos
- `no-readme`: no README

Tier 2 flags (filename scan, runs on 0–1 flag repos):
- Checks file tree for .exe/.bat/.ps1, obfuscated JS outside dist/, binary blobs, suspicious filenames

Gate: 0 flags → `approved`. 1+ flags → `flagged` or `pending`. Non-approved = hidden from chart.

### Hall of Fame / Featured (from PRD2)

Repos with `category = 'featured'` are hand-curated classics. Cron upsert guard: `WHERE category != 'featured'`. They appear in "Community Classics" section below chart, no rank number, no delta badge, excluded from weekly X posts and rankings.

### Weekly Automated Distribution (from PRD2)

Every Monday cron:
1. Posts 3-tweet thread from `@ShipRanked` X account (top project summary)
2. Saves Reddit draft to `weekly_drafts` table (manual paste rotation across subreddits)

Skipped if fewer than 10 approved projects in chart.

---

## Step 6: Design System Reference

**Palette:**
- Base: `#0A0F1E` (deep navy)
- Surface: `#141C30`
- Gold (rank #1–3 + All tab): `#FFB830`
- Up delta: `#00E5A0`
- Down delta: `#FF4560`
- Accent: `#4D9CFF`
- Claude amber (Claude Code tab): `#FF8C42`
- OpenClaw red: `#E84545`
- Codex green: `#10A37F`

**Typography:**
- Ranks: Syne 800
- Stats / counts: DM Mono
- UI / labels: Outfit

**Animations:**
- Rank numbers count up 0→final on load (800ms easeOutQuart)
- Row reveal on scroll via IntersectionObserver
- Podium drop-in for top 3

**Tab component:**
- Font: DM Mono
- Active: platform accent color, 2px bottom border, font-weight 700
- Inactive: `#4A5568`, no border, font-weight 400
- Hover: `#A0AEC0`
- Mobile: horizontally scrollable, no wrapping, no tab clipping

---

## Step 7: Acceptance Criteria (PRD3 Phase 1)

**Schema:**
- [ ] `agent_platform` column exists with CHECK constraint
- [ ] All existing rows backfilled to `'claude-code'`
- [ ] Platform index created
- [ ] `SELECT COUNT(*) FROM projects WHERE agent_platform IS NULL` = 0

**Detection:**
- [ ] 5 known Claude Code repos → `'claude-code'` ✓
- [ ] 5 known OpenClaw repos → `'openclaw'` ✓
- [ ] 5 known Codex repos → `'codex'` ✓
- [ ] `openclaw/openclaw` itself → `'claude-code'` (has CLAUDE.md) ✓
- [ ] Any repo with `openclaw.json` → `'openclaw'` (never anything else) ✓
- [ ] 2 repos with AGENTS.md only (no openclaw/codex signals) → `'other'` ✓

**UI:**
- [ ] Tabs render: All / Claude Code / OpenClaw / Codex
- [ ] `?platform=` URL param syncs with active tab
- [ ] Tab counts accurate (sourced from loaded data)
- [ ] Tabs with < 10 projects are hidden
- [ ] Platform pills on cards in "All" view, hidden on filtered views
- [ ] Mobile: tabs horizontally scrollable

**Cron:**
- [ ] OpenClaw and Codex projects appear after first post-deployment run
- [ ] No cross-platform duplicate rows (same `full_name`, different `agent_platform`)
- [ ] Cron log shows per-platform counts

**Agent config:**
- [ ] This CLAUDE.md is present in project root
- [ ] `.claude/sessions/` is in `.gitignore`
- [ ] Running `/context` shows effective context > 150K tokens

---

## Step 8: Disabled MCPs

Do NOT load these — they are not used in this project and eat context window:

```
replicate
seedance
youtube-analytics
alpaca
exa
diffbot
```

Active: `supabase` (core data store)

---

## Step 9: Model Routing

**Default: Sonnet for everything.**

**Use Opus for:**
- `detectPlatform()` initial implementation — AGENTS.md collision disambiguation has enough edge cases
- SQL migration design (backfill + index strategy)

---

## Step 10: Verification Hooks

Global hooks active and relevant:
- ✅ `.env` blocker — project uses `.env.local`
- ✅ Service role key guard — cron uses service role, must NEVER appear in Vite bundle or client code
- ✅ Console.log warning — clean before deployment
- ✅ RLS reminder — `projects` and `snapshots` tables must maintain RLS

Project-specific checks:
- [ ] After cron: `SELECT COUNT(*) FROM projects WHERE agent_platform = 'other' AND stars_gained_7d > 10` should be 0 — any result is a detection gap, log it
- [ ] Backfill guard: verify no NULL `agent_platform` before cron proceeds
- [ ] No cross-platform dupes: `SELECT full_name, COUNT(*) FROM projects GROUP BY full_name HAVING COUNT(*) > 1` must return empty
- [ ] `SUPABASE_SERVICE_ROLE_KEY` must not appear anywhere in `src/` directory
- [ ] `GH_DATA_TOKEN` must not appear anywhere in `src/` directory
