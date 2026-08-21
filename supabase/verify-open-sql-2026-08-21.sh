#!/usr/bin/env bash
# zicards: reine LESEKONTROLLE der drei Punkte vom 21.08.2026.
# Aendert nichts. Nur zum Nachweisen, dass die Aenderungen wirklich sitzen.
#
# Aufruf: bash supabase/verify-open-sql-2026-08-21.sh

set -euo pipefail

REF="obpgcttudogwfobjwjgk"

FUNCS=(
  "public.is_admin()"
  "public.admin_get_users()"
  "public.admin_get_user_chars(uuid)"
  "public.admin_get_user_sentences(uuid)"
  "public.get_due_counts(uuid)"
  "public.update_updated_at()"
  "public.mnemonics_set_updated_at()"
)

RAW=$(security find-generic-password -s "Supabase CLI" -w)
TOKEN=$(printf '%s' "$RAW" | sed 's/^go-keyring-base64://' | base64 -d)
unset RAW
case "$TOKEN" in sbp_*) ;; *) echo "ABBRUCH: kein gueltiger Token." >&2; exit 1 ;; esac

q() {
  local sql="$1" body resp
  body=$(jq -n --arg query "$sql" '{query: $query}')
  resp=$(curl -sS -X POST "https://api.supabase.com/v1/projects/${REF}/database/query" \
           -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" -d "$body")
  if printf '%s' "$resp" | jq -e 'type == "object"' >/dev/null 2>&1; then
    echo "SQL-FEHLER: $(printf '%s' "$resp" | jq -r '.message // .error // tostring')" >&2
    return 1
  fi
  printf '%s' "$resp"
}
show() { jq -r '.[] | [.[] | tostring] | join("  |  ")'; }

FAIL=0

echo "== BEWEIS 1: search_path aller public-Functions =="
q "
  select p.oid::regprocedure::text as fn,
         coalesce(array_to_string(p.proconfig, ','), 'FEHLT') as config
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
  order by 1;
" | show
OFFEN=$(q "
  select count(*) as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    and (p.proconfig is null or not exists (
      select 1 from unnest(p.proconfig) c
      where c in ('search_path=', 'search_path=\"\"')
    ));
" | jq -r '.[0].n')
if [ "$OFFEN" != "0" ]; then
  echo "   -> NICHT OK: $OFFEN Function(s) ohne search_path=''"; FAIL=1
else
  echo "   -> OK: alle public-Functions haben search_path='' gesetzt."
fi

echo
echo "== BEWEIS 2: Grants auf public.feedback =="
q "
  select grantee, string_agg(privilege_type, ', ' order by privilege_type) as rechte
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'feedback'
  group by grantee order by grantee;
" | show
HAT_INSERT=$(q "
  select count(*) as n from information_schema.role_table_grants
  where table_schema='public' and table_name='feedback'
    and grantee='authenticated' and privilege_type='INSERT';
" | jq -r '.[0].n')
if [ "$HAT_INSERT" = "0" ]; then
  echo "   -> NICHT OK: authenticated hat kein INSERT auf public.feedback"; FAIL=1
else
  echo "   -> OK: authenticated hat INSERT auf public.feedback."
fi

echo
echo "== BEWEIS 2b: RLS auf public.feedback (anon haelt breite Table-Grants) =="
q "
  select c.relname as tabelle, c.relrowsecurity as rls_an, c.relforcerowsecurity as rls_erzwungen,
         (select count(*) from pg_policies pol
          where pol.schemaname='public' and pol.tablename='feedback') as policies
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname='public' and c.relname='feedback';
" | show
q "
  select policyname as policy, cmd as fuer, roles::text as rollen
  from pg_policies where schemaname='public' and tablename='feedback' order by policyname;
" | show
RLS=$(q "
  select c.relrowsecurity::text as an from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='feedback';
" | jq -r '.[0].an')
if [ "$RLS" != "true" ]; then
  echo "   -> NICHT OK: RLS auf public.feedback ist AUS, anon hat aber Table-Grants."; FAIL=1
else
  echo "   -> OK: RLS auf public.feedback ist an."
fi

echo
echo "== BEWEIS 3: pg_cron =="
q "select jobid, jobname, schedule, active from cron.job order by jobid;" | show
AKTIV=$(q "select count(*) as n from cron.job where jobname='daily-reminders' and active;" | jq -r '.[0].n')
if [ "$AKTIV" = "0" ]; then
  echo "   -> NICHT OK: 'daily-reminders' ist nicht aktiv"; FAIL=1
else
  echo "   -> OK: 'daily-reminders' ist aktiv."
fi

echo
echo "== BEWEIS 3b: letzte Cron-Laeufe (falls schon gelaufen) =="
q "
  select start_time::text as start, status, coalesce(return_message,'') as meldung
  from cron.job_run_details d join cron.job j using (jobid)
  where j.jobname = 'daily-reminders'
  order by start_time desc limit 5;
" | show

echo
echo "== BEWEIS 3c: Reminder-Nutzer, Stand des letzten Versands =="
q "
  select count(*) as nutzer, max(last_reminder_sent)::text as juengster_versand
  from public.user_settings;
" | show

echo
echo "== RAUCHTEST: laufen die Functions nach der Aenderung noch? =="
q "select public.is_admin() as is_admin;" | show
q "select count(*) as zeilen from public.characters;" | show

unset TOKEN
echo
if [ "$FAIL" = "0" ]; then echo "GESAMT: alle drei Punkte nachgewiesen."; else echo "GESAMT: mindestens ein Punkt sitzt NICHT."; exit 1; fi
