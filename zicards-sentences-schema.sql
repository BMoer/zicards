-- ZìCards: Sentences Schema + Seed Data (Lektion 1-3)
-- Run this in Supabase SQL Editor AFTER the main schema

-- 1. Sentences table
create table public.sentences (
  id uuid default gen_random_uuid() primary key,
  chinese text not null,           -- Full sentence in Chinese: 你好吗？
  pinyin text not null,            -- Full pinyin: Nǐ hǎo ma?
  german text not null,            -- German translation: Wie geht es dir?
  words jsonb not null,            -- Ordered word segments: ["你","好","吗","？"]
  gap_word text,                   -- Word to blank out for fill-in: 好
  gap_hint text,                   -- Hint for the gap: (gut)
  week integer not null,
  lesson text,
  created_at timestamptz default now()
);

create index idx_sentences_week on public.sentences(week);

-- 2. Sentence progress (per user per sentence)
create table public.sentence_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sentence_id uuid references public.sentences(id) on delete cascade not null,
  level integer default 0 check (level >= 0 and level <= 3),
  correct_streak integer default 0,
  incorrect_streak integer default 0,
  times_practiced integer default 0,
  last_practiced timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, sentence_id)
);

create index idx_sentence_progress_user on public.sentence_progress(user_id);
create index idx_sentence_progress_level on public.sentence_progress(user_id, level);

-- 3. RLS
alter table public.sentences enable row level security;
create policy "Sentences sind für alle lesbar"
  on public.sentences for select using (true);

alter table public.sentence_progress enable row level security;
create policy "User sieht eigenen Satz-Fortschritt"
  on public.sentence_progress for select using (auth.uid() = user_id);
create policy "User erstellt eigenen Satz-Fortschritt"
  on public.sentence_progress for insert with check (auth.uid() = user_id);
create policy "User aktualisiert eigenen Satz-Fortschritt"
  on public.sentence_progress for update using (auth.uid() = user_id);

create trigger sentence_progress_updated_at
  before update on public.sentence_progress
  for each row execute function update_updated_at();

-- 4. Seed: Lektion 1 Sätze
insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson)
values
  ('你好！', 'Nǐ hǎo!', 'Hallo!',
   '["你","好","！"]', '好', 'gut', 1, 'Lektion 1'),

  ('你好吗？', 'Nǐ hǎo ma?', 'Wie geht es dir?',
   '["你","好","吗","？"]', '吗', 'Fragepartikel', 1, 'Lektion 1'),

  ('我很好。', 'Wǒ hěn hǎo.', 'Mir geht es gut.',
   '["我","很","好","。"]', '很', 'sehr', 1, 'Lektion 1'),

  ('你叫什么？', 'Nǐ jiào shénme?', 'Wie heißt du?',
   '["你","叫","什么","？"]', '叫', 'heißen', 1, 'Lektion 1'),

  ('我叫李明。', 'Wǒ jiào Lǐ Míng.', 'Ich heiße Li Ming.',
   '["我","叫","李明","。"]', '叫', 'heißen', 1, 'Lektion 1'),

  ('他是老师。', 'Tā shì lǎoshī.', 'Er ist Lehrer.',
   '["他","是","老师","。"]', '是', 'sein', 1, 'Lektion 1'),

  ('她也是学生。', 'Tā yě shì xuéshēng.', 'Sie ist auch Studentin.',
   '["她","也","是","学生","。"]', '也', 'auch', 1, 'Lektion 1'),

  ('你是中国人吗？', 'Nǐ shì Zhōngguó rén ma?', 'Bist du Chinese/Chinesin?',
   '["你","是","中国","人","吗","？"]', '中国', 'China', 1, 'Lektion 1'),

  ('我不是日本人。', 'Wǒ bù shì Rìběn rén.', 'Ich bin kein Japaner / keine Japanerin.',
   '["我","不","是","日本","人","。"]', '不', 'nicht', 1, 'Lektion 1'),

  ('他是法国人。', 'Tā shì Fǎguó rén.', 'Er ist Franzose.',
   '["他","是","法国","人","。"]', '法国', 'Frankreich', 1, 'Lektion 1'),

  ('您好！', 'Nín hǎo!', 'Guten Tag! (höflich)',
   '["您","好","！"]', '您', 'Sie (höflich)', 1, 'Lektion 1'),

  ('他们是学生。', 'Tāmen shì xuéshēng.', 'Sie sind Studenten.',
   '["他们","是","学生","。"]', '他们', 'sie (Plural)', 1, 'Lektion 1');

