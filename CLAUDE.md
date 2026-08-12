# ZìCards — Agent Guide

## Supabase: neue Tabellen IMMER mit expliziten Grants

Ab **30.10.2026** entfernt Supabase das implizite Data-API-Privileg für `public.*`-Tabellen. Jede neue Tabelle ohne expliziten `GRANT` wird über PostgREST / GraphQL / `supabase-js` **401/permission denied** zurückgeben — auch wenn RLS-Policies korrekt sind.

**Regel:** Wenn du in einer Migration `CREATE TABLE public.<x>` schreibst, MUSS der gleiche Migrationsblock direkt darunter:

1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + Policies (row-level)
2. **`GRANT`-Statements** (table-level Data-API-Zugriff)

RLS und GRANT lösen verschiedene Probleme — beides ist Pflicht.

### Drei Grant-Profile

Wähle eines pro Tabelle, je nach Datenklasse:

**(a) Public-Read-Content** — Referenzdaten, alle dürfen lesen, nur Server schreibt
```sql
GRANT SELECT                 ON TABLE public.<table> TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.<table> TO service_role;
```
Beispiele im Bestand: `characters`, `sentences`, `mnemonics`.

**(b) User-scoped** — eingeloggte User, RLS scopt Rows via `auth.uid() = user_id`
```sql
GRANT SELECT, INSERT, UPDATE ON TABLE public.<table> TO authenticated;
GRANT ALL                    ON TABLE public.<table> TO service_role;
```
Beispiele im Bestand: `user_progress`, `sentence_progress`, `user_settings`.

**(c) Admin-only** — RLS limitiert auf Admins, anon hat keinen Zugriff
```sql
GRANT SELECT ON TABLE public.<table> TO authenticated;
GRANT ALL    ON TABLE public.<table> TO service_role;
```
Beispiele im Bestand: `admin_users`.

### Functions / RPCs

Jede Function, die per `supabase.rpc('name', ...)` aufgerufen wird, braucht explizites EXECUTE:
```sql
GRANT EXECUTE ON FUNCTION public.<fn>(<args>) TO authenticated;
-- Edge-Function-RPCs zusätzlich: , service_role
```
Trigger-Functions brauchen KEIN GRANT — sie laufen im Kontext des Triggers.

Jede Function (auch Trigger-Functions) braucht außerdem ein festes `search_path`,
sonst meldet der Supabase Security Advisor „Function Search Path Mutable":
```sql
ALTER FUNCTION public.<fn>(<args>) SET search_path = '';
```
Voraussetzung: alle Objektreferenzen im Function-Body sind schemaqualifiziert
(`public.<table>`, `auth.users`, ...). Bei `SECURITY DEFINER` ist das nicht nur
Advisor-Kosmetik, sondern schließt eine echte Rechteausweitung über einen
manipulierten `search_path`. Referenz: `supabase/security-search-path-fix-2026-08-12.sql`.

### Referenz-Migration

`supabase/grants-2026-05-28-api-default-change.sql` zeigt das vollständige Pattern für die bestehenden Tabellen + `ALTER DEFAULT PRIVILEGES` für künftige Functions. Bei Unsicherheit dort spicken.

### Checkliste vor Commit einer neuen Tabelle

- [ ] `CREATE TABLE public.<x>` vorhanden
- [ ] `ENABLE ROW LEVEL SECURITY` + mindestens eine SELECT-Policy
- [ ] Passendes Grant-Profil (a/b/c) gewählt und eingefügt
- [ ] Falls Function: `GRANT EXECUTE` für alle Roles, die sie aufrufen
- [ ] Falls Function: `SET search_path = ''` gesetzt (siehe oben)
- [ ] Falls Sequence (z.B. `bigserial`-PK): `GRANT USAGE ON SEQUENCE ...` für schreibende Roles
