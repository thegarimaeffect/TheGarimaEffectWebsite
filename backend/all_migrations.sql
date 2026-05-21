-- ============================================
-- MIGRATION: 20260510000001_schema.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Schema
-- Tables, enums, helper functions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'product_manager',
  'intern',
  'client'
);

CREATE TYPE public.campaign_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed',
  'archived'
);

CREATE TYPE public.calendar_status AS ENUM (
  'draft',
  'in_review',
  'approved',
  'scheduled',
  'live',
  'complete'
);

CREATE TYPE public.task_status AS ENUM (
  'todo',
  'in_progress',
  'review',
  'done',
  'blocked'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles — extends auth.users
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  role         public.user_role NOT NULL DEFAULT 'client',
  avatar_url   TEXT,
  company_name TEXT,
  phone        TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- campaigns — the engagement
CREATE TABLE public.campaigns (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  client_id  UUID NOT NULL REFERENCES public.profiles(id),
  pm_id      UUID NOT NULL REFERENCES public.profiles(id),
  status     public.campaign_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  brief      TEXT,
  goals      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT distinct_roles CHECK (client_id <> pm_id)
);
CREATE INDEX idx_campaigns_client ON public.campaigns(client_id);
CREATE INDEX idx_campaigns_pm ON public.campaigns(pm_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- campaign_members — many-to-many for interns / extra collaborators
CREATE TABLE public.campaign_members (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL CHECK (member_role IN ('intern','co_pm','observer')),
  added_by    UUID REFERENCES public.profiles(id),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, user_id)
);
CREATE INDEX idx_campaign_members_user ON public.campaign_members(user_id);

-- calendar_days — the 14-day strategy roadmap
CREATE TABLE public.calendar_days (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  day_number    INT  NOT NULL CHECK (day_number BETWEEN 1 AND 14),
  title         TEXT NOT NULL,
  content_type  TEXT,
  hook          TEXT,
  content_body  TEXT,
  cta           TEXT,
  hashtags      TEXT[] NOT NULL DEFAULT '{}'::text[],
  visual_brief  TEXT,
  asset_urls    TEXT[] NOT NULL DEFAULT '{}'::text[],
  status        public.calendar_status NOT NULL DEFAULT 'draft',
  approved_at   TIMESTAMPTZ,
  approved_by   UUID REFERENCES public.profiles(id),
  published_at  TIMESTAMPTZ,
  notes         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    UUID REFERENCES public.profiles(id),
  updated_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, day_number)
);
CREATE INDEX idx_calendar_days_campaign ON public.calendar_days(campaign_id, day_number);
CREATE INDEX idx_calendar_days_status ON public.calendar_days(status);

-- calendar_days_v — computed scheduled_date
CREATE VIEW public.calendar_days_v AS
SELECT
  cd.*,
  (c.start_date + (cd.day_number - 1))::date AS scheduled_date,
  c.start_date AS campaign_start_date,
  c.status AS campaign_status
FROM public.calendar_days cd
JOIN public.campaigns c ON c.id = cd.campaign_id;

-- strategy_templates — reusable PM playbooks
CREATE TABLE public.strategy_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  vertical    TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.strategy_template_days (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES public.strategy_templates(id) ON DELETE CASCADE,
  day_number    INT  NOT NULL CHECK (day_number BETWEEN 1 AND 14),
  title         TEXT NOT NULL,
  content_type  TEXT,
  hook          TEXT,
  content_body  TEXT,
  cta           TEXT,
  UNIQUE (template_id, day_number)
);

-- tasks — granular deliverables
CREATE TABLE public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  calendar_day_id UUID REFERENCES public.calendar_days(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  assigned_to     UUID REFERENCES public.profiles(id),
  status          public.task_status NOT NULL DEFAULT 'todo',
  due_date        DATE,
  priority        INT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to, status);
CREATE INDEX idx_tasks_campaign ON public.tasks(campaign_id);

