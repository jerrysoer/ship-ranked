export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(503).json({ error: 'Service unavailable' })

  const { github_handle, claim_token, tagline, website_url, x_handle, discord_url } =
    req.body || {}

  if (!github_handle || !claim_token) {
    return res.status(400).json({ error: 'github_handle and claim_token are required' })
  }

  // Fetch the existing profile to verify the claim_token
  const profileRes = await fetch(
    `${url}/rest/v1/builder_profiles?github_handle=eq.${encodeURIComponent(github_handle)}&select=claim_token`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const profiles = await profileRes.json()

  if (!profiles || profiles.length === 0) {
    return res.status(403).json({ ok: false, error: 'Invalid claim token' })
  }

  const stored = profiles[0]

  if (stored.claim_token !== claim_token) {
    return res.status(403).json({ ok: false, error: 'Invalid claim token' })
  }

  // Build the update payload — only include non-null, non-undefined fields
  const updates = { updated_at: new Date().toISOString() }
  if (tagline !== undefined && tagline !== null) updates.tagline = tagline
  if (website_url !== undefined && website_url !== null) updates.website_url = website_url
  if (x_handle !== undefined && x_handle !== null) updates.x_handle = x_handle
  if (discord_url !== undefined && discord_url !== null) updates.discord_url = discord_url

  const updateRes = await fetch(
    `${url}/rest/v1/builder_profiles?github_handle=eq.${encodeURIComponent(github_handle)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updates),
    }
  )

  const updated = await updateRes.json()
  const profile = updated && updated.length > 0 ? updated[0] : null

  return res.status(200).json({ ok: true, profile })
}
