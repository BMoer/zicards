-- Mnemonic fixes — 2026-05-25
--
-- Two groups:
--  1. Quality: 班 / 全 were cryptic ("ergibt keinen Sinn" feedback, 2026-05-09).
--  2. Consistency: 在 / 现 / 时 / 候 still referenced their OLD gloss after the
--     2026-05-25 reword (e.g. 在 said "JETZT" but now means "sich befinden").

-- ── Quality rewrites ─────────────────────────────────────────────────────────
UPDATE public.mnemonics
  SET mnemonic = 'Ein Messer (刂) teilt zwischen zwei Gruppen (王 | 王) – so werden Schüler in eine KLASSE eingeteilt. 🎒',
      parts = '[{"char":"王","meaning":"Gruppe"},{"char":"刂","meaning":"Messer"},{"char":"王","meaning":"Gruppe"}]'::jsonb
  WHERE hanzi = '班';

UPDATE public.mnemonics
  SET mnemonic = 'Ein Dach (人) über dem ganzen Schatz (王/Jade) – nichts fehlt, alles ist GANZ und vollständig. 💯',
      parts = '[{"char":"人","meaning":"Dach"},{"char":"王","meaning":"Jade/Schatz"}]'::jsonb
  WHERE hanzi = '全';

-- ── Consistency with the 2026-05-25 gloss reword ─────────────────────────────
UPDATE public.mnemonics
  SET mnemonic = 'Fest verwurzelt auf der Erde (土) – etwas BEFINDET SICH an seinem Ort, ist da. 📍'
  WHERE hanzi = '在';

UPDATE public.mnemonics
  SET mnemonic = 'Die Jade (王) kommt ins Sehen (见) – sie ERSCHEINT, wird sichtbar und gegenwärtig. 💎'
  WHERE hanzi = '现';

UPDATE public.mnemonics
  SET mnemonic = 'Die Sonne (日) liefert das Maß (寸) für den Tag – so misst man ZEIT und Stunde. ⏲️'
  WHERE hanzi = '时';

UPDATE public.mnemonics
  SET mnemonic = 'Eine Person (亻) hält den Pfeil gespannt und WARTET geduldig auf den richtigen Augenblick. 🏹'
  WHERE hanzi = '候';

-- ── Proof ────────────────────────────────────────────────────────────────────
SELECT hanzi, mnemonic FROM public.mnemonics
  WHERE hanzi IN ('班', '全', '在', '现', '时', '候')
  ORDER BY hanzi;
