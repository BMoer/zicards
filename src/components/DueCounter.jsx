import { useMemo } from 'react'
import { countDue, countNew } from '../utils/spaced'

export default function DueCounter({ characters, charProgress, sentences, sentenceProgress }) {
  const stats = useMemo(() => {
    const dueChars = countDue(charProgress)
    const newChars = countNew(characters, charProgress)
    const dueSentences = countDue(sentenceProgress)
    const newSentences = countNew(sentences, sentenceProgress)
    return { dueChars, newChars, dueSentences, newSentences }
  }, [characters, charProgress, sentences, sentenceProgress])

  const totalDue = stats.dueChars + stats.dueSentences
  const totalNew = stats.newChars + stats.newSentences

  if (totalDue === 0 && totalNew === 0) {
    return (
      <div className="mb-6 p-4 bg-sage/10 border border-sage/20 rounded-lg text-center">
        <span className="text-sage font-medium">✓ Alles wiederholt!</span>
        <span className="text-sm text-ink/40 block mt-0.5">Komm später wieder für neue Wiederholungen.</span>
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-terracotta/5 border border-terracotta/15 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          {totalDue > 0 && (
            <div className="font-medium text-terracotta">
              {totalDue} fällig
              <span className="text-xs text-ink/40 font-normal ml-1.5">
                ({stats.dueChars} Zeichen, {stats.dueSentences} Sätze)
              </span>
            </div>
          )}
          {totalNew > 0 && (
            <div className="text-sm text-ink/50 mt-0.5">
              + {totalNew} neue
              {totalNew > 0 && (
                <span className="text-xs text-ink/30 ml-1">
                  ({stats.newChars} Zeichen, {stats.newSentences} Sätze)
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl">
          {totalDue > 10 ? '🔥' : totalDue > 0 ? '📚' : '🌱'}
        </div>
      </div>
    </div>
  )
}
