# zicards — Handover

_Stand: 2026-08-29 (Check-in)._

## Was live / fertig
- **21.08. (zweite Session) — die drei offenen Konsolen-Punkte sind ausgeführt
  und gemessen nachgewiesen.** Die bisherige Handover-Prämisse „Ben, braucht das
  DB-Passwort“ war falsch: die Statements laufen über die Supabase Management API
  (Token aus der macOS-Keychain der Supabase CLI, Projekt-Ref
  `obpgcttudogwfobjwjgk`), ganz ohne DB-Passwort.
  Neu angelegt:
  - `supabase/apply-open-sql-2026-08-21.sh` — ändernd, idempotent, je Schritt
    PRÜFEN → ÄNDERN → BEWEISEN, bricht bei einem echten Blocker ab.
  - `supabase/verify-open-sql-2026-08-21.sh` — rein lesend, ändert nichts,
    Exit-Code 1 sobald ein Punkt nicht sitzt.
  Beide startet **Ben selbst** (`! bash supabase/…`), weil der Auto-Mode-
  Klassifikator dem Agenten den Keychain-Zugriff verweigert (dreimal geblockt,
  kein Workaround versucht). Der Token verlässt Bens Rechner dabei nicht und
  wird von den Skripten nie ausgegeben.
  **Gemessene Beweise aus dem Lauf vom 21.08.:**
  (a) alle 7 `public`-Functions tragen `proconfig = search_path=""`
      (`is_admin`, `admin_get_users`, `admin_get_user_chars`,
      `admin_get_user_sentences`, `get_due_counts`, `update_updated_at`,
      `mnemonics_set_updated_at`);
  (b) `authenticated` hat auf `public.feedback` jetzt INSERT (neben SELECT/UPDATE);
  (c) `cron.job` jobid 6 `daily-reminders` (`0 7 * * *`) steht auf `active = true`.
  Rauchtest direkt nach der Änderung: `public.is_admin()` → `false` ohne Fehler,
  `select count(*) from public.characters` → 172. Der Nachkontroll-Lauf des
  Verify-Skripts meldete „alle drei Punkte nachgewiesen“.
- **21.08. — Ben hat das Verify-Skript selbst repariert (`f2bb970`), nicht der
  Agent.** Die erste Fassung suchte in `pg_proc.proconfig` nach `search_path=`,
  Postgres legt `SET search_path = ''` aber als `search_path=""` ab — dadurch
  meldete das Skript alle 7 Functions fälschlich als ungefixt, obwohl der Fix
  saß. Der Agent hatte parallel eine eigene, **schwächere** Korrektur
  eingebaut (`left(cfg.v,12) = 'search_path='`), die auch ein *nicht* leeres
  `search_path=public` durchgewunken hätte; die ist zugunsten von Bens
  strengerer Fassung wieder entfernt worden. Vom Agenten bleibt an der Datei
  nur die neue RLS-Kontrolle (BEWEIS 2b, +23 Zeilen).
- **21.08. — `cron.job_run_details` erklärt die stillen Reminder abschließend:**
  die letzten Läufe von `daily-reminders` waren 21.–25.06.2026, **alle
  `succeeded`**. Der Job ist also nicht fehlgeschlagen, sondern war seit dem
  25.06. schlicht abgeschaltet — das deckt sich mit dem seit 13.08. neunmal
  unverändert gemessenen `last_reminder_sent = 2026-06-25T07:00`.
- **21.08. — Fehlalarm der Vorprüfung gefunden und behoben (nicht umgangen):**
  der Textcheck auf unqualifizierte Objektreferenzen meldete zuerst 8 Treffer in
  `admin_get_users()` (`char_days`, `sent_days`, `all_days`, `user_list`,
  `totals`, `char_stats`, `sent_stats`, `day_stats`) und brach ab. Alle acht sind
  CTE-Namen aus dem eigenen `WITH`-Block, gegengeprüft in
  `zicards-admin-schema.sql:49-125`; die echten Relationen dort sind durchgehend
  qualifiziert (`auth.users`, `public.user_progress`, `public.sentence_progress`,
  `public.characters`, `public.sentences`). Die Prüfung zieht jetzt CTE-Namen ab
  und wertet einen Namen nur als Blocker, wenn er in `pg_class` als Relation
  wirklich existiert; sie zeigt die verworfenen Rohtreffer samt Begründung mit an.
