-- lameyer.net · 0002 · service_role access to public.profiles.
-- This project does not grant table privileges to service_role automatically, so 0001 (perfiles_rls) left the secret key
-- with "permission denied for table profiles" (42501). service_role bypasses RLS: only server code uses it
-- (Edge Functions via supabaseAdmin, local admin tools with SUPABASE_SECRET_KEY). Browser roles are unchanged:
-- anon has nothing; authenticated keeps SELECT + UPDATE (nombre) under the RLS policies of 0001.
-- An applied migration is never edited: fix it with a new one.

grant select, insert, update, delete on table public.profiles to service_role;
