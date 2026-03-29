import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function SentenceDashboard({ weeks, getWeekProgress }) {
  const navigate = useNavigate()

  return (
    <div>
      <button
        onClick={() => navigate('/sentences/learn')}
        className="w-full py-4 bg-terracotta text-white rounded-lg font-medium text-lg hover:bg-terracotta/90 transition-colors mb-8"
      >
        Sätze üben
      </button>

      <h2 className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-4">
        Wochen
      </h2>

      <div className="space-y-3">
        {weeks.map((w) => {
          const { total, mastered } = getWeekProgress(w.sentences)
          return (
            <button
              key={w.week}
              onClick={() => navigate(`/sentences/week/${w.week}`)}
              className="w-full text-left p-4 border border-ink/10 rounded-lg hover:border-ink/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">Woche {w.week}</span>
                  {w.lesson && (
                    <span className="text-ink/40 text-sm ml-2">{w.lesson}</span>
                  )}
                </div>
                <span className="text-sm text-ink/40">
                  {mastered}/{total}
                </span>
              </div>
              <ProgressBar current={mastered} total={total} />
            </button>
          )
        })}
      </div>

      {weeks.length === 0 && (
        <p className="text-center text-ink/40 py-8">Keine Sätze vorhanden.</p>
      )}
    </div>
  )
}
