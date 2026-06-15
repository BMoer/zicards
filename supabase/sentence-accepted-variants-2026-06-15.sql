-- ZìCards: accept multiple equally-correct phrasings per sentence (2026-06-15)
--
-- A contrastive "不是 X，(subject) 是 Y" sentence is grammatical both with and
-- without the repeated subject pronoun in the second clause. Two existing cards
-- were inconsistent about this and a learner (correctly) flagged it:
--   她不是老师，她是学生。 (subject kept)   vs.   他不是中国人，是法国人。 (subject dropped)
-- Rather than force one style, the translate (L3) grader now accepts any listed
-- variant. `accepted_variants` is an array of alternative `words` arrays; the
-- canonical `chinese`/`words` stays the displayed/spoken form.
--
-- NOTE: no GRANT block needed — `accepted_variants` is a new COLUMN on the
-- already-granted `public.sentences` table; table-level Data-API grants cover
-- all columns. (See CLAUDE.md: grants are required for new TABLES, not columns.)

ALTER TABLE public.sentences
  ADD COLUMN IF NOT EXISTS accepted_variants jsonb;

COMMENT ON COLUMN public.sentences.accepted_variants IS
  'Optional array of alternative word arrays accepted as correct in the translate quiz, e.g. [["他","不","是",...]]. NULL = only the canonical `words` is accepted.';

-- 她不是老师，她是学生。 — also accept the subject-dropped second clause.
UPDATE public.sentences
SET accepted_variants = '[["她","不","是","老师","，","是","学生","。"]]'::jsonb
WHERE id = '21dcbfa4-5940-44b9-a2c1-0673de790376';

-- 他不是中国人，是法国人。 — also accept the subject-repeated second clause.
UPDATE public.sentences
SET accepted_variants = '[["他","不","是","中国","人","，","他","是","法国","人","。"]]'::jsonb
WHERE id = 'e514f383-ffa1-4e63-a1a6-9839da6583cf';
