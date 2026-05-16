-- ============================================================================
-- THE GARIMA EFFECT — Calendar rebuild
-- Retire the rigid 14-day calendar_days model and strategy templates.
-- Replace with a flexible calendar + calendar_rows grid.
-- Columns: date, day, time, post_type, pillar, ideation, reference,
--           client_inputs, edited_reel_url, collaborators, drive_link, caption
-- ============================================================================

-- ============================================================================
-- 1. RETIRE OLD OBJECTS
-- ============================================================================

-- Drop the security_invoker view first (depends on calendar_days)
DROP VIEW IF EXISTS public.calendar_days_v;

-- Drop old strategy tables
DROP TABLE IF EXISTS public.strategy_template_days CASCADE;
DROP TABLE IF EXISTS public.strategy_templates CASCADE;

-- Add new column to tasks BEFORE dropping the old one
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS calendar_row_id UUID;

-- Drop old calendar table (CASCADE removes FK constraint on tasks.calendar_day_id)
DROP TABLE IF EXISTS public.calendar_days CASCADE;

-- Now safely remove the orphaned column
ALTER TABLE public.tasks
  DROP COLUMN IF EXISTS calendar_day_id;

-- ============================================================================
-- 2. NEW ENUMS
-- ============================================================================

CREATE TYPE public.calendar_state AS ENUM (
  'building',          -- team is constructing the calendar
  'sent_to_client',    -- client can now view and leave inputs
  'changes_requested', -- client asked for changes; back to building
  'approved'           -- client approved; PM can now assign reel tasks
);

CREATE TYPE public.row_status AS ENUM (
  'draft',
  'ready',
  'in_production',
  'posted'
);

-- ============================================================================
-- 3. NEW TABLES
-- ============================================================================

-- One calendar per campaign
CREATE TABLE public.calendars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  state       public.calendar_state NOT NULL DEFAULT 'building',
  sent_at     TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);
CREATE INDEX idx_calendars_campaign ON public.calendars(campaign_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.calendars
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Flexible content rows
CREATE TABLE public.calendar_rows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id     UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  row_order       INT NOT NULL DEFAULT 0,
  post_date       DATE,
  post_time       TIME,
  post_type       TEXT,  -- Reel | Carousel | Story | Live | Post | UGC
  pillar          TEXT,  -- Brand | Product | Educational | UGC | Engagement
  ideation        TEXT,
  reference       TEXT,
  caption         TEXT,
  client_inputs   TEXT,  -- what the client types in their approval column
  edited_reel_url TEXT,
  drive_link      TEXT CHECK (drive_link IS NULL OR drive_link ~* '^https?://'),
  collaborators   UUID[] NOT NULL DEFAULT '{}'::uuid[],
  status          public.row_status NOT NULL DEFAULT 'draft',
  client_approved_at  TIMESTAMPTZ,
  client_approved_by  UUID REFERENCES public.profiles(id),
  posted_at       TIMESTAMPTZ,
  created_by      UUID REFERENCES public.profiles(id),
  updated_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_calendar_rows_calendar ON public.calendar_rows(calendar_id, row_order);
CREATE INDEX idx_calendar_rows_date     ON public.calendar_rows(post_date);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.calendar_rows
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Wire calendar_row_id FK now that the table exists
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_calendar_row_fk
  FOREIGN KEY (calendar_row_id)
  REFERENCES public.calendar_rows(id)
  ON DELETE SET NULL;

-- ============================================================================
-- 4. AUTO-CREATE CALENDAR WHEN CAMPAIGN IS CREATED
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_campaigns_create_calendar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.calendars (campaign_id)
  VALUES (NEW.id)
  ON CONFLICT (campaign_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_campaign_create_calendar ON public.campaigns;
CREATE TRIGGER on_campaign_create_calendar
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_campaigns_create_calendar();

-- ============================================================================
-- 5. HELPER: content-writer check
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_content_writer_of(p_campaign UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_members cm
    WHERE cm.campaign_id = p_campaign
      AND cm.user_id = auth.uid()
      AND cm.is_content_writer = true
  );
$$;

-- ============================================================================
-- 6. RLS — CALENDARS
-- ============================================================================
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY cal_admin_all ON public.calendars FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY cal_pm_manage ON public.calendars FOR ALL
  USING (public.is_pm_of(campaign_id))
  WITH CHECK (public.is_pm_of(campaign_id));

-- Interns can read the calendar of campaigns they're on
CREATE POLICY cal_intern_select ON public.calendars FOR SELECT
  USING (public.is_member_of(campaign_id));

-- Client reads calendar once it's no longer 'building'
CREATE POLICY cal_client_select ON public.calendars FOR SELECT
  USING (
    state <> 'building'
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = calendars.campaign_id
        AND c.client_id = auth.uid()
        AND c.status IN ('active','paused','completed')
    )
  );

-- ============================================================================
-- 7. RLS — CALENDAR_ROWS
-- ============================================================================
ALTER TABLE public.calendar_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY cr_admin_all ON public.calendar_rows FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PM full access to their campaign rows
CREATE POLICY cr_pm_manage ON public.calendar_rows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      WHERE cal.id = calendar_rows.calendar_id
        AND public.is_pm_of(cal.campaign_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      WHERE cal.id = calendar_rows.calendar_id
        AND public.is_pm_of(cal.campaign_id)
    )
  );

