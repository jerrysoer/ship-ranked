function parseISOWeek(weekStr) {
  // "2026-W09" → { monday: Date, sunday: Date }
  const [year, weekNum] = weekStr.split('-W').map(Number)
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7 // Monday=1, Sunday=7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNum - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function getCurrentISOWeek() {
  const now = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1
  const dayOfWeek = now.getDay() || 7
  const weekNum = Math.ceil((dayOfYear - dayOfWeek + 10) / 7)
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function formatWeekLabel(monday, sunday) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monMonth = months[monday.getMonth()]
  const monDay = monday.getDate()
  const sunMonth = months[sunday.getMonth()]
  const sunDay = sunday.getDate()
  const year = sunday.getFullYear()

  if (monday.getMonth() === sunday.getMonth()) {
    return `${monMonth} ${monDay} – ${sunDay}, ${year}`
  }
  return `${monMonth} ${monDay} – ${sunMonth} ${sunDay}, ${year}`
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildFallbackSvg(weekLabel) {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bloom" cx="30%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1A2540" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0A0F1E" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bloom)"/>
  <rect x="60" y="60" width="4" height="510" fill="#FFB830"/>
  <text x="84" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#FFB830" letter-spacing="3">SHIPRANKED WEEKLY</text>
  <text x="1140" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#5A6A8A" text-anchor="end">Week of ${escapeXml(weekLabel)}</text>
  <text x="600" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#5A6A8A" text-anchor="middle">No data available</text>
  <text x="600" y="600" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#3A4A6A" text-anchor="middle">shipranked.jerrysoer.com</text>
</svg>`
}

function buildSvg({ weekLabel, topProject, totalProjects, totalStarsGained, newCount }) {
  const statsLine = `${totalProjects} projects · ${totalStarsGained.toLocaleString()} total stars gained · ${newCount} new ${newCount === 1 ? 'entry' : 'entries'}`

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bloom" cx="30%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1A2540" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0A0F1E" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bloom)"/>
  <rect x="60" y="60" width="4" height="510" fill="#FFB830"/>
  <text x="84" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#FFB830" letter-spacing="3">SHIPRANKED WEEKLY</text>
  <text x="1140" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#5A6A8A" text-anchor="end">Week of ${escapeXml(weekLabel)}</text>
  <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="700" fill="#FFB830" text-anchor="middle">#1</text>
  <text x="600" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="600" fill="#F0F4FF" text-anchor="middle">${escapeXml(topProject)}</text>
  <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#5A6A8A" text-anchor="middle">${escapeXml(statsLine)}</text>
  <text x="600" y="600" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#3A4A6A" text-anchor="middle">shipranked.jerrysoer.com</text>
</svg>`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('Content-Type', 'image/svg+xml')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  const weekStr = req.query.week || getCurrentISOWeek()
  const { monday, sunday } = parseISOWeek(weekStr)
  const weekLabel = formatWeekLabel(monday, sunday)

  if (!url || !key) {
    return res.status(200).send(buildFallbackSvg(weekLabel))
  }

  try {
    const [topResponse, allResponse] = await Promise.all([
      fetch(
        `${url}/rest/v1/ranked_projects?review_status=eq.approved&category=neq.featured&order=rank.asc&limit=1&select=name,rank`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        }
      ),
      fetch(
        `${url}/rest/v1/ranked_projects?review_status=eq.approved&category=neq.featured&select=stars_gained_7d,is_new`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        }
      ),
    ])

    if (!topResponse.ok || !allResponse.ok) {
      return res.status(200).send(buildFallbackSvg(weekLabel))
    }

    const [topProjects, allProjects] = await Promise.all([topResponse.json(), allResponse.json()])

    if (!topProjects || topProjects.length === 0 || !allProjects) {
      return res.status(200).send(buildFallbackSvg(weekLabel))
    }

    const topProject = topProjects[0].name
    const totalProjects = allProjects.length
    const totalStarsGained = allProjects.reduce((sum, p) => sum + (p.stars_gained_7d || 0), 0)
    const newCount = allProjects.filter((p) => p.is_new === true).length

    const svg = buildSvg({ weekLabel, topProject, totalProjects, totalStarsGained, newCount })
    return res.status(200).send(svg)
  } catch (err) {
    console.error('recap-og error:', err)
    return res.status(200).send(buildFallbackSvg(weekLabel))
  }
}