- **21.08. — die 3 Doku-Commits sind gepusht** (`074f622..b052e6e`, nur
  `docs/HANDOVER.md`, `+146/-92`, kein `src/`-Diff). `git log --oneline
  origin/main..HEAD` ist danach leer. App nach dem dadurch ausgelösten Vercel-
  Deploy erneut geprüft: `zicards.moerzinger.eu` → 200, `zicards.vercel.app` → 200.
- **21.08. (close-session) — Vault-Page `zicards` kompiliert, nicht ergänzt.**
  Die seit 17.08. offene Lücke ist zu. Ersetzt wurden die vier Stellen, die durch
  den 21.08.-Lauf faktisch falsch waren: der `STATUS 2026-08-10`-Block (inkl.
  „Ob der Daily-Reminder-Cron wieder läuft, ist ungeklärt“), die `Users:`-Zeile
  mit dem Stand vom 05.08., die Feature-Zeile „muted 2026-06-25“ und die
  Infrastructure-Zeile „DISABLED 2026-06-25“. Neu dazu: Security-Fund und -Fix
  (12./21.08.), Feedback-Grant (18./21.08.), Tablet-Bestätigung (13.08.), der
  `anon`-Blankogrant als offene Frage und der Zugriffsweg über die Management API.
  **Beweis gegen die Live-Page:** `STATUS 2026-08-10` → 0 Treffer,
  „ist ungeklärt“ → 0, „seit der Reaktivierung am 05.08. aktiv“ → 0;
  `updated` ist von `2026-08-17` auf `2026-08-21` gesprungen, `faithful=True`,
  Wikilink `gridbert` aufgelöst, `verify` und `verify-types` beide grün.
- **21.08. (close-session) — `.claude/close-session.md` angelegt** (87 Zeilen).
  Bis heute hatte zicards als einziges Projekt kein Abschluss-Profil, weshalb
  jeder Session-Abschluss im vorsichtigen Modus lief (nur listen, nichts tun).
  Festgehalten sind jetzt: Push auf `main` **ist** der Deploy (confirm-gated,
  kein zweites Gate danach), welche Dev-Server beendet werden dürfen und welche
  nicht, dass der engram-Tunnel fremd ist und stehen bleibt, der Health-Dreisatz,
  die Handover-Struktur und der Management-API-Weg für SQL gegen Prod.
- **21.08. — Nutzer-Feedback frisch gemessen:** offene Einträge **0**,
  Tabellenstand unverändert 41 (`content-range: 0-40/41`). Letzte Lernaktivität
  überhaupt: 19.08. 10:35 UTC, seither kein einziger neuer `user_progress`-
  Eintrag; Zeilenzahl weiterhin exakt 1368.
- Frontend erreichbar auf beiden Domains: `https://zicards.moerzinger.eu/` → 200,
  `https://zicards.vercel.app/` → 200 (curl, 21.08. erneut bestätigt), SPA-
  Rewrite in `vercel.json` funktioniert weiter für Deep-Links.
- Supabase-Backend erreichbar — REST-API `${VITE_SUPABASE_URL}/rest/v1/` → 200
  (curl, 21.08.).
- `npm audit` weiterhin 0 Vulnerabilities. Lint unverändert: `npm run lint` →
  0 Fehler / 11 Warnungen. Tests unverändert: `npx vitest run` → 13
  Testdateien, 167 Tests grün. Build sauber. (21.08. erneut gelaufen, identisch.)
- Offenes Nutzer-Feedback: **0**. Tabellen-Gesamtstand unverändert 41 (mit und
  ohne `resolved_at`-Filter identisch 41 → alles resolved). Weiterhin kein
  neuer Eintrag seit 2026-08-01.
