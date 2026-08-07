# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-07 18:0x CEST).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-07). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- **Zählwort-Migration ist jetzt tatsächlich committet** (`81402dc`, 06.08.) — der
  bisher offene Punkt „committen" war real schon erledigt, nur die Checkliste hier
  hatte es noch nicht nachgezogen. `git status` sauber, kein unpushter Commit.
- Testsuite grün: `npx vitest run` → 13 Testdateien, 167 Tests (2026-08-07,
  unverändert seit 05.08.). Lint unverändert: `npm run lint` → 23 Fehler /
  12 Warnungen (2026-08-07, exakt wie 05./06.08. — keine Regression, keine Besserung).
- Offenes Nutzer-Feedback: **0**. Seit 2026-08-01 ist überhaupt kein neuer
  Feedback-Eintrag eingegangen (Tabellen-Gesamtstand unverändert 41, letzter
  Eintrag 25.05.) — geprüft mit und ohne `resolved_at`-Filter.

## prod ≠ live
- **Reaktivierung zeigt sich bislang nicht in echter Nutzung.** Die Rundmail
  „zicards läuft wieder" ging am 05.08. an die Lerngruppe (BCC), mindestens
  3 positive Antworten kamen zurück. Gemessen gegen `auth.users`,
  `user_progress`, `sentence_progress`: **weiterhin genau 1 von 13 Accounts**
  seit 05.08. eingeloggt (Sign-in 09:18 UTC, Session-Aktivität 09:25–10:14 UTC).
  Zwei Tage später (07.08., erneut geprüft) kein einziger weiterer Login, keine
  weiteren Progress-Einträge — auch nicht am 06. oder 07.08. Positive Mail-Antwort
  ⇏ Produktnutzung; wer wirklich zurückkommt, bleibt offen.
- **Cron-Job „daily-reminders" (jobid 6) — Status nicht von hier verifizierbar.**
  Laut Vault war er seit 25.06. für die Sommerpause deaktiviert
  (`active = false`), Reaktivierung sollte laut Vault-Notiz ein manueller Schritt
  sein (`cron.alter_job(6, active := true)`). Dieses Repo hat kein
  Management-API-Token und keinen direkten DB-Zugriff (`pg_cron`/`cron.job` ist
  nicht über die REST-API erreichbar, Prüfung siehe unten) — ob der Reminder-Cron
  seit der Reaktivierung wieder läuft, ist unklar. **[neu]**
- **Keine belastbare „Fehlerrate" messbar.** Das Projekt hat kein
  Error-Tracking/Analytics (kein Sentry o.ä. im Code gefunden, `vercel.json` ist
  eine reine SPA-Rewrite-Regel ohne Functions/Middleware → auch keine
  Vercel-Function-Logs). Einzige Proxy-Signale: App + Supabase-API beide 200,
  0 neue Feedback-Einträge seit 01.08. Eine echte Fehlerquote lässt sich damit
  nicht beziffern — nur „keine gemeldeten Fehler". **[neu]**
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (07.08.) bestätigt erneut identisch zu
  06.08.: 5 unused files, 1 unused dep (`pg`), 8 unused exports. Turn-End-Cache
  referenziert weiterhin die nie im Git-Verlauf existierende `AdminFeedback.jsx`
  (erneut verifiziert: `git log --all -- '**/AdminFeedback.jsx'` → leer).
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
      01.08. (erneut bestätigt 07.08.).
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Braucht Supabase-
      Dashboard-Zugang oder ein Management-API-Token — kann von diesem Repo aus
      nicht geprüft werden. Ben.
- [ ] **Weiter beobachten: bleibt es bei 1/13 aktiven Accounts?** Zwei Dankesmail-
      Antworter sind noch nicht als Login sichtbar. Kein akuter Fehler, aber
      falls in den nächsten Tagen kein weiterer Login kommt, ist die Rückkehr
      kleiner als die Mail-Resonanz vermuten lässt.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Aktuell keine Möglichkeit, echte
      Fehler von echten Nutzern zu sehen außer über den Feedback-Knopf. Ben
      entscheiden lassen, ob das den Aufwand wert ist.
- [ ] pi-lens `knip.json` reparieren — Parse schlägt weiterhin fehl (Cache-Stand
      13.04., ~4 Monate alt, unverändert). `npx knip` direkt funktioniert.
- [ ] pi-lens-Cache insgesamt erneuern (`metrics-history.json`, `jscpd.json`,
      `turn-end-findings-last.json` alle Stand 13./14.04., enthält auch eine
      Phantom-Datei-Referenz) — Komplexitätszahlen zu `useProgress.js` /
      `AdminDashboard.jsx` neu erheben statt dem Cache trauen.
- [ ] Lint weiterhin 23 Fehler / 12 Warnungen — Umfang einschätzen, ob eigene
      Session wert (blockiert Build/Deploy nicht).

## Session-Log (letzte 3)
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
- **2026-08-05** — Projekt-Check-in. Supabase-Ausfall erneut gemessen (weiterhin
  NXDOMAIN über beide Resolver, ≥2 Tage bestätigt) — Ursache des 🔴 vom 04.08.
  bleibt bestehen (später als geplante Sommerpause richtiggestellt, siehe 06.08.).
  Testsuite (167/167) + Build erneut grün. pi-lens-Cache als veraltet (Stand
  13./14.04.) identifiziert, `knip` direkt lauffähig geprüft. Lint erstmals mit
  Zahl erfasst (23/12). HANDOVER.md nachgezogen.
