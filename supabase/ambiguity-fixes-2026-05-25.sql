-- Ambiguity fixes — 2026-05-25
--
-- User feedback (marchadl8@gmail.com, 2026-05-21..24; b.moerzinger, 2026-05-25)
-- reported prompts where one German gloss maps to several valid Chinese answers,
-- so the strict IME grader marks a legitimate answer wrong. Strategy chosen:
-- reword the German so every prompt has exactly ONE correct answer (data-only;
-- no schema or grading change). See SentenceQuizCard gap-fill fix for the
-- separate "voller Satz steht bereits dort" rendering bug.

-- ── Characters: distinguish near-synonymous glosses ──────────────────────────
-- "wieviel" matched both 多少 and 几 → learner can't tell which is wanted.
UPDATE public.characters SET meaning = 'wieviel (allgemein)'            WHERE hanzi = '多少';
UPDATE public.characters SET meaning = 'wie viele (1–9, mit Zählwort)'  WHERE hanzi = '几';
-- "lernen, studieren" was identical for both 学 and 学习 → pure 50/50.
UPDATE public.characters SET meaning = 'lernen (einsilbig)'             WHERE hanzi = '学';
UPDATE public.characters SET meaning = 'lernen, studieren (zweisilbig)' WHERE hanzi = '学习';

-- ── Sentences: disambiguate German prompts ───────────────────────────────────
-- 你们好 / 大家好 both read "Hallo zusammen!" → 50/50 in translate quiz.
UPDATE public.sentences SET german = 'Hallo euch!'                 WHERE chinese = '你们好！';
UPDATE public.sentences SET german = 'Hallo zusammen (alle)!'      WHERE chinese = '大家好！';
-- German "ihr" is ambiguous (her / their); pin it to the intended reading.
UPDATE public.sentences SET german = 'Das ist deren Wörterbuch.'   WHERE chinese = '这是他们的词典。';
UPDATE public.sentences SET german = 'Das ist ihr (der Frau) Heft.' WHERE chinese = '这是她的本子。';

-- ── Same-class collisions found during review (point #3) ─────────────────────
-- 认识 / 现在 / 时候 are each stored as TWO single-char rows that both carried
-- the *compound* gloss, so the L3 IME prompt was identical for the two chars
-- (50/50 which pinyin to type). Replace with each char's accurate standalone
-- meaning — distinct prompts, and more correct for the single character.
UPDATE public.characters SET meaning = 'erkennen, anerkennen'   WHERE hanzi = '认';
UPDATE public.characters SET meaning = 'wissen, Kenntnis'       WHERE hanzi = '识';
UPDATE public.characters SET meaning = 'erscheinen, gegenwärtig' WHERE hanzi = '现';
UPDATE public.characters SET meaning = 'sich befinden, an/in'    WHERE hanzi = '在';
UPDATE public.characters SET meaning = 'Zeit, Stunde'           WHERE hanzi = '时';
UPDATE public.characters SET meaning = 'abwarten'               WHERE hanzi = '候';
-- "Ihre ältere Schwester" — same her/their "ihr" ambiguity in the translate step.
UPDATE public.sentences SET german = 'Ihre (der Frau) ältere Schwester ist Ärztin.' WHERE chinese = '她姐姐是大夫。';

-- ── Proof: show the rewritten rows ───────────────────────────────────────────
SELECT 'char' AS kind, hanzi AS key, meaning AS german FROM public.characters
  WHERE hanzi IN ('多少', '几', '学', '学习', '认', '识', '现', '在', '时', '候')
UNION ALL
SELECT 'sentence' AS kind, chinese AS key, german FROM public.sentences
  WHERE chinese IN ('你们好！', '大家好！', '这是他们的词典。', '这是她的本子。', '她姐姐是大夫。')
ORDER BY kind, key;
