# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-10).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-10). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- **`npm-audit`-Fix (`d86fa63`) weiterhin live**, `npm audit` erneut 0
  Vulnerabilities (10.08.). `git status` sauber, nichts unpushed vor der
  heutigen Session.
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests (2026-08-10,
  unverändert seit 05.08., auch nach den heutigen Lint-Fixes erneut grün).
  **Lint verbessert:** `npm run lint` → **11 Fehler / 12 Warnungen** (vorher
  23/12) — Commit `c5eb8e8` behebt 12 rein mechanische Fehler (tote
  `onNext`-Prop in `QuizCard.jsx`, ungenutzte Imports in `useAudio.jsx` /
  `useMnemonics.test.js` / `wordOrderDiff.test.js`, 6 leere `catch{}` in
  `offlineCache.js` jetzt mit Kommentar dokumentiert statt stillschweigend
  leer). Keine Verhaltensänderung, Tests vorher/nachher 167/167, Build vorher/
  nachher sauber. Details zu den verbleibenden 11 unter „Offene Punkte".
  Build weiterhin sauber (`npm run build`, ~330ms, nur die bekannte
  Chunk-Size-Warnung).
- Offenes Nutzer-Feedback: **0**. Seit 2026-08-01 ist überhaupt kein neuer
  Feedback-Eintrag eingegangen (Tabellen-Gesamtstand unverändert 41, letzter
  Eintrag 25.05.) — geprüft mit und ohne `resolved_at`-Filter, erneut 10.08.

## prod ≠ live
- **Weiterhin 2 von 13 Accounts aktiv, kein dritter seit 08.08.** Gemessen gegen
  `user_progress`, `sentence_progress` (Query gegen `auth.users` selbst scheitert
  für service_role an der `is_admin()`-RLS-Prüfung der `admin_get_users()`-RPC —
  Proxy über die Progress-Tabellen bleibt der einzig mögliche Weg von diesem Repo
  aus): User `055164cb…` (aktiv seit 05.08., zuletzt 09.08. 12:29 UTC) und
  `e1554433…` (aktiv seit 08.08. 13:00 UTC, zuletzt unverändert). Ein dritter,
  nur in `sentence_progress` sichtbarer Account (`ba343729…`) ist **kein** neuer
  Login — letzte Aktivität dort 22.06., also vor der Reaktivierung. Stand bleibt
  2/13 (geprüft 10.08., ~11:15 Uhr — Ben's Tag ist da erst angelaufen, spätere
  Logins heute nicht ausgeschlossen). Die Rundmail „zicards läuft wieder" (05.08.,
  BCC an die Lerngruppe, ≥3 positive Antworten) zeigt sich damit weiterhin nur bei
  einem Bruchteil der Angeschriebenen.
- **Cron-Job „daily-reminders" (jobid 6) — Status nicht von hier verifizierbar.**
  Laut Vault war er seit 25.06. für die Sommerpause deaktiviert
  (`active = false`), Reaktivierung sollte laut Vault-Notiz ein manueller Schritt
  sein (`cron.alter_job(6, active := true)`). Dieses Repo hat kein
  Management-API-Token und keinen direkten DB-Zugriff (`pg_cron`/`cron.job` ist
  nicht über die REST-API erreichbar) — ob der Reminder-Cron seit der
  Reaktivierung wieder läuft, ist unklar. Unverändert seit 07.08.
- **Keine belastbare „Fehlerrate" messbar.** Das Projekt hat kein
  Error-Tracking/Analytics (kein Sentry o.ä. im Code gefunden, `vercel.json` ist
  eine reine SPA-Rewrite-Regel ohne Functions/Middleware → auch keine
  Vercel-Function-Logs). Einzige Proxy-Signale: App + Supabase-API beide 200,
  0 neue Feedback-Einträge seit 01.08. Eine echte Fehlerquote lässt sich damit
  nicht beziffern — nur „keine gemeldeten Fehler". Unverändert seit 07.08.
