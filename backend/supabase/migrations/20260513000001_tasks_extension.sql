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
