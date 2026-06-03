-- ============================================================================
-- HACKER CONSOLE — spreadsheet mode
-- Replaces tasks-with-time-logs pattern with a cleaner "goals × dates" grid.
-- One row per (user, goal, date) → directly editable hours cell.
-- ============================================================================

-- ---------- GOALS (the columns of the spreadsheet) -------------------------
create table if not exists public.hacker_goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  color        text default '#00ff9c',
  position     int  not null default 0,
  target_hours numeric(4,2),                       -- optional daily target
  created_at   timestamptz not null default now(),
  archived_at  timestamptz,
  unique (user_id, name)
);

create index if not exists hacker_goals_user_idx on public.hacker_goals(user_id, position);

-- ---------- ENTRIES (one cell per (goal, date)) ----------------------------
create table if not exists public.hacker_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  goal_id     uuid not null references public.hacker_goals(id) on delete cascade,
  entry_date  date not null default current_date,
  hours       numeric(4,2) not null check (hours >= 0 and hours <= 24),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, goal_id, entry_date)
);

create index if not exists hacker_entries_user_date_idx on public.hacker_entries(user_id, entry_date);
create index if not exists hacker_entries_goal_idx      on public.hacker_entries(goal_id);

-- Auto-update updated_at on row updates
create or replace function public.hacker_entries_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists hacker_entries_touch_t on public.hacker_entries;
create trigger hacker_entries_touch_t
  before update on public.hacker_entries
  for each row execute function public.hacker_entries_touch();

-- ---------- RLS ------------------------------------------------------------
alter table public.hacker_goals    enable row level security;
alter table public.hacker_entries  enable row level security;

drop policy if exists "hacker_goals_own"   on public.hacker_goals;
drop policy if exists "hacker_entries_own" on public.hacker_entries;

create policy "hacker_goals_own" on public.hacker_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "hacker_entries_own" on public.hacker_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- AGGREGATE: daily totals ---------------------------------------
create or replace view public.hacker_daily_totals as
select
  user_id,
  entry_date,
  sum(hours)::numeric(6,2)         as total_hours,
  count(*) filter (where hours > 0) as goals_touched
from public.hacker_entries
group by user_id, entry_date;

grant select on public.hacker_daily_totals to authenticated;
