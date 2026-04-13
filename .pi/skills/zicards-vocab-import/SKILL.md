---
name: zicards-vocab-import
description: Fügt neue chinesische Zeichen (Hànzì) in die ZiCards Supabase-Datenbank ein. Verwenden wenn Ben ein Foto aus dem Lehrbuch schickt und Zeichen zu einer Lektion hinzufügen möchte. Extrahiert Zeichen aus Fotos, prüft ob sie bereits vorhanden sind, und fügt nur neue ein.
---

# ZiCards Vocab Import

Workflow zum Einlesen von Vokabeln aus Lehrbuch-Fotos und Einfügen in die ZiCards-Datenbank.

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
