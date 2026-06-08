-- L3 fix — Zählwort-Duplikat "Wie viele Personen hat deine Familie?"
-- Datum: 2026-06-08
--
-- Problem: Es existierten ZWEI Sätze mit identischem deutschen Prompt
-- "Wie viele Personen hat deine Familie?":
--   (a) 你家有几个人？  (个 = allgemeines Zählwort)   id 782e61e1-…
--   (b) 你家有几口人？  (口 = Zählwort f. Familienmitglieder, idiomatisch korrekt) id 1a38ef94-…
-- Im "Übersetze ins Chinesische"-Modus wurde Variante (a) zur Wiederholung
-- ausgespielt; tippte der User die korrektere 口-Variante, wurde sie als
-- falsch gewertet (User-Report 2026-06-08, "99% sicher dass meins richtig ist").
-- 口 ist sachlich das richtige Zählwort für Familiengröße (你家有几口人).
--
-- Fix: Die 个-Variante (a) löschen, nur die 口-Variante (b) behalten.
-- FK sentence_progress.sentence_id -> sentences(id) ON DELETE CASCADE entfernt
-- die zugehörigen 7 Fortschritts-Zeilen automatisch.
--
-- Hinweis: Variante (b) wurde seinerzeit direkt in der DB angelegt und fehlte
-- im Repo. Der Seed in zicards-sentences-schema.sql (Zeile ~135) wurde mit
-- diesem Fix auf die 口-Variante umgestellt, damit Repo und DB übereinstimmen.

delete from public.sentences
where id = '782e61e1-5656-4d67-9515-6cf5f62be07c'  -- 你家有几个人？
  and chinese = '你家有几个人？';                    -- Schutz: nur falls Inhalt unverändert

-- Konsistenz: Familiengröße im selben Lektions-Kontext einheitlich mit 口
-- (es gab bereits 我家有四口人。). 我家有五个人。 -> 我家有五口人。
update public.sentences
set chinese = '我家有五口人。',
    pinyin  = 'Wǒ jiā yǒu wǔ kǒu rén.',
    words   = '["我","家","有","五","口","人","。"]'::jsonb
where id = 'f6f21e98-6273-422b-ae5a-5cd5923bb668'
  and chinese = '我家有五个人。';
