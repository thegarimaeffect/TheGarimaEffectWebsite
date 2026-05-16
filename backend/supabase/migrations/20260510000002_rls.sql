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
