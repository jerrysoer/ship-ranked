// Aggregated analytics for the dashboard
// Returns event counts, daily trends, top badge projects, and recent activity

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return res.status(503).json({ error: 'Analytics unavailable' })
  }

  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const response = await fetch(
      `${url}/rest/v1/analytics_events?created_at=gte.${encodeURIComponent(since)}&select=event,data,created_at,source&order=created_at.desc&limit=5000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch analytics' })
    }

    const events = await response.json()

    // Summary
    const today = new Date().toISOString().slice(0, 10)
    const summary = {
      total: events.length,
      today: events.filter(e => e.created_at?.startsWith(today)).length,
      badgeViews: events.filter(e => e.event === 'badge-view').length,
      shareClicks: events.filter(e => e.event === 'share-click').length,
    }

    // By type
    const typeCounts = {}
    for (const e of events) {
      typeCounts[e.event] = (typeCounts[e.event] || 0) + 1
    }
    const byType = Object.entries(typeCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)

    // Daily trend (14 days, zero-filled)
    const dailyTrend = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const dateStr = d.toISOString().slice(0, 10)
      const count = events.filter(e => e.created_at?.startsWith(dateStr)).length
      dailyTrend.push({ date: dateStr, count })
    }

    // Top badge projects
    const badgeProjects = {}
    for (const e of events) {
      if (e.event === 'badge-view' && e.data?.project) {
        const p = e.data.project
        badgeProjects[p] = (badgeProjects[p] || 0) + 1
      }
    }
    const topBadgeProjects = Object.entries(badgeProjects)
      .map(([project, count]) => ({ project, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent events (last 20)
    const recent = events.slice(0, 20).map(e => ({
      event: e.event,
      data: e.data,
      created_at: e.created_at,
      source: e.source,
    }))

    return res.status(200).json({
      summary,
      byType,
      dailyTrend,
      topBadgeProjects,
      recent,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return res.status(502).json({ error: 'Failed to fetch analytics' })
  }
}
