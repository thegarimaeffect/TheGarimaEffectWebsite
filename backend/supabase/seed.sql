-- ============================================================================
-- THE GARIMA EFFECT — Seed data
-- 4 test users (one per role) + 1 sample campaign + calendar + rows + tasks
-- ============================================================================

DO $$
#variable_conflict use_variable
DECLARE
  admin_id  UUID := '11111111-1111-1111-1111-111111111111';
  pm_id     UUID := '22222222-2222-2222-2222-222222222222';
  intern_id UUID := '33333333-3333-3333-3333-333333333333';
  client_id UUID := '44444444-4444-4444-4444-444444444444';
  camp_id   UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  cal_id    UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  row1_id   UUID := 'dd111111-1111-1111-1111-111111111111';
  row2_id   UUID := 'dd222222-2222-2222-2222-222222222222';
  row3_id   UUID := 'dd333333-3333-3333-3333-333333333333';
  row4_id   UUID := 'dd444444-4444-4444-4444-444444444444';
  row5_id   UUID := 'dd555555-5555-5555-5555-555555555555';
BEGIN

-- ============================================================================
-- AUTH USERS
-- ============================================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
   'admin@garimaeffect.local', crypt('Garima@Admin25', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Garima Rana","role":"admin"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', pm_id, 'authenticated', 'authenticated',
   'pm@garimaeffect.local', crypt('Garima@PM2025', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Ananya Sharma","role":"product_manager"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', intern_id, 'authenticated', 'authenticated',
   'intern@garimaeffect.local', crypt('Garima@Intern25', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Rohan Verma","role":"intern"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', client_id, 'authenticated', 'authenticated',
   'client@garimaeffect.local', crypt('Garima@Client25', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Priya Singh","role":"client","company_name":"Lumen Skincare"}',
   now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- IDENTITIES
-- ============================================================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), admin_id,
   jsonb_build_object('sub', admin_id::text, 'email', 'admin@garimaeffect.local', 'email_verified', true),
   'email', admin_id::text, now(), now(), now()),
  (gen_random_uuid(), pm_id,
   jsonb_build_object('sub', pm_id::text, 'email', 'pm@garimaeffect.local', 'email_verified', true),
   'email', pm_id::text, now(), now(), now()),
  (gen_random_uuid(), intern_id,
   jsonb_build_object('sub', intern_id::text, 'email', 'intern@garimaeffect.local', 'email_verified', true),
   'email', intern_id::text, now(), now(), now()),
  (gen_random_uuid(), client_id,
   jsonb_build_object('sub', client_id::text, 'email', 'client@garimaeffect.local', 'email_verified', true),
   'email', client_id::text, now(), now(), now())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Set correct roles (handle_new_user now always defaults to 'client'; override here)
UPDATE public.profiles SET role = 'admin',           full_name = 'Garima Rana'      WHERE id = admin_id;
UPDATE public.profiles SET role = 'product_manager', full_name = 'Ananya Sharma'    WHERE id = pm_id;
UPDATE public.profiles SET role = 'intern',          full_name = 'Rohan Verma'      WHERE id = intern_id;
UPDATE public.profiles SET role = 'client',          full_name = 'Priya Singh',
  company_name = 'Lumen Skincare'                                                   WHERE id = client_id;

-- Sync JWT app_metadata roles
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'           WHERE id = admin_id;
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"product_manager"}' WHERE id = pm_id;
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"intern"}'          WHERE id = intern_id;
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"client"}'          WHERE id = client_id;

