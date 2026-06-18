-- ZìCards: accept subject-kept phrasings for two more contrastive sentences (2026-06-18)
--
-- Follow-up to sentence-accepted-variants-2026-06-15.sql. That migration fixed
-- two contrastive "不是 X，(subject) 是 Y" cards but missed two more. These two
-- are stored in the subject-DROPPED form, so the grader wrongly rejects the
-- equally-correct subject-KEPT phrasing (这是…). Same class of bug, two more cards.
--
-- NOTE: no GRANT block needed — `accepted_variants` is an existing COLUMN on the
-- already-granted `public.sentences` table; table-level Data-API grants cover all
-- columns. (See CLAUDE.md: grants are required for new TABLES, not columns.)

-- 这不是你的，是我的。 — also accept the subject-repeated second clause (这是我的).
UPDATE public.sentences
SET accepted_variants = '[["这","不","是","你","的","，","这","是","我","的","。"]]'::jsonb
WHERE id = '5dd88ab2-9593-4be9-a7a1-5af810d48872';

-- 这不是我的本子，是他的。 — also accept the subject-repeated second clause (这是他的).
UPDATE public.sentences
SET accepted_variants = '[["这","不","是","我","的","本子","，","这","是","他","的","。"]]'::jsonb
WHERE id = 'b952eb25-b0d1-4ae5-9946-efd6fa465452';
