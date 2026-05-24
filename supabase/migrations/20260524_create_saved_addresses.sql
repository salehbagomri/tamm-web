-- Migration: create_saved_addresses
-- Saved addresses for customers (quick pick during checkout)

CREATE TABLE IF NOT EXISTS saved_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'المنزل',
  address     TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'المكلا',
  lat         FLOAT8,
  lng         FLOAT8,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_addresses_user_idx ON saved_addresses(user_id);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sa_select_own" ON saved_addresses;
CREATE POLICY "sa_select_own" ON saved_addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sa_insert_own" ON saved_addresses;
CREATE POLICY "sa_insert_own" ON saved_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sa_update_own" ON saved_addresses;
CREATE POLICY "sa_update_own" ON saved_addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sa_delete_own" ON saved_addresses;
CREATE POLICY "sa_delete_own" ON saved_addresses
  FOR DELETE USING (auth.uid() = user_id);
