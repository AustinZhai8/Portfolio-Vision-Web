-- Fixes for issues flagged by Supabase's security advisor (12 Jun 2026):
--   1. rls_disabled_in_public      — `portfolios` had no Row-Level Security,
--      so any anon/authenticated caller could read, edit, or delete every
--      user's saved portfolios (PortfolioPanel.jsx scopes update/delete only
--      by row id, relying entirely on RLS to enforce ownership).
--   2. function_search_path_mutable — `delete_user()` didn't pin search_path.
--   3. Public/signed-in callers of the SECURITY DEFINER `delete_user()`.
--
-- This project has no Supabase CLI / migrations set up — run this file's
-- contents directly in the Supabase SQL editor, same as 001_etf_data.sql.

-- 1. Lock down `portfolios` to its owner.
-- `create table if not exists` is a no-op if the table already exists;
-- it's here so the schema is reproducible from this repo.
create table if not exists portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  holdings    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

alter table portfolios enable row level security;

drop policy if exists "Users can view own portfolios" on portfolios;
create policy "Users can view own portfolios"
  on portfolios for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own portfolios" on portfolios;
create policy "Users can insert own portfolios"
  on portfolios for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own portfolios" on portfolios;
create policy "Users can update own portfolios"
  on portfolios for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own portfolios" on portfolios;
create policy "Users can delete own portfolios"
  on portfolios for delete
  using (auth.uid() = user_id);

-- 2 & 3. Re-create delete_user() with a pinned search_path, and restrict
-- who can call it. It's SECURITY DEFINER (needs elevated privilege to
-- delete from auth.users), but it only ever deletes auth.uid() — the
-- caller's own row — so granting EXECUTE to `authenticated` is intentional
-- and safe; the fix here is just removing public/anon's ability to call it.
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function delete_user() from public;
revoke all on function delete_user() from anon;
grant execute on function delete_user() to authenticated;
