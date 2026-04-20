---
name: zicards-vocab-import
description: Fügt neue chinesische Zeichen (Hànzì) und Beispielsätze in die ZiCards Supabase-Datenbank ein. Verwenden wenn Ben ein Foto oder PPT-PDF aus dem Lehrbuch schickt und Zeichen/Sätze zu einer Lektion hinzufügen möchte. Extrahiert Inhalt, prüft ob bereits vorhanden, und fügt nur Neues ein.
---

# ZiCards Vocab Import

Workflow zum Einlesen von Vokabeln und Beispielsätzen aus Lehrbuch-Material (Fotos, PPT-PDFs) und Einfügen in die ZiCards-Datenbank.

## Datenstruktur

Tabelle `characters` in Supabase:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `hanzi` | text | Das chinesische Zeichen (Pflicht) |
| `word` | text\|null | Kompositum / Wortform, z.B. "妈妈" für 妈 |
| `pinyin` | text | Pinyin mit Akzenten, z.B. "nǐ" (Pflicht) |
| `pinyin_word` | text\|null | Pinyin des Kompositums, z.B. "māma" |
| `pinyin_input` | text | Pinyin mit Zahlen für Eingabe, z.B. "ni3" (Pflicht) |
| `meaning` | text | Deutsche Bedeutung (Pflicht) |
| `radical` | text\|null | Radikal/Schlüssel, z.B. "亻" |
| `week` | integer | Woche/Lektionsnummer (Pflicht) |
| `lesson` | text | Lektionsname, z.B. "Lektion 4" (Pflicht) |

**Ton-Zahlen für `pinyin_input`:** 1=ā, 2=á, 3=ǎ, 4=à, 0=neutral (z.B. "ma0")

**Bestehende Lektionen:** Lektion 1 (week=1), Lektion 2 (week=2), Lektion 3 (week=3)

## Workflow

### 1. Foto einlesen

Ben schickt ein Foto und nennt Lektion + Woche. Ich lese mit dem `Read`-Tool oder direkt als Bild-Attachment aus:
- Hànzì (einzelnes Zeichen)
- Ggf. Kompositum/Wort (mehrere Zeichen)
- Pīnyīn mit Tönen
- Deutsche Bedeutung
- Radikal wenn erkennbar

**Wichtig:** Immer die extrahierten Daten als Tabelle zur Bestätigung zeigen, bevor das Script läuft.

### 2. Duplikate prüfen & einfügen

```bash
cd /Users/benjaminm/Projekte/zicards
export $(cat .env | xargs)
node .pi/skills/zicards-vocab-import/scripts/import-chars.mjs "Lektion 4" 4 '[{"hanzi":"...","pinyin":"...","pinyin_input":"...","meaning":"...","radical":"..."}]'
```

Das Script:
- Lädt alle bestehenden `hanzi` aus der DB
- Überspringt Zeichen die bereits vorhanden sind (matched auf `hanzi`)
- Fügt nur neue Zeichen ein
- Gibt klares Feedback welche hinzugefügt / übersprungen wurden

### 3. Ergebnis melden

Ausgabe des Scripts zeigen: wie viele eingefügt, welche übersprungen.

## Beispiel-JSON

```json
[
  {"hanzi":"妈","word":"妈妈","pinyin":"mā","pinyin_word":"māma","pinyin_input":"ma1","meaning":"Mutter","radical":"女"},
  {"hanzi":"爸","word":"爸爸","pinyin":"bà","pinyin_word":"bàba","pinyin_input":"ba4","meaning":"Vater","radical":"父"}
]
```

## Hinweise

- `word` und `pinyin_word` nur setzen wenn das Zeichen typischerweise als Kompositum auftritt (z.B. 妈妈, 爸爸)
- `radical` aus dem Foto übernehmen wenn sichtbar, sonst weglassen
- Bei Unklarheiten im Foto (schlechte Qualität, unbekannte Zeichen) explizit nachfragen
- Die `.env` im Projektroot enthält `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`

---

## Sätze importieren

Tabelle `sentences`:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `chinese` | text | Vollständiger Satz in Hànzì inkl. Satzzeichen (Pflicht) |
| `pinyin` | text | Pinyin mit Akzenten, z.B. "Zhè shì wǒ de shū." (Pflicht) |
| `german` | text | Deutsche Übersetzung (Pflicht) |
| `words` | text[] | Tokenisierter Satz — Komposita (词典, 地图, 什么, 他们…) bleiben zusammen, Satzzeichen als eigener Token (Pflicht) |
| `gap_word` | text | Wort das im Fill-in-Blank-Modus ausgeblendet wird — muss in `words` enthalten sein (Pflicht) |
| `gap_hint` | text | Deutscher Hinweis für das Lückenwort (Pflicht) |
| `week` | integer | Lektionsnummer (Pflicht) |
| `lesson` | text | Lektionsname (Pflicht) |

### Workflow

1. **Sätze aus Quelle extrahieren** und als Tabelle zur Bestätigung zeigen (Chinesisch, Pinyin, Deutsch, gap_word).
2. **Namen entfernen** (马丁, 大卫, 安妮, 山本 etc.) — sofern nicht explizit gewünscht.
3. **Zeichen-Abdeckung prüfen:** Alle Zeichen in `chinese` müssen bereits in der `characters`-Tabelle existieren. Fehlende Zeichen entweder zuerst mit `import-chars.mjs` nachziehen oder Satz weglassen.
4. **Tonsandhi beachten:** 不 vor 4. Ton → bú (bú shì). 一 vor 4. Ton → yí (yí gè); sonst yì (yì zhī, yì běn, yì zhāng).
5. **Script ausführen:**

```bash
cd /Users/benjaminm/Projekte/zicards
export $(cat .env | xargs)
node .pi/skills/zicards-vocab-import/scripts/import-sentences.mjs "Lektion 2" 2 '[{"chinese":"你有本子吗？","pinyin":"Nǐ yǒu běnzi ma?","german":"Hast du ein Heft?","words":["你","有","本子","吗","？"],"gap_word":"本子","gap_hint":"Heft"}]'
```

Das Script:
- Validiert Pflichtfelder und prüft, dass `gap_word` im `words`-Array steht
- Überspringt Sätze die bereits vorhanden sind (matched auf `chinese`)
- Fügt nur Neues ein

### Beispiel-JSON

```json
[
  {
    "chinese": "这是他们的词典。",
    "pinyin": "Zhè shì tāmen de cídiǎn.",
    "german": "Das ist ihr Wörterbuch.",
    "words": ["这","是","他们","的","词典","。"],
    "gap_word": "的",
    "gap_hint": "Possessivpartikel"
  }
]
```

### gap_word-Wahl

Ziel: das grammatisch/lexikalisch interessanteste Element des Satzes ausblenden. Häufige Kandidaten:
- Neue Vokabel des Satzes (本子, 词典, 地图…)
- Grammatik-Partikel (的, 吗, 也, 不, 没)
- Zählwort (本, 支, 张, 个)
- Pronomen bei Plural/Höflichkeit (他们, 您)
