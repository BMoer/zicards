-- ZìCards: Fix "Function Search Path Mutable" (Supabase Advisor / Security Lints)
-- Auslöser: Supabase-Mail 11.08.2026 17:21 "Action required: security
-- vulnerabilities detected in your projects."
--
-- Befund (verifiziert im Repo, 12.08.2026): Alle 7 Functions in public sind ohne
-- explizites `SET search_path` angelegt. Für SECURITY DEFINER-Functions ist das
-- der klassische Supabase-Lint 0011 (function_search_path_mutable) — sie laufen
-- mit den Rechten des Definierers, ein session-lokal manipulierter search_path
-- könnte dann eine gleichnamige Function/Tabelle in einem anderen Schema
-- vorschieben (schema-hijacking / privilege escalation). Für die zwei reinen
-- Trigger-Functions (SECURITY INVOKER) ist das Risiko geringer, der Advisor
-- meldet den fehlenden search_path aber unabhängig vom DEFINER-Status.
--
-- Fix: `SET search_path = ''` (leer) statt `= public`. Sicher, weil alle
-- Objektreferenzen im Funktionskörper bereits schemaqualifiziert sind
-- (`public.user_progress`, `public.admin_users`, `auth.users`, ...) — geprüft,
-- keine unqualifizierten Referenzen. ALTER FUNCTION ändert nur die Function-
-- Konfiguration, nicht den Body — idempotent, kein CREATE OR REPLACE nötig.
--
-- STATUS 2026-08-21: AUSGEFÜHRT gegen Prod. Nicht über den SQL Editor,
-- sondern über die Supabase Management API (supabase/apply-open-sql-
-- 2026-08-21.sh) — dafür ist kein DB-Passwort nötig. Nachgewiesen: alle 7
-- public-Functions tragen proconfig = search_path="".
-- Gegenprüfen jederzeit mit supabase/verify-open-sql-2026-08-21.sh.
-- Im Supabase-Dashboard bleibt Advisors > Security > "Rerun linter" noch
-- als Sichtbestätigung offen (Dashboard-Zugang, daher Ben).
--
-- Vorprüfung vor der Ausführung: der Textcheck auf unqualifizierte
-- Objektreferenzen meldete 8 Treffer in admin_get_users() — allesamt
-- CTE-Namen aus dem eigenen WITH-Block (char_days, sent_days, all_days,
-- user_list, totals, char_stats, sent_stats, day_stats), keine Relationen.
-- Die echten Tabellen dort sind durchgehend schemaqualifiziert.

-- SECURITY DEFINER (zicards-admin-schema.sql)
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.admin_get_users() SET search_path = '';
ALTER FUNCTION public.admin_get_user_chars(uuid) SET search_path = '';
ALTER FUNCTION public.admin_get_user_sentences(uuid) SET search_path = '';

-- SECURITY DEFINER (zicards-spaced-repetition.sql)
ALTER FUNCTION public.get_due_counts(uuid) SET search_path = '';

-- SECURITY INVOKER Trigger-Functions (zicards-final-schema.sql, mnemonics-schema.sql)
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.mnemonics_set_updated_at() SET search_path = '';

-- Kein GRANT nötig — ALTER FUNCTION ändert keine Berechtigungen, nur die
-- search_path-Konfiguration der Function selbst.
