# checkin Profil — 字Cards (zicards)

cadence: daily
one_liner: Chinesisch-Lern-App (React/Vite auf Vercel, Supabase als Backend) mit echten
  Nutzern und eingebautem Feedback-Knopf. **Das einzige Projekt, in dem Nutzer direkt
  zurückschreiben** — offenes Feedback ist hier die wichtigste Zahl, nicht die Telemetrie.

## health
  - App erreichbar: `curl -s -o /dev/null -w "app %{http_code}\n" https://zicards.moerzinger.eu/`
    → erwartet **200**. Zweite Adresse derselben App: `https://zicards.vercel.app/`
      (beide am 2026-08-04 als 字Cards verifiziert). Weicht eine ab, ist die
      Domain-Zuordnung kaputt, nicht die App.
  - Supabase-API: `source .env && curl -s -o /dev/null -w "supabase %{http_code}\n" "${VITE_SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_SERVICE_KEY}"`
    → erwartet 200. **401/permission denied bei einer neuen Tabelle** heißt fast immer:
      `GRANT` vergessen (siehe CLAUDE.md — ab 30.10.2026 kein implizites Data-API-Privileg).
  - Unausgelieferter Stand: `git status --short` + `git log --oneline origin/main..HEAD`
    → Push auf main = Deploy (Vercel, Projekt `zicards`).

## kpi
  - **Offenes Nutzer-Feedback** (die Kernzahl):
    ```
    source .env && curl -s "${VITE_SUPABASE_URL}/rest/v1/feedback?select=id,comment,page_url,created_at&resolved_at=is.null&order=created_at.desc&limit=20" \
      -H "apikey: ${SUPABASE_SERVICE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"
    ```
    `resolved_at IS NULL` = offen. **Neu seit dem letzten Check-in** ist die Zahl, die zählt.
  - Code-Qualität: `.pi-lens/metrics-history.json` — Dateien mit MI < 20 oder
    kognitiver Komplexität > 25 (Skill `pi-metrics` rendert das)
  - Befunde: `.pi-lens/cache/turn-end-findings-last.json`, `jscpd.json` (Duplikate),
    knip (ungenutzter Code) — Skill `pi-findings`

## sources
  - Der Feedback-Knopf in der App (Supabase-Tabelle `feedback`). Jeder Eintrag hat eine
    Spalte `screenshot_data` (base64-JPEG). **Ein Kommentar wie „Falsch" ist ohne den
    Screenshot bedeutungslos** — bei jedem offenen Eintrag das Bild dekodieren und
    ansehen, bevor darüber geurteilt wird. Vorgehen steht im Skill `check-feedback`.
  - Sonst keine Alarm-Mails, keine CI-Signale.

## open_points
  - Offene Feedback-Einträge (oben) sind der faktische Backlog dieses Projekts
  - `rg -n "^\s*- \[ \]" zicards-spec.md CLAUDE.md` — Achtung: CLAUDE.md-Treffer sind
    fast immer die generische Grant-Checkliste (Vorlage, keine echten offenen Punkte) —
    gegenprüfen, nicht blind zählen.
  - Offene Punkte stehen primär in `docs/HANDOVER.md` → `## Offene Punkte (nächste Session)`

## vault
area_key:     `zicards` (existiert bereits; laut Vault-Metadaten zuletzt aktualisiert
  2026-08-10 — Reaktivierungs-Stand, nicht mehr die alte Sommerpause-Fassung.
  Stand 17.08. gegengelesen: Kerninhalte weiterhin stimmig, aber der
  Supabase-Security-Fund (12.08.) und Karls Tablet-Bestätigung (13.08.) fehlen
  noch, siehe vault_vorschlag)
backlog_key:  (keiner eigener — Backlog lebt in docs/HANDOVER.md)
known_issues: (keine eigene Page — offene Themen stehen in der `zicards`-Page unter
  „Open Questions" / „Next Steps")

## handover
file:         docs/HANDOVER.md (existiert seit 2026-08-04, wird bei jedem Check-in
  fortgeschrieben: `## Was live / fertig` · `## prod ≠ live` ·
  `## Offene Punkte (nächste Session)` · `## Session-Log (letzte 3)`)
checkin_note: docs/HANDOVER.md → Sektion `## Aus dem globalen Check-in (<Datum>)`.
  Wird bei jedem Lauf ersetzt.

## autonomy
  - **Feedback beantworten ist Topf B.** Der Fund ist Topf A (Screenshot ansehen, Bug
    reproduzieren, Fix bauen) — aber jede Nachricht zurück an einen Nutzer geht über Ben.
  - **`resolved_at` nicht ohne Fix setzen.** Ein Eintrag gilt erst als erledigt, wenn der
    Fix live ist; sonst verschwindet ein echter Bug still aus der Liste.
  - **Neue Supabase-Tabelle nie ohne expliziten `GRANT`** im selben Migrationsblock
    (RLS und GRANT lösen verschiedene Probleme, beides ist Pflicht — CLAUDE.md).

## notes
  - Seit 21.08.2026 gibt es ein **close-session-Profil** (`.claude/close-session.md`).
    Der Check-in ist damit nicht mehr die einzige Stelle, die den Stand einsammelt —
    beim Abschluss räumt close-session Handover und Vault auf. Zuvor lief jeder
    Session-Abschluss hier im vorsichtigen Modus (nur listen, nichts beenden/ausrollen).
  - Das Projekt war von 2026-06-18 bis 2026-08-04 (Wiederaufnahme-Check-in) commit-still;
    seit 04.08. wieder aktive Check-in-Session je Tag. Ein ruhiger Check-in bleibt der
    Normalfall, **eine leere Feedback-Liste ist trotzdem eine gute Nachricht**
    (die App läuft, ohne dass jemand meckert) — nicht als „nichts passiert" abtun.
  - Supabase war 04.–05.08. fälschlich als „Ausfall" gemessen (NXDOMAIN) — laut Ben
    (Richtigstellung, HANDOVER.md) war das die geplante Sommerpause, keine Störung.
    Seit 05.08. wieder erreichbar. Bei zukünftigen DNS-Fehlern hier zuerst prüfen, ob
    eine geplante Pause dahintersteckt, bevor „Ausfall" gemeldet wird.
  - Die Skills `check-feedback`, `pi-metrics`, `pi-findings` liegen im Repo und machen
    genau diese Messungen. Der Agent nutzt sie, statt die Kommandos nachzubauen.
