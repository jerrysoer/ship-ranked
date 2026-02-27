#!/usr/bin/env node

/**
 * ShipRanked data pipeline — CLI runner.
 * Usage: node --env-file=.env.local scripts/fetch-projects.js
 */

import { runPipeline } from '../lib/pipeline.js'

try {
  const summary = await runPipeline()
  console.log('Summary:', JSON.stringify(summary, null, 2))
  process.exit(0)
} catch (err) {
  console.error('Pipeline failed:', err.message)
  process.exit(1)
}
