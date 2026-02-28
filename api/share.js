// Share page — serves HTML with OG meta tags for social media crawlers,
// then redirects real users to the SPA.
// Usage: /api/share?slug=owner--repo  (or via rewrite: /p/owner--repo)

async function fetchProject(projectId) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const res = await fetch(
    `${url}/rest/v1/ranked_projects?id=eq.${encodeURIComponent(projectId)}&select=name,full_name,builder_handle,rank,stars_total,stars_gained_7d&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0] || null
}

function trackEvent(event, data, req) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  fetch(`${url}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      event, data, source: 'server',
      referrer: req.headers.referer || req.headers.referrer || null,
      user_agent: req.headers['user-agent'] || null,
    }),
  }).catch(() => {})
}

function isValidSlug(s) {
  if (!s || typeof s !== 'string' || s.length > 200 || !s.includes('--')) return false
  const [owner, ...rest] = s.split('--')
  return /^[\w.\-]+$/.test(owner) && /^[\w.\-]+$/.test(rest.join('--'))
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function buildHtml({ title, description, ogImageUrl, redirectUrl }) {
  title = escapeHtml(title)
  description = escapeHtml(description)
  const ogImgSafe = escapeHtml(ogImageUrl)
  const redirectSafe = escapeHtml(redirectUrl)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImgSafe}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${redirectSafe}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImgSafe}" />

  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${redirectSafe}" />
  <link rel="canonical" href="${redirectSafe}" />
</head>
<body>
  <p>Redirecting to <a href="${redirectSafe}">ShipRanked</a>...</p>
  <script>window.location.replace(${JSON.stringify(redirectUrl).replace(/</g, '\\u003c')})</script>
</body>
</html>`
}

function parseWeekLabel(weekStr) {
  try {
    const [year, weekNum] = weekStr.split('-W').map(Number)
    const jan4 = new Date(year, 0, 4)
    const dayOfWeek = jan4.getDay() || 7
    const monday = new Date(jan4)
    monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNum - 1) * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${fmt(monday)} – ${fmt(sunday)}`
  } catch {
    return weekStr
  }
}

export default async function handler(req, res) {
  const { slug, recap, builder } = req.query
  const host = req.headers.host || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  let title = 'ShipRanked — GitHub Leaderboard for Claude Code Projects'
  let description = 'See which Claude Code projects are gaining the most stars this week.'
  let ogImageUrl = `${baseUrl}/api/og`
  let redirectUrl = 'https://jerrysoer.github.io/ship-ranked/'

  // Recap share page
  if (recap) {
    const weekLabel = parseWeekLabel(recap)
    title = `ShipRanked Weekly Recap — Week of ${weekLabel}`
    description = 'See which Claude Code projects dominated this week.'
    ogImageUrl = `${baseUrl}/api/recap-og?week=${encodeURIComponent(recap)}`
    redirectUrl = `https://jerrysoer.github.io/ship-ranked/?view=recap&week=${encodeURIComponent(recap)}`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(buildHtml({ title, description, ogImageUrl, redirectUrl }))
  }

  // Builder share page
  if (builder) {
    title = `@${escapeHtml(builder)} — ShipRanked Builder Profile`
    description = `See all Claude Code projects by @${escapeHtml(builder)}.`
    ogImageUrl = `${baseUrl}/api/og?builder=${encodeURIComponent(builder)}`
    redirectUrl = `https://jerrysoer.github.io/ship-ranked/?view=builder&handle=${encodeURIComponent(builder)}`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(buildHtml({ title, description, ogImageUrl, redirectUrl }))
  }

  if (isValidSlug(slug)) {
    const [owner, ...repoParts] = slug.split('--')
    const repo = repoParts.join('--')
    const projectId = `github:${owner}/${repo}`

    trackEvent('share-click', { project: projectId }, req)

    ogImageUrl = `${baseUrl}/api/og?slug=${slug}`
    redirectUrl = `https://jerrysoer.github.io/ship-ranked/?project=${slug}`

    try {
      const data = await fetchProject(projectId)
      if (data) {
        const projectName = data.name || data.full_name || `${owner}/${repo}`
        const rank = data.rank || '?'
        const starsTotal = data.stars_total != null ? Number(data.stars_total).toLocaleString() : '0'
        const starsGained = data.stars_gained_7d != null ? Number(data.stars_gained_7d).toLocaleString() : '0'

        title = `${projectName} — #${rank} on ShipRanked this week`
        description = `★ ${starsTotal} stars · ↑ +${starsGained} this week · Built with Claude Code`
      }
    } catch (err) {
      console.error('Share page error:', err)
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).send(buildHtml({ title, description, ogImageUrl, redirectUrl }))
}