-- 5. Seed: Lektion 2 Sätze
insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson)
values
  ('这是我的书。', 'Zhè shì wǒ de shū.', 'Das ist mein Buch.',
   '["这","是","我","的","书","。"]', '的', 'Possessivpartikel', 2, 'Lektion 2'),

  ('你有词典吗？', 'Nǐ yǒu cídiǎn ma?', 'Hast du ein Wörterbuch?',
   '["你","有","词典","吗","？"]', '有', 'haben', 2, 'Lektion 2'),

  ('我没有地图。', 'Wǒ méi yǒu dìtú.', 'Ich habe keine Landkarte.',
   '["我","没","有","地图","。"]', '没', 'nicht (haben)', 2, 'Lektion 2'),

  ('我有两本书。', 'Wǒ yǒu liǎng běn shū.', 'Ich habe zwei Bücher.',
   '["我","有","两","本","书","。"]', '两', 'zwei', 2, 'Lektion 2'),

  ('这是什么？', 'Zhè shì shénme?', 'Was ist das?',
   '["这","是","什么","？"]', '什么', 'was', 2, 'Lektion 2'),

  ('他有一支笔。', 'Tā yǒu yì zhī bǐ.', 'Er hat einen Stift.',
   '["他","有","一","支","笔","。"]', '笔', 'Stift', 2, 'Lektion 2'),

  ('你有几本书？', 'Nǐ yǒu jǐ běn shū?', 'Wie viele Bücher hast du?',
   '["你","有","几","本","书","？"]', '几', 'wie viele', 2, 'Lektion 2'),

  ('我有三张地图。', 'Wǒ yǒu sān zhāng dìtú.', 'Ich habe drei Landkarten.',
   '["我","有","三","张","地图","。"]', '张', 'ZW für flache Dinge', 2, 'Lektion 2'),

  ('这是他的词典。', 'Zhè shì tā de cídiǎn.', 'Das ist sein Wörterbuch.',
   '["这","是","他","的","词典","。"]', '词典', 'Wörterbuch', 2, 'Lektion 2'),

  ('我没有笔。', 'Wǒ méi yǒu bǐ.', 'Ich habe keinen Stift.',
   '["我","没","有","笔","。"]', '没', 'nicht (haben)', 2, 'Lektion 2');

-- 6. Seed: Lektion 3 Sätze
insert into public.sentences (chinese, pinyin, german, words, gap_word, gap_hint, week, lesson)
values
  ('你家有几个人？', 'Nǐ jiā yǒu jǐ gè rén?', 'Wie viele Personen hat deine Familie?',
   '["你","家","有","几","个","人","？"]', '家', 'Familie', 3, 'Lektion 3'),

  ('我家有五个人。', 'Wǒ jiā yǒu wǔ gè rén.', 'Meine Familie hat fünf Personen.',
   '["我","家","有","五","个","人","。"]', '五', 'fünf', 3, 'Lektion 3'),

  ('我有一个哥哥。', 'Wǒ yǒu yí gè gēge.', 'Ich habe einen älteren Bruder.',
   '["我","有","一","个","哥哥","。"]', '哥哥', 'älterer Bruder', 3, 'Lektion 3'),

  ('我没有弟弟。', 'Wǒ méi yǒu dìdi.', 'Ich habe keinen jüngeren Bruder.',
   '["我","没","有","弟弟","。"]', '弟弟', 'jüngerer Bruder', 3, 'Lektion 3'),

  ('她姐姐是大夫。', 'Tā jiějie shì dàifu.', 'Ihre ältere Schwester ist Ärztin.',
   '["她","姐姐","是","大夫","。"]', '大夫', 'Arzt', 3, 'Lektion 3'),

  ('你妈妈做什么工作？', 'Nǐ māma zuò shénme gōngzuò?', 'Was arbeitet deine Mutter?',
   '["你","妈妈","做","什么","工作","？"]', '工作', 'Arbeit', 3, 'Lektion 3'),

  ('我爸爸是老师。', 'Wǒ bàba shì lǎoshī.', 'Mein Vater ist Lehrer.',
   '["我","爸爸","是","老师","。"]', '爸爸', 'Vater', 3, 'Lektion 3'),

  ('这是我们全家的照片。', 'Zhè shì wǒmen quán jiā de zhàopiàn.', 'Das ist ein Foto unserer ganzen Familie.',
   '["这","是","我们","全","家","的","照片","。"]', '照片', 'Foto', 3, 'Lektion 3'),

  ('我妹妹和我弟弟都是学生。', 'Wǒ mèimei hé wǒ dìdi dōu shì xuéshēng.', 'Meine jüngere Schwester und mein jüngerer Bruder sind beide Studenten.',
   '["我","妹妹","和","我","弟弟","都","是","学生","。"]', '和', 'und', 3, 'Lektion 3'),

  ('他哥哥做什么工作？', 'Tā gēge zuò shénme gōngzuò?', 'Was arbeitet sein älterer Bruder?',
   '["他","哥哥","做","什么","工作","？"]', '做', 'machen/tun', 3, 'Lektion 3');
