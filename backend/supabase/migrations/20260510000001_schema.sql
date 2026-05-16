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
