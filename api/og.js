// Dynamic OG image generator for ShipRanked
// Returns an SVG image (1200x630) for social media previews
// Usage: /api/og?slug=owner--repo

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

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatWeekDate() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateProjectSvg(project) {
  const rank = project.rank || '?'
  const name = escapeXml(project.name || project.full_name || 'Unknown Project')
  const owner = escapeXml(project.builder_handle || '')
  const starsTotal = project.stars_total != null ? Number(project.stars_total).toLocaleString() : '0'
  const starsGained = project.stars_gained_7d != null ? Number(project.stars_gained_7d).toLocaleString() : '0'
  const weekDate = escapeXml(formatWeekDate())
  const isFirst = rank === 1
  const accentColor = isFirst ? '#FFB830' : '#4D9CFF'

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bloom" cx="0.15" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="#1a2a5e" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0A0F1E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0F1E"/>
  <rect width="1200" height="630" fill="url(#bloom)"/>
  <rect x="0" y="0" width="4" height="630" fill="${accentColor}"/>
  <text x="60" y="52" font-size="20" font-weight="700" font-family="system-ui, -apple-system, sans-serif" fill="#F0F4FF" letter-spacing="3">SHIPRANKED</text>
  <text x="1140" y="52" text-anchor="end" font-size="14" font-family="system-ui, -apple-system, sans-serif" fill="#5A6A8A">Week of ${weekDate}</text>
  <text x="60" y="280" font-size="96" font-weight="800" font-family="system-ui, -apple-system, sans-serif" fill="#FFB830">#${rank}</text>
  <text x="60" y="340" font-size="32" font-weight="700" font-family="system-ui, -apple-system, sans-serif" fill="#F0F4FF">${name}</text>
  <text x="60" y="380" font-size="16" font-family="system-ui, -apple-system, sans-serif" fill="#5A6A8A">by @${owner}</text>
  <text x="60" y="425" font-size="18" font-family="system-ui, -apple-system, sans-serif" fill="#5A6A8A">&#x2605; ${starsTotal} stars   &#x2191; <tspan fill="#00E5A0">+${starsGained}</tspan> this week</text>
  <text x="60" y="465" font-size="13" font-family="system-ui, -apple-system, sans-serif" fill="#FF8C42">&#x25C6; Built with Claude Code</text>
  <text x="60" y="600" font-size="13" font-family="system-ui, -apple-system, sans-serif" fill="#3A4A6A">shipranked.jerrysoer.com</text>
</svg>`
}

function generateFallbackSvg() {
  const weekDate = escapeXml(formatWeekDate())
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bloom" cx="0.15" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="#1a2a5e" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0A0F1E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0F1E"/>
  <rect width="1200" height="630" fill="url(#bloom)"/>
  <rect x="0" y="0" width="4" height="630" fill="#4D9CFF"/>
  <text x="60" y="52" font-size="20" font-weight="700" font-family="system-ui, -apple-system, sans-serif" fill="#F0F4FF" letter-spacing="3">SHIPRANKED</text>
  <text x="1140" y="52" text-anchor="end" font-size="14" font-family="system-ui, -apple-system, sans-serif" fill="#5A6A8A">Week of ${weekDate}</text>
  <text x="60" y="280" font-size="56" font-weight="800" font-family="system-ui, -apple-system, sans-serif" fill="#F0F4FF">ShipRanked</text>
  <text x="60" y="340" font-size="28" font-weight="500" font-family="system-ui, -apple-system, sans-serif" fill="#5A6A8A">GitHub leaderboard for Claude Code projects</text>
  <text x="60" y="400" font-size="16" font-family="system-ui, -apple-system, sans-serif" fill="#FF8C42">&#x25C6; Built with Claude Code</text>
  <text x="60" y="600" font-size="13" font-family="system-ui, -apple-system, sans-serif" fill="#3A4A6A">shipranked.jerrysoer.com</text>
</svg>`
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  const { slug } = req.query
  if (!slug || typeof slug !== 'string' || slug.length > 200 || !slug.includes('--')) {
    return res.status(200).send(generateFallbackSvg())
  }

  const [owner, ...repoParts] = slug.split('--')
  const repo = repoParts.join('--')

  // Validate GitHub-safe characters
  if (!/^[\w.\-]+$/.test(owner) || !/^[\w.\-]+$/.test(repo)) {
    return res.status(200).send(generateFallbackSvg())
  }
  const projectId = `github:${owner}/${repo}`

  try {
    const data = await fetchProject(projectId)
    if (!data) return res.status(200).send(generateFallbackSvg())
    return res.status(200).send(generateProjectSvg(data))
  } catch (err) {
    console.error('OG image error:', err)
    return res.status(200).send(generateFallbackSvg())
  }
}
