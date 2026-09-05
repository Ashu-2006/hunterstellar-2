-- 002_leaderboard.sql
-- Public, read-only projection of teams for the leaderboard. The frontend
-- reads this directly with the anon key, so it must never expose password,
-- route, session_token, email or members.
--
-- in_null_void: the crew has reached the terminal stop (route index 4), which
-- includes crews that have already finished there.
create or replace view public.leaderboard as
select
  id,
  team_name,
  progress,
  status,
  lock_until,
  wrong_attempts,
  last_correct_at,
  (progress >= 4) as in_null_void
from public.teams
order by progress desc, last_correct_at asc nulls last;

-- Row-level security on the base tables, so the anon key can read the view
-- but not the tables underneath it. The service-role key bypasses RLS.
alter table public.teams enable row level security;
alter table public.islands enable row level security;
alter table public.questions enable row level security;
alter table public.event_config enable row level security;
alter table public.announcements enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.leaderboard to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
