-- ============================================================================
-- THE GARIMA EFFECT — Notifications system
-- Emits in-app alerts to relevant users on key task events
-- ============================================================================

CREATE TYPE public.notification_type AS ENUM (
  'task_assigned',
  'task_submitted',
  'task_approved',
  'task_rejected',
  'task_resubmitted',
  'campaign_started'
);

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  task_id     UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read_at);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY n_self_select ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY n_self_update ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY n_admin_all ON public.notifications FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inserts only via SECURITY DEFINER triggers (no direct insert from client)
-- so no INSERT policy — the trigger bypasses RLS as SECURITY DEFINER.

-- ============================================================================
-- HELPER: send_notification
-- ============================================================================
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id     UUID,
  p_type        public.notification_type,
  p_title       TEXT,
  p_body        TEXT,
  p_link        TEXT,
  p_task_id     UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_metadata    JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link, task_id, campaign_id, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_link, p_task_id, p_campaign_id, p_metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;

-- ============================================================================
-- TRIGGER: notify on task lifecycle events
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_tasks_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_campaign RECORD;
  v_intern_name TEXT;
  v_client_name TEXT;
BEGIN
  SELECT c.id, c.name, c.client_id, c.pm_id
    INTO v_campaign
    FROM public.campaigns c WHERE c.id = NEW.campaign_id;

  -- =================================================
  -- INSERT (new task assigned)
  -- =================================================
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_to IS NOT NULL THEN
      PERFORM public.send_notification(
        NEW.assigned_to,
        'task_assigned',
        'New task assigned',
        format('%s · %s — due %s',
               COALESCE(NEW.brand_name, v_campaign.name),
               NEW.title,
               COALESCE(NEW.due_date::text, 'no deadline')),
        '/intern',
        NEW.id,
        NEW.campaign_id
      );
    END IF;
    RETURN NEW;
  END IF;

  -- =================================================
  -- UPDATE
  -- =================================================
  IF TG_OP = 'UPDATE' THEN
    -- Reassignment
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL THEN
      PERFORM public.send_notification(
        NEW.assigned_to,
        'task_assigned',
        'Task reassigned to you',
        format('%s · %s', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
        '/intern',
        NEW.id,
        NEW.campaign_id
      );
    END IF;

    -- Submission to client (work delivered)
    IF NEW.submission_status = 'submitted'
       AND OLD.submission_status IS DISTINCT FROM 'submitted' THEN
      -- Notify client
      PERFORM public.send_notification(
        v_campaign.client_id,
        'task_submitted',
        'New work ready for review',
        format('%s · %s', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
        '/client',
        NEW.id,
        NEW.campaign_id
      );
      -- Notify PM
      PERFORM public.send_notification(
        v_campaign.pm_id,
        'task_submitted',
        'Task submitted to client',
        format('%s · %s', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
        '/pm/campaigns/' || NEW.campaign_id::text,
        NEW.id,
        NEW.campaign_id
      );
    END IF;

    -- Re-submission after rejection
    IF NEW.submission_status = 'submitted'
       AND OLD.submission_status = 'rejected' THEN
      PERFORM public.send_notification(
        v_campaign.client_id,
        'task_resubmitted',
        'Reworked & resubmitted',
        format('%s · %s — fresh take ready', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
        '/client',
        NEW.id,
        NEW.campaign_id
      );
    END IF;

    -- Client approved
    IF NEW.submission_status = 'approved'
       AND OLD.submission_status IS DISTINCT FROM 'approved' THEN
      IF NEW.assigned_to IS NOT NULL THEN
        PERFORM public.send_notification(
          NEW.assigned_to,
          'task_approved',
          '✦ Approved by client',
          format('%s · %s — locked in', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
          '/intern',
          NEW.id,
          NEW.campaign_id
        );
      END IF;
      PERFORM public.send_notification(
        v_campaign.pm_id,
        'task_approved',
        'Client approved',
        format('%s · %s', COALESCE(NEW.brand_name, v_campaign.name), NEW.title),
        '/pm/campaigns/' || NEW.campaign_id::text,
        NEW.id,
        NEW.campaign_id
      );
    END IF;

    -- Client rejected
    IF NEW.submission_status = 'rejected'
       AND OLD.submission_status IS DISTINCT FROM 'rejected' THEN
      IF NEW.assigned_to IS NOT NULL THEN
        PERFORM public.send_notification(
          NEW.assigned_to,
          'task_rejected',
          '⚠ Revisions requested',
          format('%s · %s — %s',
                 COALESCE(NEW.brand_name, v_campaign.name),
                 NEW.title,
                 LEFT(COALESCE(NEW.rejection_reason, 'needs another pass'), 80)),
          '/intern',
          NEW.id,
          NEW.campaign_id,
          jsonb_build_object('reason', NEW.rejection_reason)
        );
      END IF;
      PERFORM public.send_notification(
        v_campaign.pm_id,
        'task_rejected',
        'Client requested changes',
        format('%s · %s — %s',
               COALESCE(NEW.brand_name, v_campaign.name),
               NEW.title,
               LEFT(COALESCE(NEW.rejection_reason, 'needs another pass'), 80)),
        '/pm/campaigns/' || NEW.campaign_id::text,
        NEW.id,
        NEW.campaign_id,
        jsonb_build_object('reason', NEW.rejection_reason)
      );
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_tasks_notify ON public.tasks;
CREATE TRIGGER on_tasks_notify
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_tasks_notify();
