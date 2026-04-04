import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function Dashboard({ weeks, getWeekProgress }) {
  const navigate = useNavigate()

  return (
    <div>
      <button
        onClick={() => navigate('/learn')}
        className="w-full py-4 bg-terracotta text-white rounded-lg font-medium text-lg hover:bg-terracotta/90 transition-colors mb-8"
      >
        Lernen starten
      </button>

      <h2 className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-4">
        Wochen
      </h2>

      <div className="space-y-3">
        {weeks.map((w) => {
          const { total, mastered, lapsed, level1, level2 } = getWeekProgress(w.characters)
          return (
            <button
              key={w.week}
              onClick={() => navigate(`/week/${w.week}`)}
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
                  {lapsed > 0 && <span className="text-amber-500 ml-1">(+{lapsed})</span>}
                </span>
              </div>
              <ProgressBar current={mastered} total={total} lapsed={lapsed} level1={level1} level2={level2} />
            </button>
          )
        })}
      </div>

      {weeks.length === 0 && (
        <p className="text-center text-ink/40 py-8">Keine Lektionen vorhanden.</p>
      )}
    </div>
  )
}
