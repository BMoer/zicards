import { useNavigate, useParams } from 'react-router-dom'
import SpeakButton from './SpeakButton'

const levelLabels = ['Neu', 'Stufe 1', 'Stufe 2', 'Stufe 3']
const levelColors = [
  'bg-ink/10 text-ink/50',
  'bg-terracotta/15 text-terracotta',
  'bg-sage/20 text-sage',
  'bg-sage text-white',
]

export default function SentenceWeekView({ weeks, progress }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const week = weeks.find((w) => w.week === parseInt(id))

  if (!week) {
    return (
      <div className="text-center py-12 text-ink/40">
        <p>Lektion nicht gefunden.</p>
        <button onClick={() => navigate('/')} className="text-terracotta hover:underline mt-4 text-sm">
          Zurück
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-sm text-ink/50 hover:text-ink">
          ← Zurück
        </button>
        <h2 className="font-medium">
          Lektion {week.week} – Sätze
          {week.lesson && <span className="text-ink/40 ml-2 text-sm">{week.lesson}</span>}
        </h2>
      </div>

      <button
        onClick={() => navigate(`/sentences/learn/${week.week}`)}
        className="w-full py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors mb-6"
      >
        Diese Lektion üben
      </button>

      <div className="space-y-3">
        {week.sentences.map((s) => {
          const p = progress[s.id]
          const level = p ? p.level : 0

          return (
            <div
              key={s.id}
              className="p-4 border border-ink/10 rounded-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-hanzi text-lg">{s.chinese}</span>
                    <SpeakButton text={s.chinese} size="sm" />
                  </div>
                  <div className="text-sm text-ink/50 mb-0.5">{s.pinyin}</div>
                  <div className="text-sm">{s.german}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${levelColors[level]}`}>
                  {levelLabels[level]}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
