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
