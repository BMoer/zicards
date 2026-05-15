-- ZìCards: L5-Content-Ingest 2026-05-15
-- Quelle: L5.pptx von Tian Laoshi (53 Slides), Konfuzius-Institut Wien
-- Lektion 5 "我的生日是五月九号" (U2: Time & Position)
--
-- Inhalt:
--   - 13 neue L5-Einzelzeichen (Datum, Höflichkeit, Geschlecht, Kennenlernen)
--   - 24 L5-Sätze (Geburtstag, Datum, Höflichkeit, Lehrtext-basiert)
--
-- Idempotent für Zeichen (NOT EXISTS-Check). Sätze: Skript prüft erst,
-- ob L5 schon Sätze hat — wenn ja, abort. Ben kann das per Hand löschen
-- und neu spielen, falls Re-Run nötig ist.
--
-- Ausführung: Supabase SQL Editor → einfach komplett pasten.

-- =====================================================================
-- TEIL 1: Neue L5-Einzelzeichen (13)
-- =====================================================================

insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
select * from (values
  ('天'::text, null::text, 'tiān'::text, null::text, 'tian1'::text, 'Tag'::text, null::text, 5, 'Lektion 5'::text),
  ('号', null, 'hào', null, 'hao4', 'Tag (im Datum, informell)', '口', 5, 'Lektion 5'),
  ('年', null, 'nián', null, 'nian2', 'Jahr', null, 5, 'Lektion 5'),
  ('零', null, 'líng', null, 'ling2', 'Null', '雨', 5, 'Lektion 5'),
  ('祝', null, 'zhù', null, 'zhu4', 'wünschen', '礻', 5, 'Lektion 5'),
  ('谢', '谢谢', 'xiè', 'xièxie', 'xie4', 'danken (in 谢谢)', '讠', 5, 'Lektion 5'),
  ('客', '不客气', 'kè', 'búkèqi', 'ke4', 'Gast (in 不客气: bitte sehr)', '宀', 5, 'Lektion 5'),
  ('气', '不客气', 'qì', 'búkèqi', 'qi4', 'Luft/Atem (in 不客气)', null, 5, 'Lektion 5'),
  ('对', null, 'duì', null, 'dui4', 'stimmt, richtig', null, 5, 'Lektion 5'),
  ('认', '认识', 'rèn', 'rènshi', 'ren4', 'kennen (in 认识)', '讠', 5, 'Lektion 5'),
  ('识', '认识', 'shi', 'rènshi', 'shi0', 'kennen (in 认识)', '讠', 5, 'Lektion 5'),
  ('男', null, 'nán', null, 'nan2', 'männlich', '田', 5, 'Lektion 5'),
  ('女', null, 'nǚ', null, 'nv3', 'weiblich', null, 5, 'Lektion 5')
) as v(hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
where not exists (
  select 1 from public.characters c
  where c.hanzi = v.hanzi and c.lesson = v.lesson
);

-- =====================================================================
-- TEIL 2: L5-Sätze (24)
-- =====================================================================
-- Sicherheits-Check: nur einfügen, wenn L5 noch keine Sätze hat.
-- Falls Re-Run gewünscht: `delete from public.sentences where lesson = 'Lektion 5';`
-- vorab manuell ausführen.

do $$
begin
  if exists (select 1 from public.sentences where lesson = 'Lektion 5') then
    raise notice 'L5 has existing sentences — skipping. Delete them first to re-seed.';
  else
    insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson) values

    -- ============ Datum & Geburtstag ============
    ('你的生日是几月几号？', 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', 'Wann hast du Geburtstag?',
     '["你","的","生日","是","几","月","几","号","？"]', '生日', 'Geburtstag', 5, 'Lektion 5'),

    ('我的生日是五月九号。', 'Wǒ de shēngrì shì wǔ yuè jiǔ hào.', 'Mein Geburtstag ist der 9. Mai.',
     '["我","的","生日","是","五","月","九","号","。"]', '号', 'Tag (im Datum)', 5, 'Lektion 5'),

    ('今天是我的生日。', 'Jīntiān shì wǒ de shēngrì.', 'Heute ist mein Geburtstag.',
     '["今天","是","我","的","生日","。"]', '今天', 'heute', 5, 'Lektion 5'),

    ('妈妈的生日是几月几号？', 'Māma de shēngrì shì jǐ yuè jǐ hào?', 'Wann hat Mama Geburtstag?',
     '["妈妈","的","生日","是","几","月","几","号","？"]', '生日', 'Geburtstag', 5, 'Lektion 5'),

    ('今天十二月四号。', 'Jīntiān shí''èr yuè sì hào.', 'Heute ist der 4. Dezember.',
     '["今天","十二","月","四","号","。"]', '号', 'Tag (im Datum)', 5, 'Lektion 5'),

    ('昨天几月几号？', 'Zuótiān jǐ yuè jǐ hào?', 'Welches Datum war gestern?',
     '["昨天","几","月","几","号","？"]', '昨天', 'gestern', 5, 'Lektion 5'),

    ('明天星期几？', 'Míngtiān xīngqī jǐ?', 'Welcher Wochentag ist morgen?',
     '["明天","星期","几","？"]', '明天', 'morgen', 5, 'Lektion 5'),

    ('今天不是星期四。', 'Jīntiān bú shì xīngqī sì.', 'Heute ist nicht Donnerstag.',
     '["今天","不","是","星期","四","。"]', '星期', 'Wochentag', 5, 'Lektion 5'),

    ('这个月有多少天？', 'Zhège yuè yǒu duōshao tiān?', 'Wie viele Tage hat dieser Monat?',
     '["这","个","月","有","多少","天","？"]', '多少', 'wie viele', 5, 'Lektion 5'),

    ('一年有十二个月。', 'Yì nián yǒu shí''èr ge yuè.', 'Ein Jahr hat zwölf Monate.',
     '["一","年","有","十二","个","月","。"]', '年', 'Jahr', 5, 'Lektion 5'),

    -- ============ Höflichkeit & Geburtstag ============
    ('祝你生日快乐！', 'Zhù nǐ shēngrì kuàilè!', 'Alles Gute zum Geburtstag!',
     '["祝","你","生日","快乐","！"]', '祝', 'wünschen', 5, 'Lektion 5'),

    ('谢谢你！', 'Xièxie nǐ!', 'Danke!',
     '["谢谢","你","！"]', '谢谢', 'danke', 5, 'Lektion 5'),

    ('不客气！', 'Bú kèqi!', 'Bitte sehr!',
     '["不客气","！"]', '不客气', 'bitte sehr (Antwort auf Danke)', 5, 'Lektion 5'),

    ('这是你的生日礼物。', 'Zhè shì nǐ de shēngrì lǐwù.', 'Das ist dein Geburtstagsgeschenk.',
     '["这","是","你","的","生日","礼物","。"]', '礼物', 'Geschenk', 5, 'Lektion 5'),

    ('这是一本英汉词典。', 'Zhè shì yì běn Yīng-Hàn cídiǎn.', 'Das ist ein Englisch-Chinesisch-Wörterbuch.',
     '["这","是","一","本","英汉","词典","。"]', '词典', 'Wörterbuch', 5, 'Lektion 5'),

    -- ============ 送 (schenken) ============
    ('哥哥送我一本英汉词典。', 'Gēge sòng wǒ yì běn Yīng-Hàn cídiǎn.', 'Mein älterer Bruder schenkt mir ein Englisch-Chinesisch-Wörterbuch.',
     '["哥哥","送","我","一","本","英汉","词典","。"]', '送', 'schenken', 5, 'Lektion 5'),

    ('妈妈送我一支笔。', 'Māma sòng wǒ yì zhī bǐ.', 'Mama schenkt mir einen Stift.',
     '["妈妈","送","我","一","支","笔","。"]', '送', 'schenken', 5, 'Lektion 5'),

    ('同学们都祝我生日快乐。', 'Tóngxuémen dōu zhù wǒ shēngrì kuàilè.', 'Alle Mitschüler wünschen mir alles Gute zum Geburtstag.',
     '["同学们","都","祝","我","生日","快乐","。"]', '祝', 'wünschen', 5, 'Lektion 5'),

    -- ============ 高兴 / 认识 ============
    ('我很高兴。', 'Wǒ hěn gāoxìng.', 'Ich bin sehr froh.',
     '["我","很","高兴","。"]', '高兴', 'fröhlich', 5, 'Lektion 5'),

    ('很高兴认识你！', 'Hěn gāoxìng rènshi nǐ!', 'Schön, dich kennenzulernen!',
     '["很","高兴","认识","你","！"]', '认识', 'kennenlernen', 5, 'Lektion 5'),

    ('我也很高兴认识你。', 'Wǒ yě hěn gāoxìng rènshi nǐ.', 'Schön, dich auch kennenzulernen.',
     '["我","也","很","高兴","认识","你","。"]', '也', 'auch', 5, 'Lektion 5'),

    ('你认识他吗？', 'Nǐ rènshi tā ma?', 'Kennst du ihn?',
     '["你","认识","他","吗","？"]', '认识', 'kennen', 5, 'Lektion 5'),

    ('我不认识她。', 'Wǒ bú rènshi tā.', 'Ich kenne sie nicht.',
     '["我","不","认识","她","。"]', '认识', 'kennen', 5, 'Lektion 5'),

    -- ============ 难 (review aus L4 mit L5-Kontext) ============
    ('汉语不难。', 'Hànyǔ bù nán.', 'Chinesisch ist nicht schwer.',
     '["汉语","不","难","。"]', '难', 'schwer', 5, 'Lektion 5');
  end if;
end $$;

-- =====================================================================
-- Verify (optional — manuell nach Run prüfen)
-- =====================================================================
-- select count(*) from public.characters where lesson = 'Lektion 5';  -- erwartet: 28 (15 + 13)
-- select count(*) from public.sentences where lesson = 'Lektion 5';   -- erwartet: 24
