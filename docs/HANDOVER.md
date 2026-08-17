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
- **2 von 13 Accounts aktiv, Stand jetzt gegengerechnet (17.08., direkte
  `user_progress`-Abfrage über alle 1368 Zeilen, paginiert):** ein Account war
  heute (17.08., vor rund 5 Stunden) aktiv — weiter regelmäßig dabei. Der
  zweite zuvor aktive Account ist unverändert seit 08.08. 13:01 UTC still,
  jetzt **8.8 Tage** ohne Aktivität (13.08. noch „5 Tage"). Weiterhin 12
  Accounts mit je überhaupt Einträgen in `user_progress`, kein dritter neu
  dazugekommen. Kein akuter Fehler, nur die Beobachtung fortgeschrieben.
- **Cron-Job „daily-reminders" (jobid 6) — Status weiterhin nicht von hier
  verifizierbar.** Unverändert seit 07.08., braucht Supabase-Dashboard-Zugang
  oder Management-API-Token.
- **Supabase-Security-Fix bereit, aber nicht angewendet — Befund heute
  gegengeprüft, gilt unverändert:** `supabase/security-search-path-fix-
  2026-08-12.sql` liegt weiterhin unverändert im Repo, keine Änderung an den
  betroffenen 7 Functions seit 12.08. **Weiterhin nicht gegenprüfbar:** ob der
  Supabase-Advisor exakt diese 7 Punkte meldet oder noch mehr — kein
  Dashboard-Zugang von hier. Braucht Bens Supabase-SQL-Editor-Zugang.
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

## Aus dem globalen Check-in (2026-08-17)
- Bens Kapazität diese Woche: heute (Mo) geschäftlich frei, aber drei
  Nachmittags-Termine plus Ganztags-Erreichbarkeitszusage an einen Partner.
  Di–Do mit Terminen verplant, Fr–So Junggesellenabschied (nicht verfügbar),
  Mo 24.08. Ganztagsworkshop Heidenheim. **Bens letztes Arbeitsfenster diese
  Woche endet Do 20.08. abends, Großteil davon geht an ein Kundenprojekt** —
  zicards bekommt diese Woche fast keine Ben-Zeit. Entsprechend wurde in
  dieser Session alles bearbeitet, was ohne Ben ging, und nur das nach unten
  gereicht, was wirklich seine Entscheidung braucht.
- Karl Zarhuber (Tablet-Login-Frage) hat am 13.08. bestätigt: „zicards läuft
  gut nun auch auf dem Tablet." Punkt vollständig erledigt — löst auch den
  offenen „Mobiler Viewport-Test"-Punkt aus der 13.08.-Session ab (siehe „Was
  live/fertig").
- Keine weiteren zicards-Signale im Posteingang der letzten vier Tage.

## Offene Punkte (nächste Session)
- [ ] **Supabase-Security-Fix ausführen:**
      `supabase/security-search-path-fix-2026-08-12.sql` im SQL-Editor laufen
      lassen, danach im Security-Advisor „Rerun linter" — bestätigt, ob damit
      alle gemeldeten Punkte erledigt sind (von hier nicht gegenprüfbar ohne
      Advisor-Zugang). Ben.
- [ ] **Cron-Job „daily-reminders" (jobid 6) reaktiviert?** Weiterhin nur über
      Supabase-Dashboard/Management-API-Token prüfbar. Unverändert seit 07.08.
      Ben.
- [ ] **Weiter beobachten: 2/13 aktive Accounts.** Ein Account weiter aktiv
      (zuletzt heute, 17.08.), der zweite jetzt **8.8 Tage** still (seit
      08.08. 13:01 UTC). Kein akuter Fehler (App+Backend beide 200), aber
      Rückkehr-Rate bleibt weit unter den ≥3 positiven Mail-Antworten. Kein
      neuer Handlungsbedarf, nur weiter beobachten.
- [ ] **2 Commits pushen** (`f776e0a` 12.08., `d40b55d` 13.08. — reine Doku,
      kein Code-Risiko) — diese Session hat wieder bewusst nicht gepusht (kein
      Deploy erlaubt). Braucht nur `git push`, sobald Ben/eine Session mit
      Deploy-Erlaubnis Zeit hat — sonst wächst der Rückstand täglich weiter.
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
- **2026-08-13** — Projekt-Check-in (Ben ab heute Abend bis 17.08. weg —
  Sommerlager/Kiten, danach Voith-Workshop 24.08.). Health erneut 200/200/200
  (App × 2, Supabase, inkl. `/login`-Deep-Link direkt), Tests 167/167, Lint
  0/11, Build sauber, `npm audit` 0. Feedback weiter 0 offen, 41 gesamt
  unverändert. **Zwei Befunde aus dem globalen Kontext gegengeprüft statt nur
  übernommen:** (1) Supabase-Security-Fund — Repo-Zustand erneut verifiziert
  (Fix-Datei unverändert, keine Function-Änderung seit 12.08.), Befund gilt
  unverändert, Ausführung bleibt Ben-Punkt. (2) Mobiler Viewport-Login (Anlass:
  Bens Antwort an Karl Zarhuber verweist aufs Tablet) — nur Code-Review
  möglich (Chrome-Erweiterung nicht verbunden), keine Auffälligkeit gefunden.
  Account-Aktivität mit frischer Direktabfrage nachgerechnet: ein Account
  weiter aktiv (12.08. 13:11 UTC), der zweite jetzt 5 Tage still (vorher 4).
  **Neu gefunden:** 1 Commit (`f776e0a`, Handover 12.08.) liegt seit gestern
  unpushed — bewusst nicht gepusht (kein Deploy erlaubt). `npx knip` direkt
  unverändert (5/1/9), pi-lens-Cache weiterhin Stand 13./14.04.
- **2026-08-12** — Projekt-Check-in. Health erneut 200/200/200 (App × 2,
  Supabase, inkl. `/login`-Deep-Link direkt), Tests 167/167, Lint 0/11, Build
  sauber, `npm audit` 0. Feedback weiter 0 offen, 41 gesamt unverändert.
  **Zwei Supabase-Signale aus dem globalen Check-in abgearbeitet:** (1)
  Security-Advisor-Mail — Ursache im Repo gefunden (7 Functions ohne
  `search_path`, 5 davon `SECURITY DEFINER` = echte Rechteausweitungs-Lücke),
  Fix-Migration geschrieben und geprüft, CLAUDE.md um die Regel ergänzt,
  Anwendung braucht Bens SQL-Editor-Zugang. (2) Tablet-Login-Nachfrage eines
  Nutzers — Code geprüft, die App hat keinen Magic-Link, nur E-Mail/Passwort;
  kein Bug gefunden, offene Frage war SMTP-Zustellung der
  Registrierungs-Bestätigung. Account-Aktivität: 2/13 weiterhin, ein Account
  nach 2 Tagen Stillstand wieder aktiv, der zweite jetzt 4 Tage still.
  Housekeeping: HANDOVER.md der 11.08.-Session war nie committet — heute
  nachgeholt. pi-lens-Cache weiterhin Stand 13./14.04., `npx knip` direkt
  unverändert (5/1/9).
