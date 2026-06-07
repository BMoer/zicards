-- ZìCards: L6-Content-Ingest 2026-06-07
-- Quelle: L6.pptx von Tian Laoshi (39 Slides), Konfuzius-Institut Wien
-- Lektion 6 "我们上午八点半上课" (U2: Time & Position — Uhrzeit & Tagesablauf)
--
-- Inhalt:
--   - 27 neue L6-Einzelzeichen (Uhrzeit, Tageszeit, Tagesablauf, Fragen)
--   - 28 L6-Sätze (Uhrzeit, Tagesablauf, 什么时候/几点, 有课/Höflichkeit)
--
-- Zeichenumfang: 24 Kern-Zeichen aus dem PPT + 3 zusätzliche (请, 题, 班),
-- damit die Kern-Phrasen 请问 / 问题 / 没问题 / 上班 / 下班 vollständig aus
-- lernbaren Zeichen bestehen.
--
-- HINWEIS: Fügt nur Zeilen in die BESTEHENDEN Tabellen characters/sentences
-- ein — kein CREATE TABLE, daher keine GRANTs nötig (die Grant-Pflicht aus
-- CLAUDE.md gilt nur für neue Tabellen; characters/sentences sind bereits
-- granted). Idempotent: Zeichen via NOT EXISTS, Sätze via L6-Existenz-Check.
--
-- Ausführung: Supabase SQL Editor → komplett pasten (oder via Management API).
-- Inhalt vor dem Spielen gegen das Lehrmaterial gegenprüfen.

-- =====================================================================
-- TEIL 1: Neue L6-Einzelzeichen (27)
-- =====================================================================

insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
select * from (values
  -- Uhrzeit
  ('点'::text, null::text, 'diǎn'::text, null::text, 'dian3'::text, 'Uhr (in der Uhrzeit)'::text, '灬'::text, 6, 'Lektion 6'::text),
  ('分', null, 'fēn', null, 'fen1', 'Minute (in der Uhrzeit)', '刀', 6, 'Lektion 6'),
  ('刻', null, 'kè', null, 'ke4', 'Viertelstunde', '刂', 6, 'Lektion 6'),
  ('半', null, 'bàn', null, 'ban4', 'halb', '十', 6, 'Lektion 6'),
  ('差', null, 'chà', null, 'cha4', 'vor (bei Uhrzeit); fehlen', '工', 6, 'Lektion 6'),
  -- Tageszeit
  ('上', null, 'shàng', null, 'shang4', 'oben; hinauf-', '一', 6, 'Lektion 6'),
  ('下', null, 'xià', null, 'xia4', 'unten; hinab-', '一', 6, 'Lektion 6'),
  ('午', '中午', 'wǔ', 'zhōngwǔ', 'wu3', 'Mittag', '十', 6, 'Lektion 6'),
  ('早', '早上', 'zǎo', 'zǎoshang', 'zao3', 'früh; Morgen', '日', 6, 'Lektion 6'),
  ('晚', '晚上', 'wǎn', 'wǎnshang', 'wan3', 'spät; Abend', '日', 6, 'Lektion 6'),
  -- Tagesablauf
  ('起', '起床', 'qǐ', 'qǐchuáng', 'qi3', 'aufstehen; sich erheben', '走', 6, 'Lektion 6'),
  ('床', '起床', 'chuáng', 'qǐchuáng', 'chuang2', 'Bett', '广', 6, 'Lektion 6'),
  ('睡', '睡觉', 'shuì', 'shuìjiào', 'shui4', 'schlafen', '目', 6, 'Lektion 6'),
  ('觉', '睡觉', 'jiào', 'shuìjiào', 'jiao4', 'schlafen (in 睡觉)', '见', 6, 'Lektion 6'),
  ('课', '上课', 'kè', 'shàngkè', 'ke4', 'Unterricht; Lektion', '讠', 6, 'Lektion 6'),
  ('习', '学习', 'xí', 'xuéxí', 'xi2', 'üben; lernen (in 学习)', '乙', 6, 'Lektion 6'),
  -- Zeit & Fragen
  ('现', '现在', 'xiàn', 'xiànzài', 'xian4', 'gegenwärtig (in 现在)', '王', 6, 'Lektion 6'),
  ('在', '现在', 'zài', 'xiànzài', 'zai4', 'sich befinden; in/an (in 现在)', '土', 6, 'Lektion 6'),
  ('时', '时间', 'shí', 'shíjiān', 'shi2', 'Zeit; Stunde', '日', 6, 'Lektion 6'),
  ('候', '时候', 'hòu', 'shíhou', 'hou4', 'Zeitpunkt (in 时候)', '亻', 6, 'Lektion 6'),
  ('间', '时间', 'jiān', 'shíjiān', 'jian1', 'Zwischenraum (in 时间)', '门', 6, 'Lektion 6'),
  ('问', '问题', 'wèn', 'wèntí', 'wen4', 'fragen', '门', 6, 'Lektion 6'),
  ('用', null, 'yòng', null, 'yong4', 'benutzen; brauchen', '用', 6, 'Lektion 6'),
  ('钟', '钟点', 'zhōng', 'zhōngdiǎn', 'zhong1', 'Glocke; Uhr (in 钟点)', '钅', 6, 'Lektion 6'),
  -- Zusatz für lernbare Kern-Phrasen
  ('请', '请问', 'qǐng', 'qǐngwèn', 'qing3', 'bitte; einladen', '讠', 6, 'Lektion 6'),
  ('题', '问题', 'tí', 'wèntí', 'ti2', 'Thema; Frage (in 问题)', '页', 6, 'Lektion 6'),
  ('班', '上班', 'bān', 'shàngbān', 'ban1', 'Schicht; zur Arbeit (in 上班/下班)', '王', 6, 'Lektion 6')
) as v(hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
where not exists (
  select 1 from public.characters c
  where c.hanzi = v.hanzi and c.lesson = v.lesson
);

-- =====================================================================
-- TEIL 2: L6-Sätze (28)
-- =====================================================================
-- Sicherheits-Check: nur einfügen, wenn L6 noch keine Sätze hat.
-- Falls Re-Run gewünscht: `delete from public.sentences where lesson = 'Lektion 6';`
-- vorab manuell ausführen.

do $$
begin
  if exists (select 1 from public.sentences where lesson = 'Lektion 6') then
    raise notice 'L6 has existing sentences — skipping. Delete them first to re-seed.';
  else
    insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson) values

    -- ============ Uhrzeit ============
    ('现在几点？', 'Xiànzài jǐ diǎn?', 'Wie spät ist es jetzt?',
     '["现在","几","点","？"]', '现在', 'jetzt', 6, 'Lektion 6'),

    ('现在八点。', 'Xiànzài bā diǎn.', 'Es ist acht Uhr.',
     '["现在","八","点","。"]', '点', 'Uhr (in der Uhrzeit)', 6, 'Lektion 6'),

    ('现在八点零五分。', 'Xiànzài bā diǎn líng wǔ fēn.', 'Es ist fünf nach acht (8:05).',
     '["现在","八","点","零","五","分","。"]', '分', 'Minute', 6, 'Lektion 6'),

    ('现在八点一刻。', 'Xiànzài bā diǎn yí kè.', 'Es ist viertel nach acht (8:15).',
     '["现在","八","点","一","刻","。"]', '刻', 'Viertelstunde', 6, 'Lektion 6'),

    ('现在两点半。', 'Xiànzài liǎng diǎn bàn.', 'Es ist halb drei (2:30).',
     '["现在","两","点","半","。"]', '半', 'halb', 6, 'Lektion 6'),

    ('现在差五分九点。', 'Xiànzài chà wǔ fēn jiǔ diǎn.', 'Es ist fünf vor neun (8:55).',
     '["现在","差","五","分","九","点","。"]', '差', 'vor (bei der Uhrzeit)', 6, 'Lektion 6'),

    ('请问，现在几点？', 'Qǐng wèn, xiànzài jǐ diǎn?', 'Darf ich fragen, wie spät es ist?',
     '["请问","，","现在","几","点","？"]', '请问', 'darf ich fragen / entschuldigen Sie', 6, 'Lektion 6'),

    ('谢谢！不用谢！', 'Xièxie! Búyòng xiè!', 'Danke! — Keine Ursache!',
     '["谢谢","！","不用谢","！"]', '不用谢', 'keine Ursache (Antwort auf Danke)', 6, 'Lektion 6'),

    -- ============ Tagesablauf ============
    ('我早上七点起床。', 'Wǒ zǎoshang qī diǎn qǐchuáng.', 'Ich stehe morgens um sieben auf.',
     '["我","早上","七","点","起床","。"]', '起床', 'aufstehen', 6, 'Lektion 6'),

    ('安妮早上七点一刻起床。', 'Ānní zǎoshang qī diǎn yí kè qǐchuáng.', 'Anni steht morgens um viertel nach sieben auf.',
     '["安妮","早上","七","点","一","刻","起床","。"]', '早上', 'Morgen / morgens', 6, 'Lektion 6'),

    ('我晚上十点睡觉。', 'Wǒ wǎnshang shí diǎn shuìjiào.', 'Ich gehe abends um zehn schlafen.',
     '["我","晚上","十","点","睡觉","。"]', '睡觉', 'schlafen gehen', 6, 'Lektion 6'),

    ('你几点睡觉？', 'Nǐ jǐ diǎn shuìjiào?', 'Um wie viel Uhr gehst du schlafen?',
     '["你","几","点","睡觉","？"]', '睡觉', 'schlafen', 6, 'Lektion 6'),

    ('我们上午八点半上课。', 'Wǒmen shàngwǔ bā diǎn bàn shàngkè.', 'Wir haben vormittags um halb neun Unterricht.',
     '["我们","上午","八","点","半","上课","。"]', '上课', 'Unterricht haben / beginnen', 6, 'Lektion 6'),

    ('我们中午十二点半下课。', 'Wǒmen zhōngwǔ shí''èr diǎn bàn xiàkè.', 'Wir haben mittags um halb eins Schluss.',
     '["我们","中午","十二","点","半","下课","。"]', '下课', 'Unterricht beenden', 6, 'Lektion 6'),

    ('你什么时候上课？', 'Nǐ shénme shíhou shàngkè?', 'Wann hast du Unterricht?',
     '["你","什么时候","上课","？"]', '什么时候', 'wann', 6, 'Lektion 6'),

    ('我下午两点上课。', 'Wǒ xiàwǔ liǎng diǎn shàngkè.', 'Ich habe nachmittags um zwei Unterricht.',
     '["我","下午","两","点","上课","。"]', '下午', 'Nachmittag / nachmittags', 6, 'Lektion 6'),

    ('你几点起床？', 'Nǐ jǐ diǎn qǐchuáng?', 'Um wie viel Uhr stehst du auf?',
     '["你","几","点","起床","？"]', '起床', 'aufstehen', 6, 'Lektion 6'),

    ('我上午有汉语课。', 'Wǒ shàngwǔ yǒu Hànyǔ kè.', 'Ich habe vormittags Chinesischunterricht.',
     '["我","上午","有","汉语","课","。"]', '上午', 'Vormittag / vormittags', 6, 'Lektion 6'),

    ('我学习汉语。', 'Wǒ xuéxí Hànyǔ.', 'Ich lerne Chinesisch.',
     '["我","学习","汉语","。"]', '学习', 'lernen', 6, 'Lektion 6'),

    ('你有时间吗？', 'Nǐ yǒu shíjiān ma?', 'Hast du Zeit?',
     '["你","有","时间","吗","？"]', '时间', 'Zeit', 6, 'Lektion 6'),

    -- ============ 有课 / Fragen / Höflichkeit ============
    ('明天你有课吗？', 'Míngtiān nǐ yǒu kè ma?', 'Hast du morgen Unterricht?',
     '["明天","你","有","课","吗","？"]', '课', 'Unterricht', 6, 'Lektion 6'),

    ('我星期五没有课。', 'Wǒ xīngqīwǔ méi yǒu kè.', 'Am Freitag habe ich keinen Unterricht.',
     '["我","星期","五","没","有","课","。"]', '有', 'haben (verneint: 没有)', 6, 'Lektion 6'),

    ('你什么时候下课？', 'Nǐ shénme shíhou xiàkè?', 'Wann hast du Schluss?',
     '["你","什么时候","下课","？"]', '下课', 'Unterricht beenden', 6, 'Lektion 6'),

    ('现在是上午。', 'Xiànzài shì shàngwǔ.', 'Es ist jetzt Vormittag.',
     '["现在","是","上午","。"]', '上午', 'Vormittag', 6, 'Lektion 6'),

    ('老师，我有一个问题。', 'Lǎoshī, wǒ yǒu yí ge wèntí.', 'Lehrer, ich habe eine Frage.',
     '["老师","，","我","有","一","个","问题","。"]', '问题', 'Frage', 6, 'Lektion 6'),

    ('没问题！', 'Méi wèntí!', 'Kein Problem!',
     '["没","问题","！"]', '问题', 'Problem', 6, 'Lektion 6'),

    -- ============ 上班 / 下班 ============
    ('你什么时候上班？', 'Nǐ shénme shíhou shàngbān?', 'Wann gehst du zur Arbeit?',
     '["你","什么时候","上班","？"]', '上班', 'zur Arbeit gehen', 6, 'Lektion 6'),

    ('我早上八点上班，下午五点下班。', 'Wǒ zǎoshang bā diǎn shàngbān, xiàwǔ wǔ diǎn xiàbān.', 'Ich gehe morgens um acht zur Arbeit und mache nachmittags um fünf Feierabend.',
     '["我","早上","八","点","上班","，","下午","五","点","下班","。"]', '下班', 'Feierabend machen', 6, 'Lektion 6');
  end if;
end $$;

-- =====================================================================
-- Verify (optional — manuell nach Run prüfen)
-- =====================================================================
-- select count(*) from public.characters where lesson = 'Lektion 6';  -- erwartet: 27
-- select count(*) from public.sentences  where lesson = 'Lektion 6';  -- erwartet: 28