-- Content-writer intern: full write access
CREATE POLICY cr_content_writer_manage ON public.calendar_rows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      WHERE cal.id = calendar_rows.calendar_id
        AND public.is_content_writer_of(cal.campaign_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      WHERE cal.id = calendar_rows.calendar_id
        AND public.is_content_writer_of(cal.campaign_id)
    )
  );

-- Non-content-writer intern: read-only for their campaigns
CREATE POLICY cr_intern_select ON public.calendar_rows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      WHERE cal.id = calendar_rows.calendar_id
        AND public.is_member_of(cal.campaign_id)
    )
  );

-- Client: read + can update client_inputs and client_approved_at/by (enforced by trigger)
CREATE POLICY cr_client_select ON public.calendar_rows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      JOIN public.campaigns c ON c.id = cal.campaign_id
      WHERE cal.id = calendar_rows.calendar_id
        AND c.client_id = auth.uid()
        AND cal.state IN ('sent_to_client','changes_requested','approved')
        AND c.status IN ('active','paused','completed')
    )
  );

CREATE POLICY cr_client_update ON public.calendar_rows FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      JOIN public.campaigns c ON c.id = cal.campaign_id
      WHERE cal.id = calendar_rows.calendar_id
        AND c.client_id = auth.uid()
        AND cal.state = 'sent_to_client'
        AND c.status IN ('active','paused','completed')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars cal
      JOIN public.campaigns c ON c.id = cal.campaign_id
      WHERE cal.id = calendar_rows.calendar_id
        AND c.client_id = auth.uid()
        AND cal.state = 'sent_to_client'
        AND c.status IN ('active','paused','completed')
    )
  );

-- ============================================================================
-- 8. CLIENT GUARD TRIGGER — prevent client from changing non-client columns
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_calendar_rows_client_guard()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_is_client BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.calendars cal
    JOIN public.campaigns c ON c.id = cal.campaign_id
    WHERE cal.id = NEW.calendar_id AND c.client_id = auth.uid()
  ) INTO v_is_client;

  IF NOT v_is_client THEN RETURN NEW; END IF;

  -- Client may only write: client_inputs, client_approved_at, client_approved_by
  NEW.calendar_id     := OLD.calendar_id;
  NEW.row_order       := OLD.row_order;
  NEW.post_date       := OLD.post_date;
  NEW.post_time       := OLD.post_time;
  NEW.post_type       := OLD.post_type;
  NEW.pillar          := OLD.pillar;
  NEW.ideation        := OLD.ideation;
  NEW.reference       := OLD.reference;
  NEW.caption         := OLD.caption;
  NEW.edited_reel_url := OLD.edited_reel_url;
  NEW.drive_link      := OLD.drive_link;
  NEW.collaborators   := OLD.collaborators;
  NEW.status          := OLD.status;
  NEW.posted_at       := OLD.posted_at;
  NEW.created_by      := OLD.created_by;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_calendar_rows_client_guard ON public.calendar_rows;
