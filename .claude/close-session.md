# close-session Profil — 字Cards (zicards)

prod: Die öffentliche App unter **https://zicards.moerzinger.eu** (Vercel, Projekt
  `zicards`; zweite Adresse derselben App: `https://zicards.vercel.app`) plus das
  **Supabase**-Backend (Projekt-Ref `obpgcttudogwfobjwjgk`, Region West EU). Es gibt
  keine Staging-Stufe — `main` **ist** prod.

## dev_servers
stop_at_close:
  - Vite-Dev-Server dieses Repos: `pgrep -fl "vite.*zicards|npm run dev"` →
    gezielt per PID beenden. Er hält keinen Zustand, Neustart kostet nichts.
keep_alive:
  - **Alles, was nicht eindeutig zu zicards gehört.** Auf dieser Maschine laufen
    parallel Sessions anderer Projekte (engram, gridbert). Unklarer Treffer →
    listen und stehen lassen, nicht killen.

## tunnels
  - **zicards selbst braucht keinen Tunnel** — Supabase wird über HTTPS erreicht
    (REST mit `SUPABASE_SERVICE_KEY` aus `.env`, DDL über die Management API).
  - Ein `ssh -L 5434:127.0.0.1:5434 engram` gehört zum **Engram-Vault**, nicht
    hierher. Nur listen, nie aus dieser Session schließen — auch dann nicht, wenn
    close-session selbst den Vault beschrieben hat (`cc.sh --forget` weglassen,
    solange der Tunnel schon vorher lief).

## deploy
mode: confirm-gated
prod_relevant: **Jeder Push auf `main` löst einen Vercel-Deploy aus** — auch ein
  reiner Doku-Commit. Funktionsrisiko trägt aber nur ein Diff, der `src/`,
  `index.html`, `vite.config.js`, `vercel.json`, `public/` oder `package*.json`
  berührt. Alles andere (docs/, supabase/*.sql, .claude/) ist ein Formsache-Rebuild.
check: |
  git log --oneline origin/main..HEAD          # steht etwas aus?
  git diff --stat origin/main..HEAD -- src/ index.html vite.config.js vercel.json public/ package.json
                                               # ist davon etwas prod-relevant?
procedure: `git push origin main` — mehr nicht. Vercel baut automatisch.
  **Immer vorher bestätigen lassen**, auch bei reinen Doku-Commits: der Push ist
  der Deploy, es gibt keinen zweiten Gate danach.
health: |
  curl -s -o /dev/null -w "app %{http_code}\n"    https://zicards.moerzinger.eu/
  curl -s -o /dev/null -w "vercel %{http_code}\n" https://zicards.vercel.app/
  source .env && curl -s -o /dev/null -w "supabase %{http_code}\n" \
    "${VITE_SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_SERVICE_KEY}"
  # erwartet 200/200/200; erst danach ist der Deploy abgeschlossen.

## handover
file: docs/HANDOVER.md
  Struktur: `## Was live / fertig` · `## prod ≠ live` ·
  `## Aus dem globalen Check-in (<Datum>)` (gehört dem globalen Lauf, hier nur
  Nachträge anhängen) · `## Offene Punkte (nächste Session)` · `## Session-Log
  (letzte 3)`. Erledigte `- [x]`-Punkte beim Abschluss **entfernen**, nicht
  abhaken-und-liegenlassen; git bewahrt sie.

## backlog (Vault)
backlog_key: (keiner — Durables gehen direkt auf die Area-Page)
area_key:    `zicards`
  Die Page ist erfahrungsgemäß der Stelle im Repo **hinterher**. Beim Abschluss
  prüfen, welcher Satz dort durch diese Session **falsch** geworden ist, und ihn
  ersetzen (nicht danebenschreiben). Klassische Kandidaten: der `> **STATUS …**`-
  Block ganz oben, die `Users:`-Zeile, die `## Infrastructure`-Liste.

## gate
script: (keins) — stattdessen dieser Mindest-Satz:
  `npm run lint` (erwartet 0 Fehler / 11 Warnungen) · `npx vitest run`
  (erwartet 13 Testdateien, 167 Tests grün) · `npm audit` (erwartet 0).
  Nur nötig, wenn die Session `src/` angefasst hat.

## notes
  - **SQL gegen Prod braucht kein DB-Passwort.** Weg: Supabase Management API,
    Token aus der macOS-Keychain der Supabase CLI. Muster im Repo:
    `supabase/apply-open-sql-2026-08-21.sh` (ändernd, idempotent,
    PRÜFEN → ÄNDERN → BEWEISEN) und `supabase/verify-open-sql-2026-08-21.sh`
    (rein lesend, Exit 1 bei jedem nicht sitzenden Punkt).
  - **Der Agent kommt an den Keychain-Token nicht selbst heran** — der
    Auto-Mode-Klassifikator blockt `security find-generic-password` hart (kein
    Prompt, keine Freigabe per Zuruf). Funktionierender Weg: Skript schreiben,
    das den Token selbst liest und nie ausgibt, Ben startet es mit `! bash …`.
    Nicht um die Sperre herumbauen.
  - **Neue Supabase-Tabelle nie ohne expliziten `GRANT`** im selben
    Migrationsblock, und jede Function mit `SET search_path = ''` — Details und
    die drei Grant-Profile stehen in `CLAUDE.md`. Ab **30.10.2026** fällt das
    implizite Data-API-Privileg weg; was heute ohne Grant funktioniert, stirbt
    dann mit 401.
  - **Nutzer-Feedback ist die Kernzahl dieses Projekts**, nicht die Telemetrie —
    `resolved_at IS NULL` in `public.feedback`. `resolved_at` **nie ohne
    ausgelieferten Fix** setzen, sonst verschwindet ein echter Bug still.
  - Gegenspieler ist `.claude/checkin.md` (liest den Stand ein). Dieses Profil
    schreibt ihn raus.
