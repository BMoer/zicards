-- ZìCards: Schema + Seed Data (Lektion 1-3, vollständig)
-- 58 Zeichen total: L1=25, L2=16, L3=17
-- Run this in Supabase SQL Editor

-- 1. Tables
create table public.characters (
  id uuid default gen_random_uuid() primary key,
  hanzi text not null,
  word text,
  pinyin text not null,
  pinyin_word text,
  pinyin_input text not null,
  meaning text not null,
  radical text,
  week integer not null,
  lesson text,
  created_at timestamptz default now()
);

create index idx_characters_week on public.characters(week);

create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  character_id uuid references public.characters(id) on delete cascade not null,
  level integer default 0 check (level >= 0 and level <= 4),
  correct_streak integer default 0,
  incorrect_streak integer default 0,
  times_practiced integer default 0,
  last_practiced timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, character_id)
);

create index idx_user_progress_user on public.user_progress(user_id);
create index idx_user_progress_char on public.user_progress(character_id);
create index idx_user_progress_level on public.user_progress(user_id, level);

-- 2. RLS
alter table public.characters enable row level security;
create policy "Characters sind für alle lesbar"
  on public.characters for select using (true);

alter table public.user_progress enable row level security;
create policy "User sieht eigenen Fortschritt"
  on public.user_progress for select using (auth.uid() = user_id);
create policy "User erstellt eigenen Fortschritt"
  on public.user_progress for insert with check (auth.uid() = user_id);
create policy "User aktualisiert eigenen Fortschritt"
  on public.user_progress for update using (auth.uid() = user_id);

-- 3. Trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_progress_updated_at
  before update on public.user_progress
  for each row execute function update_updated_at();

-- 4. Seed: Lektion 1 (25 Zeichen)
insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
values
  ('叫', null, 'jiào', null, 'jiao4', 'heißen', '口', 1, 'Lektion 1'),
  ('我', null, 'wǒ', null, 'wo3', 'ich, mich, mir', null, 1, 'Lektion 1'),
  ('是', null, 'shì', null, 'shi4', 'sein', '日', 1, 'Lektion 1'),
  ('人', null, 'rén', null, 'ren2', 'Person, Mensch', null, 1, 'Lektion 1'),
  ('不', null, 'bù', null, 'bu4', 'nicht', null, 1, 'Lektion 1'),
  ('你', null, 'nǐ', null, 'ni3', 'du, dich, dir', '亻', 1, 'Lektion 1'),
  ('好', null, 'hǎo', null, 'hao3', 'gut', '女', 1, 'Lektion 1'),
  ('吗', null, 'ma', null, 'ma0', 'Fragepartikel', '口', 1, 'Lektion 1'),
  ('他', null, 'tā', null, 'ta1', 'er, ihn, ihm', '亻', 1, 'Lektion 1'),
  ('她', null, 'tā', null, 'ta1', 'sie (weiblich)', '女', 1, 'Lektion 1'),
  ('师', null, 'shī', null, 'shi1', 'Lehrer, Meister', null, 1, 'Lektion 1'),
  ('您', null, 'nín', null, 'nin2', 'Sie (Höflichkeitsform)', '心', 1, 'Lektion 1'),
  ('学', null, 'xué', null, 'xue2', 'lernen, studieren', null, 1, 'Lektion 1'),
  ('生', null, 'shēng', null, 'sheng1', 'Person, Leben', null, 1, 'Lektion 1'),
  ('也', null, 'yě', null, 'ye3', 'auch', null, 1, 'Lektion 1'),
  ('加', null, 'jiā', null, 'jia1', 'hinzufügen, addieren', null, 1, 'Lektion 1'),
  ('拿', null, 'ná', null, 'na2', 'nehmen', null, 1, 'Lektion 1'),
  ('大', null, 'dà', null, 'da4', 'groß', null, 1, 'Lektion 1'),
  ('们', null, 'men', null, 'men0', 'Pluralpartikel', '亻', 1, 'Lektion 1'),
  ('老', null, 'lǎo', null, 'lao3', 'alt', null, 1, 'Lektion 1'),
  ('中', null, 'zhōng', null, 'zhong1', 'Mitte', null, 1, 'Lektion 1'),
  ('国', null, 'guó', null, 'guo2', 'Staat, Land', '口', 1, 'Lektion 1'),
  ('日', null, 'rì', null, 'ri4', 'Sonne, Tag', null, 1, 'Lektion 1'),
  ('本', null, 'běn', null, 'ben3', 'Wurzel, Ursprung', null, 1, 'Lektion 1'),
  ('法', null, 'fǎ', null, 'fa3', 'Gesetz, Recht', '氵', 1, 'Lektion 1');

