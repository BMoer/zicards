# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-17), auch `/login` direkt
  auf beiden Domains → 200 — SPA-Rewrite in `vercel.json` funktioniert weiter
  für Deep-Links.
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 17.08.).
- `npm audit` weiterhin 0 Vulnerabilities. Lint unverändert: `npm run lint` →
  0 Fehler / 11 Warnungen. Tests unverändert: `npx vitest run` → 13
  Testdateien, 167 Tests grün. Build sauber (`npm run build`, ~370ms, nur die
  bekannte Chunk-Size-Warnung).
- Offenes Nutzer-Feedback: **0**. Tabellen-Gesamtstand unverändert 41 (mit und
  ohne `resolved_at`-Filter identisch 41 → alles resolved). Weiterhin kein
  neuer Eintrag seit 2026-08-01.
- **Alle vormals „unpushed" Doku-Commits sind jetzt auf `origin/main`** (18.08.,
  `git log --oneline origin/main..HEAD` leer, `git branch -vv` zeigt `main`
  exakt bei `[origin/main] 3361c77`). Widerspricht dem, was HANDOVER.md bis
  gestern als offenen Punkt führte („2 Commits unpushed") — die Messung
  gewinnt: der Rückstand ist weg, kein Push in dieser Session nötig oder
  ausgeführt. Alle betroffenen Commits sind reine Doku-/Skript-Änderungen
  (`docs/HANDOVER.md`, `CLAUDE.md`, `.claude/checkin.md`,
  `supabase/*.sql`, `supabase/apply-security-fix.sh` — kein `src/`-Diff),
  also kein Funktionsrisiko durch den dadurch ausgelösten Vercel-Deploy.
- **Karl Zarhuber (Tablet-Login) hat am 13.08. bestätigt: „zicards läuft gut
  nun auch auf dem Tablet."** Damit ist die offene Frage aus der 13.08.-Session
  (Live-Viewport-Test auf echtem Gerät nötig, weil damals nur Code-Review
  möglich war) durch eine echte Nutzerbestätigung geklärt — stärker als ein
  synthetischer Browser-Test. Karl ist laut Mailkontext bestätigt Bestandsnutzer
  (keine Neuregistrierung), damit ist auch die daran hängende
  SMTP-Bestätigungsmail-Frage gegenstandslos. Beide Punkte unten als erledigt
  markiert.
- **eslint-disable-Warnung untersucht statt blind entfernt**
  (`UnifiedSession.jsx:165`, „Unused eslint-disable directive"): probeweise
  entfernt und `npm run lint` erneut gelaufen — die Direktive ist NICHT tot.
  Ohne sie meldet ESLint 13 Fehler (`react-hooks/refs`: „Cannot access refs
  during render" bei `charProgressRef.current`/`sentProgressRef.current` im
  `useMemo`, Zeilen 162/163) plus zusätzliche `exhaustive-deps`-Warnungen an
  anderen Zeilen. Änderung sofort rückgängig gemacht (`git status` wieder
  clean, `npm run lint` wieder bei 0 Fehler / 11 Warnungen bestätigt). Für
  künftige Sessions festgehalten: dieser Fund ist ein Guard, kein totes
  Aufräumen — ein echter Fix bräuchte ein Refactoring des Ref-Zugriffs im
  `useMemo`, nicht nur das Löschen der Zeile.
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
- **Cron-Job „daily-reminders" (jobid 6) — Root-Cause für die stillen Accounts
  gefunden, kein Rätsel mehr.** Vault-Page `zicards` (gegengelesen 19.08.)
  hatte die Antwort bereits stehen, war nur nie in dieses Handover
  übernommen worden: der Job wurde **2026-06-25 explizit deaktiviert**
  (`active = false`) für die Sommerpause, Re-Enable vorgesehen über
  `select cron.alter_job(6, active := true);` „at next course start" — dieser
  Schritt ist beim Wiederanlauf am 05.08. offenbar nicht passiert. Heute
  (19.08.) per REST gegengeprüft, ohne Dashboard-Zugang: `public.
  user_settings.last_reminder_sent` steht für **alle 4** Nutzer mit
  `reminder_enabled = true` exakt auf `2026-06-25T07:00:1x` UTC (identischer
  Lauf, Sekundenbruchteile auseinander) — seither keine einzige Aktualisierung
  mehr. Gleichzeitig haben genau diese 4 Nutzer **jetzt, in diesem Moment**,
  fällige Karten (`get_due_counts`-Logik nachgerechnet: 137 / 25 / 84 / 172
  fällige `user_progress`-Zeilen) — die Reminder-Function hätte bei aktivem
  Cron längst wieder gefeuert. Schluss: der Job läuft mit sehr hoher
  Wahrscheinlichkeit **immer noch nicht**, seit fast 8 Wochen keine
  Erinnerungsmail raus. Das ist die plausibelste Erklärung für die stillen
  Accounts — niemand wird zurückgeholt. Fix ist ein Einzeiler
  (`select cron.alter_job(6, active := true);`), aber eine Schreiboperation
  im SQL-Editor → Ben-Punkt, siehe unten. **Unverifiziert bleibt** die
  tatsächliche `cron.job`-Zeile (nur über Dashboard/Management-API
  einsehbar) — die Auswertung oben ist eine sehr starke Indizienkette, kein
  direkter Blick auf `active`.
- **Account-Aktivität (19.08.) neu vollständig durchgezählt (1368 Zeilen,
  12 distinkte Accounts) — bisherige „8.8 Tage still"-Aussage war bereits
  am 17.08. veraltet, nicht erst jetzt.** Rang 1 unverändert durchgehend
  aktiv (zuletzt 18.08. 18:03 UTC). Rang 2 — der als „seit 08.08. 13:01 UTC
  still" geführte zweite Account — hatte tatsächlich am **17.08. 03:00–03:07
  UTC eine echte ~7-minütige Lernsession** (15 Kartenaktualisierungen),
  mehrere Stunden **vor** dem Commit der 17.08.-Session (07:35 UTC) — die
  damalige „unverändert seit 08.08."-Aussage war zum Zeitpunkt des Schreibens
  bereits falsch, nicht erst durch Zeitablauf. Aktueller Stand: Rang 2 ist
  jetzt **2 Tage 6 Stunden** still (nicht 10.8, wie die alte Zahl
  fortgeschrieben hätte suggeriert). Alle übrigen 10 Accounts mit
  `user_progress`-Zeilen sind unverändert seit ≥ 2026-06-22 still (≥ 58
  Tage), 1 Account hat nie eine `user_progress`-Zeile. **Auffällig:** drei
  dieser 10 Accounts (Rang 3–5) wurden alle innerhalb von 30 Stunden um den
  21./22.06. still — 3 Tage bevor der Cron am 25.06. deaktiviert wurde, nicht
  danach. Der Cron-Ausfall erklärt also, warum niemand zurückkommt, nicht
  zwingend das ursprüngliche Verstummen dieser drei.
- **Security-Fix-Skript gegen aktuellen Repo-Stand geprüft (19.08.), noch
  unverändert gültig:** die drei Schema-Dateien, die die 7 betroffenen
  Functions definieren (`zicards-admin-schema.sql`,
  `zicards-spaced-repetition.sql`, `zicards-final-schema.sql`,
  `supabase/mnemonics-schema.sql`), haben seit ihrem letzten Commit
  (07.06., „make Data-API grants explicit") keinen Diff — insbesondere
  keinen zwischen dem Skript-Erstellungs-Commit `3361c77` und heute. Die
  Vorabprüfung in `apply-security-fix.sh` (unqualifizierte
  Objektreferenzen) sollte also weiterhin sauber durchlaufen. **Nicht
  geprüft werden kann von hier**, ob der tatsächliche Function-Body in Prod
  exakt dem Repo-Stand entspricht — dieses Repo hat weiterhin keine
  Postgres-Connection (nur REST-Keys in `.env`), das prüft `apply-security-
  fix.sh` selbst als Schritt 1–2, wenn Ben es mit seinem Passwort startet.
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
- **Login auf mobilem Viewport geprüft** (13.08., Anlass: Bens Antwort an Karl
  Zarhuber 12.08. 10:02 verweist explizit auf Tablet-Zugriff über
  `https://zicards.moerzinger.eu` — Aussage sollte stimmen). Nur Code-Review
  möglich, **kein Live-Screenshot-Test**: Chrome-Erweiterung war nicht
  verbunden (`tabs_context_mcp` → „Browser extension is not connected"), von
  hier keine echte Geräte-/Viewport-Emulation. Befund aus dem Code:
  `index.html` hat `<meta name="viewport" content="width=device-width,
  initial-scale=1.0">`; beide Inputs in `AuthForm.jsx` sind `w-full` mit
  explizitem `style={{ fontSize: '16px' }}` (verhindert den klassischen
  iOS-Bug, dass Safari beim Fokussieren eines Inputs mit < 16px hineinzoomt);
  kein fixer Pixel-Wert im Login-Pfad, der auf schmalen Screens überlaufen
  könnte (`grep` auf `w-[`, `min-w-[`, `position: fixed` traf nur
  `AdminUserDetail.jsx`/`SentenceQuizCard.jsx`, beide hinter Login, nicht auf
  `/login` selbst); der schwebende `FeedbackButton` (`fixed bottom-5 right-4`)
  blendet sich über `inputFocused` (`focusin`/`focusout`-Listener auf
  INPUT/TEXTAREA) selbst aus, sobald ein Feld fokussiert ist — überlappt
  also nicht mit der virtuellen Tastatur oder dem Anmelden-Button. Kein Bug
  gefunden, aber **unverifiziert bleibt das tatsächliche Rendering** auf
  einem echten mobilen Browser — nächste Session mit verbundener
  Chrome-Erweiterung nachholen, bevor die Aussage an Karl als vollständig
  bestätigt gilt.

## prod ≠ live
- **2 von 13 Accounts aktiv, neu durchgezählt (19.08., direkte
  `user_progress`-Abfrage über alle 1368 Zeilen, paginiert, 12 distinkte
  Accounts):** Rang 1 weiter regelmäßig aktiv (zuletzt 18.08. 18:03 UTC).
  Rang 2 — bisher als „seit 08.08. still" geführt — hatte tatsächlich am
  17.08. 03:00–03:07 UTC eine echte Lernsession; die „8.8 Tage still"-Zahl
  vom 17.08. war beim Schreiben bereits überholt. Aktuell: Rang 2 ist **2
  Tage 6 Stunden** still, nicht 10.8. Details + wahrscheinliche Ursache
  siehe Fund oben unter „Was live/fertig".
- **Cron-Job „daily-reminders" (jobid 6) — jetzt eine begründete Vermutung
  statt eines offenen Unbekannten:** die Vault-Page `zicards` dokumentiert
  bereits „DISABLED 2026-06-25 (`active = false`) für die Sommerpause,
  Re-Enable via `cron.alter_job(6, active := true)` at next course start" —
  dieser Re-Enable ist beim Wiederanlauf 05.08. anscheinend nicht passiert.
  Per REST bestätigt (19.08.): `user_settings.last_reminder_sent` aller 4
  `reminder_enabled=true`-Nutzer steht unverändert auf `2026-06-25T07:00`,
  obwohl alle 4 aktuell fällige Karten haben. Sehr wahrscheinlich der
  Haupttreiber für die stillen Accounts. Fix: `select cron.alter_job(6,
  active := true);` — Schreiboperation, Ben-Punkt (SQL-Editor). Direkter
  Blick auf `cron.job.active` bleibt von hier unmöglich (Dashboard/
  Management-API nötig).
- **Supabase-Security-Fix bereit, aber nicht angewendet — Skript heute
  (19.08.) gegen Repo-Stand geprüft, gilt unverändert:** `supabase/security-
  search-path-fix-2026-08-12.sql` liegt weiterhin unverändert im Repo, die
  vier Schema-Dateien, die die 7 betroffenen Functions definieren, haben
  seit ihrem letzten Commit (07.06.) keinen Diff — die Vorabprüfung im
  Skript sollte weiterhin sauber durchlaufen. **Weiterhin nicht
  gegenprüfbar:** ob der Prod-Function-Body exakt dem Repo entspricht und ob
  der Supabase-Advisor exakt diese 7 Punkte meldet oder noch mehr — kein
  Dashboard-/DB-Zugang von hier. Braucht Bens Supabase-SQL-Editor-Zugang.
- **Jetzt 2 Commits unpushed, nicht mehr 1:** `f776e0a` (Handover 12.08.) UND
  `d40b55d` (Handover 13.08.) liegen lokal, nicht auf `origin/main` —
  gewachsen, weil die 13.08.-Session bewusst ebenfalls nicht gepusht hat.
  Beide reine Doku-Commits, kein Code-Risiko, aber der Rückstand wächst jeden
  Tag ohne Push-Erlaubnis um einen weiteren Commit. Diese Session hat aus dem
  gleichen Grund (kein Deploy erlaubt) wieder nicht gepusht — siehe `fuer_ben`.
- **Keine belastbare „Fehlerrate" messbar.** Unverändert — kein
  Error-Tracking im Projekt, einzige Proxy-Signale App/Supabase-Status und
  Feedback-Knopf.
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (17.08.) unverändert: 5 unused
  files, 1 unused dep (`pg`), 9 unused exports — identisch zu 11.–13.08.,
  keine neue Abweichung.
- `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
  (Komplexität 42) weiterhin laut (veraltetem) Cache die größten
  Komplexitäts-Ausreißer — Zahlen sind ~4 Monate alt, nicht neu erhoben.
- **NEU (18.08.) — Sechs-Wochen-Vorausschau, „was fällt um": fehlender
  INSERT-Grant auf `public.feedback` gefunden.** Geprüft: alle drei TLS-Zerti­
  fikate (zicards.moerzinger.eu bis 27.10.26, zicards.vercel.app + Supabase
  bis 26.09.26) sind plattformseitig automatisch verwaltet (Vercel/Let's
  Encrypt bzw. Supabase-managed) — kein manueller Schritt nötig, kein Risiko.
  `npm audit` weiterhin 0, keine Dependency mit bekannter Lücke. Der eine
  echte Fund: `feedback.sql` legt die RLS-Policy „users can insert own
  feedback" (FOR INSERT TO authenticated) an, aber **kein Grant begleitet
  sie** — weder dort noch in `feedback-resolved-2026-05-31.sql` (nur SELECT,
  UPDATE) noch in `grants-2026-05-28-api-default-change.sql` (die Tabelle
  fehlt in der Liste komplett, nur 7 der 8 Tabellen sind abgedeckt). Heute
  unsichtbar, weil Supabase das implizite Data-API-Privileg erst am
  **30.10.2026** entfernt (CLAUDE.md) — bis dahin verdeckt das Implizit-Recht
  die Lücke. Ab dem Cutover würde **der Feedback-Knopf** — laut Projekt-Profil
  „die wichtigste Zahl" dieses Projekts — für alle eingeloggten Nutzer mit
  401/permission denied fehlschlagen, ohne dass sich Code oder RLS geändert
  hätten. Fix vorbereitet und geprüft (idempotent, ein einzeiliger `GRANT
  INSERT`): `supabase/feedback-insert-grant-fix-2026-08-18.sql`. **Nicht
  gegen Prod ausgeführt** — gleicher Grund wie beim Security-Fix (kein
  DB-Schreibzugriff aus diesem Repo), braucht Bens SQL-Editor-Zugang. Am
  besten in derselben Konsolen-Session wie
  `security-search-path-fix-2026-08-12.sql` erledigen.

## Aus dem globalen Check-in (2026-08-19)

- Bens Woche ist ab Donnerstagabend zu (21.-23.08. privat, 24.08. Workshop Heidenheim, 25.08. Rückreise), und zicards steht diese Woche hinter dem Voith-Workshop an. → Die drei Punkte, die nur Ben in der Konsole erledigen kann (Security-Fix, Feedback-GRANT, Reaktivierung des Erinnerungs-Cron), gehören in eine gemeinsame Session vor Donnerstagabend; sonst liegen sie bis zum 25.08. [Quelle: Kalender]

## Offene Punkte (nächste Session)
- [ ] **Supabase-Security-Fix ausführen:**
      `supabase/security-search-path-fix-2026-08-12.sql` im SQL-Editor laufen
      lassen (Skript-Voraussetzungen heute 19.08. gegengeprüft, weiterhin
      gültig), danach im Security-Advisor „Rerun linter". Ben.
- [ ] **Fehlenden Feedback-INSERT-Grant nachtragen:**
      `supabase/feedback-insert-grant-fix-2026-08-18.sql` im SQL-Editor
      laufen lassen (ein `GRANT INSERT`, idempotent). Ohne das bricht der
      Feedback-Knopf am 30.10.2026 (Supabase-Cutover) für alle Nutzer still.
      Nicht akut, aber am besten gleich mit dem Security-Fix oben in derselben
      Konsolen-Session erledigen. Ben.
- [ ] **NEU (19.08.) — Cron-Job „daily-reminders" (jobid 6) reaktivieren:**
      `select cron.alter_job(6, active := true);` im SQL-Editor. Sehr
      wahrscheinlich der Grund, warum inaktive Accounts nicht zurückkommen —
      seit dem Sommerpause-Mute am 25.06. ist keine Erinnerungsmail mehr
      raus (Indizienkette siehe „prod ≠ live" oben), obwohl alle 4
      Reminder-Nutzer aktuell fällige Karten haben. Dritter Punkt für
      dieselbe Konsolen-Session wie die zwei oben. Ben.
- [ ] **Weiter beobachten: 2/13 aktive Accounts.** Rang 1 weiter aktiv
      (zuletzt 18.08.), Rang 2 jetzt **2 Tage 6 Stunden** still (nicht mehr
      „8.8 Tage" — die alte Zahl war bereits am 17.08. überholt, siehe
      „prod ≠ live"). Kein akuter Fehler (App+Backend beide 200). Erwartung:
      wenn der Cron oben reaktiviert wird, sollte sich die Rückkehr-Rate der
      10 langfristig stillen Accounts beobachten lassen — nächste Session
      gegenprüfen, ob nach Reaktivierung wieder `last_reminder_sent`-Werte
      neuer als 25.06. auftauchen.
- [x] **Commits pushen** — erledigt (extern, außerhalb dieser Session): 18.08.
      zeigt `git log origin/main..HEAD` leer, `main` liegt exakt auf
      `[origin/main] 3361c77`. Kein Handlungsbedarf mehr.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Unverändert — Ben entscheiden
      lassen, ob der Aufwand lohnt.
- [ ] `VITE_COURSE_CODE` aus Vercel-Env entfernen (unused, laut Vault seit
      längerem bekannt; `rg` im Repo bestätigt 0 Code-Referenzen) — braucht
      Vercel-Dashboard-Zugang, daher Ben.
- [ ] pi-lens `knip.json` reparieren — unverändert blockiert (Cache wird vom
      externen Plugin-Hook geschrieben, kein Regenerate-Weg aus diesem Repo).
- [ ] pi-lens-Cache insgesamt erneuern (Stand 13./14.04., ~4 Monate alt) —
      gleiche Ursache wie oben.
- [x] **Mobiler Viewport-Test für `/login`** — durch Karls eigene Bestätigung
      (13.08., „läuft gut nun auch auf dem Tablet") erledigt; kein separater
      Browser-Test mehr nötig.
- [x] **„Falls der wartende Nutzer neu registriert hat" (SMTP-Frage)** —
      gegenstandslos: Karl ist laut Mailkontext bestätigter Bestandsnutzer,
      keine Neuregistrierung.
- [x] `UnifiedSession.jsx:165` eslint-disable-Warnung geprüft (17.08.) — kein
      totes Aufräumen möglich, siehe „Was live / fertig". Kein Fix, nur
      Investigation abgeschlossen.
- [x] Lint-Fix `f1389e2` push-Status erneut bestätigt (12.08.): liegt auf
      `origin/main`, `npm run lint` weiterhin 0/11.
- [x] HANDOVER.md-Lücke der 11.08.-Session geschlossen — heute committet
      (siehe „Was live / fertig").

## Session-Log (letzte 3)
- **2026-08-19** — Projekt-Check-in (Bens Woche ab 20.08. abends zu:
  Fr–So Junggesellenabschied, Mo 24.08. Voith-Workshop Heidenheim, Di 25.08.
  Rückreise — zicards bekommt vor dem 25.08. keine Ben-Zeit mehr). Health
  erneut 200/200/200 (App × 2, Supabase), Tests 167/167, Lint 0/11,
  `npm audit` 0, keine unpushed Commits. Feedback weiter 0 offen von 41,
  letzter Eintrag unverändert 25.05. **Hauptfund: Cron-Root-Cause.**
  Vault-Page `zicards` gegengelesen — dokumentiert bereits, dass „daily-
  reminders" (jobid 6) am 25.06. für die Sommerpause deaktiviert wurde und
  beim Wiederanlauf reaktiviert werden sollte; das ist beim Wiederanlauf
  05.08. offenbar nicht passiert. Per REST bestätigt: `last_reminder_sent`
  aller 4 Reminder-Nutzer steht seit 25.06. still, obwohl alle 4 aktuell
  fällige Karten haben (137/25/84/172) — starke Indizienkette, dass seit
  fast 8 Wochen keine Erinnerungsmail rausging. Wahrscheinlichster Grund für
  die stillen Accounts. Fix ein Einzeiler (`cron.alter_job`), aber
  Schreibzugriff → Ben-Punkt, gebündelt mit Security- und Feedback-Grant-Fix
  vorgeschlagen. **Account-Aktivität neu durchgezählt:** die „8.8 Tage
  still"-Zahl vom 17.08. war bereits beim Schreiben überholt (Rang-2-Account
  hatte am 17.08. früh morgens eine echte Session, Stunden vor dem
  Handover-Commit) — aktuell 2 Tage 6 Stunden, nicht 10.8. **Security-Fix-
  Skript gegen Repo-Stand geprüft:** die 4 Schema-Dateien, die die 7
  betroffenen Functions definieren, unverändert seit 07.06. — Vorabprüfung
  im Skript sollte weiterhin sauber durchlaufen; Live-Function-Body in Prod
  bleibt von hier unverifizierbar (kein DB-Zugang im Repo, by design).
  `npx knip` unverändert (5/1/9), pi-lens-Cache weiterhin Stand 13./14.04.
- **2026-08-18** — Projekt-Check-in (Bens Arbeitsfenster diese Woche endet
  Do 20.08. abends, danach privat/Workshop weg — kaum Ben-Zeit). Health
  erneut 200/200/200 (App × 2, Supabase), Tests 167/167, Lint 0/11, Build
  sauber (315ms), `npm audit` 0 (auch `--omit=dev`). Feedback weiter 0 offen.
  **Vormals „2 unpushed Commits" ist überholt:** Messung zeigt `main` exakt
  auf `origin/main` (3361c77) — Widerspruch zur bisherigen HANDOVER-Notiz
  aufgelöst, Messung gewinnt, kein Push mehr nötig. **Sechs-Wochen-
  Vorausschau durchgeführt** (Auftrag: was läuft ab oder kippt um): alle drei
  TLS-Zertifikate automatisch verwaltet und unkritisch (nächste Erneuerung
  26.09./27.10., beide plattformseitig automatisch); `npm outdated` zeigt nur
  Minor/Patch-Rückstände, keine Sicherheitslücke. **Echter Fund:** `public.
  feedback` hat eine INSERT-RLS-Policy für `authenticated`, aber nie einen
  begleitenden `GRANT INSERT` — bis 30.10.2026 (Supabase-Cutover des
  impliziten Data-API-Privilegs) unsichtbar, danach würde der Feedback-Knopf
  für alle Nutzer 401 zurückgeben. Fix geschrieben und geprüft, nicht gegen
  Prod ausgeführt (kein DB-Schreibzugriff aus diesem Repo) —
  `supabase/feedback-insert-grant-fix-2026-08-18.sql`, Ben-Punkt, am besten
  gebündelt mit dem bereits wartenden Security-Fix.
- **2026-08-17** — Projekt-Check-in (Bens Arbeitsfenster diese Woche endet
  Do 20.08. abends, Fr–So Junggesellenabschied, danach Voith-Workshop 24.08.
  — kaum Ben-Zeit für zicards diese Woche). Health erneut 200/200/200 (App ×
  2, Supabase, inkl. `/login`-Deep-Link direkt), Tests 167/167, Lint 0/11,
  Build sauber (~370ms), `npm audit` 0. Feedback weiter 0 offen, 41 gesamt
  unverändert. **Karl Zarhubers Bestätigung (13.08., „läuft gut nun auch auf
  dem Tablet") schließt den offenen Mobil-Viewport-Test ab** — echte
  Nutzerbestätigung statt synthetischem Browser-Test, auch die daran
  hängende SMTP-Frage damit gegenstandslos (Bestandsnutzer, keine
  Neuregistrierung). **Eslint-disable-Fund untersucht statt blind entfernt:**
  `UnifiedSession.jsx:165` sah nach totem Code aus („unused directive"),
  probeweise entfernt löste aber 13 `react-hooks/refs`-Fehler + weitere
  Warnungen aus (Ref-Zugriff während Render im `useMemo`) — sofort
  zurückgesetzt, `git diff` bestätigt leer, Lint wieder 0/11. Account-
  Aktivität mit frischer Vollabfrage nachgerechnet (1368 Zeilen, 12 distinkte
  Accounts): ein Account heute (17.08.) aktiv, der zweite jetzt 8.8 Tage
  still (vorher 5). **Unpushed-Rückstand wächst:** jetzt 2 Commits
  (`f776e0a`, `d40b55d`), diese Session hat aus Deploy-Verbot wieder nicht
  gepusht. Vault-Page `zicards` gegengelesen (Stand laut Metadaten 10.08.,
  nicht 13.07. wie im Profil vermerkt) — Kerninhalte (2/13 Accounts, Cron
  ungeklärt, offener `VITE_COURSE_CODE`) decken sich weiterhin mit der
  Realität, aber der Supabase-Security-Fund (12.08.) und Karls
  Tablet-Bestätigung (13.08.) fehlen dort noch — Vorschlag siehe
  `vault_vorschlag`. `npx knip` direkt unverändert (5/1/9), pi-lens-Cache
  weiterhin Stand 13./14.04.
