# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-04 09:2x CEST).
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests, alle bestanden
  (2026-08-04).
- Letzter gepushter Stand auf `origin/main`: `d22d33c` (accept subject-kept/dropped
  Phrasierungen im translate quiz).
- Grant-Pattern für neue Supabase-Tabellen dokumentiert und im Bestand angewendet
  (`CLAUDE.md`, Referenz-Migration `supabase/grants-2026-05-28-api-default-change.sql`).

## prod ≠ live
- **Supabase-Backend nicht erreichbar — vermutlich der wichtigste Fund dieser Session.**
  `obpgcttudogwfobjwjgk.supabase.co` (aus `.env`, identisch mit der URL, die im
  aktuell gebauten `dist/assets/index-CgaQpF-B.js` verbaut ist, und mit der Referenz
  im JWT-Service-Key) liefert **NXDOMAIN** — geprüft über zwei unabhängige
  öffentliche Resolver (Cloudflare `1.1.1.1`, Google `8.8.8.8`), nicht nur lokal.
  `curl` auf `${VITE_SUPABASE_URL}/rest/v1/` schlägt reproduzierbar mit
  „Could not resolve host" fehl (3 Versuche, exit 6). Die Apex-Domain `supabase.co`
  selbst löst normal auf — das Problem ist spezifisch dieses Projekt-Ref.
  Das ist kein „Projekt pausiert" (das würde i.d.R. noch auflösen und einen
  503/„paused"-Response liefern) — es sieht nach **gelöschtem oder migriertem
  Projekt** aus. **Konsequenz, falls das stimmt: Login, Fortschritt speichern,
  Content-Laden und der Feedback-Knopf selbst funktionieren für echte Nutzer
  gerade nicht** — die Browser der Nutzer treffen auf dieselbe DNS-Auflösung.
  **Konnte deshalb in dieser Session nicht geprüft werden:** offenes
  Nutzer-Feedback (KPI-Kernzahl), `feedback`-Tabelle allgemein.
  → Braucht Ben: Supabase-Dashboard-Zugriff, um zu klären, ob das Projekt existiert.
- Ein Commit lokal, nicht auf `origin/main`: `053319f` (backfill subject-kept
  Varianten für zwei weitere Karten) — reine SQL-Migrationsdatei, kein Frontend-Code,
  aber Push = Deploy, also bewusst nicht gepusht ohne Ben.
- Uncommitted: `src/utils/sentenceQuiz.test.js` (+27 Zeilen, 3 neue Tests für
  Zählwort-Varianten, laufen grün gegen die bestehende `matchesAnySequence`-Logik —
  keine Code-Änderung nötig) und unstaged `supabase/sentence-zaehlwort-variants-2026-06-20.sql`
  (Policy-Migration von Ben, 2026-06-20: Zählwort optional bei Einzelobjekt-Sätzen).
  **Ob diese Migration bereits gegen die Produktions-DB gelaufen ist, ist unklar** —
  anders als die Vorgänger-Migration (`sentence-accepted-variants-2026-06-18.sql`,
  deren Commit-Message „Backfilled … in prod" explizit bestätigt), fehlt hier ein
  solcher Vermerk, und die DB ist gerade nicht erreichbar, um es zu prüfen.

## Aus dem globalen Check-in (2026-08-04)

- Das Supabase-Projekt `obpgcttudogwfobjwjgk.supabase.co` löst nicht mehr auf (NXDOMAIN bei Cloudflare und Google, gegengeprüft am 04.08. 10:0x; `supabase.co` selbst löst normal auf) → Login, Fortschritt und Feedback sind für echte Nutzer tot, obwohl die Seite 200 liefert. Nur Ben kommt ans Supabase-Dashboard. [Quelle: globaler Check-in 04.08.]
- Bens Woche ist voll (Mo+Di 10./11.08. Monos vor Ort; die zwei Gridbert-Termine am 10.08. sind am 04.08. zur Verschiebung angeboten) → dieser Punkt darf trotzdem nicht hinter das ruhige Projekt-Image rutschen; er ist der einzige mit direkt betroffenen Nutzern. [Quelle: Kalender 04.-11.08.]

## Offene Punkte (nächste Session)
- [ ] Supabase-Projekt-Status klären (Dashboard, nicht per curl lösbar) — existiert
      `obpgcttudogwfobjwjgk` noch? Falls ja: warum kein DNS? Falls nein: neues Projekt
      + `.env`/Vercel-Env aktualisieren + alle Migrationen neu einspielen.
- [ ] Nach Klärung: prüfen, ob `sentence-zaehlwort-variants-2026-06-20.sql` schon lief;
      falls nicht, einspielen (Grant-Check entfällt, nur bestehende Spalte).
- [ ] `053319f` pushen (oder bewusst verwerfen), sobald Supabase wieder erreichbar ist
      und der Stand geprüft werden kann.
- [ ] `sentenceQuiz.test.js`-Änderung committen — Tests sind grün und dokumentieren
      bewusst akzeptiertes Verhalten.
- [ ] Offenes Nutzer-Feedback nachholen, sobald Supabase wieder erreichbar ist
      (`check-feedback`-Skill).
- [ ] pi-lens `knip.json` reparieren — Parse schlägt fehl, „Unused Code" ist seit
      dieser Session blind.
- [ ] `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
      (Komplexität 42) sind die zwei größten Komplexitäts-Ausreißer laut
      `.pi-lens/metrics-history.json` — keine akute Störung, aber die mit Abstand
      am schwersten wartbaren Dateien im Bestand.

## Session-Log (letzte 3)
- **2026-08-04** — Erster globaler Check-in für dieses Projekt (bislang kein
  close-session-Profil). Health gemessen, Supabase-Ausfall entdeckt und mit zwei
  unabhängigen DNS-Resolvern verifiziert, Testsuite + Lint gegen den lokalen Stand
  gefahren, `docs/HANDOVER.md` erstmals angelegt.
- **2026-06-18** (`053319f`, `d22d33c`) — Zwei Runden Backfill für
  `accepted_variants` bei kontrastiven „不是 X，是 Y"-Sätzen; Grader akzeptierte
  die subjekt-erhaltende Umformulierung nicht.
- **2026-06-15 bis 2026-05-28** — Zählwort-Fix Familiengröße (口, `521b3fa`),
  explizite Data-API-Grants vor dem Supabase-Default-Change zum 30.10.2026
  (`5882cc0`), Vertiefen-Modus für schwere Wörter/Grammatik (`3a83c7f`).
