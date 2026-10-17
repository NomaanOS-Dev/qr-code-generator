-- ============================================================
-- Seed Script: Generate realistic scan data for testing
-- ============================================================
-- 
-- Usage:
--   1. Replace :user_id with your user ID from the profiles table
--   2. Run in Supabase SQL Editor
--
-- This creates ~1500 scan records spread across 3 QR codes
-- over the last 90 days with realistic patterns:
--   - More scans on weekends (restaurant use case)
--   - Mix of mobile (85%), desktop (12%), tablet (3%)
--   - Top countries: US, IN, GB, DE, FR
--   - Random referrers
--
-- Delete this data before going live:
--   DELETE FROM qr_scans WHERE scanned_at < NOW() - INTERVAL '1 second';
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_qr_1 UUID;
  v_qr_2 UUID;
  v_qr_3 UUID;
  v_days INTEGER := 90;
  v_i INTEGER;
  v_scans_today INTEGER;
  v_day_offset INTEGER;
  v_rand NUMERIC;
  v_device TEXT;
  v_country TEXT;
  v_referrer TEXT;
  v_scanned_at TIMESTAMPTZ;
BEGIN
  -- Get the first user (replace if you have multiple users)
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Sign up first at http://localhost:3000/signup';
  END IF;

  RAISE NOTICE 'Seeding scans for user %', v_user_id;

  -- Get 3 QR codes for this user
  SELECT id INTO v_qr_1 FROM qr_codes WHERE user_id = v_user_id ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_qr_2 FROM qr_codes WHERE user_id = v_user_id ORDER BY created_at ASC OFFSET 1 LIMIT 1;
  SELECT id INTO v_qr_3 FROM qr_codes WHERE user_id = v_user_id ORDER BY created_at ASC OFFSET 2 LIMIT 1;

  IF v_qr_1 IS NULL THEN
    RAISE EXCEPTION 'No QR codes found for user. Create some at http://localhost:3000/dashboard/create';
  END IF;

  -- Clear existing scans (optional — comment out to append)
  -- DELETE FROM qr_scans WHERE qr_code_id IN (v_qr_1, v_qr_2, v_qr_3);

  -- Loop through the last N days
  FOR v_day_offset IN 0..v_days LOOP
    -- Base scans per day varies by day of week
    -- Saturday = 6, Sunday = 0 (Postgres DOW: 0=Sun, 6=Sat)
    v_rand := random();
    
    -- Simulate growth trend: recent days have more scans
    v_scans_today := GREATEST(0, (
      CASE 
        WHEN EXTRACT(DOW FROM (NOW() - (v_day_offset || ' days')::INTERVAL)) = 6 THEN 12  -- Saturday
        WHEN EXTRACT(DOW FROM (NOW() - (v_day_offset || ' days')::INTERVAL)) = 0 THEN 5   -- Sunday
        ELSE 8
      END
      + (30 - v_day_offset) / 3  -- Growth trend
      - FLOOR(v_rand * 10)::INTEGER  -- Random noise
    ));

    -- Insert N scans for this day
    FOR v_i IN 1..v_scans_today LOOP
      -- Pick QR code: 50% qr_1, 30% qr_2, 20% qr_3
      v_rand := random();
      IF v_rand < 0.5 THEN
        v_scanned_at := (NOW() - (v_day_offset || ' days')::INTERVAL + (random() * INTERVAL '24 hours'));
        
        -- Device
        v_rand := random();
        v_device := CASE
          WHEN v_rand < 0.85 THEN 'mobile'
          WHEN v_rand < 0.97 THEN 'desktop'
          ELSE 'tablet'
        END;

        -- Country
        v_rand := random();
        v_country := CASE
          WHEN v_rand < 0.40 THEN 'US'
          WHEN v_rand < 0.65 THEN 'IN'
          WHEN v_rand < 0.78 THEN 'GB'
          WHEN v_rand < 0.87 THEN 'DE'
          WHEN v_rand < 0.94 THEN 'FR'
          ELSE NULL
        END;

        -- Referrer
        v_rand := random();
        v_referrer := CASE
          WHEN v_rand < 0.60 THEN NULL
          WHEN v_rand < 0.70 THEN 'instagram.com'
          WHEN v_rand < 0.80 THEN 'facebook.com'
          WHEN v_rand < 0.88 THEN 'google.com'
          WHEN v_rand < 0.95 THEN 'twitter.com'
          ELSE 'linkedin.com'
        END;

        INSERT INTO qr_scans (qr_code_id, scanned_at, device_type, country_code, referrer_domain)
        VALUES (v_qr_1, v_scanned_at, v_device, v_country, v_referrer);

      ELSIF v_rand < 0.8 AND v_qr_2 IS NOT NULL THEN
        v_scanned_at := (NOW() - (v_day_offset || ' days')::INTERVAL + (random() * INTERVAL '24 hours'));
        
        v_rand := random();
        v_device := CASE
          WHEN v_rand < 0.90 THEN 'mobile'
          WHEN v_rand < 0.98 THEN 'desktop'
          ELSE 'tablet'
        END;

        v_rand := random();
        v_country := CASE
          WHEN v_rand < 0.50 THEN 'US'
          WHEN v_rand < 0.70 THEN 'IN'
          WHEN v_rand < 0.82 THEN 'CA'
          WHEN v_rand < 0.90 THEN 'AU'
          ELSE 'GB'
        END;

        v_referrer := CASE WHEN random() < 0.5 THEN NULL ELSE 'google.com' END;

        INSERT INTO qr_scans (qr_code_id, scanned_at, device_type, country_code, referrer_domain)
        VALUES (v_qr_2, v_scanned_at, v_device, v_country, v_referrer);

      ELSIF v_qr_3 IS NOT NULL THEN
        v_scanned_at := (NOW() - (v_day_offset || ' days')::INTERVAL + (random() * INTERVAL '24 hours'));

        v_rand := random();
        v_device := CASE WHEN v_rand < 0.75 THEN 'mobile' ELSE 'desktop' END;

        v_rand := random();
        v_country := CASE
          WHEN v_rand < 0.60 THEN 'IN'
          WHEN v_rand < 0.75 THEN 'US'
          WHEN v_rand < 0.90 THEN 'AE'
          ELSE 'SG'
        END;

        INSERT INTO qr_scans (qr_code_id, scanned_at, device_type, country_code, referrer_domain)
        VALUES (v_qr_3, v_scanned_at, v_device, v_country, NULL);
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seed complete. Total scans inserted: %', (SELECT COUNT(*) FROM qr_scans WHERE qr_code_id IN (v_qr_1, v_qr_2, v_qr_3));
END $$;