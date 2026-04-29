import { getMnemonic } from '../utils/mnemonics'

/**
 * Shows a mnemonic breakdown for a character.
 * Highlights parts the user already knows (based on progress).
 *
 * @param {string} hanzi - The character to show mnemonic for
 * @param {Array} characters - All characters in the system
 * @param {Object} progress - User progress map { characterId: { level, ... } }
 */
export default function MnemonicCard({ hanzi, characters, progress }) {
  const data = getMnemonic(hanzi)
  if (!data) return null

  // Build a set of hanzi the user has already learned (level >= 1).
  // Compound rows (hanzi="多少") count as known for each of their components,
  // so a mnemonic for 名字 can highlight 多 / 少 as known.
  const knownHanzi = new Set()
  for (const char of characters) {
    const p = progress[char.id]
    if (p && p.level >= 1) {
      knownHanzi.add(char.hanzi)
      for (const ch of [...char.hanzi]) {
        knownHanzi.add(ch)
      }
    }
  }

  const hasParts = data.parts && data.parts.length > 0

  return (
    <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200/60 rounded-lg text-left">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base">💡</span>
        <span className="text-sm font-medium text-amber-800">Eselsbrücke</span>
      </div>

      {hasParts && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-hanzi text-2xl">{hanzi}</span>
          <span className="text-ink/30">=</span>
          {data.parts.map((part, i) => {
            const isKnown = knownHanzi.has(part.char)
            return (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-ink/30 text-sm">+</span>}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium ${
                    isKnown
                      ? 'bg-sage/15 text-sage border border-sage/30'
                      : 'bg-ink/5 text-ink/50 border border-ink/10'
                  }`}
                >
                  <span className="font-hanzi text-lg">{part.char}</span>
                  <span className="text-xs">{part.meaning}</span>
                  {isKnown && <span className="text-xs">✓</span>}
                </span>
              </span>
            )
          })}
        </div>
      )}

      <p className="text-sm text-amber-900/80 leading-relaxed">{data.mnemonic}</p>
    </div>
  )
}
