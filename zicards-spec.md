# ZìCards - Vollständige Projektspezifikation

## Übersicht

ZìCards ist eine Lern-App für chinesische Schriftzeichen (Hànzì). Multi-User Web-App mit adaptivem Stufensystem pro Zeichen pro User. Gebaut für einen Chinesisch-Kurs am Konfuzius-Institut der Uni Wien.

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend/Auth/DB:** Supabase (Postgres + Auth + RLS)
- **Hosting:** Vercel
- **Repo:** GitHub

## Supabase Config

```
VITE_SUPABASE_URL=https://obpgcttudogwfobjwjgk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_C4V2Wp1Dm4T-3F0_JMkxGA_exuBoQ0t
```

---

## 1. Supabase Schema (als erstes ausführen im SQL Editor)

```sql
-- Characters table (zentral, alle User sehen dieselben)
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

-- User progress (pro User pro Zeichen)
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

-- RLS
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

-- Auto-update trigger
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

-- Seed data: Lektion 3
insert into public.characters (hanzi, word, pinyin, pinyin_word, pinyin_input, meaning, radical, week, lesson)
values
  ('妈', '妈妈', 'mā', 'māma', 'ma1', 'Mutter', '女', 3, 'Lektion 3'),
  ('姐', '姐姐', 'jiě', 'jiějie', 'jie3', 'ältere Schwester', '女', 3, 'Lektion 3'),
  ('妹', '妹妹', 'mèi', 'mèimei', 'mei4', 'jüngere Schwester', '女', 3, 'Lektion 3'),
  ('哥', '哥哥', 'gē', 'gēge', 'ge1', 'älterer Bruder', null, 3, 'Lektion 3'),
  ('弟', '弟弟', 'dì', 'dìdi', 'di4', 'jüngerer Bruder', null, 3, 'Lektion 3');
```

---

## 2. Projektstruktur

```
zicards/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCharacters.js
│   │   └── useProgress.js
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── AuthForm.jsx
│   │   ├── Dashboard.jsx
│   │   ├── WeekView.jsx
│   │   ├── LearningSession.jsx
│   │   ├── QuizCard.jsx
│   │   ├── SessionResult.jsx
│   │   └── ProgressBar.jsx
│   └── utils/
│       ├── quiz.js
│       └── pinyin.js
```

---

## 3. Datenmodell

### Characters (zentral, read-only für User)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| hanzi | text | Einzelzeichen: 妈 |
| word | text | Wortform: 妈妈 |
| pinyin | text | Pinyin mit Tonzeichen: mā (Display) |
| pinyin_word | text | Pinyin der Wortform: māma |
| pinyin_input | text | Pinyin mit Tonzahl: ma1 (User-Input) |
| meaning | text | Deutsche Bedeutung: Mutter |
| radical | text | Radikal (optional): 女 |
| week | integer | Kurswoche |
| lesson | text | Lektionsname |

### User Progress (pro User pro Zeichen)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| user_id | uuid | FK zu auth.users |
| character_id | uuid | FK zu characters |
| level | 0-4 | Aktuelle Stufe |
| correct_streak | int | Richtig in Folge (Reset bei Fehler) |
| incorrect_streak | int | Falsch in Folge (Reset bei Richtig) |
| times_practiced | int | Gesamtanzahl Übungen |
| last_practiced | timestamptz | Letzte Übung |

---

## 4. Stufensystem (Kernlogik)

```
Stufe 0: Lernkarte - Hànzì + Pinyin + Bedeutung anzeigen (kein Quiz)
Stufe 1: Hànzì zeigen → Bedeutung wählen (Multiple Choice, 4 Optionen)
Stufe 2: Hànzì zeigen → Pinyin + Bedeutung eintippen (Freitext)
Stufe 3: Bedeutung zeigen → Hànzì wählen (Multiple Choice, 4 Optionen)
Stufe 4: Reserviert für Zeichnen (nicht im MVP)
```

### Aufstiegsregeln:
- **Aufstieg:** 10x richtig in Folge → level + 1, correct_streak reset auf 0
- **Abstieg:** 2x falsch in Folge → level - 1 (minimum 1, nie zurück auf 0), incorrect_streak reset auf 0
- Bei richtig: correct_streak += 1, incorrect_streak = 0
- Bei falsch: incorrect_streak += 1, correct_streak = 0
- Stufe 0 → Stufe 1 passiert automatisch nachdem der User die Lernkarte gesehen hat

---

## 5. Session-Logik

