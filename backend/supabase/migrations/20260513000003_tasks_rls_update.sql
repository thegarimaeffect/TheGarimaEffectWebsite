-- ============================================================================
-- THE GARIMA EFFECT — Tasks RLS update for client review workflow
-- ============================================================================

-- Drop the previous intern-update policy (we're keeping it permissive — intern
-- can still update assigned tasks for drive_link + status). Just re-declare.

-- Allow client to SELECT submitted tasks for their own active campaigns
DROP POLICY IF EXISTS t_client_select ON public.tasks;
CREATE POLICY t_client_select ON public.tasks FOR SELECT
  USING (
    submission_status IN ('submitted','approved','rejected')
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = tasks.campaign_id
        AND c.client_id = auth.uid()
        AND c.status IN ('active','paused','completed')
    )
  );

-- Allow client to UPDATE only submission_status + rejection_reason on their own campaign's submitted tasks
-- (and we cannot easily restrict which columns via RLS — restrict via app + the WITH CHECK)
DROP POLICY IF EXISTS t_client_update ON public.tasks;
CREATE POLICY t_client_update ON public.tasks FOR UPDATE
  USING (
    submission_status IN ('submitted','approved','rejected')
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = tasks.campaign_id
        AND c.client_id = auth.uid()
        AND c.status IN ('active','paused','completed')
    )
  )
  WITH CHECK (
    -- after update, only allow approved or rejected outcomes
    submission_status IN ('approved','rejected')
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = tasks.campaign_id
        AND c.client_id = auth.uid()
        AND c.status IN ('active','paused','completed')
    )
  );

-- Belt-and-braces: also lock down what columns a client can touch via a trigger.
-- The CHECK above forces submission_status, but a malicious client could try to
-- change brand_name, drive_link, etc. via the API. So we explicitly reset everything
-- else to the OLD value when the row is being updated by a client.
CREATE OR REPLACE FUNCTION public.tg_tasks_client_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_client BOOLEAN;
BEGIN
  -- Only enforce when the actor is the campaign's client
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = NEW.campaign_id AND c.client_id = auth.uid()
  ) INTO is_client;

  IF NOT is_client THEN
    RETURN NEW;  -- PM / Admin / Intern unaffected
  END IF;

  -- Client may only change: submission_status, rejection_reason
  -- Force everything else back to OLD
  NEW.title             := OLD.title;
  NEW.description       := OLD.description;
  NEW.brand_name        := OLD.brand_name;
  NEW.assigned_to       := OLD.assigned_to;
  NEW.calendar_day_id   := OLD.calendar_day_id;
  NEW.status            := OLD.status;
  NEW.due_date          := OLD.due_date;
  NEW.priority          := OLD.priority;
  NEW.drive_link        := OLD.drive_link;
  NEW.campaign_id       := OLD.campaign_id;
  NEW.created_by        := OLD.created_by;
  NEW.created_at        := OLD.created_at;
  -- submitted_at preserved
  NEW.submitted_at      := OLD.submitted_at;

  -- reviewed_at + reviewed_by are stamped by the auto-transitions trigger

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_tasks_client_guard ON public.tasks;
CREATE TRIGGER on_tasks_client_guard
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_tasks_client_guard();

-- Make sure the auto-transitions trigger runs AFTER the guard so reviewed_at is set
DROP TRIGGER IF EXISTS on_tasks_auto_transitions ON public.tasks;
CREATE TRIGGER zz_on_tasks_auto_transitions
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_tasks_auto_transitions();
