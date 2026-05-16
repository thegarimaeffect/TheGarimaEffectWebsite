-- ============================================================================
-- THE GARIMA EFFECT — Foundations extension
-- welcome_seen_at on profiles, expanded notification types,
-- content-writer flag on campaign_members
-- ============================================================================

-- Welcome modal tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_seen_at TIMESTAMPTZ;

-- Auth hook: self-signups via the public page must always land as 'client'.
-- We patch handle_new_user to ignore a role passed in raw_user_meta_data
-- for regular signups (keep it only when called by the service_role, which
-- is what admin.createUser + the seed both do via an explicit UPDATE anyway).
-- The simplest safe approach: strip the role claim so the default 'client' applies,
-- and rely on the explicit UPDATE in /api/admin/users to set the real role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role public.user_role := 'client';
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    v_role,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                          || jsonb_build_object('role', v_role::text)
  WHERE id = NEW.id;

  RETURN NEW;
END $$;

-- New notification types for all the new workflows
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'calendar_submitted';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'calendar_approved';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'calendar_changes_requested';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'task_due_soon';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'lead_followup';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'credentials_requested';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message_received';

-- Content-writer intern flag (per campaign, one intern can be designated)
ALTER TABLE public.campaign_members
  ADD COLUMN IF NOT EXISTS is_content_writer BOOLEAN NOT NULL DEFAULT false;
