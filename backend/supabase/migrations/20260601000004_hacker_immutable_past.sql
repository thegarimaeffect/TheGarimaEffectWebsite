-- ============================================================================
-- Hacker Console: make past days immutable.
-- Once a day passes, entries for that day become permanent — no edits,
-- no deletes, no inserts. Enforced at the database level via RLS so even
-- a direct API call can't bypass it.
-- ============================================================================

-- Drop the simple "own data" policy and replace with split policies:
--   • SELECT  → all of user's data (full history forever)
--   • INSERT  → only today (entry_date = current_date)
--   • UPDATE  → only today (both before and after must be today)
--   • DELETE  → only today

drop policy if exists "hacker_entries_own" on public.hacker_entries;

create policy "hacker_entries_select_all_own"
  on public.hacker_entries
  for select
  using (auth.uid() = user_id);

create policy "hacker_entries_insert_today"
  on public.hacker_entries
  for insert
  with check (auth.uid() = user_id and entry_date = current_date);

create policy "hacker_entries_update_today"
  on public.hacker_entries
  for update
  using (auth.uid() = user_id and entry_date = current_date)
  with check (auth.uid() = user_id and entry_date = current_date);

create policy "hacker_entries_delete_today"
  on public.hacker_entries
  for delete
  using (auth.uid() = user_id and entry_date = current_date);

-- Bonus safety: a trigger that blocks any attempt to change entry_date
-- on an existing row (prevents "edit yesterday by setting date to today")
create or replace function public.hacker_entries_freeze_date()
returns trigger language plpgsql as $$
begin
  if new.entry_date <> old.entry_date then
    raise exception 'entry_date is immutable once set';
  end if;
  return new;
end$$;

drop trigger if exists hacker_entries_freeze_date_t on public.hacker_entries;
create trigger hacker_entries_freeze_date_t
  before update on public.hacker_entries
  for each row execute function public.hacker_entries_freeze_date();
