-- ZìCards: Admin Dashboard Schema
-- Run this in Supabase SQL Editor

-- 1. Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read admin list"
  ON public.admin_users FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 2. Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get all users overview (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  char_total bigint,
  char_practiced bigint,
  char_mastered bigint,
  char_lapsed bigint,
  sent_total bigint,
  sent_practiced bigint,
  sent_mastered bigint,
  sent_lapsed bigint,
  total_practice_count bigint,
  last_activity timestamptz,
  active_days bigint
) AS $$
BEGIN
  -- Check admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH user_list AS (
    SELECT au.id AS uid, au.email::text AS uemail,
           au.last_sign_in_at AS usign, au.created_at AS ucreated
    FROM auth.users au
  ),
  char_stats AS (
    SELECT
      up.user_id AS uid,
      count(*) AS practiced,
      count(*) FILTER (WHERE up.level >= 3 AND up.next_review > now()) AS mastered,
      count(*) FILTER (WHERE up.level >= 3 AND (up.next_review IS NULL OR up.next_review <= now())) AS lapsed,
      sum(up.times_practiced) AS practice_count,
      max(up.last_practiced) AS last_act,
      count(DISTINCT date_trunc('day', up.last_practiced)) AS days
    FROM public.user_progress up
    GROUP BY up.user_id
  ),
  sent_stats AS (
    SELECT
      sp.user_id AS uid,
      count(*) AS practiced,
      count(*) FILTER (WHERE sp.level >= 3 AND sp.next_review > now()) AS mastered,
      count(*) FILTER (WHERE sp.level >= 3 AND (sp.next_review IS NULL OR sp.next_review <= now())) AS lapsed,
      sum(sp.times_practiced) AS practice_count,
      max(sp.last_practiced) AS last_act
    FROM public.sentence_progress sp
    GROUP BY sp.user_id
  ),
  totals AS (
    SELECT
      (SELECT count(*) FROM public.characters) AS total_chars,
      (SELECT count(*) FROM public.sentences) AS total_sents
  )
  SELECT
    ul.uid,
    ul.uemail,
    ul.usign,
    ul.ucreated,
    t.total_chars,
    COALESCE(cs.practiced, 0),
    COALESCE(cs.mastered, 0),
    COALESCE(cs.lapsed, 0),
    t.total_sents,
    COALESCE(ss.practiced, 0),
    COALESCE(ss.mastered, 0),
    COALESCE(ss.lapsed, 0),
    COALESCE(cs.practice_count, 0) + COALESCE(ss.practice_count, 0),
    GREATEST(cs.last_act, ss.last_act),
    COALESCE(cs.days, 0)
  FROM user_list ul
  CROSS JOIN totals t
  LEFT JOIN char_stats cs ON cs.uid = ul.uid
  LEFT JOIN sent_stats ss ON ss.uid = ul.uid
  ORDER BY GREATEST(cs.last_act, ss.last_act) DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get detailed progress for a specific user (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_user_chars(p_user_id uuid)
RETURNS TABLE(
  character_id uuid,
  hanzi text,
  word text,
  pinyin text,
  meaning text,
  lesson text,
  week integer,
  level integer,
  correct_streak integer,
  incorrect_streak integer,
  times_practiced integer,
  last_practiced timestamptz,
  next_review timestamptz
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.hanzi,
    c.word,
    c.pinyin,
    c.meaning,
    c.lesson,
    c.week,
    COALESCE(up.level, 0),
    COALESCE(up.correct_streak, 0),
    COALESCE(up.incorrect_streak, 0),
    COALESCE(up.times_practiced, 0),
    up.last_practiced,
    up.next_review
  FROM public.characters c
  LEFT JOIN public.user_progress up ON up.character_id = c.id AND up.user_id = p_user_id
  ORDER BY c.week, c.hanzi;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Get detailed sentence progress for a specific user (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_user_sentences(p_user_id uuid)
RETURNS TABLE(
  sentence_id uuid,
  chinese text,
  pinyin text,
  german text,
  lesson text,
  week integer,
  level integer,
  correct_streak integer,
  incorrect_streak integer,
  times_practiced integer,
  last_practiced timestamptz,
  next_review timestamptz
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.chinese,
    s.pinyin,
    s.german,
    s.lesson,
    s.week,
    COALESCE(sp.level, 0),
    COALESCE(sp.correct_streak, 0),
    COALESCE(sp.incorrect_streak, 0),
    COALESCE(sp.times_practiced, 0),
    sp.last_practiced,
    sp.next_review
  FROM public.sentences s
  LEFT JOIN public.sentence_progress sp ON sp.sentence_id = s.id AND sp.user_id = p_user_id
  ORDER BY s.week, s.chinese;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. INSERT YOUR ADMIN USER HERE
-- Replace with the actual admin user UUID from auth.users
-- INSERT INTO public.admin_users (user_id) VALUES ('YOUR-ADMIN-UUID-HERE');
