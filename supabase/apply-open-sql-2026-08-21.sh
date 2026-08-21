#!/usr/bin/env bash
# zicards: die drei offenen Konsolen-Punkte in einem Lauf, feste Reihenfolge.
#
#   1. search_path = '' auf den public-Functions   (Security Advisor 0011)
#   2. GRANT INSERT ON public.feedback TO authenticated
#   3. pg_cron-Job "daily-reminders" wieder aktivieren
#
# Kein DB-Passwort noetig: laeuft ueber die Supabase Management API mit dem
# Token, den die Supabase CLI in der macOS-Keychain liegen hat. Der Token
# wird NIE ausgegeben und landet weder in einer Datei noch im Terminal.
#
# Ablauf je Schritt: PRUEFEN -> AENDERN -> BEWEISEN.
#
# Aufruf:   bash supabase/apply-open-sql-2026-08-21.sh
# Rueckweg: ALTER FUNCTION <fn> RESET search_path;
#           REVOKE INSERT ON TABLE public.feedback FROM authenticated;
#           select cron.alter_job(<jobid>, active := false);

set -euo pipefail

REF="obpgcttudogwfobjwjgk"   # Supabase-Projekt zicards

FUNCS=(
  "public.is_admin()"
  "public.admin_get_users()"
  "public.admin_get_user_chars(uuid)"
  "public.admin_get_user_sentences(uuid)"
  "public.get_due_counts(uuid)"
  "public.update_updated_at()"
  "public.mnemonics_set_updated_at()"
)

# ---------------------------------------------------------------- Token holen
RAW=$(security find-generic-password -s "Supabase CLI" -w)
TOKEN=$(printf '%s' "$RAW" | sed 's/^go-keyring-base64://' | base64 -d)
unset RAW
case "$TOKEN" in
  sbp_*) ;;
  *) echo "ABBRUCH: kein gueltiger Supabase-Token in der Keychain gefunden." >&2; exit 1 ;;
esac

# ------------------------------------------------------------- SQL-Hilfsfunktion
q() {
  local sql="$1" body resp
  body=$(jq -n --arg query "$sql" '{query: $query}')
  resp=$(curl -sS -X POST "https://api.supabase.com/v1/projects/${REF}/database/query" \
           -H "Authorization: Bearer ${TOKEN}" \
           -H "Content-Type: application/json" \
           -d "$body")
  if printf '%s' "$resp" | jq -e 'type == "object"' >/dev/null 2>&1; then
    echo "SQL-FEHLER: $(printf '%s' "$resp" | jq -r '.message // .error // tostring')" >&2
    return 1
  fi
  printf '%s' "$resp"
}

# Gibt das Resultat als schlichte Zeilen aus (ein Feld pro Zeile, tab-getrennt)
show() { jq -r '.[] | [.[] | tostring] | join("  |  ")'; }

echo "== 0. Verbindung =="
q "select current_database() as db, current_user as usr, version() as v;" \
  | jq -r '.[] | "\(.db) @ \(.usr)"'

# ============================================================ SCHRITT 1: search_path
echo
echo "== 1a. PRUEFUNG: unqualifizierte Objektreferenzen in den Function-Bodies =="
echo "       (SET search_path = '' bricht jede Function, die eine Tabelle ohne Schema anspricht)"
echo "       Zwei Filter gegen Fehlalarme: CTE-Namen aus dem gleichen WITH-Block zaehlen"
echo "       nicht, und ein Name zaehlt nur, wenn es ihn als Relation wirklich gibt."

# Erst die Rohtreffer zur Ansicht — inkl. der Begruendung, warum sie wegfallen.
echo
echo "       -- Rohtreffer der Textsuche (nur informativ) --"
q "
  with cand as (
    select p.oid as oid, p.oid::regprocedure::text as fn, lower(m[1]) as ref
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
    cross join lateral regexp_matches(
        pg_get_functiondef(p.oid),
        '(?i)\\m(?:from|join|update|insert\\s+into)\\s+(?!public\\.|auth\\.|pg_|storage\\.|extensions\\.|information_schema\\.|\\()([a-z_][a-z0-9_]*)',
        'g') as m
    where p.prokind = 'f'
  ),
  ctes as (
    select p.oid as oid, lower(m[1]) as cte
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
    cross join lateral regexp_matches(
        pg_get_functiondef(p.oid),
        '(?i)(?:\\mwith\\s+(?:recursive\\s+)?|,\\s*)([a-z_][a-z0-9_]*)\\s+as\\s*\\(',
        'g') as m
    where p.prokind = 'f'
  )
  select distinct c.fn as fn, c.ref as referenz,
         case
           when exists (select 1 from ctes t where t.oid = c.oid and t.cte = c.ref)
             then 'CTE im selben Body -> unkritisch'
           when not exists (select 1 from pg_class r
                            where r.relname = c.ref and r.relkind in ('r','v','m','f','p'))
             then 'existiert nirgends als Relation -> unkritisch'
           else 'ECHTE unqualifizierte Relation -> BLOCKER'
         end as bewertung
  from cand c
  order by 3 desc, 1, 2;
