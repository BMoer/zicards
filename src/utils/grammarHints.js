/**
 * Kurze Erklärungen für grammatische Fachbegriffe,
 * die in den Bedeutungs-Texten vorkommen.
 *
 * Key: Regex-Pattern (case-insensitive) auf meaning
 * Value: verständliche Erklärung für Anfänger
 */
const grammarHints = [
  {
    pattern: /^Fragepartikel/i,
    hint: 'Wird ans Satzende gestellt, um eine Ja/Nein-Frage zu bilden. z.B. 你好吗？ = Geht es dir gut?',
  },
  {
    pattern: /^Pluralpartikel/i,
    hint: 'Wird an Personalpronomen oder Personen-Nomen angehängt, um die Mehrzahl zu bilden. z.B. 我们 = wir.',
  },
  {
    pattern: /^Possessivpartikel/i,
    hint: 'Zeigt Besitz oder Zugehörigkeit an, ähnlich wie „von" oder das Genitiv-s. z.B. 我的 = mein/meins.',
  },
  {
    pattern: /^Substantiv-Suffix/i,
    hint: 'Wird an Wörter angehängt, um ein Substantiv zu bilden. z.B. 桌子 (Tisch), 杯子 (Becher).',
  },
  {
    pattern: /Zählwort/i,
    hint: 'Im Chinesischen steht zwischen Zahl und Nomen immer ein Zählwort (wie „Stück", „Blatt" im Deutschen). z.B. 一本书 = ein Buch.',
  },
  {
    pattern: /^allgemeines Zählwort/i,
    hint: 'Das universelle Zählwort – kann im Zweifelsfall immer verwendet werden. z.B. 一个人 = ein Mensch.',
  },
]

/**
 * Returns a grammar hint if the meaning contains a technical term.
 * @param {string} meaning
 * @returns {string|null}
 */
export function getGrammarHint(meaning) {
  if (!meaning) return null
  for (const { pattern, hint } of grammarHints) {
    if (pattern.test(meaning)) return hint
  }
  return null
}