-- ============================================================================
-- SAMPLE CAMPAIGN
-- ============================================================================
INSERT INTO public.campaigns (id, name, client_id, pm_id, status, start_date, brief, goals)
VALUES (
  camp_id,
  'Lumen Skincare · Launch',
  client_id, pm_id,
  'active',
  CURRENT_DATE,
  'Launch Lumen''s flagship serum with a cinematic content arc: founder origin, ingredient deep-dives, UGC, and a finale offer that converts.',
  '["Hit 100K followers", "Generate 500 qualified leads", "Drive ₹15L launch revenue"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campaign_members (campaign_id, user_id, member_role, is_content_writer, added_by)
VALUES (camp_id, intern_id, 'intern', true, pm_id)
ON CONFLICT (campaign_id, user_id) DO NOTHING;

-- ============================================================================
-- CALENDAR (the trigger auto-creates one, but we upsert with a known ID)
-- ============================================================================
INSERT INTO public.calendars (id, campaign_id, state)
VALUES (cal_id, camp_id, 'sent_to_client')
ON CONFLICT (campaign_id) DO UPDATE SET id = cal_id, state = 'sent_to_client';

-- ============================================================================
-- CALENDAR ROWS — 5 sample rows matching the new column spec
-- ============================================================================
INSERT INTO public.calendar_rows
  (id, calendar_id, row_order, post_date, post_time, post_type, pillar, ideation, reference, caption, drive_link, status, created_by)
VALUES
  (row1_id, cal_id, 1, CURRENT_DATE,     '10:00', 'Reel',
   'Brand',   'Founder origin story — why Lumen had to exist',
   'https://drive.google.com/sample-ref-1',
   'I started Lumen because my skin betrayed me at 22. This is that story.',
   'https://drive.google.com/file/d/row1-reel/view', 'in_production', pm_id),

  (row2_id, cal_id, 2, CURRENT_DATE + 2, '11:00', 'Carousel',
   'Product',  'Inside the lab — 27 failed batches before the formula',
   'https://drive.google.com/sample-ref-2',
   'The room where Lumen was born. 8 slides.',
   'https://drive.google.com/drive/folders/row2-carousel', 'ready', pm_id),

  (row3_id, cal_id, 3, CURRENT_DATE + 4, '09:30', 'Reel',
   'Educational', 'Ceramide complex — explained like you''re 11',
   'https://drive.google.com/sample-ref-3',
   'This molecule rebuilt my barrier in 11 days.',
   NULL, 'draft', pm_id),

  (row4_id, cal_id, 4, CURRENT_DATE + 6, '18:00', 'Story',
   'UGC',      '5 real testers, day-1 clips — story takeover',
   NULL,
   'Swipe up to join the next cohort.',
   NULL, 'draft', pm_id),

  (row5_id, cal_id, 5, CURRENT_DATE + 9, '12:00', 'Reel',
   'Engagement', 'The launch drop — limited to 500 bottles',
   'https://drive.google.com/sample-ref-5',
   'It''s here. Shop now — link in bio.',
   NULL, 'draft', pm_id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE TASKS (linked to calendar rows)
-- ============================================================================
INSERT INTO public.tasks
  (campaign_id, calendar_row_id, title, description, brand_name, assigned_to,
   status, due_date, priority, created_by, drive_link, submission_status,
   rejection_reason, submitted_at, reviewed_at, reviewed_by)
VALUES
  -- Row 1: client approved
  (camp_id, row1_id,
   'Edit reel — Founder origin',
   'Color grade + 30s cut. Golden-hour LUT. Keep it raw.',
   'Lumen Skincare', intern_id, 'done', CURRENT_DATE - 2, 1, pm_id,
   'https://drive.google.com/file/d/sample-day-1-final/view',
   'approved', NULL, now() - INTERVAL '2 days', now() - INTERVAL '1 day', client_id),

  -- Row 2: submitted, awaiting client
  (camp_id, row2_id,
   'Carousel — Behind The Lab',
   '8-slide carousel. Cover slide must have a strong hook.',
   'Lumen Skincare', intern_id, 'done', CURRENT_DATE - 1, 1, pm_id,
   'https://drive.google.com/drive/folders/sample-behind-lab',
   'submitted', NULL, now() - INTERVAL '4 hours', NULL, NULL),

  -- Row 3: rejected
  (camp_id, row3_id,
   'Ingredient reel — ceramide complex',
   '20s split-screen with founder voice-over.',
   'Lumen Skincare', intern_id, 'in_progress', CURRENT_DATE, 1, pm_id,
   'https://drive.google.com/file/d/sample-ingredient-v1/view',
   'rejected',
   'Voice-over feels rushed in the middle — extend slot 12-22s by ~3 seconds.',
   now() - INTERVAL '1 day', now() - INTERVAL '6 hours', client_id),

  -- Row 4: in progress
  (camp_id, row4_id,
   'UGC pack assembly — story takeover',
   'Gather 5 testers'' clips, light edit, captions lower third. 9:16.',
   'Lumen Skincare', intern_id, 'in_progress', CURRENT_DATE + 1, 2, pm_id,
   NULL, 'not_submitted', NULL, NULL, NULL, NULL),

  -- Row 5: todo
  (camp_id, row5_id,
   'Launch drop reel',
   'Bottle reveal + founder thank-you + urgency CTA. 15s.',
   'Lumen Skincare', intern_id, 'todo', CURRENT_DATE + 5, 2, pm_id,
   NULL, 'not_submitted', NULL, NULL, NULL, NULL);

-- ============================================================================
-- SAMPLE BRAND INTAKE (partial — as if the client is mid-way through)
-- ============================================================================
INSERT INTO public.brand_intake
  (client_id, instagram_handle, brand_voice, target_audience, submitted_at)
VALUES
  (client_id, '@lumenskincare',
   'Founder-led, science-backed, emotionally resonant. Like a knowledgeable friend, not a brand.',
   'Women 25-40 who care about skincare ingredients and invest in their skin.',
   now())
ON CONFLICT ON CONSTRAINT brand_intake_client_id_key DO NOTHING;

-- ============================================================================
-- SAMPLE LEAD
-- ============================================================================
INSERT INTO public.leads (full_name, email, phone, status, follow_up_date, notes, source)
VALUES
  ('Meera Kapoor', 'meera@bloombrand.in', '+91 98765 43210',
   'contacted', CURRENT_DATE + 3,
   'Interested in a 30-day content package. Wants to discuss pricing on the call.',
   'Instagram DM')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHAT THREAD (auto-created by trigger, but ensure it exists for the sample)
-- ============================================================================
INSERT INTO public.threads (campaign_id)
VALUES (camp_id)
ON CONFLICT (campaign_id) DO NOTHING;

END $$;