-- comments — threads on calendar_days OR tasks
CREATE TABLE public.comments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_day_id  UUID REFERENCES public.calendar_days(id) ON DELETE CASCADE,
  task_id          UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id        UUID NOT NULL REFERENCES public.profiles(id),
  body             TEXT NOT NULL,
  is_client_facing BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((calendar_day_id IS NOT NULL)::int + (task_id IS NOT NULL)::int = 1)
);

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to avoid recursive RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_role_of_user()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_pm_of(p_campaign UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = p_campaign AND pm_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_member_of(p_campaign UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_members
    WHERE campaign_id = p_campaign AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_client_of(p_campaign UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = p_campaign
      AND client_id = auth.uid()
      AND status <> 'draft'
  )
$$;

-- ============================================================================
-- updated_at TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.calendar_days
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================
-- MIGRATION: 20260510000002_rls.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Row-Level Security
-- ============================================================================

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_template_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments               ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Self read
CREATE POLICY p_self_read ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Admin reads/writes everything
CREATE POLICY p_admin_all ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Anyone authenticated can read profile rows of users they share a campaign with
CREATE POLICY p_shared_read ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- I'm PM of a campaign where this profile is client
      EXISTS (SELECT 1 FROM public.campaigns c
              WHERE c.pm_id = auth.uid() AND c.client_id = profiles.id)
      OR
      -- I'm client of a campaign where this profile is PM
      EXISTS (SELECT 1 FROM public.campaigns c
              WHERE c.client_id = auth.uid() AND c.pm_id = profiles.id AND c.status <> 'draft')
      OR
      -- This profile is on the same campaign as me (intern relationship)
      EXISTS (SELECT 1 FROM public.campaign_members cm1
              JOIN public.campaign_members cm2 ON cm1.campaign_id = cm2.campaign_id
              WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id)
      OR
      -- PM can see members of their campaigns
      EXISTS (SELECT 1 FROM public.campaigns c
              JOIN public.campaign_members cm ON cm.campaign_id = c.id
              WHERE c.pm_id = auth.uid() AND cm.user_id = profiles.id)
      OR
      -- Intern can see PM of their campaigns
      EXISTS (SELECT 1 FROM public.campaign_members cm
              JOIN public.campaigns c ON c.id = cm.campaign_id
              WHERE cm.user_id = auth.uid() AND c.pm_id = profiles.id)
    )
  );

-- Self update (cannot change own role)
CREATE POLICY p_self_update ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = public.current_role_of_user());

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================

CREATE POLICY c_admin_all ON public.campaigns FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PM owns
CREATE POLICY c_pm_select ON public.campaigns FOR SELECT USING (pm_id = auth.uid());
CREATE POLICY c_pm_update ON public.campaigns FOR UPDATE
  USING (pm_id = auth.uid()) WITH CHECK (pm_id = auth.uid());
CREATE POLICY c_pm_insert ON public.campaigns FOR INSERT
  WITH CHECK (
    public.current_role_of_user() IN ('product_manager','admin')
    AND pm_id = auth.uid()
  );
CREATE POLICY c_pm_delete ON public.campaigns FOR DELETE
  USING (pm_id = auth.uid());

-- Intern reads campaigns they're assigned to
CREATE POLICY c_intern_select ON public.campaigns FOR SELECT
  USING (public.is_member_of(id));

-- Client reads own campaigns (not draft)
CREATE POLICY c_client_select ON public.campaigns FOR SELECT
  USING (client_id = auth.uid() AND status <> 'draft');

-- ============================================================================
-- CAMPAIGN_MEMBERS
-- ============================================================================

CREATE POLICY cm_admin_all ON public.campaign_members FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY cm_pm_manage ON public.campaign_members FOR ALL
  USING (public.is_pm_of(campaign_id))
  WITH CHECK (public.is_pm_of(campaign_id));

CREATE POLICY cm_self_read ON public.campaign_members FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- CALENDAR_DAYS  (the critical table)
-- ============================================================================

CREATE POLICY cd_admin_all ON public.calendar_days FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PM full access to days in own campaigns
CREATE POLICY cd_pm_manage ON public.calendar_days FOR ALL
  USING (public.is_pm_of(campaign_id))
  WITH CHECK (public.is_pm_of(campaign_id));

-- Intern read days for assigned campaigns
CREATE POLICY cd_intern_read ON public.calendar_days FOR SELECT
  USING (public.is_member_of(campaign_id));

-- Intern can update content + status on assigned campaigns
CREATE POLICY cd_intern_update ON public.calendar_days FOR UPDATE
  USING (public.is_member_of(campaign_id))
  WITH CHECK (public.is_member_of(campaign_id));

