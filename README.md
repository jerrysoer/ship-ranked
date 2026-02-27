# ShipRanked

Live leaderboard ranking Claude Code projects by weekly star momentum.

**[jerrysoer.github.io/ship-ranked](https://jerrysoer.github.io/ship-ranked/)**

## How it works

Every day a cron job snapshots GitHub star counts for ~400 projects built with Claude Code. The chart shows stars gained over a rolling 7-day window. A repo with 12 total stars but +10 this week ranks above a repo with 500 total stars but only +2.

No algorithm. No editorial picks. Just what people are starring right now.

## Architecture

```
GitHub API  ──>  pipeline.js  ──>  Supabase  ──>  React SPA
                 (Vercel cron)     (Postgres)     (GitHub Pages)
```

**Frontend**: React 19 + Vite SPA on GitHub Pages
**Backend**: Vercel serverless functions (cron, OG images, share pages)
**Database**: Supabase with row-level security (public read, server write)

## Project structure

```
src/
  App.jsx              Main SPA — podium, chart rows, filters, deep-link
  lib/supabase.js      Client-side Supabase (anon key, read-only)
  index.css            Theme variables + animations
api/
  cron/fetch-projects.js   Daily pipeline trigger (CRON_SECRET auth)
  og.js                    Dynamic OG image (SVG)
  share.js                 Share page with meta tags + redirect
lib/
  pipeline.js          Core logic — fetch, filter, rank, snapshot
scripts/
  fetch-projects.js    Local CLI runner for testing the pipeline
```

## Setup

```bash
npm install
```

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the Supabase schema:

```bash
# Paste supabase-schema.sql into your Supabase SQL editor
```

Start dev server:

```bash
npm run dev
```

The app works without Supabase — it falls back to mock data.

## Vercel env vars

The API routes need these in Vercel project settings:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GH_DATA_TOKEN              # GitHub PAT for API searches
CRON_SECRET                # Auto-set by Vercel for cron auth
```

## Pipeline

The daily cron (`0 14 * * *` — 2 PM UTC) runs `lib/pipeline.js`:

1. Searches GitHub for repos with `CLAUDE.md`, `topic:claude-code`, or `topic:vibe-coding`
2. Filters for active projects (pushed in last 90 days, description >10 chars)
3. Compares current stars against the oldest snapshot in a 7-day window
4. Ranks by `stars_gained_7d` descending
5. Computes rank deltas vs. yesterday
6. Upserts to `ranked_projects` + `ranked_snapshots`

Run locally:

```bash
npm run fetch
```

## Deep links

Share pages redirect to the SPA with a project param:

```
https://ship-ranked.vercel.app/p/owner--repo
  → redirects to
https://jerrysoer.github.io/ship-ranked/?project=owner--repo
  → scrolls to project, gold highlight for 3s
```

## Deployment

**Frontend** auto-deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

**Backend** auto-deploys to Vercel on push to `main`.

## Built with

React 19, Vite 6, Supabase, Vercel, GitHub Pages, Umami Analytics
