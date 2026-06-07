-- ZìCards: explizite Data-API-Grants
-- Hintergrund: Supabase entfernt am 30.10.2026 das implizite Schema-Privileg
-- für public.* auf bestehenden Projekten (für neue Projekte schon ab 30.05.2026).
-- Quelle: Supabase-Changelog "New API permissions default" (Mai 2026).
--
-- Diese Migration macht die aktuell impliziten Berechtigungen explizit.
-- Idempotent: GRANT überschreibt nicht, ergänzt nur. Auf Prod jetzt einspielbar.
--
-- Rolle-Strategie:
--   anon          — nicht eingeloggte Besucher (Public-Reads only)
--   authenticated — eingeloggte User (RLS enforced row-level)
--   service_role  — Edge-Functions / Server (Bypass RLS)

-- ─── Schema-Usage ───────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ─── Public-Read-Content (Referenzdaten) ────────────────────────────────
-- RLS-Policy "for select using (true)" — alle dürfen lesen.
GRANT SELECT ON TABLE public.characters TO anon, authenticated;
GRANT SELECT ON TABLE public.sentences  TO anon, authenticated;
GRANT SELECT ON TABLE public.mnemonics  TO anon, authenticated;

-- Schreiben nur via service_role (Seed-Scripts, Admin).
GRANT INSERT, UPDATE, DELETE ON TABLE public.characters TO service_role;
GRANT INSERT, UPDATE, DELETE ON TABLE public.sentences  TO service_role;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mnemonics  TO service_role;

-- ─── User-scoped Progress (RLS = auth.uid() = user_id) ──────────────────
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_progress     TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.sentence_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings     TO authenticated;
GRANT ALL                    ON TABLE public.user_progress     TO service_role;
GRANT ALL                    ON TABLE public.sentence_progress TO service_role;
GRANT ALL                    ON TABLE public.user_settings     TO service_role;

-- ─── Admin (RLS limitiert Rows auf Admin-User) ──────────────────────────
GRANT SELECT ON TABLE public.admin_users TO authenticated;
GRANT ALL    ON TABLE public.admin_users TO service_role;

-- ─── Functions (RPCs via supabase-js) ───────────────────────────────────
GRANT EXECUTE ON FUNCTION public.is_admin()                              TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_due_counts(uuid)                    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_users()                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_chars(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_sentences(uuid)          TO authenticated;

-- ─── Default-Privilegien für künftige Objekte ───────────────────────────
-- Setzt die Defaults so, dass NEU angelegte Tabellen/Functions in public
-- automatisch lesbar/aufrufbar sind. Macht den Oktober-2026-Cutover für
-- spätere Migrations sicher (man muss nur noch SELECT/INSERT pro Tabelle
-- entscheiden, USAGE/EXECUTE sind erledigt).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- Optional restriktiver: keine Default-Table-Grants — pro Tabelle bewusst
-- entscheiden (siehe supabase/TABLE_TEMPLATE.sql).