-- Client: read-only, never sees drafts, only when campaign is live-ish
CREATE POLICY cd_client_read ON public.calendar_days FOR SELECT
  USING (
    status <> 'draft'
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = calendar_days.campaign_id
        AND c.client_id = auth.uid()
        AND c.status IN ('active','paused','completed')
    )
  );

-- ============================================================================
-- STRATEGY_TEMPLATES
-- ============================================================================

CREATE POLICY st_admin_all ON public.strategy_templates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY st_owner_all ON public.strategy_templates FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY st_public_read ON public.strategy_templates FOR SELECT
  USING (
    is_public = true
    AND public.current_role_of_user() IN ('admin','product_manager')
  );

CREATE POLICY std_admin_all ON public.strategy_template_days FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY std_via_template ON public.strategy_template_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.strategy_templates t
      WHERE t.id = strategy_template_days.template_id
        AND (t.created_by = auth.uid()
             OR (t.is_public AND public.current_role_of_user() IN ('admin','product_manager')))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.strategy_templates t
      WHERE t.id = strategy_template_days.template_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- TASKS
-- ============================================================================

CREATE POLICY t_admin_all ON public.tasks FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY t_pm_manage ON public.tasks FOR ALL
  USING (public.is_pm_of(campaign_id))
  WITH CHECK (public.is_pm_of(campaign_id));

CREATE POLICY t_intern_read ON public.tasks FOR SELECT
  USING (assigned_to = auth.uid() OR public.is_member_of(campaign_id));

CREATE POLICY t_intern_update ON public.tasks FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

CREATE POLICY cmt_admin_all ON public.comments FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY cmt_team_select ON public.comments FOR SELECT USING (
  -- PM/intern of the campaign tied to this comment
  CASE
    WHEN calendar_day_id IS NOT NULL THEN
      EXISTS (
        SELECT 1 FROM public.calendar_days cd
        WHERE cd.id = comments.calendar_day_id
          AND (public.is_pm_of(cd.campaign_id) OR public.is_member_of(cd.campaign_id))
      )
    WHEN task_id IS NOT NULL THEN
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = comments.task_id
          AND (public.is_pm_of(t.campaign_id) OR t.assigned_to = auth.uid()
               OR public.is_member_of(t.campaign_id))
      )
    ELSE FALSE
  END
);

-- Client can read client-facing comments on their campaign's days
CREATE POLICY cmt_client_select ON public.comments FOR SELECT USING (
  is_client_facing = true
  AND calendar_day_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.calendar_days cd
    WHERE cd.id = comments.calendar_day_id
      AND public.is_client_of(cd.campaign_id)
  )
);

-- Anyone authenticated can insert their own comment (further gated by team membership in app)
CREATE POLICY cmt_author_insert ON public.comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY cmt_author_update ON public.comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY cmt_author_delete ON public.comments FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- ============================================
-- MIGRATION: 20260510000003_auth_hooks.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Auth hooks
-- Auto-create profile on signup; sync role to JWT custom claim
-- ============================================================================

-- Auto-create profile row when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Allow role to be set on signup via raw_user_meta_data; default to 'client'
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'client'
  );

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

  -- Mirror role into app_metadata so JWT carries it (no DB roundtrip in middleware)
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                          || jsonb_build_object('role', v_role::text)
  WHERE id = NEW.id;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Keep app_metadata role in sync when profiles.role changes (admin promotion etc.)
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                            || jsonb_build_object('role', NEW.role::text)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_jwt();

-- ============================================
-- MIGRATION: 20260513000001_tasks_extension.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Tasks extension
-- Adds Drive link + brand_name + client-facing submission workflow
-- ============================================================================

-- Client-facing submission state (separate from internal task_status workflow)
CREATE TYPE public.submission_status AS ENUM (
  'not_submitted',   -- intern hasn't delivered yet
  'submitted',       -- "done by us" — delivered for client review
  'approved',        -- client approved the work
  'rejected'         -- client rejected; rejection_reason filled
);

