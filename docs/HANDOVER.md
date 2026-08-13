# zicards — Handover

## Was live / fertig
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 2026-08-13, auch `/login` direkt
  auf beiden Domains → 200 — SPA-Rewrite in `vercel.json` funktioniert für
  Deep-Links).
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 2026-08-13). Login, Fortschritt speichern, Feedback-Knopf funktionieren.
- `npm audit` weiterhin 0 Vulnerabilities (13.08.). **`git log origin/main..HEAD`
  ist NICHT mehr leer** — 1 Commit unpushed (`f776e0a`, siehe „prod ≠ live"),
  seit dem 12.08.-Commit selbst. Diese Session hat lokal weiter committet
  (HANDOVER.md-Update), aber bewusst nicht gepusht — kein Deploy in dieser
  Session erlaubt.
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
- **2 von 13 Accounts aktiv, Stand jetzt gegengerechnet (13.08., direkte
  `user_progress`-Abfrage statt nur Handover-Übernahme):** `055164cb…` weiter
  aktiv, letzter Eintrag 12.08. 13:11 UTC. `e1554433…` unverändert bei
  08.08. 13:01 UTC — jetzt **5 Tage** ohne Aktivität (Handover gestern noch
  „4 Tage"). Distinct-Count über die volle Tabelle (1368 Zeilen, paginiert)
  bestätigt: 12 Accounts haben je überhaupt Einträge in `user_progress`, kein
  dritter neu dazugekommen (`ba343729…` weiterhin Alt-Login vom 22.06.).
  Kein akuter Fehler, nur die Beobachtung fortgeschrieben.
- **Cron-Job „daily-reminders" (jobid 6) — Status weiterhin nicht von hier
  verifizierbar.** Unverändert seit 07.08., braucht Supabase-Dashboard-Zugang
  oder Management-API-Token.
- **Supabase-Security-Fix bereit, aber nicht angewendet — Befund heute
  gegengeprüft, gilt unverändert:** `supabase/security-search-path-fix-
  2026-08-12.sql` liegt weiterhin unverändert im Repo, `git log --since
  2026-08-12 -- supabase/` zeigt außer dem Handover-Commit selbst keine
  Änderung an den betroffenen 7 Functions — der Befund vom 12.08. (5×
  `SECURITY DEFINER` ohne `search_path`, 2 Trigger-Functions) ist nicht
  veraltet. **Weiterhin nicht gegenprüfbar:** ob der Supabase-Advisor exakt
  diese 7 Punkte meldet oder noch mehr — kein Dashboard-Zugang von hier, das
  bleibt eine Vermutung aus Repo-Analyse. Braucht Bens Supabase-SQL-Editor-
  Zugang.
- **1 Commit unpushed:** `f776e0a` (Handover-Commit der 12.08.-Session) liegt
  seit gestern lokal, nicht auf `origin/main`. Diese Session hat bewusst
  nicht gepusht (Session-Vorgabe: kein Deploy) — sonst identischer Fehler wie
  der HANDOVER-Lücke-Fund vom 12.08., nur einen Schritt weiter im Pipeline
  (committet, aber nicht deployed). Push ist reine Doku-Änderung, kein
  Risiko — nächste Session mit Deploy-Erlaubnis nachholen.
- **Keine belastbare „Fehlerrate" messbar.** Unverändert — kein
  Error-Tracking im Projekt, einzige Proxy-Signale App/Supabase-Status und
  Feedback-Knopf.
- pi-lens-Cache weiterhin auf Stand 13./14.04. (`.pi-lens/metrics-history.json`,
  `jscpd.json`, `turn-end-findings-last.json`), `knip.json`-Wrapper weiterhin
  `success:false`. Direkter `npx knip`-Lauf (13.08.) unverändert: 5 unused
  files, 1 unused dep (`pg`), 9 unused exports — identisch zu 11./12.08.,
  keine neue Abweichung.
- `useProgress.js` (MI 30.5, kognitive Komplexität 85) und `AdminDashboard.jsx`
  (Komplexität 42) weiterhin laut (veraltetem) Cache die größten
  Komplexitäts-Ausreißer — Zahlen sind ~4 Monate alt, nicht neu erhoben.

## Aus dem globalen Check-in (2026-08-13)
- Bens Kapazität: ab heute Abend weg — Sommerlager 13.–16.08., Kiten bis
  17.08. 12:30, danach gehört die Woche dem Voith-Workshop am 24.08. Was
  heute nicht läuft, läuft fünf Tage nicht. Entsprechend wurde in dieser
  Session jeder Punkt bearbeitet, der ohne Ben ging.
- Supabase-Security-Mail (11.08. 17:21) — Befund heute gegengeprüft, gilt
  unverändert (siehe „prod ≠ live"). Ausführung bleibt Ben-Punkt.
- Karl Zarhuber (Tablet-Login-Frage) hat Bens Antwort vom 12.08. 10:02
  bekommen (`https://zicards.moerzinger.eu`, E-Mail+Passwort, keine eigene
  App) — Punkt ist erledigt. Diese Session hat zusätzlich geprüft, ob die
  Auskunft auf dem mobilen Viewport tatsächlich stimmt (siehe „Was
  live/fertig") — Code-Review ohne Befund, aber ohne Live-Browser-Test.

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
- [ ] **Weiter beobachten: 2/13 aktive Accounts.** `055164cb…` weiter aktiv
      (zuletzt 12.08. 13:11 UTC), `e1554433…` jetzt **5 Tage** still (seit
      08.08. 13:01 UTC). Kein akuter Fehler (App+Backend beide 200), aber
      Rückkehr-Rate bleibt weit unter den ≥3 positiven Mail-Antworten. Kein
      neuer Handlungsbedarf, nur weiter beobachten.
- [ ] **`f776e0a` pushen** (Handover-Commit 12.08., reine Doku, kein
      Risiko) — diese Session hat bewusst nicht gepusht (kein Deploy erlaubt).
      Nächste Session mit Deploy-Erlaubnis nachholen, sonst bleibt der
      Live-Stand des Handovers dauerhaft hinter dem Repo zurück.
- [ ] **Mobiler Viewport-Test für `/login` mit echtem Browser nachholen**
      (13.08. nur Code-Review möglich, Chrome-Erweiterung war nicht
      verbunden) — bestätigt/widerlegt, dass Bens Auskunft an Karl Zarhuber
      auch am Tablet sauber funktioniert.
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
- [x] Supabase-Security-Befund gegengeprüft (13.08.) — Repo-Zustand
      unverändert, Fix weiterhin unangewendet, Befund gilt weiter.
- [x] Mobiler Viewport-Login per Code-Review geprüft (13.08.) — keine
      Auffälligkeit, Live-Test mit Browser bleibt offen (siehe oben).

## Session-Log (letzte 3)
- **2026-08-13** — Projekt-Check-in (Ben ab heute Abend bis 17.08. weg —
  Sommerlager/Kiten, danach Voith-Workshop 24.08.). Health erneut 200/200/200
  (App × 2, Supabase, inkl. `/login`-Deep-Link direkt), Tests 167/167, Lint
  0/11, Build sauber, `npm audit` 0. Feedback weiter 0 offen, 41 gesamt
  unverändert. **Zwei Befunde aus dem globalen Kontext gegengeprüft statt nur
  übernommen:** (1) Supabase-Security-Fund — Repo-Zustand erneut verifiziert
  (Fix-Datei unverändert, keine Function-Änderung seit 12.08.), Befund gilt
  unverändert, Ausführung bleibt Ben-Punkt. (2) Mobiler Viewport-Login (Anlass:
  Bens Antwort an Karl Zarhuber verweist aufs Tablet) — nur Code-Review
  möglich (Chrome-Erweiterung nicht verbunden), keine Auffälligkeit gefunden
  (Viewport-Meta korrekt, 16px-Inputs gegen iOS-Zoom-Bug, Feedback-Button
  blendet sich bei Input-Fokus selbst aus), Live-Test bleibt offen.
  Account-Aktivität mit frischer Direktabfrage nachgerechnet (nicht nur aus
  dem Handover übernommen): `055164cb…` weiter aktiv (12.08. 13:11 UTC),
  `e1554433…` jetzt 5 Tage still (vorher 4). **Neu gefunden:** 1 Commit
  (`f776e0a`, Handover 12.08.) liegt seit gestern unpushed — diese Session
  hat bewusst nicht gepusht (kein Deploy erlaubt), Push ist Doku-only und
  risikofrei, nächste Session nachholen. `npx knip` direkt unverändert
  (5/1/9), pi-lens-Cache weiterhin Stand 13./14.04.
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
