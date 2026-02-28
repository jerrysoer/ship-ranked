// SVG badge for README embedding (shields.io style)
// Usage: /api/badge?project=owner--repo
// Returns: ~240x28 SVG badge

async function fetchProject(projectId) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const res = await fetch(
    `${url}/rest/v1/ranked_projects?id=eq.${encodeURIComponent(projectId)}&select=rank,stars_gained_7d,rank_delta&limit=1`,
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

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return String(n)
}

function generateBadge(project) {
  const rank = project.rank
  const stars = formatStars(project.stars_gained_7d || 0)
  const rightText = escapeXml(`#${rank} · +${stars} ★`)

  // Color: gold for top 3, blue for rest
  const bg = rank <= 3 ? '#FFB830' : '#4D9CFF'
  const textColor = rank <= 3 ? '#1a1200' : '#fff'

  const labelText = 'ShipRanked'
  const labelWidth = 78
  const valueWidth = rightText.length * 7.2 + 16
  const totalWidth = labelWidth + valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${rightText}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#333"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${bg}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth + valueWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

function generateCompactBadge(project) {
  const rank = project.rank
  const bg = rank <= 3 ? '#FFB830' : '#4D9CFF'
  const textColor = rank <= 3 ? '#1a1200' : '#fff'
  const rightText = escapeXml(`#${rank} ↑`)
  const valueWidth = rightText.length * 7.2 + 12
  const totalWidth = valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="ShipRanked: #${rank}">
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="10" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${totalWidth}" height="20" fill="${bg}"/>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${totalWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${totalWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

function generateTrendingBadge(project) {
  const delta = project.rank_delta || 0
  if (delta <= 0) return generateBadge(project)

  const labelText = 'ShipRanked'
  const rightText = escapeXml(`↑+${delta} this week`)
  const labelWidth = 78
  const valueWidth = rightText.length * 7.2 + 16
  const totalWidth = labelWidth + valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${rightText}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#333"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#00B87A"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth + valueWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

function generateDarkBadge(project) {
  const rank = project.rank
  const stars = formatStars(project.stars_gained_7d || 0)
  const rightText = escapeXml(`#${rank} · +${stars} ★`)
  const labelText = 'ShipRanked'
  const labelWidth = 78
  const valueWidth = rightText.length * 7.2 + 16
  const totalWidth = labelWidth + valueWidth
  const bg = rank <= 3 ? '#FFB830' : '#4D9CFF'
  const textColor = rank <= 3 ? '#1a1200' : '#fff'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${rightText}">
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#1a1a2e"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${bg}"/>
  </g>
  <g fill="#e0e0e0" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth + valueWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

function generateLightBadge(project) {
  const rank = project.rank
  const stars = formatStars(project.stars_gained_7d || 0)
  const rightText = escapeXml(`#${rank} · +${stars} ★`)
  const labelText = 'ShipRanked'
  const labelWidth = 78
  const valueWidth = rightText.length * 7.2 + 16
  const totalWidth = labelWidth + valueWidth
  const bg = rank <= 3 ? '#FFB830' : '#4D9CFF'
  const textColor = rank <= 3 ? '#1a1200' : '#fff'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${rightText}">
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#fff"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${bg}"/>
    <rect width="${labelWidth}" height="20" fill="none" stroke="#dbdbdb" stroke-width="1"/>
  </g>
  <g fill="#333" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
  </g>
  <g fill="${textColor}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth + valueWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

const BADGE_GENERATORS = {
  default: generateBadge,
  compact: generateCompactBadge,
  trending: generateTrendingBadge,
  dark: generateDarkBadge,
  light: generateLightBadge,
}

function generateNotRankedBadge() {
  const labelText = 'ShipRanked'
  const rightText = 'not ranked'
  const labelWidth = 78
  const valueWidth = 72
  const totalWidth = labelWidth + valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${rightText}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#333"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#777"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill-opacity=".3">${rightText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  const { project, style = 'default' } = req.query
  if (!project || typeof project !== 'string' || project.length > 200 || !project.includes('--')) {
    return res.status(200).send(generateNotRankedBadge())
  }

  const [owner, ...repoParts] = project.split('--')
  const repo = repoParts.join('--')

  // Validate GitHub-safe characters
  if (!/^[\w.\-]+$/.test(owner) || !/^[\w.\-]+$/.test(repo)) {
    return res.status(200).send(generateNotRankedBadge())
  }
  const projectId = `github:${owner}/${repo}`

  try {
    const data = await fetchProject(projectId)
    if (!data) return res.status(200).send(generateNotRankedBadge())
    trackEvent('badge-view', { project: projectId, rank: data.rank, style }, req)
    const generator = BADGE_GENERATORS[style] || BADGE_GENERATORS.default
    return res.status(200).send(generator(data))
  } catch (err) {
    console.error('Badge error:', err)
    return res.status(200).send(generateNotRankedBadge())
  }
}
