# zicards — Handover

> **Richtigstellung 2026-08-05 (von Ben):** Das Abschalten der Supabase-Instanz war **kein Ausfall,
> sondern eine bewusste Sommerpause** — sie war so geplant und gegenüber den Nutzern im Zweifel auch
> kommuniziert. Alle Stellen weiter unten, die von „Ausfall", „nicht erreichbar" oder „tot" sprechen
> (Check-ins vom 04. und 05.08.), beschreiben die Messung korrekt, aber die Ursache falsch: gemessen
> wurde eine geplante Abschaltung, nicht ein Defekt. Seit 05.08. läuft die Instanz wieder, die Daten
> sind vollständig (172 Zeichen, 188 Sätze, 177 Mnemonics, 1.368 Fortschritts- und 975
> Satz-Fortschritts-Einträge, REST-API 3× HTTP 200). Eine Entwarnungsmail an die 12 Nutzer liegt als
> **Die Mail an die 12 Nutzer (Rueckkehr aus der Sommerpause, Betreff «zicards ist wieder offen»)
> ist am 05.08. verschickt.**


## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-05 09:2x CEST — erneut geprüft,
  unverändert zu 04.08.).
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests, alle bestanden
  (2026-08-05, erneut gelaufen). `npm run build` (vite) läuft sauber durch (441ms,
  nur eine Chunk-Size-Warnung >500kB, kein Fehler).
- Letzter gepushter Stand auf `origin/main`: `4cdd512` (checkin-Profil + erstes
  Handover). `053319f` (backfill subject-kept Varianten) ist entgegen dem Stand vom
  04.08. inzwischen ebenfalls auf `origin/main` — der offene Punkt „053319f pushen"
  ist damit erledigt, ohne dass diese Session gepusht hat.
- Grant-Pattern für neue Supabase-Tabellen dokumentiert und im Bestand angewendet
  (`CLAUDE.md`, Referenz-Migration `supabase/grants-2026-05-28-api-default-change.sql`).
- Neu committet (lokal, **nicht gepusht**, `5c79401`): 3 Tests in
  `src/utils/sentenceQuiz.test.js` für die Zählwort-Varianten (optional/eingefügt/
  weggelassen + Ablehnung des falschen Zählworts) — reine Testdokumentation, keine
  Implementierungsänderung, 167/167 grün. Schließt den Handover-Punkt vom 04.08.

## prod ≠ live
- **Supabase-Backend weiterhin nicht erreichbar — Status vom 04.08. unverändert, erneut
  gemessen am 05.08. 09:2x CEST.** `obpgcttudogwfobjwjgk.supabase.co` (aus `.env`)
  liefert weiterhin **NXDOMAIN** — heute erneut über zwei unabhängige Resolver
  bestätigt (`dig @1.1.1.1` und `dig @8.8.8.8` beide `status: NXDOMAIN`, AUTHORITY
  SECTION liefert nur die SOA von `supabase.co` selbst, kein A-Record). `curl` auf
  `${VITE_SUPABASE_URL}/rest/v1/` schlägt weiter mit „Could not resolve host" fehl
  (exit 6, HTTP 000). Die Apex-Domain `supabase.co` selbst löst normal auf
  (`76.76.21.21`) — das Problem bleibt spezifisch dieses Projekt-Ref, seit
  mindestens 04.08., jetzt seit ≥2 Tagen bestätigt.
  **Konsequenz unverändert: Login, Fortschritt speichern, Content-Laden und der
  Feedback-Knopf funktionieren für echte Nutzer weiterhin nicht** — die Seite selbst
  liefert weiter 200 (statische SPA), das Backend dahinter ist tot.
  **Weiterhin nicht prüfbar:** offenes Nutzer-Feedback (KPI-Kernzahl), `feedback`-
  Tabelle allgemein — `check-feedback`-Skill schlägt mit demselben DNS-Fehler fehl.
  → **Braucht weiterhin Ben:** Supabase-Dashboard-Zugriff, um zu klären, ob das
  Projekt existiert. Kein Agent kann das von hier aus lösen oder umgehen.
- ~~Ein Commit lokal, nicht auf `origin/main`: `053319f`~~ — erledigt, ist jetzt auf
  `origin/main` (siehe oben).
- ~~Uncommitted: `src/utils/sentenceQuiz.test.js`~~ — erledigt, lokal committet
  (`5c79401`, nicht gepusht).