" | show

SUSPECT=$(q "
  with cand as (
    select p.oid as oid, p.oid::regprocedure::text as fn, lower(m[1]) as ref
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
    cross join lateral regexp_matches(
        pg_get_functiondef(p.oid),
        '(?i)\\m(?:from|join|update|insert\\s+into)\\s+(?!public\\.|auth\\.|pg_|storage\\.|extensions\\.|information_schema\\.|\\()([a-z_][a-z0-9_]*)',
        'g') as m
    where p.prokind = 'f'
  ),
  ctes as (
    select p.oid as oid, lower(m[1]) as cte
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
    cross join lateral regexp_matches(
        pg_get_functiondef(p.oid),
        '(?i)(?:\\mwith\\s+(?:recursive\\s+)?|,\\s*)([a-z_][a-z0-9_]*)\\s+as\\s*\\(',
        'g') as m
    where p.prokind = 'f'
  )
  select distinct c.fn || ' :: ' || c.ref as fund
  from cand c
  where not exists (select 1 from ctes t where t.oid = c.oid and t.cte = c.ref)
    and exists (select 1 from pg_class r
                where r.relname = c.ref and r.relkind in ('r','v','m','f','p'))
  order by 1;
" | jq -r '.[].fund')

echo
if [ -n "$SUSPECT" ]; then
  echo "ABBRUCH — diese Stellen sind echte unqualifizierte Relationen:"
  echo "$SUSPECT"
  echo "Erst die Function-Bodies qualifizieren, dann erneut fahren."
  exit 1
fi
echo "       OK: kein echter Blocker — nach Abzug der CTEs bleibt nichts uebrig."

echo
echo "== 1b. Stand VORHER =="
q "
  select p.oid::regprocedure::text as fn,
         p.prosecdef as secdef,
         coalesce(array_to_string(p.proconfig, ','), '(keines)') as config
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
  order by 1;
" | show

echo
echo "== 1c. AENDERN =="
for fn in "${FUNCS[@]}"; do
  q "ALTER FUNCTION $fn SET search_path = '';" >/dev/null
  echo "       gesetzt: $fn"
done

echo
echo "== 1d. BEWEIS: search_path steht jetzt leer =="
q "
  select p.oid::regprocedure::text as fn,
         coalesce(array_to_string(p.proconfig, ','), 'FEHLT') as config
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
  order by 1;
" | show

# ============================================================ SCHRITT 2: GRANT
echo
echo "== 2a. Grants auf public.feedback VORHER =="
q "
  select grantee, string_agg(privilege_type, ', ' order by privilege_type) as rechte
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'feedback'
  group by grantee order by grantee;
" | show

echo
echo "== 2b. AENDERN =="
q "GRANT INSERT ON TABLE public.feedback TO authenticated;" >/dev/null
echo "       GRANT INSERT ON public.feedback TO authenticated;"

echo
echo "== 2c. BEWEIS: authenticated muss INSERT, SELECT, UPDATE haben =="
q "
  select grantee, string_agg(privilege_type, ', ' order by privilege_type) as rechte
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'feedback'
  group by grantee order by grantee;
" | show

# ============================================================ SCHRITT 3: pg_cron
echo
echo "== 3a. cron.job VORHER =="
q "select jobid, jobname, schedule, active from cron.job order by jobid;" | show

echo
echo "== 3b. AENDERN (ueber den Namen, nicht ueber die jobid) =="
ALTERED=$(q "
  select cron.alter_job(jobid, active := true)::text as ok, jobname
  from cron.job where jobname = 'daily-reminders';
" | jq -r '.[].jobname // empty')
if [ -z "$ALTERED" ]; then
  echo "       WARNUNG: kein Job namens 'daily-reminders' gefunden — nichts geaendert."
else
  echo "       reaktiviert: $ALTERED"
fi

echo
echo "== 3c. BEWEIS: active muss true sein =="
q "select jobid, jobname, schedule, active from cron.job order by jobid;" | show

echo
echo "== 3d. Kontext: Stand der Reminder-Nutzer (soll in den naechsten Tagen hochlaufen) =="
q "
  select count(*) as reminder_nutzer,
         max(last_reminder_sent)::text as juengster_versand
  from public.user_settings;
" | show

unset TOKEN
echo
echo "FERTIG. Danach im Supabase-Dashboard: Advisors > Security > 'Rerun linter'."