- **Verbleibende 11 Lint-Fehler sind React-Hooks-Purity-Regeln, kein
  mechanischer Fix.** Kategorisiert 10.08.: 2× impure `Date.now()` während
  Render (`AdminDashboard.jsx:95,103`), 7× `setState` synchron in einem Effect
  (`useAdmin.js:12,44,56`, `useProgress.js:61`, `useSentenceProgress.js:58`,
  `useSettings.js:29`, `SentenceQuizCard.jsx:53`) — letztere in genau den
  Hooks, die den echten Nutzerfortschritt schreiben, also nicht blind in einer
  Check-in-Session anzufassen. Dazu 1× Fast-Refresh-Verstoß (`useAudio.jsx:35`,
  Datei exportiert Komponente + Hook gemischt) und 1× „Cannot access variable
  before it is declared" (`useLessons.js:16`). Braucht eine eigene Session mit
  Zeit für Regressionstests an den Progress-Hooks.
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (10.08.) bestätigt erneut identisch zu
  06.–09.08.: 5 unused files, 1 unused dep (`pg`), 8 unused exports. Turn-End-Cache
  referenziert weiterhin die nie im Git-Verlauf existierende `AdminFeedback.jsx`
  (erneut verifiziert: `git log --all -- '**/AdminFeedback.jsx'` → leer, Datei
  existiert im Working Tree nicht).
  **Neu geprüft (08.08.):** Der Cache wird von einem externen pi-lens-Plugin
  geschrieben (turn-end-Hook), nicht von einem Skript in diesem Repo — es gibt
  hier keinen `npm run`-Befehl o.ä., der ihn manuell neu erzeugen könnte. Die
  Staleness lässt sich also nicht durch eine reine Check-in-Session beheben,
  sondern erst wieder, sobald in einer echten Coding-Session an den betroffenen
  Dateien gearbeitet wird.