-- 5. Seed: Lektion 2 (16 Zeichen)
insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
values
  ('本', null, 'běn', null, 'ben3', 'Zählwort für Bücher/Druckerzeugnisse', '木', 2, 'Lektion 2'),
  ('张', null, 'zhāng', null, 'zhang1', 'Zählwort für flache Dinge', '弓', 2, 'Lektion 2'),
  ('没', null, 'méi', null, 'mei2', 'nicht (verneint haben)', '氵', 2, 'Lektion 2'),
  ('有', null, 'yǒu', null, 'you3', 'haben', null, 2, 'Lektion 2'),
  ('两', null, 'liǎng', null, 'liang3', 'zwei (vor Zählwörtern)', null, 2, 'Lektion 2'),
  ('支', null, 'zhī', null, 'zhi1', 'Zählwort für stabförmige Dinge', null, 2, 'Lektion 2'),
  ('个', null, 'gè', null, 'ge4', 'allgemeines Zählwort', null, 2, 'Lektion 2'),
  ('这', null, 'zhè', null, 'zhe4', 'dieses, diese, dieser', '辶', 2, 'Lektion 2'),
  ('的', null, 'de', null, 'de0', 'Possessivpartikel (mein, dein)', '白', 2, 'Lektion 2'),
  ('书', null, 'shū', null, 'shu1', 'Buch', null, 2, 'Lektion 2'),
  ('词', null, 'cí', null, 'ci2', 'Wort', '讠', 2, 'Lektion 2'),
  ('典', null, 'diǎn', null, 'dian3', 'Nachschlagewerk', null, 2, 'Lektion 2'),
  ('地', null, 'dì', null, 'di4', 'Erde, Boden', '土', 2, 'Lektion 2'),
  ('图', null, 'tú', null, 'tu2', 'Bild, Karte', '口', 2, 'Lektion 2'),
  ('子', null, 'zǐ', null, 'zi3', 'Substantiv-Suffix', null, 2, 'Lektion 2'),
  ('笔', null, 'bǐ', null, 'bi3', 'Stift', '竹', 2, 'Lektion 2');

-- 6. Seed: Lektion 3 (17 Zeichen)
insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
values
  ('妈', '妈妈', 'mā', 'māma', 'ma1', 'Mutter', '女', 3, 'Lektion 3'),
  ('姐', '姐姐', 'jiě', 'jiějie', 'jie3', 'ältere Schwester', '女', 3, 'Lektion 3'),
  ('妹', '妹妹', 'mèi', 'mèimei', 'mei4', 'jüngere Schwester', '女', 3, 'Lektion 3'),
  ('哥', '哥哥', 'gē', 'gēge', 'ge1', 'älterer Bruder', null, 3, 'Lektion 3'),
  ('弟', '弟弟', 'dì', 'dìdi', 'di4', 'jüngerer Bruder', null, 3, 'Lektion 3'),
  ('和', null, 'hé', null, 'he2', 'und', null, 3, 'Lektion 3'),
  ('全', null, 'quán', null, 'quan2', 'ganz', null, 3, 'Lektion 3'),
  ('爸', '爸爸', 'bà', 'bàba', 'ba4', 'Vater', '父', 3, 'Lektion 3'),
  ('家', null, 'jiā', null, 'jia1', 'Familie', '宀', 3, 'Lektion 3'),
  ('几', null, 'jǐ', null, 'ji3', 'wie viele (unter 10)', null, 3, 'Lektion 3'),
  ('照', null, 'zhào', null, 'zhao4', 'scheinen, fotografieren', '灬', 3, 'Lektion 3'),
  ('片', null, 'piàn', null, 'pian4', 'Scheibe, Schnitt', null, 3, 'Lektion 3'),
  ('做', null, 'zuò', null, 'zuo4', 'machen, tun', '亻', 3, 'Lektion 3'),
  ('工', '工作', 'gōng', 'gōngzuò', 'gong1', 'Handwerk; in 工作: arbeiten', null, 3, 'Lektion 3'),
  ('作', '工作', 'zuò', 'gōngzuò', 'zuo4', 'machen, schaffen; in 工作: arbeiten', '亻', 3, 'Lektion 3'),
  ('大', '大夫', 'dài', 'dàifu', 'dai4', 'groß; in 大夫: Arzt', null, 3, 'Lektion 3'),
  ('夫', '大夫', 'fu', 'dàifu', 'fu0', 'Mann; in 大夫: Arzt', null, 3, 'Lektion 3');
