-- ============================================================================
-- Fix: make user_id auto-fill from the JWT on insert.
-- Without this, every client insert needed to send user_id manually AND
-- match auth.uid() per RLS — too easy to silently fail. Adding the default
-- means the client just sends {name, color, ...} and the row is correctly
-- attributed to the logged-in user automatically.
-- ============================================================================

alter table public.hacker_goals
  alter column user_id set default auth.uid();

alter table public.hacker_entries
  alter column user_id set default auth.uid();

-- Also retro-fix the older hacker_tasks / hacker_time_logs tables for
-- consistency (in case they get used later).
alter table public.hacker_tasks
  alter column user_id set default auth.uid();

alter table public.hacker_time_logs
  alter column user_id set default auth.uid();