### Zeichenauswahl (10-15 Fragen pro Session):
1. Alle Zeichen des Users laden mit ihrem Progress
2. Zeichen ohne Progress-Eintrag = Stufe 0 (neu)
3. Sortierung: niedrigstes Level zuerst, bei gleichem Level ältere Wochen zuerst, bei gleichem Level + Woche: längste Zeit seit last_practiced
4. Stufe-0-Zeichen: Lernkarte zeigen, danach sofort auf Stufe 1 setzen
5. Session-Mix: maximal 5 neue Zeichen (Stufe 0) pro Session, Rest aus bekannten Zeichen

### Multiple-Choice-Generierung (Stufe 1 + 3):
- 1 richtige Antwort + 3 falsche aus dem gleichen Wochenpool
- Falls weniger als 3 andere Zeichen in der Woche: aus anderen Wochen auffüllen
- Reihenfolge randomisieren

### Freitext-Prüfung (Stufe 2):
- Pinyin: Tonzahl-Format akzeptieren (ma1, jie3, mei4)
- Case-insensitive
- Bedeutung: exakter Match oder enthält den korrekten Term (fuzzy genug für "Mutter" vs "die Mutter")
- Beide müssen stimmen für "richtig"

---

## 6. Screens

### 6.1 AuthForm
- Email + Passwort Login/Register
- Toggle zwischen Login und Registrierung
- Supabase Auth verwenden
- Nach Login → Dashboard

### 6.2 Dashboard
- Header: "字Cards" + Logout-Button
- Liste aller Wochen (aus characters gruppiert nach week)
- Pro Woche: Wochennummer, Lektionsname, Fortschrittsbalken
- Fortschrittsbalken: Anteil der Zeichen auf Stufe 2+ (von allen Zeichen der Woche)
- Button "Lernen starten" (startet Session über ALLE Wochen, gewichtet nach Bedarf)
- Klick auf Woche → WeekView

### 6.3 WeekView
- Alle Zeichen der Woche als Karten
- Pro Karte: Hànzì (groß), Pinyin, Wortform, Bedeutung, aktuelles Level als Badge
- Zurück-Button zum Dashboard
- Button "Diese Woche üben" (Session nur mit Zeichen dieser Woche)

### 6.4 LearningSession
- Fortschrittsanzeige oben (Frage X von Y)
- QuizCard je nach Stufe des aktuellen Zeichens
- Nach Antwort: Richtig/Falsch-Feedback + das Zeichen nochmal komplett anzeigen (Hànzì, Pinyin, Bedeutung)
- "Weiter"-Button zur nächsten Frage
- Am Ende → SessionResult

### 6.5 QuizCard (Stufe 1): Hànzì → Bedeutung MC
- Hànzì groß zentriert anzeigen
- 4 Buttons mit deutschen Bedeutungen
- Richtig = grün highlighten, falsch = rot + richtige grün

### 6.6 QuizCard (Stufe 2): Hànzì → Pinyin + Bedeutung Freitext
- Hànzì groß zentriert anzeigen
- Zwei Textfelder: Pinyin (Placeholder: "z.B. ma1") und Bedeutung
- Submit-Button
- Feedback: was war richtig, was war falsch, korrekte Antwort anzeigen

### 6.7 QuizCard (Stufe 3): Bedeutung → Hànzì MC
- Deutsche Bedeutung groß zentriert anzeigen
- 4 Buttons mit Hànzì
- Gleiche Feedback-Logik wie Stufe 1

### 6.8 SessionResult
- Zusammenfassung: X von Y richtig
- Liste: welche Zeichen aufgestiegen, welche abgestiegen
- "Nochmal"-Button + "Zurück zum Dashboard"-Button

---

## 7. Design

