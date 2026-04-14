import { useParams, useNavigate } from 'react-router-dom'
import { useAdminUserDetail, useAdminUsers } from '../hooks/useAdmin'
import { useMemo, useState } from 'react'

const LEVEL_LABELS = ['Nicht gesehen', 'Gesehen', 'Geübt', 'Gemeistert']
const LEVEL_COLORS = ['bg-ink/10 text-ink/40', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700']

function LevelBadge({ level }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${LEVEL_COLORS[level] || LEVEL_COLORS[0]}`}>
      {LEVEL_LABELS[level] || `Stufe ${level}`}
    </span>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return '–'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `vor ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours}h`
  const days = Math.floor(hours / 24)
  return `vor ${days}d`
}

function LessonSection({ title, items, type }) {
  const [expanded, setExpanded] = useState(false)

  const stats = useMemo(() => {
    const total = items.length
    const mastered = items.filter(i => i.level >= 3 && i.next_review && new Date(i.next_review) > new Date()).length
    const struggling = items.filter(i => i.times_practiced >= 3 && i.level <= 1).length
    const notStarted = items.filter(i => i.level === 0).length
    const overdue = items.filter(i => i.level >= 1 && i.next_review && new Date(i.next_review) <= new Date()).length
    return { total, mastered, struggling, notStarted, overdue }
  }, [items])

  const pct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="border border-ink/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 hover:bg-ink/[0.02] transition-colors"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-medium text-sm">{title}</span>
          <div className="flex items-center gap-2">
            {stats.struggling > 0 && (
              <span className="text-xs text-red-600 font-medium">
                ⚠ {stats.struggling} schwierig
              </span>
            )}
            <span className="text-xs text-ink/40">{pct}%</span>
            <span className="text-ink/30">{expanded ? '▾' : '▸'}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-ink/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-sage" style={{ width: `${pct}%` }} />
          {stats.overdue > 0 && (
            <div
              className="h-full bg-amber-400"
              style={{ width: `${Math.round((stats.overdue / stats.total) * 100)}%` }}
            />
          )}
        </div>
        <div className="flex gap-3 mt-1.5 text-xs text-ink/40">
          <span>{stats.mastered} gemeistert</span>
          <span>{stats.overdue} fällig</span>
          <span>{stats.notStarted} offen</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-ink/10 divide-y divide-ink/5">
          {/* Struggling items first */}
          {items
            .sort((a, b) => {
              // Struggling first, then by level ascending
              const aStruggle = a.times_practiced >= 3 && a.level <= 1 ? 0 : 1
              const bStruggle = b.times_practiced >= 3 && b.level <= 1 ? 0 : 1
              if (aStruggle !== bStruggle) return aStruggle - bStruggle
              return a.level - b.level
            })
            .map(item => {
              const isStruggling = item.times_practiced >= 3 && item.level <= 1
              const isOverdue = item.level >= 1 && item.next_review && new Date(item.next_review) <= new Date()

              return (
                <div
                  key={item.character_id || item.sentence_id}
                  className={`px-3 py-2 flex items-center gap-3 ${isStruggling ? 'bg-red-50' : ''}`}
                >
                  {type === 'char' ? (
                    <span className="font-hanzi text-lg w-8 text-center">{item.hanzi}</span>
                  ) : (
                    <span className="font-hanzi text-sm flex-shrink-0 max-w-[120px] truncate">{item.chinese}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-ink/60 truncate">
                      {type === 'char' ? (
                        <>{item.pinyin} – {item.meaning}</>
                      ) : (
                        <>{item.german}</>
                      )}
                    </div>
                    <div className="text-xs text-ink/30 mt-0.5">
                      {item.times_practiced}× geübt
                      {item.last_practiced && <> · {timeAgo(item.last_practiced)}</>}
                      {isOverdue && <span className="text-amber-600"> · fällig</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {isStruggling && <span className="text-red-500 text-xs">⚠</span>}
                    <LevelBadge level={item.level} />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default function AdminUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { chars, sentences, loading } = useAdminUserDetail(userId)
  const { users } = useAdminUsers()
  const [tab, setTab] = useState('overview')

  const user = users.find(u => u.user_id === userId)

  // Group by lesson
  const charsByLesson = useMemo(() => {
    const map = {}
    for (const c of chars) {
      const key = c.lesson || `Lektion ${c.week}`
      if (!map[key]) map[key] = []
      map[key].push(c)
    }
    return map
  }, [chars])

  const sentencesByLesson = useMemo(() => {
    const map = {}
    for (const s of sentences) {
      const key = s.lesson || `Lektion ${s.week}`
      if (!map[key]) map[key] = []
      map[key].push(s)
    }
    return map
  }, [sentences])

  // Overall weakness analysis
  const analysis = useMemo(() => {
    const strugglingChars = chars.filter(c => c.times_practiced >= 3 && c.level <= 1)
    const strugglingSents = sentences.filter(s => s.times_practiced >= 3 && s.level <= 1)
    const overdueChars = chars.filter(c => c.level >= 1 && c.next_review && new Date(c.next_review) <= new Date())
    const overdueSents = sentences.filter(s => s.level >= 1 && s.next_review && new Date(s.next_review) <= new Date())
    const notStartedChars = chars.filter(c => c.level === 0)
    const notStartedSents = sentences.filter(s => s.level === 0)
    const masteredChars = chars.filter(c => c.level >= 3 && c.next_review && new Date(c.next_review) > new Date())
    const masteredSents = sentences.filter(s => s.level >= 3 && s.next_review && new Date(s.next_review) > new Date())

    // Find weakest lesson
    const lessonScores = {}
    for (const c of chars) {
      const key = c.lesson || `Lektion ${c.week}`
      if (!lessonScores[key]) lessonScores[key] = { total: 0, score: 0 }
      lessonScores[key].total++
      lessonScores[key].score += c.level
    }
    for (const s of sentences) {
      const key = s.lesson || `Lektion ${s.week}`
      if (!lessonScores[key]) lessonScores[key] = { total: 0, score: 0 }
      lessonScores[key].total++
      lessonScores[key].score += s.level
    }
    const weakestLesson = Object.entries(lessonScores)
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => (a[1].score / a[1].total) - (b[1].score / b[1].total))[0]

    return {
      strugglingChars, strugglingSents,
      overdueChars, overdueSents,
      notStartedChars, notStartedSents,
      masteredChars, masteredSents,
      weakestLesson: weakestLesson ? weakestLesson[0] : null,
    }
  }, [chars, sentences])

  if (loading) return <div className="text-center py-12 text-ink/40">Laden...</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/admin')} className="text-sm text-ink/50 hover:text-ink mb-2 block">
          ← Alle Teilnehmer·innen
        </button>
        <h1 className="text-lg font-bold truncate">{user?.email || 'Unbekannt'}</h1>
        {user && (
          <p className="text-xs text-ink/40">
            Dabei seit {new Date(user.created_at).toLocaleDateString('de-DE')}
            {user.last_activity && <> · Letzte Aktivität {timeAgo(user.last_activity)}</>}
            {user.active_days > 0 && <> · {user.active_days} aktive Tage</>}
          </p>
        )}
      </div>

      {/* Quick diagnosis */}
      <div className="p-4 border border-ink/10 rounded-lg mb-6 space-y-2">
        <h2 className="font-medium text-sm mb-3">📋 Diagnose</h2>

        {analysis.strugglingChars.length === 0 && analysis.strugglingSents.length === 0 &&
         analysis.notStartedChars.length === 0 && analysis.notStartedSents.length === 0 ? (
          <p className="text-sm text-sage">✓ Alles gut – keine auffälligen Schwächen!</p>
        ) : (
          <>
            {(analysis.strugglingChars.length > 0 || analysis.strugglingSents.length > 0) && (
              <div className="text-sm">
                <span className="text-red-600 font-medium">⚠ Schwierigkeiten trotz Üben: </span>
                <span className="text-ink/70">
                  {analysis.strugglingChars.map(c => c.hanzi).join(', ')}
                  {analysis.strugglingChars.length > 0 && analysis.strugglingSents.length > 0 && ' · '}
                  {analysis.strugglingSents.map(s => s.chinese).join(', ')}
                </span>
              </div>
            )}
            {analysis.weakestLesson && (
              <div className="text-sm">
                <span className="text-amber-600 font-medium">📍 Schwächste Lektion: </span>
                <span className="text-ink/70">{analysis.weakestLesson}</span>
              </div>
            )}
            {analysis.overdueChars.length + analysis.overdueSents.length > 0 && (
              <div className="text-sm">
                <span className="text-amber-600 font-medium">⏰ Wiederholung fällig: </span>
                <span className="text-ink/70">
                  {analysis.overdueChars.length} Zeichen, {analysis.overdueSents.length} Sätze
                </span>
              </div>
            )}
            {analysis.notStartedChars.length + analysis.notStartedSents.length > 0 && (
              <div className="text-sm">
                <span className="text-ink/50">📭 Noch nicht angefangen: </span>
                <span className="text-ink/70">
                  {analysis.notStartedChars.length} Zeichen, {analysis.notStartedSents.length} Sätze
                </span>
              </div>
            )}
          </>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-ink/5">
          <MiniStat value={analysis.masteredChars.length} label="字 ✓" color="text-sage" />
          <MiniStat value={analysis.masteredSents.length} label="句 ✓" color="text-sage" />
          <MiniStat value={analysis.strugglingChars.length} label="字 ⚠" color="text-red-600" />
          <MiniStat value={analysis.strugglingSents.length} label="句 ⚠" color="text-red-600" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-ink/10 rounded-lg overflow-hidden mb-4">
        {['overview', 'chars', 'sentences'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === t ? 'bg-ink text-paper' : 'text-ink/50 hover:text-ink hover:bg-ink/5'
            }`}
          >
            {t === 'overview' ? 'Übersicht' : t === 'chars' ? '字 Zeichen' : '句 Sätze'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div className="space-y-3">
          {Object.entries(charsByLesson).map(([lesson, items]) => (
            <LessonSection key={`c-${lesson}`} title={`${lesson} – Zeichen`} items={items} type="char" />
          ))}
          {Object.entries(sentencesByLesson).map(([lesson, items]) => (
            <LessonSection key={`s-${lesson}`} title={`${lesson} – Sätze`} items={items} type="sentence" />
          ))}
        </div>
      )}

      {tab === 'chars' && (
        <div className="space-y-3">
          {Object.entries(charsByLesson).map(([lesson, items]) => (
            <LessonSection key={lesson} title={lesson} items={items} type="char" />
          ))}
        </div>
      )}

      {tab === 'sentences' && (
        <div className="space-y-3">
          {Object.entries(sentencesByLesson).map(([lesson, items]) => (
            <LessonSection key={lesson} title={lesson} items={items} type="sentence" />
          ))}
        </div>
      )}
    </div>
  )
}

function MiniStat({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-ink/40">{label}</div>
    </div>
  )
}
