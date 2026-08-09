# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-09).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-09). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- **`npm-audit`-Fix (`d86fa63`) ist jetzt live.** Ben hat gepusht (zwischen 08.08.
  und 09.08.) — `d86fa63` und der Handover-Commit `d63987b` stehen beide auf
  `origin/main` (`git log --oneline origin/main..HEAD` → leer, `git status` sauber).
  `npm audit` gegen den aktuellen Working Tree erneut gefahren: **0 Vulnerabilities**
  (09.08., bestätigt). Der gestrige offene Punkt „Ben muss pushen" ist damit erledigt.
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests (2026-08-09,
  unverändert seit 05.08.). Lint unverändert: `npm run lint` → 23 Fehler /
  12 Warnungen (2026-08-09, exakt wie 05.–08.08. — keine Regression, keine
  Besserung). Build weiterhin sauber (`npm run build`, 458ms, nur die bekannte
  Chunk-Size-Warnung).
- Offenes Nutzer-Feedback: **0**. Seit 2026-08-01 ist überhaupt kein neuer
  Feedback-Eintrag eingegangen (Tabellen-Gesamtstand unverändert 41, letzter
  Eintrag 25.05.) — geprüft mit und ohne `resolved_at`-Filter, erneut 09.08.

## prod ≠ live
- **Zweiter Account seit der Reaktivierung aktiv geworden.** Gemessen gegen
  `user_progress`, `sentence_progress` (Query gegen `auth.users` selbst scheitert
  für service_role an der `is_admin()`-RLS-Prüfung der `admin_get_users()`-RPC —
  Proxy über die Progress-Tabellen bleibt der einzig mögliche Weg von diesem Repo
  aus): jetzt **2 von 13 Accounts** seit 05.08. aktiv — User `055164cb…` (erste
  Aktivität 05.08. 09:20 UTC, weiterhin aktiv, zuletzt 09.08. 09:46 UTC) und neu
  User `e1554433…` (erste Aktivität 08.08. 13:00 UTC, in beiden Tabellen). Drei
  Tage stand es bei 1/13 (05.–07.08.), seit 08.08. bei 2/13 — geprüft 09.08. Die
  Rundmail „zicards läuft wieder" (05.08., BCC an die Lerngruppe, ≥3 positive
  Antworten) zeigt sich damit erstmals in echter Nutzung, wenn auch verzögert und
  bei einem Bruchteil der Angeschriebenen.
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
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (09.08.) bestätigt erneut identisch zu
  06.–08.08.: 5 unused files, 1 unused dep (`pg`), 8 unused exports. Turn-End-Cache
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

## Aus dem globalen Check-in (2026-08-07)
- Bens Kapazität bis 24.08. ist knapp: Mo–Di 10./11.08. Kunde Schweiz, Mi 12.08.
  komplett voll (6 Termine), Do–So 13.–16.08. Sommerlager (privat, weg), Mo–Do
  17.–20.08. einzige freie Arbeitswoche, Fr–So 21.–23.08. Junggesellenabschied
  (privat, weg), Mo 24.08. Workshop Heidenheim. zicards konkurriert diese und
  nächste Woche mit zwei Kundenterminen und einem Workshop um Zeit — realistisch
  kein Fenster für größere zicards-Arbeit vor dem 17.08.
- Rundmail „zicards läuft wieder" (05.08., BCC an die Lerngruppe) hat mind. 3
  positive Rückmeldungen erzeugt (u.a. aus Japan, vom Konfuzius-Institut) — aber
  siehe „prod ≠ live" oben: das schlägt sich (noch) nicht in echten Logins nieder.

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
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Braucht Supabase-
      Dashboard-Zugang oder ein Management-API-Token — kann von diesem Repo aus
      nicht geprüft werden. Ben.
- [ ] **Weiter beobachten: bleibt es bei 2/13 aktiven Accounts?** 05.–07.08. war
      es bei 1/13, seit 08.08. 13:00 UTC ist ein zweiter Account aktiv (2/13,
      bestätigt 09.08.). Kein akuter Fehler, aber die Rückkehr-Rate bleibt
      deutlich kleiner als die ≥3 positiven Mail-Antworten vermuten lassen —
      falls es bei 2/13 stehen bleibt, wäre das ein Signal für Ben, aktiv
      nachzufassen statt nur zu beobachten.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Aktuell keine Möglichkeit, echte
      Fehler von echten Nutzern zu sehen außer über den Feedback-Knopf. Ben
      entscheiden lassen, ob das den Aufwand wert ist.
- [ ] pi-lens `knip.json` reparieren — Parse schlägt weiterhin fehl (Cache-Stand
      13.04., ~4 Monate alt, unverändert). `npx knip` direkt funktioniert. Geprüft
      08.08.: der Cache wird extern (Plugin-Hook) geschrieben, in diesem Repo gibt
      es kein Skript, das ihn manuell neu erzeugen könnte — Fix braucht entweder
      eine echte Coding-Session an den betroffenen Dateien oder Zugriff auf das
      pi-lens-Plugin selbst.
- [ ] pi-lens-Cache insgesamt erneuern (`metrics-history.json`, `jscpd.json`,
      `turn-end-findings-last.json` alle Stand 13./14.04., enthält auch eine
      Phantom-Datei-Referenz) — Komplexitätszahlen zu `useProgress.js` /
      `AdminDashboard.jsx` neu erheben statt dem Cache trauen. (Gleiche Ursache
      wie knip.json oben — kein manueller Regenerate-Weg von hier aus.)
- [ ] Lint weiterhin 23 Fehler / 12 Warnungen — Umfang einschätzen, ob eigene
      Session wert (blockiert Build/Deploy nicht).

## Session-Log (letzte 3)
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
- **2026-08-07** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase). Kernfrage des Tages („zeigt sich die Reaktivierung in den Zahlen?")
  beantwortet: **nein** — trotz 3 positiver Mail-Antworten weiterhin nur 1 von 13
  Accounts aktiv, keine neuen Logins seit 05.08. Migrations-Commit-Punkt aus dem
  Handover war bereits erledigt, nur nicht abgehakt — korrigiert. Neu geprüft und
  offen: Cron-Job-Status „daily-reminders" nicht von hier verifizierbar (kein
  Management-API-Zugang), kein Error-Tracking im Projekt vorhanden (daher keine
  echte „Fehlerrate", nur Proxy-Signale). Tests (167/167), Lint (23/12), Build,
  pi-lens-Cache-Staleness und `knip`-Direktlauf (5/1/8, identisch zu 06.08.) erneut
  bestätigt, keine Veränderung. Vault-Page `zicards` als veraltet identifiziert
  (Stand 13.07., beschreibt noch die laufende Sommerpause) — Update vorgeschlagen,
  nicht selbst geschrieben.
