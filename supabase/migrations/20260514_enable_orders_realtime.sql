-- Enable Supabase Realtime for the orders table so client-side
-- subscribers receive postgres_changes events on INSERT/UPDATE/DELETE.
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
