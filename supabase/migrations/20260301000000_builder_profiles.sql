-- Builder profiles and project claims for the claim/profile system

CREATE TABLE builder_profiles (
  github_handle   TEXT PRIMARY KEY,
  tagline         TEXT,
  website_url     TEXT,
  x_handle        TEXT,
  discord_url     TEXT,
  claim_token     TEXT,
  verified        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_claims (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          TEXT REFERENCES ranked_projects(id),
  github_handle       TEXT NOT NULL,
  status              TEXT DEFAULT 'pending',
  verification_method TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE builder_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON builder_profiles FOR SELECT TO anon USING (true);

ALTER TABLE project_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon insert claims" ON project_claims FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public read claims" ON project_claims FOR SELECT TO anon USING (true);
