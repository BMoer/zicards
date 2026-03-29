import { useNavigate } from 'react-router-dom'

export default function SessionResult({ results, onRestart }) {
  const navigate = useNavigate()

  const correct = results.filter((r) => r.isCorrect).length
  const half = results.filter((r) => r.isHalf).length
  const total = results.length
  const levelUps = results.filter((r) => r.levelChange > 0)
  const levelDowns = results.filter((r) => r.levelChange < 0)

  const pct = total > 0 ? Math.round(((correct + half * 0.5) / total) * 100) : 0

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="font-hanzi text-5xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖'}
        </div>
        <div className="text-4xl font-bold mb-2">
          {correct}{half > 0 && <span className="text-amber-500 text-2xl"> +{half}½</span>} / {total}
        </div>
        <div className="text-ink/50">
          {pct}% richtig
        </div>
      </div>

      {levelUps.length > 0 && (
        <div className="mb-4 p-4 border border-sage/30 rounded-lg bg-sage/5">
          <div className="text-sm font-medium text-sage mb-2">⬆ Aufgestiegen</div>
          <div className="flex flex-wrap gap-2">
            {levelUps.map((r, i) => (
              <span key={i} className="font-hanzi text-2xl">
                {r.character.hanzi}
              </span>
            ))}
          </div>
        </div>
      )}

      {levelDowns.length > 0 && (
        <div className="mb-4 p-4 border border-terracotta/30 rounded-lg bg-terracotta/5">
          <div className="text-sm font-medium text-terracotta mb-2">⬇ Abgestiegen</div>
          <div className="flex flex-wrap gap-2">
            {levelDowns.map((r, i) => (
              <span key={i} className="font-hanzi text-2xl">
                {r.character.hanzi}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mt-8">
        <button
          onClick={onRestart}
          className="w-full py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
        >
          Nächste Runde
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 border border-ink/20 rounded-lg font-medium hover:border-ink/30 transition-colors"
        >
          Zurück zum Dashboard
        </button>
      </div>
    </div>
  )
}
