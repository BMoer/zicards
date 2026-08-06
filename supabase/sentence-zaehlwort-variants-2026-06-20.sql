-- ZìCards: Zählwort (measure-word) acceptance variants + tokenization fix
-- 2026-06-20
--
-- Context: Power-user feedback (Nutzer aus dem Bestand) — the translate quiz (L3, whole
-- sentence via IME) rejected grammatically correct single-object phrasings that
-- differ only by the OPTIONAL measure word (一个/一本/一支 ↔ none). The textbook
-- itself mixes "mit Zählwort" and "ohne Zählwort" across single-object cards,
-- so the same learner sees the app demand 一个 on one card and forbid it on the
-- next.
--
-- Policy (B. Mörzinger, 2026-06-20): for SINGLE-object sentences accept BOTH
-- forms (with and without the correct measure word). Plurals and quantity
-- questions (两 / 几 / 多少 / explicit numbers) stay STRICT — the measure word is
-- obligatory there. The word-order quiz is unaffected (it only reorders fixed
-- tiles); this lives purely in the translate quiz via `accepted_variants`.

-- ─── 0. Data fix ────────────────────────────────────────────────────────────
-- 本子 was wrongly tokenized as 本 + 子 in this one row; every other sentence
-- keeps 本子 as a single token. The split produced stray 本/子 tiles in the
-- word-order quiz.
UPDATE public.sentences
SET words = '["我","有","一","个","本子","。"]'::jsonb
WHERE chinese = '我有一个本子。';

-- ─── 1. Canonical WITH measure word → also accept the dropped form ───────────
UPDATE public.sentences SET accepted_variants = '[["我","有","本子","。"]]'::jsonb
  WHERE chinese = '我有一个本子。';
UPDATE public.sentences SET accepted_variants = '[["我","有","哥哥","。"]]'::jsonb
  WHERE chinese = '我有一个哥哥。';
UPDATE public.sentences SET accepted_variants = '[["我","有","中国","朋友","。"]]'::jsonb
  WHERE chinese = '我有一个中国朋友。';
UPDATE public.sentences SET accepted_variants = '[["他","有","笔","。"]]'::jsonb
  WHERE chinese = '他有一支笔。';
UPDATE public.sentences SET accepted_variants = '[["老师","，","我","有","问题","。"]]'::jsonb
  WHERE chinese = '老师，我有一个问题。';

-- ─── 2. Canonical WITHOUT measure word → also accept the 一个-inserted form ───
-- 本子 takes the general classifier 个 (一个本子), not 一本本子.
UPDATE public.sentences SET accepted_variants = '[["她","也","有","一","个","本子","。"]]'::jsonb
  WHERE chinese = '她也有本子。';
UPDATE public.sentences SET accepted_variants = '[["你","有","一","个","本子","吗","？"]]'::jsonb
  WHERE chinese = '你有本子吗？';

-- ─── Left STRICT on purpose (measure word obligatory) ────────────────────────
--   两本书 / 两本词典 / 两张照片 / 三张地图  — plural counts
--   你有几本书？/ 你有几个外国朋友？/ 这个班有多少个学生？  — 几/多少 questions
--   我家有五口人。/ 我家有四口人。  — family size uses 口, count > 1
--   一年有十二个月。/ 我们班有二十二个学生。  — explicit numbers