### Ästhetik
- Clean, mobile-first, respektiert die chinesische Typografie
- Hànzì-Anzeige: großer Font (min 48px), gut lesbarer Serif-Font für chinesische Zeichen
- Nutze `Noto Serif SC` (Google Fonts) für Hànzì-Anzeige
- Nutze `Inter` oder System-Font für UI-Elemente
- Farbpalette: Warmweiß-Hintergrund (#FAFAF7), Tinte-Schwarz (#1A1A1A), Akzent Terracotta (#C4553A) für richtige Antworten / Highlights, Sage-Grün (#5A7A60) für Fortschritt
- Cards mit subtiler Border, kein Drop-Shadow
- Mobile-first: funktioniert primär am Handy (Kurs-Teilnehmer lernen unterwegs)

### Fonts laden
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
```

### Tailwind erweitern
```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        paper: '#FAFAF7',
        terracotta: '#C4553A',
        sage: '#5A7A60',
      },
      fontFamily: {
        hanzi: ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
}
```

---

## 8. Hooks (Supabase-Logik)

### useAuth.js
```js
// Handles: signUp, signIn, signOut, session state
// Uses supabase.auth.onAuthStateChange for reactive session
// Returns: { user, loading, signIn, signUp, signOut }
```

### useCharacters.js
```js
// Fetches all characters, grouped by week
// Returns: { characters, weeks, loading }
// weeks = [{ week: 3, lesson: 'Lektion 3', characters: [...] }]
```

### useProgress.js
```js
// Fetches + updates user_progress for current user
// getProgress(characterId) → progress record or null (= level 0)
// updateProgress(characterId, isCorrect) → handles streak logic + level changes
// getWeekProgress(weekNumber) → { total, mastered } for progress bar
// Returns: { progress, loading, updateProgress, getWeekProgress }
```

### updateProgress Logik (wichtig, exakt implementieren):
```js
async function updateProgress(characterId, isCorrect) {
  // 1. Fetch or create progress record
  let record = existing || { level: 1, correct_streak: 0, incorrect_streak: 0, times_practiced: 0 }
  
  // 2. Update streaks
  if (isCorrect) {
    record.correct_streak += 1
    record.incorrect_streak = 0
  } else {
    record.incorrect_streak += 1
    record.correct_streak = 0
  }
  
  // 3. Level changes
  if (record.correct_streak >= 10) {
    record.level = Math.min(record.level + 1, 3) // max 3 im MVP (4 = Zeichnen, nicht implementiert)
    record.correct_streak = 0
  }
  if (record.incorrect_streak >= 2) {
    record.level = Math.max(record.level - 1, 1) // minimum 1, nie zurück auf 0
    record.incorrect_streak = 0
  }
  
  // 4. Update metadata
  record.times_practiced += 1
  record.last_practiced = new Date().toISOString()
  
  // 5. Upsert to Supabase
  await supabase.from('user_progress').upsert({
    user_id: user.id,
    character_id: characterId,
    ...record
  }, { onConflict: 'user_id,character_id' })
}
```

---

## 9. Utils

### quiz.js
```js
// generateMCOptions(correctCharacter, allCharacters, field)
// - field: 'meaning' (Stufe 1) oder 'hanzi' (Stufe 3)
// - Returns: shuffled array of 4 options, one correct
// - Prefers characters from same week, fills from others if needed

// buildSession(characters, progressMap, weekFilter?)
// - Returns ordered array of { character, quizType }
// - quizType: 'learn' (Stufe 0), 'mc-meaning' (1), 'freetext' (2), 'mc-hanzi' (3)
// - Max 5 new characters per session
// - Total 10-15 questions
// - Prioritizes: lowest level first, oldest week, longest since practiced
```

### pinyin.js
```js
// normalizePinyin(input)
// - Converts "ma1" → "mā", "jie3" → "jiě" etc.
// - Used for display after user input

// comparePinyin(userInput, correct)
// - Case-insensitive
// - Accepts both "ma1" and "mā"
// - Returns boolean

// compareMeaning(userInput, correct)
// - Case-insensitive, trimmed
// - Returns true if userInput contains correct or correct contains userInput
// - Handles articles: "die Mutter" matches "Mutter"

// Tonzahl → Tonzeichen Mapping:
// a: ['ā','á','ǎ','à'], e: ['ē','é','ě','è'],
// i: ['ī','í','ǐ','ì'], o: ['ō','ó','ǒ','ò'],
// u: ['ū','ú','ǔ','ù'], ü: ['ǖ','ǘ','ǚ','ǜ']
// Regel: Ton geht auf den Hauptvokal (a > e > ou, sonst letzter Vokal)
```

---

## 10. Supabase Client Setup

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 11. Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.28.0",
    "@supabase/supabase-js": "^2.47.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 12. Routing

```
/           → Dashboard (protected, redirect to /login if not authed)
/login      → AuthForm
/week/:id   → WeekView
/learn      → LearningSession (all weeks)
/learn/:week → LearningSession (filtered to one week)
```

---

## 13. Nicht im MVP (Iteration 2)

- Stufe 4: Hànzì auf Canvas zeichnen (Stroke Recognition)
- Audio/TTS für Aussprache
- Leaderboard / Gruppenansicht
- Admin-UI zum Zeichen einpflegen (aktuell via SQL)
- Spaced Repetition Algorithmus (aktuell reicht Streak-basiert)
- PWA / Offline-Support
