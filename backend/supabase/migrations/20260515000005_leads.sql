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
