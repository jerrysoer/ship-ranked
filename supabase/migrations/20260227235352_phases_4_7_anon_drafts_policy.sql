-- Phases 4-7: Add anon read policy for weekly_drafts
-- The dashboard (?view=dashboard) uses the Supabase anon key to fetch drafts.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weekly_drafts' AND policyname = 'Anon read drafts'
  ) THEN
    CREATE POLICY "Anon read drafts" ON weekly_drafts FOR SELECT TO anon USING (true);
  END IF;
END $$;