ALTER TABLE public.tasks
  ADD COLUMN drive_link        TEXT,
  ADD COLUMN brand_name        TEXT,
  ADD COLUMN submission_status public.submission_status NOT NULL DEFAULT 'not_submitted',
  ADD COLUMN rejection_reason  TEXT,
  ADD COLUMN submitted_at      TIMESTAMPTZ,
  ADD COLUMN reviewed_at       TIMESTAMPTZ,
  ADD COLUMN reviewed_by       UUID REFERENCES public.profiles(id),
  ADD CONSTRAINT rejection_needs_reason
    CHECK (submission_status <> 'rejected' OR rejection_reason IS NOT NULL),
  ADD CONSTRAINT drive_link_format
    CHECK (drive_link IS NULL OR drive_link ~* '^https?://');

CREATE INDEX idx_tasks_submission_status ON public.tasks(submission_status);

-- ============================================================================
-- AUTO-TRANSITIONS via trigger
-- When intern marks task_status='done' → auto-flip submission_status='submitted'
-- When submission_status changes to approved/rejected → stamp reviewed_at / by
-- When submission_status moves from rejected → back to in_progress, clear reason
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_tasks_auto_transitions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If intern marks task done AND it hasn't been submitted yet, auto-submit
  IF NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done'
     AND NEW.submission_status = 'not_submitted'
  THEN
    NEW.submission_status := 'submitted';
    NEW.submitted_at      := now();
  END IF;

  -- Stamp reviewed_at / reviewed_by when client decides
  IF NEW.submission_status IN ('approved','rejected')
     AND OLD.submission_status IS DISTINCT FROM NEW.submission_status
  THEN
    NEW.reviewed_at := now();
    NEW.reviewed_by := auth.uid();
  END IF;

  -- Re-submission flow: clearing rejection
  IF OLD.submission_status = 'rejected'
     AND NEW.submission_status IN ('not_submitted','submitted')
  THEN
    NEW.rejection_reason := NULL;
    -- if drive link updated and status moved back, reset reviewed_at
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_tasks_auto_transitions ON public.tasks;
CREATE TRIGGER on_tasks_auto_transitions
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_tasks_auto_transitions();

-- Auto-fill brand_name from campaign.client.company_name at insert time
CREATE OR REPLACE FUNCTION public.tg_tasks_fill_brand()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.brand_name IS NULL OR NEW.brand_name = '' THEN
    SELECT COALESCE(p.company_name, p.full_name, p.email)
      INTO NEW.brand_name
      FROM public.campaigns c
      JOIN public.profiles p ON p.id = c.client_id
     WHERE c.id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_tasks_fill_brand ON public.tasks;
CREATE TRIGGER on_tasks_fill_brand
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_tasks_fill_brand();

-- ============================================
-- MIGRATION: 20260513000002_notifications.sql
-- ============================================
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

-- ============================================
-- MIGRATION: 20260513000003_tasks_rls_update.sql
-- ============================================
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

-- ============================================
-- MIGRATION: 20260513000004_view_security.sql
-- ============================================
-- ============================================================================
-- Fix: calendar_days_v must respect the caller's RLS, not the owner's.
-- Default Postgres behavior is security_definer-ish on views; flip to invoker.
-- ============================================================================

ALTER VIEW public.calendar_days_v SET (security_invoker = true);

-- ============================================
-- MIGRATION: 20260515000001_foundations.sql
-- ============================================
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

-- ============================================
-- MIGRATION: 20260515000002_brand_intake.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Brand intake / credentials
-- After first login, clients submit brand info + social credentials.
-- Readable ONLY by admin; the client can edit their own row.
-- PM and intern have zero access at the policy level.
-- ============================================================================

CREATE TABLE public.brand_intake (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instagram_handle  TEXT,
  other_platforms   JSONB NOT NULL DEFAULT '{}'::jsonb,
  brand_voice       TEXT,
  target_audience   TEXT,
  competitors       TEXT,
  goals_text        TEXT,
  credentials       JSONB NOT NULL DEFAULT '{}'::jsonb,
  additional_notes  TEXT,
  submitted_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id)
);

CREATE INDEX idx_brand_intake_client ON public.brand_intake(client_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.brand_intake
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.brand_intake ENABLE ROW LEVEL SECURITY;

-- Admin sees and manages everything
CREATE POLICY bi_admin_all ON public.brand_intake FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Client may read/write only their own row
CREATE POLICY bi_client_select ON public.brand_intake FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY bi_client_insert ON public.brand_intake FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND public.current_role_of_user() = 'client'
  );

CREATE POLICY bi_client_update ON public.brand_intake FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (
    client_id = auth.uid()
    AND public.current_role_of_user() = 'client'
  );

