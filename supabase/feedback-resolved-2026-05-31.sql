-- Feedback triage — 2026-05-31
--
-- Add a soft "done" marker to feedback instead of deleting resolved entries,
-- so the history stays auditable (screenshots + comments) while triaged items
-- drop out of the open list. resolved_at IS NULL == still open.

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- Admins (the only readers) may also mark feedback resolved from the UI.
DROP POLICY IF EXISTS "admins can update feedback" ON public.feedback;
CREATE POLICY "admins can update feedback"
  ON public.feedback FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Grant table-level UPDATE per the 2026-10-30 Data-API rule (profile b: admin-scoped).
GRANT SELECT, UPDATE ON TABLE public.feedback TO authenticated;
GRANT ALL          ON TABLE public.feedback TO service_role;

-- Mark every entry through 2026-05-25 resolved: all actionable bugs are
-- addressed by commits 1dd8f02 (gap-fill + ambiguity), 71aa80f (compound
-- chars / mnemonic regression / audio hint) and the surrounding mnemonic work.
UPDATE public.feedback
  SET resolved_at = now()
  WHERE resolved_at IS NULL
    AND created_at <= '2026-05-26T00:00:00+00:00';

-- Proof: open vs resolved counts.
SELECT
  count(*) FILTER (WHERE resolved_at IS NULL) AS still_open,
  count(*) FILTER (WHERE resolved_at IS NOT NULL) AS resolved
FROM public.feedback;
