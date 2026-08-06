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
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-06 08:2x CEST).
- **Supabase-Backend wieder erreichbar** — REST-API `${VITE_SUPABASE_URL}/rest/v1/`
  → 200 (curl, 2026-08-06). Login, Fortschritt speichern und der Feedback-Knopf
  funktionieren wieder für echte Nutzer. Löst den 🔴 vom 04./05.08. ab (Ursache war
  laut Ben eine geplante Sommerpause, siehe Richtigstellung oben).
- **Echte Nutzung seit der Rückkehr-Mail (05.08.) bestätigt, aber kleiner als der
  Mail-Rücklauf vermuten lässt:** von 13 registrierten Accounts hat genau **1**
  seit 05.08. eingeloggt (`last_sign_in_at` 2026-08-05T09:18:17Z), mit durchgehender
  Session-Aktivität 09:25–10:14 UTC in `user_progress`/`sentence_progress`. Die
  restlichen 12 Accounts haben ihren letzten Login vor dem 05.08. (nächstjüngster:
  21.06.). Zwei Dankesmails ⇒ mindestens ein zweiter Nutzer hat reagiert, aber
  (noch) nicht im Produkt gemessen — per E-Mail antworten zählt nicht als Login.
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests, alle bestanden
  (2026-08-06, erneut gelaufen, unverändert zu 05.08.). `npm run build` (vite) läuft
  sauber durch (368ms, nur die bekannte Chunk-Size-Warnung >500kB, kein Fehler).
- Lint unverändert: `npm run lint` → 23 Fehler / 12 Warnungen (2026-08-06, exakt
  wie 05.08. — keine Regression, aber auch keine Besserung).
- `git status`: sauber bis auf 1 unstaged Datei (siehe unten), kein unpushter
  Commit (`git log origin/main..HEAD` leer).
- Grant-Pattern für neue Supabase-Tabellen dokumentiert und im Bestand angewendet
  (`CLAUDE.md`, Referenz-Migration `supabase/grants-2026-05-28-api-default-change.sql`).

## prod ≠ live
- **Offenes Nutzer-Feedback: 0.** Geprüft direkt gegen die `feedback`-Tabelle
  (2026-08-06, jetzt wieder erreichbar) — `resolved_at IS NULL` liefert eine leere
  Liste. Letzter Feedback-Eintrag überhaupt: 2026-05-25 (resolved). Seit der
  Rückkehr am 05.08. ist noch kein neues Feedback eingegangen — bei nur 1 aktivem
  Nutzer seit gestern keine Überraschung, aber die KPI-Kernzahl ist jetzt wieder
  messbar statt blockiert.
- `supabase/sentence-zaehlwort-variants-2026-06-20.sql` weiterhin **unstaged/nicht
  committet** — aber jetzt geklärt: **die Migration lief bereits gegen die
  Produktions-DB.** Stichprobe verifiziert (2026-08-06): `我有一个本子。` hat in
  `sentences.accepted_variants` exakt den Wert, den das Skript setzt
  (`[["我","有","本子","。"]]`). Die Datei dokumentiert also einen bereits live
  angewendeten Stand, ist aber nicht ins Repo eingecheckt — reine Doku-Lücke, kein
  Datenrisiko. Fehlt: `git add` + Commit (bewusst nicht von dieser Session gemacht,
  siehe Offene Punkte).

## Aus dem globalen Check-in (2026-08-04)

- Das Supabase-Projekt `obpgcttudogwfobjwjgk.supabase.co` löst nicht mehr auf (NXDOMAIN bei Cloudflare und Google, gegengeprüft am 04.08. 10:0x; `supabase.co` selbst löst normal auf) → Login, Fortschritt und Feedback sind für echte Nutzer tot, obwohl die Seite 200 liefert. Nur Ben kommt ans Supabase-Dashboard. [Quelle: globaler Check-in 04.08.]
- Bens Woche ist voll (Mo+Di 10./11.08. Monos vor Ort; die zwei Gridbert-Termine am 10.08. sind am 04.08. zur Verschiebung angeboten) → dieser Punkt darf trotzdem nicht hinter das ruhige Projekt-Image rutschen; er ist der einzige mit direkt betroffenen Nutzern. [Quelle: Kalender 04.-11.08.]

## Offene Punkte (nächste Session)
- [x] Supabase-Projekt-Status klären — **von selbst gelöst**: seit 05.08. wieder
      erreichbar (200 auf REST-API, 2026-08-06 verifiziert), war laut Ben eine
      geplante Sommerpause, kein Defekt.