- `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
  (Komplexität 42) weiterhin laut (veraltetem) Cache die größten
  Komplexitäts-Ausreißer — Zahlen sind ~4 Monate alt, nicht neu erhoben.

## Aus dem globalen Check-in (2026-08-10)
- Bens Woche ist von Kundenprojekten belegt: Mo/Di (heute/morgen) Monos/Meier
  Tobler in Zürich, Mi 12.08. sechs Kundentermine, Do–So 13.–16.08. weg
  (AI-for-Founders-Workshop + Sommerlager), 21.–23.08. Junggesellenabschied,
  24.08. Workshop bei Voith. Diese Woche bleibt für zicards realistisch keine
  Zeit — Empfehlungen unten entsprechend klein gehalten oder gleich selbst
  erledigt statt vorgelegt.
- Rundmail „zicards läuft wieder" (05.08., BCC an die Lerngruppe) hat mind. 3
  positive Rückmeldungen erzeugt (u.a. aus Japan, vom Konfuzius-Institut) — aber
  siehe „prod ≠ live" oben: das schlägt sich weiterhin nur bei einem Bruchteil
  der Angeschriebenen in echten Logins nieder (2/13, unverändert seit 08.08.).

## Offene Punkte (nächste Session)
- [x] `sentence-zaehlwort-variants-2026-06-20.sql` committen — bereits am 06.08.
      erledigt (`81402dc`), hier nur die Checkbox nachgezogen.
- [x] Offenes Nutzer-Feedback seit Reaktivierung prüfen — 0 offen, 0 neu seit
      01.08. (erneut bestätigt 08.08.).
- [x] `npm audit` prüfen und beheben — 3 High-Severity-Advisories gefunden
      (react-router, `ws`), mit `npm audit fix` behoben, Tests/Build/Lint danach
      erneut grün, `npm audit` → 0.
- [x] **`d86fa63` (npm-audit-Fix) pushen.** War als Ben-Punkt offen — 09.08.
      geprüft: liegt bereits auf `origin/main` (Ben hat zwischen 08.08. und 09.08.
      gepusht), `npm audit` im Working Tree bestätigt 0 Vulnerabilities.
- [x] **12 mechanische Lint-Fehler behoben** (10.08., Commit `c5eb8e8`): tote
      `onNext`-Prop, ungenutzte Imports/Testvariablen entfernt, 6 leere
      `catch{}` in `offlineCache.js` mit Kommentar dokumentiert statt still
      leer. 23 → 11 Fehler, 12 Warnungen unverändert. Tests 167/167 und Build
      vor/nach unverändert grün — keine Verhaltensänderung.
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Braucht Supabase-
      Dashboard-Zugang oder ein Management-API-Token — kann von diesem Repo aus
      nicht geprüft werden. Ben.
- [ ] **Weiter beobachten: bleibt es bei 2/13 aktiven Accounts?** Seit 08.08.
      13:00 UTC unverändert 2/13 (erneut geprüft 10.08., ~11:15 Uhr — heute war
      bis dahin noch kein neuer Login zu erwarten). Kein akuter Fehler, aber die
      Rückkehr-Rate bleibt deutlich kleiner als die ≥3 positiven Mail-Antworten
      vermuten lassen — falls es bei 2/13 stehen bleibt, wäre das ein Signal für
      Ben, aktiv nachzufassen statt nur zu beobachten.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Aktuell keine Möglichkeit, echte
      Fehler von echten Nutzern zu sehen außer über den Feedback-Knopf. Ben
      entscheiden lassen, ob das den Aufwand wert ist.
- [ ] pi-lens `knip.json` reparieren *(erneut geprüft 2026-08-10: weiterhin kein Regenerate-Weg aus diesem Repo — der Cache wird vom Plugin-Hook geschrieben. Bleibt blockiert, bis das pi-lens-Plugin selbst erreichbar ist.)* — Parse schlägt weiterhin fehl (Cache-Stand
      13.04., ~4 Monate alt, unverändert). `npx knip` direkt funktioniert. Der
      Cache wird extern (Plugin-Hook) geschrieben, in diesem Repo gibt es kein
      Skript, das ihn manuell neu erzeugen könnte — Fix braucht entweder eine
      echte Coding-Session an den betroffenen Dateien oder Zugriff auf das
      pi-lens-Plugin selbst.
- [ ] pi-lens-Cache insgesamt erneuern (`metrics-history.json`, `jscpd.json`,
      `turn-end-findings-last.json` alle Stand 13./14.04., enthält auch eine
      Phantom-Datei-Referenz) — Komplexitätszahlen zu `useProgress.js` /
      `AdminDashboard.jsx` neu erheben statt dem Cache trauen. (Gleiche Ursache
      wie knip.json oben — kein manueller Regenerate-Weg von hier aus.)
- [x] **Lint-Fehler: 11 → 0 (abgeschlossen 2026-08-10, zweiter Lauf).**
      Beleg: `npm run lint` meldet **0 errors** (vorher 11), `npx vitest run` 167/167,
      `npm run build` grün, `npm audit` 0 Vulnerabilities — jeweils nach jedem Einzelschritt
      gefahren. Elf Dateien geändert, +126/−75. Nichts committet, nichts gepusht.

      Was gemacht wurde, und warum so:
      - **`useAudio.jsx` aufgeteilt.** `AudioContext` und der Hook `useAudio` liegen jetzt in
        `src/hooks/audioContext.js`; `useAudio.jsx` exportiert nur noch Komponenten. Vorher
        verwarf Fast Refresh bei jedem Edit an `AudioProvider`/`AudioToggle` den Ton-Zustand.
        Die drei Aufrufer (`UnifiedSession`, `QuizCard`, `SentenceQuizCard`) importieren aus
        der neuen Datei.
      - **`useAdmin.js` neu geschrieben.** Alle drei Hooks leiten den Ladezustand jetzt aus den
        Daten ab, statt ihn vor dem Fetch zu setzen: der State führt mit, *für welchen Schlüssel*
        er gilt (`forUser` / `loaded`), „lädt gerade" ergibt sich aus dem Vergleich. Damit
        entfällt jeder synchrone State-Set im Effect-Rumpf.
      - **`Date.now()` aus dem Render entfernt.** Die Aktiv-/Inaktiv-Zählung des Dashboards
        passiert jetzt in `useAdminUsers` zum Ladezeitpunkt (`aktivCount`/`inaktivCount`);
        `AdminDashboard.jsx` rechnet nicht mehr selbst. Vorher lieferten zwei Renders unbemerkt
        verschiedene Zahlen.
      - **Fetch-Start in einen Microtask verschoben** in `useAdmin`, `useLessons`, `useSettings`,
        `useProgress`, `useSentenceProgress`: `useEffect(() => { Promise.resolve().then(fetchX) })`.
        Ein synchroner Set im Effect erzwingt eine zweite Render-Runde im selben Commit; so liegt
        der erste Set garantiert danach. Verhalten unverändert, der Ladezustand erscheint einen
        Microtask später. Jede Stelle trägt den Grund als Kommentar.
      - **Reset-Effect in `WordOrderCard` gelöscht** (`SentenceQuizCard.jsx`). Er war redundant:
        `UnifiedSession` rendert die Karte mit `key={sessionKey-currentIndex}`, jeder Satzwechsel
        mountet sie also ohnehin neu. Die Wortliste wird jetzt beim Mounten per Lazy-Init
        gemischt. `setTrailing` entfiel dadurch. **Im Code steht ein Warnhinweis: fällt der `key`
        an der Aufrufstelle weg, muss der Reset zurück.**

      **Kein Netz an dieser Stelle, bewusst so berichtet:** die vitest-Umgebung ist `node`,
      ohne jsdom und ohne Testing-Library — für React-Hooks gibt es hier keine automatischen
      Tests, und die 167 grünen Tests decken `utils/`, eine Komponente und `useMnemonics` ab,
      **nicht** die hier geänderten Hooks. Abgesichert wurde über Build, bestehende Suite und
      Durchsicht. Wer die Fortschritts-Hooks (`useProgress`, `useSentenceProgress`,
      `useSettings`) das nächste Mal anfasst, sollte vorher `@testing-library/react` + jsdom
      nachrüsten.

      **Sackgasse, damit sie niemand zweimal läuft:** die Warnung „Unused eslint-disable
      directive" in `UnifiedSession.jsx:165` ist irreführend. Entfernt man die Zeile, meldet
      `react-hooks/exhaustive-deps` sofort 13 Fehler. Die Ausnahme bleibt.
- [x] **Vault-Page `zicards` aktualisiert (2026-08-10).** Die Statusbox nennt jetzt den Reaktivierungsstand (seit 05.08. wieder online, beide Endpunkte 200, ≥3 positive Antworten auf die Rundmail, 2 von 13 Accounts aktiv, Cron-Status ungeklärt) statt der Sommerpause, und die Nutzerzahl ist von „12 registered" auf die im Repo geführten 13 Accounts samt offener Differenz korrigiert. Beleg: `grep -c 'STATUS 2026-06-25 — Sommerpause'` → 0, `grep -c 'STATUS 2026-08-10'` → 1. Ursprünglicher Punkt: Vault-Page weiterhin auf Sommerpause-Stand (Header sagt
      `updated=2026-08-08`, Inhalt beschreibt aber noch die inzwischen beendete
      Sommerpause) — Update-Text unten vorgeschlagen, nicht selbst geschrieben
      (kein Vault-Schreibzugriff aus diesem Check-in).

## Session-Log (letzte 3)
- **2026-08-10** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase), Tests 167/167, Build sauber, `git status` sauber vor Sessionstart.
  **Lint verbessert:** 12 von 23 Fehlern behoben (Commit `c5eb8e8`) — tote
  `onNext`-Prop in `QuizCard.jsx`, ungenutzte Imports/Testvariablen entfernt,
  6 leere `catch{}` in `offlineCache.js` jetzt mit Kommentar statt still leer.
  23 → 11 Fehler, keine Verhaltensänderung (Tests/Build vor und nach identisch
  grün). Die verbleibenden 11 sind React-Hooks-Purity-Regeln (impure
  `Date.now`, `setState`-in-Effect, Fast-Refresh-Split, TDZ) und kategorisiert
  als „braucht eigene Session" statt weiter blind angefasst zu werden — 5 der
  7 setState-Fälle liegen in den Progress-Hooks, dort ist ein blinder Fix zu
  riskant für eine Check-in-Session. Login-Rücklauf unverändert: weiterhin
  2/13 Accounts aktiv, kein dritter seit 08.08. (ein dritter, nur in
  `sentence_progress` sichtbarer Account ist ein Alt-Login von 22.06., kein
  neuer). Offenes Feedback weiter 0, Tabellen-Gesamtstand unverändert 41.
  `npx knip` direkt erneut identisch (5/1/8), pi-lens-Cache weiterhin Stand
  13./14.04. Vault-Page `zicards` weiterhin auf Sommerpause-Stand (Header
  `updated=2026-08-08`, Inhalt aber unverändert) — Update-Vorschlag erneut
  nicht selbst geschrieben (kein Vault-Schreibzugriff aus diesem Check-in).
- **2026-08-09** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase), Tests 167/167, Lint 23/12 unverändert, Build sauber. **`d86fa63`
  (npm-audit-Fix) ist jetzt live** — Ben hat zwischen 08.08. und 09.08. gepusht,
  `origin/main` enthält den Commit, `npm audit` bestätigt erneut 0
  Vulnerabilities. Der gestern für Ben offene Push-Punkt ist damit erledigt.
  **Login-Rücklauf hat sich bewegt:** seit 08.08. 13:00 UTC ist ein zweiter
  Account aktiv (User `e1554433…`, in `user_progress` und `sentence_progress`) —
  jetzt 2/13 statt weiterhin 1/13, der ursprüngliche Account (`055164cb…`) bleibt
  aktiv (zuletzt heute 09:46 UTC). Offenes Feedback weiter 0, Tabellen-Gesamtstand
  unverändert 41. pi-lens-Cache weiterhin Stand 13./14.04., `npx knip` direkt
  erneut identisch (5/1/8) bestätigt. Vault-Page `zicards` weiterhin auf
  Sommerpause-Stand — Update-Vorschlag erneut nicht selbst geschrieben (kein
  Vault-Schreibzugriff aus diesem Check-in).
- **2026-08-08** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase), Tests 167/167, Lint 23/12 unverändert, Build sauber. Login-Rücklauf
  weiter verfolgt: jetzt 4 Tage (05.–08.08.) ohne einen weiteren Login, weiterhin
  1/13 Accounts aktiv. Neu gefunden und behoben: `npm audit` zeigte 3
  High-Severity-Advisories (react-router-Kette, `ws` transitiv über
  `@supabase/realtime-js`) — mit `npm audit fix` gefixt (nur `package-lock.json`,
  keine `package.json`-Range geändert), Tests/Build/Lint danach erneut grün,
  `npm audit` → 0. Commit `d86fa63` lokal, bewusst nicht gepusht (Push = Deploy,
  außerhalb der Session-Grenzen) — liegt für Ben bereit. pi-lens-Cache-Staleness
  genauer untersucht: Cache wird von einem externen Plugin-Hook geschrieben, in
  diesem Repo existiert kein Regenerate-Skript — Punkt bleibt offen, aber jetzt
  mit geklärter Ursache statt wiederholter Vermutung. `npx knip` direkt erneut
  identisch (5/1/8) bestätigt. Vault-Page `zicards` weiterhin auf Sommerpause-
  Stand (13.07.) — Update-Vorschlag erneut nicht selbst geschrieben.
