function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let projects = [];

  if (!url || !key) {
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Supabase unavailable: no env vars configured -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ShipRanked — Claude Code Project Rankings</title>
    <link>https://jerrysoer.github.io/ship-ranked/</link>
    <description>Live leaderboard ranking Claude Code projects by weekly star momentum.</description>
    <atom:link href="https://ship-ranked.vercel.app/api/rss" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
    return res.status(200).send(emptyFeed);
  }

  try {
    const apiRes = await fetch(
      `${url}/rest/v1/ranked_projects?review_status=eq.approved&category=neq.featured&order=rank.asc&limit=25&select=name,full_name,description,url,rank,stars_total,stars_gained_7d,category`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );

    if (apiRes.ok) {
      projects = await apiRes.json();
    }
  } catch (_) {
    projects = [];
  }

  const items = projects.map((p) => {
    const slug = String(p.full_name || '').replace(/\//g, '--');
    const guid = `https://ship-ranked.vercel.app/p/${slug}`;
    const title = escapeXml(`${p.name} — #${p.rank} on ShipRanked`);
    const link = escapeXml(p.url);
    const description = escapeXml(
      `★ ${p.stars_total} stars · ↑ +${p.stars_gained_7d} this week — ${p.description}`
    );
    const category = escapeXml(p.category);

    return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <category>${category}</category>
      <guid isPermaLink="true">${escapeXml(guid)}</guid>
    </item>`;
  }).join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ShipRanked — Claude Code Project Rankings</title>
    <link>https://jerrysoer.github.io/ship-ranked/</link>
    <description>Live leaderboard ranking Claude Code projects by weekly star momentum.</description>
    <atom:link href="https://ship-ranked.vercel.app/api/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return res.status(200).send(feed);
}
