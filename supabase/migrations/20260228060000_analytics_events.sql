-- Analytics events: unified tracking for client + server events
-- Replaces Umami (client-only) with Supabase-native tracking

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event       TEXT NOT NULL,
  data        JSONB DEFAULT '{}',
  source      TEXT NOT NULL DEFAULT 'client',
  referrer    TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_event_created
  ON analytics_events(event, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon insert events"
  ON analytics_events FOR INSERT TO anon WITH CHECK (true);
