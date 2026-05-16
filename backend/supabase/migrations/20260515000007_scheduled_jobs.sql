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
