import { getGrammarHint } from '../utils/grammarHints'

/**
 * Shows a small inline grammar explanation if the meaning
 * contains a technical linguistic term (e.g. "Fragepartikel").
 */
export default function GrammarHint({ meaning }) {
  const hint = getGrammarHint(meaning)
  if (!hint) return null

  return (
    <div className="text-xs text-ink/50 mt-1 flex items-start gap-1.5">
      <span className="shrink-0">📖</span>
      <span>{hint}</span>
    </div>
  )
}