CREATE TRIGGER on_calendar_rows_client_guard
  BEFORE UPDATE ON public.calendar_rows
  FOR EACH ROW EXECUTE FUNCTION public.tg_calendar_rows_client_guard();

-- ============================================================================
-- 9. CALENDAR STATE MACHINE — notifications on state change
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_calendars_notify()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_pm_id     UUID;
  v_client_id UUID;
BEGIN
  IF NEW.state IS NOT DISTINCT FROM OLD.state THEN RETURN NEW; END IF;

  SELECT c.pm_id, c.client_id INTO v_pm_id, v_client_id
    FROM public.campaigns c WHERE c.id = NEW.campaign_id;

  -- Building → sent_to_client: notify client
  IF NEW.state = 'sent_to_client' THEN
    PERFORM public.send_notification(
      v_client_id, 'calendar_submitted',
      'Your content calendar is ready for review',
      'Your team has built out the calendar. Please review and approve.',
      '/client/calendar', NULL, NEW.campaign_id
    );
  END IF;

  -- sent_to_client → changes_requested: notify admin + PM
  IF NEW.state = 'changes_requested' THEN
    PERFORM public.send_notification(
      v_pm_id, 'calendar_changes_requested',
      'Client requested calendar changes',
      'The client left feedback on the calendar. Please review and revise.',
      '/pm/campaigns/' || NEW.campaign_id::text, NULL, NEW.campaign_id
    );
    PERFORM public.send_notification(
      p.id, 'calendar_changes_requested',
      'Client requested calendar changes',
      'Feedback received on the calendar.',
      '/admin/brands/' || NEW.campaign_id::text, NULL, NEW.campaign_id
    )
    FROM public.profiles p WHERE p.role = 'admin';
  END IF;

  -- sent_to_client → approved: notify PM
  IF NEW.state = 'approved' THEN
    PERFORM public.send_notification(
      v_pm_id, 'calendar_approved',
      'Calendar approved — assign reel tasks now',
      'The client approved the content calendar. You can now assign reel editing tasks.',
      '/pm/campaigns/' || NEW.campaign_id::text, NULL, NEW.campaign_id
    );
    PERFORM public.send_notification(
      p.id, 'calendar_approved',
      'Calendar approved by client',
      'The calendar was approved. PM can now assign production tasks.',
      '/admin/brands/' || NEW.campaign_id::text, NULL, NEW.campaign_id
    )
    FROM public.profiles p WHERE p.role = 'admin';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_calendars_notify ON public.calendars;
CREATE TRIGGER on_calendars_notify
  AFTER UPDATE ON public.calendars
  FOR EACH ROW EXECUTE FUNCTION public.tg_calendars_notify();

-- ============================================================================
-- 10. UPDATE tasks client guard to reference calendar_row_id
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_tasks_client_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_client BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = NEW.campaign_id AND c.client_id = auth.uid()
  ) INTO is_client;

  IF NOT is_client THEN RETURN NEW; END IF;

  -- Client may only change: submission_status, rejection_reason
  NEW.title             := OLD.title;
  NEW.description       := OLD.description;
  NEW.brand_name        := OLD.brand_name;
  NEW.assigned_to       := OLD.assigned_to;
  NEW.calendar_row_id   := OLD.calendar_row_id;
  NEW.status            := OLD.status;
  NEW.due_date          := OLD.due_date;
  NEW.priority          := OLD.priority;
  NEW.drive_link        := OLD.drive_link;
  NEW.campaign_id       := OLD.campaign_id;
  NEW.created_by        := OLD.created_by;
  NEW.created_at        := OLD.created_at;
  NEW.submitted_at      := OLD.submitted_at;

  RETURN NEW;
END $$;