- [x] Prüfen, ob `sentence-zaehlwort-variants-2026-06-20.sql` schon lief — **ja**,
      Stichprobe gegen `sentences.accepted_variants` bestätigt (05.08.-Migration ist
      live). Offen bleibt nur der `git commit` der Datei — siehe unten.
- [ ] **`supabase/sentence-zaehlwort-variants-2026-06-20.sql` committen.** Datei ist
      bereits gegen prod gelaufen (verifiziert 06.08.), liegt aber unstaged im Repo.
      Reine Doku-Nachziehung (`git add` + Commit), kein fachlicher Entscheid — bewusst
      nicht automatisch committet, siehe Projektregel „nur auf Bens Wunsch committen".
- [x] Offenes Nutzer-Feedback nachholen, sobald Supabase wieder erreichbar ist —
      erledigt (06.08.): **0 offene Einträge**, letzter Feedback-Eintrag 25.05.
- [ ] **Nur 1 von 13 Accounts seit der Rückkehr-Mail (05.08.) aktiv eingeloggt.**
      Zwei Dankesmails kamen zurück, aber nur ein Login ist messbar. Kein akuter
      Fehler (die eine Session lief sauber durch), aber falls in den nächsten Tagen
      noch mehr Logins erwartet werden: beobachten, ob die anderen Mail-Antworter
      tatsächlich einsteigen oder nur höflich geantwortet haben.
- [ ] pi-lens `knip.json` reparieren — Parse schlägt weiterhin fehl (`success:false`,
      Cache-Stand 13.04., ~4 Monate alt). `npx knip` direkt läuft sauber durch und
      findet aktuell **5 unused files, 1 unused dep (`pg`), 8 unused exports**
      (06.08., neu gezählt — mehr als die 9 vom 05.08., weil diesmal alle drei
      Kategorien statt nur „files" gezählt wurden). Das Tool funktioniert, nur der
      pi-lens-Wrapper-Cache ist tot.
- [ ] **pi-lens-Cache insgesamt veraltet** (`.pi-lens/metrics-history.json`,
      `jscpd.json`, `turn-end-findings-last.json` alle Stand 13./14.04., committet in
      git) — die Komplexitäts-Zahlen unten sind älter als mehrere Commits seither.
      Ein Turn-End-Fund im Cache referenziert sogar eine nicht mehr existierende
      Datei (`AdminFeedback.jsx`, nie im Git-Verlauf) — Beleg dafür, dass der Cache
      Datenmüll enthält, nicht nur alt ist. Nicht dringend, aber neu erheben statt
      dem Cache trauen, sobald jemand an einer der Dateien unten arbeitet.
- [ ] `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
      (Komplexität 42) sind laut (veraltetem) `.pi-lens/metrics-history.json` die zwei
      größten Komplexitäts-Ausreißer — keine akute Störung, aber die mit Abstand am
      schwersten wartbaren Dateien im Bestand. `AuthForm.jsx` (MI 33, Komplexität 25)
      steht dort zusätzlich auf Trend „regressing". Zahlen sind ~4 Monate alt (s.o.).
- [ ] Lint weiterhin 23 Fehler / 12 Warnungen (`npm run lint`, 06.08., unverändert seit
      05.08.) — u.a. mehrere `react-hooks/set-state-in-effect` in
      `useSettings.js`/ähnlichen Hooks und 6× `no-empty` in `src/utils/offlineCache.js`.
      Blockiert Build/Deploy nicht, aber Umfang einschätzen, ob eigene Session wert.

## Session-Log (letzte 3)
- **2026-08-06** — Projekt-Check-in. Supabase-„Ausfall" ist vorbei: App + Supabase-
  REST-API beide 200. Echte Nutzung seit der Rückkehr-Mail geprüft statt angenommen:
  von 13 Accounts genau 1 seit 05.08. eingeloggt (Sign-in 09:18 UTC, Session
  09:25–10:14 UTC in den Progress-Tabellen) — die zwei Dankesmails sind (noch) nicht
  gleichbedeutend mit mehreren aktiven Nutzern. Offenes Feedback wieder messbar: 0.
  Zählwort-Migration (`sentence-zaehlwort-variants-2026-06-20.sql`) als bereits live
  angewendet verifiziert (Stichprobenquery gegen `accepted_variants`) — fehlt nur
  noch der Commit. Tests (167/167), Build und Lint (23/12) erneut gegen den aktuellen
  Stand gefahren, alle unverändert zu 05.08. `npx knip` direkt neu gezählt (5 unused
  files, 1 unused dep, 8 unused exports) — bestätigt weiterhin: Tool ok, nur der
  pi-lens-Cache ist tot (findet zusätzlich eine Phantom-Datei im Turn-End-Cache).
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
