-- ZìCards: Spaced Repetition + Email Reminder Migration
-- Run in Supabase SQL Editor

-- 1. Add next_review to user_progress
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS next_review timestamptz DEFAULT now();

-- Backfill: set next_review based on existing data
UPDATE public.user_progress
SET next_review = COALESCE(last_practiced, now()) + INTERVAL '4 hours'
WHERE next_review IS NULL OR next_review = now();

-- 2. Add next_review to sentence_progress
ALTER TABLE public.sentence_progress
  ADD COLUMN IF NOT EXISTS next_review timestamptz DEFAULT now();

UPDATE public.sentence_progress
SET next_review = COALESCE(last_practiced, now()) + INTERVAL '4 hours'
WHERE next_review IS NULL OR next_review = now();

-- 3. User settings table (for email reminders etc.)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reminder_enabled boolean DEFAULT false,
  reminder_hour integer DEFAULT 9 CHECK (reminder_hour >= 0 AND reminder_hour <= 23),
  last_reminder_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_reminder ON public.user_settings(reminder_enabled) WHERE reminder_enabled = true;

-- RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sieht eigene Settings"
  ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User erstellt eigene Settings"
  ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User aktualisiert eigene Settings"
  ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Function to count due cards for a user (used by edge function for reminders)
CREATE OR REPLACE FUNCTION public.get_due_counts(p_user_id uuid)
RETURNS TABLE(due_characters bigint, due_sentences bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.user_progress
     WHERE user_id = p_user_id AND next_review <= now()) AS due_characters,
    (SELECT count(*) FROM public.sentence_progress
     WHERE user_id = p_user_id AND next_review <= now()) AS due_sentences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
