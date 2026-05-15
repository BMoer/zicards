-- ZìCards: L4-Sätze 2026-05-15
-- Quelle: L4(1).pptx (46 Slides) + L4 mit allen Lösungen.pdf
-- Lektion 4 "你们班有多少学生？"
--
-- L4 hatte bisher 0 Sätze in der DB. Hier 27 neue Sätze für Klasse-,
-- Sprachen-, 都-Patterns, Nationalität, Freunde, Lehrtext-Auszüge.
--
-- Voraussetzung: 友 wurde zu src/data/commonCharacters.js hinzugefügt
-- (Audit zeigt 0 fehlende IME-Pool-Zeichen).
--
-- Idempotent via DO-Block-Guard. Re-Run: `delete from public.sentences
-- where lesson = 'Lektion 4';` vorab.

do $$
begin
  if exists (select 1 from public.sentences where lesson = 'Lektion 4') then
    raise notice 'L4 has existing sentences — skipping. Delete them first to re-seed.';
  else
    insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson) values

    -- ============ Klasse & Zahl ============
    ('你们班有多少学生？', 'Nǐmen bān yǒu duōshao xuésheng?', 'Wie viele Schüler hat eure Klasse?',
     '["你们","班","有","多少","学生","？"]', '多少', 'wie viele (≥10)', 4, 'Lektion 4'),

    ('我们班有二十二个学生。', 'Wǒmen bān yǒu èrshí''èr ge xuésheng.', 'Unsere Klasse hat 22 Schüler.',
     '["我们","班","有","二十二","个","学生","。"]', '班', 'Schulklasse', 4, 'Lektion 4'),

    ('这个班有多少个学生？', 'Zhège bān yǒu duōshao ge xuésheng?', 'Wie viele Schüler hat diese Klasse?',
     '["这","个","班","有","多少","个","学生","？"]', '多少', 'wie viele (≥10)', 4, 'Lektion 4'),

    ('我们班有十五个男生和七个女生。', 'Wǒmen bān yǒu shíwǔ ge nánshēng hé qī ge nǚshēng.', 'Unsere Klasse hat 15 Jungen und 7 Mädchen.',
     '["我们","班","有","十五","个","男生","和","七","个","女生","。"]', '男生', 'männlicher Schüler', 4, 'Lektion 4'),

    ('这是我们全班的照片。', 'Zhè shì wǒmen quán bān de zhàopiàn.', 'Das ist ein Foto unserer ganzen Klasse.',
     '["这","是","我们","全","班","的","照片","。"]', '全班', 'ganze Klasse', 4, 'Lektion 4'),

    -- ============ Sprachen lernen ============
    ('你们学习什么？', 'Nǐmen xuéxí shénme?', 'Was lernt ihr?',
     '["你们","学习","什么","？"]', '学习', 'lernen', 4, 'Lektion 4'),

    ('我们学习汉语。', 'Wǒmen xuéxí Hànyǔ.', 'Wir lernen Chinesisch.',
     '["我们","学习","汉语","。"]', '汉语', 'Chinesisch', 4, 'Lektion 4'),

    ('他们学习英语。', 'Tāmen xuéxí Yīngyǔ.', 'Sie lernen Englisch.',
     '["他们","学习","英语","。"]', '英语', 'Englisch', 4, 'Lektion 4'),

    ('我学习德语。', 'Wǒ xuéxí Déyǔ.', 'Ich lerne Deutsch.',
     '["我","学习","德语","。"]', '德语', 'Deutsch', 4, 'Lektion 4'),

    -- ============ 难 + 都 ============
    ('汉语难吗？', 'Hànyǔ nán ma?', 'Ist Chinesisch schwer?',
     '["汉语","难","吗","？"]', '难', 'schwer', 4, 'Lektion 4'),

    ('汉语不难。', 'Hànyǔ bù nán.', 'Chinesisch ist nicht schwer.',
     '["汉语","不","难","。"]', '难', 'schwer', 4, 'Lektion 4'),

    ('英语和汉语都难。', 'Yīngyǔ hé Hànyǔ dōu nán.', 'Englisch und Chinesisch sind beide schwer.',
     '["英语","和","汉语","都","难","。"]', '都', 'alle, beide', 4, 'Lektion 4'),

    ('英语和汉语都不难。', 'Yīngyǔ hé Hànyǔ dōu bù nán.', 'Englisch und Chinesisch sind beide nicht schwer.',
     '["英语","和","汉语","都","不","难","。"]', '都', 'alle, beide', 4, 'Lektion 4'),

    -- ============ 都/不都/都不 ============
    ('他们都是学生。', 'Tāmen dōu shì xuésheng.', 'Sie sind alle Schüler.',
     '["他们","都","是","学生","。"]', '都', 'alle', 4, 'Lektion 4'),

    ('他们不都是男生。', 'Tāmen bù dōu shì nánshēng.', 'Nicht alle von ihnen sind Jungen.',
     '["他们","不都","是","男生","。"]', '不都', 'nicht alle', 4, 'Lektion 4'),

    ('他们都不是女生。', 'Tāmen dōu bú shì nǚshēng.', 'Keiner von ihnen ist ein Mädchen.',
     '["他们","都不","是","女生","。"]', '都不', 'alle nicht', 4, 'Lektion 4'),

    -- ============ Nationalität ============
    ('你是哪国人？', 'Nǐ shì nǎ guó rén?', 'Aus welchem Land bist du?',
     '["你","是","哪","国","人","？"]', '哪', 'welche', 4, 'Lektion 4'),

    ('我们都是奥地利人。', 'Wǒmen dōu shì Àodìlì rén.', 'Wir sind alle Österreicher.',
     '["我们","都","是","奥地利","人","。"]', '都', 'alle', 4, 'Lektion 4'),

    -- ============ Freunde & Name ============
    ('你有几个外国朋友？', 'Nǐ yǒu jǐ ge wàiguó péngyou?', 'Wie viele ausländische Freunde hast du?',
     '["你","有","几","个","外国","朋友","？"]', '外国', 'Ausland', 4, 'Lektion 4'),

    ('我有一个中国朋友。', 'Wǒ yǒu yí ge Zhōngguó péngyou.', 'Ich habe einen chinesischen Freund.',
     '["我","有","一","个","中国","朋友","。"]', '朋友', 'Freund', 4, 'Lektion 4'),

    ('我没有中国朋友。', 'Wǒ méi yǒu Zhōngguó péngyou.', 'Ich habe keine chinesischen Freunde.',
     '["我","没","有","中国","朋友","。"]', '朋友', 'Freund', 4, 'Lektion 4'),

    ('我的好朋友是德国人。', 'Wǒ de hǎo péngyou shì Déguó rén.', 'Mein bester Freund ist Deutscher.',
     '["我","的","好","朋友","是","德国","人","。"]', '朋友', 'Freund', 4, 'Lektion 4'),

    ('你的好朋友是哪国人？', 'Nǐ de hǎo péngyou shì nǎ guó rén?', 'Aus welchem Land kommt dein bester Freund?',
     '["你","的","好","朋友","是","哪","国","人","？"]', '哪', 'welche', 4, 'Lektion 4'),

    ('你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'Wie heißt du? (formell)',
     '["你","叫","什么","名字","？"]', '名字', 'Name', 4, 'Lektion 4'),

    -- ============ Lehrtext-Auszüge ============
    ('请进！', 'Qǐng jìn!', 'Bitte herein!',
     '["请进","！"]', '请进', 'bitte hereinkommen', 4, 'Lektion 4'),

    ('这是我的外国朋友。', 'Zhè shì wǒ de wàiguó péngyou.', 'Das ist mein ausländischer Freund.',
     '["这","是","我","的","外国","朋友","。"]', '外国', 'Ausland', 4, 'Lektion 4'),

    ('我们都学习汉语。', 'Wǒmen dōu xuéxí Hànyǔ.', 'Wir lernen alle Chinesisch.',
     '["我们","都","学习","汉语","。"]', '都', 'alle', 4, 'Lektion 4');
  end if;
end $$;

-- =====================================================================
-- Verify: select count(*) from public.sentences where lesson='Lektion 4';
-- Erwartet: 27