- Weiterhin unstaged: `supabase/sentence-zaehlwort-variants-2026-06-20.sql`
  (Policy-Migration von Ben, 2026-06-20: Zählwort optional bei Einzelobjekt-Sätzen).
  **Ob diese Migration bereits gegen die Produktions-DB gelaufen ist, ist weiterhin
  unklar** — anders als die Vorgänger-Migration (`sentence-accepted-variants-2026-06-18.sql`,
  deren Commit-Message „Backfilled … in prod" explizit bestätigt), fehlt hier ein
  solcher Vermerk, und die DB ist weiterhin nicht erreichbar, um es zu prüfen. Blockiert
  auf denselben Supabase-Ausfall wie oben.

## Aus dem globalen Check-in (2026-08-04)

- Das Supabase-Projekt `obpgcttudogwfobjwjgk.supabase.co` löst nicht mehr auf (NXDOMAIN bei Cloudflare und Google, gegengeprüft am 04.08. 10:0x; `supabase.co` selbst löst normal auf) → Login, Fortschritt und Feedback sind für echte Nutzer tot, obwohl die Seite 200 liefert. Nur Ben kommt ans Supabase-Dashboard. [Quelle: globaler Check-in 04.08.]
- Bens Woche ist voll (Mo+Di 10./11.08. Monos vor Ort; die zwei Gridbert-Termine am 10.08. sind am 04.08. zur Verschiebung angeboten) → dieser Punkt darf trotzdem nicht hinter das ruhige Projekt-Image rutschen; er ist der einzige mit direkt betroffenen Nutzern. [Quelle: Kalender 04.-11.08.]

## Offene Punkte (nächste Session)
- [ ] **Supabase-Projekt-Status klären (Dashboard, nicht per curl lösbar)** — existiert
      `obpgcttudogwfobjwjgk` noch? Falls ja: warum kein DNS? Falls nein: neues Projekt
      + `.env`/Vercel-Env aktualisieren + alle Migrationen neu einspielen. **Seit ≥2
      Tagen bestätigt tot (04.08. + 05.08.), nur Ben kann das lösen.**
- [ ] Nach Klärung: prüfen, ob `sentence-zaehlwort-variants-2026-06-20.sql` schon lief;
      falls nicht, einspielen (Grant-Check entfällt, nur bestehende Spalte).
- [x] `053319f` pushen — bereits auf `origin/main` (verifiziert 05.08., `git log
      origin/main..HEAD` leer für diesen Commit; nicht durch diese Session gepusht).
- [x] `sentenceQuiz.test.js`-Änderung committen — erledigt 05.08. (`5c79401`, lokal,
      167/167 Tests grün, nicht gepusht).
- [ ] Offenes Nutzer-Feedback nachholen, sobald Supabase wieder erreichbar ist
      (`check-feedback`-Skill; erneut fehlgeschlagen 05.08., exit 6/HTTP 000).
- [ ] pi-lens `knip.json` reparieren — Parse schlägt weiterhin fehl (`success:false`,
      Cache-Stand 13.04., ~3,5 Monate alt). `npx knip` direkt läuft aber sauber durch
      und findet 9 Issues (u.a. `src/utils/mnemonics.legacy.js` als unused file) —
      das eigentliche Tool funktioniert, nur der pi-lens-Wrapper-Cache ist tot/veraltet.
- [ ] **pi-lens-Cache insgesamt veraltet** (`.pi-lens/metrics-history.json`,
      `jscpd.json`, `turn-end-findings-last.json` alle Stand 13./14.04., committet in
      git) — die Komplexitäts-Zahlen unten sind älter als mehrere Commits, die diese
      Dateien seither verändert haben. Nicht dringend, aber die nächste Session, die
      an einer der Dateien unten arbeitet, sollte die Zahlen neu erheben statt dem
      Cache blind trauen.
- [ ] `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
      (Komplexität 42) sind laut (veraltetem) `.pi-lens/metrics-history.json` die zwei
      größten Komplexitäts-Ausreißer — keine akute Störung, aber die mit Abstand am
      schwersten wartbaren Dateien im Bestand. `AuthForm.jsx` (MI 33, Komplexität 25)
      steht dort zusätzlich auf Trend „regressing".
- [ ] Lint hat 23 Fehler / 12 Warnungen (`npm run lint`, 05.08.) — u.a. mehrere
      `react-hooks/set-state-in-effect` in `useSettings.js`/ähnlichen Hooks und 6×
      `no-empty` in `src/utils/offlineCache.js`. Blockiert Build/Deploy nicht (Vite-
      Build läuft unabhängig sauber durch), aber bisher nicht im Handover erfasst —
      Umfang einschätzen, ob eigene Session wert.

## Session-Log (letzte 3)
- **2026-08-05** — Projekt-Check-in. Supabase-Ausfall erneut gemessen (weiterhin
  NXDOMAIN über beide Resolver, ≥2 Tage bestätigt) — Ursache des 🔴 vom 04.08. bleibt
  bestehen, keine Besserung, kein Agent kann das lösen. Testsuite (167/167) + Build
  erneut grün. `053319f` als bereits gepusht verifiziert (Punkt geschlossen).
  `sentenceQuiz.test.js` lokal committet (`5c79401`, 3 Tests, nicht gepusht).
  pi-lens-Cache als veraltet (Stand 13./14.04.) identifiziert, `knip` direkt lauffähig
  geprüft. Lint erstmals mit Zahl erfasst (23/12). HANDOVER.md nachgezogen.
- **2026-08-04** — Erster globaler Check-in für dieses Projekt (bislang kein
  close-session-Profil). Health gemessen, Supabase-Ausfall entdeckt und mit zwei
  unabhängigen DNS-Resolvern verifiziert, Testsuite + Lint gegen den lokalen Stand
  gefahren, `docs/HANDOVER.md` erstmals angelegt.
- **2026-06-18** (`053319f`, `d22d33c`) — Zwei Runden Backfill für
  `accepted_variants` bei kontrastiven „不是 X，是 Y"-Sätzen; Grader akzeptierte
  die subjekt-erhaltende Umformulierung nicht.
