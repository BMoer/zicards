import { useMemo } from 'react'

/**
 * Calculates and displays global learning progress + time-to-fluency estimate.
 */
export default function GlobalProgress({ characters, charProgress, sentences, sentenceProgress }) {
  const stats = useMemo(() => {
    // Character stats
    const totalChars = characters.length
    const practicedChars = Object.keys(charProgress).length
    const charLevels = Object.values(charProgress)
    const masteredChars = charLevels.filter((p) => p.level >= 3).length
    const avgCharLevel = charLevels.length > 0
      ? charLevels.reduce((s, p) => s + p.level, 0) / charLevels.length
      : 0

    // Sentence stats
    const totalSentences = sentences.length
    const practicedSentences = Object.keys(sentenceProgress).length
    const sentLevels = Object.values(sentenceProgress)
    const masteredSentences = sentLevels.filter((p) => p.level >= 3).length
    const avgSentLevel = sentLevels.length > 0
      ? sentLevels.reduce((s, p) => s + p.level, 0) / sentLevels.length
      : 0

    // Overall
    const totalItems = totalChars + totalSentences
    const masteredItems = masteredChars + masteredSentences
    const overallPct = totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0

    // Total practice sessions
    const allProgress = [...charLevels, ...sentLevels]
    const totalPracticed = allProgress.reduce((s, p) => s + (p.times_practiced || 0), 0)

    // Time to fluency estimate
    // Based on: how many items still need to reach level 3, and learning pace
    const notMastered = totalItems - masteredItems
    const practiceDates = allProgress
      .filter((p) => p.last_practiced)
      .map((p) => new Date(p.last_practiced).toDateString())
    const uniqueDays = new Set(practiceDates).size
    const itemsPerDay = uniqueDays > 1
      ? masteredItems / uniqueDays
      : null

    let daysEstimate = null
    if (itemsPerDay && itemsPerDay > 0 && notMastered > 0) {
      daysEstimate = Math.ceil(notMastered / itemsPerDay)
    }

    return {
      totalChars, practicedChars, masteredChars, avgCharLevel,
      totalSentences, practicedSentences, masteredSentences, avgSentLevel,
      totalItems, masteredItems, overallPct,
      totalPracticed, uniqueDays, daysEstimate,
    }
  }, [characters, charProgress, sentences, sentenceProgress])

  // Don't show if user hasn't started
  if (stats.totalPracticed === 0) return null

  return (
    <div className="mb-6 p-4 border border-ink/10 rounded-lg">
      {/* Main progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Gesamtfortschritt</span>
        <span className="text-sm text-ink/50">{stats.overallPct}%</span>
      </div>
      <div className="w-full h-3 bg-ink/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-sage/70 to-sage rounded-full transition-all duration-700"
          style={{ width: `${stats.overallPct}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold">{stats.masteredChars}<span className="text-sm font-normal text-ink/30">/{stats.totalChars}</span></div>
          <div className="text-xs text-ink/40">Zeichen gemeistert</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.masteredSentences}<span className="text-sm font-normal text-ink/30">/{stats.totalSentences}</span></div>
          <div className="text-xs text-ink/40">Sätze gemeistert</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalPracticed}</div>
          <div className="text-xs text-ink/40">Übungen total</div>
        </div>
      </div>

      {/* Time to fluency */}
      {stats.daysEstimate !== null && stats.masteredItems < stats.totalItems && (
        <div className="mt-3 pt-3 border-t border-ink/5 text-center">
          <span className="text-sm text-ink/50">
            Bei deinem Tempo noch ca. <strong className="text-ink">{stats.daysEstimate} {stats.daysEstimate === 1 ? 'Tag' : 'Tage'}</strong> bis alles sitzt
          </span>
        </div>
      )}

      {stats.masteredItems === stats.totalItems && stats.totalItems > 0 && (
        <div className="mt-3 pt-3 border-t border-ink/5 text-center">
          <span className="text-sage font-medium">🎓 Alles gemeistert!</span>
        </div>
      )}
    </div>
  )
}
