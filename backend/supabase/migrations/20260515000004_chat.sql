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
