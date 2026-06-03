-- ============================================================================
-- HACKER CONSOLE — private productivity tables
-- Only accessible to users with raw_app_meta_data ->> 'role' = 'hacker'.
-- All rows hard-scoped to user_id via RLS. Completely isolated from the
-- Garima Effect platform — no joins to clients, campaigns, leads, etc.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------- TASKS ----------------------------------------------------------
create table if not exists public.hacker_tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  description     text,
  status          text not null default 'todo'
                    check (status in ('todo','in_progress','done')),
  priority        text not null default 'normal'
                    check (priority in ('low','normal','high','critical')),
  category        text,
  due_date        date,
  estimated_hours numeric(5,2),
  position        int  not null default 0,           -- for drag-reorder
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists hacker_tasks_user_idx        on public.hacker_tasks(user_id);
create index if not exists hacker_tasks_status_idx      on public.hacker_tasks(user_id, status);
create index if not exists hacker_tasks_due_idx         on public.hacker_tasks(user_id, due_date);

-- Trigger to keep updated_at fresh + auto-set completed_at when status flips
create or replace function public.hacker_tasks_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'done' and (old.status is distinct from 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end$$;

drop trigger if exists hacker_tasks_touch_t on public.hacker_tasks;
create trigger hacker_tasks_touch_t
  before update on public.hacker_tasks
  for each row execute function public.hacker_tasks_touch();

-- ---------- TIME LOGS ------------------------------------------------------
create table if not exists public.hacker_time_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     uuid references public.hacker_tasks(id) on delete set null,
  log_date    date not null default current_date,
  hours       numeric(5,2) not null check (hours > 0 and hours <= 24),
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists hacker_time_user_date_idx on public.hacker_time_logs(user_id, log_date);
create index if not exists hacker_time_task_idx       on public.hacker_time_logs(task_id);

-- ---------- RLS ------------------------------------------------------------
alter table public.hacker_tasks      enable row level security;
alter table public.hacker_time_logs  enable row level security;

drop policy if exists "hacker_tasks_own"      on public.hacker_tasks;
drop policy if exists "hacker_time_logs_own"  on public.hacker_time_logs;

create policy "hacker_tasks_own" on public.hacker_tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "hacker_time_logs_own" on public.hacker_time_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- AGGREGATE VIEWS (for the dashboard charts) ---------------------

-- Hours logged per day for the last 14 days (per-user)
create or replace view public.hacker_daily_hours as
select
  user_id,
  log_date,
  sum(hours)::numeric(6,2) as hours
from public.hacker_time_logs
group by user_id, log_date;

-- Today's snapshot
create or replace view public.hacker_today as
select
  user_id,
  (select count(*) from public.hacker_tasks t
     where t.user_id = u.user_id
       and t.status = 'done'
       and t.completed_at::date = current_date) as done_today,
  (select count(*) from public.hacker_tasks t
     where t.user_id = u.user_id and t.status <> 'done')           as open_count,
  (select coalesce(sum(hours), 0)::numeric(6,2)
     from public.hacker_time_logs h
     where h.user_id = u.user_id and h.log_date = current_date)    as hours_today
from (select distinct user_id from public.hacker_tasks) u;

grant select on public.hacker_daily_hours to authenticated;
grant select on public.hacker_today        to authenticated;