-- NO policy for product_manager or intern — they simply cannot query this table.

-- ============================================
-- MIGRATION: 20260515000003_documents.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Documents
-- Onboarding docs (admin uploads, client + admin view)
-- Signed docs (client or admin uploads, both can view)
-- ============================================================================

CREATE TABLE public.documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id  UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('onboarding', 'signed')),
  name         TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size    BIGINT,
  mime_type    TEXT,
  uploaded_by  UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_brand ON public.documents(brand_id);
CREATE INDEX idx_documents_kind  ON public.documents(brand_id, kind);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY doc_admin_all ON public.documents FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Client reads their own documents (both kinds)
CREATE POLICY doc_client_select ON public.documents FOR SELECT
  USING (brand_id = auth.uid());

-- Client can upload signed documents only
CREATE POLICY doc_client_insert ON public.documents FOR INSERT
  WITH CHECK (
    brand_id = auth.uid()
    AND kind = 'signed'
    AND public.current_role_of_user() = 'client'
  );

-- PM can view documents for their campaign clients (read-only)
CREATE POLICY doc_pm_select ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.pm_id = auth.uid()
        AND c.client_id = documents.brand_id
    )
  );

-- Intern: no access to documents

-- ============================================================================
-- Storage bucket — private. All reads/writes go through our service-role API
-- routes (/api/documents*), so we keep direct object access locked down and
-- let the API enforce who can see what. Path convention: {brand_id}/{kind}/{ts}-{name}
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-documents', 'brand-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MIGRATION: 20260515000004_chat.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Chat system
-- One thread per campaign. Participants: admin + that campaign's PM + its client.
-- Interns are EXPLICITLY excluded at the policy level.
-- ============================================================================

CREATE TABLE public.threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);

CREATE INDEX idx_threads_campaign ON public.threads(campaign_id);

CREATE TABLE public.messages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body      TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_thread ON public.messages(thread_id, created_at);
CREATE INDEX idx_messages_author ON public.messages(author_id);

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper: is the current user a legitimate chat participant for this campaign?
-- Participants = admin OR the PM of this campaign OR the client of this campaign.
-- Interns are NOT included, even if they are campaign_members.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_chat_participant(p_campaign UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = p_campaign
        AND (c.pm_id = auth.uid() OR c.client_id = auth.uid())
    );
$$;

-- THREADS
CREATE POLICY thr_participant_select ON public.threads FOR SELECT
  USING (public.is_chat_participant(campaign_id));

CREATE POLICY thr_admin_insert ON public.threads FOR INSERT
  WITH CHECK (public.is_admin());

-- MESSAGES — select
CREATE POLICY msg_participant_select ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = messages.thread_id
        AND public.is_chat_participant(t.campaign_id)
    )
  );

-- MESSAGES — insert (participant can post in their own thread)
CREATE POLICY msg_participant_insert ON public.messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = messages.thread_id
        AND public.is_chat_participant(t.campaign_id)
    )
  );

-- MESSAGES — delete own (within 5 minutes, app-enforced)
CREATE POLICY msg_author_delete ON public.messages FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- ============================================================================
-- Auto-create a thread when a campaign is created
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_campaigns_create_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.threads (campaign_id)
  VALUES (NEW.id)
  ON CONFLICT (campaign_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_campaign_create_thread ON public.campaigns;
CREATE TRIGGER on_campaign_create_thread
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_campaigns_create_thread();

-- ============================================================================
-- Notify participants on new message
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_messages_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_campaign  UUID;
  v_pm_id     UUID;
  v_client_id UUID;
  v_author    TEXT;
BEGIN
  SELECT t.campaign_id INTO v_campaign FROM public.threads t WHERE t.id = NEW.thread_id;
  SELECT c.pm_id, c.client_id INTO v_pm_id, v_client_id
    FROM public.campaigns c WHERE c.id = v_campaign;

  SELECT COALESCE(p.full_name, p.email) INTO v_author
    FROM public.profiles p WHERE p.id = NEW.author_id;

  -- Notify everyone except the sender
  IF NEW.author_id <> v_pm_id AND v_pm_id IS NOT NULL THEN
    PERFORM public.send_notification(
      v_pm_id, 'message_received', 'New message from ' || v_author,
      LEFT(NEW.body, 80), '/pm/campaigns/' || v_campaign::text,
      NULL, v_campaign
    );
  END IF;

  IF NEW.author_id <> v_client_id AND v_client_id IS NOT NULL THEN
    PERFORM public.send_notification(
      v_client_id, 'message_received', 'New message from ' || v_author,
      LEFT(NEW.body, 80), '/client',
      NULL, v_campaign
    );
  END IF;

  -- Notify all admins (except if sender is admin)
  PERFORM public.send_notification(
    p.id, 'message_received', 'New message from ' || v_author,
    LEFT(NEW.body, 80), '/admin/brands/' || v_campaign::text,
    NULL, v_campaign
  )
  FROM public.profiles p
  WHERE p.role = 'admin' AND p.id <> NEW.author_id;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_message_notify ON public.messages;
CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.tg_messages_notify();

-- ============================================================================
-- Realtime — let participants see new messages without a refetch.
-- Safe if the publication already carries the table.
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================
-- MIGRATION: 20260515000005_leads.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Lead pipeline
-- Admin-only CRM for tracking prospective clients.
-- ============================================================================

CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'negotiating',
  'won',
  'lost'
);

