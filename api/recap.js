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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return res.status(503).json({ error: 'Supabase unavailable' })
  }

  const weekStr = req.query.week || getCurrentISOWeek()
  const { monday, sunday } = parseISOWeek(weekStr)
  const weekLabel = formatWeekLabel(monday, sunday)

  try {
    const response = await fetch(
      `${url}/rest/v1/ranked_projects?review_status=eq.approved&category=neq.featured&order=rank.asc&limit=25&select=id,name,full_name,description,avatar_url,category,rank,rank_delta,stars_total,stars_gained_7d,is_new`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase error:', response.status, errorText)
      return res.status(503).json({ error: 'Failed to fetch projects' })
    }

    const projects = await response.json()

    const top5 = projects.slice(0, 5)

    const biggestMovers = projects
      .filter((p) => p.rank_delta > 0)
      .sort((a, b) => b.rank_delta - a.rank_delta)
      .slice(0, 3)

    const newEntries = projects.filter((p) => p.is_new === true)

    const totalStarsGained = projects.reduce((sum, p) => sum + (p.stars_gained_7d || 0), 0)

    const stats = {
      totalProjects: projects.length,
      totalStarsGained,
      newCount: newEntries.length,
    }

    return res.status(200).json({
      week: weekStr,
      weekLabel,
      top5,
      biggestMovers,
      newEntries,
      stats,
    })
  } catch (err) {
    console.error('recap error:', err)
    return res.status(503).json({ error: 'Internal server error' })
  }
}
