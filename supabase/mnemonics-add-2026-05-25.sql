-- Add mnemonics for the 11 L5 characters that had none — 2026-05-25.
-- Idempotent: upsert on the hanzi primary key.

INSERT INTO public.mnemonics (hanzi, mnemonic, parts) VALUES
  ('零', 'Wasser (雨, Regen) gefriert bei 零 Grad zu Eis – der Gefrierpunkt ist NULL. Der untere Teil 令 liefert nur den Klang „líng". ❄️',
   '[{"char":"雨","meaning":"Regen"},{"char":"令","meaning":"Klang líng"}]'::jsonb),
  ('客', 'Unter dem Dach (宀) ist jeder (各) willkommen – ein GAST. (不客气 = keine Ursache!) 🚪',
   '[{"char":"宀","meaning":"Dach"},{"char":"各","meaning":"jeder"}]'::jsonb),
  ('年', 'Einmal im JAHR feiert man 过年, das chinesische Neujahr – mit Feuerwerk und roten Umschlägen. 年 = Jahr. 🧧',
   '[]'::jsonb),
  ('对', 'Mit der Hand (又) genau abmessen (寸) – das STIMMT, richtig! ✓',
   '[{"char":"又","meaning":"Hand"},{"char":"寸","meaning":"Maß"}]'::jsonb),
  ('气', 'Die drei wehenden Striche zeigen aufsteigenden Dampf – 气 ist LUFT und Atem (Qì). Steckt in 生气 = wütend (einem steigt die Luft hoch). 💨',
   '[]'::jsonb),
  ('号', 'Der Mund (口) ruft das Datum aus – den wievielten TAG haben wir? 📅',
   '[{"char":"口","meaning":"Mund"}]'::jsonb),
  ('天', 'Tage zählt man im Chinesischen mit 天: 今天 (heute), 昨天 (gestern), 明天 (morgen) – darum 天 = TAG (und Himmel). ☀️',
   '[]'::jsonb),
  ('祝', 'Am Altar (礻) spricht der Beter (兄) Segensworte – etwas WÜNSCHEN. 🙏',
   '[{"char":"礻","meaning":"Altar"},{"char":"兄","meaning":"Beter"}]'::jsonb),
  ('谢', 'Mit Worten (讠) etwas zurückschicken (射) – DANKE sagen. 🙏',
   '[{"char":"讠","meaning":"sprechen"},{"char":"射","meaning":"schießen"}]'::jsonb),
  ('认', 'Mit Worten (讠) eine Person (人) ansprechen – sie ERKENNEN, kennenlernen.',
   '[{"char":"讠","meaning":"sprechen"},{"char":"人","meaning":"Person"}]'::jsonb),
  ('识', 'Durch Sprache (讠) Stück für Stück (只) Wissen sammeln – KENNTNIS. 💡',
   '[{"char":"讠","meaning":"sprechen"},{"char":"只","meaning":"einzeln"}]'::jsonb)
ON CONFLICT (hanzi) DO UPDATE
  SET mnemonic = EXCLUDED.mnemonic, parts = EXCLUDED.parts;

-- Proof
SELECT hanzi, mnemonic FROM public.mnemonics
  WHERE hanzi IN ('零','客','年','对','气','号','天','祝','谢','认','识')
  ORDER BY hanzi;
