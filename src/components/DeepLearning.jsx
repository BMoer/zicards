import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDifficultChars } from '../utils/deepLearning'
import { SENTENCE_GRAMMAR_RULES } from '../data/sentenceGrammarRules'
import MnemonicCard from './MnemonicCard'
import SpeakButton from './SpeakButton'

/**
 * Deep-Learning-Modus — bewusstes Vertiefen statt Quiz.
 *
 * Zwei Sektionen:
 *  1. Schwierige Wörter: die Zeichen, mit denen sich der/die Lernende
 *     schwertut (oft geübt, niedriges Level), je mit Eselsbrücke — zum
 *     gezielten Auswendiglernen wie mit dem Buch.
 *  2. Grammatik auffrischen: die zugrundeliegenden Satzregeln noch einmal
 *     in Erinnerung rufen.
 */

function DifficultWordRow({ entry, mnemonics, characters, charProgress }) {
  const { char } = entry
  const pinyin = char.pinyin || char.pinyin_word
  return (
    <div className="p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="font-hanzi text-4xl">{char.hanzi}</span>
        <SpeakButton text={char.hanzi} size="sm" />
        <div className="text-sm">
          {pinyin && <div className="text-ink/60">{pinyin}</div>}
          <div className="font-medium">{char.meaning}</div>
        </div>
      </div>
      <MnemonicCard
        hanzi={char.hanzi}
        mnemonics={mnemonics}
        characters={characters}
        progress={charProgress}
      />
    </div>
  )
}

function GrammarRuleCard({ rule }) {
  return (
    <div className="p-4 border border-ink/10 rounded-lg">
      <h3 className="font-medium mb-1">{rule.title}</h3>
      <p className="text-sm text-ink/70 leading-relaxed mb-3">{rule.summary}</p>
      <div className="space-y-1.5">
        {rule.examples.map((ex, i) => (
          <div key={i} className="text-sm flex items-start gap-2">
            <span className={ex.correct ? 'text-sage' : 'text-terracotta'}>
              {ex.correct ? '✓' : '✗'}
            </span>
            <span>
              <span className="font-hanzi">{ex.zh}</span>
              {ex.correct && ex.de && (
                <span className="text-ink/45"> — {ex.de}</span>
              )}
              {!ex.correct && ex.note && (
                <span className="text-ink/45"> — {ex.note}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DeepLearning({ characters, charProgress, mnemonics }) {
  const navigate = useNavigate()
  const difficult = useMemo(
    () => getDifficultChars(characters, charProgress),
    [characters, charProgress]
  )

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Vertiefen</h1>
        <p className="text-sm text-ink/50 leading-relaxed">
          Hier setzt du dich gezielt mit dem zusammen, was noch wackelt — wie
          mit dem Buch: schwierige Wörter auswendig lernen und die Grammatik
          noch einmal durchgehen.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-4">
          Schwierige Wörter{difficult.length > 0 && ` (${difficult.length})`}
        </h2>
        {difficult.length === 0 ? (
          <p className="text-center text-ink/40 py-6 border border-ink/10 rounded-lg">
            Noch keine schwierigen Wörter — stark! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {difficult.map((entry) => (
              <DifficultWordRow
                key={entry.char.id}
                entry={entry}
                mnemonics={mnemonics}
                characters={characters}
                charProgress={charProgress}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-4">
          Grammatik auffrischen
        </h2>
        <div className="space-y-3">
          {SENTENCE_GRAMMAR_RULES.map((rule) => (
            <GrammarRuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </section>

      <button
        onClick={() => navigate('/')}
        className="w-full py-3 border border-ink/20 rounded-lg font-medium hover:border-ink/30 transition-colors"
      >
        Zurück zum Dashboard
      </button>
    </div>
  )
}
