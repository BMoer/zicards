import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'
import GrammarHint from './GrammarHint'
import { buildHanziMap, isSentenceUnlocked, getMissingCharCount } from '../utils/lessonUtils'

const levelLabels = ['Neu', 'Stufe 1', 'Stufe 2', 'Stufe 3']
const levelColors = [
  'bg-ink/10 text-ink/50',
  'bg-terracotta/15 text-terracotta',
  'bg-sage/20 text-sage',
  'bg-sage text-white',
]

function CharacterRow({ char, level, characters, progress }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="border border-ink/10 rounded-lg cursor-pointer hover:border-ink/20 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="font-hanzi text-4xl leading-none">{char.hanzi}</div>
        <SpeakButton text={char.word || char.hanzi} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-ink/60 text-sm">{char.pinyin}</span>
            {char.word && (
              <span className="text-ink/40 text-sm">
                {char.word} ({char.pinyin_word})
              </span>
            )}
          </div>
          <div className="text-sm mt-0.5">{char.meaning}</div>
          <GrammarHint meaning={char.meaning} />
          {char.radical && (
            <div className="text-xs text-ink/30 mt-0.5">Radikal: {char.radical}</div>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${levelColors[level]}`}>
          {levelLabels[level]}
        </span>
      </div>
      {expanded && (
        <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <MnemonicCard hanzi={char.hanzi} characters={characters} progress={progress} />
        </div>
      )}
    </div>
  )
}

function SentenceRow({ sentence, level, unlocked, missingCount }) {
  return (
    <div className={`p-4 border border-ink/10 rounded-lg ${!unlocked ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-hanzi text-lg">{sentence.chinese}</span>
            {unlocked && <SpeakButton text={sentence.chinese} size="sm" />}
            {!unlocked && <span className="text-xs text-ink/30">🔒</span>}
          </div>
          <div className="text-sm text-ink/50 mb-0.5">{sentence.pinyin}</div>
          <div className="text-sm">{sentence.german}</div>
          {!unlocked && missingCount > 0 && (
            <div className="text-xs text-ink/30 mt-1">
              Noch {missingCount} Zeichen lernen
            </div>
          )}
        </div>
        {unlocked && (
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${levelColors[level]}`}>
            {levelLabels[level]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LessonView({ lessons, charProgress, sentenceProgress, characters }) {
  const { week } = useParams()
  const navigate = useNavigate()
  const lesson = lessons.find((l) => l.week === parseInt(week))

  const hanziMap = useMemo(() => buildHanziMap(characters), [characters])

  if (!lesson) {
    return (
      <div className="text-center py-12 text-ink/40">
        <p>Lektion nicht gefunden.</p>
        <button onClick={() => navigate('/')} className="text-terracotta hover:underline mt-4 text-sm">
          Zurück
        </button>
      </div>
    )
  }

  const unlockedCount = lesson.sentences.filter((s) => isSentenceUnlocked(s, hanziMap, charProgress)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-sm text-ink/50 hover:text-ink">
          ← Zurück
        </button>
        <h2 className="font-medium">
          Lektion {lesson.week}
          {lesson.lesson && <span className="text-ink/40 ml-2 text-sm">{lesson.lesson}</span>}
        </h2>
      </div>

      <button
        onClick={() => navigate(`/learn/${lesson.week}`)}
        className="w-full py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors mb-6"
      >
        Diese Lektion üben
      </button>

      {/* Characters section */}
      <h3 className="text-xs font-medium text-ink/40 uppercase tracking-wider mb-3">
        Zeichen ({lesson.characters.length})
      </h3>
      <div className="space-y-3 mb-8">
        {lesson.characters.map((char) => {
          const p = charProgress[char.id]
          const level = p ? p.level : 0
          return (
            <CharacterRow
              key={char.id}
              char={char}
              level={level}
              characters={characters}
              progress={charProgress}
            />
          )
        })}
      </div>

      {/* Sentences section */}
      {lesson.sentences.length > 0 && (
        <>
          <h3 className="text-xs font-medium text-ink/40 uppercase tracking-wider mb-3">
            Sätze ({unlockedCount}/{lesson.sentences.length} freigeschaltet)
          </h3>
          <div className="space-y-3">
            {lesson.sentences.map((s) => {
              const unlocked = isSentenceUnlocked(s, hanziMap, charProgress)
              const p = sentenceProgress[s.id]
              const level = p ? p.level : 0
              const missingCount = unlocked ? 0 : getMissingCharCount(s, hanziMap, charProgress)
              return (
                <SentenceRow
                  key={s.id}
                  sentence={s}
                  level={level}
                  unlocked={unlocked}
                  missingCount={missingCount}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
