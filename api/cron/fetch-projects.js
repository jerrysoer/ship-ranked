import { runPipeline } from '../../lib/pipeline.js'

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const summary = await runPipeline()
    return res.status(200).json({ ok: true, ...summary })
  } catch (err) {
    console.error('Cron pipeline error:', err)
    return res.status(500).json({ error: err.message })
  }
}
