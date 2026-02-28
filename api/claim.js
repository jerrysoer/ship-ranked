export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(503).json({ error: 'Service unavailable' })

  if (req.method === 'POST') {
    const { project_id, github_handle } = req.body || {}

    if (!project_id || !github_handle) {
      return res.status(400).json({ error: 'project_id and github_handle are required' })
    }

    // Fetch the project from ranked_projects
    const projectRes = await fetch(
      `${url}/rest/v1/ranked_projects?id=eq.${encodeURIComponent(project_id)}&select=full_name,builder_handle`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const projects = await projectRes.json()
    if (!projects || projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const { full_name } = projects[0]

    // Verify the handle matches: full_name should start with github_handle/
    const ownerMatches = full_name.toLowerCase().startsWith(`${github_handle.toLowerCase()}/`)

    if (!ownerMatches) {
      return res.status(200).json({
        ok: false,
        reason: 'not-owner',
        instructions: 'Your GitHub handle must match the repository owner.',
      })
    }

    // Check GitHub API for SHIPRANKED.md in the repo
    const ghRes = await fetch(`https://api.github.com/repos/${full_name}/contents/SHIPRANKED.md`, {
      headers: {
        Authorization: `token ${process.env.GH_DATA_TOKEN}`,
        'User-Agent': 'ShipRanked',
      },
    })

    if (ghRes.status !== 200) {
      return res.status(200).json({
        ok: false,
        reason: 'no-shipranked-md',
        instructions:
          'Add a file named SHIPRANKED.md to the root of your repo, then try again. It can be empty — we just use it as a verification signal.',
      })
    }

    // Both checks passed — generate claim token and upsert builder_profiles
    const claim_token = crypto.randomUUID()

    await fetch(`${url}/rest/v1/builder_profiles`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        github_handle,
        verified: true,
        claim_token,
        updated_at: new Date().toISOString(),
      }),
    })

    await fetch(`${url}/rest/v1/project_claims`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        project_id,
        github_handle,
        status: 'verified',
        verification_method: 'shipranked-md',
      }),
    })

    return res.status(200).json({ ok: true, status: 'verified', claim_token })
  }

  if (req.method === 'GET') {
    const { project_id } = req.query

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' })
    }

    // Query project_claims for a verified claim
    const claimsRes = await fetch(
      `${url}/rest/v1/project_claims?project_id=eq.${encodeURIComponent(project_id)}&status=eq.verified&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const claims = await claimsRes.json()

    if (!claims || claims.length === 0) {
      return res.status(200).json({ claimed: false, profile: null })
    }

    const { github_handle } = claims[0]

    // Fetch the builder_profiles row for that github_handle
    const profileRes = await fetch(
      `${url}/rest/v1/builder_profiles?github_handle=eq.${encodeURIComponent(github_handle)}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const profiles = await profileRes.json()
    const profile = profiles && profiles.length > 0 ? profiles[0] : null

    return res.status(200).json({ claimed: true, profile })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
