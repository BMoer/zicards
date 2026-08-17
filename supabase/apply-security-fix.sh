#!/usr/bin/env bash
# zicards: Supabase-Security-Fix anwenden (Function Search Path Mutable, Lint 0011)
#
# Ben führt dieses Skript aus. Das DB-Passwort wird per `read -s` abgefragt,
# landet nur in einer Shell-Variable und taucht weder im Verlauf noch in einer
# Datei noch in einem Log auf.
#
# Ablauf: PRÜFEN -> ÄNDERN -> BEWEISEN. Bricht ab, wenn die Prüfung etwas findet.
#
# Aufruf:  bash supabase/apply-security-fix.sh
# Rückweg: ALTER FUNCTION <fn> RESET search_path;   (pro Function)

set -euo pipefail

HOST="aws-1-eu-west-1.pooler.supabase.com"
PORT="5432"
DBNAME="postgres"
USER="postgres.obpgcttudogwfobjwjgk"   # Pooler-Format: postgres.<project-ref>

FUNCS=(
  "public.is_admin()"
  "public.admin_get_users()"
  "public.admin_get_user_chars(uuid)"
  "public.admin_get_user_sentences(uuid)"
  "public.get_due_counts(uuid)"
  "public.update_updated_at()"
  "public.mnemonics_set_updated_at()"
)

echo "Supabase-Passwort für zicards (Dashboard > Settings > Database):"
read -rs PGPASSWORD
export PGPASSWORD
echo

psql_q() { psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DBNAME" -qtAX -c "$1"; }

echo "== 1. Verbindung =="
psql_q "select current_database() || ' @ ' || inet_server_addr();"

echo
echo "== 2. PRÜFUNG: unqualifizierte Objektreferenzen in den Function-Bodies =="
echo "   (SET search_path = '' bricht jede Function, die eine Tabelle ohne Schema anspricht)"
SUSPECT=$(psql_q "
  select p.oid::regprocedure || ' :: ' || m[1]
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
  cross join lateral regexp_matches(
      pg_get_functiondef(p.oid),
      '(?i)\\m(?:from|join|update|insert\\s+into)\\s+(?!public\\.|auth\\.|pg_|storage\\.|extensions\\.|information_schema\\.|\\()([a-z_][a-z0-9_]*)',
      'g') as m
  where p.prokind = 'f';
")

if [ -n "$SUSPECT" ]; then
  echo "ABBRUCH — diese Stellen sind nicht schemaqualifiziert:"
  echo "$SUSPECT"
  echo
  echo "Erst die Function-Bodies qualifizieren, dann dieses Skript erneut fahren."
  exit 1
fi
echo "   OK: keine unqualifizierte Referenz gefunden."

echo
echo "== 3. Stand VORHER =="
psql_q "
  select p.oid::regprocedure || '  security_definer=' || p.prosecdef ||
         '  config=' || coalesce(array_to_string(p.proconfig, ','), '(keines)')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.prokind='f' order by 1;
"

echo
echo "== 4. ÄNDERN =="
for fn in "${FUNCS[@]}"; do
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DBNAME" -qX \
    -c "ALTER FUNCTION $fn SET search_path = '';"
  echo "   gesetzt: $fn"
done

echo
echo "== 5. BEWEIS: search_path steht jetzt auf leer =="
psql_q "
  select p.oid::regprocedure || '  ->  ' ||
         coalesce(array_to_string(p.proconfig, ','), 'FEHLT')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.prokind='f' order by 1;
"

echo
echo "== 6. RAUCHTEST: Functions laufen noch =="
psql_q "select 'is_admin() -> ' || public.is_admin()::text;"
echo "   (get_due_counts/admin_* brauchen eine echte User-UUID und werden hier nicht aufgerufen —"
echo "    dafür ist der Login-Test in der App der Beweis.)"

unset PGPASSWORD
echo
echo "FERTIG. Danach im Supabase-Dashboard: Advisors > Security > 'Rerun linter'."
