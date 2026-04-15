import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import GlobalProgress from './GlobalProgress'
import DueCounter from './DueCounter'
import ReminderToggle from './ReminderToggle'
import ProgressBar from './ProgressBar'
import { buildHanziMap, isSentenceUnlocked } from '../utils/lessonUtils'

function LessonCard({ lesson, charProgress, sentenceProgress, hanziMap }) {
  const navigate = useNavigate()

  const charStats = useMemo(() => {
    const now = new Date()
    let mastered = 0, lapsed = 0, level1 = 0, level2 = 0
    for (const c of lesson.characters) {
      const p = charProgress[c.id]
      if (!p || p.level < 1) continue
      if (p.level >= 3) {
        if (!p.next_review || new Date(p.next_review) <= now) lapsed++
        else mastered++
      } else if (p.level === 2) level2++
      else level1++
    }
    return { total: lesson.characters.length, mastered, lapsed, level1, level2 }
  }, [lesson.characters, charProgress])

  const sentStats = useMemo(() => {
    const now = new Date()
    let mastered = 0, lapsed = 0, level1 = 0, level2 = 0, unlocked = 0
    for (const s of lesson.sentences) {
      const isUnlocked = isSentenceUnlocked(s, hanziMap, charProgress)
      if (isUnlocked) unlocked++
      const p = sentenceProgress[s.id]
      if (!p || p.level < 1) continue
      if (p.level >= 3) {
        if (!p.next_review || new Date(p.next_review) <= now) lapsed++
        else mastered++
      } else if (p.level === 2) level2++
      else level1++
    }
    return { total: lesson.sentences.length, mastered, lapsed, level1, level2, unlocked }
  }, [lesson.sentences, sentenceProgress, charProgress, hanziMap])

  const combined = {
    total: charStats.total + sentStats.total,
    mastered: charStats.mastered + sentStats.mastered,
    lapsed: charStats.lapsed + sentStats.lapsed,
    level1: charStats.level1 + sentStats.level1,
    level2: charStats.level2 + sentStats.level2,
  }

  const lockedCount = sentStats.total - sentStats.unlocked

  return (
    <button
      onClick={() => navigate(`/lesson/${lesson.week}`)}
      className="w-full text-left p-4 border border-ink/10 rounded-lg hover:border-ink/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="font-medium">Lektion {lesson.week}</span>
          {lesson.lesson && <span className="text-ink/40 text-sm ml-2">{lesson.lesson}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-ink/40 mb-2">
        <span>
          字 {charStats.mastered}/{charStats.total}
          {charStats.lapsed > 0 && <span className="text-amber-500 ml-0.5">(+{charStats.lapsed})</span>}
        </span>
        <span>
          句 {sentStats.mastered}/{sentStats.total}
          {lockedCount > 0 && <span className="text-ink/25 ml-0.5">🔒{lockedCount}</span>}
          {sentStats.lapsed > 0 && <span className="text-amber-500 ml-0.5">(+{sentStats.lapsed})</span>}
        </span>
      </div>
      <ProgressBar
        current={combined.mastered}
        total={combined.total}
        lapsed={combined.lapsed}
        level1={combined.level1}
        level2={combined.level2}
      />
    </button>
  )
}

export default function UnifiedDashboard({
  lessons, characters, charProgress, sentences, sentenceProgress, user,
}) {
  const navigate = useNavigate()
  const hanziMap = useMemo(() => buildHanziMap(characters), [characters])

  return (
    <div>
      <GlobalProgress
        characters={characters}
        charProgress={charProgress}
        sentences={sentences}
        sentenceProgress={sentenceProgress}
      />

      <DueCounter
        characters={characters}
        charProgress={charProgress}
        sentences={sentences}
        sentenceProgress={sentenceProgress}
      />

      <button
        onClick={() => navigate('/learn')}
        className="w-full py-4 bg-terracotta text-white rounded-lg font-medium text-lg hover:bg-terracotta/90 transition-colors mb-8"
      >
        Lernen starten
      </button>

      <h2 className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-4">
        Lektionen
      </h2>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.week}
            lesson={lesson}
            charProgress={charProgress}
            sentenceProgress={sentenceProgress}
            hanziMap={hanziMap}
          />
        ))}
      </div>

      {lessons.length === 0 && (
        <p className="text-center text-ink/40 py-8">Keine Lektionen vorhanden.</p>
      )}

      <ReminderToggle user={user} />
    </div>
  )
}
