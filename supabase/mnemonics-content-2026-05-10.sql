-- ZìCards: Mnemonic-Updates 2026-05-10
-- 18 neue Compound-Eselsbrücken + 8 Überarbeitungen schwacher Einträge
-- (七, 九, 五 in der überarbeiteten Version mit Phonetik/Kultur-Anker).
--
-- Voraussetzung: supabase/mnemonics-schema.sql wurde bereits ausgeführt
-- und scripts/seed-mnemonics.mjs hat die Bestandsdaten eingespielt.
--
-- Idempotent (ON CONFLICT) — kann mehrfach laufen, jedes Mal werden
-- mnemonic + parts auf den Stand dieses Skripts gebracht.

insert into public.mnemonics (hanzi, mnemonic, parts) values

-- ============================================================
-- TEIL 1: Fehlende Compound-Eselsbrücken (18)
-- ============================================================

('日本',
 'Land der aufgehenden Sonne (日) — Ursprung (本) im Osten: JAPAN.',
 '[{"char":"日","meaning":"Sonne"},{"char":"本","meaning":"Ursprung"}]'::jsonb),

('法国',
 'Das Land (国) der Gesetze (法) — FRANKREICH. 🇫🇷 (法 wird hier rein phonetisch für "fa" benutzt.)',
 '[{"char":"法","meaning":"Gesetz/phon. Frankreich"},{"char":"国","meaning":"Land"}]'::jsonb),

('加拿大',
 'Phonetisch zusammengesetzt: jiā (加) + ná (拿) + dà (大) → "jianada" — KANADA. 🇨🇦 (Reine Lautschrift, Bedeutungen der Einzelzeichen sind hier egal.)',
 '[{"char":"加","meaning":"phon. ka"},{"char":"拿","meaning":"phon. na"},{"char":"大","meaning":"phon. da"}]'::jsonb),

('我们',
 'Ich (我) plus Pluralpartikel (们) — WIR.',
 '[{"char":"我","meaning":"ich"},{"char":"们","meaning":"Plural"}]'::jsonb),

('你们',
 'Du (你) plus Pluralpartikel (们) — IHR.',
 '[{"char":"你","meaning":"du"},{"char":"们","meaning":"Plural"}]'::jsonb),

('他们',
 'Er (他) plus Pluralpartikel (们) — SIE (gemischt oder männlich).',
 '[{"char":"他","meaning":"er"},{"char":"们","meaning":"Plural"}]'::jsonb),

('她们',
 'Sie/weibl. (她) plus Pluralpartikel (们) — SIE (alle weiblich).',
 '[{"char":"她","meaning":"sie (weibl.)"},{"char":"们","meaning":"Plural"}]'::jsonb),

('老师',
 'Der alte (老), erfahrene Meister (师) — LEHRER. 👨‍🏫',
 '[{"char":"老","meaning":"alt"},{"char":"师","meaning":"Meister"}]'::jsonb),

('学生',
 'Eine Person (生), die lernt (学) — SCHÜLER. 📚',
 '[{"char":"学","meaning":"lernen"},{"char":"生","meaning":"Person/Leben"}]'::jsonb),

('中国',
 'Das Land (国) der Mitte (中) — so nennt sich CHINA selbst. 🇨🇳',
 '[{"char":"中","meaning":"Mitte"},{"char":"国","meaning":"Land"}]'::jsonb),

('词典',
 'Wörter (词) im Nachschlagewerk (典) — WÖRTERBUCH. 📔',
 '[{"char":"词","meaning":"Wort"},{"char":"典","meaning":"Nachschlagewerk"}]'::jsonb),

('地图',
 'Ein Bild (图) der Erde (地) — LANDKARTE. 🗺️',
 '[{"char":"地","meaning":"Erde"},{"char":"图","meaning":"Bild"}]'::jsonb),

('本子',
 'Etwas Buchartiges (本) mit Substantiv-Suffix (子) — das HEFT. 📓',
 '[{"char":"本","meaning":"Buch-Zählwort"},{"char":"子","meaning":"Substantiv-Suffix"}]'::jsonb),

('没有',
 'Verneinung (没) von haben (有) — NICHT HABEN. (Pendant zu 不 für Verben, hier exklusiv für 有.)',
 '[{"char":"没","meaning":"nicht (haben)"},{"char":"有","meaning":"haben"}]'::jsonb),

('什么',
 'Die Standardfrage nach Dingen: WAS? z.B. 这是什么? = Was ist das? (么 ist Fragesuffix.)',
 '[{"char":"什","meaning":"was"},{"char":"么","meaning":"Fragesuffix"}]'::jsonb),

('照片',
 'Ein Stück (片) eingefangenes Licht (照) — das FOTO. 📸',
 '[{"char":"照","meaning":"scheinen/fotografieren"},{"char":"片","meaning":"Scheibe/Stück"}]'::jsonb),

('工作',
 'Werkzeug (工) und Handeln (作) — ARBEIT, BERUF. ⚒️',
 '[{"char":"工","meaning":"Arbeit/Werkzeug"},{"char":"作","meaning":"machen/tun"}]'::jsonb),

('大夫',
 'Der große (大) Mann (夫) — alte ehrenvolle Anrede für den ARZT. 🩺',
 '[{"char":"大","meaning":"groß"},{"char":"夫","meaning":"Mann"}]'::jsonb),

-- ============================================================
-- TEIL 2: Überarbeitungen schwacher Einträge (8)
-- ============================================================

('七',
 '七 (qī) klingt identisch wie 期 (qī, Woche/Periode) — und eine Woche hat genau SIEBEN Tage. 📅',
 '[]'::jsonb),

('九',
 '九 (jiǔ) klingt wie 久 (jiǔ, lange/ewig) — darum gilt NEUN in China als Glückszahl für Beständigkeit. Auch der Drache hat 九 Söhne. 🐉',
 '[]'::jsonb),

('五',
 'Oben ein Strich (Himmel), unten ein Strich (Erde), dazwischen ein X — die FÜNF Elemente (五行: Holz, Feuer, Erde, Metall, Wasser) verbinden beide.',
 '[]'::jsonb),

('的',
 'Wie ein weißes (白) Etikett, das man mit dem Löffel (勺) auf etwas klebt: "Das gehört MIR." Possessivpartikel — 我的 = mein, 你的 = dein.',
 '[{"char":"白","meaning":"weiß"},{"char":"勺","meaning":"Löffel"}]'::jsonb),

('图',
 'Ein gerahmter (囗) Inhalt — egal ob Karte, Diagramm oder Foto: ein BILD. 🖼️',
 '[{"char":"囗","meaning":"Rahmen"}]'::jsonb),

('两',
 'Ein Dach mit zwei Säulen darunter — ein PAAR, ZWEI zusammen. Wird statt 二 verwendet, wenn man zählt: 两个人 = zwei Personen.',
 '[]'::jsonb),

('同',
 'Unter einem Dach (冂) ein gemeinsamer Mund (口) — alle sagen dasselbe: GEMEINSAM, identisch.',
 '[{"char":"冂","meaning":"Dach"},{"char":"口","meaning":"Mund"}]'::jsonb),

('午',
 'Ein senkrechter Strich teilt den Tag — wenn die Sonne genau im Zenit steht, ist MITTAG (中午). ☀️',
 '[]'::jsonb)

on conflict (hanzi) do update
  set mnemonic = excluded.mnemonic,
      parts = excluded.parts,
      updated_at = now();
