-- ============================================================================
-- Fix: calendar_days_v must respect the caller's RLS, not the owner's.
-- Default Postgres behavior is security_definer-ish on views; flip to invoker.
-- ============================================================================

ALTER VIEW public.calendar_days_v SET (security_invoker = true);
