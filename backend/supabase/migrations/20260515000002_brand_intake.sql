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
