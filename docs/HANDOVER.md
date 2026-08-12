# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-12, auch `/login` direkt
  auf beiden Domains → 200 — SPA-Rewrite in `vercel.json` funktioniert für
  Deep-Links).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-12). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- `npm audit` weiterhin 0 Vulnerabilities (12.08.). `git log origin/main..HEAD`
  leer — HEAD == `origin/main`, nichts unpushed.
- Lint unverändert: `npm run lint` → 0 Fehler / 11 Warnungen. Tests unverändert:
  `npx vitest run` → 13 Testdateien, 167 Tests. Build unverändert sauber
  (`npm run build`, ~400ms, nur die bekannte Chunk-Size-Warnung).
- Offenes Nutzer-Feedback: **0**. Tabellen-Gesamtstand unverändert 41 (mit und
  ohne `resolved_at`-Filter identisch 41 → alles resolved). Seit 2026-08-01
  kein neuer Eintrag.
- **Housekeeping gefunden und behoben:** Die HANDOVER.md-Fassung der
  11.08.-Session war geschrieben, aber nie committet (`git status` zeigte sie
  heute noch als „modified", `git log` endete bei `f1389e2` vom 10.08.). Mit
  dieser Session zusammen committet — künftig: Check-in endet erst mit einem
  Commit, nicht nur mit dem Datei-Schreiben.
- **Supabase-Security-Mail (11.08. 17:21) untersucht.** Alle 8 Tabellen im
  Repo haben RLS aktiv (geprüft: `characters`, `sentences`, `user_progress`,
  `sentence_progress`, `admin_users`, `mnemonics`, `feedback`,
  `user_settings`) — RLS ist **nicht** die Ursache. Gefunden: **alle 7
  Functions in `public`** (`is_admin`, `admin_get_users`,
  `admin_get_user_chars`, `admin_get_user_sentences`, `get_due_counts` — alle
  `SECURITY DEFINER` — sowie die zwei Trigger-Functions `update_updated_at`,
  `mnemonics_set_updated_at`) sind ohne festes `search_path` angelegt. Das ist
  exakt der Supabase-Advisor-Lint „Function Search Path Mutable" (0011) — bei
  den vier `SECURITY DEFINER`-Functions eine echte Rechteausweitungs-Lücke
  (manipulierbarer `search_path` in der aufrufenden Session), nicht nur
  Kosmetik. Fix geschrieben und geprüft (alle Objektreferenzen in den
  Funktionskörpern sind bereits schemaqualifiziert, `SET search_path = ''` ist
  daher sicher): `supabase/security-search-path-fix-2026-08-12.sql`
  (`ALTER FUNCTION ... SET search_path = ''`, idempotent, ändert keine
  Rechte). CLAUDE.md um die Regel ergänzt (Functions brauchen künftig immer
  `search_path`, Checkliste erweitert). **Nicht gegen Prod ausgeführt** — Repo
  hat keinen DB-Schreibzugriff (kein Management-Token, keine
  Postgres-Connection in `.env`, nur REST-API-Keys) und die Session-Grenze
  verbietet DB-Schreibzugriffe ohnehin. Ausführung + „Rerun linter" im
  Supabase-Advisor ist Ben-Punkt (unten). **Unverifiziert bleibt**, ob dies
  wirklich der/die einzige(n) von Supabase gemeldete(n) Punkt(e) ist(sind) —
  kein Login-Zugang zum Advisors-Dashboard von hier aus (Chrome-Erweiterung
  nicht verbunden), das ist eine Vermutung aus Repo-Analyse, keine Bestätigung
  gegen den tatsächlichen Advisor-Report.
- **Tablet/Zweitgerät-Login geprüft** (Anlass: eine Nutzer-Mail wartet seit
  gestern auf einen „Anmelde-Link", Betreff „LINK: zicards läuft wieder", hat
  zweimal nachgefragt). Befund: **Diese App hat gar keinen Magic-Link-Login.**
  `grep -rni "otp|magic|resetpassword|verifyOtp|redirectTo"` über `src/` und
  `supabase/` → 0 Treffer. Anmeldung läuft ausschließlich über
  `supabase.auth.signInWithPassword` (E-Mail + Passwort,
  `src/hooks/useAuth.js`) — keine geräteübergreifende Link-Mechanik, die
  „brechen" könnte. Session liegt wie bei Supabase-Standard pro Browser/Gerät
  in `localStorage` — das ist erwartetes Verhalten, kein Bug: auf dem Tablet
  muss sich der Nutzer mit demselben E-Mail/Passwort neu anmelden, es gibt
  keinen Link, der geräteübergreifend funktionieren müsste. Einzige
  Alternative, die tatsächlich einen Link verschickt: Supabase' Standard-
  Bestätigungsmail bei der Registrierung (`signUp`) — falls der Nutzer neu
  registriert und auf diese Bestätigung wartet, ist das eine
  SMTP-Zustellungsfrage, die nur über die Supabase-Konsole prüfbar ist (Ben-
  Punkt). Kein Code-Bug gefunden: `/login` direkt lädt auf beiden Domains
  (200), PWA-Update-Konfiguration ist sauber (`registerType: autoUpdate`,
  `skipWaiting`, `clientsClaim` — kein Stale-Cache-Risiko), `localStorage`-
  Zugriffe sind überall defensiv mit try/catch abgesichert.

## prod ≠ live
- **2 von 13 Accounts aktiv — aber `055164cb…` ist nach 2 Tagen Stillstand
  wieder aktiv geworden:** 11.08. 17:01–17:10 UTC (neue Einträge in
  `user_progress` und `sentence_progress`, geprüft 12.08.). `e1554433…`
  bleibt dagegen bei seinem Stand vom 08.08. 13:01 UTC — jetzt 4 Tage ohne
  Aktivität. Kein dritter Account aktiviert (`ba343729…` weiterhin Alt-Login
  vom 22.06., vor der Reaktivierung). Stand bleibt 2/13, aber die Zwei-Tage-
  Flaute war kein Trend, sondern eine Pause bei einem einzelnen Nutzer.
- **Cron-Job „daily-reminders" (jobid 6) — Status weiterhin nicht von hier
  verifizierbar.** Unverändert seit 07.08., braucht Supabase-Dashboard-Zugang
  oder Management-API-Token.
- **Supabase-Security-Fix bereit, aber nicht angewendet** (siehe oben,
  `supabase/security-search-path-fix-2026-08-12.sql`) — braucht Bens
  Supabase-SQL-Editor-Zugang.
- **Keine belastbare „Fehlerrate" messbar.** Unverändert — kein
  Error-Tracking im Projekt, einzige Proxy-Signale App/Supabase-Status und
  Feedback-Knopf.
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (12.08.) unverändert: 5 unused
  files, 1 unused dep (`pg`), 9 unused exports — identisch zu 11.08., keine
  neue Abweichung.
- `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
  (Komplexität 42) weiterhin laut (veraltetem) Cache die größten
  Komplexitäts-Ausreißer — Zahlen sind ~4 Monate alt, nicht neu erhoben.

## Aus dem globalen Check-in (2026-08-12)
- Bens Kapazität: 12.08. komplett verplant (7 Termine 09:00–16:45, danach
  privat), 13.–16./17.08. Sommerlager (privat, ganztägig) — ab heute Abend bis
  Montag 17.08. praktisch kein Zeitfenster für dieses Projekt. Entsprechend
  wurde alles, was ohne Ben ging, in dieser Session selbst erledigt.
- Supabase-Mail „Action required: security vulnerabilities detected"
  (11.08. 17:21) — untersucht, Ursache identifiziert (search_path), Fix
  vorbereitet, siehe oben. Ausführung ist Ben-Punkt.
- Nutzer-Mail zum „Anmelde-Link" (zweimal nachgehakt, 17:11 und 00:02) —
  Tablet-Login-Frage aus Code-Sicht geprüft, kein Bug gefunden (siehe oben).
  Die Antwort an den Nutzer entsteht in der Hauptsession, nicht hier.

## Offene Punkte (nächste Session)
- [ ] **Supabase-Security-Fix ausführen:**
      `supabase/security-search-path-fix-2026-08-12.sql` im SQL-Editor laufen
      lassen, danach im Security-Advisor „Rerun linter" — bestätigt, ob damit
      alle gemeldeten Punkte erledigt sind (von hier nicht gegenprüfbar ohne
      Advisor-Zugang). Ben.
- [ ] **Falls der wartende Nutzer neu registriert hat:** prüfen, ob
      Supabase' Bestätigungsmail (SMTP) überhaupt zugestellt wird — nur über
      die Supabase-Konsole (Auth → Email Templates / Logs) einsehbar. Ben.
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Weiterhin nur über
      Supabase-Dashboard/Management-API-Token prüfbar. Unverändert seit 07.08.
      Ben.
- [ ] **Weiter beobachten: 2/13 aktive Accounts.** `055164cb…` nach 2 Tagen
      Pause wieder aktiv (11.08. abends), `e1554433…` jetzt 4 Tage still. Kein
      akuter Fehler (App+Backend beide 200), aber Rückkehr-Rate bleibt weit
      unter den ≥3 positiven Mail-Antworten. Kein neuer Handlungsbedarf, nur
      weiter beobachten.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Unverändert — Ben entscheiden
      lassen, ob der Aufwand lohnt.
- [ ] pi-lens `knip.json` reparieren — unverändert blockiert (Cache wird vom
      externen Plugin-Hook geschrieben, kein Regenerate-Weg aus diesem Repo).
- [ ] pi-lens-Cache insgesamt erneuern (Stand 13./14.04., ~4 Monate alt) —
      gleiche Ursache wie oben.
- [x] Lint-Fix `f1389e2` push-Status erneut bestätigt (12.08.): liegt auf
      `origin/main`, `npm run lint` weiterhin 0/11.
- [x] HANDOVER.md-Lücke der 11.08.-Session geschlossen — heute committet
      (siehe „Was live / fertig").
- [x] Supabase-Security-Mail geprüft, Ursache im Repo verifiziert, Fix
      geschrieben (nicht angewendet — Ben-Punkt oben).
- [x] Tablet-Login-Frage aus Code-Sicht geprüft — kein Bug, App hat keinen
      Magic-Link-Mechanismus.

## Session-Log (letzte 3)
- **2026-08-12** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase, inkl. `/login`-Deep-Link direkt), Tests 167/167, Lint 0/11, Build
  sauber, `npm audit` 0. Feedback weiter 0 offen, 41 gesamt unverändert.
  **Zwei Supabase-Signale aus dem globalen Check-in abgearbeitet:** (1)
  Security-Advisor-Mail — Ursache im Repo gefunden (7 Functions ohne
  `search_path`, 5 davon `SECURITY DEFINER` = echte Rechteausweitungs-Lücke),
  Fix-Migration geschrieben und geprüft, CLAUDE.md um die Regel ergänzt,
  Anwendung braucht Bens SQL-Editor-Zugang. (2) Tablet-Login-Nachfrage eines
  Nutzers — Code geprüft, die App hat keinen Magic-Link, nur E-Mail/Passwort;
  kein Bug gefunden, offene Frage ist SMTP-Zustellung der
  Registrierungs-Bestätigung (nur Supabase-Konsole). Account-Aktivität: 2/13
  weiterhin, aber `055164cb…` nach 2 Tagen Stillstand am 11.08. abends wieder
  aktiv geworden, `e1554433…` jetzt 4 Tage still. Housekeeping: HANDOVER.md
  der 11.08.-Session war nie committet — heute nachgeholt. pi-lens-Cache
  weiterhin Stand 13./14.04., `npx knip` direkt unverändert (5/1/9).
- **2026-08-11** — Projekt-Check-in (ruhiger Tag, Ben ohne Zeitfenster diese
  Woche — alles Topf-A selbst erledigt). Health erneut 200/200/200 (App × 2,
  Supabase), Tests 167/167, Build sauber, `npm audit` 0 Vulnerabilities,
  `git status`/`git log origin/main..HEAD` beide leer. Lint-Fix `f1389e2`
  bestätigt live+gepusht (gestern noch offen als „nicht gepusht"): 0
  Fehler / 11 Warnungen, unverändert. Feedback weiter 0 offen, 41 gesamt
  unverändert. Keine neuen Mails zum Projekt seit dem letzten Check-in
  (Befund, kein Fehler). Account-Aktivität verschärft beobachtet: 2/13
  weiterhin, aber seit 09.08. 12:29 UTC gar keine neue Aktivität mehr, auch
  nicht von den 2 aktiven Accounts — nicht nur kein Wachstum, sondern 2 Tage
  Stillstand (löste sich am 11.08. abends, siehe heutige Session). `npx knip`
  direkt: 5 unused files / 1 unused dep unverändert, aber 9 statt 8 unused
  exports — geprüft, keine der betroffenen Dateien seit Mai verändert, also
  vermutlich Zähl-Abweichung, kein neuer toter Code. pi-lens-Cache weiterhin
  Stand 13./14.04. Vault-Page `zicards` (Stand 10.08., von der letzten Session
  geschrieben) deckt sich weiterhin mit der Realität — kein Update nötig aus
  dieser Session, nur die Beobachtungs-Verschärfung (2 Tage Stillstand) wäre
  bei Gelegenheit nachzutragen. **Diese Session hatte selbst eine Lücke: die
  HANDOVER.md-Änderung wurde geschrieben, aber nicht committet — am 12.08.
  nachgeholt.**
- **2026-08-10** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase), Tests 167/167, Build sauber, `git status` sauber vor Sessionstart.
  Lint verbessert: 12 von 23 Fehlern behoben (Commit `c5eb8e8`) — tote
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