CREATE TABLE public.leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  notes          TEXT,
  status         public.lead_status NOT NULL DEFAULT 'new',
  follow_up_date DATE,
  source         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_status         ON public.leads(status);
CREATE INDEX idx_leads_follow_up_date ON public.leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admin only — no other role touches leads
CREATE POLICY leads_admin_all ON public.leads FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- MIGRATION: 20260515000006_calendar_rebuild.sql
-- ============================================
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

-- ============================================
-- MIGRATION: 20260515000007_scheduled_jobs.sql
-- ============================================
-- ============================================================================
-- THE GARIMA EFFECT — Scheduled jobs (pg_cron)
-- 1. Daily: notify interns when a task is due in ≤ 2 days
-- 2. Daily: notify admin when a lead follow-up date is today
--
-- pg_cron is available on Supabase Cloud (enable in dashboard → Extensions).
-- On the local CLI stack pg_cron is *listed as available* but cannot actually
-- load (it needs shared_preload_libraries), so a plain availability check is
-- not enough — we wrap the whole thing in an exception handler and degrade
-- gracefully so the migration never blocks local dev.
-- ============================================================================

DO $do$
BEGIN
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
      CREATE EXTENSION IF NOT EXISTS pg_cron;

      -- Remove old jobs if they exist (idempotent)
      PERFORM cron.unschedule(jobid)
      FROM cron.job
      WHERE jobname IN ('task_due_soon_alerts', 'lead_followup_alerts');

      -- Job 1: task due-soon alerts (09:00 UTC daily)
      PERFORM cron.schedule(
        'task_due_soon_alerts',
        '0 9 * * *',
        $job$
          SELECT public.send_notification(
            t.assigned_to,
            'task_due_soon',
            'Task due in 2 days: ' || t.title,
            COALESCE(t.brand_name, '') || ' — due ' || t.due_date::text,
            '/intern',
            t.id,
            t.campaign_id
          )
          FROM public.tasks t
          WHERE t.assigned_to IS NOT NULL
            AND t.status NOT IN ('done', 'blocked')
            AND t.submission_status NOT IN ('approved')
            AND t.due_date IS NOT NULL
            AND t.due_date = CURRENT_DATE + 2;
        $job$
      );

      -- Job 2: lead follow-up alerts (08:00 UTC daily)
      PERFORM cron.schedule(
        'lead_followup_alerts',
        '0 8 * * *',
        $job$
          SELECT public.send_notification(
            p.id,
            'lead_followup',
            'Follow-up due today: ' || l.full_name,
            COALESCE(l.email, l.phone, 'No contact info') || ' · Status: ' || l.status::text,
            '/admin/leads',
            NULL, NULL
          )
          FROM public.leads l
          CROSS JOIN public.profiles p
          WHERE l.follow_up_date = CURRENT_DATE
            AND p.role = 'admin';
        $job$
      );

      RAISE NOTICE 'pg_cron jobs scheduled successfully.';
    ELSE
      RAISE NOTICE 'pg_cron not available — skipping scheduled job setup.';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron setup skipped (% — %). Enable it in the Supabase Cloud dashboard for daily alerts.', SQLSTATE, SQLERRM;
  END;
END $do$;