- **21.08. — Projekt-Check-in während Bens Junggesellenabschied-Wochenende,
  reine Nachmess-Session, keine Bewegung seit gestern:** Alle drei
  Wartepunkte (Security-Fix, Feedback-Grant, Cron-Reaktivierung) erneut
  unabhängig gegen den aktuellen Stand geprüft, alle drei weiterhin exakt so
  gültig wie am 20.08. — nichts hat sich verschoben. `user_settings.
  last_reminder_sent` aller 4 Reminder-Nutzer weiter unverändert auf
  `2026-06-25T07:00` (9. Beobachtung in Folge ohne Bewegung, erste am
  13.08.). Die vier Schema-Dateien der Security-Fix-Functions haben
  weiterhin keinen Diff seit dem Skript-Commit `3361c77` (07.06. letzter
  echter Change). Account-Aktivität neu gemessen statt fortgeschrieben:
  `user_progress` weiterhin exakt 1368 Zeilen. Rang 1 (zuletzt 18.08.
  18:03 UTC) jetzt 2,5 Tage still, Rang 2 (zuletzt 19.08. 10:35 UTC) jetzt
  1,8 Tage still — bei beiden keine neue Session seit dem 19.08., weiterhin
  2 von 13 Accounts aktiv. Vault-Page `zicards` gegengelesen (Stand-Header
  weiter „2026-08-10"): Security-Fund (12.08.), Feedback-Grant-Fund (18.08.)
  und die Tablet-Bestätigung eines Nutzers (13.08.) fehlen dort weiterhin — Vorschlag
  unverändert offen, siehe Check-in-Bericht.
- **20.08. — Cron-Root-Cause erneut bestätigt, nicht nur fortgeschrieben:**
  frischer REST-Query auf `user_settings` zeigt `last_reminder_sent` für alle
  4 reminder-fähigen Nutzer weiter unverändert auf `2026-06-25T07:00` — auch
  einen Tag nach dem 19.08.-Fund identisch, der Cron ist also nicht zufällig
  zwischenzeitlich gelaufen. Fällige Karten je Nutzer heute: 137 / 25 / 76 /
  172 (der dritte Wert ist von 84 auf 76 gesunken — dieser Nutzer hat
  zwischenzeitlich selbst geübt, dazu unten mehr).
- **20.08. — Datenfehler in `public.todos` gefunden und behoben:** der Punkt
  `zicards/feedback-grant` hatte `project = NULL` statt `'zicards'` und fiel
  dadurch aus jeder projekt-gefilterten Todo-Abfrage heraus (auch aus dieser
  Check-in-Session, bis gezielt danach gesucht wurde). Per
  `todos-sync.mjs`-Upsert korrigiert; alle vier zicards-Punkte liegen jetzt
  unter `project='zicards'`, `zicards/feedback-grant` zusätzlich von Bucket
  `woche` nach `jetzt` verschoben (gehört sachlich in dieselbe Konsolen-
  Session wie die anderen zwei SQL-Punkte, siehe unten).
- **Alle vormals „unpushed" Doku-Commits sind jetzt auf `origin/main`** (18.08.,
  `git log --oneline origin/main..HEAD` leer, `git branch -vv` zeigt `main`
  exakt bei `[origin/main] 3361c77`). Widerspricht dem, was HANDOVER.md bis
  gestern als offenen Punkt führte („2 Commits unpushed") — die Messung
  gewinnt: der Rückstand ist weg, kein Push in dieser Session nötig oder
  ausgeführt. Alle betroffenen Commits sind reine Doku-/Skript-Änderungen
  (`docs/HANDOVER.md`, `CLAUDE.md`, `.claude/checkin.md`,
  `supabase/*.sql`, `supabase/apply-security-fix.sh` — kein `src/`-Diff),
  also kein Funktionsrisiko durch den dadurch ausgelösten Vercel-Deploy.
- **Ein Nutzer hat am 13.08. bestätigt (Tablet-Login): „zicards läuft gut
  nun auch auf dem Tablet."** Damit ist die offene Frage aus der 13.08.-Session
  (Live-Viewport-Test auf echtem Gerät nötig, weil damals nur Code-Review
  möglich war) durch eine echte Nutzerbestätigung geklärt — stärker als ein
  synthetischer Browser-Test. Der Nutzer ist laut Mailkontext bestätigt Bestandsnutzer
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
- **Login auf mobilem Viewport geprüft** (13.08., Anlass: Bens Antwort an einen
  Nutzer 12.08. 10:02 verweist explizit auf Tablet-Zugriff über
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
  Chrome-Erweiterung nachholen, bevor die Aussage an den Nutzer als vollständig
  bestätigt gilt.

## prod ≠ live
- **30.08. — neunter Reminder-Tag in Folge, UND erste neue Bewegung seit dem
  27.08.: ein zweiter Account ist zurück.** `last_reminder_sent` aller 4
  reminder-fähigen Nutzer steht jetzt auf `2026-08-30T07:00` (neunter
  ununterbrochener Erfolgstag, 22.–30.08.). Frisch gemessen in
  `user_progress`/`sentence_progress`: **User-Präfix `bfe8c879`** — seit dem
  06.06.2026 komplett still (85 Tage, kein einziger Treffer in den 12
  Wochen dazwischen) — hat am **29.08. zwischen 20:06 und 20:11 UTC** eine
  echte Session gemacht (7 neue `user_progress`- + mehrere
  `sentence_progress`-Zeilen), rund 13 Stunden nach der Reminder-Mail
  desselben Tages (`reminder_enabled=true` für diesen Account, bestätigt).
  Damit haben seit der Cron-Reaktivierung (22.08.) jetzt **2 von 13**
  Accounts reagiert (vorher 1) — Rang-2-Account (`055164cb`) bleibt
  weiterhin bei seiner letzten Session vom 27.08. 15:42–15:49 UTC stehen,
  keine neue Bewegung dort. Kein Massen-Comeback, aber die erste Bewegung
  überhaupt seit dem 27.08. und der zweite unabhängige Beleg (nach dem
  24.08.-Fund), dass die Reminder-Mails tatsächlich Nutzer zurückholen.
  Feedback unverändert 0 offen von 41 gesamt (Content-Range-Header). Tests
  167/167, Lint 0 Fehler/11 unveränderte Warnungen, `npm audit` 0, `npx knip`
  identisch zum 17.08.-Stand (5 unused files/1 unused dep/9 unused exports) —
  keine Regression. App/Supabase weiter 200/200/200, keine unpushed Commits
  vor dieser Session. Mail-Entwurf an die Lerngruppe weiterhin nicht im
  Postfach geprüft (siehe Vortage) — Autonomy-Regel: kein neuer Entwurf ohne
  Bens Anfrage.
- **29.08. — achter Reminder-Tag in Folge, seit dem 27.08. keine neue
  Nutzeraktivität.** `cron.job_run_details`/`last_reminder_sent` zeigen den
  achten ununterbrochenen Tag (22.–29.08., alle 4 reminder-fähigen Nutzer auf
  `2026-08-29T07:00`). Rang 2 (User-Präfix `055164`) bleibt bei seiner letzten
  Session vom 27.08. 15:42–15:49 UTC stehen — `user_progress` unverändert
  1368 Zeilen, keine neue `sentence_progress`-Zeile seit 27.08. — jetzt knapp
  2 Tage still. Rang 1 (zuletzt 18.08. 18:03 UTC) jetzt rund 11 Tage still.
  Feedback unverändert 0 offen von 41 gesamt (Content-Range-Header). Tests
  167/167, Lint 0 Fehler/11 unveränderte Warnungen, `npm audit` 0, `npx knip`
  identisch zum 17.08.-Stand (5 unused files/1 unused dep/9 unused exports) —
  keine Regression. App/Supabase weiter 200/200/200. **Mail an die
  Lerngruppe weiterhin nicht raus:** `list_drafts` (Query „zicards") liefert
  keinen Treffer, `search_threads in:sent` nach „zicards"/„Erinnerungsmails"/
  „字Cards" findet als jüngste einschlägige Mail weiterhin die
  Sommerpause-Ankündigung vom 05.08. — der am 27.08. erwähnte Entwurf ist
  bestätigt weg (wie am 28.08. gefunden) und bleibt es; nicht neu angelegt
  (Autonomy-Regel: fehlender Entwurf ist Aufräumen, kein Datenverlust).
- **27.08. — fünfter Reminder-Tag in Folge, keine neue Nutzeraktivität seit
  dem 25.08.** `user_settings.last_reminder_sent` steht bei allen 4
  reminder-fähigen Nutzern jetzt auf `2026-08-26T07:00` (vorher 25.08.) —
  fünfter erfolgreicher Tag ohne Aussetzer (22.–26.08.; der Lauf für heute,
  27.08. 07:00 UTC, steht laut Uhrzeit dieser Session, 06:1x UTC, noch aus).
  Rang 2 (User-Präfix `055164`) hat seit der letzten `sentence_progress`-Zeile
  vom 25.08. 15:02 UTC keine weitere Session nachgelegt — `user_progress` für
  diesen Account bleibt bei der letzten Zeile vom 24.08. 04:18 UTC stehen.
  Rang 1 weiterhin ohne neue Aktivität, jetzt rund 8,5 Tage still (zuletzt
  18.08. 18:03 UTC). `user_progress` insgesamt unverändert 1368 Zeilen,
  Feedback-Tabelle unverändert 41 Zeilen gesamt. Fazit unverändert zum 26.08.:
  die „Sperre" hinter dem Lerngruppe-Nachfassen-Todo bleibt nachweislich weg,
  aber es ist kein Massen-Comeback — weiter 1 von 13 Accounts reagiert, jetzt
  ohne Bewegung seit 2 Tagen.
- **26.08. — Reminder laufen jetzt 4 Tage in Folge, Rang 2 bleibt aktiv über
  den 24.08.-Stand hinaus.** `user_settings.last_reminder_sent` steht bei
  allen 4 reminder-fähigen Nutzern jetzt auf `2026-08-25T07:00` (vorher
  24.08.) — vierter erfolgreicher Tag in Folge (22.–25.08.), kein Aussetzer.
  Frisch gemessen: `sentence_progress` zeigt für Rang 2 (User-Präfix
  `055164`, derselbe Account wie am 24.08.) eine neue Zeile mit
  `updated_at = 2026-08-25T15:02:18 UTC` — die Rückkehr vom 21./23./24.08.
  war also kein Einzelausschlag, der Account übt weiter. `user_progress`
  bleibt unverändert bei 1368 Zeilen (Upsert). Rang 1 weiterhin ohne neue
  Aktivität. Damit ist die „Sperre" hinter dem Lerngruppe-Nachfassen-Todo
  ein weiteres Mal frisch nachgewiesen weg — siehe Todo-Urteil im
  Check-in-Bericht vom 26.08.
- **24.08. — erste Bewegung seit der Cron-Reaktivierung, ein Account.**
  `cron.job_run_details` zeigt drei erfolgreiche `daily-reminders`-Läufe seit
  der Reaktivierung (22.08., 23.08., 24.08., alle `succeeded`); 4 der 5
  reminder-fähigen Nutzer haben laut `user_settings.last_reminder_sent` heute
  24.08. 07:00 UTC tatsächlich eine Mail bekommen (vorher: alle auf
  `2026-06-25T07:00` eingefroren) — die Mails gehen seither nachweislich raus,
  nicht nur der Job ist aktiv. **Rang 2** (zuletzt 19.08. 10:35 UTC, seit
  21.08. als „still" geführt) hat seit dem 21.08.-Check-in 33 neue
  `user_progress`- und 22 neue `sentence_progress`-Zeilen erzeugt, verteilt
  auf drei kurze Sessions (21.08. 08:50 — vor der ersten Reminder-Mail,
  vermutlich unabhängig davon —, 23.08. 14:49 — rund 7¾h nach der 23.08.-Mail
  —, 24.08. 04:18–04:24 — rund 21h nach der 23.08.-Mail). `user_progress`
  bleibt trotzdem exakt bei 1368 Zeilen (Upsert auf bestehende Karten, kein
  Zuwachs neuer Karten — richtiges Signal ist die Zahl der Aktualisierungen,
  nicht die Gesamtzeilenzahl). **Rang 1** (zuletzt 18.08. 18:03 UTC) hat sich
  dagegen nicht bewegt, jetzt 6 Tage still. Die übrigen 11 Accounts
  unverändert still. Fazit: ein erstes, zeitlich plausibles Reaktivierungs-
  Signal bei genau einem von 13 Accounts — noch kein Massen-Comeback, aber
  die Voraussetzung „man sieht jetzt, ob die Erinnerungen wirken" ist erfüllt.
- **Supabase-Advisor noch nicht sichtbestätigt.** `search_path=''` sitzt
  nachweislich auf allen 7 `public`-Functions (direkt aus `pg_proc.proconfig`
  gemessen, 21.08.), aber Advisors > Security > „Rerun linter“ im Dashboard
  hat niemand gedrückt — dafür fehlt der Dashboard-Zugang. Kosmetik: der Fix
  selbst ist belegt, nur die Advisor-Anzeige hinkt.
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

- **28.08. — siebter Reminder-Tag in Folge, Rang-2-Account hat frisch nachgelegt.**
  `cron.job_run_details` zeigt sieben ununterbrochene `succeeded`-Läufe für
  `daily-reminders` (22.–28.08., heute 07:00:00.118 UTC). `last_reminder_sent`
  aller 4 reminder-fähigen Nutzer steht jetzt auf `2026-08-28T07:00` — kein
  Aussetzer seit der Reaktivierung. **Neu, noch nicht im 27.08.-Stand:**
  Rang 2 (User-Präfix `055164`) hat am 27.08. zwischen 15:42 und 15:49 UTC
  eine weitere Session gemacht (`user_progress`- und `sentence_progress`-Zeile
  frisch), die gestrige Session (Lauf um 06:41 UTC) konnte das noch nicht
  sehen. **Wirkung sauber gegen die Vorwoche gerechnet:** `user_progress`
  22.–27.08. = 33 Zeilen / 1 aktiver Nutzer, 15.–21.08. (Vorwoche, vor der
  Reaktivierung) = 68 Zeilen / 2 aktive Nutzer; `sentence_progress` analog
  26 vs. 30 Zeilen, 1 vs. 2 Nutzer. Von 12 Accounts mit je-jemals-Aktivität
  hat seit 22.08. genau 1 reagiert. Fazit: die Sperre ist zweifelsfrei weg
  und bleibt es, aber ein Comeback der Gruppe ist es nicht — eher eine
  Fortsetzung des einen Accounts, der schon vorher am aktivsten war, auf
  niedrigerem Niveau als in der Vorwoche. Feedback unverändert 0 offen von
  41 gesamt (Content-Range-Header). Tests 167/167, Lint 0/11 (unverändert),
  `npm audit` 0, `npx knip` identisch zum 17.08.-Stand (5 unused files/1
  unused dep/9 unused exports) — keine Regression. App/Supabase weiter
  200/200/200. **Mail-Entwurf an die Lerngruppe nicht mehr im Postfach** —
  weder unter Entwürfen noch im Gesendet-Ordner (`list_drafts`,
  `search_threads in:sent` beide leer für die naheliegenden Suchbegriffe).
  Kein neuer Entwurf angelegt (siehe Autonomy-Regel: ein fehlender Entwurf
  ist eine Aufräum-Entscheidung, kein Datenverlust — erst auf Bens Anfrage
  neu anlegen).

## Aus dem globalen Check-in (2026-08-30)

- Reales Arbeitsfenster diese Woche: Mo, Di, Mi, Do-Vormittag — Fr 04.09. ab 14:30 bis So 06.09. ist Ben komplett weg (zwei Hochzeiten), danach 07.–16.09. privater Blocker „Dänemark?" (als frei markiert, Fragezeichen). Zicards ist Nebenprojekt in einer Woche, die von Kundenterminen dominiert wird (Voith/TTTech, Energie AG, ImmoScene). [Quelle: Kalender geschäftlich + privat, globaler Check-in 30.08.]

## Offene Punkte (nächste Session)
- [x] **22.08. gegenprüfen, ob wirklich Mails rausgehen — erledigt, 24.08.**
      `supabase/verify-open-sql-2026-08-21.sh` (BEWEIS 3b/3c) erneut gelaufen:
      drei `succeeded`-Läufe seit der Reaktivierung (22./23./24.08.), 4 von 5
      Nutzern zeigen `last_reminder_sent` jetzt auf 24.08. 07:00 UTC statt
      `2026-06-25T07:00`. Die Mails gehen tatsächlich raus, es lag nicht an
      der Edge-Function/Resend. Details zur Nutzungsreaktion siehe oben unter
      „24.08. — erste Bewegung".
- [ ] **`anon` hält auf `public.feedback` weiterhin die vollen Table-Grants**
      — DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE,
      unverändert seit 21.08. Das ist der Supabase-Standard-Blankogrant auf
      `public.*`, kein Fehler dieses Repos. **RLS-Kontrolle jetzt gemessen
      (24.08., BEWEIS 2b):** RLS auf `feedback` ist an (`relrowsecurity=true`),
      3 Policies aktiv (`admins can read all feedback`, `admins can update
      feedback`, `users can insert own feedback`) — der Blankogrant ist damit
      abgesichert, kein akutes Risiko. Offen bleibt nur die Entscheidung: ob
      die `anon`-Rechte auf `feedback` trotzdem explizit zurückgenommen
      werden, bevor Supabase am 30.10.2026 die impliziten Privilegien
      umstellt. Ben entscheiden lassen — ein `REVOKE` trifft potenziell auch
      andere Tabellen desselben Grants.
- [ ] **Weiter beobachten: Rückkehr-Rate nach der Cron-Reaktivierung.** 30.08.
      neu gemessen: neunter erfolgreicher Reminder-Tag in Folge (22.–30.08.),
      `last_reminder_sent` aller 4 Nutzer jetzt auf 30.08. **Neu seit dem
      27.08.:** ein zweiter Account (Präfix `bfe8c879`, zuvor 85 Tage seit
      06.06. komplett still) hat am 29.08. 20:06–20:11 UTC eine echte Session
      gemacht, ~13h nach der Reminder-Mail — 2 von 13 Accounts haben jetzt seit
      der Reaktivierung reagiert (vorher 1). Der Mail-Entwurf an die
      Lerngruppe ist weiterhin nicht im Postfach — die Sperre (Cron) ist
      zweifelsfrei weg, die Wirkung jetzt zweifach belegt, die Gruppe weiß es
      laut Mail-Lage aber weiterhin nicht. Weiter beobachten, Nachfassen
      bleibt Topf B / Ben — die Datenlage spricht inzwischen deutlicher dafür.
- [ ] Fehlt Error-Tracking (Sentry o.ä.)? Unverändert — Ben entscheiden
      lassen, ob der Aufwand lohnt.
- [ ] `VITE_COURSE_CODE` aus Vercel-Env entfernen (unused, laut Vault seit
      längerem bekannt; `rg` im Repo bestätigt weiterhin 0 Code-Referenzen).
      **26.08.: `vercel env ls production` zeigt die Variable live bestätigt**
      (135 Tage alt, `Non-sensitive`, neben `VITE_SUPABASE_ANON_KEY`/`_URL`),
      und die Vercel-CLI ist hier tatsächlich eingeloggt (`bmoerzinger-6310`)
      — der bisherige Grund „braucht Dashboard-Zugang" stimmt technisch nicht
      mehr. Trotzdem nicht selbst entfernt: Löschen eines Prod-Env-Werts ist
      eine Infra-Änderung, kein reiner Lesevorgang — Ben kurz fragen/machen
      lassen, dann ist es ein Einzeiler (`vercel env rm VITE_COURSE_CODE
      production`).
- [ ] pi-lens `knip.json` reparieren — unverändert blockiert (Cache wird vom
      externen Plugin-Hook geschrieben, kein Regenerate-Weg aus diesem Repo).
- [ ] pi-lens-Cache insgesamt erneuern (Stand 13./14.04., ~4 Monate alt) —
      gleiche Ursache wie oben.

## Session-Log (letzte 3)
- **2026-08-30** — Projekt-Check-in (Ben heute So frei, aber Nebenprojekt in
  einer Woche voller Kundentermine — reales Fenster nur Mo–Do-Vormittag,
  Fr 4.9. 14:30 bis So 6.9. komplett weg, zwei Hochzeiten). Health erneut
  200/200/200 (App × 2, Supabase), keine unpushed Commits, Tests 167/167,
  Lint 0/11 (unverändert), `npm audit` 0, `npx knip` identisch zum
  17.08.-Stand — keine Regression. Feedback weiter 0 offen von 41 gesamt.
  **Lerngruppe-Nachfassen-Todo erneut geprüft, als offen eingestuft:**
  neunter erfolgreicher Reminder-Tag in Folge (22.–30.08.,
  `last_reminder_sent` aller 4 Nutzer auf 30.08.), Sperre bleibt
  zweifelsfrei weg. **Neue Bewegung seit dem 27.08.:** ein zweiter, seit
  06.06. (85 Tage) komplett stiller Account hat am 29.08. 20:06–20:11 UTC
  eine echte Session gemacht, ~13h nach der Reminder-Mail — 2 von 13
  Accounts haben seit der Reaktivierung reagiert (vorher 1). Todo bleibt
  offen (Kommunikation ist Topf B), aber die Datenlage spricht jetzt
  deutlicher für ein Nachfassen. Check-in-Sektion (Kapazitätsfenster) und
  „Weiter beobachten"-Punkt aktualisiert. Kein Deploy diese Session (nur
  Doku-Commit, lokal, nicht gepusht).
- **2026-08-29** — Projekt-Check-in (Ben heute Sa nur bis 15:00 frei, dann
  privat weg; die Geschäftswoche Mo–Do ist dicht, Fr 4.9. 14:30 bis So 6.9.
  komplett weg — zwei Hochzeiten). Health erneut 200/200/200 (App × 2,
  Supabase), 2 unpushed Doku-Commits (nur `docs/HANDOVER.md`, kein
  `src/`-Diff), Tests 167/167, Lint 0/11 (unverändert), `npm audit` 0,
  `npx knip` identisch zum 17.08.-Stand — keine Regression. Feedback weiter
  0 offen von 41 gesamt. **Lerngruppe-Nachfassen-Todo erneut geprüft, als
  offen eingestuft:** achter erfolgreicher Reminder-Tag in Folge (22.–29.08.,
  `last_reminder_sent` aller 4 Nutzer auf 29.08.), Sperre bleibt zweifelsfrei
  weg. Seit dem 27.08. 15:49 UTC keine neue Nutzeraktivität (Rang 2 knapp
  2 Tage still, Rang 1 rund 11 Tage). Frisch gegengeprüft: der am 27.08.
  erwähnte Mail-Entwurf ist weiterhin nicht im Postfach (`list_drafts`,
  `search_threads in:sent` beide ohne Treffer für die naheliegenden
  Suchbegriffe) — nicht neu angelegt (Aufräum-Entscheidung, kein
  Datenverlust). Vault-Page `zicards` gegengelesen: Stand vom 27.08.
  (globaler Ingest) bereits eingepflegt, nichts Neues gegenüber dem
  gemessenen Stand hier. Kein Deploy diese Session (nur Doku-Commit, lokal,
  nicht gepusht).
- **2026-08-28** — Projekt-Check-in (Ben heute nur 11:00–17:00 frei, inhaltlich
  von Voith/TTTech und ImmoScene belegt; ab 04.09. Nachmittag bis 06.09.
  Hochzeit, danach Ben laut eigener Aussage bis 3.9. frei/danach September
  voll — diese Woche realistisch kein Fenster für zicards). Health erneut
  200/200/200 (App × 2, Supabase), Tests 167/167, Lint 0/11 (unverändert),
  `npm audit` 0, `npx knip` identisch zum 17.08.-Stand — keine Regression.
  Feedback weiter 0 offen von 41 gesamt. **Lerngruppe-Nachfassen-Todo erneut
  geprüft, als offen eingestuft:** siebter erfolgreicher Reminder-Tag in
  Folge (22.–28.08., `last_reminder_sent` aller 4 Nutzer auf 28.08.), Sperre
  bleibt zweifelsfrei weg. Frisch gemessen: Rang-2-Account hat am 27.08.
  15:42–15:49 UTC nachgelegt (war am 27.08. noch nicht sichtbar). Wirkung
  sauber gegen die Vorwoche gerechnet: 1 aktiver Nutzer / 33+26 Zeilen
  (22.–27.08.) gegen 2 aktive Nutzer / 68+30 Zeilen (Vorwoche 15.–21.08.) —
  kein Comeback der Gruppe, nur der ohnehin aktivste Account, und zwar auf
  niedrigerem Niveau als vorher. Mail-Entwurf an die Lerngruppe nicht mehr
  im Postfach (weder Entwürfe noch Gesendet) — nicht neu angelegt, das ist
  eine Aufräum-Entscheidung, kein Datenverlust. Kein Deploy diese Session
  (nur Doku-Commit, lokal, nicht gepusht).
