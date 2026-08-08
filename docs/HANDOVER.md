# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-08 09:1x CEST).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-08). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- **Zählwort-Migration ist jetzt tatsächlich committet** (`81402dc`, 06.08.) — der
  bisher offene Punkt „committen" war real schon erledigt, nur die Checkliste hier
  hatte es noch nicht nachgezogen. `git status` sauber, kein unpushter Commit
  (Stand vor der heutigen Session — siehe npm-audit-Fix unten).
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests (2026-08-08,
  unverändert seit 05.08., auch nach dem npm-audit-Fix erneut grün). Lint
  unverändert: `npm run lint` → 23 Fehler / 12 Warnungen (2026-08-08, exakt wie
  05.–07.08. — keine Regression, keine Besserung). Build weiterhin sauber
  (`npm run build`, 527ms, nur die bekannte Chunk-Size-Warnung).
- Offenes Nutzer-Feedback: **0**. Seit 2026-08-01 ist überhaupt kein neuer
  Feedback-Eintrag eingegangen (Tabellen-Gesamtstand unverändert 41, letzter
  Eintrag 25.05.) — geprüft mit und ohne `resolved_at`-Filter, erneut 08.08.
- **`npm audit` fand 3 High-Severity-Advisories** (react-router: mehrere CVEs
  inkl. RCE-Kandidat GHSA-49rj-9fvp-4h2h; `ws`: Memory-Disclosure/DoS, transitiv
  über `@supabase/realtime-js`) — behoben mit `npm audit fix` (keine
  `package.json`-Range geändert, nur `package-lock.json`, 952/−676 Zeilen).
  Danach erneut verifiziert: Tests 167/167, Build ok, Lint unverändert 23/12,
  `npm audit` → 0 Vulnerabilities. **Commit `d86fa63` liegt lokal, ist NICHT
  gepusht** (Push = Vercel-Auto-Deploy, außerhalb der heutigen Session-Grenzen) —
  Ben muss pushen, damit der Fix live geht.

## prod ≠ live
- **Reaktivierung zeigt sich bislang nicht in echter Nutzung.** Die Rundmail
  „zicards läuft wieder" ging am 05.08. an die Lerngruppe (BCC), mindestens
  3 positive Antworten kamen zurück. Gemessen gegen `user_progress`,
  `sentence_progress` (Query gegen `auth.users` selbst scheitert für service_role
  an der `is_admin()`-RLS-Prüfung der `admin_get_users()`-RPC — Proxy über die
  Progress-Tabellen bleibt der einzig mögliche Weg von diesem Repo aus):
  **weiterhin genau 1 von 13 Accounts** seit 05.08. eingeloggt (Session-Aktivität
  05.08. 09:25–10:14 UTC). Vier Tage später (08.08., erneut geprüft) weiterhin
  kein einziger weiterer Login, keine weiteren Progress-Einträge an 06., 07.
  oder 08.08. Positive Mail-Antwort ⇏ Produktnutzung; wer wirklich zurückkommt,
  bleibt offen.
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
  `success:false`. Direkter `npx knip`-Lauf (08.08.) bestätigt erneut identisch zu
  06./07.08.: 5 unused files, 1 unused dep (`pg`), 8 unused exports. Turn-End-Cache
  referenziert weiterhin die nie im Git-Verlauf existierende `AdminFeedback.jsx`
  (erneut verifiziert: `git log --all -- '**/AdminFeedback.jsx'` → leer).
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
      erneut grün, `npm audit` → 0. **Commit `d86fa63` liegt lokal, noch nicht
      gepusht** — Push (= Vercel-Deploy) ist Ben.
- [ ] **`d86fa63` (npm-audit-Fix) pushen.** Lockfile-only, kein `package.json`-
      Range-Change, alle Checks grün — niedriges Risiko. Ben.
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Braucht Supabase-
      Dashboard-Zugang oder ein Management-API-Token — kann von diesem Repo aus
      nicht geprüft werden. Ben.
- [ ] **Weiter beobachten: bleibt es bei 1/13 aktiven Accounts?** Jetzt 4 Tage
      (05.–08.08.) ohne einen einzigen weiteren Login trotz ≥3 positiver
      Mail-Antworten. Kein akuter Fehler, aber die Rückkehr-Rate bleibt kleiner
      als die Mail-Resonanz vermuten lässt — falls auch nächste Woche kein
      weiterer Login kommt, wäre das ein Signal für Ben, aktiv nachzufassen statt
      nur zu beobachten.
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
- **2026-08-06** — Projekt-Check-in. Supabase-„Ausfall" ist vorbei: App +
  Supabase-REST-API beide 200. Echte Nutzung seit der Rückkehr-Mail geprüft statt
  angenommen: von 13 Accounts genau 1 seit 05.08. eingeloggt. Offenes Feedback
  wieder messbar: 0. Zählwort-Migration als bereits live angewendet verifiziert,
  fehlender Commit nachgezogen. Tests (167/167), Build und Lint (23/12) erneut
  gegen den aktuellen Stand gefahren, alle unverändert zu 05.08. `npx knip` direkt
  neu gezählt (5 unused files, 1 unused dep, 8 unused exports).
